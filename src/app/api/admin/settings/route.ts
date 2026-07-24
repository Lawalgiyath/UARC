import { NextResponse } from "next/server";
import { z } from "zod";
import { getAbstractDeadline, setAbstractDeadline } from "@/lib/settings";

export async function GET() {
  const deadline = await getAbstractDeadline();
  return NextResponse.json({ abstractDeadline: deadline.toISOString() });
}

const patchSchema = z.object({
  abstractDeadline: z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), {
    message: "Invalid date",
  }),
});

export async function PATCH(request: Request) {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a valid date." }, { status: 400 });
  }
  await setAbstractDeadline(new Date(parsed.data.abstractDeadline).toISOString());
  return NextResponse.json({ ok: true });
}
