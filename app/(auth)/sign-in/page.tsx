import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignInForm } from '@/components/auth/auth-forms';
import { oauthEnabled } from '@/lib/auth';
import { getT } from '@/lib/i18n-server';

export const metadata: Metadata = { title: 'Log in' };

export default async function SignInPage() {
  const a = (await getT()).auth;
  return (
    <AuthShell title={a.welcomeBack} subtitle={a.signInSub}>
      <Suspense>
        <SignInForm google={oauthEnabled.google} github={oauthEnabled.github} />
      </Suspense>
    </AuthShell>
  );
}
