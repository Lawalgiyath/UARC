import type { Metadata } from "next";
import Link from "next/link";
import { PaymentPortal } from "@/components/PaymentPortal";
import { IconPattern } from "@/components/IconPattern";
import { REMITA, REMITA_COPY } from "@/lib/remita";
import { CONTACT } from "@/lib/conference";

export const metadata: Metadata = {
  title: "Send Your Payment Receipt | 19th UNILAG Annual Research Conference",
  description:
    "Check the status of a conference payment, or send the Remita receipt for a registration, sponsorship or exhibition stand.",
};

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; email?: string }>;
}) {
  const { ref, email } = await searchParams;

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Payment</div>
          <h1 className="page-title">Send your receipt</h1>
          <p className="page-lede">
            Already paid at the bank, or want to check where a payment has got to? Enter your
            reference and the email address you used. {REMITA_COPY.afterDeclaring}
          </p>
        </div>
      </section>

      <section className="payment-section">
        <IconPattern variant="dense" opacity={0.05} className="section-pattern" />
        <div className="wrap">
          <PaymentPortal initialReference={ref ?? ""} initialEmail={email ?? ""} />

          <p className="archive-note">
            Not registered yet? <Link href="/register">Start there</Link> and the payment steps
            follow immediately. Trouble with the Remita portal itself, or a payment that has not
            been credited after {REMITA.verificationDays} working days: WhatsApp{" "}
            <a
              href={`https://wa.me/${REMITA.whatsApp.e164.replace("+", "")}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {REMITA.whatsApp.display}
            </a>{" "}
            or email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>, quoting your
            reference.
          </p>
        </div>
      </section>
    </>
  );
}
