'use client';

import { useActionState } from 'react';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import { updateProfile, type FormState } from '@/app/actions/account';
import { useT } from '@/components/i18n-provider';
import { OCCUPATIONS, type Customer } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ProfileForm({ user }: { user: Customer }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, { ok: false, message: '' });
  const a = useT().acct;
  const v = state.values ?? {};
  const e = state.errors ?? {};
  const field = (err?: string) => cn('w-full rounded-xl border bg-white px-4 py-3 text-[15px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10', err ? 'border-destructive' : 'border-input');
  const label = 'mb-1.5 block text-xs font-bold text-ink/70';

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-name" className={label}>{a.fullName}</label>
          <input id="pf-name" name="name" defaultValue={v.name ?? user.name} className={field(e.name)} />
          {e.name && <p className="mt-1 text-xs text-destructive">{e.name}</p>}
        </div>
        <div>
          <label htmlFor="pf-phone" className={label}>{a.phone}</label>
          <input id="pf-phone" name="phone" type="tel" defaultValue={v.phone ?? user.phone} className={field(e.phone)} />
          {e.phone && <p className="mt-1 text-xs text-destructive">{e.phone}</p>}
        </div>
        <div>
          <label htmlFor="pf-occupation" className={label}>{a.occupation}</label>
          <select id="pf-occupation" name="occupation" defaultValue={v.occupation ?? user.profile.occupation ?? ''} className={field()}>
            <option value="">{a.select}</option>
            {OCCUPATIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="pf-city" className={label}>{a.city}</label>
          <input id="pf-city" name="city" defaultValue={v.city ?? user.profile.city ?? ''} placeholder={a.cityPh} className={field()} />
        </div>
      </div>
      <div>
        <label htmlFor="pf-history" className={label}>{a.history} <span className="font-normal text-muted-foreground">{a.historyHint}</span></label>
        <textarea id="pf-history" name="travelHistory" rows={3} defaultValue={v.travelHistory ?? user.profile.travelHistory ?? ''} placeholder={a.historyPh} className={cn(field(), 'resize-none')} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-70">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} {a.save}
        </button>
        {state.message && (
          <p className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', state.ok ? 'text-emerald-600' : 'text-destructive')}>
            {state.ok && <CheckCircle2 className="size-4" />} {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
