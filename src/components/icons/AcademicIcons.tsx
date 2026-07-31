// One academic icon system for the whole site.
//
// Every glyph is drawn on the same 24x24 grid, with the same 1.5 stroke, round
// caps and no fills, so a track icon, a wayfinding icon and a tile in the
// background pattern all read as members of one family rather than three
// unrelated icon packs. Colour comes from `currentColor`, so an icon inherits
// whatever the surrounding text is using (gold in eyebrows, maroon on cards).

import type { SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** Rendered size in pixels, width and height. */
  size?: number;
  /** Screen reader label. Omit for purely decorative icons. */
  title?: string;
}

function Icon({ size = 24, title, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------------- scholarship */

export function IconBook(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 6.5C10 5 7.5 4.4 4.5 4.6v12.2c3-.2 5.5.4 7.5 1.9 2-1.5 4.5-2.1 7.5-1.9V4.6c-3-.2-5.5.4-7.5 1.9Z" />
      <path d="M12 6.5v12.2" />
    </Icon>
  );
}

export function IconQuill(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20c3.5-6.5 8-11 16-15-1 8-4.5 12.5-11 15" />
      <path d="M6.5 17.5 12 12" />
      <path d="M4 20h4" />
    </Icon>
  );
}

export function IconLaurel(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 21c-3-3.5-3.5-9 0-14" />
      <path d="M16 21c3-3.5 3.5-9 0-14" />
      <path d="M8 16c-2.2.2-3.6-.8-4.2-2.6M8 11.5c-2.2.2-3.6-.8-4.2-2.6M9.5 7.4c-2 .1-3.3-.8-3.9-2.4" />
      <path d="M16 16c2.2.2 3.6-.8 4.2-2.6M16 11.5c2.2.2 3.6-.8 4.2-2.6M14.5 7.4c2 .1 3.3-.8 3.9-2.4" />
    </Icon>
  );
}

export function IconGraduationCap(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 8.8 12 4.5l9.5 4.3L12 13 2.5 8.8Z" />
      <path d="M6.5 10.6v4.8c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9v-4.8" />
      <path d="M21.5 8.8v5.4" />
    </Icon>
  );
}

export function IconScroll(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 3.5h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7" />
      <path d="M6 3.5a2 2 0 0 0-2 2v2h3" />
      <path d="M19 18.5a2 2 0 0 1-2 2H7a2 2 0 0 0 2-2v-2h10" />
      <path d="M8.5 8h7M8.5 11.5h7" />
    </Icon>
  );
}

/* --------------------------------------------------------------- the sciences */

export function IconDna(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 3c0 5 10 6 10 11S7 19 7 21" />
      <path d="M17 3c0 5-10 6-10 11s10 5 10 7" />
      <path d="M8.6 7h6.8M7.4 10.5h9.2M7.4 13.5h9.2M8.6 17h6.8" />
    </Icon>
  );
}

export function IconFlask(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.5 3v6.2L4.8 17.4A2 2 0 0 0 6.5 20.5h11a2 2 0 0 0 1.7-3.1L14.5 9.2V3" />
      <path d="M8.5 3h7" />
      <path d="M7 14.5h10" />
    </Icon>
  );
}

export function IconMicroscope(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 4.5h3.5v6H9z" />
      <path d="M10.75 10.5c3 0 5.2 2.2 5.2 5s-2.2 5-5.2 5" />
      <path d="M7 20.5h13" />
      <path d="M4.5 20.5c0-3.6 1.6-6.4 4-7.8" />
      <path d="M12.5 6.5h2" />
    </Icon>
  );
}

export function IconAtom(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="1.6" />
      <path d="M12 4.2c4.6 0 8.3 3.5 8.3 7.8s-3.7 7.8-8.3 7.8-8.3-3.5-8.3-7.8S7.4 4.2 12 4.2Z" transform="rotate(60 12 12)" />
      <path d="M12 4.2c4.6 0 8.3 3.5 8.3 7.8s-3.7 7.8-8.3 7.8-8.3-3.5-8.3-7.8S7.4 4.2 12 4.2Z" transform="rotate(-60 12 12)" />
    </Icon>
  );
}

export function IconPulse(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 12.5h3.5l2-5.5 3.5 11 2.5-7 1.7 3h4.8" />
    </Icon>
  );
}

export function IconLeaf(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20c0-8 4.5-13.5 16-14 .5 10.5-5 15-11 15H4Z" />
      <path d="M4.5 19.5C8 16 11.5 13 15.5 11" />
    </Icon>
  );
}

/* ------------------------------------------------------------ technology, city */

export function IconChip(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10.25" y="10.25" width="3.5" height="3.5" rx="0.5" />
      <path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" />
    </Icon>
  );
}

export function IconCity(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 20.5h18" />
      <path d="M4.5 20.5V11l5-3v12.5" />
      <path d="M9.5 20.5V6l5-2.5v17" />
      <path d="M14.5 20.5v-9l5 2.5v6.5" />
      <path d="M6.5 12.5v1.5M6.5 16.5V18M11.75 8.5V10M11.75 13v1.5M11.75 17.5V19M17 16v1.5" />
    </Icon>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5S14.4 18.1 12 20.5c-2.4-2.4-3.6-5.3-3.6-8.5S9.6 5.9 12 3.5Z" />
    </Icon>
  );
}

/* -------------------------------------------------------- policy, people, trust */

export function IconScales(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v16" />
      <path d="M7 20.5h10" />
      <path d="M4 7.5h16" />
      <path d="M4 7.5 1.5 14h5L4 7.5Z" />
      <path d="M20 7.5 17.5 14h5L20 7.5Z" />
      <circle cx="12" cy="4" r="1.2" />
    </Icon>
  );
}

