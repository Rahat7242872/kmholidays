import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * KM Holidays logo, redrawn as SVG from the official logo so it stays sharp at any size.
 * `light` swaps the indigo parts to white for dark backgrounds.
 */
export function KmLogo({ light, withText = true, className }: { light?: boolean; withText?: boolean; className?: string }) {
  const indigo = light ? '#ffffff' : '#2e3192';
  return (
    <svg
      viewBox={withText ? '-10 -20 485 330' : '-10 -20 485 255'}
      className={className}
      role="img"
      aria-label="KM Holidays"
    >
      <defs>
        <linearGradient id="km-swoosh" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={light ? '#a77ad8' : '#5b2a8c'} />
          <stop offset="0.3" stopColor={light ? '#b46fc2' : '#7d3b96'} />
          <stop offset="0.55" stopColor="#e8592b" />
          <stop offset="0.72" stopColor="#d9693a" />
          <stop offset="1" stopColor="#17a3b8" />
        </linearGradient>
      </defs>
      <g fill={indigo}>
        <path d="M0 215 V5 Q58 5 58 62 V215 Z" />
        <path d="M58 70 L145 6 H200 L58 124 Z" />
        <path d="M98 150 L146 122 L198 186 Q210 213 182 215 H150 Z" />
      </g>
      <path fill="#f7941d" d="M212 215 V72 Q212 22 262 22 H270 L338 110 L406 22 H462 V168 Q462 215 416 215 H408 V104 L338 186 L268 104 V215 Z" />
      <path fill="url(#km-swoosh)" d="M-8 228 Q128 30 476 -16 Q180 76 10 230 Z" />
      {withText && (
        <text x="232" y="300" textAnchor="middle" fontSize="58" fontWeight="800" fill={indigo} textLength="450" lengthAdjust="spacing" fontFamily="var(--font-jakarta), sans-serif">
          HOLIDAYS
        </text>
      )}
    </svg>
  );
}

export function Brand({ light, className, tagline = true }: { light?: boolean; className?: string; tagline?: boolean }) {
  return (
    <Link href="/" aria-label="KM Holidays home" className={cn('inline-flex shrink-0 items-center gap-3', className)}>
      <KmLogo light={light} className="h-11 w-auto sm:h-12" />
      {tagline && (
        <span className={cn('hidden border-l pl-3 text-[11px] leading-tight font-bold tracking-wide uppercase xl:block', light ? 'border-white/20 text-white/70' : 'border-border text-ink/60')}>
          Your 1 Stop
          <br />
          <span className={light ? 'text-sun' : 'text-cta'}>Travel Solution</span>
        </span>
      )}
    </Link>
  );
}
