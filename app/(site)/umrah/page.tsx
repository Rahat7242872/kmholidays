import type { Metadata } from 'next';
import Link from 'next/link';
import { BedDouble, CalendarDays, Check, ChevronDown, Landmark, MapPin, Phone, UserRoundCheck, Users, X } from 'lucide-react';
import { InquiryForm } from '@/components/site/inquiry-form';
import { SafeImage } from '@/components/site/safe-image';
import { UmrahBuilder } from '@/components/umrah/umrah-builder';
import { UmrahGuideTabs } from '@/components/umrah/umrah-guide-tabs';
import { dictionaries } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { contacts, formatPrice } from '@/lib/site';
import { FAQ, ZIYARAT, pick } from '@/lib/umrah-guide';
import { getUmrahConfig } from '@/lib/umrah-server';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Umrah Packages — A to Z Guide, Muallim & Cost Builder',
  description: 'Umrah from Bangladesh: muallim-led packages, build your own plan (visa, ticket, hotel, transport, ziyarat, food), and a complete A to Z Umrah guide in Bangla & English.',
};

const ZIYARAT_IMAGES = {
  makkah: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80',
  madinah: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80',
  taif: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
};

export default async function UmrahPage({ searchParams }: { searchParams: Promise<{ package?: string }> }) {
  const [locale, config, sp] = await Promise.all([getLocale(), getUmrahConfig(), searchParams]);
  const t = dictionaries[locale].umrah;
  const en = dictionaries.en.umrah;
  const selected = config.packages.find((p) => p.id === sp.package);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink">
        <SafeImage src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=2200&q=80" alt="" className="absolute inset-0 -z-20 size-full animate-slow-zoom opacity-60" priority />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sun ring-1 ring-white/15">
              <Landmark className="size-3.5" /> {t.badge}
            </span>
            <h1 className="mt-4 text-3xl leading-tight font-extrabold text-white sm:text-5xl">
              {t.title1} <span className="text-swoosh">{t.title2}</span>
            </h1>
            <p className="mt-3 text-white/80 sm:text-lg">{t.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href="#packages" className="rounded-xl bg-cta px-5 py-3 font-bold text-white shadow-lg shadow-cta/30 hover:bg-cta-600">{t.ctaPackages}</a>
              <a href="#builder" className="rounded-xl bg-white px-5 py-3 font-bold text-ink hover:bg-white/90">{t.ctaBuild}</a>
              <a href={`tel:${contacts[0].tel}`} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-bold text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/20">
                <Phone className="size-4" /> {contacts[0].display}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section nav */}
      <nav className="no-scrollbar sticky top-[71px] z-20 flex gap-1 overflow-x-auto border-b bg-white/95 px-4 backdrop-blur sm:top-[83px] sm:justify-center">
        {(['packages', 'builder', 'guide', 'ziyarat', 'faq'] as const).map((id) => (
          <a key={id} href={`#${id}`} className="shrink-0 px-3 py-3.5 text-sm font-bold text-ink/70 hover:text-brand">{t.nav[id]}</a>
        ))}
      </nav>

      {/* Muallim-led packages */}
      <section id="packages" className="reveal mx-auto max-w-7xl scroll-mt-36 px-4 pt-10 sm:px-6 sm:pt-14">
        <h2 className="text-2xl font-extrabold text-ink sm:text-[32px]">{t.packagesTitle}</h2>
        <p className="mt-1 max-w-3xl text-muted-foreground">{t.packagesText}</p>

        {selected && (
          <div id="book-package" className="mt-6 scroll-mt-36 overflow-hidden rounded-3xl bg-white ring-2 ring-brand/30">
            <div className="flex items-center justify-between gap-3 bg-brand-50 px-5 py-4">
              <p className="font-extrabold text-ink">{t.bookPackage}: <span className="text-brand">{locale === 'bn' ? selected.nameBn : selected.name}</span></p>
              <Link href="/umrah#packages" aria-label="Close" className="grid size-8 place-items-center rounded-full bg-white"><X className="size-4" /></Link>
            </div>
            <div className="p-5 sm:p-6">
              <InquiryForm
                requestType="umrah"
                listingTitle={`Umrah package: ${selected.name}`}
                showTravelFields
                attachment={`Package: ${selected.name} (${en.tiers[selected.tier]})\nMakkah ${selected.makkahNights}N · Madinah ${selected.madinahNights}N\nDeparture: ${selected.departure}\nMuallim: ${selected.muallim}\nPrice: ${formatPrice(selected.price)} per person`}
                submitLabel={t.bookPackage}
              />
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {config.packages.map((p) => (
            <article key={p.id} className={cn('relative flex flex-col overflow-hidden rounded-3xl bg-white ring-1 transition hover:-translate-y-1 hover:shadow-2xl', p.featured ? 'shadow-xl ring-2 ring-brand' : 'ring-border/60')}>
              <div className={cn('relative p-5 text-white', p.tier === 'premium' ? 'bg-gradient-to-br from-ink via-grape to-cta-600' : p.tier === 'standard' ? 'bg-gradient-to-br from-ink to-brand-700' : 'bg-gradient-to-br from-emerald-800 to-teal')}>
                {p.featured && <span className="bg-swoosh absolute top-4 right-4 rounded-full px-3 py-1 text-[11px] font-bold">{t.mostPopular}</span>}
                <p className="text-xs font-bold tracking-wide text-white/70 uppercase">{t.tiers[p.tier]}</p>
                <h3 className="mt-1 pr-24 text-xl leading-snug font-extrabold">{locale === 'bn' ? p.nameBn || p.name : p.name}</h3>
                <p className="mt-2 text-sm text-white/80">{t.days(p.makkahNights + p.madinahNights + 1)} · {t.nights(p.makkahNights, p.madinahNights)}</p>
              </div>

              <div className="flex flex-1 flex-col p-5">
                {/* Muallim */}
                <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
                  <span className="bg-swoosh grid size-11 shrink-0 place-items-center rounded-full text-white"><UserRoundCheck className="size-5" /></span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-brand">{t.muallim}</p>
                    <p className="truncate font-bold text-ink">{p.muallim}</p>
                    {p.muallimNote && <p className="truncate text-xs text-muted-foreground">{p.muallimNote}</p>}
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-ink/80">
                  <li className="flex items-start gap-2.5"><BedDouble className="mt-0.5 size-4 shrink-0 text-brand" /> <span><strong>Makkah:</strong> {p.makkahHotel} <span className="text-muted-foreground">({p.makkahDistance})</span></span></li>
                  <li className="flex items-start gap-2.5"><BedDouble className="mt-0.5 size-4 shrink-0 text-brand" /> <span><strong>Madinah:</strong> {p.madinahHotel} <span className="text-muted-foreground">({p.madinahDistance})</span></span></li>
                  <li className="flex items-center gap-2.5"><CalendarDays className="size-4 shrink-0 text-brand" /> {t.departure}: <strong>{p.departure}</strong></li>
                  {p.seats ? <li className="flex items-center gap-2.5 font-semibold text-cta-600"><Users className="size-4 shrink-0" /> {t.seatsLeft(p.seats)}</li> : null}
                </ul>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.includes.map((k) => (
                    <span key={k} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"><Check className="size-3" /> {t.services[k]}</span>
                  ))}
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed pt-4">
                  <div>
                    <p className="text-[11px] text-muted-foreground">{t.estimated}</p>
                    <p className="text-2xl font-extrabold text-ink">{formatPrice(p.price)}<span className="text-sm font-medium text-muted-foreground">{t.perPerson}</span></p>
                  </div>
                  <Link href={`/umrah?package=${p.id}#book-package`} scroll className={cn('rounded-xl px-4 py-3 text-sm font-bold transition', p.featured ? 'bg-cta text-white hover:bg-cta-600' : 'bg-brand text-white hover:bg-brand-700')}>
                    {t.bookPackage}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Builder */}
      <section id="builder" className="mx-auto max-w-7xl scroll-mt-36 px-4 pt-12 sm:px-6 sm:pt-16">
        <h2 className="text-2xl font-extrabold text-ink sm:text-[32px]">{t.builderTitle}</h2>
        <p className="mt-1 mb-6 max-w-3xl text-muted-foreground">{t.builderText}</p>
        <UmrahBuilder rates={config.rates} />
      </section>

      {/* Guide */}
      <section id="guide" className="mx-auto max-w-7xl scroll-mt-36 px-4 pt-12 sm:px-6 sm:pt-16">
        <h2 className="text-2xl font-extrabold text-ink sm:text-[32px]">{t.guideTitle}</h2>
        <p className="mt-1 mb-6 text-muted-foreground">{t.guideText}</p>
        <UmrahGuideTabs />
      </section>

      {/* Ziyarat */}
      <section id="ziyarat" className="reveal mx-auto max-w-7xl scroll-mt-36 px-4 pt-12 sm:px-6 sm:pt-16">
        <h2 className="text-2xl font-extrabold text-ink sm:text-[32px]">{t.ziyaratTitle}</h2>
        <p className="mt-1 mb-6 text-muted-foreground">{t.ziyaratText}</p>
        <div className="grid gap-5 lg:grid-cols-3">
          {ZIYARAT.map((group) => (
            <section key={group.city} className="overflow-hidden rounded-3xl bg-white ring-1 ring-border/60">
              <div className="relative h-36">
                <SafeImage src={ZIYARAT_IMAGES[group.city]} alt="" className="absolute inset-0 size-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-ink/10" />
                <h3 className="absolute bottom-4 left-5 flex items-center gap-2 text-2xl font-extrabold text-white"><MapPin className="size-5 text-sun" /> {pick(group.label, locale)}</h3>
              </div>
              <ul className="divide-y">
                {group.places.map((place, i) => (
                  <li key={i} className="flex gap-3 p-4">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand">{i + 1}</span>
                    <div>
                      <p className="font-bold text-ink">{pick(place.name, locale)}</p>
                      <p className="text-sm text-muted-foreground">{pick(place.about, locale)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="reveal mx-auto max-w-4xl scroll-mt-36 px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="text-2xl font-extrabold text-ink sm:text-[32px]">{t.faqTitle}</h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((f, i) => (
            <details key={i} className="group rounded-2xl bg-white ring-1 ring-border/60 open:ring-brand/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-bold text-ink">
                {pick(f.q, locale)}
                <ChevronDown className="size-5 shrink-0 text-brand transition group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-sm text-muted-foreground">{pick(f.a, locale)}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
