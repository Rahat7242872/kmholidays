'use client';

import { useMemo, useState } from 'react';
import { BedDouble, Bus, FileCheck2, MapPinned, Minus, Plane, Plus, Receipt, UserRoundCheck, Users, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { useT } from '@/components/i18n-provider';
import { InquiryForm } from '@/components/site/inquiry-form';
import { dictionaries } from '@/lib/i18n';
import { formatPrice } from '@/lib/site';
import { DEFAULT_SELECTION, TIERS, umrahEstimate, type Tier, type UmrahRates, type UmrahSelection } from '@/lib/umrah';
import { cn } from '@/lib/utils';

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cn('relative h-7 w-12 shrink-0 rounded-full transition', on ? 'bg-brand' : 'bg-input')}>
      <span className={cn('absolute top-0.5 size-6 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

function Chips<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn('rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition', value === o.value ? 'bg-brand text-white ring-brand' : 'bg-white text-ink/70 ring-border hover:ring-brand/40')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" aria-label={`− ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid size-8 place-items-center rounded-lg bg-muted disabled:opacity-40"><Minus className="size-4" /></button>
      <span className="w-6 text-center text-lg font-extrabold tabular-nums">{value}</span>
      <button type="button" aria-label={`+ ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="grid size-8 place-items-center rounded-lg bg-brand text-white disabled:opacity-40"><Plus className="size-4" /></button>
    </span>
  );
}

function ServiceCard({ icon: Icon, title, hint, on, onToggle, price, children }: { icon: LucideIcon; title: string; hint?: string; on: boolean; onToggle: (v: boolean) => void; price?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl bg-white p-4 ring-1 transition sm:p-5', on ? 'shadow-md ring-brand/30' : 'opacity-70 ring-border/70')}>
      <div className="flex items-start gap-3">
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl transition', on ? 'bg-brand text-white' : 'bg-muted text-ink/50')}><Icon className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">{title}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Switch on={on} onChange={onToggle} label={title} />
          {on && price && <span className="text-xs font-bold text-brand tabular-nums">{price}</span>}
        </div>
      </div>
      {on && children && <div className="mt-4 space-y-3 border-t border-dashed pt-4">{children}</div>}
    </div>
  );
}

/** A-la-carte Umrah builder: every service can be switched on/off separately. */
export function UmrahBuilder({ rates }: { rates: UmrahRates }) {
  const t = useT().umrah;
  const [s, setS] = useState<UmrahSelection>(DEFAULT_SELECTION);
  const set = <K extends keyof UmrahSelection>(k: K, v: UmrahSelection[K]) => setS((p) => ({ ...p, [k]: v }));
  const est = useMemo(() => umrahEstimate(s, rates), [s, rates]);
  const line = (key: string) => est.lines.find((l) => l.key === key)?.perPerson;
  const pp = (n?: number) => (n ? `${formatPrice(n)}${t.perPerson}` : undefined);
  const tierOpts = TIERS.map((v) => ({ value: v as Tier, label: t.tiers[v] }));

  // Summary for the team is always written in English (admin panel language).
  const en = dictionaries.en.umrah;
  const summary = [
    `Custom Umrah plan — ${s.travellers} traveller(s), ${est.days} days`,
    ...est.lines.map((l) => `• ${en.services[l.key]}: ${formatPrice(l.perPerson)} per person`),
    s.makkah.on ? `Makkah hotel: ${en.tiers[s.makkah.tier]}, ${s.makkah.nights} nights` : '',
    s.madinah.on ? `Madinah hotel: ${en.tiers[s.madinah.tier]}, ${s.madinah.nights} nights` : '',
    s.makkah.on || s.madinah.on ? `Room: ${en.sharing[s.sharing]}` : '',
    s.transport !== 'none' ? `Transport: ${en.transportOpts[s.transport]}` : '',
    s.ziyarat.makkah || s.ziyarat.madinah || s.ziyarat.taif ? `Ziyarat: ${(['makkah', 'madinah', 'taif'] as const).filter((k) => s.ziyarat[k]).map((k) => en.ziyaratOpts[k]).join(', ')}` : '',
    s.food !== 'none' ? `Food: ${en.foodOpts[s.food]}` : '',
    s.muallim !== 'none' ? `Muallim: ${en.muallimOpts[s.muallim]}` : '',
    `Online estimate: ${formatPrice(est.perPerson)} per person / ${formatPrice(est.total)} total`,
  ].filter(Boolean).join('\n');

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="space-y-3">
        {/* Travellers & room */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-border/70 sm:p-5">
          <span className="inline-flex items-center gap-3 font-bold text-ink"><Users className="size-5 text-brand" /> {t.travellers}</span>
          <Stepper value={s.travellers} min={1} max={40} onChange={(v) => set('travellers', v)} label={t.travellers} />
          <div className="w-full">
            <p className="mb-1.5 text-xs font-bold text-ink/60">{t.room}</p>
            <Chips value={s.sharing} onChange={(v) => set('sharing', v)} options={([4, 3, 2] as const).map((v) => ({ value: v, label: t.sharing[v] }))} />
          </div>
        </div>

        <ServiceCard icon={FileCheck2} title={t.services.visa} hint={t.visaHint} on={s.visa} onToggle={(v) => set('visa', v)} price={pp(line('visa'))} />

        <ServiceCard icon={Plane} title={t.services.flight} hint="Dhaka ⇄ Jeddah / Madinah" on={s.flight !== 'none'} onToggle={(v) => set('flight', v ? 'economy' : 'none')} price={pp(line('flight'))}>
          <Chips value={s.flight} onChange={(v) => set('flight', v)} options={(['economy', 'business'] as const).map((v) => ({ value: v, label: t.flightOpts[v] }))} />
        </ServiceCard>

        {(['makkah', 'madinah'] as const).map((city) => (
          <ServiceCard
            key={city}
            icon={BedDouble}
            title={t.services[`hotel-${city}`]}
            hint={t.hotelHint}
            on={s[city].on}
            onToggle={(v) => set(city, { ...s[city], on: v })}
            price={pp(line(`hotel-${city}`))}
          >
            <Chips value={s[city].tier} onChange={(v) => set(city, { ...s[city], tier: v })} options={tierOpts} />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink/70">{t.nightsLabel}</span>
              <Stepper value={s[city].nights} min={1} max={30} onChange={(v) => set(city, { ...s[city], nights: v })} label={t.nightsLabel} />
            </div>
          </ServiceCard>
        ))}

        <ServiceCard icon={Bus} title={t.services.transport} hint={t.transportHint} on={s.transport !== 'none'} onToggle={(v) => set('transport', v ? 'bus' : 'none')} price={pp(line('transport'))}>
          <Chips value={s.transport} onChange={(v) => set('transport', v)} options={(['bus', 'train', 'car'] as const).map((v) => ({ value: v, label: t.transportOpts[v] }))} />
        </ServiceCard>

        <ServiceCard
          icon={MapPinned}
          title={t.services.ziyarat}
          on={s.ziyarat.makkah || s.ziyarat.madinah || s.ziyarat.taif}
          onToggle={(v) => set('ziyarat', { makkah: v, madinah: v, taif: false })}
          price={pp(line('ziyarat'))}
        >
          <div className="flex flex-wrap gap-2">
            {(['makkah', 'madinah', 'taif'] as const).map((k) => (
              <label key={k} className={cn('inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ring-1', s.ziyarat[k] ? 'bg-brand-50 text-brand ring-brand/30' : 'bg-white text-ink/70 ring-border')}>
                <input type="checkbox" checked={s.ziyarat[k]} onChange={(e) => set('ziyarat', { ...s.ziyarat, [k]: e.target.checked })} className="size-4 accent-brand" />
                {t.ziyaratOpts[k]} <span className="text-xs font-normal text-muted-foreground">{formatPrice(rates.ziyarat[k])}</span>
              </label>
            ))}
          </div>
        </ServiceCard>

        <ServiceCard icon={UtensilsCrossed} title={t.services.food} on={s.food !== 'none'} onToggle={(v) => set('food', v ? 'full' : 'none')} price={pp(line('food'))}>
          <Chips value={s.food} onChange={(v) => set('food', v)} options={(['breakfast', 'full'] as const).map((v) => ({ value: v, label: t.foodOpts[v] }))} />
        </ServiceCard>

        <ServiceCard icon={UserRoundCheck} title={t.services.muallim} on={s.muallim !== 'none'} onToggle={(v) => set('muallim', v ? 'group' : 'none')} price={pp(line('muallim'))}>
          <Chips value={s.muallim} onChange={(v) => set('muallim', v)} options={(['group', 'private'] as const).map((v) => ({ value: v, label: t.muallimOpts[v] }))} />
        </ServiceCard>
      </div>

      {/* Summary */}
      <div className="lg:sticky lg:top-36 lg:self-start">
        <div className="overflow-hidden rounded-3xl bg-ink text-white shadow-2xl">
          <div className="bg-swoosh h-1.5" />
          <div className="p-5 sm:p-6">
            <p className="flex items-center gap-2 text-lg font-extrabold"><Receipt className="size-5 text-sun" /> {t.breakdown}</p>
            {est.lines.length ? (
              <ul className="mt-4 divide-y divide-white/10">
                {est.lines.map((l) => (
                  <li key={l.key} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="font-semibold">{t.services[l.key]}</span>
                    <span className="font-bold tabular-nums">{formatPrice(l.perPerson)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl bg-white/10 p-4 text-sm text-white/70">{t.nothing}</p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/60">{t.perPersonLabel}</p>
                <p key={est.perPerson} className="animate-fade-up text-2xl font-extrabold text-sun tabular-nums">{formatPrice(est.perPerson, '৳0')}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs text-white/60">{t.total(s.travellers)}</p>
                <p key={est.total} className="animate-fade-up text-2xl font-extrabold tabular-nums">{formatPrice(est.total, '৳0')}</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-white/50">{t.estimateNote}</p>
          </div>
        </div>
        <div id="umrah-book" className="mt-4 scroll-mt-36 rounded-3xl bg-white p-5 ring-1 ring-border/60 sm:p-6">
          <p className="text-lg font-extrabold text-ink">{t.sendPlan}</p>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">{t.sendPlanText}</p>
          <InquiryForm requestType="umrah" listingTitle={`Umrah custom plan · ${est.days} days`} showTravelFields attachment={summary} defaults={{ travelers: String(s.travellers) }} submitLabel={t.sendPlan} />
        </div>
      </div>
    </div>
  );
}
