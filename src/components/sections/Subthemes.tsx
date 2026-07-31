import { AcademicVine } from "@/components/AcademicVine";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { TRACKS } from "@/lib/tracks";

// The eight tracks in full.
//
// The Secretariat asked for "more info for each theme", so each track now
// carries a paragraph on what it is actually looking for, the topic areas that
// belong in it, and the disciplines the panel expects to hear from — enough
// for an author to tell, without writing to ask, whether their paper belongs
// here or in the track next door.

export { SUBTHEME_OPTIONS } from "@/lib/tracks";

export function Subthemes() {
  return (
    <section id="subthemes">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">II. Subthemes</div>
          <h2>Eight tracks for the call for papers</h2>
          <p>
            Every submission is assigned to one track at the point of submission. Reviewers and
            session chairs are organised along these same lines, so choose the track closest to your
            contribution. If a paper genuinely spans two, pick the one whose methods you used and say
            so in the abstract.
          </p>
        </div>

        <div className="subtheme-layout">
          <AcademicVine variant="vertical" className="vine-vertical subtheme-rail" />

          <div className="track-list">
            {TRACKS.map((track) => (
              <article className="track-entry" id={`track-${track.roman}`} key={track.roman}>
                <header>
                  <span className="track-entry-icon">
                    <AcademicIcon name={track.icon} size={28} />
                  </span>
                  <div>
                    <div className="track-entry-roman mono">Track {track.roman}</div>
                    <h3>{track.title}</h3>
                  </div>
                </header>

                <p className="track-entry-detail">{track.detail}</p>

                <div className="track-entry-meta">
                  <div>
                    <h4>Topic areas</h4>
                    <ul className="topic-list">
                      {track.topics.map((topic) => (
                        <li key={topic}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>Who the panel expects</h4>
                    <p>{track.disciplines}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
