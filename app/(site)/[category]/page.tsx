import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ChevronRight, Compass, Search, SlidersHorizontal, X } from 'lucide-react';
import { CategoryIcon } from '@/components/site/category-icon';
import { ResultCard } from '@/components/site/listing-card';
import { getListings } from '@/lib/data';
import { categoryName } from '@/lib/i18n';
import { getT } from '@/lib/i18n-server';
import { categoryFromPath, categoryList, categoryMeta, formatPrice, site } from '@/lib/site';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Search = { q?: string; sort?: string; max?: string; loc?: string; date?: string; to?: string; pax?: string; note?: string };
type Props = { params: Promise<{ category: string }>; searchParams: Promise<Search> };

const SORTS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'rating', label: 'Top rated' },
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = categoryFromPath((await params).category);
  if (!category) return {};
  const t = await getT();
  return { title: t.cat.titles[category], description: t.cat.blurbs[category] };
}

function country(location: string) {
  const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = categoryFromPath((await params).category);
  if (!category) notFound();
  const sp = await searchParams;
  const q = sp.q ?? '';
  const sort = SORTS.some((s) => s.key === sp.sort) ? sp.sort! : 'recommended';
  const max = Number(sp.max) || null;
  const loc = sp.loc ?? '';
  const meta = categoryMeta[category];
  const t = await getT();
  const c = t.cat;
  const base = await getListings({ category, q });
  const locations = [...new Set(base.map((l) => country(l.location)).filter(Boolean))].sort();
  const prices = base.map((l) => l.price).filter((p): p is number => !!p);
  const highest = prices.length ? Math.max(...prices) : 0;
  const priceSteps = highest ? [0.25, 0.5, 0.75].map((f) => Math.ceil((highest * f) / 1000) * 1000).filter((v, i, a) => a.indexOf(v) === i) : [];

  let listings = base.filter((l) => (!max || (l.price ?? Infinity) <= max) && (!loc || country(l.location) === loc));
  if (sort === 'price-asc') listings = [...listings].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  if (sort === 'price-desc') listings = [...listings].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  if (sort === 'rating') listings = [...listings].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  // Trip details from the home search box are passed on to the booking form.
  const carry = new URLSearchParams();
  for (const key of ['date', 'to', 'pax', 'note'] as const) if (sp[key]) carry.set(key, sp[key]!);
  const carryQuery = carry.toString();

  const href = (patch: Partial<Search>) => {
    const next = new URLSearchParams();
    const merged = { ...sp, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, String(v));
    const s = next.toString();
    return `/${meta.path}${s ? `?${s}` : ''}`;
  };

  const option = (active: boolean) =>
    cn('flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition', active ? 'font-bold text-brand' : 'text-ink/75 hover:bg-muted');
  const dot = (active: boolean) =>
    cn('grid size-[18px] shrink-0 place-items-center rounded-md border', active ? 'border-brand bg-brand text-white' : 'border-input bg-white');

  const filters = (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-extrabold text-ink">{c.sortBy}</p>
        {SORTS.map((s) => (
          <Link key={s.key} href={href({ sort: s.key === 'recommended' ? undefined : s.key })} className={option(sort === s.key)} scroll={false}>
            <span className={dot(sort === s.key)}>{sort === s.key && <Check className="size-3" />}</span> {c.sorts[s.key]}
          </Link>
        ))}
      </div>
      {priceSteps.length > 0 && (
        <div className="border-t pt-4">
          <p className="mb-2 text-sm font-extrabold text-ink">{c.budget}</p>
          <Link href={href({ max: undefined })} className={option(!max)} scroll={false}>
            <span className={dot(!max)}>{!max && <Check className="size-3" />}</span> {c.anyPrice}
          </Link>
          {priceSteps.map((p) => (
            <Link key={p} href={href({ max: String(p) })} className={option(max === p)} scroll={false}>
              <span className={dot(max === p)}>{max === p && <Check className="size-3" />}</span> {c.upTo(formatPrice(p))}
            </Link>
          ))}
        </div>
      )}
      {locations.length > 1 && (
        <div className="border-t pt-4">
          <p className="mb-2 text-sm font-extrabold text-ink">{c.location}</p>
          <Link href={href({ loc: undefined })} className={option(!loc)} scroll={false}>
            <span className={dot(!loc)}>{!loc && <Check className="size-3" />}</span> {c.all}
          </Link>
          {locations.map((l) => (
            <Link key={l} href={href({ loc: l })} className={option(loc === l)} scroll={false}>
              <span className={dot(loc === l)}>{loc === l && <Check className="size-3" />}</span> {l}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Header band */}
      <section className="bg-gradient-to-br from-ink to-brand-700">
        <div className="mx-auto max-w-7xl px-4 pt-5 pb-6 sm:px-6 sm:pt-8 sm:pb-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/60">
            <Link href="/" className="hover:text-white">{c.home}</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white">{c.titles[category]}</span>
          </nav>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-white/15 text-white"><CategoryIcon category={category} className="size-6" /></span>
            <h1 className="text-2xl font-extrabold text-white sm:text-4xl">{c.titles[category]}</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">{c.blurbs[category]}</p>

          <form action={`/${meta.path}`} className="mt-5 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-1.5 shadow-xl">
            {Object.entries(sp).filter(([k, v]) => k !== 'q' && v).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
            <Search className="ml-3 size-5 shrink-0 text-brand" />
            <input
              name="q"
              defaultValue={q}
              placeholder={c.searchPh}
              aria-label={c.searchPh}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] font-medium outline-none placeholder:text-ink/40"
            />
            <button type="submit" className="rounded-xl bg-cta px-5 py-3 text-sm font-bold text-white transition hover:bg-cta-600 sm:px-7">{c.search}</button>
          </form>
        </div>
      </section>

      {/* Category switcher */}
      <div className="border-b bg-white">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
          {categoryList.map((c) => (
            <Link
              key={c.key}
              href={`/${c.path}`}
              className={cn('relative inline-flex shrink-0 items-center gap-2 px-4 py-3.5 text-sm font-bold transition', c.key === category ? 'text-brand' : 'text-ink/60 hover:text-ink')}
            >
              <CategoryIcon category={c.key} className="size-4" /> {categoryName(t, c.key)}
              {c.key === category && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-brand" />}
            </Link>
          ))}
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[260px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl bg-white p-5 ring-1 ring-border/60">
            <p className="mb-4 flex items-center gap-2 text-base font-extrabold"><SlidersHorizontal className="size-4 text-brand" /> {c.filters}</p>
            {filters}
          </div>
        </aside>

        <div className="min-w-0">
          {/* Mobile filters */}
          <details className="mb-4 rounded-2xl bg-white ring-1 ring-border/60 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold">
              <span className="inline-flex items-center gap-2"><SlidersHorizontal className="size-4 text-brand" /> {c.sortFilter}</span>
              <span className="text-xs font-semibold text-brand">{c.sorts[sort]}</span>
            </summary>
            <div className="border-t px-3 pt-3 pb-4">{filters}</div>
          </details>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {c.results(listings.length)}
              {q && <> {c.forQ} “<strong className="text-ink">{q}</strong>”</>}
            </p>
            {(q || max || loc || sp.sort) && (
              <Link href={`/${meta.path}${carryQuery ? `?${carryQuery}` : ''}`} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand ring-1 ring-border">
                <X className="size-3.5" /> {c.clearAll}
              </Link>
            )}
          </div>

          {listings.length ? (
            <div className="space-y-4">
              {listings.map((l) => <ResultCard key={l.id} listing={l} query={carryQuery} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-border/60">
              <span className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand"><Compass className="size-8" /></span>
              <h2 className="mt-5 text-xl font-extrabold text-ink">{c.noResults}</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">{c.noResultsText}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link href={`/${meta.path}`} className="rounded-xl bg-muted px-5 py-3 text-sm font-bold text-ink">{c.clearSearch}</Link>
                <a href={site.messenger} target="_blank" rel="noreferrer" className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white">{c.askExpert}</a>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-lg font-extrabold text-ink">{c.notFound}</p>
              <p className="text-sm text-muted-foreground">{c.customise}</p>
            </div>
            <Link href="/#contact" className="shrink-0 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700">{c.callback}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
