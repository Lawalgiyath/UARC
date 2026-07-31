import Link from "next/link";
import { IconMegaphone } from "@/components/icons/AcademicIcons";
import { breakingNews, CRC } from "@/lib/conference";

// The announcement band that opens the body of the home page.
//
// Two things were asked of it: the Central Research Committee has to be
// visible, and the news itself has to read as news. So the CRC sits in the
// rule at the top as the body speaking, and the headline below it is the
// announcement, not a slogan.

export function BreakingNewsBand() {
  const item = breakingNews();
  if (!item) return null;

  return (
    <aside className="news-band" aria-label="Conference announcement">
      <div className="wrap">
        <div className="news-rule">
          <span className="news-crc">
            <strong className="mono">{CRC.abbr}</strong>
            <span>
              {CRC.name}, {CRC.parent}
            </span>
          </span>
          <span className="news-flag">
            <IconMegaphone size={15} />
            Breaking news
          </span>
        </div>

        <h2 className="news-headline">{item.headline}</h2>
        <p className="news-body">{item.body}</p>

        {item.href && (
          <Link className="news-cta" href={item.href}>
            {item.hrefLabel || "Read more"} <span aria-hidden="true">&rarr;</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
