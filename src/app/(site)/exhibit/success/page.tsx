import { PaymentOutcome } from "@/components/PaymentOutcome";
import { EXHIBITION } from "@/lib/exhibition";

export default async function ExhibitSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <PaymentOutcome
      eyebrow="Research fair"
      heading="Your stand is booked"
      outcome="success"
      reference={ref}
      body={
        <>
          <p>A receipt has been emailed to you.</p>
          <p>
            Build up is {EXHIBITION.buildUp}. The fair is open to delegates {EXHIBITION.open}, and
            break down begins {EXHIBITION.breakDown}. Your stand number and exhibitor passes are
            issued by the Secretariat two weeks before build up.
          </p>
        </>
      }
    />
  );
}
