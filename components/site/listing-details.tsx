import {
  BedDouble,
  Bus,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  Globe2,
  Hotel,
  Info,
  LogIn,
  MapPin,
  PlaneTakeoff,
  Stamp,
  Timer,
  Users,
  UtensilsCrossed,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { Block, Fact, Group, ItineraryDay } from '@/lib/listing-details';
import { cn } from '@/lib/utils';

export const sectionCls = 'scroll-mt-36 rounded-2xl bg-white p-5 ring-1 ring-border/60 sm:p-6';

const FACT_ICONS: [RegExp, LucideIcon][] = [
  [/route|start|flight|যাত্রা|রুট/i, PlaneTakeoff],
  [/max stay|থাকার মেয়াদ/i, CalendarClock],
  [/hotel|হোটেল/i, Hotel],
  [/stay|থাকা/i, BedDouble],
  [/meal|খাবার/i, UtensilsCrossed],
  [/transport|car|যাতায়াত/i, Bus],
  [/group|guide|গ্রুপ|গাইড/i, Users],
  [/visa type|ভিসার ধরন/i, Stamp],
  [/entry|এন্ট্রি/i, LogIn],
  [/valid|মেয়াদ/i, CalendarCheck],
  [/process|প্রসেস/i, Timer],
  [/submission|জমা/i, Globe2],
  [/visa|ভিসা/i, Stamp],
  [/location|place|স্থান/i, MapPin],
];
const factIcon = (label: string) => FACT_ICONS.find(([re]) => re.test(label))?.[1] ?? Info;

export function SectionTitle({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-extrabold text-ink">{title}</h2>
      {text && <p className="mt-1 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

/** Icon grid of quick facts (route, hotel, meals… or visa type, entry, validity…). */
export function FactsGrid({ facts }: { facts: Fact[] }) {
  return (
    <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {facts.map((f, i) => {
        const Icon = factIcon(f.label);
        return (
          <div key={i} className="flex min-w-0 items-start gap-2.5 rounded-xl bg-paper p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand"><Icon className="size-[18px]" /></span>
            <div className="min-w-0">
              {f.label && <dt className="text-[11px] font-semibold text-muted-foreground">{f.label}</dt>}
              <dd className="text-sm leading-snug font-bold break-words text-ink">{f.value}</dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}

const DAY_RE = /^((?:day|night|দিন|রাত)\s*[\d০-৯]+)\s*[—–\-:|]\s*(.+)$/i;

/** Vertical day-by-day timeline. */
export function Itinerary({ days }: { days: ItineraryDay[] }) {
  return (
    <ol className="relative">
      {days.map((day, i) => {
        const m = day.title.match(DAY_RE);
        const badge = m ? m[1] : String(i + 1);
        const title = m ? m[2] : day.title;
        const last = i === days.length - 1;
        return (
          <li key={i} className="relative flex gap-3 pb-6 last:pb-0 sm:gap-4">
            {!last && <span className="absolute top-11 bottom-0 left-[21px] w-0.5 bg-gradient-to-b from-brand/40 to-brand/10" aria-hidden="true" />}
            <span className={cn('relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-center text-[10px] leading-[1.1] font-extrabold uppercase', i === 0 || last ? 'bg-swoosh text-white' : 'bg-brand-50 text-brand ring-2 ring-white')}>
              {badge.replace(/\s+/, '\n').split('\n').map((part, k) => <span key={k} className={cn('block', k === 1 && 'text-[15px]')}>{part}</span>)}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <h3 className="leading-snug font-bold text-ink">{title}</h3>
              {day.text && <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground">{day.text}</p>}
              {day.meta.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {day.meta.map((f, k) => {
                    const Icon = factIcon(f.label);
                    return (
                      <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-ink/80 ring-1 ring-border/70">
                        <Icon className="size-3.5 text-brand" /> {f.value}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function CheckList({ items, tone = 'yes' }: { items: string[]; tone?: 'yes' | 'no' }) {
  const Icon = tone === 'yes' ? CheckCircle2 : XCircle;
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[15px] text-ink/85">
          <Icon className={cn('mt-0.5 size-5 shrink-0', tone === 'yes' ? 'text-emerald-600' : 'text-rose-500')} /> {item}
        </li>
      ))}
    </ul>
  );
}

/** Visa documents, one card per applicant type. */
export function DocumentGroups({ groups }: { groups: Group[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {groups.map((g, i) => (
        <div key={i} className={cn('rounded-xl p-4 ring-1', i === 0 ? 'bg-brand-50/60 ring-brand/15 md:col-span-2' : 'bg-paper ring-border/60')}>
          <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-ink">
            <FileCheck2 className="size-4 text-brand" /> {g.title}
            <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-brand ring-1 ring-border">{g.items.length}</span>
          </p>
          <ul className={cn('grid gap-2', i === 0 && 'sm:grid-cols-2')}>
            {g.items.map((item, k) => (
              <li key={k} className="flex items-start gap-2 text-sm text-ink/85">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Numbered process steps. */
export function Steps({ steps, label }: { steps: Block[]; label: string }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {steps.map((s, i) => (
        <li key={i} className="relative flex gap-3 rounded-xl bg-paper p-4">
          <span className="bg-swoosh grid size-9 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white">{i + 1}</span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">{label} {i + 1}</p>
            <p className="leading-snug font-bold text-ink">{s.title}</p>
            {s.text && <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">{s.text}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function FeeTable({ fees }: { fees: Fact[] }) {
  return (
    <dl className="divide-y divide-dashed rounded-xl bg-paper px-4">
      {fees.map((f, i) => (
        <div key={i} className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-sm text-ink/80">{f.label}</dt>
          <dd className="shrink-0 text-right font-extrabold text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Faqs({ faqs }: { faqs: Block[] }) {
  return (
    <div className="divide-y rounded-xl ring-1 ring-border/70">
      {faqs.map((f, i) => (
        <details key={i} className="group px-4" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 font-bold text-ink [&::-webkit-details-marker]:hidden">
            {f.title}
            <ChevronDown className="size-5 shrink-0 text-brand transition group-open:rotate-180" />
          </summary>
          <p className="pb-4 text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground">{f.text}</p>
        </details>
      ))}
    </div>
  );
}
