import { db } from "@/lib/db";
import { signedDeliveryUrl, resourceTypeFromUrl, formatFromUrl } from "@/lib/cloudinary";
import { getAbstractDeadline } from "@/lib/settings";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

// Reads live submissions, registrations, partners and certificates for an
// authenticated Secretariat user; it must never be cached or built as a
// static page.
export const dynamic = "force-dynamic";

/**
 * Receipts are uploaded as private, so the stored URL will not open on its
 * own. The Secretariat's copy is signed here, on the server, where the API
 * secret lives. A receipt that predates this change was uploaded publicly and
 * still has a working URL, so those are passed through untouched rather than
 * signed into a 404.
 */
function viewableReceipt(url: string | null, publicId: string | null): string | null {
  if (!url) return null;
  if (!publicId || !url.includes("/authenticated/")) return url;
  try {
    return signedDeliveryUrl({
      publicId,
      resourceType: resourceTypeFromUrl(url),
      format: formatFromUrl(url),
    });
  } catch {
    // No Cloudinary secret configured: better to show the raw link than none.
    return url;
  }
}

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
        receiptUrl: viewableReceipt(r.receiptUrl, r.receiptPublicId),
        declaredAt: r.declaredAt?.toISOString() ?? null,
        paymentNote: r.paymentNote,
        declaredAmount: r.declaredAmount,
        paidOn: r.paidOn?.toISOString() ?? null,
        paidVia: r.paidVia,
        checkFlags: r.checkFlags,
        checkVerdict: r.checkVerdict,
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
        receiptUrl: viewableReceipt(s.receiptUrl, s.receiptPublicId),
        declaredAt: s.declaredAt?.toISOString() ?? null,
        paymentNote: s.paymentNote,
        declaredAmount: s.declaredAmount,
        paidOn: s.paidOn?.toISOString() ?? null,
        paidVia: s.paidVia,
        checkFlags: s.checkFlags,
        checkVerdict: s.checkVerdict,
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
        receiptUrl: viewableReceipt(e.receiptUrl, e.receiptPublicId),
        declaredAt: e.declaredAt?.toISOString() ?? null,
        paymentNote: e.paymentNote,
        declaredAmount: e.declaredAmount,
        paidOn: e.paidOn?.toISOString() ?? null,
        paidVia: e.paidVia,
        checkFlags: e.checkFlags,
        checkVerdict: e.checkVerdict,
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
