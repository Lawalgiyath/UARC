import type { SocialHandle } from "@/lib/conference";

// Social glyphs, drawn to sit alongside the academic icon set rather than
// pasted in from four different brand kits: same 24 grid, same weight, and
// `currentColor` so they take the colour of whatever bar they land in.

function GlyphX({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.6 3h3.1l-6.8 7.7L22 21h-6.3l-4.9-6.4L5.1 21H2l7.3-8.3L2.3 3h6.4l4.4 5.9L17.6 3Zm-1.1 16.1h1.7L7.6 4.8H5.8l10.7 14.3Z" />
    </svg>
  );
}

function GlyphFacebook({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function GlyphInstagram({ size }: { size: number }) {
  // Solid, like the other three. Drawn as an outline it was the only glyph in
  // the row rendered as a 1.8px stroke rather than a filled shape, so at 18px
  // it read as noticeably fainter than its neighbours and looked disabled.
  // CITS reported it as "not active"; the link was always fine, the weight was
  // not. The lens and the corner dot are knocked out with evenodd.
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm4.5 5.6a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8Zm0 1.5a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm5.1-3.45a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"
      />
    </svg>
  );
}

function GlyphLinkedIn({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

const GLYPHS: Record<string, ({ size }: { size: number }) => React.ReactElement> = {
  X: GlyphX,
  Facebook: GlyphFacebook,
  Instagram: GlyphInstagram,
  LinkedIn: GlyphLinkedIn,
};

export function SocialLinks({
  socials,
  size = 18,
  withLabels = false,
  className,
}: {
  socials: SocialHandle[];
  size?: number;
  /** Shows the handle next to the glyph, for footers and contact pages. */
  withLabels?: boolean;
  className?: string;
}) {
  return (
    <ul className={`social-links${withLabels ? " with-labels" : ""}${className ? ` ${className}` : ""}`}>
      {socials.map((social) => {
        const Glyph = GLYPHS[social.network];
        return (
          <li key={social.network}>
            <a
              href={social.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${social.network}: ${social.handle}`}
            >
              {Glyph ? <Glyph size={size} /> : null}
              {withLabels && <span>{social.handle}</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
