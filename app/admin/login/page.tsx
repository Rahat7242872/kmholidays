'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { Brand } from '@/components/site/brand';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get('callbackUrl') || '/admin';
  const callbackUrl = raw.startsWith('/admin') ? raw : '/admin';
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const result = await signIn('admin', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    });
    if (result?.ok && !result.error) {
      router.replace(callbackUrl);
      router.refresh();
    } else {
      setError('Wrong email or password.');
      setPending(false);
    }
  }

  const field = 'w-full rounded-xl border border-input bg-white px-4 py-3 text-[15px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink/70">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink/70">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={field} />
      </div>
      {error && <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-4" />}
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div
        className="relative hidden bg-ink bg-cover bg-center lg:block"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
        <div className="absolute inset-x-12 bottom-12 text-white">
          <Brand light />
          <p className="mt-6 max-w-md font-display text-4xl leading-tight">Manage tours, hotels, visa & eSIM — all in one place.</p>
        </div>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden"><Brand /></div>
          <h1 className="mt-8 text-3xl font-medium text-ink lg:mt-0">Admin sign in</h1>
          <p className="mt-2 mb-8 text-sm text-muted-foreground">Owner login, or your own account if an admin has given you admin access.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
          <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink">
            <ArrowLeft className="size-4" /> Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
