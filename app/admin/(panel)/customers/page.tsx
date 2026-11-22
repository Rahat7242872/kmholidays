import Link from 'next/link';
import { Mail, Phone, Search, ShieldCheck, UserRound, Users } from 'lucide-react';
import { setUserRoleAction } from '@/app/admin/actions';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { PageHeader, Panel } from '@/components/admin/ui';
import { getAdminSession } from '@/lib/auth';
import { getCustomers } from '@/lib/data';
import { cn } from '@/lib/utils';

type Search = { role?: string; q?: string };

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [sp, all, session] = await Promise.all([searchParams, getCustomers(), getAdminSession()]);
  const me = (session?.user as { id?: number } | undefined)?.id;
  const role = sp.role === 'admin' || sp.role === 'customer' ? sp.role : undefined;
  const q = (sp.q ?? '').trim().toLowerCase();
  const users = all.filter((u) => (!role || u.role === role) && (!q || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q)));
  const admins = all.filter((u) => u.role === 'admin').length;

  const href = (patch: Partial<Search>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) p.set(k, String(v));
    const s = p.toString();
    return `/admin/customers${s ? `?${s}` : ''}`;
  };
  const tab = (active: boolean) => cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition', active ? 'bg-ink text-white ring-ink' : 'bg-white text-ink/70 ring-border hover:ring-ink/30');

  return (
    <>
      <PageHeader title="Users" text={`${all.length} registered ${all.length === 1 ? 'account' : 'accounts'} · ${admins} admin${admins === 1 ? '' : 's'}`} />

      <div className="mb-4 flex gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-ink/80">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" />
        <p><strong>Admins</strong> can open this admin panel by logging in at <code className="rounded bg-white px-1">/admin/login</code> with their own email and password. <strong>Users</strong> can only use the website. The owner login in <code className="rounded bg-white px-1">.env</code> is always an admin.</p>
      </div>

      <form className="mb-4 flex gap-2">
        {role && <input type="hidden" name="role" value={role} />}
        <label className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-border focus-within:ring-brand">
          <Search className="size-4 text-muted-foreground" />
          <input name="q" defaultValue={sp.q} placeholder="Search name, email or phone…" className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" />
        </label>
        <button type="submit" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">Search</button>
      </form>

      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        <Link href={href({ role: undefined })} className={tab(!role)}>All <span className="opacity-60">{all.length}</span></Link>
        <Link href={href({ role: 'admin' })} className={tab(role === 'admin')}><ShieldCheck className="size-4" /> Admins <span className="opacity-60">{admins}</span></Link>
        <Link href={href({ role: 'customer' })} className={tab(role === 'customer')}><UserRound className="size-4" /> Users <span className="opacity-60">{all.length - admins}</span></Link>
      </div>

      {users.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {users.map((c) => {
            const isAdmin = c.role === 'admin';
            const isMe = me === c.id;
            return (
              <Panel key={c.id} className={cn('flex flex-col p-5', isAdmin && 'ring-2 ring-brand/30')}>
                <div className="flex items-center gap-3">
                  <span className={cn('grid size-11 shrink-0 place-items-center rounded-full font-bold', isAdmin ? 'bg-swoosh text-white' : 'bg-brand-50 text-brand')}>{c.name.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.name}{isMe && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}</p>
                    <p className="text-xs text-muted-foreground">Joined {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', isAdmin ? 'bg-brand text-white' : 'bg-muted text-ink/70')}>
                    {isAdmin ? <ShieldCheck className="size-3.5" /> : <UserRound className="size-3.5" />} {isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
                <ul className="mt-3 space-y-1 text-sm">
                  <li className="flex items-center gap-2"><Mail className="size-4 text-brand" /><a href={`mailto:${c.email}`} className="truncate hover:underline">{c.email}</a></li>
                  {c.phone && <li className="flex items-center gap-2"><Phone className="size-4 text-brand" /><a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a></li>}
                </ul>
                {(c.profile.occupation || c.profile.city || c.profile.travelHistory) && (
                  <div className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-xs text-ink/80">
                    {[c.profile.occupation, c.profile.city].filter(Boolean).join(' · ')}
                    {c.profile.travelHistory && <p className="mt-1">Travel history: {c.profile.travelHistory}</p>}
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
                  <Link href={`/admin/inquiries?q=${encodeURIComponent(c.email)}`} className="text-xs font-semibold text-brand hover:underline">View requests →</Link>
                  {isMe ? (
                    <span className="text-xs text-muted-foreground">You can’t remove your own admin access</span>
                  ) : (
                    <form action={setUserRoleAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="role" value={isAdmin ? 'customer' : 'admin'} />
                      <ConfirmButton
                        message={isAdmin ? `Remove admin access from ${c.name}?` : `Make ${c.name} an admin? They will be able to manage everything in this panel.`}
                        title={isAdmin ? 'Make user' : 'Make admin'}
                        className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold', isAdmin ? 'bg-muted text-ink hover:bg-red-50 hover:text-red-600' : 'bg-brand text-white hover:bg-brand-700')}
                      >
                        {isAdmin ? <><UserRound className="size-3.5" /> Make user</> : <><ShieldCheck className="size-3.5" /> Make admin</>}
                      </ConfirmButton>
                    </form>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        <Panel className="flex flex-col items-center px-6 py-16 text-center text-sm text-muted-foreground">
          <Users className="mb-3 size-10 text-brand/40" /> {q || role ? 'No users match these filters.' : 'No customer accounts yet.'}
        </Panel>
      )}
    </>
  );
}
