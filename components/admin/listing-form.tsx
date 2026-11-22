'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Loader2, Save } from 'lucide-react';
import { saveListing, type ListingFormState } from '@/app/admin/actions';
import { CategoryIcon } from '@/components/site/category-icon';
import { SafeImage } from '@/components/site/safe-image';
import { categoryList, categoryMeta, slugify, type Category } from '@/lib/site';
import { detailsToText, type DetailsKey } from '@/lib/listing-details';
import type { Listing } from '@/lib/types';
import { cn } from '@/lib/utils';

const priceNoteHints: Record<Category, string> = {
  tour: 'per person',
  hotel: 'per night',
  visa: 'service + visa fee',
  esim: 'one-time',
  service: 'from',
};

const highlightHints: Record<Category, string> = {
  tour: 'What’s included — one per line\n4-star hotel with breakfast\nAirport transfers',
  hotel: 'Amenities — one per line\nSea-view rooms\nBreakfast included',
  visa: 'Documents required — one per line\nPassport scan\nBank statement (6 months)',
  esim: 'Plan details — one per line\n10GB data\nHotspot allowed',
  service: 'Key points — one per line',
};

type DetailField = { key: DetailsKey; label: string; help: string; rows: number; placeholder: string; show: Category[] };

/** Rich detail sections. Every field stays in the form (hidden when not relevant) so switching category never loses text. */
const DETAIL_FIELDS: DetailField[] = [
  {
    key: 'facts', label: 'At a glance', rows: 5, show: ['tour', 'hotel', 'visa', 'esim', 'service'],
    help: 'One per line as  Label: value',
    placeholder: 'Route: Dhaka → Denpasar\nStay: 3N Ubud + 2N Nusa Dua\nHotel: 4-star\nMeals: Breakfast\nTransport: Private AC car',
  },
  {
    key: 'itinerary', label: 'Day-by-day itinerary', rows: 12, show: ['tour'],
    help: 'One day per block, blank line between days. First line = day title. Lines starting with Stay: / Meals: / Transport: show as chips.',
    placeholder: 'Day 1 — Arrive in Bali, transfer to Ubud\nMeet our driver at the airport and drive to Ubud. Evening at the market.\nStay: Ubud\nTransport: Private car\n\nDay 2 — Kintamani volcano & rice terraces\nFull-day tour…\nMeals: Breakfast\nStay: Ubud',
  },
  {
    key: 'documentGroups', label: 'Documents by applicant type', rows: 12, show: ['visa'],
    help: 'One group per block, blank line between groups. First line = group name, then one document per line. (Replaces the simple list above.)',
    placeholder: 'All applicants\nPassport (6+ months valid)\nPhoto, white background\nBank statement — 6 months\n\nJob holder\nNOC from employer\nSalary slips — 3 months\n\nBusiness owner\nTrade licence (English translation)',
  },
  {
    key: 'steps', label: 'Processing steps', rows: 8, show: ['visa', 'service'],
    help: 'One step per block, blank line between steps. First line = step title, next lines = explanation.',
    placeholder: 'Send your documents\nShare scans on WhatsApp or visit our office.\n\nWe file the application\nSubmitted the same day once the file is ready.\n\nReceive your visa\nWe send the e-visa by email / WhatsApp.',
  },
  {
    key: 'fees', label: 'Fee breakdown', rows: 4, show: ['visa', 'service'],
    help: 'One per line as  Label: amount',
    placeholder: 'Visa fee (government): ৳ 10,000\nService charge: ৳ 2,500',
  },
  {
    key: 'excluded', label: 'Not included', rows: 4, show: ['tour', 'hotel', 'visa', 'esim', 'service'],
    help: 'One per line',
    placeholder: 'Air ticket\nLunch and dinner\nPersonal expenses',
  },
  {
    key: 'faqs', label: 'FAQ', rows: 6, show: ['tour', 'hotel', 'visa', 'esim', 'service'],
    help: 'One question per block, blank line between. First line = question, next lines = answer.',
    placeholder: 'Is the visa fee refundable?\nNo, once submitted the fee is not refundable.',
  },
];

