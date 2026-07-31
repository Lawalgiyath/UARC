import { PaymentOutcome } from "@/components/PaymentOutcome";

export default async function ExhibitFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <PaymentOutcome
      eyebrow="Research fair"
      heading="Payment was not completed"
      outcome="failure"
      reference={ref}
      retryHref="/exhibit#apply"
      retryLabel="Try again"
      body={
        <>
          <p>
            <strong>Your payment could not be confirmed, and no charge should have been made.</strong>
          </p>
          <p>
            Your application is saved against the reference above, but the stand is not held until
            payment clears. Try again, or ask the Secretariat for an invoice.
          </p>
        </>
      }
    />
  );
}
