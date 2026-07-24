import { AcademicVine } from "@/components/AcademicVine";

const TRACKS = [
  {
    roman: "I",
    title: "Cultural Heritage, Human Rights, Humanities and Sustainable Development",
    body: "Indigenous knowledge systems, rights based approaches and the humanities in service of inclusive development.",
  },
  {
    roman: "II",
    title: "Biotechnology and Genomic Innovations for Food and Health Security",
    body: "Applied genomics, crop science and biotechnology addressing nutrition and disease burden.",
  },
  {
    roman: "III",
    title: "AI, Data Science, Cybersecurity and Clean Tech Innovation",
    body: "Computational and digital approaches to infrastructure, information security and low carbon technology.",
  },
  {
    roman: "IV",
    title: "Leadership and Policy Strategies for Sustainable Development",
    body: "Governance frameworks and institutional leadership models aligned to the Sustainable Development Goals.",
  },
  {
    roman: "V",
    title: "Public Health, Drug Discovery, Therapeutics and Global Preparedness",
    body: "Pharmaceutical research, epidemiology and health systems readiness for emerging threats.",
  },
  {
    roman: "VI",
    title: "Transformative Education and Capacity Building for Future Sustainability",
    body: "Pedagogical innovation and skills development for a changing labour market.",
  },
  {
    roman: "VII",
    title: "Smart Cities, Human Centered Urban Design and Environmental Resilience",
    body: "Urban planning, housing and infrastructure that withstand climate and population pressure.",
  },
  {
    roman: "VIII",
    title: "Social Policy and Human Security in Emerging Economies",
    body: "Social protection, conflict prevention and human security frameworks in developing economies.",
  },
];

export function Subthemes() {
  return (
    <section id="subthemes">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">II. Subthemes</div>
          <h2>Eight tracks for the call for papers</h2>
          <p>
            Every submission is assigned to one track at the point of submission. Reviewers and session
            chairs are organised along these same lines, so choose the track closest to your contribution.
          </p>
        </div>
        <div className="subtheme-layout">
          <AcademicVine variant="vertical" className="vine-vertical subtheme-rail" />
          <div className="index-list" style={{ flex: 1 }}>
            {TRACKS.map((track) => (
              <div className="index-row" key={track.roman}>
                <div className="roman">{track.roman}</div>
                <div>
                  <h3>{track.title}</h3>
                  <p>{track.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const SUBTHEME_OPTIONS = TRACKS.map((t) => `${t.roman}. ${t.title}`);
