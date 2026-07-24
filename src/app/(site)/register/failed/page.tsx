import Link from "next/link";

export default async function RegisterFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <section>
      <div className="wrap login-shell">
        <div className="eyebrow">Registration</div>
        <h2 style={{ marginTop: "0.6rem", marginBottom: "1.5rem" }}>Payment was not completed</h2>
        <div className="form-error">
          <p><strong>Your payment could not be confirmed.</strong></p>
          {ref && <p style={{ marginTop: "0.5rem" }}>Reference: {ref}</p>}
          <p style={{ marginTop: "0.5rem" }}>
            No charge should have been made. Please try again, or contact the Secretariat if the
            problem continues.
          </p>
        </div>
        <p style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
          <Link className="btn solid" href="/register">Try again</Link>
          <Link className="btn ghost" href="/">Back to the conference site</Link>
        </p>
      </div>
    </section>
  );
}
