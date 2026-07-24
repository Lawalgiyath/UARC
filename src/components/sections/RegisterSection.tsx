"use client";

import { FormEvent, useState } from "react";
import { FEE_SCHEDULE, type FeeCategory } from "@/lib/pricing";

const CATEGORY_ORDER: FeeCategory[] = [
  "EARLY_BIRD",
  "REGULAR",
  "STUDENT_EARLY_BIRD",
  "STUDENT_REGULAR",
  "INTERNATIONAL",
];

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount}` : `₦${amount.toLocaleString("en-NG")}`;
}

export function RegisterSection() {
  const [category, setCategory] = useState<FeeCategory>("EARLY_BIRD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fee = FEE_SCHEDULE[category];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          institution: formData.get("institution"),
          category,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not start payment.");
      window.location.href = json.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
      setSubmitting(false);
    }
  }

  return (
    <section id="register">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">VI. Register &amp; Pay</div>
          <h2>Registration and payment</h2>
          <p>
            Select a category to see the fee update, then complete payment by card, bank transfer or
            USSD through Paystack. A receipt and access confirmation follow immediately by email and SMS.
          </p>
        </div>

        <div className="panel">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <fieldset disabled={submitting} style={{ border: "none", padding: 0, margin: 0 }}>
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="fullName">Full name</label>
                  <input id="fullName" name="fullName" type="text" required />
                </div>
                <div className="field">
                  <label htmlFor="regEmail">Email address</label>
                  <input id="regEmail" name="email" type="email" required />
                </div>
                <div className="field">
                  <label htmlFor="regPhone">Phone number</label>
                  <input id="regPhone" name="phone" type="tel" required />
                </div>
                <div className="field">
                  <label htmlFor="regInst">Institution or organisation</label>
                  <input id="regInst" name="institution" type="text" required />
                </div>
                <div className="field full">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeeCategory)}
                  >
                    {CATEGORY_ORDER.map((key) => (
                      <option key={key} value={key}>
                        {FEE_SCHEDULE[key].label}, {formatAmount(FEE_SCHEDULE[key].amount, FEE_SCHEDULE[key].currency)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="price-out">
                <span>Amount due</span>
                <span className="amt tnum">{formatAmount(fee.amount, fee.currency)}</span>
              </div>

              <div className="pay-methods">
                <label><input type="radio" name="pay" defaultChecked /> Card</label>
                <label><input type="radio" name="pay" /> Bank transfer</label>
                <label><input type="radio" name="pay" /> USSD</label>
              </div>
              <p className="fee-note" style={{ marginTop: "-0.75rem", marginBottom: "1.5rem" }}>
                Payment method is chosen on the secure Paystack checkout page that follows.
              </p>

              <button className="btn solid" type="submit" disabled={submitting}>
                {submitting ? "Preparing payment..." : "Pay and Complete Registration"}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </section>
  );
}
