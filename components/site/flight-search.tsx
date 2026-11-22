'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, CalendarDays, PlaneLanding, PlaneTakeoff, Search, Users } from 'lucide-react';
import { useT } from '@/components/i18n-provider';
import { AIRPORTS, CABIN_CLASSES, airportLabel } from '@/lib/flights';
import { cn } from '@/lib/utils';

export type FlightQuery = { from?: string; to?: string; date?: string; ret?: string; pax?: string; cls?: string; trip?: string };

function Box({ icon: Icon, label, children, className }: { icon: typeof Search; label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('flex min-w-0 cursor-text items-center gap-3 rounded-xl border border-border bg-white px-4 py-2.5 transition hover:border-brand/40 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10', className)}>
      <Icon className="size-5 shrink-0 text-brand" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
        {children}
      </span>
    </label>
  );
}

const inputCls = 'w-full min-w-0 bg-transparent text-[15px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink/35';

/** Flight search: one-way / round trip, from/to with airport suggestions, dates, travellers and class. */
export function FlightSearchForm({ initial = {}, note }: { initial?: FlightQuery; note?: string }) {
  const router = useRouter();
  const t = useT();
  const f = t.flight;
  const listId = useId();
  const today = new Date().toISOString().slice(0, 10);
  const [trip, setTrip] = useState(initial.trip === 'round' ? 'round' : 'oneway');
  const [from, setFrom] = useState(initial.from ?? 'Dhaka (DAC)');
  const [to, setTo] = useState(initial.to ?? '');
  const [date, setDate] = useState(initial.date ?? '');
  const [ret, setRet] = useState(initial.ret ?? '');
  const [pax, setPax] = useState(initial.pax ?? '1');
  const [cls, setCls] = useState(initial.cls ?? 'Economy');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const p = new URLSearchParams({ trip, from: from.trim(), to: to.trim(), pax, cls });
    if (date) p.set('date', date);
    if (trip === 'round' && ret) p.set('ret', ret);
    router.push(`/flights?${p.toString()}#request`);
  }

  return (
    <form onSubmit={submit}>
      <datalist id={listId}>
        {AIRPORTS.map((a) => <option key={a.code} value={airportLabel(a)}>{a.country}</option>)}
      </datalist>

      <div className="mb-3 flex gap-2">
        {[
          ['oneway', f.oneWay],
          ['round', f.roundTrip],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTrip(key)}
            className={cn('rounded-full px-4 py-1.5 text-sm font-bold transition', trip === key ? 'bg-brand text-white' : 'bg-muted text-ink/60 hover:text-ink')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-2.5 md:grid-cols-[1fr_1fr_0.8fr_0.8fr_1fr] md:gap-3">
        <div className="relative grid gap-2.5 sm:grid-cols-2 md:col-span-2 md:gap-3">
          <Box icon={PlaneTakeoff} label={f.from}>
            <input list={listId} value={from} onChange={(e) => setFrom(e.target.value)} required placeholder={f.fromPh} className={inputCls} />
          </Box>
          <button
            type="button"
            onClick={() => { setFrom(to); setTo(from); }}
            aria-label={f.swap}
            className="absolute top-1/2 left-1/2 z-10 hidden size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-white text-brand shadow-md transition hover:rotate-180 sm:grid"
          >
            <ArrowLeftRight className="size-4" />
          </button>
          <Box icon={PlaneLanding} label={f.to}>
            <input list={listId} value={to} onChange={(e) => setTo(e.target.value)} required placeholder={f.toPh} className={inputCls} />
          </Box>
        </div>
        <Box icon={CalendarDays} label={f.departure}>
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
        </Box>
        <Box icon={CalendarDays} label={f.return} className={cn(trip !== 'round' && 'opacity-50')}>
          {trip === 'round' ? (
            <input type="date" min={date || today} value={ret} onChange={(e) => setRet(e.target.value)} required className={inputCls} />
          ) : (
            <button type="button" onClick={() => setTrip('round')} className="text-left text-sm font-semibold text-brand">{f.addReturn}</button>
          )}
        </Box>
        <Box icon={Users} label={f.paxClass}>
          <span className="flex gap-1">
            <select value={pax} onChange={(e) => setPax(e.target.value)} aria-label={t.search.travellers} className={cn(inputCls, 'field-sizing-content w-auto cursor-pointer appearance-none')}>
              {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{t.search.paxLabel(n, 'traveller')}</option>)}
            </select>
            <span className="text-ink/30">·</span>
            <select value={cls} onChange={(e) => setCls(e.target.value)} aria-label="Cabin class" className={cn(inputCls, 'field-sizing-content w-auto cursor-pointer appearance-none')}>
              {CABIN_CLASSES.map((c) => <option key={c} value={c}>{f.classes[c]}</option>)}
            </select>
          </span>
        </Box>
      </div>

      <div className="mt-3 flex flex-col-reverse items-center gap-3 sm:mt-4 sm:flex-row sm:justify-between">
        <p className="text-xs text-muted-foreground">{note ?? f.note}</p>
        <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cta px-10 py-3.5 text-base font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-600 active:scale-[.98] sm:w-auto">
          <Search className="size-5" /> {t.search.searchBtn.flight}
        </button>
      </div>
    </form>
  );
}
