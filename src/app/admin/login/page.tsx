"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { UnilagLogo } from "@/components/UnilagLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not sign in.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setSubmitting(false);
    }
  }

  return (
    <main id="main">
      <section>
        <div className="wrap login-shell">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
            <UnilagLogo height={40} variant="crestOnly" />
            <div>
              <h1 style={{ fontFamily: "'Iowan Old Style', Palatino, Georgia, serif", fontWeight: 600, fontSize: "1rem" }}>
                Secretariat
              </h1>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Administrator sign in</div>
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          {/* `method="post"` matters even though the submit is handled in
              JavaScript. If the page ever fails to hydrate, a form with no
              method falls back to a native GET, which puts the typed password
              in the URL, the browser history and every access log between
              here and the server. A POST fallback fails harmlessly instead. */}
          <form method="post" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Administrator email</label>
              <input id="email" name="email" type="email" required autoComplete="username" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            <button className="btn solid" type="submit" disabled={submitting} style={{ width: "100%" }}>
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
