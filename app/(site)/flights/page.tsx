import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Briefcase, CalendarClock, GraduationCap, Luggage, PlaneTakeoff, Plane, Users, Wallet } from 'lucide-react';
import { FlightSearchForm } from '@/components/site/flight-search';
import { InquiryForm } from '@/components/site/inquiry-form';
import { POPULAR_ROUTES, airportLabel, findAirport } from '@/lib/flights';
import { contacts, flagFor } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Air Tickets',
  description: 'Book domestic and international air tickets from Bangladesh — best fares across airlines, student, worker, Umrah and group tickets.',
};

type Search = { from?: string; to?: string; date?: string; ret?: string; pax?: string; cls?: string; trip?: string };

const TICKET_TYPES = [
  { icon: Plane, title: 'Holiday & business', text: 'Best available fares on all major airlines, one-way or return.' },
  { icon: GraduationCap, title: 'Student tickets', text: 'Fares for students heading abroad, with help on extra baggage.' },
  { icon: Briefcase, title: 'Worker tickets', text: 'Tickets for job & work-visa travellers to the Middle East and Asia.' },
  { icon: Users, title: 'Group & Umrah', text: 'Group fares for families, corporate trips and Umrah groups.' },
];

export default async function FlightsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const hasSearch = !!(sp.from && sp.to);
  const trip = sp.trip === 'round' ? 'Round trip' : 'One way';
  const title = hasSearch ? `${sp.from} → ${sp.to}` : '';
  const details = hasSearch
    ? [
        `Flight: ${sp.from} → ${sp.to} (${trip})`,
        sp.date && `Departure: ${sp.date}`,
        sp.trip === 'round' && sp.ret && `Return: ${sp.ret}`,
        `Travellers: ${sp.pax ?? 1} · Class: ${sp.cls ?? 'Economy'}`,
      ].filter(Boolean).join('\n')
    : '';

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink pb-8">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-ink via-brand-700 to-brand" />
        <div className="pointer-events-none absolute -top-24 -left-24 -z-10 size-96 rounded-full bg-grape/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 -z-10 size-80 rounded-full bg-teal/25 blur-3xl" />
        <PlaneTakeoff className="pointer-events-none absolute top-10 right-[6%] -z-10 hidden size-40 text-white/5 md:block" />
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sun ring-1 ring-white/15">
            <PlaneTakeoff className="size-3.5" /> Air tickets
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-5xl">
            Book flights at the <span className="text-swoosh">best fare</span>
          </h1>
          <p className="mt-2 max-w-2xl text-white/75">Search your route — our ticketing team compares airlines and sends you the best available fare, usually the same day.</p>
          <div className="mt-6 rounded-3xl bg-white p-3 shadow-2xl sm:p-5">
            <FlightSearchForm initial={sp} />
          </div>
        </div>
      </section>

      {hasSearch && (
        <section id="request" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-8 sm:px-6">
          <div className="grid gap-6 overflow-hidden rounded-3xl bg-white ring-1 ring-border/60 lg:grid-cols-[1fr_1.1fr]">
            <div className="relative bg-gradient-to-br from-brand to-brand-700 p-6 text-white sm:p-8">
              <p className="text-sm font-bold text-sun">Your flight</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-2xl font-extrabold">{sp.from}</p>
                  <p className="text-xs text-white/60">From</p>
                </div>
                <div className="relative flex flex-1 items-center">
                  <span className="h-px flex-1 border-t-2 border-dashed border-white/30" />
                  <Plane className="mx-2 size-6 shrink-0 animate-pulse text-sun" />
                  <span className="h-px flex-1 border-t-2 border-dashed border-white/30" />
                </div>
                <div className="min-w-0 text-right">
                  <p className="truncate text-2xl font-extrabold">{sp.to}</p>
                  <p className="text-xs text-white/60">To</p>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Trip', trip],
                  ['Departure', sp.date || 'Flexible'],
                  ['Return', sp.trip === 'round' ? sp.ret || 'Flexible' : '—'],
                  ['Travellers', `${sp.pax ?? 1} · ${sp.cls ?? 'Economy'}`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-white/10 px-3 py-2.5">
                    <dt className="text-[11px] text-white/60">{k}</dt>
                    <dd className="font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-6 space-y-2 text-sm text-white/85">
                <li className="flex items-center gap-2"><BadgeCheck className="size-4 text-sun" /> We compare fares across airlines for you</li>
                <li className="flex items-center gap-2"><Wallet className="size-4 text-sun" /> No payment until you confirm the fare</li>
                <li className="flex items-center gap-2"><CalendarClock className="size-4 text-sun" /> Need it urgently? Call {contacts[0].display}</li>
              </ul>
            </div>
            <div className="p-5 sm:p-8">
              <p className="text-xl font-extrabold text-ink">Get the best fare</p>
              <p className="mt-1 mb-5 text-sm text-muted-foreground">Fares change through the day, so our team checks live availability and calls you back with options.</p>
              <InquiryForm
                listingTitle={`Air ticket: ${title}`}
                showTravelFields
                defaults={{ travelDate: sp.date, travelers: sp.pax, message: details }}
                submitLabel="Request fare"
                requestType="flight"
              />
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
        <h2 className="text-2xl font-extrabold text-ink sm:text-[28px]">Popular routes from Bangladesh</h2>
        <p className="mt-1 text-muted-foreground">Tap a route to request today’s best fare.</p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_ROUTES.map((r) => {
            const from = findAirport(r.from);
            const to = findAirport(r.to);
            if (!from || !to) return null;
            const href = `/flights?trip=oneway&from=${encodeURIComponent(airportLabel(from))}&to=${encodeURIComponent(airportLabel(to))}&pax=1&cls=Economy#request`;
            return (
              <Link key={r.to} href={href} className="group flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-border/60 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand/30">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-2xl">{flagFor(to.country, to.city) ?? '✈️'}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-extrabold text-ink">
                    {from.code} <ArrowRight className="size-3.5 text-cta" /> {to.code}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{from.city} to {to.city} · {r.note}</span>
                </span>
                <PlaneTakeoff className="size-5 text-brand/40 transition group-hover:text-brand" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:pb-16">
        <h2 className="text-2xl font-extrabold text-ink sm:text-[28px]">Tickets for every kind of traveller</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {TICKET_TYPES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-white p-4 ring-1 ring-border/60 sm:p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand"><Icon className="size-6" /></span>
              <p className="mt-4 font-bold text-ink">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-cta/10 p-4 text-sm text-ink">
          <Luggage className="size-5 shrink-0 text-cta-600" />
          Baggage allowance, date-change and refund rules depend on the airline and fare — our team explains them before you pay.
        </div>
      </section>
    </>
  );
}
