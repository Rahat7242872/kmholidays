'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, ChevronDown, Copy, Loader2, Plus, Save, Star, Trash2 } from 'lucide-react';
import { saveUmrahSettings } from '@/app/admin/umrah-actions';
import { formatPrice } from '@/lib/site';
import { SERVICE_KEYS, TIERS, type ServiceKey, type UmrahConfig, type UmrahPackage, type UmrahRates } from '@/lib/umrah';
import { cn } from '@/lib/utils';

const SERVICE_LABEL: Record<ServiceKey, string> = { visa: 'Visa', flight: 'Air ticket', hotel: 'Hotel', transport: 'Transport', ziyarat: 'Ziyarat', food: 'Food', muallim: 'Muallim' };

const input = 'w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15';
const label = 'mb-1 block text-[11px] font-bold text-ink/60';

function Money({ value, onChange, name }: { value: number; onChange: (v: number) => void; name: string }) {
  return (
    <label className="block">
      <span className={label}>{name}</span>
      <span className="flex items-center rounded-lg border border-input bg-white focus-within:border-brand">
        <span className="pl-3 text-sm text-muted-foreground">৳</span>
        <input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full bg-transparent px-2 py-2 text-sm outline-none" />
      </span>
    </label>
  );
}

function RateGroup({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-paper p-4">
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="mb-3 text-[11px] text-muted-foreground">{hint}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </div>
  );
}

function newPackage(n: number): UmrahPackage {
  return {
    id: `package-${Date.now()}`, name: `New Umrah package ${n}`, nameBn: '', tier: 'standard', makkahNights: 7, madinahNights: 4,
    makkahHotel: '', madinahHotel: '', makkahDistance: '', madinahDistance: '', muallim: '', muallimNote: '', departure: '', seats: null, price: 0,
    includes: [...SERVICE_KEYS], featured: false,
  };
}

