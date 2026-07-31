import type { Metadata } from "next";
import Link from "next/link";
import { IconPattern } from "@/components/IconPattern";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { getPublicDelegates, getDelegateCounts } from "@/lib/publicData";
import { CONFERENCE } from "@/lib/conference";

export const metadata: Metadata = {
  title: "Registered Delegates | 19th UNILAG Annual Research Conference",
  description:
    "The names of delegates registered for the 19th UNILAG Annual Research Conference who have chosen to appear publicly.",
};

export const dynamic = "force-dynamic";

export default async function DelegatesPage() {
  const [delegates, counts] = await Promise.all([getPublicDelegates(), getDelegateCounts()]);

  // Grouped by institution: the useful question a delegate asks of this page
  // is "is anyone from my field, or my university, going to be there".
  const byInstitution = new Map<string, typeof delegates>();
  for (const delegate of delegates) {
    const list = byInstitution.get(delegate.institution) ?? [];
    list.push(delegate);
    byInstitution.set(delegate.institution, list);
  }
  const institutions = [...byInstitution.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Who is coming</div>
          <h1 className="page-title">Registered delegates</h1>
          <p className="page-lede">
            Delegates who have completed registration for the {CONFERENCE.edition} edition and have
            asked to be listed publicly. The full register is held by the Secretariat and is not
            published.
          </p>
        </div>
      </section>

      <section className="delegate-stats-section">
        <IconPattern variant="dense" opacity={0.05} className="section-pattern" />
        <div className="wrap">
          <div className="stat-row">
            <div>
              <div className="n tnum">{counts.total}</div>
              <div className="l">Registrations completed</div>
            </div>
            <div>
              <div className="n tnum">{counts.institutions}</div>
              <div className="l">Institutions represented</div>
            </div>
            <div>
              <div className="n tnum">{counts.listed}</div>
              <div className="l">Delegates listed publicly</div>
            </div>
            <div>
              <div className="n tnum">8</div>
              <div className="l">Subtheme tracks running</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          {delegates.length === 0 ? (
            <div className="sponsor-empty">
              <AcademicIcon name="users" size={34} />
              <div>
                <h2>No delegates listed yet</h2>
                <p>
                  Names appear here as delegates register and opt in. Registration is open now, and
                  the box to appear on this page is on the registration form: it is off unless you
                  tick it, and the Secretariat can add or remove you at any time on request.
                </p>
                <Link className="btn solid small" href="/register">
                  Register for the conference
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="section-head">
                <div className="eyebrow">By institution</div>
                <h2>
                  {counts.listed} listed {counts.listed === 1 ? "delegate" : "delegates"} from{" "}
                  {institutions.length} {institutions.length === 1 ? "institution" : "institutions"}
                </h2>
              </div>

              <div className="delegate-groups">
                {institutions.map(([institution, members]) => (
                  <div className="delegate-group" key={institution}>
                    <h3>
                      {institution} <span className="mono">{members.length}</span>
                    </h3>
                    <ul>
                      {members.map((member) => (
                        <li key={member.id}>
                          {member.fullName}
                          {member.country && <span className="delegate-country">{member.country}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="archive-note">
            This list carries names, institutions and countries only. No email address, phone
            number, fee category or amount paid is published here or anywhere else on the site. To
            be added to or removed from the list, write to the Secretariat quoting your registration
            reference.
          </p>
        </div>
      </section>
    </>
  );
}
