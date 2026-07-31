import { PaymentOutcome } from "@/components/PaymentOutcome";

export default async function SponsorSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <PaymentOutcome
      eyebrow="Sponsorship"
      heading="Thank you, your sponsorship is confirmed"
      outcome="success"
      reference={ref}
      body={
        <>
          A receipt has been emailed to you. The Secretariat will be in touch about your logo
          artwork, your complimentary delegate passes and your place in the programme. Your
          organisation appears on the sponsor wall once the artwork is in.
        </>
      }
    />
  );
}
