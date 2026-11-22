'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Facebook, Home, MapPin, Menu, MessageCircle, Phone, PhoneCall, UserRound, X } from 'lucide-react';
import { LanguageToggle, useT } from '@/components/i18n-provider';
import { Brand } from '@/components/site/brand';
import { UserAvatar } from '@/components/site/user-avatar';
import { UserMenu } from '@/components/site/user-menu';
import { GUIDE_ITEM, NAV_ITEMS, navLabel, navSub } from '@/components/site/nav-items';
import { contacts, site } from '@/lib/site';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const pathname = usePathname();
  const t = useT();
  const { data: session } = useSession();
  // Logged in with a website account (the .env owner admin has no account id).
  const loggedIn = !!session?.user && ((session.user as { role?: string; id?: number }).role !== 'admin' || !!(session.user as { id?: number }).id);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const accountHref = loggedIn ? '/account' : '/sign-in';
  const firstName = session?.user?.name?.split(' ')[0];

  return (
    <>
      {/* Top info bar */}
      <div className="hidden bg-ink text-[12.5px] text-white/75 md:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4 px-6">
          <div className="flex min-w-0 items-center gap-4">
            <a href={site.mapUrl} target="_blank" rel="noreferrer" className="hidden min-w-0 items-center gap-1.5 truncate hover:text-white lg:inline-flex">
              <MapPin className="size-3.5 shrink-0 text-sun" /> {site.address}
            </a>
            <Link href={GUIDE_ITEM.href} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 font-semibold text-white ring-1 ring-white/15 hover:bg-white/20">
              <GUIDE_ITEM.icon className="size-3.5 text-sun" /> {navLabel(t, GUIDE_ITEM.key)}
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <LanguageToggle variant="dark" />
            {contacts.map((c) => (
              <a key={c.tel} href={`tel:${c.tel}`} className="inline-flex items-center gap-1.5 hover:text-white">
                <Phone className="size-3.5 text-sun" /> <span className="font-semibold text-white">{c.display}</span>
                <span className="hidden text-white/50 xl:inline">({c.name})</span>
              </a>
            ))}
            <a href={site.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid size-6 place-items-center rounded-full bg-white/10 hover:bg-white/20">
              <Facebook className="size-3.5" />
            </a>
          </div>
        </div>
      </div>

      <header className={cn('sticky top-0 z-40 bg-white/95 backdrop-blur-xl transition-shadow duration-300', scrolled && 'shadow-[0_6px_24px_-10px_rgba(27,29,85,.25)]')}>
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
          <Brand />

          <nav aria-label="Main" className="hidden h-full items-stretch lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn('group relative flex items-center gap-2 px-2.5 text-[15px] font-bold transition-colors xl:px-3', active ? 'text-brand' : 'text-ink/70 hover:text-brand')}
                >
                  <span className={cn('hidden size-8 place-items-center rounded-lg transition xl:grid', active ? 'bg-brand text-white' : 'bg-brand-50 text-brand group-hover:bg-brand-100')}>
                    <item.icon className="size-4" />
                  </span>
                  {navLabel(t, item.key)}
                  <span className={cn('bg-swoosh absolute inset-x-2 bottom-0 h-[3px] rounded-t-full transition-transform', active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50')} />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <UserMenu />
            <a
              href={`tel:${contacts[0].tel}`}
              className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-cta to-sun py-2.5 pr-5 pl-2.5 text-sm font-bold text-white shadow-lg shadow-cta/30 transition hover:-translate-y-0.5 2xl:inline-flex"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white/25"><PhoneCall className="size-3.5" /></span>
              {t.chat.call}
            </a>
            <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand lg:hidden">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
        <div className="bg-swoosh h-[3px] opacity-90" />
      </header>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!open}>
        <div className={cn('absolute inset-0 bg-ink/55 backdrop-blur-sm transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')} onClick={() => setOpen(false)} />
        <aside className={cn('absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out', open ? 'translate-x-0' : 'translate-x-full')}>
          <div className="flex h-[68px] items-center justify-between px-5">
            <Brand tagline={false} />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-10 place-items-center rounded-xl bg-muted">
              <X className="size-5" />
            </button>
          </div>
          <div className="bg-swoosh h-[3px]" />
          <div className="flex justify-end px-4 pt-3"><LanguageToggle /></div>
          <nav aria-label="Mobile" className="flex-1 space-y-1 overflow-y-auto p-3">
            <Link href={accountHref} className="mb-2 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand to-brand-700 px-4 py-3 text-white">
              {loggedIn ? (
                <UserAvatar name={session?.user?.name} email={session?.user?.email} image={session?.user?.image} className="size-11 text-sm" />
              ) : (
                <span className="bg-swoosh grid size-10 place-items-center rounded-xl"><UserRound className="size-5" /></span>
              )}
              <span className="flex flex-col leading-tight">
                <span className="font-bold">{loggedIn ? t.account.hi(firstName ?? t.account.traveller) : t.account.loginRegister}</span>
                <span className="text-xs text-white/70">{loggedIn ? t.account.myAccountRequests : t.account.trackHint}</span>
              </span>
            </Link>
            {[{ href: '/', label: t.nav.home, sub: t.nav.startHere, icon: Home }, ...[...NAV_ITEMS, GUIDE_ITEM].map((i) => ({ href: i.href, label: navLabel(t, i.key), sub: navSub(t, i.key), icon: i.icon }))].map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-xl px-3 py-2 font-bold', active ? 'bg-brand-50 text-brand' : 'text-ink')}>
                  <span className={cn('grid size-10 place-items-center rounded-xl', active ? 'bg-brand text-white' : 'bg-brand-50 text-brand')}>
                    <item.icon className="size-5" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    {item.label}
                    <span className="text-xs font-medium text-muted-foreground">{item.sub}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="space-y-2 border-t bg-paper p-4 pb-safe">
            {contacts.map((c) => (
              <a key={c.tel} href={`tel:${c.tel}`} className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 ring-1 ring-border">
                <span className="grid size-9 place-items-center rounded-full bg-cta/10 text-cta"><Phone className="size-4" /></span>
                <span className="leading-tight">
                  <span className="block font-bold text-ink">{c.display}</span>
                  <span className="text-xs text-muted-foreground">{c.name}</span>
                </span>
              </a>
            ))}
            <a href={site.messenger} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-brand py-3 font-bold text-white">
              <MessageCircle className="size-4" /> {t.account.chatMessenger}
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
