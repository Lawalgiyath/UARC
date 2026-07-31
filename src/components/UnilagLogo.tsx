import Image from "next/image";
import { UNILAG_LOGO } from "@/lib/media";

// The official university lockup is a crest followed by a white "UNIVERSITY OF
// LAGOS" wordmark, drawn for dark backgrounds. Placed straight onto this
// site's cream paper the wordmark disappears, so it is used two ways:
//
//   plate     - the full lockup on a deep maroon panel, where the white
//               wordmark reads as intended. This is the masthead treatment.
//   crestOnly - the crest alone, cropped out of the left of the same file,
//               for places that already set the university's name in type
//               beside it (header, footer, certificate).
//
// The crest occupies the leftmost square of the source image, so cropping to a
// square anchored left isolates it without needing a second asset.

export function UnilagLogo({
  height = 52,
  className,
  priority = true,
  variant = "full",
}: {
  height?: number;
  className?: string;
  priority?: boolean;
  variant?: "full" | "plate" | "crestOnly";
}) {
  const fullWidth = Math.round((UNILAG_LOGO.width / UNILAG_LOGO.height) * height);

  if (variant === "crestOnly") {
    return (
      <span
        className={`unilag-crest${className ? ` ${className}` : ""}`}
        style={{ width: height, height }}
      >
        <Image
          src={UNILAG_LOGO.src}
          alt={UNILAG_LOGO.alt}
          width={fullWidth}
          height={height}
          priority={priority}
          sizes={`${height * 2}px`}
        />
      </span>
    );
  }

  const image = (
    <Image
      src={UNILAG_LOGO.src}
      alt={UNILAG_LOGO.alt}
      width={fullWidth}
      height={height}
      className={variant === "full" ? className : undefined}
      priority={priority}
      // Roughly twice the rendered height keeps the fine lettering inside the
      // crest sharp on high density screens.
      sizes={`${fullWidth * 2}px`}
    />
  );

  if (variant === "plate") {
    return <span className={`unilag-plate${className ? ` ${className}` : ""}`}>{image}</span>;
  }

  return image;
}