export function UmrahEditor({ initial }: { initial: UmrahConfig }) {
  const [config, setConfig] = useState(initial);
  const [open, setOpen] = useState<string | null>(initial.packages[0]?.id ?? null);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  const rates = config.rates;

  const setRate = <K extends keyof UmrahRates>(k: K, v: UmrahRates[K]) => setConfig((c) => ({ ...c, rates: { ...c.rates, [k]: v } }));
  const setPkg = (id: string, patch: Partial<UmrahPackage>) => setConfig((c) => ({ ...c, packages: c.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

  function save() {
    setStatus(null);
    start(async () => {
      const res = await saveUmrahSettings(config);
      setStatus(res);
    });
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Packages */}
      <section className="rounded-2xl bg-white p-5 ring-1 ring-border/70 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">Muallim-led packages</h2>
            <p className="text-sm text-muted-foreground">Shown on the Umrah page. Price is per person.</p>
          </div>
          <button
            type="button"
            onClick={() => { const p = newPackage(config.packages.length + 1); setConfig((c) => ({ ...c, packages: [...c.packages, p] })); setOpen(p.id); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus className="size-4" /> Add package
          </button>
        </div>

        <div className="space-y-3">
          {config.packages.map((p, i) => {
            const isOpen = open === p.id;
            return (
              <div key={p.id} className={cn('overflow-hidden rounded-xl ring-1', isOpen ? 'ring-brand/40' : 'ring-border')}>
                <button type="button" onClick={() => setOpen(isOpen ? null : p.id)} className="flex w-full items-center gap-3 bg-paper px-4 py-3 text-left">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand text-xs font-bold text-white">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 truncate font-bold">{p.name}{p.featured && <Star className="size-3.5 fill-sun text-sun" />}</span>
                    <span className="block truncate text-xs text-muted-foreground">{p.tier} · {p.makkahNights}N + {p.madinahNights}N · {formatPrice(p.price)} · {p.muallim || 'no muallim set'}</span>
                  </span>
                  <ChevronDown className={cn('size-5 shrink-0 transition', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="space-y-4 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block"><span className={label}>Name (English)</span><input className={input} value={p.name} onChange={(e) => setPkg(p.id, { name: e.target.value })} /></label>
                      <label className="block"><span className={label}>Name (বাংলা)</span><input className={input} value={p.nameBn} onChange={(e) => setPkg(p.id, { nameBn: e.target.value })} /></label>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <label className="block"><span className={label}>Tier</span>
                        <select className={input} value={p.tier} onChange={(e) => setPkg(p.id, { tier: e.target.value as UmrahPackage['tier'] })}>
                          {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </label>
                      <label className="block"><span className={label}>Makkah nights</span><input type="number" min={0} className={input} value={p.makkahNights} onChange={(e) => setPkg(p.id, { makkahNights: Number(e.target.value) })} /></label>
                      <label className="block"><span className={label}>Madinah nights</span><input type="number" min={0} className={input} value={p.madinahNights} onChange={(e) => setPkg(p.id, { madinahNights: Number(e.target.value) })} /></label>
                      <Money name="Price per person" value={p.price} onChange={(v) => setPkg(p.id, { price: v })} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block"><span className={label}>Makkah hotel</span><input className={input} value={p.makkahHotel} onChange={(e) => setPkg(p.id, { makkahHotel: e.target.value })} placeholder="e.g. Swissôtel Al Maqam" /></label>
                      <label className="block"><span className={label}>Distance to Haram</span><input className={input} value={p.makkahDistance} onChange={(e) => setPkg(p.id, { makkahDistance: e.target.value })} placeholder="e.g. ~200 m" /></label>
                      <label className="block"><span className={label}>Madinah hotel</span><input className={input} value={p.madinahHotel} onChange={(e) => setPkg(p.id, { madinahHotel: e.target.value })} /></label>
                      <label className="block"><span className={label}>Distance to Masjid an-Nabawi</span><input className={input} value={p.madinahDistance} onChange={(e) => setPkg(p.id, { madinahDistance: e.target.value })} /></label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block"><span className={label}>Muallim name</span><input className={input} value={p.muallim} onChange={(e) => setPkg(p.id, { muallim: e.target.value })} placeholder="e.g. Maulana Abdur Rahman" /></label>
                      <label className="block"><span className={label}>About the muallim</span><input className={input} value={p.muallimNote} onChange={(e) => setPkg(p.id, { muallimNote: e.target.value })} placeholder="e.g. 12 years guiding Umrah groups" /></label>
                      <label className="block"><span className={label}>Departure</span><input className={input} value={p.departure} onChange={(e) => setPkg(p.id, { departure: e.target.value })} placeholder="e.g. 15 Jan 2027 or Every Friday" /></label>
                      <label className="block"><span className={label}>Seats left (optional)</span><input type="number" min={0} className={input} value={p.seats ?? ''} onChange={(e) => setPkg(p.id, { seats: e.target.value === '' ? null : Number(e.target.value) })} /></label>
                    </div>
                    <div>
                      <p className={label}>Included services</p>
                      <div className="flex flex-wrap gap-2">
                        {SERVICE_KEYS.map((k) => {
                          const on = p.includes.includes(k);
                          return (
                            <button key={k} type="button" onClick={() => setPkg(p.id, { includes: on ? p.includes.filter((x) => x !== k) : [...p.includes, k] })}
                              className={cn('rounded-full px-3 py-1.5 text-xs font-bold ring-1', on ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-white text-ink/50 ring-border')}>
                              {on ? '✓ ' : ''}{SERVICE_LABEL[k]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
                        <input type="checkbox" checked={p.featured} onChange={(e) => setPkg(p.id, { featured: e.target.checked })} className="size-4 accent-brand" /> Highlight as “Most popular”
                      </label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { const copy = { ...p, id: `${p.id}-copy-${Date.now()}`, name: `${p.name} (copy)` }; setConfig((c) => ({ ...c, packages: [...c.packages, copy] })); setOpen(copy.id); }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-bold"><Copy className="size-3.5" /> Duplicate</button>
                        <button type="button" onClick={() => { if (confirm(`Delete “${p.name}”?`)) setConfig((c) => ({ ...c, packages: c.packages.filter((x) => x.id !== p.id) })); }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"><Trash2 className="size-3.5" /> Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!config.packages.length && <p className="rounded-xl border-2 border-dashed py-8 text-center text-sm text-muted-foreground">No packages — add one.</p>}
        </div>
      </section>

      {/* Rates */}
      <section className="rounded-2xl bg-white p-5 ring-1 ring-border/70 sm:p-6">
        <h2 className="text-lg font-extrabold">Service rates (custom builder)</h2>
        <p className="mb-4 text-sm text-muted-foreground">Customers switch each service on or off on the Umrah page; these rates drive the live estimate.</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <RateGroup title="Visa" hint="Per person — visa, insurance & processing">
            <Money name="Umrah visa" value={rates.visa} onChange={(v) => setRate('visa', v)} />
          </RateGroup>
          <RateGroup title="Air ticket" hint="Per person, Dhaka ⇄ Jeddah/Madinah return">
            <Money name="Economy" value={rates.flight.economy} onChange={(v) => setRate('flight', { ...rates.flight, economy: v })} />
            <Money name="Business" value={rates.flight.business} onChange={(v) => setRate('flight', { ...rates.flight, business: v })} />
          </RateGroup>
          <RateGroup title="Makkah hotel" hint="Per ROOM per night (split between room-mates)">
            {TIERS.map((t) => <Money key={t} name={t} value={rates.makkahRoom[t]} onChange={(v) => setRate('makkahRoom', { ...rates.makkahRoom, [t]: v })} />)}
          </RateGroup>
          <RateGroup title="Madinah hotel" hint="Per ROOM per night">
            {TIERS.map((t) => <Money key={t} name={t} value={rates.madinahRoom[t]} onChange={(v) => setRate('madinahRoom', { ...rates.madinahRoom, [t]: v })} />)}
          </RateGroup>
          <RateGroup title="Transport" hint="Per person — airport transfers + Makkah ⇄ Madinah">
            <Money name="AC bus" value={rates.transport.bus} onChange={(v) => setRate('transport', { ...rates.transport, bus: v })} />
            <Money name="Haramain train" value={rates.transport.train} onChange={(v) => setRate('transport', { ...rates.transport, train: v })} />
            <Money name="Private car" value={rates.transport.car} onChange={(v) => setRate('transport', { ...rates.transport, car: v })} />
          </RateGroup>
          <RateGroup title="Ziyarat" hint="Per person">
            <Money name="Makkah" value={rates.ziyarat.makkah} onChange={(v) => setRate('ziyarat', { ...rates.ziyarat, makkah: v })} />
            <Money name="Madinah" value={rates.ziyarat.madinah} onChange={(v) => setRate('ziyarat', { ...rates.ziyarat, madinah: v })} />
            <Money name="Taif trip" value={rates.ziyarat.taif} onChange={(v) => setRate('ziyarat', { ...rates.ziyarat, taif: v })} />
          </RateGroup>
          <RateGroup title="Food" hint="Per person per day">
            <Money name="Breakfast only" value={rates.food.breakfast} onChange={(v) => setRate('food', { ...rates.food, breakfast: v })} />
            <Money name="3 meals" value={rates.food.full} onChange={(v) => setRate('food', { ...rates.food, full: v })} />
          </RateGroup>
          <RateGroup title="Muallim" hint="Group: per person · Private: per group, whole trip">
            <Money name="Group muallim" value={rates.muallim.group} onChange={(v) => setRate('muallim', { ...rates.muallim, group: v })} />
            <Money name="Private muallim" value={rates.muallim.private} onChange={(v) => setRate('muallim', { ...rates.muallim, private: v })} />
          </RateGroup>
        </div>
      </section>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className={cn('text-sm font-semibold', status ? (status.ok ? 'text-emerald-600' : 'text-destructive') : 'text-muted-foreground')}>
            {status ? <span className="inline-flex items-center gap-1.5">{status.ok && <CheckCircle2 className="size-4" />} {status.message}</span> : 'Changes are not live until you save.'}
          </p>
          <button type="button" onClick={save} disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-70">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
