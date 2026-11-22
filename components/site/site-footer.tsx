import Link from 'next/link';
import { ChevronRight, Code2, Facebook, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { KmLogo } from '@/components/site/brand';
import { GUIDE_ITEM, NAV_ITEMS, navLabel } from '@/components/site/nav-items';
import { getT } from '@/lib/i18n-server';
import { contacts, site } from '@/lib/site';

export async function SiteFooter() {
  const t = await getT();
  const f = t.footer;

  return (
    <footer className="relative overflow-hidden bg-ink pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-white/70 lg:pb-0">
      <div className="bg-swoosh h-1" />
      <div className="pointer-events-none absolute -top-40 -right-40 size-[420px] rounded-full bg-grape/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[380px] rounded-full bg-teal/15 blur-3xl" />

      {/* Help strip */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xl font-extrabold text-white">{f.helpTitle1} <span className="text-sun">{f.helpTitle2}</span></p>
            <p className="text-sm">{f.helpText}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {contacts.map((c) => (
              <a key={c.tel} href={`tel:${c.tel}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:-translate-y-0.5">
                <Phone className="size-4 text-cta" /> {c.display}
              </a>
            ))}
            <a href={site.messenger} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/20">
              <MessageCircle className="size-4" /> Messenger
            </a>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <Link href="/" aria-label="KM Holidays home" className="inline-block">
            <KmLogo light className="h-16 w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            <span className="font-bold text-white">{f.about}</span>{f.aboutRest}
          </p>
          <a href={site.facebook} target="_blank" rel="noreferrer" aria-label="KM Holidays on Facebook" className="mt-5 inline-grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-brand">
            <Facebook className="size-5" />
          </a>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">{f.services}</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[...NAV_ITEMS, GUIDE_ITEM].map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="group inline-flex items-center gap-1 transition hover:text-white">
                  <ChevronRight className="size-3.5 text-white/30 transition group-hover:text-sun" /> {c.key === 'others' ? t.nav.otherServices : navLabel(t, c.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">{f.support}</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: '/#contact', label: f.callback },
              { href: '/account', label: t.account.myAccount },
              { href: site.mapUrl, label: f.findOffice, external: true },
              { href: site.messenger, label: 'Messenger', external: true },
              { href: site.facebook, label: f.fbPage, external: true },
            ].map((l) => (
              <li key={l.label}>
                <a href={l.href} {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})} className="group inline-flex items-center gap-1 transition hover:text-white">
                  <ChevronRight className="size-3.5 text-white/30 transition group-hover:text-sun" /> {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">{f.contact}</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={site.mapUrl} target="_blank" rel="noreferrer" className="flex items-start gap-2.5 hover:text-white">
                <MapPin className="mt-0.5 size-4 shrink-0 text-sun" /> {site.address}
              </a>
            </li>
            {contacts.map((c) => (
              <li key={c.tel}>
                <a href={`tel:${c.tel}`} className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 hover:text-white">
                  <Phone className="size-4 shrink-0 text-sun" /> <span className="font-semibold text-white">{c.display}</span> <span className="text-white/50">({c.name})</span>
                </a>
              </li>
            ))}
            {site.email && (
              <li><a href={`mailto:${site.email}`} className="flex items-center gap-2.5 break-all hover:text-white"><Mail className="size-4 shrink-0 text-sun" /> {site.email}</a></li>
            )}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 text-center text-xs text-white/50 sm:px-6 md:flex-row md:justify-between md:text-left">
          <span>© {new Date().getFullYear()} KM Holidays. {f.rights}</span>
          <a
            href="https://www.raddsoftllc.com"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-white/5 py-1.5 pr-3.5 pl-1.5 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-white/25"
          >
            <span className="bg-swoosh grid size-6 place-items-center rounded-full text-white"><Code2 className="size-3.5" /></span>
            <span>
              {t.langName === 'বাংলা' ? 'ডিজাইন ও ডেভেলপ করেছে' : 'Designed & developed by'}{' '}
              <span className="font-bold text-white group-hover:text-sun">RaddSoft LLC</span>
              <span className="text-white/40"> · www.raddsoftllc.com</span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
