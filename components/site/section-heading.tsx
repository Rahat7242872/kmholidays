import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-bold', light ? 'bg-white/10 text-sun' : 'bg-brand-50 text-brand')}>
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  href,
  linkLabel,
  light,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  text?: string;
  href?: string;
  linkLabel?: string;
  light?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
        <h2 className={cn('text-2xl leading-tight font-extrabold text-balance sm:text-[32px]', eyebrow && 'mt-3', light ? 'text-white' : 'text-ink')}>{title}</h2>
        {text && <p className={cn('mt-2 max-w-xl text-[15px]', light ? 'text-white/70' : 'text-muted-foreground')}>{text}</p>}
      </div>
      {children}
      {href && (
        <Link href={href} className={cn('group inline-flex shrink-0 items-center gap-1 self-start text-sm font-bold md:self-auto', light ? 'text-sun' : 'text-brand')}>
          {linkLabel ?? 'View all'} <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
