import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BadgeCheck, ChevronRight, Clock, Headset, Info, MapPin, MessageCircle, Phone, Star, Wallet } from 'lucide-react';
import { CategoryIcon } from '@/components/site/category-icon';
import { CheckList, DocumentGroups, FactsGrid, FeeTable, Faqs, Itinerary, SectionTitle, Steps, sectionCls } from '@/components/site/listing-details';
import { InquiryForm } from '@/components/site/inquiry-form';
import { ListingCard } from '@/components/site/listing-card';
import { SafeImage } from '@/components/site/safe-image';
import { getListingBySlug, getListings } from '@/lib/data';
import { categoryName } from '@/lib/i18n';
import { getT } from '@/lib/i18n-server';
import { categoryFromPath, categoryMeta, flagFor, formatPrice, site, type Category } from '@/lib/site';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ category: string; slug: string }>;
  searchParams: Promise<{ date?: string; to?: string; pax?: string; note?: string }>;
};

const goodToKnow: Record<Category, string[]> = {
  tour: ['Prices can change with travel dates and hotel availability.', 'Final itinerary is confirmed by our team before booking.', 'Visa (if required) can be arranged separately.'],
  hotel: ['Rates depend on dates, room type and availability.', 'Check-in/check-out times follow hotel policy.', 'Our team confirms the final rate before booking.'],
  visa: ['Processing time is an estimate — the final decision is made by the embassy.', 'Visa and service fees are non-refundable once submitted.', 'Requirements can change; we’ll share the latest checklist.'],
  esim: ['Your device must be eSIM-compatible and carrier-unlocked.', 'Install the eSIM before you travel; data starts on first use.', 'Data-only plan — calls/SMS are not included.'],
  service: ['Pricing depends on your exact requirements.', 'Our team will confirm details and availability by phone.'],
};

async function load(params: Props['params']) {
  const { category: path, slug } = await params;
  const category = categoryFromPath(path);
  if (!category) return null;
  const listing = await getListingBySlug(slug);
  if (!listing || !listing.active || listing.category !== category) return null;
  return listing;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await load(params);
  if (!listing) return {};
  return { title: listing.title, description: listing.summary, openGraph: { images: listing.image ? [listing.image] : [] } };
}

