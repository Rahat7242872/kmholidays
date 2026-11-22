'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, CheckCircle2, Clock, Lightbulb, RotateCcw, ShieldAlert, Stamp } from 'lucide-react';
import { InquiryForm } from '@/components/site/inquiry-form';
import {
  HISTORY,
  PURPOSES,
  REGIONS,
  STATUSES,
  buildGuide,
  type GuideAnswers,
  type HistoryKey,
  type PurposeKey,
  type RegionKey,
  type StatusKey,
} from '@/lib/go-abroad';
import { cn } from '@/lib/utils';

type Answers = { purpose?: PurposeKey; region?: RegionKey; history?: HistoryKey; status?: StatusKey };

const STEPS = ['Purpose', 'Destination', 'Travel history', 'Your status'] as const;

function Option({ active, emoji, label, blurb, onClick, delay }: { active: boolean; emoji: string; label: string; blurb?: string; onClick: () => void; delay: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        'group flex animate-fade-up items-center gap-3 rounded-2xl bg-white p-4 text-left ring-1 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5',
        active ? 'ring-2 ring-brand shadow-lg shadow-brand/10' : 'ring-border hover:ring-brand/40',
      )}
    >
      <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl text-2xl transition group-hover:scale-110', active ? 'bg-brand-50' : 'bg-muted')}>{emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-ink">{label}</span>
        {blurb && <span className="mt-0.5 block text-xs text-muted-foreground">{blurb}</span>}
      </span>
      <span className={cn('grid size-6 shrink-0 place-items-center rounded-full border-2 transition', active ? 'border-brand bg-brand text-white' : 'border-border')}>
        {active && <Check className="size-3.5" />}
      </span>
    </button>
  );
}

