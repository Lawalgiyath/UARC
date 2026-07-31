import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  issueAttendanceCertificate,
  issuePresentationCertificate,
  issueServiceCertificate,
} from "@/lib/certificates";

export async function GET() {
  const certificates = await db.certificate.findMany({
    orderBy: { issuedAt: "desc" },
    take: 500,
  });
  return NextResponse.json({ certificates });
}

const issueSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("ATTENDANCE"), registrationId: z.string().min(1) }),
  z.object({ kind: z.literal("PRESENTATION"), submissionId: z.string().min(1) }),
  z.object({ kind: z.literal("POSTER"), submissionId: z.string().min(1) }),
  z.object({
    kind: z.literal("SESSION_CHAIR"),
    recipientName: z.string().trim().min(2).max(160),
    institution: z.string().trim().max(160).optional(),
    track: z.string().trim().max(200).optional(),
  }),
  z.object({
    kind: z.literal("REVIEWER"),
    recipientName: z.string().trim().min(2).max(160),
    institution: z.string().trim().max(160).optional(),
    track: z.string().trim().max(200).optional(),
  }),
]);

/**
 * Manual issue, for the cases the automatic path does not cover: chairs,
 * reviewers, and presenters whose certificate is being cut before the
 * programme is closed. Attendance certificates normally issue themselves when
 * the delegate is checked in.
 */
export async function POST(request: Request) {
  const parsed = issueSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const input = parsed.data;

  try {
    switch (input.kind) {
      case "ATTENDANCE": {
        const certificate = await issueAttendanceCertificate(input.registrationId);
        return NextResponse.json({ certificate });
      }
      case "PRESENTATION":
      case "POSTER": {
        const certificate = await issuePresentationCertificate(input.submissionId, input.kind);
        return NextResponse.json({ certificate });
      }
      default: {
        const certificate = await issueServiceCertificate({
          kind: input.kind,
          recipientName: input.recipientName,
          institution: input.institution,
          track: input.track,
        });
        return NextResponse.json({ certificate });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not issue the certificate.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

const revokeSchema = z.object({
  code: z.string().trim().min(6).max(20),
  reason: z.string().trim().min(3).max(300),
});

/**
 * Revoking leaves the row in place. A revoked code still resolves at /verify,
 * and says plainly that it is no longer valid, which is more useful to anyone
 * checking than a certificate that simply vanishes.
 */
export async function PATCH(request: Request) {
  const parsed = revokeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const certificate = await db.certificate.update({
    where: { code: parsed.data.code.toUpperCase() },
    data: { revokedAt: new Date(), revokedReason: parsed.data.reason },
  });

  return NextResponse.json({ certificate });
}
