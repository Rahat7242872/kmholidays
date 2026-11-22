'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { ClipboardList, Compass, LogIn, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useT } from '@/components/i18n-provider';
import { UserAvatar } from '@/components/site/user-avatar';
import { cn } from '@/lib/utils';

/** Header account control: "Login" when signed out, round avatar with a dropdown when signed in. */
export function UserMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = session?.user as { name?: string | null; email?: string | null; image?: string | null; role?: string; id?: number } | undefined;
  // Logged in with a website account (the .env owner admin has no account id).
  const loggedIn = !!user && (user.role !== 'admin' || !!user.id);
  const isAdmin = user?.role === 'admin';

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (status === 'loading') return <span className="size-10 animate-pulse rounded-full bg-muted" aria-hidden="true" />;

  if (!loggedIn) {
    return (
      <Link href="/sign-in" className="inline-flex items-center gap-2 rounded-full border border-brand/20 py-2 pr-4 pl-2 text-sm font-bold text-brand transition hover:bg-brand-50">
        <span className="grid size-7 place-items-center rounded-full bg-brand-50"><LogIn className="size-3.5" /></span>
        {t.account.login}
      </Link>
    );
  }

  const items = [
    { href: '/account', label: t.account.myAccount, icon: UserRound },
    { href: '/account#requests', label: t.account.myRequests, icon: ClipboardList },
    { href: '/go-abroad', label: t.nav.guide, icon: Compass },
  ];
  if (isAdmin) items.unshift({ href: '/admin', label: 'Admin panel', icon: ShieldCheck });

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Account menu"
        aria-expanded={open}
        className="rounded-full transition hover:scale-105 focus-visible:ring-4 focus-visible:ring-brand/20"
      >
        <UserAvatar name={user.name} email={user.email} image={user.image} className="size-11 text-base" />
        <span className="absolute right-0 bottom-0 size-3 rounded-full bg-emerald-500 ring-2 ring-white" />
      </button>

      <div
        className={cn(
          // Phones: pin to the viewport edges so the 18rem panel can't spill off-screen.
          'fixed inset-x-4 top-[76px] origin-top-right sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-3 sm:w-72',
          'origin-top-right overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(27,29,85,.45)] ring-1 ring-border transition duration-200',
          open ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0',
        )}
      >
        <div className="relative overflow-hidden bg-ink p-4 text-white">
          <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-grape/50 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <UserAvatar name={user.name} email={user.email} image={user.image} className="size-12 text-lg" />
            <div className="min-w-0">
              <p className="truncate font-bold">{user.name ?? t.account.traveller}</p>
              <p className="truncate text-xs text-white/60">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="bg-swoosh h-1" />
        <nav className="p-2">
          {items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-brand-50 hover:text-brand">
              <Icon className="size-4 text-brand" /> {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-1 flex w-full items-center gap-3 rounded-xl border-t px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5"
          >
            <LogOut className="size-4" /> {t.account.logout}
          </button>
        </nav>
      </div>
    </div>
  );
}
