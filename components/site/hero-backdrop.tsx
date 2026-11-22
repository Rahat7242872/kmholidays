'use client';

/* eslint-disable @next/next/no-img-element -- full-bleed decorative slideshow */
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const SLIDES = [
  { src: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2400&q=80', place: 'Maldives' },
  { src: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2400&q=80', place: 'Dubai, UAE' },
  { src: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2400&q=80', place: 'Bali, Indonesia' },
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80', place: 'Kashmir, India' },
];

/** Cross-fading destination photos behind the hero (pauses for reduced-motion users). */
export function HeroBackdrop() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div className="absolute inset-0 -z-30 overflow-hidden" aria-hidden="true">
        {SLIDES.map((s, n) => (
          <img
            key={s.src}
            src={s.src}
            alt=""
            loading={n === 0 ? 'eager' : 'lazy'}
            className={cn('absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[1600ms] ease-out', n === i ? 'scale-100 opacity-100' : 'scale-110 opacity-0')}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute right-4 bottom-4 z-10 hidden items-center gap-3 sm:flex lg:right-8">
        <span key={i} className="inline-flex animate-fade-up items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          <MapPin className="size-3.5 text-sun" /> {SLIDES[i].place}
        </span>
        <span className="flex gap-1.5">
          {SLIDES.map((s, n) => (
            <span key={s.place} className={cn('h-1.5 rounded-full bg-white transition-all duration-500', n === i ? 'w-6 opacity-100' : 'w-1.5 opacity-50')} />
          ))}
        </span>
      </div>
    </>
  );
}
