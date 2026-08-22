"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { FEE_SCHEDULE, type FeeCategory } from "@/lib/pricing";
import { requiresStudentVerification, STUDENT_VERIFICATION_COPY } from "@/lib/studentVerification";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { RemitaSteps } from "@/components/RemitaSteps";
import { PaymentDeclaration } from "@/components/PaymentDeclaration";
import { REMITA, REMITA_COPY } from "@/lib/remita";

// Registration in three steps: give us your details, pay at the bank through
// Remita, come back with the receipt.
//
// Step one does not navigate anywhere. The form is replaced in place by the
// payment walkthrough, so a delegate who closes the tab has still lost
// nothing: the registration exists, the reference is in their inbox, and
// /register/payment picks the thread back up.

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

/** What the server told us once the registration was written down. */
interface Reserved {
  reference: string;
  amountLabel: string;
  /** The bare figure, for the portal's Amount box. */
  amount: number;
  categoryLabel: string;
  fullName: string;
  email: string;
  phone: string;
  verification: "NOT_REQUIRED" | "PENDING" | "VERIFIED";
  verificationNote: string | null;
}

export function RegisterSection() {
  const [category, setCategory] = useState<FeeCategory>("EARLY_BIRD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reserved, setReserved] = useState<Reserved | null>(null);
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
      if (!res.ok) throw new Error(json.error || "Could not complete your registration.");

      // The only branch that leaves the page, and only reachable once card
      // credentials are configured.
      if (json.authorizationUrl) {
        window.location.href = json.authorizationUrl;
        return;
      }

      setReserved({
        reference: json.reference,
        amountLabel: json.amountLabel,
        amount: json.amount,
        categoryLabel: json.categoryLabel,
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        verification: json.verification,
        verificationNote: json.verificationNote,
      });
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete your registration.");
      setSubmitting(false);
    }
  }

  if (reserved) {
    return (
      <section id="register">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Step 1 of 3 complete</div>
            <h2>Your place is reserved</h2>
            <p>
              It is confirmed once payment reaches the university. Everything below has also been
              emailed to {reserved.email}, so you can close this page and pick it up later.
            </p>
          </div>

          <div className="reserved-summary">
            <div>
              <span className="k">Your reference</span>
              <span className="v mono">{reserved.reference}</span>
            </div>
            <div>
              <span className="k">Category</span>
              <span className="v">{reserved.categoryLabel}</span>
            </div>
            <div>
              <span className="k">Amount to pay</span>
              <span className="v tnum accent">{reserved.amountLabel}</span>
            </div>
          </div>

          {reserved.verification === "PENDING" && reserved.verificationNote && (
            <div className="notice-panel">
              <AcademicIcon name="shield" size={22} />
              <p>{reserved.verificationNote}</p>
            </div>
          )}

          <RemitaSteps
            amountLabel={reserved.amountLabel}
            payerName={reserved.fullName}
            reference={reserved.reference}
            email={reserved.email}
            phone={reserved.phone}
            amount={reserved.amount}
          />

          <PaymentDeclaration
            reference={reserved.reference}
            email={reserved.email}
            amountLabel={reserved.amountLabel}
          />

          <p className="archive-note">
            Paying later? That is normal, and nothing expires. Come back to{" "}
            <Link href="/register/payment">the payment page</Link> with your reference and email
            whenever the bank receipt is in hand.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="register">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">VI. Register &amp; Pay</div>
          <h2>Registration and payment</h2>
          <p>
            Fill this in and we work out what you owe, reserve your place, and hand you the exact
            figures to enter on the university&rsquo;s Remita portal. {REMITA_COPY.whyManual}
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
                  <span className="hint">
                    As it should appear on your certificate, and on the Remita payment slip.
                  </span>
                </div>
                <div className="field">
                  <label htmlFor="regEmail">Email address</label>
                  <input id="regEmail" name="email" type="email" required />
                  <span className="hint">Your reference and payment steps are sent here.</span>
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

              <div className="method-panel">
                <span className="method-icon">
                  <AcademicIcon name="city" size={22} />
                </span>
                <div>
                  <h3>{REMITA_COPY.heading}</h3>
                  <p>{REMITA_COPY.lede}</p>
                  <p className="method-note">
                    Nothing is charged on this page. The next screen gives you your reference and
                    the exact details to enter on the portal, and the Secretariat confirms your
                    place within {REMITA.verificationDays} working days of receiving your receipt.
                  </p>
                </div>
              </div>

              <button className="btn solid" type="submit" disabled={submitting}>
                {submitting ? "Reserving your place..." : "Reserve my place and show payment steps"}
              </button>
            </fieldset>
          </form>
        </div>

        <p className="archive-note">
          Already registered and just need to send your receipt?{" "}
          <Link href="/register/payment">Go straight to the payment page</Link>.
        </p>
      </div>
    </section>
  );
}