export function GuideWizard({ initial = {} }: { initial?: Answers }) {
  const [answers, setAnswers] = useState<Answers>(initial);
  const [step, setStep] = useState(() => (initial.purpose ? 1 : 0));
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const done = step >= STEPS.length && !!answers.purpose && !!answers.region && !!answers.history && !!answers.status;
  const result = useMemo(() => (done ? buildGuide(answers as GuideAnswers) : null), [done, answers]);

  function pick<K extends keyof Answers>(key: K, value: NonNullable<Answers[K]>) {
    setAnswers((a) => ({ ...a, [key]: value }));
    setTimeout(() => setStep((s) => s + 1), 220);
  }

  function restart() {
    setAnswers({});
    setChecked(new Set());
    setStep(0);
  }

  const progress = Math.min(step, STEPS.length) / STEPS.length;
  const purpose = PURPOSES.find((p) => p.key === answers.purpose);
  const region = REGIONS.find((r) => r.key === answers.region);
  const history = HISTORY.find((h) => h.key === answers.history);
  const status = STATUSES.find((s) => s.key === answers.status);

  return (
    <div>
      {/* Progress */}
      <div className="rounded-2xl bg-white p-4 ring-1 ring-border/60 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              disabled={i > step || done}
              onClick={() => setStep(i)}
              className={cn('flex min-w-0 flex-1 items-center gap-2 text-left text-xs font-bold transition sm:text-sm', i <= step ? 'text-brand' : 'text-ink/35')}
            >
              <span className={cn('grid size-7 shrink-0 place-items-center rounded-full text-xs transition', i < step || done ? 'bg-brand text-white' : i === step ? 'bg-brand-50 text-brand ring-2 ring-brand' : 'bg-muted')}>
                {i < step || done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="hidden truncate sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div className="bg-swoosh h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${(done ? 1 : progress) * 100}%` }} />
        </div>
      </div>

      {/* Questions */}
      {!done && (
        <div key={step} className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="animate-fade-up text-xl font-extrabold text-ink sm:text-2xl">
              {step === 0 && 'Why do you want to go abroad?'}
              {step === 1 && 'Where do you want to go?'}
              {step === 2 && 'Have you travelled abroad before?'}
              {step === 3 && 'What do you do right now?'}
            </h2>
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-muted-foreground hover:text-brand">
                <ArrowLeft className="size-4" /> Back
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {step === 0 && PURPOSES.map((p, i) => <Option key={p.key} delay={i * 50} active={answers.purpose === p.key} emoji={p.emoji} label={p.label} blurb={p.blurb} onClick={() => pick('purpose', p.key)} />)}
            {step === 1 && REGIONS.map((r, i) => <Option key={r.key} delay={i * 50} active={answers.region === r.key} emoji={r.emoji} label={r.label} blurb={r.examples} onClick={() => pick('region', r.key)} />)}
            {step === 2 && HISTORY.map((h, i) => <Option key={h.key} delay={i * 50} active={answers.history === h.key} emoji={h.emoji} label={h.label} blurb={h.blurb} onClick={() => pick('history', h.key)} />)}
            {step === 3 && STATUSES.map((s, i) => <Option key={s.key} delay={i * 50} active={answers.status === s.key} emoji={s.emoji} label={s.label} onClick={() => pick('status', s.key)} />)}
          </div>
          {step === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Going for Umrah or Hajj? See our <Link href="/umrah" className="font-bold text-brand">Umrah A to Z guide</Link>.
            </p>
          )}
        </div>
      )}

      {/* Result */}
      {result && purpose && region && history && status && (
        <div className="mt-6 space-y-5">
          <div className="animate-fade-up overflow-hidden rounded-3xl bg-ink text-white">
            <div className="bg-swoosh h-1.5" />
            <div className="relative p-6 sm:p-8">
              <div className="pointer-events-none absolute -top-16 -right-16 size-60 rounded-full bg-grape/40 blur-3xl" />
              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold text-sun">Your personal guide</p>
                  <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                    {purpose.emoji} {purpose.label} → {region.label}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {[history.label, status.label].map((t) => <span key={t} className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">{t}</span>)}
                  </div>
                </div>
                <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 self-start rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold ring-1 ring-white/20 hover:bg-white/20 md:self-auto">
                  <RotateCcw className="size-4" /> Start over
                </button>
              </div>
              <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-xs text-white/60">Visa difficulty</p>
                  <div className="mt-2 flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        style={{ transitionDelay: `${n * 120}ms` }}
                        className={cn('h-2.5 flex-1 rounded-full transition-all duration-500', n <= result.level ? (result.level <= 2 ? 'bg-emerald-400' : result.level === 3 ? 'bg-sun' : 'bg-cta') : 'bg-white/15')}
                      />
                    ))}
                  </div>
                  <p className="mt-2 font-bold">{result.levelLabel}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="flex items-center gap-1.5 text-xs text-white/60"><Clock className="size-3.5" /> Typical processing time</p>
                  <p className="mt-2 font-bold">{result.timeline}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <section className="animate-fade-up rounded-2xl bg-white p-5 ring-1 ring-border/60 [animation-delay:100ms] sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-extrabold text-ink">Documents checklist</h3>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand">{checked.size}/{result.documents.length} ready</span>
              </div>
              <ul className="mt-4 space-y-2">
                {result.documents.map((d, i) => {
                  const on = checked.has(i);
                  return (
                    <li key={d}>
                      <button
                        type="button"
                        onClick={() => setChecked((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                        className={cn('flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition', on ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-muted')}
                      >
                        <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition', on ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-input')}>
                          {on && <Check className="size-3" />}
                        </span>
                        <span className={cn(on && 'line-through decoration-emerald-600/40')}>{d}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="animate-fade-up rounded-2xl bg-white p-5 ring-1 ring-border/60 [animation-delay:200ms] sm:p-6">
              <h3 className="text-lg font-extrabold text-ink">How the process works</h3>
              <ol className="mt-5">
                {result.steps.map((s, i) => (
                  <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < result.steps.length - 1 && <span className="absolute top-9 bottom-0 left-[17px] w-0.5 bg-gradient-to-b from-brand/40 to-brand/5" />}
                    <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-extrabold text-white shadow-md shadow-brand/30">{i + 1}</span>
                    <div className="pt-1">
                      <p className="font-bold text-ink">{s.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section className="animate-fade-up rounded-2xl bg-sun/10 p-5 ring-1 ring-sun/30 [animation-delay:300ms] sm:p-6">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink"><Lightbulb className="size-5 text-cta-600" /> Tips for you</h3>
            <ul className="mt-3 space-y-2">
              {result.tips.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-ink/85"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cta-600" /> {t}</li>
              ))}
            </ul>
          </section>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col justify-between gap-4 rounded-2xl bg-brand-50 p-5 sm:p-6">
              <div>
                <h3 className="text-lg font-extrabold text-ink">Ready to start?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Send your details — our visa team will review your profile for free and tell you exactly what to do next.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={result.visaLink} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand ring-1 ring-brand/20">
                  <Stamp className="size-4" /> See visa services
                </Link>
              </div>
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" /> This is general guidance. Requirements change and every embassy decides independently — our team confirms the latest rules for your case.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-border/60 sm:p-6">
              <p className="mb-4 text-lg font-extrabold text-ink">Get free consultation</p>
              <InquiryForm
                requestType="visa-guide"
                listingTitle={`Go abroad: ${purpose.label} → ${region.label}`}
                showTravelFields={false}
                defaults={{ message: `Purpose: ${purpose.label}\nDestination: ${region.label}\nTravel history: ${history.label}\nCurrent status: ${status.label}` }}
                submitLabel="Get free consultation"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
