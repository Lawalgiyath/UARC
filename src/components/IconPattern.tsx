// The repeating academic motif.
//
// Rather than dropping single decorative icons here and there, the site uses a
// tiled pattern built from the same glyph family as `AcademicIcons` — a book, a
// laurel, a flask, a quill, an atom and a graduation cap on a staggered grid.
// It sits behind mastheads and feature bands at low opacity, which is what
// carries the "academic" feel across pages without competing with the text.
//
// Pattern ids are derived from the props rather than randomised, so server
// rendering and hydration agree, and two bands with identical settings can
// share one definition without clashing.

const TILE = 200;

/** Glyphs are drawn once here, then referenced into the tile at four offsets. */
const GLYPHS: Record<string, string> = {
  book:
    "M12 6.5C10 5 7.5 4.4 4.5 4.6v12.2c3-.2 5.5.4 7.5 1.9 2-1.5 4.5-2.1 7.5-1.9V4.6c-3-.2-5.5.4-7.5 1.9Z M12 6.5v12.2",
  laurel:
    "M8 21c-3-3.5-3.5-9 0-14 M16 21c3-3.5 3.5-9 0-14 M8 16c-2.2.2-3.6-.8-4.2-2.6 M8 11.5c-2.2.2-3.6-.8-4.2-2.6 M16 16c2.2.2 3.6-.8 4.2-2.6 M16 11.5c2.2.2 3.6-.8 4.2-2.6",
  flask:
    "M9.5 3v6.2L4.8 17.4A2 2 0 0 0 6.5 20.5h11a2 2 0 0 0 1.7-3.1L14.5 9.2V3 M8.5 3h7 M7 14.5h10",
  quill: "M4 20c3.5-6.5 8-11 16-15-1 8-4.5 12.5-11 15 M6.5 17.5 12 12 M4 20h4",
  cap:
    "M2.5 8.8 12 4.5l9.5 4.3L12 13 2.5 8.8Z M6.5 10.6v4.8c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9v-4.8 M21.5 8.8v5.4",
  atom: "M12 12m-1.6 0a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0 M4 12c0-2.6 3.6-4.7 8-4.7s8 2.1 8 4.7-3.6 4.7-8 4.7-8-2.1-8-4.7Z",
  dna: "M7 3c0 5 10 6 10 11S7 19 7 21 M17 3c0 5-10 6-10 11s10 5 10 7 M8.6 7h6.8 M7.4 13.5h9.2",
  city: "M3 20.5h18 M4.5 20.5V11l5-3v12.5 M9.5 20.5V6l5-2.5v17 M14.5 20.5v-9l5 2.5v6.5",
};

/** Which glyph sits where inside one tile, as [name, x, y, rotation]. */
const LAYOUT: [keyof typeof GLYPHS, number, number, number][] = [
  ["book", 14, 18, -6],
  ["laurel", 112, 8, 4],
  ["flask", 62, 74, -3],
  ["atom", 156, 62, 0],
  ["quill", 10, 128, 5],
  ["cap", 108, 116, -4],
  ["dna", 158, 156, 3],
  ["city", 54, 160, 0],
];

export type IconPatternVariant = "loose" | "dense";

const SCALE: Record<IconPatternVariant, number> = {
  loose: 1,
  dense: 0.55,
};

export function IconPattern({
  variant = "loose",
  opacity = 0.09,
  className,
}: {
  variant?: IconPatternVariant;
  /** Kept low: this is a watermark, never a foreground element. */
  opacity?: number;
  className?: string;
}) {
  const scale = SCALE[variant];
  const tile = TILE * scale;
  const id = `academic-pattern-${variant}`;

  return (
    <svg className={className} aria-hidden="true" focusable="false" width="100%" height="100%">
      <defs>
        <pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse">
          <g
            transform={`scale(${scale})`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5 / scale}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {LAYOUT.map(([name, x, y, rotate]) => (
              <g key={`${name}-${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rotate} 12 12)`}>
                <path d={GLYPHS[name]} />
              </g>
            ))}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}
