'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Clock, FileText, Globe2, MapPin, PlaneTakeoff, Search, Users } from 'lucide-react';
import { CategoryIcon } from '@/components/site/category-icon';
import { FlightSearchForm } from '@/components/site/flight-search';
import { useT } from '@/components/i18n-provider';
import { categoryList, categoryMeta, type Category } from '@/lib/site';
import { cn } from '@/lib/utils';

export type SearchSuggestions = Partial<Record<Category, string[]>>;



function Box({ icon: Icon, label, children, className }: { icon: typeof MapPin; label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('group flex min-w-0 cursor-text items-center gap-3 rounded-xl border border-border bg-white px-4 py-2.5 transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10 hover:border-brand/40', className)}>
      <Icon className="size-5 shrink-0 text-brand" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
        {children}
      </span>
    </label>
  );
}

const inputCls = 'w-full min-w-0 bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-ink/35';

export function HeroSearch({ suggestions = {} }: { suggestions?: SearchSuggestions }) {
  const router = useRouter();
  const listId = useId();
  const [tab, setTab] = useState<'flight' | Category>('flight');
  const category: Category = tab === 'flight' ? 'tour' : tab;
  const t = useT();
  const s = t.search;
  const tabs = [{ key: 'flight' as const, label: s.tabs.flight }, ...categoryList.map((c) => ({ key: c.key, label: s.tabs[c.key] }))];
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [to, setTo] = useState('');
  const [pax, setPax] = useState('2');
  const [note, setNote] = useState('Tourist');
  const today = new Date().toISOString().slice(0, 10);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (category !== 'esim' && category !== 'service') {
      if (date) params.set('date', date);
      if (pax) params.set('pax', pax);
    }
    if (category === 'hotel' && to) params.set('to', to);
    if (category === 'visa' && note) params.set('note', `Visa type: ${note}`);
    if (category === 'esim' && date) params.set('note', `Travel from ${date}`);
    const qs = params.toString();
    router.push(`/${categoryMeta[category].path}${qs ? `?${qs}` : ''}`);
  }

  const paxSelect = (
    <select value={pax} onChange={(e) => setPax(e.target.value)} className={cn(inputCls, 'cursor-pointer appearance-none')}>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
        <option key={n} value={n}>{s.paxLabel(n, category === 'hotel' ? 'guest' : 'traveller')}</option>
      ))}
    </select>
  );

  return (
    <div className="rounded-3xl bg-white shadow-[0_24px_60px_-20px_rgba(11,29,69,.35)]">
      {/* Tabs */}
      <div role="tablist" aria-label="What are you looking for?" className="no-scrollbar flex overflow-x-auto border-b border-border px-2 sm:px-4">
        {tabs.map((c) => {
          const active = tab === c.key;
          return (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(c.key)}
              className={cn(
                'relative flex min-w-[72px] flex-1 shrink-0 flex-col items-center gap-1 px-3 pt-4 pb-3 text-[13px] font-bold transition-colors sm:flex-none sm:flex-row sm:gap-2 sm:px-5 sm:text-[15px]',
                active ? 'text-brand' : 'text-ink/55 hover:text-ink',
              )}
            >
              <span className={cn('grid size-9 place-items-center rounded-xl transition sm:size-8', active ? 'bg-brand text-white' : 'bg-muted')}>
                {c.key === 'flight' ? <PlaneTakeoff className="size-[18px]" /> : <CategoryIcon category={c.key} className="size-[18px]" />}
              </span>
              {c.label}
              <span className={cn('absolute inset-x-3 -bottom-px h-[3px] rounded-t-full bg-brand transition-transform', active ? 'scale-x-100' : 'scale-x-0')} />
            </button>
          );
        })}
      </div>

      {tab === 'flight' ? (
        <div className="p-3 sm:p-5">
          <FlightSearchForm />
        </div>
      ) : (
      <form onSubmit={submit} className="p-3 sm:p-5">
        <datalist id={listId}>
          {(suggestions[category] ?? []).map((s) => <option key={s} value={s} />)}
        </datalist>

        <div className={cn('grid gap-2.5 sm:gap-3', category === 'hotel' ? 'md:grid-cols-[1.6fr_1fr_1fr_1fr]' : category === 'service' ? 'md:grid-cols-1' : 'md:grid-cols-[1.8fr_1fr_1fr]')}>
          {category === 'tour' && (
            <>
              <Box icon={MapPin} label={s.destination}>
                <input list={listId} value={q} onChange={(e) => setQ(e.target.value)} placeholder={s.whereGo} className={inputCls} />
              </Box>
              <Box icon={CalendarDays} label={s.travelDate}>
                <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </Box>
              <Box icon={Users} label={s.travellers}>{paxSelect}</Box>
            </>
          )}
          {category === 'hotel' && (
            <>
              <Box icon={MapPin} label={s.cityHotel}>
                <input list={listId} value={q} onChange={(e) => setQ(e.target.value)} placeholder={s.cityHotelPh} className={inputCls} />
              </Box>
              <Box icon={CalendarDays} label={s.checkIn}>
                <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </Box>
              <Box icon={CalendarDays} label={s.checkOut}>
                <input type="date" min={date || today} value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
              </Box>
              <Box icon={Users} label={s.guests}>{paxSelect}</Box>
            </>
          )}
          {category === 'visa' && (
            <>
              <Box icon={Globe2} label={s.country}>
                <input list={listId} value={q} onChange={(e) => setQ(e.target.value)} placeholder={s.whichCountry} className={inputCls} />
              </Box>
              <Box icon={FileText} label={s.visaType}>
                <select value={note} onChange={(e) => setNote(e.target.value)} className={cn(inputCls, 'cursor-pointer appearance-none')}>
                  {['Tourist', 'Business', 'Student', 'Medical', 'Transit'].map((v) => <option key={v} value={v}>{s.visaTypes[v]}</option>)}
                </select>
              </Box>
              <Box icon={Users} label={s.travellers}>{paxSelect}</Box>
            </>
          )}
          {category === 'esim' && (
            <>
              <Box icon={Globe2} label={s.countryRegion}>
                <input list={listId} value={q} onChange={(e) => setQ(e.target.value)} placeholder={s.whereTravel} className={inputCls} />
              </Box>
              <Box icon={CalendarDays} label={s.travelDate}>
                <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </Box>
              <Box icon={Clock} label={s.activation}>
                <span className={inputCls}>{s.instantQr}</span>
              </Box>
            </>
          )}
          {category === 'service' && (
            <Box icon={Search} label={s.service}>
              <input list={listId} value={q} onChange={(e) => setQ(e.target.value)} placeholder={s.servicePh} className={inputCls} />
            </Box>
          )}
        </div>

        <div className="mt-3 flex flex-col-reverse items-center gap-3 sm:mt-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">{s.note}</p>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cta px-10 py-3.5 text-base font-bold text-white shadow-lg shadow-cta/30 transition hover:bg-cta-600 active:scale-[.98] sm:w-auto"
          >
            <Search className="size-5" /> {s.searchBtn[category]}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
