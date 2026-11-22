import Link from 'next/link';
import { BadgeCheck, ChevronRight, Clock, Headset, Landmark, MapPin, MessageCircle, Phone, ShieldCheck, Tag, Wallet, Zap } from 'lucide-react';
import { GUIDE_ITEM, NAV_ITEMS, navLabel, navSub } from '@/components/site/nav-items';
import { getLocale } from '@/lib/i18n-server';
import { dictionaries } from '@/lib/i18n';
import { PURPOSES } from '@/lib/go-abroad';
import { CategoryIcon } from '@/components/site/category-icon';
import { DealsCarousel } from '@/components/site/deals-carousel';
import { HeroBackdrop } from '@/components/site/hero-backdrop';
import { HeroSearch, type SearchSuggestions } from '@/components/site/hero-search';
import { InquiryForm } from '@/components/site/inquiry-form';
import { SafeImage } from '@/components/site/safe-image';
import { SectionHeading } from '@/components/site/section-heading';
import { WorldRoutes } from '@/components/site/world-routes';
import { getListings } from '@/lib/data';
import { categoryList, CATEGORIES, contacts, flagFor, formatPrice, site, type Category } from '@/lib/site';
import type { Listing } from '@/lib/types';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const shortcutText: Record<Category, string> = {
  tour: 'Holiday packages',
  hotel: 'Home & abroad',
  visa: 'Fast processing',
  esim: 'Data abroad',
  service: 'Tickets & more',
};

function cheapest(items: Listing[]) {
  return items.filter((l) => l.price).sort((a, b) => a.price! - b.price!)[0];
}

