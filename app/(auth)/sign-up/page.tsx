import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignUpForm } from '@/components/auth/auth-forms';
import { oauthEnabled } from '@/lib/auth';
import { getT } from '@/lib/i18n-server';

export const metadata: Metadata = { title: 'Create account' };

export default async function SignUpPage() {
  const a = (await getT()).auth;
  return (
    <AuthShell title={a.createTitle} subtitle={a.createSub}>
      <Suspense>
        <SignUpForm google={oauthEnabled.google} github={oauthEnabled.github} />
      </Suspense>
    </AuthShell>
  );
}