export function ListingForm({ listing, defaultCategory }: { listing?: Listing; defaultCategory?: Category }) {
  const [state, action, pending] = useActionState<ListingFormState, FormData>(saveListing, { ok: false, message: '' });
  const [category, setCategory] = useState<Category>(listing?.category ?? defaultCategory ?? 'tour');
  const [title, setTitle] = useState(listing?.title ?? '');
  const [slug, setSlug] = useState(listing?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!!listing);
  const [image, setImage] = useState(listing?.image ?? '');
  const meta = categoryMeta[category];
  const err = state.errors ?? {};
  const detailText = detailsToText(listing?.details);

  const field = (hasError?: string) =>
    cn('w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10', hasError ? 'border-destructive' : 'border-input');
  const label = 'mb-1.5 block text-xs font-semibold text-ink/70';
  const FieldError = ({ k }: { k: keyof typeof err }) => (err[k] ? <p className="mt-1 text-xs text-destructive">{err[k]}</p> : null);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {listing && <input type="hidden" name="id" value={listing.id} />}
      <input type="hidden" name="category" value={category} />

      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-5 ring-1 ring-border/70 sm:p-6">
          <p className={label}>Category</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {categoryList.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-semibold ring-1 transition',
                  category === c.key ? 'bg-brand text-white ring-brand' : 'bg-white text-ink/70 ring-border hover:ring-brand/40',
                )}
              >
                <CategoryIcon category={c.key} className="size-5" /> {c.key === 'service' ? 'Other' : c.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-border/70 sm:p-6">
          <div>
            <label htmlFor="title" className={label}>Title *</label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
              placeholder={category === 'visa' ? 'e.g. Dubai tourist visa' : category === 'esim' ? 'e.g. Asia 10GB eSIM' : 'e.g. Bali, your way'}
              className={field(err.title)}
            />
            <FieldError k="title" />
          </div>
          <div>
            <label htmlFor="slug" className={label}>URL slug</label>
            <div className="flex items-center rounded-xl border border-input bg-muted/50 pl-3.5 text-sm text-muted-foreground focus-within:border-brand">
              <span className="shrink-0">/{meta.path}/</span>
              <input id="slug" name="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} className="min-w-0 flex-1 bg-transparent py-2.5 pr-3.5 text-ink outline-none" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="location" className={label}>{meta.locationLabel}</label>
              <input id="location" name="location" defaultValue={listing?.location} className={field()} />
            </div>
            <div>
              <label htmlFor="duration" className={label}>{meta.durationLabel}</label>
              <input id="duration" name="duration" defaultValue={listing?.duration} placeholder={category === 'tour' ? '5 nights · 6 days' : category === 'visa' ? '7–10 working days' : category === 'esim' ? '30 days validity' : ''} className={field()} />
            </div>
          </div>
          <div>
            <label htmlFor="summary" className={label}>Short summary <span className="font-normal text-muted-foreground">(shown on cards)</span></label>
            <input id="summary" name="summary" defaultValue={listing?.summary} maxLength={300} className={field()} />
          </div>
          <div>
            <label htmlFor="description" className={label}>Full description</label>
            <textarea id="description" name="description" defaultValue={listing?.description} rows={6} className={field()} />
          </div>
          <div>
            <label htmlFor="highlights" className={label}>
              {category === 'visa' ? 'Documents required' : category === 'esim' ? 'Plan details' : 'Highlights / what’s included'}{' '}
              <span className="font-normal text-muted-foreground">(one per line)</span>
            </label>
            <textarea id="highlights" name="highlights" defaultValue={listing?.highlights.join('\n')} rows={5} placeholder={highlightHints[category]} className={field()} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-border/70 sm:p-6">
          <div>
            <p className="font-bold text-ink">Full details page</p>
            <p className="text-xs text-muted-foreground">
              {category === 'tour' ? 'Itinerary — where the trip goes and how, day by day.' : category === 'visa' ? 'Complete visa processing info — documents, steps, fees.' : 'Extra sections shown on the details page.'}{' '}
              Leave a box empty to hide that section.
            </p>
          </div>
          {DETAIL_FIELDS.map((f) => (
            <div key={f.key} className={cn(!f.show.includes(category) && 'hidden')}>
              <label htmlFor={`details-${f.key}`} className={label}>{f.label}</label>
              <textarea id={`details-${f.key}`} name={`details.${f.key}`} defaultValue={detailText[f.key]} rows={f.rows} placeholder={f.placeholder} className={cn(field(), 'font-mono text-[13px] leading-relaxed')} />
              <p className="mt-1 text-[11px] text-muted-foreground">{f.help}</p>
            </div>
          ))}
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-border/70">
          <div>
            <label htmlFor="price" className={label}>Price (৳ BDT)</label>
            <input id="price" name="price" inputMode="numeric" defaultValue={listing?.price ?? ''} placeholder="Leave empty for “On request”" className={field(err.price)} />
            <FieldError k="price" />
          </div>
          <div>
            <label htmlFor="priceNote" className={label}>Price note</label>
            <input id="priceNote" name="priceNote" defaultValue={listing?.priceNote ?? priceNoteHints[category]} placeholder={priceNoteHints[category]} className={field()} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="badge" className={label}>Badge</label>
              <input id="badge" name="badge" defaultValue={listing?.badge} placeholder="Bestseller" className={field()} />
            </div>
            <div>
              <label htmlFor="rating" className={label}>Rating</label>
              <input id="rating" name="rating" type="number" step="0.1" min={0} max={5} defaultValue={listing?.rating ?? ''} placeholder="4.8" className={field(err.rating)} />
            </div>
          </div>
          <FieldError k="rating" />
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-border/70">
          <label htmlFor="image" className={label}>Image URL</label>
          <SafeImage key={image} src={image} alt="Preview" className="aspect-[4/3] w-full rounded-xl" />
          <input id="image" name="image" value={image} onChange={(e) => setImage(e.target.value.trim())} placeholder="https://images.unsplash.com/…" className={field(err.image)} />
          <FieldError k="image" />
          <p className="text-[11px] text-muted-foreground">Paste a link to an image (e.g. from Unsplash, or your Facebook page photos).</p>
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-border/70">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span><span className="block text-sm font-semibold">Show on website</span><span className="text-xs text-muted-foreground">Turn off to hide without deleting</span></span>
            <input type="checkbox" name="active" defaultChecked={listing?.active ?? true} className="size-5 accent-brand" />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3 border-t pt-3">
            <span><span className="block text-sm font-semibold">Feature on home page</span><span className="text-xs text-muted-foreground">Shown in the home page sections</span></span>
            <input type="checkbox" name="featured" defaultChecked={listing?.featured ?? false} className="size-5 accent-brand" />
          </label>
        </section>

        {state.message && !state.ok && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.message}</p>}

        <div className="sticky bottom-4 flex gap-2">
          <Link href={`/admin/listings?category=${category}`} className="flex-1 rounded-xl bg-white py-3 text-center text-sm font-semibold ring-1 ring-border">Cancel</Link>
          <button type="submit" disabled={pending} className="inline-flex flex-[2] items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-700 disabled:opacity-70">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {listing ? 'Save changes' : 'Create listing'}
          </button>
        </div>
      </div>
    </form>
  );
}
