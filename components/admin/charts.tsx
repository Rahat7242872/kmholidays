import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Smooth area chart (pure SVG) for a daily series. */
export function AreaChart({ data, height = 180 }: { data: { label: string; count: number }[]; height?: number }) {
  const W = 600;
  const H = height;
  const pad = { t: 14, r: 8, b: 22, l: 26 };
  const max = Math.max(4, ...data.map((d) => d.count));
  const step = (W - pad.l - pad.r) / Math.max(1, data.length - 1);
  const pts = data.map((d, i) => ({ x: pad.l + i * step, y: pad.t + (H - pad.t - pad.b) * (1 - d.count / max), ...d }));
  const line = pts.map((p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H - pad.b} L${pts[0].x},${H - pad.b} Z`;
  const ticks = [0, Math.round(max / 2), max];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Requests per day, last 30 days">
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e3192" stopOpacity=".28" />
          <stop offset="1" stopColor="#2e3192" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="area-line" x1="0" x2="1">
          <stop offset="0" stopColor="#5b2a8c" />
          <stop offset=".6" stopColor="#e8592b" />
          <stop offset="1" stopColor="#17a3b8" />
        </linearGradient>
      </defs>
      {ticks.map((t) => {
        const y = pad.t + (H - pad.t - pad.b) * (1 - t / max);
        return (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#e3e8f2" strokeDasharray="3 4" />
            <text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#8a93ad">{t}</text>
          </g>
        );
      })}
      <path d={area} fill="url(#area-fill)" />
      <path d={line} fill="none" stroke="url(#area-line)" strokeWidth="2.5" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={p.label}>
          {p.count > 0 && <circle cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#2e3192" strokeWidth="2"><title>{`${p.label}: ${p.count}`}</title></circle>}
          {(i % 6 === 0 || i === pts.length - 1) && (
            <text x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fill="#8a93ad">{p.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

/** Horizontal bar list. */
export function BarList({ items, color = 'bg-brand' }: { items: { label: string; count: number; hint?: string }[]; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  if (!items.length) return <p className="py-6 text-center text-sm text-muted-foreground">No data yet.</p>;
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium text-ink">{i.label}</span>
            <span className="shrink-0 font-bold tabular-nums">{i.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className={cn('h-full rounded-full', color)} style={{ width: `${(i.count / max) * 100}%` }} />
          </div>
          {i.hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{i.hint}</p>}
        </li>
      ))}
    </ul>
  );
}

export function TrendBadge({ change }: { change: number | null }) {
  if (change === null) return <span className="text-[11px] text-muted-foreground">no data last week</span>;
  const up = change >= 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold', up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600')}>
      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />} {up ? '+' : ''}{change}%
    </span>
  );
}
