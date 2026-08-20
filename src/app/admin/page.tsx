import { db } from "@/lib/db";
import { getAbstractDeadline } from "@/lib/settings";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

// Reads live submissions, registrations, partners and certificates for an
// authenticated Secretariat user; it must never be cached or built as a
// static page.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [submissions, registrations, sponsors, exhibitors, certificateCount, deadline] =
    await Promise.all([
      db.submission.findMany({ orderBy: { createdAt: "desc" } }),
      db.registration.findMany({ orderBy: { createdAt: "desc" } }),
      db.sponsor.findMany({ orderBy: { createdAt: "desc" } }),
      db.exhibitor.findMany({ orderBy: { createdAt: "desc" } }),
      db.certificate.count({ where: { revokedAt: null } }),
      getAbstractDeadline(),
    ]);

  // Anyone who has declared a payment, from all three registers, oldest first
  // so the queue is worked in the order people sent things in. Those still
  // waiting on a decision come first.
  const payments = [
    ...registrations
      .filter((r) => r.rrr !== null)
      .map((r) => ({
        kind: "registration" as const,
        id: r.id,
        reference: r.reference,
        payer: r.fullName,
        detail: `${r.category}, ${r.institution}`,
        email: r.email,
        amount: r.amount,
        currency: r.currency,
        status: r.status as string,
        rrr: r.rrr,
        receiptUrl: r.receiptUrl,
        declaredAt: r.declaredAt?.toISOString() ?? null,
        paymentNote: r.paymentNote,
      })),
    ...sponsors
      .filter((s) => s.rrr !== null)
      .map((s) => ({
        kind: "sponsor" as const,
        id: s.id,
        reference: s.reference,
        payer: s.contactName,
        detail: `${s.tier}, ${s.organisation}`,
        email: s.email,
        amount: s.amount,
        currency: s.currency,
        status: s.status as string,
        rrr: s.rrr,
        receiptUrl: s.receiptUrl,
        declaredAt: s.declaredAt?.toISOString() ?? null,
        paymentNote: s.paymentNote,
      })),
    ...exhibitors
      .filter((e) => e.rrr !== null)
      .map((e) => ({
        kind: "exhibitor" as const,
        id: e.id,
        reference: e.reference,
        payer: e.contactName,
        detail: `${e.packageKey}, ${e.organisation}`,
        email: e.email,
        amount: e.amount,
        currency: e.currency,
        status: e.status as string,
        rrr: e.rrr,
        receiptUrl: e.receiptUrl,
        declaredAt: e.declaredAt?.toISOString() ?? null,
        paymentNote: e.paymentNote,
      })),
  ].sort((a, b) => {
    const aWaiting = a.status === "DECLARED" ? 0 : 1;
    const bWaiting = b.status === "DECLARED" ? 0 : 1;
    if (aWaiting !== bWaiting) return aWaiting - bWaiting;
    return (a.declaredAt ?? "").localeCompare(b.declaredAt ?? "");
  });

  return (
    <AdminDashboard
      initialSubmissions={submissions.map((s) => ({
        id: s.id,
        reference: s.reference,
        authorName: s.authorName,
        track: s.track,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      }))}
      initialRegistrations={registrations.map((r) => ({
        id: r.id,
        reference: r.reference,
        fullName: r.fullName,
        email: r.email,
        institution: r.institution,
        category: r.category,
        amount: r.amount,
        currency: r.currency,
        status: r.status,
        verification: r.verification,
        studentIdNumber: r.studentIdNumber,
        studentInstitutionEmail: r.studentInstitutionEmail,
        attended: r.attended,
        listPublicly: r.listPublicly,
        createdAt: r.createdAt.toISOString(),
      }))}
      initialSponsors={sponsors.map((s) => ({
        id: s.id,
        reference: s.reference,
        organisation: s.organisation,
        contactName: s.contactName,
        tier: s.tier,
        amount: s.amount,
        currency: s.currency,
        status: s.status,
        displayOnSite: s.displayOnSite,
        hasLogo: s.logoUrl !== null,
      }))}
      initialExhibitors={exhibitors.map((e) => ({
        id: e.id,
        reference: e.reference,
        organisation: e.organisation,
        contactName: e.contactName,
        packageKey: e.packageKey,
        amount: e.amount,
        currency: e.currency,
        status: e.status,
        standNumber: e.standNumber,
        displayOnSite: e.displayOnSite,
      }))}
      initialPayments={payments}
      certificateCount={certificateCount}
      abstractDeadlineIso={deadline.toISOString()}
    />
  );
}
