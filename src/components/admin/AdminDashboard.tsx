"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UnilagLogo } from "@/components/UnilagLogo";

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
  category: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
}

export function AdminDashboard({
  initialSubmissions,
  initialRegistrations,
  abstractDeadlineIso,
}: {
  initialSubmissions: SubmissionRow[];
  initialRegistrations: RegistrationRow[];
  abstractDeadlineIso: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"submissions" | "registrations">("submissions");
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [registrations] = useState(initialRegistrations);
  const [deadline, setDeadline] = useState(abstractDeadlineIso);
  const [deadlineDraft, setDeadlineDraft] = useState(abstractDeadlineIso.slice(0, 16));
  const [savingDeadline, setSavingDeadline] = useState(false);

  const stats = useMemo(() => {
    const paid = registrations.filter((r) => r.status === "PAID");
    const revenueNGN = paid.filter((r) => r.currency === "NGN").reduce((sum, r) => sum + r.amount, 0);
    const revenueUSD = paid.filter((r) => r.currency === "USD").reduce((sum, r) => sum + r.amount, 0);
    const daysLeft = Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
    return {
      totalAbstracts: submissions.length,
      totalPaid: paid.length,
      revenueNGN,
      revenueUSD,
      daysLeft,
    };
  }, [submissions, registrations, deadline]);

  async function updateStatus(id: string, status: SubmissionRow["status"]) {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <UnilagLogo height={36} />
              <div>
                <div style={{ fontFamily: "'Iowan Old Style', Palatino, Georgia, serif", fontWeight: 600 }}>Secretariat Dashboard</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>19th Annual Research Conference</div>
              </div>
            </div>
            <button className="btn ghost small" onClick={logout} type="button">Sign out</button>
          </div>

          <div className="admin-stats">
            <div><div className="n tnum">{stats.totalAbstracts}</div><div className="l">Abstracts submitted</div></div>
            <div><div className="n tnum">{stats.totalPaid}</div><div className="l">Registrations paid</div></div>
            <div><div className="n tnum">&#8358;{stats.revenueNGN.toLocaleString("en-NG")}</div><div className="l">Revenue, naira</div></div>
            <div><div className="n tnum">${stats.revenueUSD}</div><div className="l">Revenue, dollars</div></div>
          </div>

          <div className="panel" style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="deadline">Abstract submission deadline</label>
                <input
                  id="deadline"
                  type="datetime-local"
                  value={deadlineDraft}
                  onChange={(e) => setDeadlineDraft(e.target.value)}
                />
                <span className="hint">{stats.daysLeft} day(s) remaining. Changing this immediately opens or closes the public portal.</span>
              </div>
              <button className="btn solid small" onClick={saveDeadline} disabled={savingDeadline} type="button">
                {savingDeadline ? "Saving..." : "Extend Deadline"}
              </button>
            </div>
          </div>

          <div className="admin-tabs">
            <a className={tab === "submissions" ? "active" : ""} onClick={() => setTab("submissions")}>Abstracts</a>
            <a className={tab === "registrations" ? "active" : ""} onClick={() => setTab("registrations")}>Registrations</a>
          </div>

          {tab === "submissions" && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Reference</th><th>Author</th><th>Track</th><th>Status</th></tr>
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
                          onChange={(e) => updateStatus(s.id, e.target.value as SubmissionRow["status"])}
                          style={{ fontSize: "0.8125rem", padding: "0.3rem 0.5rem" }}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr><td colSpan={4} style={{ color: "var(--text-muted)" }}>No abstracts submitted yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "registrations" && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Reference</th><th>Name</th><th>Category</th><th>Amount</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.reference}</td>
                      <td>{r.fullName}</td>
                      <td>{r.category}</td>
                      <td className="tnum">{r.currency === "USD" ? "$" : "₦"}{r.amount.toLocaleString("en-NG")}</td>
                      <td><span className={`pill-status ${r.status.toLowerCase()}`}>{r.status}</span></td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr><td colSpan={5} style={{ color: "var(--text-muted)" }}>No registrations yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="admin-actions">
            <a className="btn ghost small" href={`/api/admin/export?type=${tab}`}>Export CSV</a>
          </div>
        </div>
      </section>
    </main>
  );
}
