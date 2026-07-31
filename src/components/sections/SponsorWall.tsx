import Link from "next/link";
import Image from "next/image";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { SPONSOR_TIERS, SPONSOR_TIER_ORDER, type SponsorTier } from "@/lib/sponsorship";

// The public sponsor wall.
//
// Sponsors appear here as they confirm, grouped by tier, with the higher tiers
// given more room. Nothing is displayed until the Secretariat has both
// recorded payment and ticked `displayOnSite`, so an unpaid application or a
// logo nobody has looked at yet never reaches the public page.

export interface WallSponsor {
  id: string;
  organisation: string;
  tier: string;
  websiteUrl: string | null;
  logoUrl: string | null;
}

export function SponsorWall({
  sponsors,
  heading = "Our sponsors",
  showCta = true,
}: {
  sponsors: WallSponsor[];
  heading?: string;
  showCta?: boolean;
}) {
  // Sponsors are stored with the tier's display label, so group on that.
  const byTier = SPONSOR_TIER_ORDER.map((key) => ({
    key,
    definition: SPONSOR_TIERS[key],
    members: sponsors.filter((s) => s.tier === SPONSOR_TIERS[key].label),
  })).filter((group) => group.members.length > 0);

  return (
    <section id="sponsor-wall">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Supported by</div>
          <h2>{heading}</h2>
          <p>
            The Annual Research Conference and Fair is made possible by organisations that back
            Nigerian research. Their support pays for the venue, the research fair, the student
            paper prizes and the delegate bursaries.
          </p>
        </div>

        {byTier.length === 0 ? (
          <div className="sponsor-empty">
            <AcademicIcon name="handshake" size={34} />
            <div>
              <h3>Sponsors for the {"19th"} edition are being confirmed</h3>
              <p>
                Confirmed partners appear here as they sign, from headline partners through to
                departments and alumni supporting a single session. If your organisation would like
                to be among them, the tiers and the application form are one click away.
              </p>
              {showCta && (
                <Link className="btn solid small" href="/sponsors#apply">
                  Become a sponsor
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="sponsor-tiers">
            {byTier.map((group) => (
              <div className="sponsor-tier-row" key={group.key}>
                <div className="sponsor-tier-label">
                  <AcademicIcon name={group.definition.icon} size={18} />
                  <span>{group.definition.label}</span>
                </div>
                <ul className={`sponsor-logos scale-${group.definition.logoScale}`}>
                  {group.members.map((sponsor) => (
                    <li key={sponsor.id}>
                      <SponsorMark sponsor={sponsor} tier={group.key} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {showCta && byTier.length > 0 && (
          <div className="sponsor-wall-cta">
            <Link className="btn ghost" href="/sponsors#apply">
              Become a sponsor
            </Link>
            <Link className="btn ghost" href="/exhibit">
              Take an exhibition stand
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function SponsorMark({ sponsor, tier }: { sponsor: WallSponsor; tier: SponsorTier }) {
  const height = SPONSOR_TIERS[tier].logoScale * 28;

  const mark = sponsor.logoUrl ? (
    <Image
      src={sponsor.logoUrl}
      alt={sponsor.organisation}
      width={height * 4}
      height={height}
      style={{ height: `${height}px`, width: "auto", objectFit: "contain" }}
    />
  ) : (
    // A sponsor who has not sent artwork still gets their name up.
    <span className="sponsor-wordmark">{sponsor.organisation}</span>
  );

  if (!sponsor.websiteUrl) return mark;

  return (
    <a href={sponsor.websiteUrl} target="_blank" rel="noreferrer noopener sponsored">
      {mark}
    </a>
  );
}
