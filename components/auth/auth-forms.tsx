'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import { registerCustomer, type FormState } from '@/app/actions/account';
import { useT } from '@/components/i18n-provider';
import { cn } from '@/lib/utils';

const fieldWrap = 'flex items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10';
const inputCls = 'min-w-0 flex-1 bg-transparent py-3.5 text-[15px] outline-none placeholder:text-ink/35';

function Field({ icon: Icon, error, children }: { icon: typeof Mail; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className={cn(fieldWrap, error ? 'border-destructive' : 'border-input')}>
        <Icon className="size-5 shrink-0 text-brand" />
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PasswordInput({ name, autoComplete, placeholder }: { name: string; autoComplete: string; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <input name={name} type={show ? 'text' : 'password'} required autoComplete={autoComplete} placeholder={placeholder} className={inputCls} />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="text-muted-foreground hover:text-ink">
        {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.95l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

/** "Continue with Google" — shown always; disabled with a note until Google keys are configured. */
function SocialButtons({ google, github, callbackUrl }: { google: boolean; github: boolean; callbackUrl: string }) {
  const [busy, setBusy] = useState(false);
  const a = useT().auth;
  return (
    <div className="mb-6 space-y-2">
      <button
        type="button"
        disabled={!google || busy}
        onClick={() => { setBusy(true); signIn('google', { callbackUrl }); }}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-white py-3.5 text-[15px] font-bold text-ink shadow-sm transition hover:border-brand/30 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-5 animate-spin" /> : <GoogleLogo />} {a.google}
      </button>
      {!google && <p className="text-center text-xs text-muted-foreground">{a.googleSoon}</p>}
      {github && (
        <button type="button" onClick={() => signIn('github', { callbackUrl })} className="w-full rounded-xl border bg-white py-3 text-sm font-bold hover:bg-muted">
          Continue with GitHub
        </button>
      )}
      <div className="flex items-center gap-3 pt-4 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> {a.orEmail} <span className="h-px flex-1 bg-border" /></div>
    </div>
  );
}

function safeCallback(raw: string | null) {
  return raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/admin') ? raw : '/account';
}

export function SignInForm({ google, github }: { google: boolean; github: boolean }) {
  const router = useRouter();
  const callbackUrl = safeCallback(useSearchParams().get('callbackUrl'));
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const a = useT().auth;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const res = await signIn('customer', { email: form.get('email'), password: form.get('password'), redirect: false });
    if (res?.ok && !res.error) {
      router.replace(callbackUrl);
      router.refresh();
    } else {
      setError(a.wrong);
      setPending(false);
    }
  }

  return (
    <>
      <SocialButtons google={google} github={github} callbackUrl={callbackUrl} />
      <form onSubmit={onSubmit} className="space-y-3.5">
        <Field icon={Mail}><input name="email" type="email" required autoComplete="email" placeholder={a.email} className={inputCls} /></Field>
        <Field icon={Lock}><PasswordInput name="password" autoComplete="current-password" placeholder={a.password} /></Field>
        {error && <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-bold text-white transition hover:bg-brand-700 disabled:opacity-70">
          {pending && <Loader2 className="size-5 animate-spin" />} {pending ? a.loggingIn : a.loginBtn}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {a.newHere}{' '}
        <Link href={`/sign-up${callbackUrl !== '/account' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="font-bold text-brand">{a.createLink}</Link>
      </p>
    </>
  );
}

export function SignUpForm({ google, github }: { google: boolean; github: boolean }) {
  const router = useRouter();
  const callbackUrl = safeCallback(useSearchParams().get('callbackUrl'));
  const [state, setState] = useState<FormState>({ ok: false, message: '' });
  const [pending, setPending] = useState(false);
  const a = useT().auth;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const result = await registerCustomer({ ok: false, message: '' }, form);
    if (!result.ok) {
      setState(result);
      setPending(false);
      return;
    }
    const res = await signIn('customer', { email: form.get('email'), password: form.get('password'), redirect: false });
    router.replace(res?.ok ? (callbackUrl === '/account' ? '/account?welcome=1' : callbackUrl) : '/sign-in');
    router.refresh();
  }

  const e = state.errors ?? {};
  const v = state.values ?? {};

  return (
    <>
      <SocialButtons google={google} github={github} callbackUrl={callbackUrl} />
      <form onSubmit={onSubmit} className="space-y-3.5" noValidate>
        <Field icon={User} error={e.name}><input name="name" required autoComplete="name" defaultValue={v.name} placeholder={a.fullName} className={inputCls} /></Field>
        <Field icon={Mail} error={e.email}><input name="email" type="email" required autoComplete="email" defaultValue={v.email} placeholder={a.email} className={inputCls} /></Field>
        <Field icon={Phone} error={e.phone}><input name="phone" type="tel" required autoComplete="tel" inputMode="tel" defaultValue={v.phone} placeholder={a.phone} className={inputCls} /></Field>
        <Field icon={Lock} error={e.password}><PasswordInput name="password" autoComplete="new-password" placeholder={a.newPassword} /></Field>
        {state.message && !state.ok && <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{state.message}</p>}
        <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cta py-3.5 font-bold text-white shadow-lg shadow-cta/25 transition hover:bg-cta-600 disabled:opacity-70">
          {pending && <Loader2 className="size-5 animate-spin" />} {pending ? a.creating : a.createBtn}
        </button>
        <p className="text-center text-xs text-muted-foreground">{a.agree}</p>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {a.haveAccount} <Link href="/sign-in" className="font-bold text-brand">{a.loginLink}</Link>
      </p>
    </>
  );
}
