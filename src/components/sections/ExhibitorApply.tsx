"use client";

import { FormEvent, useState } from "react";
import { LogoUpload, type UploadedLogo } from "@/components/LogoUpload";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import {
  EXHIBIT_PACKAGES,
  EXHIBIT_PACKAGE_ORDER,
  EXHIBITION,
  type ExhibitPackage,
} from "@/lib/exhibition";
import { CONTACT } from "@/lib/conference";

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount.toLocaleString("en-US")}` : `₦${amount.toLocaleString("en-NG")}`;
}

export function ExhibitorApply({ taken }: { taken: Record<string, number> }) {
  const [packageKey, setPackageKey] = useState<ExhibitPackage>("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "TRANSFER">("ONLINE");
  const [logo, setLogo] = useState<UploadedLogo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingTransfer, setAwaitingTransfer] = useState<string | null>(null);

  const definition = EXHIBIT_PACKAGES[packageKey];
  const used = taken[definition.label] ?? 0;
  const remaining = Math.max(0, definition.capacity - used);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    setSubmitting(true);

    try {
      const res = await fetch("/api/exhibitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisation: formData.get("organisation"),
          contactName: formData.get("contactName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          description: formData.get("description") || "",
          websiteUrl: formData.get("websiteUrl") || "",
          packageKey,
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
          Your stand is held for fourteen days while the invoice is settled. Build up is{" "}
          {EXHIBITION.buildUp}; your stand number and exhibitor passes are issued once payment is
          received.
        </p>
        <p className="confirm-note">
          Questions: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or{" "}
          <a href={`tel:${CONTACT.phones[2].e164}`}>{CONTACT.phones[2].display}</a>.
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
            {EXHIBIT_PACKAGE_ORDER.map((key) => {
              const def = EXHIBIT_PACKAGES[key];
              const left = Math.max(0, def.capacity - (taken[def.label] ?? 0));
              return (
                <label
                  key={key}
                  className={`tier-option ${packageKey === key ? "is-selected" : ""} ${left === 0 ? "is-sold-out" : ""}`}
                >
                  <input
                    type="radio"
                    name="packageKey"
                    value={key}
                    checked={packageKey === key}
                    disabled={left === 0}
                    onChange={() => setPackageKey(key)}
                  />
                  <span className="tier-option-icon">
                    <AcademicIcon name={def.icon} size={22} />
                  </span>
                  <span className="tier-option-label">{def.label}</span>
                  <span className="tier-option-amount tnum">
                    {formatAmount(def.amount, def.currency)}
                  </span>
                  <span className="tier-option-stock">
                    {left === 0 ? "Fully booked" : `${left} of ${def.capacity} left`}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="tier-detail">
            <h3>
              {definition.label} <span className="tier-size">{definition.size}</span>
            </h3>
            <p>{definition.summary}</p>
            <ul className="tick-list">
              {definition.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="exOrganisation">Organisation, department or research group</label>
              <input id="exOrganisation" name="organisation" type="text" required maxLength={160} />
            </div>
            <div className="field">
              <label htmlFor="exContact">Contact name</label>
              <input id="exContact" name="contactName" type="text" required maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="exEmail">Email address</label>
              <input id="exEmail" name="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="exPhone">Phone number</label>
              <input id="exPhone" name="phone" type="tel" required placeholder="+234 ..." maxLength={32} />
              <span className="hint">Include your country code if you are outside Nigeria.</span>
            </div>
            <div className="field full">
              <label htmlFor="exWebsite">Website, optional</label>
              <input id="exWebsite" name="websiteUrl" type="url" placeholder="https://" />
            </div>
            <div className="field full">
              <label htmlFor="exDescription">
                What will you be showing? This appears in the exhibitor directory.
              </label>
              <textarea id="exDescription" name="description" maxLength={600} rows={4} />
              <span className="hint">Up to 600 characters.</span>
            </div>

            <LogoUpload folder="uarc/exhibitors" value={logo} onChange={setLogo} />
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
          </div>

          <div className="price-out">
            <span>
              {definition.label}
              {remaining > 0 && remaining <= 3 && (
                <em className="stock-warning"> only {remaining} left</em>
              )}
            </span>
            <span className="amt tnum">{formatAmount(definition.amount, definition.currency)}</span>
          </div>

          <button className="btn solid" type="submit" disabled={submitting || remaining === 0}>
            {remaining === 0
              ? "Fully booked"
              : submitting
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
