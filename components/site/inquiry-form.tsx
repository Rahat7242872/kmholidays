'use client';

import { useActionState } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowUpRight, CheckCircle2, Loader2, Send } from 'lucide-react';
import { submitInquiry, type InquiryState } from '@/app/actions/inquiry';
import { useLocale, useT } from '@/components/i18n-provider';
import { bookingFields } from '@/lib/booking-fields';
import { site, type Category, type RequestType } from '@/lib/site';
import { cn } from '@/lib/utils';

const initial: InquiryState = { ok: false, message: '' };

export type InquiryDefaults = { travelDate?: string; travelers?: string; message?: string };

export function InquiryForm({
  listingId,
  listingTitle,
  category,
  showTravelFields = true,
  defaults = {},
  submitLabel,
  requestType,
  attachment,
}: {
  listingId?: number;
  listingTitle?: string;
  category?: Category;
  showTravelFields?: boolean;
  defaults?: InquiryDefaults;
  submitLabel?: string;
  requestType?: RequestType;
  /** Extra details (e.g. a plan summary) appended to the message on the server. */
  attachment?: string;
}) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const me = useSession().data?.user;
  const t = useT().form;
  const locale = useLocale();
  const v = state.values ?? {};
  const kind = category ?? requestType;
  const extra = bookingFields(kind);
  const dateLabel = kind === 'hotel' ? t.checkIn : kind === 'esim' ? t.travelFrom : t.travelDate;
  const paxLabel = kind === 'visa' ? t.applicants : kind === 'hotel' ? t.guests : t.travellers;

  if (state.ok) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="size-12 text-emerald-600" />
        <p className="mt-4 text-xl font-extrabold text-ink">{t.received}</p>
        <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
        <a href={site.messenger} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
          {t.cantWait} <ArrowUpRight className="size-4" />
        </a>
      </div>
    );
  }

  const field = 'w-full rounded-xl border border-input bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-ink/35 focus:border-brand focus:ring-4 focus:ring-brand/10';
  const label = 'mb-1.5 block text-xs font-bold text-ink/70';

  return (
    <form key={me?.email ?? "guest"} action={action} className="space-y-3.5" noValidate>
      <input type="hidden" name="listingId" value={listingId ?? ''} />
      <input type="hidden" name="listingTitle" value={listingTitle ?? ''} />
      <input type="hidden" name="category" value={category ?? requestType ?? ''} />
      {attachment && <input type="hidden" name="attachment" value={attachment} />}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div>
        <label htmlFor="iq-name" className={label}>{t.fullName}</label>
        <input id="iq-name" name="name" required autoComplete="name" defaultValue={v.name ?? me?.name ?? undefined} placeholder={t.namePh} className={cn(field, state.errors?.name && 'border-destructive')} />
        {state.errors?.name && <p className="mt-1 text-xs text-destructive">{state.errors.name}</p>}
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="iq-phone" className={label}>{t.phone}</label>
          <input id="iq-phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" defaultValue={v.phone} placeholder="+880 1XXX-XXXXXX" className={cn(field, state.errors?.phone && 'border-destructive')} />
          {state.errors?.phone && <p className="mt-1 text-xs text-destructive">{state.errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="iq-email" className={label}>{t.email}</label>
          <input id="iq-email" name="email" type="email" autoComplete="email" defaultValue={v.email ?? me?.email ?? undefined} placeholder="you@example.com" className={cn(field, state.errors?.email && 'border-destructive')} />
          {state.errors?.email && <p className="mt-1 text-xs text-destructive">{state.errors.email}</p>}
        </div>
      </div>
      {showTravelFields && (
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="iq-date" className={label}>{dateLabel}</label>
            <input id="iq-date" name="travelDate" type="date" defaultValue={v.travelDate ?? defaults.travelDate} className={field} />
          </div>
          <div>
            <label htmlFor="iq-travelers" className={label}>{paxLabel}</label>
            <input id="iq-travelers" name="travelers" type="number" min={1} max={999} defaultValue={v.travelers ?? defaults.travelers ?? 2} inputMode="numeric" className={field} />
          </div>
        </div>
      )}
      {extra.length > 0 && (
        <fieldset className="rounded-2xl bg-paper p-3.5 ring-1 ring-border/60 sm:p-4">
          <legend className="sr-only">{t.more}</legend>
          <p className="mb-3 text-sm font-extrabold text-ink">
            {t.more} <span className="text-xs font-medium text-muted-foreground">· {t.optional}</span>
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {extra.map((f) => {
              const id = `iq-ans-${f.key}`;
              const name = `ans.${f.key}`;
              const def = v[name] ?? '';
              return (
                <div key={f.key} className={cn(f.wide && 'sm:col-span-2')}>
                  <label htmlFor={id} className={label}>{f.label[locale]}</label>
                  {f.type === 'select' ? (
                    <select id={id} name={name} defaultValue={def} className={cn(field, 'cursor-pointer', !def && 'text-ink/50')} onChange={(e) => e.currentTarget.classList.toggle('text-ink/50', !e.currentTarget.value)}>
                      <option value="">{t.select}</option>
                      {f.options?.map((opt) => <option key={opt.value} value={opt.value} className="text-ink">{opt.label[locale]}</option>)}
                    </select>
                  ) : (
                    <input
                      id={id}
                      name={name}
                      type={f.type}
                      defaultValue={def}
                      placeholder={f.placeholder?.[locale]}
                      {...(f.type === 'number' ? { min: 0, max: 999, inputMode: 'numeric' as const } : {})}
                      className={cn(field, f.upper && 'uppercase placeholder:normal-case')}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="iq-message" className={label}>{t.anything}</label>
        <textarea id="iq-message" name="message" rows={3} defaultValue={v.message ?? defaults.message} placeholder={t.anythingPh} className={cn(field, 'resize-none')} />
      </div>

      {state.message && !state.ok && <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cta py-3.5 font-bold text-white shadow-lg shadow-cta/25 transition hover:bg-cta-600 disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-[18px]" />}
        {pending ? t.sending : submitLabel ?? t.send}
      </button>
      <p className="text-center text-xs text-muted-foreground">{t.noPayment}</p>
    </form>
  );
}
