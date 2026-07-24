// A recurring decorative flourish, line-art in the gold accent, built from a
// thin curling stem plus a small set of academic glyphs (an open book, a
// laurel sprig, a quill). Three variants let the same motif take a different
// shape per section, the way a printed programme repeats a printer's
// ornament rather than a literal icon.

import type { CSSProperties } from "react";

function BookGlyph({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      stroke="currentColor"
      strokeWidth="1.15"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M0 -1 C -5 -3.2 -10 -3.2 -14 -1 L -14 8.5 C -10 6.3 -5 6.3 0 8.5 Z" />
      <path d="M0 -1 C 5 -3.2 10 -3.2 14 -1 L 14 8.5 C 10 6.3 5 6.3 0 8.5 Z" />
    </g>
  );
}

function LaurelGlyph({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="currentColor" strokeWidth="1.05" fill="none" strokeLinecap="round">
      <path d="M0 12 C 2.5 6 2.5 -6 0 -13" />
      <path d="M0 3 C 3 2.6 5 0.8 5.2 -1.6" />
      <path d="M0 -2 C 3 -2.4 5 -4.2 5.2 -6.6" />
      <path d="M0 -7 C 2.4 -7.4 4.2 -8.9 4.3 -11" />
      <path d="M0 3 C -3 2.6 -5 0.8 -5.2 -1.6" />
      <path d="M0 -2 C -3 -2.4 -5 -4.2 -5.2 -6.6" />
    </g>
  );
}

function QuillGlyph({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-4 9 L8 -10" />
      <path d="M8 -10 C 10.5 -12.5 11 -15.5 9.8 -18.2 C 7 -17 5.2 -14.3 4.4 -11.5 C 3.8 -9.4 4.8 -7.4 6.8 -6.6 C 8.8 -7.6 9.6 -9.6 8 -10 Z" />
      <path d="M-2 4.5 L2 1" />
    </g>
  );
}

const VARIANTS = {
  horizontal: {
    viewBox: "0 0 640 48",
    stem: "M4 26 C 90 6, 180 46, 280 26 S 460 6, 636 26",
    glyphs: (
      <>
        <BookGlyph x={140} y={22} scale={1} />
        <LaurelGlyph x={320} y={18} scale={0.9} />
        <QuillGlyph x={500} y={24} scale={0.85} />
      </>
    ),
  },
  vertical: {
    viewBox: "0 0 40 440",
    stem: "M20 6 C 2 110, 38 190, 20 290 S 2 400, 20 434",
    glyphs: (
      <>
        <LaurelGlyph x={20} y={90} scale={0.9} />
        <BookGlyph x={20} y={230} scale={0.95} />
        <QuillGlyph x={20} y={360} scale={0.8} />
      </>
    ),
  },
  corner: {
    viewBox: "0 0 140 140",
    stem: "M10 10 C 66 6, 130 12, 132 62 C 133 98, 104 130, 64 132",
    glyphs: (
      <>
        <BookGlyph x={30} y={10} scale={0.8} />
        <LaurelGlyph x={64} y={128} scale={1} />
      </>
    ),
  },
} as const;

export function AcademicVine({
  variant,
  className,
  flip = false,
  style,
}: {
  variant: keyof typeof VARIANTS;
  className?: string;
  flip?: boolean;
  style?: CSSProperties;
}) {
  const { viewBox, stem, glyphs } = VARIANTS[variant];
  return (
    <svg
      className={className}
      viewBox={viewBox}
      aria-hidden="true"
      style={flip ? { ...style, transform: "scaleX(-1)" } : style}
    >
      <path d={stem} stroke="currentColor" strokeWidth="1" fill="none" opacity="0.55" />
      <g opacity="0.75">{glyphs}</g>
    </svg>
  );
}
