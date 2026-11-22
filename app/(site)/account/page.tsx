import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarDays, ClipboardList, Compass, PartyPopper, UserRound } from 'lucide-react';
import { ProfileForm } from '@/components/account/profile-form';
import { SignOutButton } from '@/components/account/sign-out-button';
import { UserAvatar } from '@/components/site/user-avatar';
import { getSessionUser } from '@/lib/auth';
import { getInquiriesForUser, getUserById } from '@/lib/data';
import { getT } from '@/lib/i18n-server';
import { requestLabel } from '@/lib/site';
import type { InquiryStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My account', robots: { index: false } };

const statusStyle: Record<InquiryStatus, { label: string; cls: string }> = {
  new: { label: 'Received', cls: 'bg-brand-50 text-brand' },
  contacted: { label: 'In progress', cls: 'bg-amber-50 text-amber-700' },
  confirmed: { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-700' },
  closed: { label: 'Closed', cls: 'bg-muted text-muted-foreground' },
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const session = await getSessionUser();
  if (!session) redirect('/sign-in?callbackUrl=/account');
  if (session.role === 'admin' && !session.id) redirect('/admin'); // .env owner account has no profile
  const user = session.id ? await getUserById(session.id) : null;
  if (!user) redirect('/sign-in?callbackUrl=/account');

  const requests = await getInquiriesForUser(user.id, user.email);
  const { welcome } = await searchParams;
  const t = await getT();
  const a = t.acct;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      {welcome && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200 animate-fade-up">
          <PartyPopper className="size-5 shrink-0" /> {a.welcome(user.name.split(' ')[0])}
        </div>
      )}

      {/* Profile header */}
      <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-grape/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-teal/25 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar name={user.name} email={user.email} image={session.image} className="size-20 text-2xl" />
            <div className="min-w-0">
              <p className="truncate text-2xl font-extrabold">{user.name}</p>
              <p className="truncate text-sm text-white/70">{user.email} · {user.phone}</p>
              <p className="mt-1 text-xs text-white/50">{a.memberSince} {new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <SignOutButton label={a.logout} />
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-2 sm:max-w-md">
          {[
            { label: a.requests, value: requests.length },
            { label: a.inProgress, value: requests.filter((r) => r.status === 'new' || r.status === 'contacted').length },
            { label: a.confirmed, value: requests.filter((r) => r.status === 'confirmed').length },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-white/10">
              <p className="text-xl font-extrabold">{s.value}</p>
              <p className="text-[11px] text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Requests */}
        <section id="requests" className="scroll-mt-28 rounded-2xl bg-white p-5 ring-1 ring-border/60 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink"><ClipboardList className="size-5 text-brand" /> {a.myRequests}</h2>
          {requests.length ? (
            <ul className="mt-4 space-y-3">
              {requests.map((r) => (
                <li key={r.id} className="rounded-xl border p-4 transition hover:border-brand/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{requestLabel(r.category)}</p>
                      <p className="truncate font-bold text-ink">{r.listingTitle || 'General inquiry'}</p>
                    </div>
                    <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold', statusStyle[r.status].cls)}>{a.status[r.status]}</span>
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> {a.sent} {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {r.travelDate && <span>{a.travel}: {r.travelDate}</span>}
                    {r.travelers && <span>{r.travelers} {a.travellers}</span>}
                  </p>
                  {r.message && <p className="mt-2 line-clamp-2 text-sm whitespace-pre-line text-ink/70">{r.message}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 flex flex-col items-center rounded-xl bg-paper px-6 py-10 text-center">
              <Compass className="size-10 text-brand/40" />
              <p className="mt-3 font-bold text-ink">{a.noRequests}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.noRequestsText}</p>
              <Link href="/" className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">{a.explore}</Link>
            </div>
          )}
        </section>

        {/* Profile */}
        <section className="rounded-2xl bg-white p-5 ring-1 ring-border/60 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink"><UserRound className="size-5 text-brand" /> {a.myProfile}</h2>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">{a.profileNote}</p>
          <ProfileForm user={user} />
        </section>
      </div>
    </div>
  );
}
