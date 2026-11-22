'use client';

import { useState } from 'react';
import { Ban, BookOpenCheck, Check, FileText, Footprints, Landmark, Luggage, MapPin, ShieldAlert, Sparkles } from 'lucide-react';
import { useLocale, useT } from '@/components/i18n-provider';
import { AMAL, DOCUMENTS, IHRAM, PACKING, UMRAH_STEPS, pick } from '@/lib/umrah-guide';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'steps', icon: Footprints },
  { key: 'ihram', icon: ShieldAlert },
  { key: 'amal', icon: Sparkles },
  { key: 'docs', icon: FileText },
] as const;

function Arabic({ children }: { children: React.ReactNode }) {
  return <p dir="rtl" lang="ar" className="text-right font-serif text-xl leading-loose text-ink sm:text-2xl">{children}</p>;
}

export function UmrahGuideTabs() {
  const t = useT().umrah;
  const locale = useLocale();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('steps');

  return (
    <div>
      <div role="tablist" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn('inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition', tab === key ? 'bg-brand text-white shadow-lg shadow-brand/25' : 'bg-white text-ink/70 ring-1 ring-border hover:text-brand')}
          >
            <Icon className="size-4" /> {t.tabs[key]}
          </button>
        ))}
      </div>

      <div key={tab} className="mt-6 animate-fade-up">
        {tab === 'steps' && (
          <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-0.5 before:bg-gradient-to-b before:from-brand before:via-cta before:to-teal sm:before:left-[23px]">
            {UMRAH_STEPS.map((step, i) => (
              <li key={i} className="relative flex gap-4 sm:gap-5">
                <span className="bg-swoosh relative z-10 grid size-10 shrink-0 place-items-center rounded-full text-base font-extrabold text-white shadow-lg ring-4 ring-paper sm:size-12 sm:text-lg">{i + 1}</span>
                <div className="min-w-0 flex-1 rounded-2xl bg-white p-5 ring-1 ring-border/60 sm:p-6">
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-cta/10 px-2.5 py-1 text-xs font-bold text-cta-600"><MapPin className="size-3.5" /> {pick(step.place, locale)}</p>
                  <h3 className="mt-2 text-xl font-extrabold text-ink">{pick(step.title, locale)}</h3>
                  <ul className="mt-3 space-y-2">
                    {step.doThis.map((d, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-[15px] text-ink/85"><Check className="mt-1 size-4 shrink-0 text-emerald-600" /> {pick(d, locale)}</li>
                    ))}
                  </ul>
                  {step.dua && (
                    <div className="mt-4 rounded-xl bg-brand-50 p-4">
                      <p className="mb-1 text-xs font-bold text-brand">{t.dua}</p>
                      <Arabic>{step.dua.arabic}</Arabic>
                      <p className="mt-1 text-sm text-ink/70"><span className="font-semibold">{t.meaning}:</span> {pick(step.dua.meaning, locale)}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        {tab === 'ihram' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl bg-white p-6 ring-1 ring-border/60">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink"><BookOpenCheck className="size-5 text-emerald-600" /> {t.beforeIhram}</h3>
              <ul className="mt-4 space-y-2.5">
                {IHRAM.before.map((b, i) => <li key={i} className="flex items-start gap-2.5 text-[15px] text-ink/85"><Check className="mt-1 size-4 shrink-0 text-emerald-600" /> {pick(b, locale)}</li>)}
              </ul>
            </section>
            <section className="rounded-2xl bg-white p-6 ring-1 ring-border/60">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink"><Ban className="size-5 text-red-600" /> {t.forbidden}</h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {IHRAM.forbidden.map((f, i) => <li key={i} className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-900"><Ban className="mt-0.5 size-4 shrink-0" /> {pick(f, locale)}</li>)}
              </ul>
            </section>
            <section className="rounded-2xl bg-ink p-6 text-white lg:col-span-2">
              <p className="text-sm font-bold text-sun">{t.talbiyah}</p>
              <p dir="rtl" lang="ar" className="mt-3 text-right font-serif text-2xl leading-loose sm:text-3xl">{IHRAM.talbiyah.arabic}</p>
              <p className="mt-3 text-sm text-white/70 italic">{IHRAM.talbiyah.transliteration}</p>
              <p className="mt-2 text-[15px] text-white/90"><span className="font-semibold text-sun">{t.meaning}:</span> {pick(IHRAM.talbiyah.meaning, locale)}</p>
            </section>
          </div>
        )}

        {tab === 'amal' && (
          <div className="grid gap-5 lg:grid-cols-2">
            {(['makkah', 'madinah'] as const).map((city) => (
              <section key={city} className="overflow-hidden rounded-2xl bg-white ring-1 ring-border/60">
                <div className={cn('flex items-center gap-3 p-5 text-white', city === 'makkah' ? 'bg-gradient-to-r from-ink to-brand-700' : 'bg-gradient-to-r from-emerald-800 to-teal')}>
                  <Landmark className="size-6" />
                  <h3 className="text-xl font-extrabold">{city === 'makkah' ? t.makkahAmal : t.madinahAmal}</h3>
                </div>
                <ul className="space-y-3 p-5">
                  {AMAL[city].map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-ink/85">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand">{i + 1}</span> {pick(a, locale)}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {tab === 'docs' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl bg-white p-6 ring-1 ring-border/60">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink"><FileText className="size-5 text-brand" /> {t.documents}</h3>
              <ul className="mt-4 space-y-2.5">
                {DOCUMENTS.map((d, i) => <li key={i} className="flex items-start gap-2.5 text-[15px] text-ink/85"><Check className="mt-1 size-4 shrink-0 text-emerald-600" /> {pick(d, locale)}</li>)}
              </ul>
            </section>
            <section className="rounded-2xl bg-white p-6 ring-1 ring-border/60">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink"><Luggage className="size-5 text-brand" /> {t.packing}</h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {PACKING.map((p, i) => <li key={i} className="flex items-start gap-2 rounded-xl bg-paper px-3 py-2.5 text-sm text-ink/85"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {pick(p, locale)}</li>)}
              </ul>
            </section>
          </div>
        )}

        <p className="mt-6 flex items-start gap-2 rounded-xl bg-sun/10 p-4 text-sm text-ink/80 ring-1 ring-sun/30">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-cta-600" /> {t.scholarNote}
        </p>
      </div>
    </div>
  );
}