export default async function ListingPage({ params, searchParams }: Props) {
  const listing = await load(params);
  if (!listing) notFound();
  const sp = await searchParams;
  const meta = categoryMeta[listing.category];
  const flag = flagFor(listing.location, listing.title);
  const related = (await getListings({ category: listing.category })).filter((l) => l.id !== listing.id).slice(0, 4);
  const t = await getT();
  const d = t.detail;
  const highlightsTitle = listing.category === 'visa' ? d.documents : listing.category === 'esim' ? d.planDetails : listing.category === 'hotel' ? d.amenities : d.included;
  const ctaLabel = listing.category === 'visa' ? d.applyNow : listing.category === 'esim' ? d.buyEsim : d.bookNow;
  const details = listing.details;
  const isVisa = listing.category === 'visa';
  const isTour = listing.category === 'tour';
  const sections: [string, string][] = [
    ['overview', d.overview],
    ...(details.itinerary?.length ? [['itinerary', d.itinerary] as [string, string]] : []),
    ...(isVisa && (details.documentGroups?.length || listing.highlights.length) ? [['documents', d.documents] as [string, string]] : []),
    ...(details.steps?.length ? [['process', d.process] as [string, string]] : []),
    ...(details.fees?.length ? [['fees', d.fees] as [string, string]] : []),
    ...(!isVisa && (listing.highlights.length || details.excluded?.length) ? [['included', highlightsTitle] as [string, string]] : []),
    ...(details.faqs?.length ? [['faq', d.faq] as [string, string]] : []),
    ['info', d.goodToKnow],
  ];

  const noteParts = [sp.note, sp.to ? `Check-out: ${sp.to}` : ''].filter(Boolean);
  const defaults = { travelDate: sp.date, travelers: sp.pax, message: noteParts.join('\n') || undefined };

  return (
    <>
      <div className="border-b bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-hidden px-4 py-3 text-xs whitespace-nowrap text-muted-foreground sm:px-6">
          <Link href="/" className="hover:text-brand">{t.cat.home}</Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <Link href={`/${meta.path}`} className="hover:text-brand">{t.cat.titles[listing.category]}</Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="truncate font-semibold text-ink">{listing.title}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand">
            <CategoryIcon category={listing.category} className="size-3.5" /> {categoryName(t, listing.category)}
          </span>
          {listing.badge && <span className="rounded-md bg-cta px-2 py-1 text-xs font-bold text-white">{listing.badge}</span>}
        </div>
        <h1 className="mt-2 text-2xl leading-tight font-extrabold text-ink sm:text-4xl">{listing.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          {listing.rating ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-brand px-1.5 py-0.5 text-xs font-bold text-white"><Star className="size-3 fill-current" /> {listing.rating.toFixed(1)}</span>
              {listing.rating >= 4.5 ? d.excellent : listing.rating >= 4 ? d.veryGood : d.good}
            </span>
          ) : null}
          {listing.location && <span className="inline-flex items-center gap-1.5">{flag ? <span className="text-base">{flag}</span> : <MapPin className="size-4" />}{listing.location}</span>}
          {listing.duration && <span className="inline-flex items-center gap-1.5"><Clock className="size-4" />{listing.duration}</span>}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_380px] lg:gap-8">
        <div className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-2xl">
            <SafeImage src={listing.image} alt={listing.title} className="aspect-[16/10] w-full sm:aspect-[16/8]" priority />
          </div>

          {/* Section tabs */}
          <nav className="no-scrollbar sticky top-[71px] z-20 -mx-4 flex gap-1 overflow-x-auto border-b bg-paper/95 px-4 backdrop-blur sm:top-[83px] sm:mx-0 sm:rounded-xl sm:border sm:bg-white sm:px-2">
            {sections.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="shrink-0 px-3 py-3 text-sm font-bold whitespace-nowrap text-ink/70 hover:text-brand">{label}</a>
            ))}
          </nav>

          <section id="overview" className={sectionCls}>
            <SectionTitle title={d.overview} />
            {details.facts?.length ? (
              <div className="mb-5">
                <p className="mb-2.5 text-xs font-bold tracking-wide text-brand uppercase">{isVisa ? d.visaGlance : isTour ? d.tripGlance : d.glance}</p>
                <FactsGrid facts={details.facts} />
              </div>
            ) : null}
            {listing.summary && <p className="font-semibold text-ink/85">{listing.summary}</p>}
            {listing.description && <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground">{listing.description}</p>}
          </section>

          {details.itinerary?.length ? (
            <section id="itinerary" className={sectionCls}>
              <SectionTitle title={d.itinerary} text={d.itineraryText} />
              <Itinerary days={details.itinerary} />
            </section>
          ) : null}

          {/* Visa: documents by applicant type (falls back to the simple highlights list) */}
          {isVisa && (details.documentGroups?.length || listing.highlights.length) ? (
            <section id="documents" className={sectionCls}>
              <SectionTitle title={d.documents} />
              {details.documentGroups?.length ? <DocumentGroups groups={details.documentGroups} /> : <CheckList items={listing.highlights} />}
            </section>
          ) : null}

          {details.steps?.length ? (
            <section id="process" className={sectionCls}>
              <SectionTitle title={d.process} text={d.processText} />
              <Steps steps={details.steps} label={d.step} />
            </section>
          ) : null}

          {details.fees?.length ? (
            <section id="fees" className={sectionCls}>
              <SectionTitle title={d.fees} />
              <FeeTable fees={details.fees} />
              <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground"><Info className="mt-0.5 size-3.5 shrink-0 text-brand" /> {d.feesNote}</p>
              {details.excluded?.length ? (
                <div className="mt-5">
                  <p className="mb-3 text-sm font-extrabold text-ink">{d.notCovered}</p>
                  <CheckList items={details.excluded} tone="no" />
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Non-visa: included / not included */}
          {!isVisa && (listing.highlights.length || details.excluded?.length) ? (
            <section id="included" className={sectionCls}>
              <div className={cn('grid gap-6', listing.highlights.length && details.excluded?.length && 'md:grid-cols-2')}>
                {listing.highlights.length > 0 && (
                  <div>
                    <SectionTitle title={highlightsTitle} />
                    <CheckList items={listing.highlights} />
                  </div>
                )}
                {details.excluded?.length ? (
                  <div>
                    <SectionTitle title={d.notIncluded} />
                    <CheckList items={details.excluded} tone="no" />
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {/* Visa without a fee table: still show what's not covered */}
          {isVisa && !details.fees?.length && details.excluded?.length ? (
            <section className={sectionCls}>
              <SectionTitle title={d.notCovered} />
              <CheckList items={details.excluded} tone="no" />
            </section>
          ) : null}

          {details.faqs?.length ? (
            <section id="faq" className={sectionCls}>
              <SectionTitle title={d.faq} />
              <Faqs faqs={details.faqs} />
            </section>
          ) : null}

          <section id="info" className={sectionCls}>
            <SectionTitle title={d.goodToKnow} />
            <ul className="space-y-2.5">
              {goodToKnow[listing.category].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-ink/80"><Info className="mt-0.5 size-4 shrink-0 text-brand" /> {t}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* Booking card */}
        <aside id="book" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-24px_rgba(11,29,69,.35)] ring-1 ring-border/60">
            <div className="bg-gradient-to-br from-ink to-brand-700 p-5 text-white">
              <p className="text-xs text-white/70">{listing.price ? t.card.startingFrom : t.card.price}</p>
              <p className="text-3xl font-extrabold">{formatPrice(listing.price, t.card.onRequest)}</p>
              {listing.priceNote && <p className="text-sm text-white/70">{listing.priceNote}</p>}
            </div>
            <ul className="grid grid-cols-3 border-b text-center text-[11px] font-semibold text-ink/75">
              <li className="flex flex-col items-center gap-1 px-1 py-3"><BadgeCheck className="size-5 text-emerald-600" /> {d.freeConsult}</li>
              <li className="flex flex-col items-center gap-1 border-x px-1 py-3"><Wallet className="size-5 text-brand" /> {d.noPayNow}</li>
              <li className="flex flex-col items-center gap-1 px-1 py-3"><Headset className="size-5 text-cta" /> {d.expertSupport}</li>
            </ul>
            <div className="p-5">
              <p className="mb-4 font-extrabold text-ink">{ctaLabel}</p>
              <InquiryForm
                listingId={listing.id}
                listingTitle={listing.title}
                category={listing.category}
                showTravelFields={listing.category === 'tour' || listing.category === 'hotel'}
                defaults={defaults}
                submitLabel={ctaLabel}
              />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={site.messenger} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-50 py-3 text-sm font-bold text-brand">
                  <MessageCircle className="size-4" /> Messenger
                </a>
                {site.phone ? (
                  <a href={`tel:${site.phone}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-50 py-3 text-sm font-bold text-brand">
                    <Phone className="size-4" /> {d.callUs}
                  </a>
                ) : (
                  <a href={site.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-50 py-3 text-sm font-bold text-brand">
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-4 pb-14 sm:px-6">
          <h2 className="mb-5 text-2xl font-extrabold text-ink">{d.similar}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {/* Sticky mobile CTA above the tab bar (60px tall + safe area); footer gets matching room via globals.css */}
      <div data-mobile-cta className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-30 border-t bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(11,29,69,.2)] backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{listing.price ? t.card.startingFrom : t.card.price}</p>
            <p className="truncate text-lg leading-tight font-extrabold text-ink">{formatPrice(listing.price, t.card.onRequest)} <span className="text-[11px] font-medium text-muted-foreground">{listing.priceNote}</span></p>
          </div>
          <a href="#book" className="shrink-0 rounded-xl bg-cta px-5 py-3 text-sm font-bold whitespace-nowrap text-white shadow-lg shadow-cta/25">{ctaLabel}</a>
        </div>
      </div>
    </>
  );
}
