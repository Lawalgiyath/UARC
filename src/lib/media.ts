// Real University of Lagos photography, hotlinked directly from Wikimedia
// Commons rather than mirrored on our own storage, per Commons' own guidance
// for automated use (their thumbnail endpoint is the sanctioned way to do
// this, not bulk-downloading originals). All entries are CC BY-SA 4.0 and the
// required attribution is rendered in the site footer.
//
// Swapping in official university photography later is a one-file change:
// drop the file in `public/`, replace `src` with `/your-photo.jpg`, and update
// `width`, `height` and `credit`. Nothing else in the site reads image paths.

export interface CampusPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: string;
  sourceUrl: string;
  /**
   * Optional framing. `PhotoFrame` renders the image into a box of this
   * aspect ratio and anchors it at `objectPosition`, which is how we keep
   * distractions (bins, parked cars, fencing) out of frame without editing
   * anyone's licensed photograph.
   */
  crop?: { aspectRatio: number; objectPosition: string };
}

function commonsThumb(hashPath: string, fileName: string, width: 960 | 1280 | 1920) {
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${hashPath}/${fileName}/${width}px-${fileName}`;
}

export const CAMPUS_PHOTOS = {
  // The face of the university: the crest and wordmark are legible, which is
  // why this one leads the site.
  entranceGate: {
    src: commonsThumb("b/b4", "University_of_Lagos_entrance_gate.jpg", 1920),
    width: 1920,
    height: 843,
    alt: "The main entrance gate of the University of Lagos, carrying the university crest and wordmark",
    credit: "Atibrarian",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:University_of_Lagos_entrance_gate.jpg",
  },
  senateBuilding: {
    src: commonsThumb("f/fa", "Unilag_Senate_Building.jpg", 1280),
    width: 1280,
    height: 1707,
    alt: "The Senate Building at the University of Lagos seen from its base",
    credit: "Solasly",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Unilag_Senate_Building.jpg",
  },
  senateArchitectural: {
    src: commonsThumb(
      "3/31",
      "Architectural_view_of_the_senate_building_University_of_lagos%2C_Nigeria.jpg",
      1920
    ),
    width: 1920,
    height: 1280,
    alt: "Architectural view of the Senate Building, University of Lagos",
    credit: "Johnbrainyvisuals",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Architectural_view_of_the_senate_building_University_of_lagos,_Nigeria.jpg",
  },
  library: {
    src: commonsThumb("2/22", "Unilag_Library.jpg", 1280),
    width: 1280,
    height: 960,
    alt: "The University of Lagos library building",
    credit: "Abiolakintrunde",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Unilag_Library.jpg",
    // The original frame has a refuse bin in the bottom-left corner. Holding
    // the top 60% of the frame keeps the whole library façade, the entrance
    // steps and the murals, and drops the bin entirely.
    crop: { aspectRatio: 2.22, objectPosition: "center top" },
  },
  loveGarden: {
    src: commonsThumb("7/7f", "Love_Garden.jpg", 1920),
    width: 1920,
    height: 1280,
    alt: "Students reading and talking under the trees in the Love Garden, University of Lagos",
    credit: "Bolu90",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Love_Garden.jpg",
    crop: { aspectRatio: 2.1, objectPosition: "62% center" },
  },
  lagoonFountain: {
    src: commonsThumb("6/6b", "Unilag_Lagoon_Front_Fountain.jpg", 1920),
    width: 1920,
    height: 1440,
    alt: "The lagoon front fountain on the University of Lagos campus",
    credit: "Abiolakintrunde",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Unilag_Lagoon_Front_Fountain.jpg",
  },
  jpClarkCenter: {
    src: commonsThumb("0/0d", "J._P_Clark_Center%2C_University_of_Lagos.jpg", 960),
    width: 960,
    height: 1280,
    alt: "The J. P. Clark Center at the University of Lagos",
    credit: "Official alade",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:J._P_Clark_Center,_University_of_Lagos.jpg",
  },
  sofoluwePark: {
    src: commonsThumb("1/14", "Adetokunbo_Sofoluwe_Park%2C_Unilag.jpg", 1280),
    width: 1280,
    height: 960,
    alt: "Adetokunbo Sofoluwe Park on the University of Lagos campus",
    credit: "Abiolakintrunde",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Adetokunbo_Sofoluwe_Park,_Unilag.jpg",
  },
  confuciusInstitute: {
    src: commonsThumb("4/49", "Confucius_Institute%2C_University_of_Lagos.jpg", 1920),
    width: 1920,
    height: 1440,
    alt: "The Confucius Institute at the University of Lagos",
    credit: "Atibrarian",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Confucius_Institute,_University_of_Lagos.jpg",
  },
} satisfies Record<string, CampusPhoto>;

// Official university logo, published by UNILAG itself.
// Source: https://unilag.edu.ng/official-university-logo-and-sixtieth-anniversary-logo/
export const UNILAG_LOGO = {
  src: "https://unilag.edu.ng/wp-content/uploads/2023/10/UNILAG-Logo-New.png",
  width: 1467,
  height: 591,
  alt: "University of Lagos crest and wordmark",
};
