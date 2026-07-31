import { PaymentOutcome } from "@/components/PaymentOutcome";

export default async function SponsorFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <PaymentOutcome
      eyebrow="Sponsorship"
      heading="Payment was not completed"
      outcome="failure"
      reference={ref}
      retryHref="/sponsors#apply"
      retryLabel="Try again"
      body={
        <>
          <p>
            <strong>Your payment could not be confirmed, and no charge should have been made.</strong>
          </p>
          <p>
            Your application is saved against the reference above. You can try the payment again, or
            ask the Secretariat for an invoice to settle through your finance office instead.
          </p>
        </>
      }
    />
  );
}
