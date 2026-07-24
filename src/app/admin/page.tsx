import { db } from "@/lib/db";
import { getAbstractDeadline } from "@/lib/settings";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

// Reads live submissions/registrations for an authenticated Secretariat
// user; it must never be cached or built as a static page.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [submissions, registrations, deadline] = await Promise.all([
    db.submission.findMany({ orderBy: { createdAt: "desc" } }),
    db.registration.findMany({ orderBy: { createdAt: "desc" } }),
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
        category: r.category,
        amount: r.amount,
        currency: r.currency,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      }))}
      abstractDeadlineIso={deadline.toISOString()}
    />
  );
}
