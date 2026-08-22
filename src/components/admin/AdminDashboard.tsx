"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UnilagLogo } from "@/components/UnilagLogo";

type PartnerStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "DECLARED"
  | "PAID"
  | "CONFIRMED"
  | "REJECTED"
  | "FAILED"
  | "CANCELLED";

type RegistrationStatus = "PENDING" | "DECLARED" | "PAID" | "REJECTED" | "FAILED";

import { FLAG_LABELS } from "@/lib/paymentChecks";

/** A payment somebody has declared, awaiting or having had a decision. */
export interface PaymentRow {
  kind: "registration" | "sponsor" | "exhibitor";
  id: string;
  reference: string;
  payer: string;
  detail: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  rrr: string | null;
  receiptUrl: string | null;
  declaredAt: string | null;
  paymentNote: string | null;
  /** What the payer said, and what the automatic checks made of it. */
  declaredAmount: number | null;
  paidOn: string | null;
  paidVia: string | null;
  checkFlags: string[];
  checkVerdict: string | null;
}

interface SubmissionRow {
  id: string;
  reference: string;
  authorName: string;
  track: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

interface RegistrationRow {
  id: string;
  reference: string;
  fullName: string;
  email: string;
  institution: string;
  category: string;
  amount: number;
  currency: string;
  status: RegistrationStatus;
  verification: "NOT_REQUIRED" | "PENDING" | "VERIFIED" | "REJECTED";
  studentIdNumber: string | null;
  studentInstitutionEmail: string | null;
  attended: boolean;
  listPublicly: boolean;
  createdAt: string;
}

interface SponsorRow {
  id: string;
  reference: string;
  organisation: string;
  contactName: string;
  tier: string;
  amount: number;
  currency: string;
  status: PartnerStatus;
  displayOnSite: boolean;
  hasLogo: boolean;
}

interface ExhibitorRow {
  id: string;
  reference: string;
  organisation: string;
  contactName: string;
  packageKey: string;
  amount: number;
  currency: string;
  status: PartnerStatus;
  standNumber: string | null;
  displayOnSite: boolean;
}

type Tab = "payments" | "submissions" | "registrations" | "verification" | "sponsors" | "exhibitors";

const TABS: { key: Tab; label: string }[] = [
  { key: "payments", label: "Payments" },
  { key: "submissions", label: "Abstracts" },
  { key: "registrations", label: "Registrations" },
  { key: "verification", label: "Student checks" },
  { key: "sponsors", label: "Sponsors" },
  { key: "exhibitors", label: "Exhibitors" },
];

const PARTNER_STATUSES: PartnerStatus[] = [
  "PENDING",
  "AWAITING_PAYMENT",
  "DECLARED",
  "PAID",
  "CONFIRMED",
  "REJECTED",
  "FAILED",
  "CANCELLED",
];

function money(amount: number, currency: string) {
  return `${currency === "USD" ? "$" : "₦"}${amount.toLocaleString("en-NG")}`;
}

export function AdminDashboard({
  initialSubmissions,
  initialRegistrations,
  initialSponsors,
  initialExhibitors,
  initialPayments,
  certificateCount,
  abstractDeadlineIso,
}: {
  initialSubmissions: SubmissionRow[];
  initialRegistrations: RegistrationRow[];
  initialSponsors: SponsorRow[];
  initialExhibitors: ExhibitorRow[];
  initialPayments: PaymentRow[];
  certificateCount: number;
  abstractDeadlineIso: string;
}) {
  const router = useRouter();
  // Payments open first: checking receipts is the daily job now that money
  // arrives through a bank rather than a card.
  const [tab, setTab] = useState<Tab>("payments");
  const [payments, setPayments] = useState(initialPayments);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [exhibitors, setExhibitors] = useState(initialExhibitors);
  const [certificates, setCertificates] = useState(certificateCount);
  const [deadline, setDeadline] = useState(abstractDeadlineIso);
  const [deadlineDraft, setDeadlineDraft] = useState(abstractDeadlineIso.slice(0, 16));
  const [savingDeadline, setSavingDeadline] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const pendingChecks = registrations.filter((r) => r.verification === "PENDING");
  const awaitingPayment = payments.filter((p) => p.status === "DECLARED");

  /**
   * Accept or refuse a declared payment. Accepting is what actually marks a
   * registration as paid; nothing automatic ever does.
   */
  async function decidePayment(row: PaymentRow, decision: "ACCEPT" | "REJECT", note?: string) {
    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: row.reference, decision, note }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNotice(json.error || "That decision could not be saved. Please try again.");
      return;
    }

