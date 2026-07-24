import Link from "next/link";

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <section>
      <div className="wrap login-shell">
        <div className="eyebrow">Registration</div>
        <h2 style={{ marginTop: "0.6rem", marginBottom: "1.5rem" }}>Payment confirmed</h2>
        <div className="confirm-panel">
          <p><strong>Thank you, your registration is confirmed.</strong></p>
          {ref && <p className="ref" style={{ marginTop: "0.75rem" }}>{ref}</p>}
          <p style={{ marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            A receipt has been emailed and texted to you. Bring this reference, or the email, to the
            registration desk at the Jelili Adebisi Omotola Hall.
          </p>
        </div>
        <p style={{ marginTop: "2rem" }}>
          <Link className="btn ghost" href="/">Back to the conference site</Link>
        </p>
      </div>
    </section>
  );
}
