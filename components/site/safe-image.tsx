'use client';

/* eslint-disable @next/next/no-img-element -- admins can paste any image URL, so we skip next/image's host allow-list */
import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SafeImage({ src, alt, className, priority }: { src: string; alt: string; className?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(!src);
  const ref = useRef<HTMLImageElement>(null);

  // A server-rendered <img> can fail before React hydrates, in which case onError never fires.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <div className={cn('grid place-items-center bg-gradient-to-br from-brand to-ink text-white/40', className)} role="img" aria-label={alt}>
        <ImageOff className="size-7" />
      </div>
    );
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={cn('object-cover', className)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
