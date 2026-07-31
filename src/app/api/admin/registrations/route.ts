import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { issueAttendanceCertificate } from "@/lib/certificates";
import { sendEmail } from "@/lib/email";
import { CONFERENCE, CONTACT } from "@/lib/conference";

export async function GET() {
  const registrations = await db.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: { certificates: { where: { revokedAt: null }, select: { code: true, kind: true } } },
  });
  return NextResponse.json({ registrations });
}

const patchSchema = z.object({
  id: z.string().min(1),
  /** Registration desk check-in. Issuing the certificate hangs off this. */
  attended: z.boolean().optional(),
  /** Outcome of reviewing a student claim. */
  verification: z.enum(["NOT_REQUIRED", "PENDING", "VERIFIED", "REJECTED"]).optional(),
  verificationNote: z.string().trim().max(500).optional(),
  /** Delegate asked to be added to, or taken off, the public list. */
  listPublicly: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { id, attended, verification, verificationNote, listPublicly } = parsed.data;

  const registration = await db.registration.update({
    where: { id },
    data: {
      ...(attended !== undefined ? { attended, attendedAt: attended ? new Date() : null } : {}),
      ...(verification !== undefined
        ? { verification, verifiedAt: verification === "VERIFIED" ? new Date() : null }
        : {}),
      ...(verificationNote !== undefined ? { verificationNote } : {}),
      ...(listPublicly !== undefined ? { listPublicly } : {}),
    },
  });

  // Marking someone present is the whole trigger for their certificate: no
  // separate "generate certificates" step to forget on the day.
  let certificate: { code: string } | null = null;
  if (attended === true && registration.status === "PAID") {
    try {
      const issued = await issueAttendanceCertificate(registration.id);
      certificate = { code: issued.code };

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
      void sendEmail({
        to: registration.email,
        subject: `Your certificate of attendance, ${CONFERENCE.edition} ${CONFERENCE.shortName}`,
        text: `Dear ${registration.fullName},\n\nThank you for attending the ${CONFERENCE.edition} ${CONFERENCE.name}.\n\nYour certificate is ready:\n${siteUrl}/certificate/${issued.code}\n\nCertificate code: ${issued.code}\n\nAnyone can confirm it is genuine at ${siteUrl}/verify\n\n${CONTACT.email}`,
      }).catch((err) => console.error("[admin/registrations] certificate email failed", err));
    } catch (err) {
      console.error("[admin/registrations] could not issue certificate", err);
    }
  }

  return NextResponse.json({ registration, certificate });
}
