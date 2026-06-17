/**
 * Inline SVG icons, vendored from document/design-Template (no icon CDN).
 * Minimal outline style, currentColor-driven.
 */

export function NevisoLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="6" width="44" height="52" rx="6" fill="#FFFFFF" stroke="#1B1B1F" strokeWidth="2.5" />
      <rect x="48" y="6" width="6" height="52" rx="2" fill="#E8A53D" stroke="#1B1B1F" strokeWidth="2.5" />
      <path
        d="M16 22 L40 22 M16 30 L34 30 M16 38 L36 38 M16 46 L28 46"
        stroke="#1B1B1F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M58 14 L60 18 L64 20 L60 22 L58 26 L56 22 L52 20 L56 18 Z"
        fill="#E8A53D"
        stroke="#1B1B1F"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
      <path
        d="M12 9c0 1.5 1.5 3 3 3-1.5 0-3 1.5-3 3 0-1.5-1.5-3-3-3 1.5 0 3-1.5 3-3z"
        fill="currentColor"
      />
    </svg>
  );
}

function Outline({
  size = 18,
  stroke,
  children,
}: {
  size?: number;
  stroke?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke ?? 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

export function NotebookIcon({ size = 18, stroke }: { size?: number; stroke?: string }) {
  return (
    <Outline size={size} stroke={stroke}>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19.5z" />
      <path d="M5 7h2M5 11h2M5 15h2M5 19h2" />
    </Outline>
  );
}

export function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <Outline size={size}>
      <path d="M12 5v14M5 12h14" />
    </Outline>
  );
}

export function ImageIcon({ size = 18 }: { size?: number }) {
  return (
    <Outline size={size}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m21 16-5-5L7 20" />
    </Outline>
  );
}

export function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <Outline size={size}>
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M10 11v6M14 11v6" />
    </Outline>
  );
}

export function PencilIcon({ size = 18 }: { size?: number }) {
  return (
    <Outline size={size}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Outline>
  );
}

export function XIcon({ size = 18 }: { size?: number }) {
  return (
    <Outline size={size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Outline>
  );
}

/** Forward/continue arrow for RTL (points left). */
export function FwdIcon({ size = 18 }: { size?: number }) {
  return (
    <Outline size={size}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Outline>
  );
}

export function SearchIcon({ size = 18, stroke }: { size?: number; stroke?: string }) {
  return (
    <Outline size={size} stroke={stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Outline>
  );
}

export function FilterIcon({ size = 18 }: { size?: number }) {
  return (
    <Outline size={size}>
      <path d="M3 5h18l-7 9v6l-4-2v-4z" />
    </Outline>
  );
}

export function ChevDown({ size = 18 }: { size?: number }) {
  return (
    <Outline size={size}>
      <path d="M6 9l6 6 6-6" />
    </Outline>
  );
}

/** Small filled sparkle for chips / inline accents. */
export function SparkSmall({ size = 12, stroke }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill={stroke ?? 'currentColor'} style={{ flexShrink: 0 }}>
      <path d="M6 0 7.2 4.8 12 6 7.2 7.2 6 12 4.8 7.2 0 6 4.8 4.8z" />
    </svg>
  );
}

export function BellIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
