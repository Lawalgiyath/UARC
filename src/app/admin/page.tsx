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
      certificateCount={certificateCount}
      abstractDeadlineIso={deadline.toISOString()}
    />
  );
}
