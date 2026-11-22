'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Database, ExternalLink, Inbox, Landmark, LayoutDashboard, LogOut, Menu, MessagesSquare, Plus, Users, X } from 'lucide-react';
import { Brand } from '@/components/site/brand';
import { CategoryIcon } from '@/components/site/category-icon';
import { categoryList } from '@/lib/site';
import { cn } from '@/lib/utils';

export function AdminShell({ children, newInquiries, unreadChats, email }: { children: React.ReactNode; newInquiries: number; unreadChats: number; email: string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname, params]);

  const activeCategory = pathname === '/admin/listings' ? params.get('category') : null;
  const link = (active: boolean) =>
    cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition', active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white');

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Brand light />
        <button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full bg-white/10 text-white lg:hidden" aria-label="Close menu">
          <X className="size-4" />
        </button>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          <Link href="/admin" className={link(pathname === '/admin')}><LayoutDashboard className="size-[18px]" /> Dashboard</Link>
          <Link href="/admin/inquiries" className={link(pathname.startsWith('/admin/inquiries'))}>
            <Inbox className="size-[18px]" /> Inquiries
            {newInquiries > 0 && <span className="ml-auto rounded-full bg-cta px-2 py-0.5 text-[11px] font-bold text-white">{newInquiries}</span>}
          </Link>
          <Link href="/admin/chats" className={link(pathname.startsWith('/admin/chats'))}>
            <MessagesSquare className="size-[18px]" /> Live chat
            {unreadChats > 0 && <span className="ml-auto rounded-full bg-cta px-2 py-0.5 text-[11px] font-bold text-white">{unreadChats}</span>}
          </Link>
          <Link href="/admin/customers" className={link(pathname.startsWith('/admin/customers'))}>
            <Users className="size-[18px]" /> Users &amp; admins
          </Link>
          <Link href="/admin/umrah" className={link(pathname.startsWith('/admin/umrah'))}>
            <Landmark className="size-[18px]" /> Umrah
          </Link>
          <Link href="/admin/database" className={link(pathname.startsWith('/admin/database'))}>
            <Database className="size-[18px]" /> Database
          </Link>
        </div>
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.2em] text-white/35">LISTINGS</p>
          <div className="space-y-1">
            <Link href="/admin/listings" className={link(pathname === '/admin/listings' && !activeCategory)}>
              <LayoutDashboard className="size-[18px] opacity-0" /> All listings
            </Link>
            {categoryList.map((c) => (
              <Link key={c.key} href={`/admin/listings?category=${c.key}`} className={link(activeCategory === c.key)}>
                <CategoryIcon category={c.key} className="size-[18px]" /> {c.plural}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/admin/listings/new" className="flex items-center justify-center gap-2 rounded-xl bg-cta py-2.5 text-sm font-semibold text-white transition hover:bg-cta-600">
          <Plus className="size-4" /> New listing
        </Link>
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a href="/" target="_blank" className={link(false)}><ExternalLink className="size-[18px]" /> View website</a>
        <button type="button" onClick={() => signOut({ callbackUrl: '/admin/login' })} className={cn(link(false), 'w-full')}>
          <LogOut className="size-[18px]" /> Sign out
        </button>
        <p className="truncate px-3 pt-2 text-[11px] text-white/35">{email}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-[#f4f3ee]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-ink lg:block">{nav}</aside>

      <div className={cn('fixed inset-0 z-50 lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div className={cn('absolute inset-0 bg-ink/50 transition-opacity', open ? 'opacity-100' : 'opacity-0')} onClick={() => setOpen(false)} />
        <aside className={cn('absolute inset-y-0 left-0 w-72 bg-ink transition-transform duration-300', open ? 'translate-x-0' : '-translate-x-full')}>{nav}</aside>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-white/90 px-4 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <span className="font-display text-lg font-semibold">Admin</span>
          <Link href="/admin/listings/new" className="grid size-10 place-items-center rounded-xl bg-cta text-white" aria-label="New listing">
            <Plus className="size-5" />
          </Link>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