export function IconShieldCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 4.5 6v6c0 4.3 3.1 7.9 7.5 9.2 4.4-1.3 7.5-4.9 7.5-9.2V6L12 3Z" />
      <path d="M8.8 12.1 11.2 14.5l4.2-4.6" />
    </Icon>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9.5" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.7-5.6 6-5.6s6 2.3 6 5.6" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6" />
      <path d="M17.5 14.9c1.9.7 3 2.3 3 4.4" />
    </Icon>
  );
}

export function IconHandshake(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 9.5 6 7l3.5 1.5L12 7l2.5 1.5L18 7l3.5 2.5" />
      <path d="M6 7v8.5l4 3 3-2.2 3 2.2 3.5-3V7" />
      <path d="M9.5 8.5 7.4 11a1.6 1.6 0 0 0 2.2 2.3l1.6-1.4 2.2 2a1.6 1.6 0 0 0 2.2-2.3l-2.6-2.6" />
    </Icon>
  );
}

/* ------------------------------------------------------ conference logistics */

export function IconCalendar(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4M16 3v4" />
      <path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2" />
    </Icon>
  );
}

export function IconTicket(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 8.5V6.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v2a2.5 2.5 0 0 0 0 7v2a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-2a2.5 2.5 0 0 0 0-7Z" />
      <path d="M14 5.5v2.2M14 10.9v2.2M14 16.3v2.2" />
    </Icon>
  );
}

export function IconBooth(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 9.5 5 4.5h14l1.5 5" />
      <path d="M3.5 9.5a2.2 2.2 0 0 0 4.25 0 2.2 2.2 0 0 0 4.25 0 2.2 2.2 0 0 0 4.25 0 2.2 2.2 0 0 0 4.25 0" />
      <path d="M5.5 11.6v8.9h13v-8.9" />
      <path d="M2.5 20.5h19" />
      <path d="M9.5 20.5v-5h5v5" />
    </Icon>
  );
}

export function IconBed(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 20v-9" />
      <path d="M3 14.5h18v5.5" />
      <path d="M21 14.5V12a2.5 2.5 0 0 0-2.5-2.5H11V14.5" />
      <circle cx="6.75" cy="11.75" r="1.9" />
    </Icon>
  );
}

export function IconMegaphone(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 10v4a1.5 1.5 0 0 0 1.5 1.5h2L18 20.5V3.5L7 8.5H5a1.5 1.5 0 0 0-1.5 1.5Z" />
      <path d="M18 8.5a3.5 3.5 0 0 1 0 7" />
      <path d="M7 15.5V20a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1v-2.9" />
    </Icon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10.75" cy="10.75" r="6.75" />
      <path d="M15.6 15.6 20.5 20.5" />
    </Icon>
  );
}

export function IconUpload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 15.5V4" />
      <path d="M7.75 8.25 12 4l4.25 4.25" />
      <path d="M4 15.5v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Icon>
  );
}

export function IconSeal(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="9.5" r="5.75" />
      <path d="M9.6 9.4 11.4 11.2l3.1-3.4" />
      <path d="M8.4 14.4 7 21l5-2.3 5 2.3-1.4-6.6" />
    </Icon>
  );
}

export function IconMail(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.6 7 12 13l8.4-6" />
    </Icon>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8.4 3.5H5.6A2.1 2.1 0 0 0 3.5 5.8c.35 8.1 6.6 14.35 14.7 14.7a2.1 2.1 0 0 0 2.3-2.1v-2.8l-4.4-1.5-1.9 2.3a15.7 15.7 0 0 1-6.4-6.4l2.3-1.9L8.4 3.5Z" />
    </Icon>
  );
}

export function IconPin(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21c4-4.4 6-8 6-10.8A6 6 0 0 0 6 10.2C6 13 8 16.6 12 21Z" />
      <circle cx="12" cy="10.2" r="2.4" />
    </Icon>
  );
}

export function IconStar(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 3.5 2.65 5.55 6 .85-4.35 4.3 1.05 6.05L12 17.4l-5.35 2.85 1.05-6.05L3.35 9.9l6-.85L12 3.5Z" />
    </Icon>
  );
}

/* ------------------------------------------------------------------ registries */

/** Every glyph, addressable by name, for data files that store an icon key. */
export const ACADEMIC_ICONS = {
  book: IconBook,
  quill: IconQuill,
  laurel: IconLaurel,
  cap: IconGraduationCap,
  scroll: IconScroll,
  dna: IconDna,
  flask: IconFlask,
  microscope: IconMicroscope,
  atom: IconAtom,
  pulse: IconPulse,
  leaf: IconLeaf,
  chip: IconChip,
  city: IconCity,
  globe: IconGlobe,
  scales: IconScales,
  shield: IconShieldCheck,
  users: IconUsers,
  handshake: IconHandshake,
  calendar: IconCalendar,
  ticket: IconTicket,
  booth: IconBooth,
  bed: IconBed,
  megaphone: IconMegaphone,
  search: IconSearch,
  upload: IconUpload,
  seal: IconSeal,
  mail: IconMail,
  phone: IconPhone,
  pin: IconPin,
  star: IconStar,
} as const;

export type AcademicIconName = keyof typeof ACADEMIC_ICONS;

export function AcademicIcon({ name, ...props }: IconProps & { name: AcademicIconName }) {
  const Glyph = ACADEMIC_ICONS[name];
  return <Glyph {...props} />;
}
