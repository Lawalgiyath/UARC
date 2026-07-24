import Link from "next/link";
import { CAMPUS_PHOTOS } from "@/lib/media";

export function SiteFooter() {
  const credits = Object.values(CAMPUS_PHOTOS);

  return (
    <footer className="site" id="contact">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <h4>University of Lagos</h4>
            <p>19th Annual Research Conference. Sustainable Frontiers: integrating systems for food security, health, housing and humanity for combating global challenges.</p>
            <p>Jelili Adebisi Omotola Hall, University of Lagos, Akoka, Yaba, Lagos.</p>
          </div>
          <div>
            <h4>Conference</h4>
            <Link href="/about">Theme</Link>
            <Link href="/about#subthemes">Subthemes</Link>
            <Link href="/dates-and-fees">Dates &amp; fees</Link>
            <Link href="/committee">Committee</Link>
          </div>
          <div>
            <h4>Take part</h4>
            <Link href="/submit">Submit an abstract</Link>
            <Link href="/register">Register and pay</Link>
            <Link href="/past-editions">Past editions</Link>
            <Link href="/faq">FAQ</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="mailto:unilagconf@unilag.edu.ng">unilagconf@unilag.edu.ng</a>
            <a href="tel:+2347042015134">+234 704 201 5134</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} University of Lagos. All abstracts accepted for oral presentation will be considered for publication in the Unilag Journals.</span>
        </div>
        <p className="photo-credit-list" style={{ marginTop: "1.25rem" }}>
          Campus photography via Wikimedia Commons, licensed CC BY-SA 4.0:{" "}
          {credits.map((c, i) => (
            <span key={c.sourceUrl}>
              <a href={c.sourceUrl}>{c.credit}</a>
              {i < credits.length - 1 ? ", " : ". "}
            </span>
          ))}
          Logo and crest courtesy of the University of Lagos.
        </p>
      </div>
    </footer>
  );
}
