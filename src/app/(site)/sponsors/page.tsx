import type { Metadata } from "next";
import { SponsorWall } from "@/components/sections/SponsorWall";
import { SponsorApply } from "@/components/sections/SponsorApply";
import { PhotoFrame } from "@/components/PhotoFrame";
import { IconPattern } from "@/components/IconPattern";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { getPublicSponsors } from "@/lib/publicData";
import { SPONSOR_TIERS, SPONSOR_TIER_ORDER } from "@/lib/sponsorship";
import { CAMPUS_PHOTOS } from "@/lib/media";
import { CONFERENCE, CONTACT } from "@/lib/conference";

export const metadata: Metadata = {
  title: "Sponsorship | 19th UNILAG Annual Research Conference",
  description:
    "Sponsorship tiers for the 19th UNILAG Annual Research Conference, what each tier includes, and how to apply and pay online.",
};

export const dynamic = "force-dynamic";

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount.toLocaleString("en-US")}` : `₦${amount.toLocaleString("en-NG")}`;
}

export default async function SponsorsPage() {
  const sponsors = await getPublicSponsors();

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Partner with us</div>
          <h1 className="page-title">Sponsorship</h1>
          <p className="page-lede">
            The {CONFERENCE.edition} {CONFERENCE.name} brings faculty, postgraduate researchers,
            policymakers and industry into one hall for three days. Sponsorship puts your
            organisation in front of that room, and pays for the parts of the conference that
            delegate fees do not reach.
          </p>
        </div>
      </section>

      <SponsorWall sponsors={sponsors} heading="Confirmed for this edition" showCta={false} />

      <section className="tier-section">
        <IconPattern variant="dense" opacity={0.05} className="section-pattern" />
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">What is available</div>
            <h2>Five tiers</h2>
            <p>
              Every tier includes a place on the sponsor wall, in the conference programme and in the
              book of abstracts. The tiers differ in how prominent that place is, how many delegate
              passes come with it, and whether you get the podium.
            </p>
          </div>

          <div className="tier-grid">
            {SPONSOR_TIER_ORDER.map((key) => {
              const tier = SPONSOR_TIERS[key];
              return (
                <article className="tier-card" key={key}>
                  <header>
                    <span className="tier-card-icon">
                      <AcademicIcon name={tier.icon} size={26} />
                    </span>
                    <h3>{tier.label}</h3>
                    <div className="tier-card-amount tnum">
                      {tier.custom
                        ? `from ${formatAmount(tier.amount, tier.currency)}`
                        : formatAmount(tier.amount, tier.currency)}
                    </div>
                  </header>
                  <p className="tier-card-summary">{tier.summary}</p>
                  <ul className="tick-list">
                    {tier.benefits.map((benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                  <div className="tier-card-foot">
                    {tier.custom ? "At least " : ""}
                    {tier.passes} complimentary delegate {tier.passes === 1 ? "pass" : "passes"}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <PhotoFrame
        photo={CAMPUS_PHOTOS.loveGarden}
        caption="The Love Garden, University of Lagos."
        className="photo-band"
        sizes="100vw"
        maxHeight="22rem"
      />

      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Apply</div>
            <h2>Become a sponsor</h2>
            <p>
              Choose a tier, tell us who to invoice, and either pay online now or ask for an invoice
              for your finance office. Applications are acknowledged the same day; sponsorship is
              confirmed, and your logo goes up, once payment clears.
            </p>
          </div>

          <SponsorApply />

          <p className="archive-note">
            Sponsorship in kind, bursary funding for student delegates, and named prizes for the
            research fair are all welcome and are arranged directly. Write to{" "}
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or call{" "}
            <a href={`tel:${CONTACT.phones[0].e164}`}>{CONTACT.phones[0].display}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
