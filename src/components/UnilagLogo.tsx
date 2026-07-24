import Image from "next/image";
import { UNILAG_LOGO } from "@/lib/media";

export function UnilagLogo({ height = 40, className }: { height?: number; className?: string }) {
  const width = Math.round((UNILAG_LOGO.width / UNILAG_LOGO.height) * height);
  return (
    <Image
      src={UNILAG_LOGO.src}
      alt={UNILAG_LOGO.alt}
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
