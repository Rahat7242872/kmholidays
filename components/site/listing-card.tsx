'use client';

import Link from 'next/link';
import { useT } from '@/components/i18n-provider';
import { categoryName } from '@/lib/i18n';
import { CheckCircle2, ChevronRight, Clock, MapPin, Star } from 'lucide-react';
import { SafeImage } from '@/components/site/safe-image';
import { categoryMeta, flagFor, formatPrice } from '@/lib/site';
import type { Listing } from '@/lib/types';
import { cn } from '@/lib/utils';

function hrefFor(listing: Listing, query?: string) {
  return `/${categoryMeta[listing.category].path}/${listing.slug}${query ? `?${query}` : ''}`;
}

function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-brand px-1.5 py-0.5 text-xs font-bold text-white">
      <Star className="size-3 fill-current" /> {value.toFixed(1)}
    </span>
  );
}

/** Grid card used on the home page and in carousels. */
export function ListingCard({ listing, className, query }: { listing: Listing; className?: string; query?: string }) {
  const t = useT();
  const flag = flagFor(listing.location, listing.title);
  return (
    <Link
      href={hrefFor(listing, query)}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_-4px_rgba(11,29,69,.12)] ring-1 ring-border/60 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(11,29,69,.3)]',
        className,
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <SafeImage src={listing.image} alt={listing.title} className="size-full transition duration-700 group-hover:scale-105" />
        {listing.badge && (
          <span className="absolute top-3 left-0 rounded-r-full bg-cta py-1 pr-3 pl-2.5 text-[11px] font-bold text-white shadow">{listing.badge}</span>
        )}
        {listing.duration && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink">
            <Clock className="size-3.5 text-brand" /> {listing.duration}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[17px] leading-snug font-bold text-ink group-hover:text-brand">{listing.title}</h3>
          {listing.rating ? <Rating value={listing.rating} /> : null}
        </div>
        {listing.location && (
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            {flag ? <span className="text-base leading-none">{flag}</span> : <MapPin className="size-3.5" />} {listing.location}
          </p>
        )}
        <div className="min-h-4 flex-1" />
        <div className="flex items-end justify-between gap-3 border-t border-dashed pt-3">
          <div>
            <p className="text-[11px] text-muted-foreground">{listing.price ? t.card.startingFrom : t.card.price}</p>
            <p className="text-lg leading-tight font-extrabold text-ink">{formatPrice(listing.price, t.card.onRequest)}</p>
          </div>
          {listing.priceNote && <span className="pb-0.5 text-[11px] text-muted-foreground">{listing.priceNote}</span>}
        </div>
      </div>
    </Link>
  );
}

/** Wide search-result card (image left, details middle, price right). */
export function ResultCard({ listing, query }: { listing: Listing; query?: string }) {
  const t = useT();
  const meta = categoryMeta[listing.category];
  const flag = flagFor(listing.location, listing.title);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_-4px_rgba(11,29,69,.12)] ring-1 ring-border/60 transition hover:shadow-[0_16px_36px_-16px_rgba(11,29,69,.3)] sm:flex-row">
      <Link href={hrefFor(listing, query)} className="relative block aspect-[16/10] shrink-0 overflow-hidden sm:aspect-auto sm:w-64 lg:w-72">
        <SafeImage src={listing.image} alt={listing.title} className="size-full transition duration-700 group-hover:scale-105 sm:absolute sm:inset-0" />
        {listing.badge && <span className="absolute top-3 left-0 rounded-r-full bg-cta py-1 pr-3 pl-2.5 text-[11px] font-bold text-white">{listing.badge}</span>}
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5 md:flex-row">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {listing.rating ? <Rating value={listing.rating} /> : null}
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand">{categoryName(t, listing.category)}</span>
          </div>
          <Link href={hrefFor(listing, query)}>
            <h3 className="mt-2 text-lg leading-snug font-bold text-ink hover:text-brand sm:text-xl">{listing.title}</h3>
          </Link>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            {listing.location && <span className="inline-flex items-center gap-1.5">{flag ? <span className="text-base leading-none">{flag}</span> : <MapPin className="size-3.5" />}{listing.location}</span>}
            {listing.duration && <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" />{listing.duration}</span>}
          </div>
          {listing.summary && <p className="mt-2 line-clamp-2 text-sm text-ink/70">{listing.summary}</p>}
          {listing.highlights.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {listing.highlights.slice(0, 3).map((h) => (
                <li key={h} className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="size-3.5" /> {h}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-dashed pt-3 md:w-44 md:flex-col md:items-end md:justify-center md:border-t-0 md:border-l md:pt-0 md:pl-5">
          <div className="md:text-right">
            <p className="text-[11px] text-muted-foreground">{listing.price ? t.card.startingFrom : t.card.price}</p>
            <p className="text-xl leading-tight font-extrabold text-ink">{formatPrice(listing.price, t.card.onRequest)}</p>
            {listing.priceNote && <p className="text-[11px] text-muted-foreground">{listing.priceNote}</p>}
          </div>
          <Link href={hrefFor(listing, query)} className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 md:mt-3 md:w-full md:justify-center">
            {t.card.viewDetails} <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
