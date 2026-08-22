"use client";

import { FormEvent, useState } from "react";
import { LogoUpload, type UploadedLogo } from "@/components/LogoUpload";
import { RemitaSteps } from "@/components/RemitaSteps";
import { PaymentDeclaration } from "@/components/PaymentDeclaration";
import { REMITA_COPY } from "@/lib/remita";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import {
  SPONSOR_TIERS,
  SPONSOR_TIER_ORDER,
  type SponsorTier,
} from "@/lib/sponsorship";
import { CONTACT } from "@/lib/conference";

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount.toLocaleString("en-US")}` : `₦${amount.toLocaleString("en-NG")}`;
}

export function SponsorApply() {
  const [tier, setTier] = useState<SponsorTier>("GOLD");
  // Everything goes through Remita; the reserved state below carries the
  // details the applicant needs to take to the portal.
  const [reserved, setReserved] = useState<{
    reference: string;
    amountLabel: string;
  /** The bare figure, for the portal's Amount box. */
  amount: number;
    payerName: string;
    email: string;
    phone: string;
  } | null>(null);
  const [logo, setLogo] = useState<UploadedLogo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const definition = SPONSOR_TIERS[tier];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    setSubmitting(true);

    try {
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisation: formData.get("organisation"),
          contactName: formData.get("contactName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          websiteUrl: formData.get("websiteUrl") || "",
          message: formData.get("message") || "",
          tier,
          logoUrl: logo?.url || "",
          logoPublicId: logo?.publicId || "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not send your application.");

      if (json.authorizationUrl) {
        window.location.href = json.authorizationUrl;
        return;
      }
      setReserved({
        reference: json.reference,
        amountLabel: json.amountLabel,
        amount: json.amount,
        payerName: json.payerName,
        email: json.email,
        phone: json.phone,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reserved) {
    return (
      <div id="apply">
        <div className="confirm-panel">
          <p>
            <strong>Application received.</strong> Your reference is:
          </p>
          <p className="ref">{reserved.reference}</p>
          <p className="confirm-note">
            Your sponsorship is confirmed, and your logo goes up on the sponsor wall, once the
            Secretariat has checked your payment. The steps below have also been emailed to{" "}
            {reserved.email}, so your finance office can work from them directly.
          </p>
          <p className="confirm-note">
            Questions in the meantime: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or{" "}
            <a href={`tel:${CONTACT.phones[0].e164}`}>{CONTACT.phones[0].display}</a>.
          </p>
        </div>

        <RemitaSteps
          amountLabel={reserved.amountLabel}
          payerName={reserved.payerName}
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
      </div>
    );
  }

  return (
    <div className="panel" id="apply">
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <fieldset disabled={submitting} className="bare-fieldset">
          <div className="tier-picker">
            {SPONSOR_TIER_ORDER.map((key) => {
              const def = SPONSOR_TIERS[key];
              return (
                <label key={key} className={`tier-option ${tier === key ? "is-selected" : ""}`}>
                  <input
                    type="radio"
                    name="tier"
                    value={key}
                    checked={tier === key}
                    onChange={() => setTier(key)}
                  />
                  <span className="tier-option-icon">
                    <AcademicIcon name={def.icon} size={22} />
                  </span>
                  <span className="tier-option-label">{def.label}</span>
                  <span className="tier-option-amount tnum">
                    {formatAmount(def.amount, def.currency)}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="tier-detail">
            <h3>{definition.label}</h3>
            <p>{definition.summary}</p>
            <ul className="tick-list">
              {definition.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="organisation">Organisation</label>
              <input id="organisation" name="organisation" type="text" required maxLength={160} />
            </div>
            <div className="field">
              <label htmlFor="contactName">Contact name</label>
              <input id="contactName" name="contactName" type="text" required maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="sponsorEmail">Email address</label>
              <input id="sponsorEmail" name="email" type="email" required />
              <span className="hint">The invoice and confirmation go here.</span>
            </div>
            <div className="field">
              <label htmlFor="sponsorPhone">Phone number</label>
              <input
                id="sponsorPhone"
                name="phone"
                type="tel"
                required
                placeholder="+234 ..."
                maxLength={32}
              />
              <span className="hint">Include your country code if you are outside Nigeria.</span>
            </div>
            <div className="field full">
              <label htmlFor="websiteUrl">Website, optional</label>
              <input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://" />
              <span className="hint">Your logo on the sponsor wall links here.</span>
            </div>

            <LogoUpload folder="uarc/sponsors" value={logo} onChange={setLogo} />

            <div className="field full">
              <label htmlFor="message">Anything the Secretariat should know, optional</label>
              <textarea id="message" name="message" maxLength={1000} rows={4} />
            </div>
          </div>

          <div className="method-panel">
            <span className="method-icon">
              <AcademicIcon name="city" size={22} />
            </span>
            <div>
              <h3>{REMITA_COPY.heading}</h3>
              <p>{REMITA_COPY.lede}</p>
              <p className="method-note">
                Nothing is charged here. The next screen gives you a reference and the exact
                figures for the portal, which most finance offices can work from directly.
              </p>
            </div>
          </div>

          <div className="price-out">
            <span>{definition.label}</span>
            <span className="amt tnum">{formatAmount(definition.amount, definition.currency)}</span>
          </div>

          <button className="btn solid" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Apply and show payment steps"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
