import Link from 'next/link';
import { MapPin, Plane } from 'lucide-react';
import { getT } from '@/lib/i18n-server';
import { flagFor } from '@/lib/site';

/**
 * Animated world map: KM Holidays planes fly from Dhaka to destinations around the world.
 * Pure SVG + SMIL animation (no client JS). The dotted map is a static file generated from
 * world-atlas land data in the same equirectangular projection used below.
 */

const W = 1000;
const LAT_TOP = 82;
const H = 383.3;
const unit = W / 360;
const project = (lon: number, lat: number) => ({ x: (lon + 180) * unit, y: (LAT_TOP - lat) * unit });

type Dest = { name: string; lon: number; lat: number; href: string; label?: { dx: number; dy: number; anchor?: 'start' | 'middle' | 'end' } };

const HUB = { name: 'Dhaka', lon: 90.41, lat: 23.81 };

const DESTINATIONS: Dest[] = [
  { name: 'Dubai', lon: 55.27, lat: 25.2, href: '/tours?q=Dubai', label: { dx: -8, dy: 4, anchor: 'end' } },
  { name: 'Bangkok', lon: 100.5, lat: 13.75, href: '/tours?q=Thailand', label: { dx: 8, dy: 0 } },
  { name: 'Kuala Lumpur', lon: 101.69, lat: 3.14, href: '/visa?q=Malaysia', label: { dx: -8, dy: 4, anchor: 'end' } },
  { name: 'Singapore', lon: 103.82, lat: 1.35, href: '/esim?q=Asia', label: { dx: 8, dy: 6 } },
  { name: 'Bali', lon: 115.19, lat: -8.41, href: '/tours?q=Bali', label: { dx: 8, dy: 4 } },
  { name: 'Maldives', lon: 73.5, lat: 4.17, href: '/tours?q=Maldives', label: { dx: -8, dy: 4, anchor: 'end' } },
  { name: 'Kathmandu', lon: 85.32, lat: 27.72, href: '/tours?q=Nepal', label: { dx: 2, dy: -12, anchor: 'middle' } },
  { name: 'Kashmir', lon: 74.8, lat: 34.08, href: '/tours?q=Kashmir', label: { dx: -8, dy: -2, anchor: 'end' } },
  { name: 'Makkah', lon: 39.83, lat: 21.42, href: '/services?q=Umrah', label: { dx: -8, dy: 8, anchor: 'end' } },
  { name: 'Istanbul', lon: 28.97, lat: 41.0, href: '/tours?q=Istanbul', label: { dx: 0, dy: -10, anchor: 'middle' } },
  { name: 'Paris', lon: 2.35, lat: 48.86, href: '/visa?q=Schengen', label: { dx: -8, dy: 6, anchor: 'end' } },
  { name: 'London', lon: -0.13, lat: 51.5, href: '/visa', label: { dx: -8, dy: -4, anchor: 'end' } },
  { name: 'Tokyo', lon: 139.69, lat: 35.68, href: '/tours?q=Japan', label: { dx: 8, dy: 4 } },
  { name: 'Sydney', lon: 151.2, lat: -33.87, href: '/tours?q=Australia', label: { dx: 8, dy: 4 } },
  { name: 'New York', lon: -74.0, lat: 40.71, href: '/visa', label: { dx: 0, dy: -10, anchor: 'middle' } },
];

