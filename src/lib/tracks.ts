// The eight subtheme tracks, as published in the university's call for
// abstracts, with the detail the Secretariat asked for: what each track covers,
// the kinds of questions it wants, and who it is looking for. The submission
// form, the subtheme page and the track cards all read from this one list.

import type { AcademicIconName } from "@/components/icons/AcademicIcons";

export interface Track {
  roman: string;
  number: number;
  icon: AcademicIconName;
  title: string;
  /** One line, used where space is tight. */
  body: string;
  /** The fuller description shown on the subthemes page. */
  detail: string;
  /** Concrete subjects that belong in this track. */
  topics: string[];
  /** Which disciplines the panel expects to hear from. */
  disciplines: string;
}

export const TRACKS: Track[] = [
  {
    roman: "I",
    number: 1,
    icon: "laurel",
    title: "Cultural Heritage, Human Rights, Humanities and Sustainable Development",
    body: "Indigenous knowledge systems, rights based approaches and the humanities in service of inclusive development.",
    detail:
      "Development policy that ignores culture tends to fail on contact with the communities it is meant to serve. This track takes heritage, language, history, philosophy and rights seriously as inputs to sustainable development rather than decoration on top of it, and welcomes work that documents indigenous knowledge, tests rights based programme design, or reads the humanities against a live development problem.",
    topics: [
      "Indigenous knowledge systems and their transmission",
      "Cultural heritage preservation, archives and digital humanities",
      "Human rights frameworks in development programming",
      "Language, literature and identity in a changing Lagos",
      "Ethics, religion and the public understanding of science",
    ],
    disciplines: "History, languages, philosophy, law, creative arts, religious studies, anthropology.",
  },
  {
    roman: "II",
    number: 2,
    icon: "dna",
    title: "Biotechnology and Genomic Innovations for Food and Health Security",
    body: "Applied genomics, crop science and biotechnology addressing nutrition and disease burden.",
    detail:
      "Food security and disease burden are increasingly addressed with the same toolkit: sequencing, molecular diagnostics, controlled breeding and bioprocessing. This track wants applied work, including negative results, that moves a Nigerian or wider African food or health problem forward, and is equally interested in the regulatory and biosafety questions that decide whether the science reaches anyone.",
    topics: [
      "Crop improvement, yield resilience and post harvest loss",
      "Genomic surveillance of pathogens and antimicrobial resistance",
      "Molecular diagnostics suited to low resource settings",
      "Food safety, fortification and nutritional biochemistry",
      "Biosafety regulation and public acceptance of biotechnology",
    ],
    disciplines: "Biological sciences, biochemistry, agriculture, veterinary medicine, food science.",
  },
  {
    roman: "III",
    number: 3,
    icon: "chip",
    title: "AI, Data Science, Cybersecurity and Clean Tech Innovation",
    body: "Computational and digital approaches to infrastructure, information security and low carbon technology.",
    detail:
      "The computational track, covering both the building of systems and the study of their consequences. Papers may present models, datasets, security analyses or deployed systems, and the panel is explicitly interested in work grounded in African data and African operating conditions: intermittent power, constrained bandwidth, and datasets that do not look like the ones benchmark models were trained on.",
    topics: [
      "Machine learning applied to health, agriculture, energy or education",
      "Data governance, privacy and algorithmic accountability",
      "Cybersecurity for critical national infrastructure",
      "Renewable generation, storage and grid resilience",
      "Digital public infrastructure and identity systems",
    ],
    disciplines: "Computer science, engineering, mathematics, statistics, information systems.",
  },
  {
    roman: "IV",
    number: 4,
    icon: "scales",
    title: "Leadership and Policy Strategies for Sustainable Development",
    body: "Governance frameworks and institutional leadership models aligned to the Sustainable Development Goals.",
    detail:
      "Why do sound policies fail in implementation? This track examines institutions, incentives and leadership: what makes a ministry, a university, a state government or a firm capable of carrying a long horizon commitment. Evaluations of real programmes, including ones that did not work, are particularly welcome.",
    topics: [
      "Institutional capacity and public sector reform",
      "SDG localisation and measurement at state and local level",
      "Public finance, procurement and accountability",
      "Leadership in universities and research institutions",
      "Regulatory design for emerging industries",
    ],
    disciplines: "Political science, public administration, economics, management, law.",
  },
  {
    roman: "V",
    number: 5,
    icon: "pulse",
    title: "Public Health, Drug Discovery, Therapeutics and Global Preparedness",
    body: "Pharmaceutical research, epidemiology and health systems readiness for emerging threats.",
    detail:
      "From molecule to health system. This track covers drug discovery and natural product chemistry at one end, and epidemiology, health financing and outbreak preparedness at the other, on the argument that a therapeutic that no system can deliver is not yet a solution. Clinical, laboratory and health policy submissions are all in scope.",
    topics: [
      "Drug discovery, natural products and pharmacology",
      "Epidemiology and the burden of non communicable disease",
      "Health systems financing, access and equity",
      "Outbreak preparedness, surveillance and response",
      "Maternal, child and adolescent health",
    ],
    disciplines: "Medicine, pharmacy, dentistry, nursing, public health, chemistry.",
  },
  {
    roman: "VI",
    number: 6,
    icon: "cap",
    title: "Transformative Education and Capacity Building for Future Sustainability",
    body: "Pedagogical innovation and skills development for a changing labour market.",
    detail:
      "Education research with something at stake: what is actually being learned, by whom, and whether it matches the work available. The track covers curriculum, assessment, teacher development, technical and vocational training, and the growing question of what higher education is for when the tools of a profession change faster than its degree programmes.",
    topics: [
      "Curriculum reform and graduate employability",
      "Educational technology and blended delivery at scale",
      "Assessment, quality assurance and learning outcomes",
      "Technical and vocational education and training",
      "Research capacity, supervision and doctoral training",
    ],
    disciplines: "Education, psychology, sociology, educational technology, library and information science.",
  },
  {
    roman: "VII",
    number: 7,
    icon: "city",
    title: "Smart Cities, Human Centered Urban Design and Environmental Resilience",
    body: "Urban planning, housing and infrastructure that withstand climate and population pressure.",
    detail:
      "Lagos is the case study on the university's doorstep: a coastal megacity absorbing growth while the water rises. This track wants work on housing, transport, drainage, waste, coastal defence and urban data, and is as interested in the informal city as in the master planned one.",
    topics: [
      "Affordable housing supply and informal settlement upgrading",
      "Flood risk, drainage and coastal erosion in Lagos",
      "Transport systems, mobility and urban air quality",
      "Building materials, energy efficiency and construction methods",
      "Urban sensing, geospatial data and city analytics",
    ],
    disciplines: "Architecture, urban and regional planning, civil engineering, geography, environmental science.",
  },
  {
    roman: "VIII",
    number: 8,
    icon: "shield",
    title: "Social Policy and Human Security in Emerging Economies",
    body: "Social protection, conflict prevention and human security frameworks in developing economies.",
    detail:
      "Human security in the broad sense: income, food, housing, safety and the social protection systems meant to underwrite them. The track covers poverty and inequality measurement, social protection design, migration, insecurity and conflict prevention, and the informal arrangements people build when formal systems are absent.",
    topics: [
      "Social protection design, targeting and delivery",
      "Poverty, inequality and labour market informality",
      "Migration, displacement and urban integration",
      "Insecurity, policing and community conflict prevention",
      "Gender, disability and inclusion in social policy",
    ],
    disciplines: "Sociology, social work, economics, criminology, gender studies, development studies.",
  },
];

/** The value stored on a submission, and the option shown in the form. */
export const SUBTHEME_OPTIONS = TRACKS.map((t) => `${t.roman}. ${t.title}`);

export function trackByRoman(roman: string): Track | undefined {
  return TRACKS.find((t) => t.roman === roman);
}
