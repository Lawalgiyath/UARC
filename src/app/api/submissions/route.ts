import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAbstractDeadline } from "@/lib/settings";
import { generateUniqueReference } from "@/lib/reference";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { guardPublicWrite } from "@/lib/security";

const submissionSchema = z.object({
  authorName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7),
  institution: z.string().trim().min(2),
  track: z.string().trim().min(2),
  format: z.enum(["Oral presentation", "Poster presentation", "No preference"]),
  title: z.string().trim().min(3),
  abstractText: z.string().trim().min(100).max(6000),
  manuscriptUrl: z.string().url().optional(),
  manuscriptPublicId: z.string().optional(),
});

export async function POST(request: Request) {
  const blocked = await guardPublicWrite(request, "submission");
  if (blocked) return blocked;

  const deadline = await getAbstractDeadline();
  if (new Date() > deadline) {
    return NextResponse.json(
      { error: "Submissions are closed. The abstract deadline has passed." },
      { status: 403 }
    );
  }

  const parsed = submissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form for missing or invalid fields." }, { status: 400 });
  }
  const data = parsed.data;

  const reference = await generateUniqueReference("UARC26", async (candidate) => {
    const existing = await db.submission.findUnique({ where: { reference: candidate } });
    return existing !== null;
  });

  await db.submission.create({
    data: {
      reference,
      authorName: data.authorName,
      email: data.email,
      phone: data.phone,
      institution: data.institution,
      track: data.track,
      format: data.format,
      title: data.title,
      abstractText: data.abstractText,
      manuscriptUrl: data.manuscriptUrl,
      manuscriptPublicId: data.manuscriptPublicId,
    },
  });

  try {
    await sendEmail({
      to: data.email,
      subject: `Abstract received, reference ${reference}`,
      text: `Dear ${data.authorName},\n\nYour abstract "${data.title}" has been received for the 19th UNILAG Annual Research Conference.\n\nReference: ${reference}\nTrack: ${data.track}\n\nDecisions are communicated by 21 September 2026. Keep this reference for tracking your status and for all correspondence with the Secretariat.\n\nUNILAG Annual Research Conference Secretariat`,
    });
    await sendSms({
      to: data.phone,
      body: `UNILAG ARC: abstract "${data.title}" received. Reference ${reference}. Decisions by 21 Sep 2026.`,
    });
  } catch (err) {
    console.error("[submissions] notification failed", err);
  }

  return NextResponse.json({ reference });
}
