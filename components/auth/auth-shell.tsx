import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Headset, MessageCircle } from 'lucide-react';
import { LanguageToggle } from '@/components/i18n-provider';
import { KmLogo } from '@/components/site/brand';
import { getT } from '@/lib/i18n-server';

/** Split-screen layout for sign-in / sign-up: brand panel on the left (desktop), form on the right. */
export async function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const a = (await getT()).auth;
  return (
    <div className="grid min-h-svh bg-paper lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative isolate hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-brand-700/90 to-grape/80" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 -z-10 size-96 rounded-full bg-teal/30 blur-3xl" />
        <Link href="/" aria-label="KM Holidays home"><KmLogo light className="h-16 w-auto" /></Link>
        <div>
          <p className="text-4xl leading-tight font-extrabold">
            {a.panelTitle[0]} <span className="text-swoosh">{a.panelTitle[1]}</span> {a.panelTitle[2]}
          </p>
          <ul className="mt-8 space-y-4 text-white/85">
            {[
              { icon: BadgeCheck, text: a.panelPoints[0] },
              { icon: MessageCircle, text: a.panelPoints[1] },
              { icon: Headset, text: a.panelPoints[2] },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-white/10"><Icon className="size-5 text-sun" /></span> {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-swoosh h-1 w-32 rounded-full" />
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-brand">
            <ArrowLeft className="size-4" /> {a.back}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link href="/" className="lg:hidden" aria-label="KM Holidays home"><KmLogo className="h-10 w-auto" /></Link>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10 animate-fade-up">
          <h1 className="text-3xl font-extrabold text-ink">{title}</h1>
          <p className="mt-2 mb-8 text-muted-foreground">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
