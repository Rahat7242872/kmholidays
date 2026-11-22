'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '@/components/i18n-provider';
import { ListingCard } from '@/components/site/listing-card';
import { categoryName } from '@/lib/i18n';
import { categoryMeta, type Category } from '@/lib/site';
import type { Listing } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Horizontally scrolling deals strip with category filter chips. */
export function DealsCarousel({ listings, tabs }: { listings: Listing[]; tabs: Category[] }) {
  const t = useT();
  const [active, setActive] = useState<Category | 'all'>('all');
  const track = useRef<HTMLDivElement>(null);
  const shown = active === 'all' ? listings : listings.filter((l) => l.category === active);

  function scroll(dir: 1 | -1) {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  function select(tab: Category | 'all') {
    setActive(tab);
    track.current?.scrollTo({ left: 0 });
  }

  const chip = (on: boolean) =>
    cn('shrink-0 rounded-full px-4 py-2 text-sm font-bold transition', on ? 'bg-brand text-white shadow-md shadow-brand/25' : 'bg-white text-ink/70 ring-1 ring-border hover:text-brand');

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <button type="button" onClick={() => select('all')} className={chip(active === 'all')}>{t.home.all}</button>
          {tabs.map((tab) => (
            <button key={tab} type="button" onClick={() => select(tab)} className={chip(active === tab)}>{categoryName(t, tab)}</button>
          ))}
        </div>
        <div className="hidden shrink-0 gap-2 md:flex">
          <button type="button" onClick={() => scroll(-1)} aria-label="Previous" className="grid size-10 place-items-center rounded-full bg-white text-ink shadow ring-1 ring-border transition hover:bg-brand hover:text-white">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Next" className="grid size-10 place-items-center rounded-full bg-white text-ink shadow ring-1 ring-border transition hover:bg-brand hover:text-white">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
      <div ref={track} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pt-1 pb-4 sm:mx-0 sm:px-0">
        {shown.map((l) => (
          <ListingCard key={l.id} listing={l} className="w-[76%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]" />
        ))}
      </div>
    </div>
  );
}
