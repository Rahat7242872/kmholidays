import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, Database, Inbox, MessagesSquare, Package, Plus, Sparkles, Users } from 'lucide-react';
import { seedSampleDataAction } from '@/app/admin/actions';
import { AreaChart, BarList, TrendBadge } from '@/components/admin/charts';
import { SubmitButton } from '@/components/admin/confirm-button';
import { Panel, StatusBadge } from '@/components/admin/ui';
import { CategoryIcon } from '@/components/site/category-icon';
import { buildDashboardStats } from '@/lib/admin-stats';
import { dataBackend, getConversations, getCustomers, getInquiries, getListings } from '@/lib/data';
import { categoryList, requestLabel } from '@/lib/site';
import { cn } from '@/lib/utils';

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

const PIPELINE_STYLE = {
  new: { label: 'New', bar: 'bg-cta' },
  contacted: { label: 'Contacted', bar: 'bg-amber-400' },
  confirmed: { label: 'Confirmed', bar: 'bg-emerald-500' },
  closed: { label: 'Closed', bar: 'bg-slate-300' },
} as const;

export default async function AdminDashboard() {
  const [listings, inquiries, customers, chats] = await Promise.all([getListings({ includeInactive: true }), getInquiries(), getCustomers(), getConversations()]);
  const backend = dataBackend();
  const stats = buildDashboardStats(inquiries, listings, customers);
  const newCount = inquiries.filter((q) => q.status === 'new').length;
  const unreadChats = chats.filter((c) => c.unreadForAdmin > 0).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const pipelineTotal = Math.max(1, stats.pipeline.reduce((s, p) => s + p.count, 0));

  return (
    <>
      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-10 size-72 rounded-full bg-grape/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-teal/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/60">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <h1 className="mt-1 text-3xl font-extrabold">{greeting} 👋</h1>
            <p className="mt-1 text-white/70">
              {newCount ? <>You have <strong className="text-sun">{newCount} new {newCount === 1 ? 'request' : 'requests'}</strong></> : 'No new requests'}
              {unreadChats ? <> and <strong className="text-sun">{unreadChats} unread {unreadChats === 1 ? 'chat' : 'chats'}</strong></> : null}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/inquiries?status=new" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-ink"><Inbox className="size-4" /> Inquiries</Link>
            <Link href="/admin/chats" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold ring-1 ring-white/20 hover:bg-white/20"><MessagesSquare className="size-4" /> Chats</Link>
            <Link href="/admin/listings/new" className="inline-flex items-center gap-2 rounded-xl bg-cta px-4 py-2.5 text-sm font-bold text-white hover:bg-cta-600"><Plus className="size-4" /> New listing</Link>
          </div>
        </div>
      </div>

      {backend === 'local' && (
        <div className="mb-6 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p><strong>Database not connected.</strong> Set <code className="rounded bg-amber-100 px-1">DATABASE_URL</code> in .env and run <code className="rounded bg-amber-100 px-1">npm run db:push</code>.</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: 'Requests this week', value: stats.trends.inquiries.value, trend: stats.trends.inquiries.change, icon: Inbox, tone: 'bg-brand-50 text-brand', href: '/admin/inquiries' },
          { label: 'New customers (7d)', value: stats.trends.customers.value, trend: stats.trends.customers.change, icon: Users, tone: 'bg-teal/10 text-teal', href: '/admin/customers' },
          { label: 'Confirm rate', value: stats.conversion === null ? '—' : `${stats.conversion}%`, sub: 'confirmed ÷ decided', icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700', href: '/admin/inquiries?status=confirmed' },
          { label: 'Live listings', value: listings.filter((l) => l.active).length, sub: `${listings.length} total`, icon: Package, tone: 'bg-cta/10 text-cta-600', href: '/admin/listings' },
        ].map((k) => (
          <Link key={k.label} href={k.href} className="group rounded-2xl bg-white p-4 ring-1 ring-border/70 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <span className={cn('grid size-10 place-items-center rounded-xl', k.tone)}><k.icon className="size-5" /></span>
              {'trend' in k && k.trend !== undefined ? <TrendBadge change={k.trend} /> : null}
            </div>
            <p className="mt-3 text-3xl font-extrabold text-ink tabular-nums">{k.value}</p>
            <p className="text-xs font-medium text-muted-foreground">{k.label}{'sub' in k && k.sub ? ` · ${k.sub}` : ''}</p>
          </Link>
        ))}
      </div>

      {/* Chart + types */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-ink">Requests — last 30 days</h2>
              <p className="text-xs text-muted-foreground">{stats.daily.reduce((s, d) => s + d.count, 0)} total</p>
            </div>
          </div>
          <AreaChart data={stats.daily} />
        </Panel>
        <Panel className="p-5">
          <h2 className="mb-4 font-bold text-ink">Requests by type</h2>
          <BarList items={stats.byType} color="bg-swoosh" />
        </Panel>
      </div>

      {/* Pipeline + top listings */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-ink">Sales pipeline</h2>
            <Link href="/admin/inquiries?view=board" className="text-xs font-bold text-brand">Open board →</Link>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-muted">
            {stats.pipeline.map((p) => p.count > 0 && (
              <div key={p.status} className={PIPELINE_STYLE[p.status].bar} style={{ width: `${(p.count / pipelineTotal) * 100}%` }} title={`${PIPELINE_STYLE[p.status].label}: ${p.count}`} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.pipeline.map((p) => (
              <Link key={p.status} href={`/admin/inquiries?status=${p.status}`} className="rounded-xl bg-paper p-3 transition hover:bg-brand-50">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><span className={cn('size-2 rounded-full', PIPELINE_STYLE[p.status].bar)} /> {PIPELINE_STYLE[p.status].label}</span>
                <span className="mt-1 block text-2xl font-extrabold tabular-nums">{p.count}</span>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel className="p-5">
          <h2 className="mb-4 font-bold text-ink">Most requested listings</h2>
          <BarList items={stats.topListings.map((t) => ({ label: t.listing.title, count: t.count, hint: requestLabel(t.listing.category) }))} />
        </Panel>
      </div>

      {/* Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-bold">Recent inquiries</h2>
            <Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">View all <ArrowRight className="size-4" /></Link>
          </div>
          {inquiries.length ? (
            <ul className="divide-y">
              {inquiries.slice(0, 6).map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/inquiries?q=${encodeURIComponent(q.phone)}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 font-semibold text-brand">{q.name.charAt(0).toUpperCase()}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{q.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{requestLabel(q.category)} · {q.listingTitle || 'General inquiry'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={q.status} />
                      <span className="text-[11px] text-muted-foreground">{timeAgo(q.createdAt)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center px-6 py-12 text-center text-sm text-muted-foreground">
              <Inbox className="mb-3 size-8 text-brand/40" /> No inquiries yet.
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel>
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-bold">Latest chats</h2>
              <Link href="/admin/chats" className="text-sm font-semibold text-brand">Open</Link>
            </div>
            {chats.length ? (
              <ul className="divide-y">
                {chats.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link href={`/admin/chats/${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50">
                      <span className="grid size-9 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand">{c.name.charAt(0).toUpperCase()}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{c.name}</span>
                      {c.unreadForAdmin > 0 ? <span className="rounded-full bg-cta px-2 py-0.5 text-[11px] font-bold text-white">{c.unreadForAdmin}</span> : <span className="text-[11px] text-muted-foreground">{timeAgo(c.lastMessageAt)}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No chats yet.</p>
            )}
          </Panel>

          <Panel>
            <div className="border-b px-5 py-4"><h2 className="font-bold">Listings by category</h2></div>
            <ul className="divide-y">
              {categoryList.map((c) => (
                <li key={c.key}>
                  <Link href={`/admin/listings?category=${c.key}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/50">
                    <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand"><CategoryIcon category={c.key} className="size-4" /></span>
                    <span className="flex-1 text-sm font-medium">{c.plural}</span>
                    <span className="text-sm font-bold">{listings.filter((l) => l.category === c.key).length}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-2 border-t px-5 py-3">
              <Link href="/admin/database" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand">
                <Database className={cn('size-3.5', backend === 'database' ? 'text-emerald-600' : 'text-amber-600')} /> {backend === 'database' ? 'Postgres connected' : 'Local file'}
              </Link>
              <form action={seedSampleDataAction}>
                <SubmitButton className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand-100">
                  <Sparkles className="size-3.5" /> Load samples
                </SubmitButton>
              </form>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
