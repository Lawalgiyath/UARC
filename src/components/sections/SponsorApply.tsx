"use client";

import { FormEvent, useState } from "react";
import { LogoUpload, type UploadedLogo } from "@/components/LogoUpload";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import {
  SPONSOR_TIERS,
  SPONSOR_TIER_ORDER,
  SPONSOR_BANK_DETAILS,
  type SponsorTier,
} from "@/lib/sponsorship";
import { CONTACT } from "@/lib/conference";

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount.toLocaleString("en-US")}` : `₦${amount.toLocaleString("en-NG")}`;
}

export function SponsorApply() {
  const [tier, setTier] = useState<SponsorTier>("GOLD");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "TRANSFER">("ONLINE");
  const [logo, setLogo] = useState<UploadedLogo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingTransfer, setAwaitingTransfer] = useState<string | null>(null);

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
          paymentMethod,
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
      setAwaitingTransfer(json.reference);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (awaitingTransfer) {
    return (
      <div className="confirm-panel" id="apply">
        <p>
          <strong>Application received.</strong> Your reference is:
        </p>
        <p className="ref">{awaitingTransfer}</p>
        <p className="confirm-note">
          The Secretariat will send an invoice carrying the university&rsquo;s bank details to the
          address you gave. {SPONSOR_BANK_DETAILS.note} Your sponsorship is confirmed, and your logo
          goes up on the sponsor wall, once payment is received.
        </p>
        <p className="confirm-note">
          Questions in the meantime: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or{" "}
          <a href={`tel:${CONTACT.phones[0].e164}`}>{CONTACT.phones[0].display}</a>.
        </p>
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

          <div className="field full">
            <label>How would you like to pay?</label>
            <div className="pay-methods">
              <label className={paymentMethod === "ONLINE" ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                />
                Online now, by card or transfer
              </label>
              <label className={paymentMethod === "TRANSFER" ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "TRANSFER"}
                  onChange={() => setPaymentMethod("TRANSFER")}
                />
                Send me an invoice
              </label>
            </div>
            <span className="hint">
              Most institutional sponsors pay against an invoice through their finance office.
              Either route confirms the same sponsorship.
            </span>
          </div>

          <div className="price-out">
            <span>{definition.label}</span>
            <span className="amt tnum">{formatAmount(definition.amount, definition.currency)}</span>
          </div>

          <button className="btn solid" type="submit" disabled={submitting}>
            {submitting
              ? "Sending..."
              : paymentMethod === "ONLINE"
                ? "Continue to payment"
                : "Request an invoice"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
