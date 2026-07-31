import Image from "next/image";
import type { CampusPhoto } from "@/lib/media";

// Renders a campus photo inside its declared crop box, with the CC attribution
// the licence requires. Every photo on the site goes through here so the crop
// declared in `media.ts` is honoured everywhere the picture appears, rather
// than each page re-deciding how to frame it.

export function PhotoFrame({
  photo,
  caption,
  sizes = "100vw",
  priority = false,
  maxHeight,
  className,
  aspectRatio,
}: {
  photo: CampusPhoto;
  /** Leading sentence of the caption. The photo credit is appended to it. */
  caption?: string;
  sizes?: string;
  priority?: boolean;
  maxHeight?: string;
  className?: string;
  /** Overrides the photo's own crop, for layouts that need a specific shape. */
  aspectRatio?: number;
}) {
  const ratio = aspectRatio ?? photo.crop?.aspectRatio;
  const objectPosition = photo.crop?.objectPosition ?? "center";

  // The frame needs a definite height for `object-fit: cover` to have anything
  // to cover, and only one of the two ways of giving it one may apply at a
  // time. An aspect ratio combined with a max height would shrink the frame's
  // *width* to satisfy both, which turns a full bleed band into a small
  // rectangle; so an explicit height wins when a caller asks for one, and the
  // crop still governs which part of the photograph survives.
  const frameStyle = maxHeight
    ? { height: maxHeight }
    : ratio
      ? { aspectRatio: String(ratio) }
      : undefined;

  return (
    <figure className={className}>
      <div className="photo-frame" style={frameStyle}>
        <Image
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          sizes={sizes}
          priority={priority}
          style={frameStyle ? { objectFit: "cover", objectPosition } : { objectPosition }}
        />
      </div>
      {caption !== undefined && (
        <figcaption>
          {caption ? `${caption} ` : ""}Photo by{" "}
          <a href={photo.sourceUrl} rel="noreferrer">
            {photo.credit}
          </a>
          , CC BY-SA 4.0.
        </figcaption>
      )}
    </figure>
  );
}
