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
