/* eslint-disable @next/next/no-img-element -- Google profile photos come from googleusercontent.com */
import { cn } from '@/lib/utils';

export function initialsOf(name?: string | null, email?: string | null) {
  const source = (name || email || '?').trim();
  return source.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

/** Round avatar: profile photo if available, otherwise initials on the logo gradient, with a swoosh ring. */
export function UserAvatar({ name, email, image, className }: { name?: string | null; email?: string | null; image?: string | null; className?: string }) {
  return (
    <span className={cn('bg-swoosh inline-grid shrink-0 place-items-center rounded-full p-[2px]', className ?? 'size-10')}>
      <span className="grid size-full place-items-center overflow-hidden rounded-full bg-white p-[2px]">
        {image ? (
          <img src={image} alt="" referrerPolicy="no-referrer" className="size-full rounded-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center rounded-full bg-gradient-to-br from-brand to-grape text-[0.8em] font-extrabold text-white">
            {initialsOf(name, email)}
          </span>
        )}
      </span>
    </span>
  );
}
