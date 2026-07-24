import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function GET() {
  const submissions = await db.submission.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ submissions });
}

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
});

export async function PATCH(request: Request) {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const submission = await db.submission.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  if (parsed.data.status !== "PENDING") {
    const verb = parsed.data.status === "ACCEPTED" ? "accepted" : "not been accepted";
    try {
      await sendEmail({
        to: submission.email,
        subject: `Update on your abstract, reference ${submission.reference}`,
        text: `Dear ${submission.authorName},\n\nYour abstract "${submission.title}" (reference ${submission.reference}) has ${verb} for the 19th UNILAG Annual Research Conference.\n\nUNILAG Annual Research Conference Secretariat`,
      });
    } catch (err) {
      console.error("[admin/submissions] notification failed", err);
    }
  }

  return NextResponse.json({ submission });
}