/** "Bali, Indonesia" -> "Indonesia"; used to group destinations. */
function country(location: string) {
  const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = dictionaries[locale];
  const all = await getListings();
  const by = (c: Category) => all.filter((l) => l.category === c);
  const tours = by('tour');
  const visas = by('visa');
  const esims = by('esim');

  const deals = all.filter((l) => l.featured && (l.category === 'tour' || l.category === 'hotel' || l.badge));
  const dealTabs = CATEGORIES.filter((c) => deals.some((d) => d.category === c));

  const suggestions: SearchSuggestions = Object.fromEntries(
    CATEGORIES.map((c) => [c, [...new Set(by(c).flatMap((l) => [l.location, c === 'service' ? l.title : '']).filter(Boolean))]]),
  );

  // Popular destinations: group tours + hotels by country.
  const destMap = new Map<string, { name: string; image: string; count: number; from: number | null }>();
  for (const l of [...tours, ...by('hotel')]) {
    const name = country(l.location);
    if (!name) continue;
    const d = destMap.get(name) ?? { name, image: l.image, count: 0, from: null };
    d.count += 1;
    if (l.price && (d.from === null || l.price < d.from)) d.from = l.price;
    destMap.set(name, d);
  }
  const destinations = [...destMap.values()].sort((a, b) => b.count - a.count).slice(0, 6);

  const promoVisa = cheapest(visas);
  const promoEsim = cheapest(esims);
  const promoTour = tours.find((t) => t.featured) ?? tours[0];

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink pb-10">
        <HeroBackdrop />
        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-ink/95 via-ink/75 to-brand-700/30" />
        <div className="absolute inset-x-0 bottom-0 -z-20 h-2/3 bg-gradient-to-t from-ink/90 to-transparent" />
        {/* Logo-colour glows + swoosh arcs */}
        <div className="pointer-events-none absolute -top-32 -left-24 -z-10 size-[420px] rounded-full bg-grape/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 -z-10 size-[380px] rounded-full bg-teal/25 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-[8%] -z-10 size-[300px] rounded-full bg-cta/20 blur-3xl" />
        <svg className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full w-full" viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="hero-arc" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#8a3d96" stopOpacity="0" />
              <stop offset="0.45" stopColor="#e8592b" stopOpacity=".55" />
              <stop offset="0.7" stopColor="#f7941d" stopOpacity=".5" />
              <stop offset="1" stopColor="#17a3b8" stopOpacity=".6" />
            </linearGradient>
          </defs>
          <path d="M-40 560 Q520 120 1480 60" fill="none" stroke="url(#hero-arc)" strokeWidth="3" />
          <path d="M-40 600 Q600 200 1480 120" fill="none" stroke="url(#hero-arc)" strokeWidth="1.5" strokeDasharray="2 10" />
        </svg>

        <div className="mx-auto max-w-7xl px-4 pt-9 sm:px-6 sm:pt-14 lg:pt-16">
          <div className="max-w-3xl animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 py-1.5 pr-3.5 pl-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
              <span className="bg-swoosh rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide">{t.hero.oneStop}</span>
              {t.hero.badge}
            </p>
            <h1 className="mt-4 text-[36px] leading-[1.08] font-extrabold text-white sm:text-5xl lg:text-[60px]">
              {t.hero.title1} <span className="text-swoosh">{t.hero.title2}</span>
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] text-white/80 sm:text-lg">
              {t.hero.subtitle}
            </p>
          </div>
          <div className="mt-7 animate-fade-up [animation-delay:120ms] sm:mt-9">
            <HeroSearch suggestions={suggestions} />
          </div>
          <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto text-[13px] text-white/85">
            {[
              { icon: BadgeCheck, text: t.hero.chip1 },
              { icon: Tag, text: t.hero.chip2 },
              { icon: Headset, text: t.hero.chip3 },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 ring-1 ring-white/10 backdrop-blur">
                <Icon className="size-4 text-sun" /> {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE SHORTCUTS */}
      <section className="reveal mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-7">
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ animationDelay: `${i * 60}ms` }}
              className="group flex min-w-0 animate-fade-up flex-col items-center gap-1.5 rounded-2xl bg-white px-1 py-3 text-center ring-1 ring-border/60 transition hover:-translate-y-1 hover:shadow-lg hover:ring-brand/30 sm:gap-2 sm:p-4"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand transition group-hover:scale-110 group-hover:bg-brand group-hover:text-white sm:size-14">
                <item.icon className="size-[22px] sm:size-6" />
              </span>
              <span className="w-full truncate text-[11.5px] font-bold text-ink sm:text-sm">{navLabel(t, item.key)}</span>
              <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">{navSub(t, item.key)}</span>
            </Link>
          ))}
          <Link
            href={GUIDE_ITEM.href}
            className="group flex min-w-0 flex-col items-center gap-1.5 rounded-2xl bg-gradient-to-br from-brand to-grape px-1 py-3 text-center text-white transition hover:-translate-y-1 hover:shadow-lg sm:gap-2 sm:p-4 lg:hidden"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-white/15 sm:size-14"><GUIDE_ITEM.icon className="size-[22px] sm:size-6" /></span>
            <span className="w-full truncate text-[11.5px] font-bold sm:text-sm">{t.home.guideShort}</span>
          </Link>
        </div>
      </section>

      {/* GO ABROAD GUIDE TEASER */}
      <section className="reveal mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-brand-700 to-grape p-6 text-white sm:p-10">
          <div className="pointer-events-none absolute -right-16 -bottom-20 size-80 rounded-full bg-teal/30 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sun ring-1 ring-white/15">
                <GUIDE_ITEM.icon className="size-3.5" /> {t.home.guideBadge}
              </span>
              <h2 className="mt-3 text-2xl leading-tight font-extrabold sm:text-4xl">{t.home.guideTitle1} <span className="text-swoosh">{t.home.guideTitle2}</span> {t.home.guideTitle3}</h2>
              <p className="mt-3 text-white/75">{t.home.guideText}</p>
              <Link href={GUIDE_ITEM.href} className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-sun px-5 py-3 font-bold text-ink transition hover:brightness-95">
                {t.home.guideCta} <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PURPOSES.map((p, i) => (
                <Link
                  key={p.key}
                  href={`${GUIDE_ITEM.href}?purpose=${p.key}`}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className="group animate-fade-up rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur transition hover:-translate-y-1 hover:bg-white hover:text-ink"
                >
                  <span className="block text-3xl transition group-hover:scale-110">{p.emoji}</span>
                  <span className="mt-2 block font-bold">{locale === 'bn' ? p.labelBn : p.label}</span>
                  <span className="block text-xs opacity-70">{locale === 'bn' ? p.blurbBn : p.blurb}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROMO BANNERS */}
      <section className="reveal mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
          {[
            promoTour && { href: `/tours/${promoTour.slug}`, tag: promoTour.badge || t.home.featuredTour, title: promoTour.title, sub: `${promoTour.duration} · ${t.home.from} ${formatPrice(promoTour.price)}`, image: promoTour.image, tone: 'from-brand-700/95 via-brand/70' },
            promoVisa && { href: '/visa', tag: t.home.visaProcessing, title: t.home.visaFrom(formatPrice(promoVisa.price)), sub: t.home.visaPromoSub, image: promoVisa.image, tone: 'from-ink/95 via-ink/70' },
            promoEsim && { href: '/esim', tag: t.home.travelEsim, title: t.home.esimFrom(formatPrice(promoEsim.price)), sub: t.home.esimPromoSub, image: promoEsim.image, tone: 'from-cta-600/95 via-cta/70' },
          ]
            .filter((p): p is NonNullable<typeof p> => !!p)
            .map((p) => (
              <Link key={p.href} href={p.href} className="group relative isolate flex aspect-[16/8] w-[85%] shrink-0 snap-start flex-col justify-center overflow-hidden rounded-2xl p-5 text-white sm:w-auto">
                <SafeImage src={p.image} alt="" className="absolute inset-0 -z-20 size-full transition duration-700 group-hover:scale-105" />
                <div className={cn('absolute inset-0 -z-10 bg-gradient-to-r to-transparent', p.tone)} />
                <span className="w-fit rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-bold backdrop-blur">{p.tag}</span>
                <p className="mt-2 max-w-[70%] text-xl leading-tight font-extrabold">{p.title}</p>
                <p className="mt-1 max-w-[70%] text-xs text-white/85">{p.sub}</p>
                <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink">
                  {t.home.bookNow} <ChevronRight className="size-3.5" />
                </span>
              </Link>
            ))}
        </div>
      </section>

      {/* EXCLUSIVE DEALS */}
      {deals.length > 0 && (
        <section className="reveal mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
          <SectionHeading title={t.home.dealsTitle} text={t.home.dealsText} />
          <DealsCarousel listings={deals} tabs={dealTabs} />
        </section>
      )}

      {/* POPULAR DESTINATIONS */}
      {destinations.length > 0 && (
        <section className="reveal mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
          <SectionHeading title={t.home.destTitle} text={t.home.destText} href="/tours" linkLabel={t.home.exploreAll} />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
            {destinations.map((d, i) => (
              <Link
                key={d.name}
                href={`/tours?q=${encodeURIComponent(d.name)}`}
                className={cn('group relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl p-4 text-white', i === 0 && 'col-span-2 aspect-auto min-h-56 md:col-span-1 md:aspect-[3/4] md:min-h-0')}
              >
                <SafeImage src={d.image} alt={d.name} className="absolute inset-0 -z-20 size-full transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <p className="flex items-center gap-1.5 text-lg font-extrabold">
                  {flagFor(d.name) && <span>{flagFor(d.name)}</span>} {d.name}
                </p>
                <p className="text-xs text-white/80">{t.home.options(d.count)}{d.from ? ` · ${t.home.from} ${formatPrice(d.from)}` : ''}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="pt-12 sm:pt-16">
        <WorldRoutes />
      </div>

      {/* VISA */}
      {visas.length > 0 && (
        <section className="reveal mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
          <SectionHeading title={t.home.visaTitle} text={t.home.visaText} href="/visa" linkLabel={t.home.allVisa} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {visas.slice(0, 4).map((v) => (
              <Link key={v.id} href={`/visa/${v.slug}`} className="group flex flex-col rounded-2xl bg-white p-5 ring-1 ring-border/60 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand/30">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-muted text-2xl">{flagFor(v.location, v.title) ?? '🌐'}</span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink group-hover:text-brand">{v.location}</p>
                    <p className="truncate text-xs text-muted-foreground">{v.title}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5 text-brand" /> {v.duration}</div>
                <div className="mt-4 flex items-end justify-between border-t border-dashed pt-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">{t.home.startingFrom}</p>
                    <p className="text-lg font-extrabold text-ink">{formatPrice(v.price)}</p>
                  </div>
                  <span className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand transition group-hover:bg-brand group-hover:text-white">{t.home.applyNow}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ESIM */}
      {esims.length > 0 && (
        <section className="reveal mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-ink to-brand-700 p-5 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:items-center">
              <div>
                <SectionHeading light eyebrow={t.home.new} title={t.home.esimTitle} text={t.home.esimText} />
                <ul className="-mt-2 space-y-2 text-sm text-white/85">
                  {t.home.esimPoints.map((t) => (
                    <li key={t} className="flex items-center gap-2"><Zap className="size-4 text-sun" /> {t}</li>
                  ))}
                </ul>
                <Link href="/esim" className="mt-6 inline-flex items-center gap-1 rounded-xl bg-sun px-5 py-3 text-sm font-bold text-ink transition hover:brightness-95">
                  {t.home.viewPlans} <ChevronRight className="size-4" />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {esims.slice(0, 3).map((e) => (
                  <Link key={e.id} href={`/esim/${e.slug}`} className="group flex flex-col rounded-2xl bg-white p-4 transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{flagFor(e.location, e.title) ?? '🌐'}</span>
                      {e.badge && <span className="rounded-md bg-cta/10 px-2 py-0.5 text-[10px] font-bold text-cta-600">{e.badge}</span>}
                    </div>
                    <p className="mt-3 font-bold text-ink group-hover:text-brand">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.location}</p>
                    <p className="mt-1 text-xs font-semibold text-brand">{e.duration}</p>
                    <p className="mt-auto pt-3 text-xl font-extrabold text-ink">{formatPrice(e.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* UMRAH TEASER */}
      <section className="reveal mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="grid overflow-hidden rounded-3xl bg-white ring-1 ring-border/60 lg:grid-cols-2">
          <div className="relative min-h-56">
            <SafeImage src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1400&q=80" alt="Masjid al-Haram, Makkah" className="absolute inset-0 size-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-white/0" />
          </div>
          <div className="p-6 sm:p-9">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand"><Landmark className="size-3.5" /> {t.home.umrahBadge}</span>
            <h2 className="mt-3 text-2xl leading-tight font-extrabold text-ink sm:text-[32px]">{t.home.umrahTitle1} <span className="text-brand">{t.home.umrahTitle2}</span></h2>
            <p className="mt-2 text-muted-foreground">{t.home.umrahText}</p>
            <ul className="mt-4 grid gap-2 text-sm text-ink/85 sm:grid-cols-2">
              {t.home.umrahPoints.map((t) => (
                <li key={t} className="flex items-center gap-2"><BadgeCheck className="size-4 shrink-0 text-emerald-600" /> {t}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/umrah#calculator" className="rounded-xl bg-cta px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cta/25 hover:bg-cta-600">{t.home.umrahCalc}</Link>
              <Link href="/umrah" className="rounded-xl bg-brand-50 px-5 py-3 text-sm font-bold text-brand hover:bg-brand-100">{t.home.umrahGuide}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="reveal mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
        <SectionHeading title={t.home.whyTitle} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            { icon: Tag, ...t.home.why[0], color: 'bg-cta/10 text-cta-600' },
            { icon: Headset, ...t.home.why[1], color: 'bg-brand-50 text-brand' },
            { icon: ShieldCheck, ...t.home.why[2], color: 'bg-emerald-50 text-emerald-700' },
            { icon: Wallet, ...t.home.why[3], color: 'bg-amber-50 text-amber-700' },
          ].map(({ icon: Icon, title, text, color }) => (
            <div key={title} className="rounded-2xl bg-white p-4 ring-1 ring-border/60 sm:p-6">
              <span className={cn('grid size-12 place-items-center rounded-xl', color)}><Icon className="size-6" /></span>
              <p className="mt-4 font-bold text-ink sm:text-lg">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OFFICE */}
      <section className="reveal mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-border/60">
          <div className="bg-swoosh h-1.5" />
          <div className="grid lg:grid-cols-[1.25fr_1fr]">
            <div className="relative min-h-60 sm:min-h-80">
              <SafeImage src="/images/km-office-photo.jpg" alt="The KM Holidays team at our Gulshan office" className="absolute inset-0 size-full object-[30%_center]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white/10" />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 py-1.5 pr-3.5 pl-1.5 text-xs font-bold text-ink shadow-lg">
                <span className="bg-swoosh grid size-7 place-items-center rounded-full text-[11px] font-extrabold text-white">1</span>
                {t.home.oneStopBadge}
              </span>
            </div>
            <div className="p-6 sm:p-9">
              <span className="inline-flex rounded-full bg-cta/10 px-3 py-1 text-xs font-bold text-cta-600">{t.home.officeBadge}</span>
              <h2 className="mt-3 text-2xl leading-tight font-extrabold text-ink sm:text-[32px]">
                {t.home.officeTitle1} <span className="text-brand">{t.home.officeTitle2}</span>
              </h2>
              <p className="mt-3 text-[15px] text-muted-foreground">
                {t.home.officeText}
              </p>
              <a href={site.mapUrl} target="_blank" rel="noreferrer" className="group mt-6 flex items-start gap-3 rounded-2xl bg-paper p-4 transition hover:bg-brand-50">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white"><MapPin className="size-5" /></span>
                <span>
                  <span className="block text-sm font-bold text-ink">{site.address}</span>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-brand">{t.home.directions} <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" /></span>
                </span>
              </a>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {contacts.map((c) => (
                  <a key={c.tel} href={`tel:${c.tel}`} className="flex items-center gap-3 rounded-2xl bg-paper p-4 transition hover:bg-cta/10">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cta text-white"><Phone className="size-5" /></span>
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate text-[15px] font-extrabold text-ink">{c.display}</span>
                      <span className="text-xs text-muted-foreground">{c.name}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HELP / CONTACT */}
      <section id="contact" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid overflow-hidden rounded-3xl bg-white ring-1 ring-border/60 lg:grid-cols-2">
          <div className="relative isolate flex flex-col justify-center p-6 text-white sm:p-10">
            <SafeImage src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80" alt="" className="absolute inset-0 -z-20 size-full" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-700/95 to-ink/90" />
            <h2 className="text-3xl leading-tight font-extrabold sm:text-4xl">{t.home.helpTitle}</h2>
            <p className="mt-3 max-w-md text-white/80">{t.home.helpText}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {site.phone && (
                <a href={`tel:${site.phone}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-ink"><Phone className="size-4 text-brand" /> {site.phone}</a>
              )}
              <a href={site.messenger} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-bold ring-1 ring-white/30 backdrop-blur hover:bg-white/25">
                <MessageCircle className="size-4" /> {t.home.chatMessenger}
              </a>
            </div>
          </div>
          <div className="p-5 sm:p-8">
            <p className="mb-1 text-xl font-extrabold text-ink">{t.home.callbackTitle}</p>
            <p className="mb-5 text-sm text-muted-foreground">{t.home.callbackText}</p>
            <InquiryForm listingTitle="General inquiry (home page)" />
          </div>
        </div>
      </section>
    </>
  );
}
