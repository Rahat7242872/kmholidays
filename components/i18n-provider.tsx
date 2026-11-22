'use client';

import { createContext, useContext, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Languages, Loader2 } from 'lucide-react';
import { setLocale } from '@/app/actions/locale';
import { dictionaries, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const LocaleContext = createContext<Locale>('en');

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
export const useT = () => dictionaries[useContext(LocaleContext)];

/** EN / বাংলা switch. Saves the choice in a cookie and re-renders the page. */
export function LanguageToggle({ className, variant = 'light' }: { className?: string; variant?: 'light' | 'dark' }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    start(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  const dark = variant === 'dark';
  return (
    <div role="group" aria-label="Language" className={cn('inline-flex items-center gap-0.5 rounded-full p-0.5 text-xs font-bold', dark ? 'bg-white/10 ring-1 ring-white/15' : 'bg-muted', className)}>
      {pending ? <Loader2 className={cn('mx-1 size-3.5 animate-spin', dark ? 'text-white/70' : 'text-brand')} /> : <Languages className={cn('mx-1 size-3.5', dark ? 'text-sun' : 'text-brand')} />}
      {(['en', 'bn'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          aria-pressed={locale === l}
          className={cn(
            'rounded-full px-2.5 py-1 transition',
            locale === l ? (dark ? 'bg-white text-ink' : 'bg-brand text-white shadow') : dark ? 'text-white/70 hover:text-white' : 'text-ink/60 hover:text-ink',
          )}
        >
          {l === 'en' ? 'EN' : 'বাংলা'}
        </button>
      ))}
    </div>
  );
}

/** Compact round switch for small headers: shows the *other* language and toggles to it. */
export function LanguageSwitchButton({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next: Locale = locale === 'en' ? 'bn' : 'en';
  return (
    <button
      type="button"
      aria-label={locale === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
      onClick={() => start(async () => { await setLocale(next); router.refresh(); })}
      className={cn('grid size-10 place-items-center rounded-full bg-brand-50 text-[13px] font-extrabold text-brand ring-1 ring-brand/10 transition active:scale-95', className)}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : next === 'bn' ? 'বাং' : 'EN'}
    </button>
  );
}
