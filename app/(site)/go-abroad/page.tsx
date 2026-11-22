import type { Metadata } from 'next';
import { Compass } from 'lucide-react';
import { GuideWizard } from '@/components/go-abroad/guide-wizard';
import { getSessionUser } from '@/lib/auth';
import { getUserById } from '@/lib/data';
import { PURPOSES, type PurposeKey, type StatusKey } from '@/lib/go-abroad';

export const metadata: Metadata = {
  title: 'Go Abroad Guide',
  description: 'Student, worker, tourist or business traveller? Answer 4 quick questions and get your visa checklist, process and tips for going abroad from Bangladesh.',
};

const OCCUPATION_TO_STATUS: Record<string, StatusKey> = {
  'Job holder': 'job',
  'Business owner': 'business',
  Student: 'student',
};

export default async function GoAbroadPage({ searchParams }: { searchParams: Promise<{ purpose?: string }> }) {
  const { purpose } = await searchParams;
  const initialPurpose = PURPOSES.some((p) => p.key === purpose) ? (purpose as PurposeKey) : undefined;

  // Logged-in customers: pre-select their status from their profile.
  const session = await getSessionUser();
  const user = session?.id ? await getUserById(session.id) : null;
  const initialStatus = user?.profile.occupation ? OCCUPATION_TO_STATUS[user.profile.occupation] : undefined;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-ink via-brand-700 to-grape" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 -z-10 size-96 rounded-full bg-teal/25 blur-3xl" />
        <div className="pointer-events-none absolute top-0 left-1/3 -z-10 size-80 rounded-full bg-cta/20 blur-3xl" />
        <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 sm:py-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sun ring-1 ring-white/15">
            <Compass className="size-3.5 animate-spin [animation-duration:6s]" /> Go Abroad Guide
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-extrabold text-white sm:text-5xl">
            Planning to go abroad? <span className="text-swoosh">Know exactly what you need.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/75">
            Student, worker, tourist or business traveller — answer 4 quick questions and get your personal document checklist, process and tips. Free, no sign-up needed.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <GuideWizard initial={{ purpose: initialPurpose, status: initialStatus }} />
      </div>
    </>
  );
}
