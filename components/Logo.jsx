import { useId } from "react";

/**
 * Фирменный знак Virtual Auto Market.
 * Абстрактная "V" на пересечении дорожных линий, уходящих в горизонт,
 * с акцентной "фарой" на вершине — считывается и как буква, и как силуэт капота.
 */
export default function Logo({ size = 36, rounded = true }) {
  const uid = useId().replace(/[:]/g, "");
  const gradId = `vam-grad-${uid}`;
  const glowId = `vam-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Virtual Auto Market"
    >
      <defs>
        <linearGradient id={gradId} x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8f74ff" />
          <stop offset="1" stopColor="#23d5c4" />
        </linearGradient>
        <radialGradient id={glowId} cx="0.5" cy="0.22" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx={rounded ? 13 : 0}
        fill={`url(#${gradId})`}
      />
      <rect x="1" y="1" width="46" height="46" rx={rounded ? 13 : 0} fill={`url(#${glowId})`} />

      {/* дорожные полосы, сходящиеся в "V" */}
      <path
        d="M9 14 L23.2 33.5"
        stroke="rgba(9,12,26,0.32)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path
        d="M39 14 L24.8 33.5"
        stroke="rgba(9,12,26,0.32)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path d="M10.5 13 L23.6 32" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M37.5 13 L24.4 32" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />

      {/* акцентная "фара" на вершине */}
      <circle cx="24" cy="10.5" r="3.1" fill="#0a0e1a" opacity="0.25" />
      <circle cx="24" cy="10" r="3.1" fill="#ffffff" />
    </svg>
  );
}
