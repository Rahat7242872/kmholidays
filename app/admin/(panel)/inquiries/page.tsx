import Link from 'next/link';
import { CalendarDays, FileText, ChevronLeft, ChevronRight, Download, Inbox, KanbanSquare, List, Mail, MessageSquareText, Phone, Search, Trash2, Users } from 'lucide-react';
import { deleteInquiryAction, setInquiryStatus } from '@/app/admin/actions';
import { ConfirmButton, SubmitButton } from '@/components/admin/confirm-button';
import { PageHeader, Panel, StatusBadge } from '@/components/admin/ui';
import { getInquiries } from '@/lib/data';
import { requestLabel } from '@/lib/site';
import { INQUIRY_STATUSES, type Inquiry, type InquiryStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type Search = { status?: string; q?: string; type?: string; view?: string };

const COLUMN_STYLE: Record<InquiryStatus, string> = {
  new: 'border-t-cta',
  contacted: 'border-t-amber-400',
  confirmed: 'border-t-emerald-500',
  closed: 'border-t-slate-300',
};

function MoveButton({ q, to, dir }: { q: Inquiry; to: InquiryStatus; dir: 'prev' | 'next' }) {
  return (
    <form action={setInquiryStatus}>
      <input type="hidden" name="id" value={q.id} />
      <input type="hidden" name="status" value={to} />
      <SubmitButton title={`Move to ${to}`} className="grid size-7 place-items-center rounded-lg bg-muted text-ink/70 hover:bg-brand hover:text-white">
        {dir === 'prev' ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
      </SubmitButton>
    </form>
  );
}

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const status = (INQUIRY_STATUSES as readonly string[]).includes(sp.status ?? '') ? (sp.status as InquiryStatus) : undefined;
  const board = sp.view === 'board';
  const q = (sp.q ?? '').trim().toLowerCase();
  const all = await getInquiries();
  const types = [...new Set(all.map((i) => i.category).filter(Boolean))];

  const filtered = all.filter((i) => {
    if (sp.type && i.category !== sp.type) return false;
    if (q && !`${i.name} ${i.phone} ${i.email} ${i.listingTitle} ${i.message}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const inquiries = status && !board ? filtered.filter((i) => i.status === status) : filtered;
  const count = (s: InquiryStatus) => filtered.filter((i) => i.status === s).length;

  const href = (patch: Partial<Search>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) p.set(k, String(v));
    const s = p.toString();
    return `/admin/inquiries${s ? `?${s}` : ''}`;
  };
  const exportHref = `/admin/inquiries/export${(() => { const p = new URLSearchParams(); if (sp.type) p.set('type', sp.type); if (status) p.set('status', status); if (sp.q) p.set('q', sp.q); const s = p.toString(); return s ? `?${s}` : ''; })()}`;

  const tab = (active: boolean) =>
    cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold capitalize ring-1 transition', active ? 'bg-ink text-white ring-ink' : 'bg-white text-ink/70 ring-border hover:ring-ink/30');

  return (
    <>
      <PageHeader
        title="Inquiries"
        text={`${filtered.length} of ${all.length} requests`}
        action={
          <div className="flex flex-wrap gap-2 self-start">
            <div className="inline-flex rounded-xl bg-white p-1 ring-1 ring-border">
              <Link href={href({ view: undefined })} className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold', !board ? 'bg-ink text-white' : 'text-ink/60')}><List className="size-4" /> List</Link>
              <Link href={href({ view: 'board', status: undefined })} className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold', board ? 'bg-ink text-white' : 'text-ink/60')}><KanbanSquare className="size-4" /> Board</Link>
            </div>
            <a href={exportHref} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold ring-1 ring-border hover:bg-muted"><Download className="size-4" /> Export CSV</a>
          </div>
        }
      />

      {/* Search + type filter */}
      <form className="mb-4 flex flex-col gap-2 sm:flex-row">
        {board && <input type="hidden" name="view" value="board" />}
        {status && <input type="hidden" name="status" value={status} />}
        <label className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-border focus-within:ring-brand">
          <Search className="size-4 text-muted-foreground" />
          <input name="q" defaultValue={sp.q} placeholder="Search name, phone, email, trip…" className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" />
        </label>
        <select name="type" defaultValue={sp.type ?? ''} className="rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-border">
          <option value="">All types</option>
          {types.map((t) => <option key={t} value={t}>{requestLabel(t)}</option>)}
        </select>
        <button type="submit" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">Filter</button>
      </form>

      {!board && (
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
          <Link href={href({ status: undefined })} className={tab(!status)}>All <span className="opacity-60">{filtered.length}</span></Link>
          {INQUIRY_STATUSES.map((s) => (
            <Link key={s} href={href({ status: s })} className={tab(status === s)}>
              {s} <span className="opacity-60">{count(s)}</span>
            </Link>
          ))}
        </div>
      )}

      {board ? (
        /* Kanban board — scrolls horizontally on phones */
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 xl:grid xl:grid-cols-4">
          {INQUIRY_STATUSES.map((s, si) => {
            const items = filtered.filter((i) => i.status === s);
            return (
              <section key={s} className={cn('w-[82%] shrink-0 snap-start rounded-2xl border-t-4 bg-muted/50 p-3 sm:w-80 xl:w-auto', COLUMN_STYLE[s])}>
                <h2 className="mb-3 flex items-center justify-between px-1 text-sm font-bold capitalize">
                  {s} <span className="rounded-full bg-white px-2 py-0.5 text-xs">{items.length}</span>
                </h2>
                <div className="space-y-2.5">
                  {items.map((i) => (
                    <article key={i.id} className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-border/60">
                      <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{requestLabel(i.category)}</p>
                      <Link href={`/admin/inquiries/${i.id}`} className="block truncate font-semibold hover:text-brand">{i.name}</Link>
                      <p className="truncate text-xs text-muted-foreground">{i.listingTitle || 'General inquiry'}</p>
                      <a href={`tel:${i.phone.replace(/[^\d+]/g, '')}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand"><Phone className="size-3" /> {i.phone}</a>
                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t pt-2.5">
                        <span className="text-[11px] text-muted-foreground">{new Date(i.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        <div className="flex gap-1">
                          {si > 0 && <MoveButton q={i} to={INQUIRY_STATUSES[si - 1]} dir="prev" />}
                          {si < INQUIRY_STATUSES.length - 1 && <MoveButton q={i} to={INQUIRY_STATUSES[si + 1]} dir="next" />}
                        </div>
                      </div>
                    </article>
                  ))}
                  {!items.length && <p className="rounded-xl border-2 border-dashed border-border py-6 text-center text-xs text-muted-foreground">Empty</p>}
                </div>
              </section>
            );
          })}
        </div>
      ) : inquiries.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {inquiries.map((i) => {
            const phoneDigits = i.phone.replace(/[^\d+]/g, '');
            return (
              <Panel key={i.id} className={cn('flex flex-col p-5', i.status === 'new' && 'ring-2 ring-cta/40')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/inquiries/${i.id}`} className="block truncate text-lg font-semibold hover:text-brand">{i.name}</Link>
                    <p className="text-xs text-muted-foreground">{new Date(i.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}{i.userId ? ' · Member' : ''}</p>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
                <div className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{requestLabel(i.category)}: </span>
                  <span className="font-medium">{i.listingTitle || 'General inquiry'}</span>
                </div>
                <ul className="mt-3 mb-4 space-y-1.5 text-sm">
                  <li className="flex items-center gap-2"><Phone className="size-4 text-brand" /><a href={`tel:${phoneDigits}`} className="font-medium hover:underline">{i.phone}</a></li>
                  {i.email && <li className="flex items-center gap-2"><Mail className="size-4 text-brand" /><a href={`mailto:${i.email}`} className="truncate hover:underline">{i.email}</a></li>}
                  {(i.travelDate || i.travelers) && (
                    <li className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      {i.travelDate && <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-brand" />{i.travelDate}</span>}
                      {i.travelers && <span className="inline-flex items-center gap-2"><Users className="size-4 text-brand" />{i.travelers} travellers</span>}
                    </li>
                  )}
                  {i.message && <li className="flex items-start gap-2"><MessageSquareText className="mt-0.5 size-4 shrink-0 text-brand" /><span className="whitespace-pre-line text-ink/80">{i.message}</span></li>}
                </ul>
                <div className="mt-auto flex flex-wrap items-center gap-2 border-t pt-4">
<Link href={`/admin/inquiries/${i.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-brand"><FileText className="size-3.5" /> Details & PDF</Link>
                  <a href={`https://wa.me/${phoneDigits.replace('+', '')}`} target="_blank" rel="noreferrer" className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand-100">WhatsApp</a>
                  <form action={setInquiryStatus} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={i.id} />
                    <select name="status" defaultValue={i.status} aria-label="Status" className="rounded-lg border border-input bg-white px-2 py-1.5 text-xs font-semibold capitalize">
                      {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <SubmitButton className="rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-brand">Update</SubmitButton>
                  </form>
                  <form action={deleteInquiryAction} className="ml-auto">
                    <input type="hidden" name="id" value={i.id} />
                    <ConfirmButton message={`Delete the inquiry from ${i.name}?`} title="Delete inquiry" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="size-4" />
                    </ConfirmButton>
                  </form>
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        <Panel className="flex flex-col items-center px-6 py-16 text-center text-sm text-muted-foreground">
          <Inbox className="mb-3 size-10 text-brand/40" />
          {q || sp.type || status ? 'No inquiries match these filters.' : 'No inquiries yet. Customer requests from the website will appear here.'}
        </Panel>
      )}
    </>
  );
}