/** Quadratic arc from the hub to a destination, bulging north. */
function route(d: Dest) {
  const a = project(HUB.lon, HUB.lat);
  const b = project(d.lon, d.lat);
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2 - Math.min(dist * 0.32, 150);
  return { a, b, dist, d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`, east: b.x >= a.x };
}

const CYCLE = 30; // seconds for all planes to take off once
const FLIGHT = 5; // seconds in the air

function KmBanner({ x, flip }: { x: number; flip?: boolean }) {
  // Little "KM Holidays" banner towed behind the plane, in logo colours.
  return (
    <g>
      <line x1={flip ? 10 : -10} y1="0" x2={x} y2="0" stroke="#ffffff" strokeOpacity=".7" strokeWidth=".8" />
      <rect x={flip ? x : x - 52} y="-7.5" width="52" height="15" rx="4" fill="#ffffff" />
      <text x={flip ? x + 26 : x - 26} y="3.6" textAnchor="middle" fontSize="9.5" fontWeight="800" fontFamily="var(--font-jakarta), sans-serif">
        <tspan fill="#2e3192">K</tspan>
        <tspan fill="#f7941d">M</tspan>
        <tspan fill="#1b1d55" fontWeight="700"> Holidays</tspan>
      </text>
    </g>
  );
}

// Top-view airliner pointing along +x.
const PLANE = 'M13 0 L4 -1.8 L-1 -10 L-4.5 -10 L-1.5 -1.8 L-7 -1.8 L-9.5 -5.5 L-11.5 -5.5 L-10 0 L-11.5 5.5 L-9.5 5.5 L-7 1.8 L-1.5 1.8 L-4.5 10 L-1 10 L4 1.8 Z';

export async function WorldRoutes() {
  const t = await getT();
  const hub = project(HUB.lon, HUB.lat);
  const routes = DESTINATIONS.map((d) => ({ dest: d, ...route(d) }));
  const f = FLIGHT / CYCLE;

  return (
    <section className="relative isolate overflow-hidden bg-ink py-14 sm:py-20">
      <div className="pointer-events-none absolute -top-40 left-1/4 -z-10 size-[520px] rounded-full bg-grape/35 blur-3xl" />
      <div className="pointer-events-none absolute right-0 -bottom-40 -z-10 size-[460px] rounded-full bg-teal/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sun ring-1 ring-white/15">
            <Plane className="size-3.5" /> {t.home.mapBadge}
          </span>
          <h2 className="mt-4 text-3xl leading-tight font-extrabold text-white sm:text-[44px]">
            {t.home.mapTitle1} <span className="text-swoosh">{t.home.mapTitle2}</span>
          </h2>
          <p className="mt-3 text-[15px] text-white/70 sm:text-base">
            {t.home.mapText}
          </p>
        </div>

        {/* Map: on phones it's zoomed to Europe–Asia–Pacific so Dhaka stays in view */}
        <div className="relative mt-8 overflow-hidden sm:mt-12">
          <div className="relative -ml-[80%] w-[180%] sm:ml-0 sm:w-full" style={{ aspectRatio: `${W} / ${H}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/world-dots.svg" alt="" aria-hidden="true" className="absolute inset-0 size-full opacity-[.16]" />

            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" role="img" aria-label="Map of KM Holidays flight routes from Dhaka">
              <defs>
                <linearGradient id="route-grad" x1="0" x2="1">
                  <stop offset="0" stopColor="#f7941d" />
                  <stop offset="1" stopColor="#17a3b8" />
                </linearGradient>
                <radialGradient id="hub-glow">
                  <stop offset="0" stopColor="#f7941d" stopOpacity=".6" />
                  <stop offset="1" stopColor="#f7941d" stopOpacity="0" />
                </radialGradient>
                <g id="plane-east">
                  <path d={PLANE} fill="#ffffff" />
                  <KmBanner x={-16} />
                </g>
                <g id="plane-west">
                  <path d={PLANE} fill="#ffffff" transform="scale(-1 1)" />
                  <KmBanner x={16} flip />
                </g>
              </defs>

              {/* Routes */}
              {routes.map((r) => (
                <path key={r.dest.name} d={r.d} fill="none" stroke="url(#route-grad)" strokeWidth="1.3" strokeOpacity=".55" strokeDasharray="4 5" strokeLinecap="round">
                  <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1.6s" repeatCount="indefinite" />
                </path>
              ))}

              {/* Destinations */}
              {routes.map((r, i) => (
                <a key={r.dest.name} href={r.dest.href} className="group">
                  <circle cx={r.b.x} cy={r.b.y} r="3" fill="#17a3b8" opacity=".5">
                    <animate attributeName="r" values="3;9;3" dur="3s" begin={`${(i * 0.4) % 3}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values=".5;0;.5" dur="3s" begin={`${(i * 0.4) % 3}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={r.b.x} cy={r.b.y} r="3.4" fill="#ffffff" stroke="#17a3b8" strokeWidth="1.6" />
                  <text
                    x={r.b.x + (r.dest.label?.dx ?? 8)}
                    y={r.b.y + (r.dest.label?.dy ?? 4)}
                    textAnchor={r.dest.label?.anchor ?? 'start'}
                    fontSize="11"
                    fontWeight="700"
                    fill="#ffffff"
                    fillOpacity=".85"
                    className="transition group-hover:fill-[#f7941d]"
                    fontFamily="var(--font-jakarta), sans-serif"
                  >
                    {r.dest.name}
                  </text>
                </a>
              ))}

              {/* Planes: each takes off from Dhaka in turn, flies, lands, fades out */}
              <g className="motion-reduce:hidden">
                {routes.map((r, i) => {
                  const begin = `${((i * CYCLE) / routes.length).toFixed(2)}s`;
                  return (
                    <use key={r.dest.name} href={r.east ? '#plane-east' : '#plane-west'} opacity="0">
                      <animateMotion
                        dur={`${CYCLE}s`}
                        begin={begin}
                        repeatCount="indefinite"
                        path={r.d}
                        rotate={r.east ? 'auto' : 'auto-reverse'}
                        keyPoints="0;1;1"
                        keyTimes={`0;${f.toFixed(3)};1`}
                        calcMode="linear"
                      />
                      <animate
                        attributeName="opacity"
                        dur={`${CYCLE}s`}
                        begin={begin}
                        repeatCount="indefinite"
                        values="0;1;1;0;0"
                        keyTimes={`0;0.01;${(f * 0.9).toFixed(3)};${(f + 0.01).toFixed(3)};1`}
                      />
                    </use>
                  );
                })}
              </g>

              {/* Dhaka hub */}
              <circle cx={hub.x} cy={hub.y} r="26" fill="url(#hub-glow)" />
              <circle cx={hub.x} cy={hub.y} r="6" fill="none" stroke="#f7941d" strokeWidth="1.5">
                <animate attributeName="r" values="6;20" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={hub.x} cy={hub.y} r="5.5" fill="#f7941d" stroke="#ffffff" strokeWidth="2" />
              <g transform={`translate(${hub.x + 10} ${hub.y + 10})`}>
                <rect width="86" height="20" rx="10" fill="#f7941d" />
                <text x="43" y="13.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff" fontFamily="var(--font-jakarta), sans-serif">
                  Dhaka · KM HQ
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Destination chips */}
        <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
          {DESTINATIONS.map((d) => (
            <Link key={d.name} href={d.href} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white hover:text-ink">
              {flagFor(d.name) ? <span>{flagFor(d.name)}</span> : <MapPin className="size-3.5 text-sun" />} {d.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