    const status = decision === "ACCEPT" ? "PAID" : "REJECTED";
    setPayments((prev) =>
      prev.map((p) => (p.reference === row.reference ? { ...p, status, paymentNote: note ?? null } : p))
    );
    if (row.kind === "registration") {
      setRegistrations((prev) =>
        prev.map((r) =>
          r.reference === row.reference ? { ...r, status: status as RegistrationStatus } : r
        )
      );
    }
    setRejecting(null);
    setRejectNote("");
    setNotice(
      decision === "ACCEPT"
        ? `${row.payer} confirmed as paid. Receipt and SMS sent.`
        : `${row.payer} told the receipt was not accepted, with your reason.`
    );
  }

  const stats = useMemo(() => {
    const paid = registrations.filter((r) => r.status === "PAID");
    const partnerIncome = [...sponsors, ...exhibitors]
      .filter((p) => p.status === "PAID" || p.status === "CONFIRMED")
      .filter((p) => p.currency === "NGN")
      .reduce((sum, p) => sum + p.amount, 0);
    const revenueNGN = paid.filter((r) => r.currency === "NGN").reduce((sum, r) => sum + r.amount, 0);
    const revenueUSD = paid.filter((r) => r.currency === "USD").reduce((sum, r) => sum + r.amount, 0);
    const daysLeft = Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
    return {
      totalAbstracts: submissions.length,
      totalPaid: paid.length,
      attended: paid.filter((r) => r.attended).length,
      revenueNGN,
      revenueUSD,
      partnerIncome,
      daysLeft,
    };
  }, [submissions, registrations, sponsors, exhibitors, deadline]);

  async function patch(url: string, body: unknown): Promise<Record<string, unknown> | null> {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setNotice("That change could not be saved. Please try again.");
      return null;
    }
    return res.json();
  }

  async function updateSubmissionStatus(id: string, status: SubmissionRow["status"]) {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    await patch("/api/admin/submissions", { id, status });
  }

  /**
   * Checking a delegate in is the single action that issues their certificate,
   * so the confirmation says so rather than leaving the Secretariat to wonder
   * whether a second step is needed.
   */
  async function setAttended(row: RegistrationRow, attended: boolean) {
    setRegistrations((prev) => prev.map((r) => (r.id === row.id ? { ...r, attended } : r)));
    const json = await patch("/api/admin/registrations", { id: row.id, attended });
    if (json?.certificate) {
      const code = (json.certificate as { code: string }).code;
      setCertificates((n) => n + 1);
      setNotice(`${row.fullName} checked in. Certificate ${code} issued and emailed.`);
    } else if (attended && row.status !== "PAID") {
      setNotice(
        `${row.fullName} is marked present, but no certificate was issued because the registration is not paid.`
      );
    }
  }

  async function setVerification(id: string, verification: RegistrationRow["verification"]) {
    setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, verification } : r)));
    await patch("/api/admin/registrations", { id, verification });
  }

  async function updateSponsor(id: string, changes: Partial<SponsorRow>) {
    setSponsors((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)));
    await patch("/api/admin/sponsors", { id, ...changes });
  }

  async function updateExhibitor(id: string, changes: Partial<ExhibitorRow>) {
    setExhibitors((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));
    await patch("/api/admin/exhibitors", { id, ...changes });
  }

  async function saveDeadline() {
    setSavingDeadline(true);
    try {
      const iso = new Date(deadlineDraft).toISOString();
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstractDeadline: iso }),
      });
      setDeadline(iso);
      setNotice("Deadline saved. The public portal has opened or closed to match.");
    } finally {
      setSavingDeadline(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main id="main">
      <section>
        <div className="wrap">
          <div className="admin-header">
            <div className="admin-identity">
              <UnilagLogo height={44} variant="crestOnly" />
              <div>
                <div className="admin-title">Secretariat Dashboard</div>
                <div className="admin-sub">19th Annual Research Conference</div>
              </div>
            </div>
            <button className="btn ghost small" onClick={logout} type="button">
              Sign out
            </button>
          </div>

          {notice && (
            <div className="admin-notice" role="status">
              {notice}
              <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
                &times;
              </button>
            </div>
          )}

          <div className="admin-stats">
            <div>
              <div className="n tnum">{stats.totalAbstracts}</div>
              <div className="l">Abstracts submitted</div>
            </div>
            <div>
              <div className="n tnum">{stats.totalPaid}</div>
              <div className="l">Registrations paid</div>
            </div>
            <div>
              <div className="n tnum">{stats.attended}</div>
              <div className="l">Checked in</div>
            </div>
            <div>
              <div className="n tnum">{certificates}</div>
              <div className="l">Certificates issued</div>
            </div>
            <div>
              <div className="n tnum">&#8358;{stats.revenueNGN.toLocaleString("en-NG")}</div>
              <div className="l">Delegate revenue, naira</div>
            </div>
            <div>
              <div className="n tnum">${stats.revenueUSD}</div>
              <div className="l">Delegate revenue, dollars</div>
            </div>
            <div>
              <div className="n tnum">&#8358;{stats.partnerIncome.toLocaleString("en-NG")}</div>
              <div className="l">Sponsorship and exhibition</div>
            </div>
            <div>
              <div className="n tnum">{awaitingPayment.length}</div>
              <div className="l">Receipts to check</div>
            </div>
            <div>
              <div className="n tnum">{pendingChecks.length}</div>
              <div className="l">Student checks waiting</div>
            </div>
          </div>

          <div className="panel admin-deadline">
            <div className="field">
              <label htmlFor="deadline">Abstract submission deadline</label>
              <input
                id="deadline"
                type="datetime-local"
                value={deadlineDraft}
                onChange={(e) => setDeadlineDraft(e.target.value)}
              />
              <span className="hint">
                {stats.daysLeft} day(s) remaining. Changing this immediately opens or closes the
                public portal.
              </span>
            </div>
            <button className="btn solid small" onClick={saveDeadline} disabled={savingDeadline} type="button">
              {savingDeadline ? "Saving..." : "Save deadline"}
            </button>
          </div>

          <div className="admin-tabs">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={tab === item.key ? "active" : ""}
                onClick={() => setTab(item.key)}
              >
                {item.label}
                {item.key === "verification" && pendingChecks.length > 0 && (
                  <span className="tab-badge">{pendingChecks.length}</span>
                )}
                {item.key === "payments" && awaitingPayment.length > 0 && (
                  <span className="tab-badge">{awaitingPayment.length}</span>
                )}
              </button>
            ))}
          </div>

          {tab === "payments" && (
            <>
              <p className="admin-note">
                Payments made through the university&rsquo;s Remita portal and paid at a bank. Open
                each receipt, check the RRR and the amount against the conference account, then
                accept or refuse it. Accepting is what marks a registration as paid and releases the
                confirmation email and SMS; nothing else in the system does that.
              </p>

              {payments.length === 0 ? (
                <div className="admin-table-wrap">
                  <p className="admin-empty admin-empty-block">
                    No payments have been declared yet. They appear here as delegates, sponsors and
                    exhibitors send in their receipts.
                  </p>
                </div>
              ) : (
                <ul className="payment-queue">
                  {payments.map((row) => (
                    <li key={row.reference} className={`payment-card is-${row.status.toLowerCase()}`}>
                      <div className="payment-card-head">
                        <div>
                          <div className="payment-card-ref mono">{row.reference}</div>
                          <h3>{row.payer}</h3>
                          <div className="payment-card-detail">{row.detail}</div>
                          <div className="payment-card-email">{row.email}</div>
                        </div>
                        <div className="payment-card-amount">
                          <span className="k">Expected</span>
                          <span className="v tnum">{money(row.amount, row.currency)}</span>
                          <span className={`pill-status ${row.status.toLowerCase()}`}>{row.status}</span>
                        </div>
                      </div>

                      {row.checkVerdict && (
                        <div className={`check-band is-${row.checkVerdict.toLowerCase()}`}>
                          <span className="check-verdict">
                            {row.checkVerdict === "CLEAR" ? "Checks found nothing" : "Needs attention"}
                          </span>
                          {row.checkFlags.length > 0 ? (
                            <ul className="check-flags">
                              {row.checkFlags.map((code) => (
                                <li key={code}>{FLAG_LABELS[code] ?? code}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="check-caveat">
                              Nothing contradicts the claim. That is not the same as the money
                              having been seen: confirm against the account statement.
                            </span>
                          )}
                        </div>
                      )}

                      <dl className="payment-card-facts">
                        <div>
                          <dt>RRR</dt>
                          <dd className="mono">{row.rrr ?? "—"}</dd>
                        </div>
                        <div>
                          <dt>Payer says paid</dt>
                          <dd className="tnum">
                            {row.declaredAmount !== null ? (
                              <span className={row.declaredAmount !== row.amount ? "is-off" : undefined}>
                                {money(row.declaredAmount, row.currency)}
                              </span>
                            ) : (
                              "—"
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>Dated</dt>
                          <dd>
                            {row.paidOn
                              ? new Date(row.paidOn).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt>Paid via</dt>
                          <dd>{row.paidVia ?? "—"}</dd>
                        </div>
                        <div>
                          <dt>Declared</dt>
                          <dd>
                            {row.declaredAt
                              ? new Date(row.declaredAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt>Receipt</dt>
                          <dd>
                            {row.receiptUrl ? (
                              <a href={row.receiptUrl} target="_blank" rel="noreferrer noopener">
                                Open receipt
                              </a>
                            ) : (
                              "Not attached"
                            )}
                          </dd>
                        </div>
                      </dl>

                      {row.paymentNote && (
                        <p className="payment-card-note">Reason given: {row.paymentNote}</p>
                      )}

                      {row.status === "DECLARED" && (
                        <div className="payment-card-actions">
                          {rejecting === row.reference ? (
                            <div className="reject-box">
                              <div className="field">
                                <label htmlFor={`note-${row.id}`}>
                                  Why can this receipt not be accepted?
                                </label>
                                <input
                                  id={`note-${row.id}`}
                                  type="text"
                                  maxLength={400}
                                  autoFocus
                                  placeholder="The amount paid is ₦10,000 short of the regular rate."
                                  value={rejectNote}
                                  onChange={(e) => setRejectNote(e.target.value)}
                                />
                                <span className="hint">
                                  Sent to the payer word for word, so write it to them.
                                </span>
                              </div>
                              <div className="reject-actions">
                                <button
                                  type="button"
                                  className="btn solid small"
                                  disabled={rejectNote.trim().length < 3}
                                  onClick={() => decidePayment(row, "REJECT", rejectNote.trim())}
                                >
                                  Send refusal
                                </button>
                                <button
                                  type="button"
                                  className="btn ghost small"
                                  onClick={() => {
                                    setRejecting(null);
                                    setRejectNote("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="btn solid small"
                                onClick={() => decidePayment(row, "ACCEPT")}
                              >
                                Confirm payment received
                              </button>
                              <button
                                type="button"
                                className="btn ghost small"
                                onClick={() => {
                                  setRejecting(row.reference);
                                  setRejectNote("");
                                }}
                              >
                                Refuse receipt
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === "submissions" && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Author</th>
                    <th>Track</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id}>
                      <td className="mono">{s.reference}</td>
                      <td>{s.authorName}</td>
                      <td>{s.track}</td>
                      <td>
                        <select
                          value={s.status}
                          aria-label={`Status for ${s.reference}`}
                          onChange={(e) =>
                            updateSubmissionStatus(s.id, e.target.value as SubmissionRow["status"])
                          }
                        >
                          <option value="PENDING">Pending</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="admin-empty">
                        No abstracts submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "registrations" && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Listed</th>
                    <th>Check in</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.reference}</td>
                      <td>
                        {r.fullName}
                        <small className="admin-subtle">{r.institution}</small>
                      </td>
                      <td>{r.category}</td>
                      <td className="tnum">{money(r.amount, r.currency)}</td>
                      <td>
                        <span className={`pill-status ${r.status.toLowerCase()}`}>{r.status}</span>
                      </td>
                      <td>{r.listPublicly ? "Yes" : "No"}</td>
                      <td>
                        <label className="check-in">
                          <input
                            type="checkbox"
                            checked={r.attended}
                            disabled={r.status !== "PAID"}
                            onChange={(e) => setAttended(r, e.target.checked)}
                          />
                          {r.attended ? "Present" : "Mark present"}
                        </label>
                      </td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="admin-empty">
                        No registrations yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "verification" && (
            <>
              <p className="admin-note">
                Student claims that could not be cleared automatically, because the address given is
                not on a recognised academic domain. Check the student number against the
                institution before approving. Rejecting does not cancel the registration: the
                delegate pays the difference at the desk.
              </p>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Name</th>
                      <th>Institution</th>
                      <th>Student number</th>
                      <th>Institutional email</th>
                      <th>Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations
                      .filter((r) => r.verification !== "NOT_REQUIRED")
                      .map((r) => (
                        <tr key={r.id}>
                          <td className="mono">{r.reference}</td>
                          <td>{r.fullName}</td>
                          <td>{r.institution}</td>
                          <td className="mono">{r.studentIdNumber ?? "—"}</td>
                          <td>{r.studentInstitutionEmail ?? "—"}</td>
                          <td>
                            <select
                              value={r.verification}
                              aria-label={`Verification for ${r.reference}`}
                              onChange={(e) =>
                                setVerification(
                                  r.id,
                                  e.target.value as RegistrationRow["verification"]
                                )
                              }
                            >
                              <option value="PENDING">Waiting</option>
                              <option value="VERIFIED">Verified</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    {registrations.filter((r) => r.verification !== "NOT_REQUIRED").length === 0 && (
                      <tr>
                        <td colSpan={6} className="admin-empty">
                          No student registrations yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "sponsors" && (
            <>
              <p className="admin-note">
                Nothing reaches the public sponsor wall until both the status is Paid or Confirmed
                and &ldquo;Show on site&rdquo; is ticked.
              </p>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Organisation</th>
                      <th>Tier</th>
                      <th>Amount</th>
                      <th>Logo</th>
                      <th>Status</th>
                      <th>Show on site</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sponsors.map((s) => (
                      <tr key={s.id}>
                        <td className="mono">{s.reference}</td>
                        <td>
                          {s.organisation}
                          <small className="admin-subtle">{s.contactName}</small>
                        </td>
                        <td>{s.tier}</td>
                        <td className="tnum">{money(s.amount, s.currency)}</td>
                        <td>{s.hasLogo ? "Yes" : "Not sent"}</td>
                        <td>
                          <select
                            value={s.status}
                            aria-label={`Status for ${s.reference}`}
                            onChange={(e) =>
                              updateSponsor(s.id, { status: e.target.value as PartnerStatus })
                            }
                          >
                            {PARTNER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={s.displayOnSite}
                            aria-label={`Show ${s.organisation} on the site`}
                            onChange={(e) => updateSponsor(s.id, { displayOnSite: e.target.checked })}
                          />
                        </td>
                      </tr>
                    ))}
                    {sponsors.length === 0 && (
                      <tr>
                        <td colSpan={7} className="admin-empty">
                          No sponsorship applications yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "exhibitors" && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Organisation</th>
                    <th>Package</th>
                    <th>Amount</th>
                    <th>Stand</th>
                    <th>Status</th>
                    <th>Show on site</th>
                  </tr>
                </thead>
                <tbody>
                  {exhibitors.map((e) => (
                    <tr key={e.id}>
                      <td className="mono">{e.reference}</td>
                      <td>
                        {e.organisation}
                        <small className="admin-subtle">{e.contactName}</small>
                      </td>
                      <td>{e.packageKey}</td>
                      <td className="tnum">{money(e.amount, e.currency)}</td>
                      <td>
                        <input
                          type="text"
                          className="mono stand-input"
                          defaultValue={e.standNumber ?? ""}
                          placeholder="A12"
                          maxLength={20}
                          aria-label={`Stand number for ${e.organisation}`}
                          onBlur={(event) =>
                            updateExhibitor(e.id, { standNumber: event.target.value || null })
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={e.status}
                          aria-label={`Status for ${e.reference}`}
                          onChange={(event) =>
                            updateExhibitor(e.id, { status: event.target.value as PartnerStatus })
                          }
                        >
                          {PARTNER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={e.displayOnSite}
                          aria-label={`Show ${e.organisation} in the directory`}
                          onChange={(event) =>
                            updateExhibitor(e.id, { displayOnSite: event.target.checked })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                  {exhibitors.length === 0 && (
                    <tr>
                      <td colSpan={7} className="admin-empty">
                        No exhibition applications yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="admin-actions">
            <a className="btn ghost small" href="/api/admin/export?type=submissions">
              Export abstracts
            </a>
            <a className="btn ghost small" href="/api/admin/export?type=registrations">
              Export registrations
            </a>
            <a className="btn ghost small" href="/api/admin/export?type=sponsors">
              Export sponsors
            </a>
            <a className="btn ghost small" href="/api/admin/export?type=exhibitors">
              Export exhibitors
            </a>
            <a className="btn ghost small" href="/api/admin/export?type=certificates">
              Export certificates
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
