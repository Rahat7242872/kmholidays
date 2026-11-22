'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Palmtree, PlaneTakeoff, Stamp, UserRound } from 'lucide-react';
import { useT } from '@/components/i18n-provider';
import { UserAvatar } from '@/components/site/user-avatar';
import { cn } from '@/lib/utils';

/** App-style bottom navigation for phones. */
export function MobileTabBar() {
  const pathname = usePathname();
  const t = useT();
  const { data: session } = useSession();
  // Logged in with a website account (the .env owner admin has no account id).
  const loggedIn = !!session?.user && ((session.user as { role?: string; id?: number }).role !== 'admin' || !!(session.user as { id?: number }).id);

  const tabs = [
    { href: '/', label: t.nav.home, icon: Home, active: pathname === '/' },
    { href: '/flights', label: t.nav.flights, icon: PlaneTakeoff, active: pathname.startsWith('/flights') },
    { href: '/tours', label: t.nav.tours, icon: Palmtree, active: pathname.startsWith('/tours') },
    { href: '/visa', label: t.nav.visa, icon: Stamp, active: pathname.startsWith('/visa') },
    {
      href: loggedIn ? '/account' : '/sign-in',
      label: loggedIn ? t.account.account : t.account.login,
      icon: UserRound,
      active: pathname.startsWith('/account') || pathname.startsWith('/sign-'),
    },
  ];

  return (
    <nav aria-label="Quick links" className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/95 pb-safe backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md">
        {tabs.map(({ href, label, icon: Icon, active }) => (
          <Link key={label} href={href} className={cn('relative flex h-[60px] min-w-0 flex-1 flex-col items-center justify-center gap-1 truncate px-0.5 text-[11px] font-semibold transition-colors', active ? 'text-brand' : 'text-ink/50')}>
            {active && <span className="bg-swoosh absolute top-0 h-[3px] w-8 rounded-b-full" />}
            {loggedIn && href === '/account' ? (
              <UserAvatar name={session?.user?.name} email={session?.user?.email} image={session?.user?.image} className="size-[26px] text-[9px]" />
            ) : (
              <Icon className="size-[22px]" strokeWidth={active ? 2.3 : 1.8} />
            )}
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
