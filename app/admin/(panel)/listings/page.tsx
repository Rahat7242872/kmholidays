import Link from 'next/link';
import { CheckCircle2, ExternalLink, Eye, EyeOff, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { deleteListingAction, toggleListingFlag } from '@/app/admin/actions';
import { ConfirmButton, SubmitButton } from '@/components/admin/confirm-button';
import { PageHeader, Panel } from '@/components/admin/ui';
import { CategoryIcon } from '@/components/site/category-icon';
import { SafeImage } from '@/components/site/safe-image';
import { getListings } from '@/lib/data';
import { categoryList, categoryMeta, formatPrice, isCategory } from '@/lib/site';
import { cn } from '@/lib/utils';

type Props = { searchParams: Promise<{ category?: string; q?: string; saved?: string }> };

export default async function AdminListingsPage({ searchParams }: Props) {
  const { category: rawCategory, q = '', saved } = await searchParams;
  const category = rawCategory && isCategory(rawCategory) ? rawCategory : undefined;
  const listings = await getListings({ category, q, includeInactive: true });
  const title = category ? categoryMeta[category].plural : 'All listings';

  const tab = (active: boolean) =>
    cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition', active ? 'bg-ink text-white ring-ink' : 'bg-white text-ink/70 ring-border hover:ring-ink/30');
  const iconBtn = 'grid size-9 place-items-center rounded-lg text-ink/60 ring-1 ring-border transition hover:bg-muted hover:text-ink';

  return (
    <>
      <PageHeader
        title={title}
        text={`${listings.length} ${listings.length === 1 ? 'item' : 'items'}`}
        action={
          <Link href={`/admin/listings/new${category ? `?category=${category}` : ''}`} className="inline-flex items-center gap-2 self-start rounded-xl bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:bg-cta-600">
            <Plus className="size-4" /> Add {category ? categoryMeta[category].label.toLowerCase() : 'listing'}
          </Link>
        }
      />

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand">
          <CheckCircle2 className="size-4" /> Saved. Changes are live on the website.
        </div>
      )}

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        <Link href="/admin/listings" className={tab(!category)}>All</Link>
        {categoryList.map((c) => (
          <Link key={c.key} href={`/admin/listings?category=${c.key}`} className={tab(category === c.key)}>
            <CategoryIcon category={c.key} className="size-4" /> {c.plural}
          </Link>
        ))}
      </div>

      <form className="mb-5 flex items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-border">
        {category && <input type="hidden" name="category" value={category} />}
        <Search className="size-4 text-muted-foreground" />
        <input name="q" defaultValue={q} placeholder="Search by title, location…" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" />
      </form>

      <Panel className="overflow-hidden">
        {listings.length ? (
          <ul className="divide-y">
            {listings.map((l) => {
              const meta = categoryMeta[l.category];
              return (
                <li key={l.id} className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center', !l.active && 'bg-muted/40')}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <SafeImage src={l.image} alt="" className={cn('size-16 shrink-0 rounded-xl', !l.active && 'opacity-50 grayscale')} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/listings/${l.id}`} className="truncate font-semibold hover:text-brand">{l.title}</Link>
                        {l.featured && <Star className="size-3.5 shrink-0 fill-sun text-sun" />}
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><CategoryIcon category={l.category} className="size-3.5" /> {meta.label}</span>
                        {l.location && <span>· {l.location}</span>}
                        {!l.active && <span className="font-semibold text-amber-700">· Hidden</span>}
                      </p>
                      <p className="mt-1 text-sm font-bold text-brand">
                        {formatPrice(l.price)} <span className="font-normal text-muted-foreground">{l.priceNote}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:shrink-0">
                    <form action={toggleListingFlag}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="flag" value="featured" />
                      <input type="hidden" name="value" value={String(!l.featured)} />
                      <SubmitButton title={l.featured ? 'Remove from home page' : 'Feature on home page'} className={cn(iconBtn, l.featured && 'text-sun')}>
                        <Star className={cn('size-4', l.featured && 'fill-sun')} />
                      </SubmitButton>
                    </form>
                    <form action={toggleListingFlag}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="flag" value="active" />
                      <input type="hidden" name="value" value={String(!l.active)} />
                      <SubmitButton title={l.active ? 'Hide from website' : 'Show on website'} className={iconBtn}>
                        {l.active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </SubmitButton>
                    </form>
                    {l.active && (
                      <a href={`/${meta.path}/${l.slug}`} target="_blank" title="View on website" aria-label="View on website" className={iconBtn}>
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                    <Link href={`/admin/listings/${l.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3 text-sm font-semibold text-white hover:bg-brand">
                      <Pencil className="size-3.5" /> Edit
                    </Link>
                    <form action={deleteListingAction} className="ml-auto sm:ml-0">
                      <input type="hidden" name="id" value={l.id} />
                      <ConfirmButton message={`Delete “${l.title}”? This cannot be undone.`} title="Delete" className={cn(iconBtn, 'hover:bg-destructive/10 hover:text-destructive')}>
                        <Trash2 className="size-4" />
                      </ConfirmButton>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No listings found.{' '}
            <Link href={`/admin/listings/new${category ? `?category=${category}` : ''}`} className="font-semibold text-brand">Add one</Link>
          </div>
        )}
      </Panel>
    </>
  );
}
