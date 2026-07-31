"use client";

import { FormEvent, useState } from "react";
import { FEE_SCHEDULE, type FeeCategory } from "@/lib/pricing";
import { requiresStudentVerification, STUDENT_VERIFICATION_COPY } from "@/lib/studentVerification";
import { AcademicIcon } from "@/components/icons/AcademicIcons";

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
  const needsVerification = requiresStudentVerification(category);
  const isInternational = category === "INTERNATIONAL";

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
          country: formData.get("country") || "",
          listPublicly: formData.get("listPublicly") === "on",
          studentIdNumber: needsVerification ? formData.get("studentIdNumber") : "",
          studentInstitutionEmail: needsVerification ? formData.get("studentInstitutionEmail") : "",
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
            USSD through Paystack. A receipt and access confirmation follow immediately by email and
            SMS, and your certificate is issued automatically once you check in at the desk.
          </p>
        </div>

        <div className="panel">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <fieldset disabled={submitting} className="bare-fieldset">
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="fullName">Full name</label>
                  <input id="fullName" name="fullName" type="text" required maxLength={120} />
                  <span className="hint">As it should appear on your certificate.</span>
                </div>
                <div className="field">
                  <label htmlFor="regEmail">Email address</label>
                  <input id="regEmail" name="email" type="email" required />
                </div>
                <div className="field">
                  <label htmlFor="regPhone">Phone number</label>
                  <input
                    id="regPhone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+234 ..."
                    maxLength={32}
                  />
                  <span className="hint">
                    Include your country code if you are outside Nigeria, for example +44 or +1.
                  </span>
                </div>
                <div className="field">
                  <label htmlFor="regInst">Institution or organisation</label>
                  <input id="regInst" name="institution" type="text" required maxLength={160} />
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
                        {FEE_SCHEDULE[key].label},{" "}
                        {formatAmount(FEE_SCHEDULE[key].amount, FEE_SCHEDULE[key].currency)}
                      </option>
                    ))}
                  </select>
                </div>

                {isInternational && (
                  <div className="field full">
                    <label htmlFor="country">Country of residence</label>
                    <input id="country" name="country" type="text" maxLength={80} />
                    <span className="hint">
                      Used for visa support letters and to plan the international sessions.
                    </span>
                  </div>
                )}
              </div>

              {/* Student rates are checked. The fields appear only when they
                  apply, so nobody paying a full rate is asked for them. */}
              {needsVerification && (
                <div className="verify-block">
                  <div className="verify-block-head">
                    <span className="verify-block-icon">
                      <AcademicIcon name="shield" size={22} />
                    </span>
                    <div>
                      <h3>{STUDENT_VERIFICATION_COPY.heading}</h3>
                      <p>{STUDENT_VERIFICATION_COPY.intro}</p>
                    </div>
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="studentIdNumber">Matriculation or student number</label>
                      <input
                        id="studentIdNumber"
                        name="studentIdNumber"
                        type="text"
                        required
                        maxLength={40}
                        className="mono"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="studentInstitutionEmail">Institutional email address</label>
                      <input
                        id="studentInstitutionEmail"
                        name="studentInstitutionEmail"
                        type="email"
                        required
                        maxLength={160}
                        placeholder="you@unilag.edu.ng"
                      />
                    </div>
                  </div>

                  <p className="verify-note">{STUDENT_VERIFICATION_COPY.autoCleared}</p>
                  <p className="verify-note">{STUDENT_VERIFICATION_COPY.atTheDesk}</p>
                </div>
              )}

              <div className="consent-row">
                <label className="consent-label">
                  <input type="checkbox" name="listPublicly" />
                  <span>
                    <strong>List my name on the public delegate page.</strong>
                    Your name, institution and country only. No email address, phone number or fee
                    is ever published. Leave this unticked and you appear nowhere public; you can
                    change your mind at any time by writing to the Secretariat.
                  </span>
                </label>
              </div>

              <div className="price-out">
                <span>Amount due</span>
                <span className="amt tnum">{formatAmount(fee.amount, fee.currency)}</span>
              </div>

              <div className="pay-methods">
                <label>
                  <input type="radio" name="pay" defaultChecked /> Card
                </label>
                <label>
                  <input type="radio" name="pay" /> Bank transfer
                </label>
                <label>
                  <input type="radio" name="pay" /> USSD
                </label>
              </div>
              <p className="fee-note pay-note">
                Payment method is chosen on the secure Paystack checkout page that follows. The
                conference never sees or stores your card details.
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
