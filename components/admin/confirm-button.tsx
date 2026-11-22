'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Submit button that asks for confirmation first (for destructive actions). */
export function ConfirmButton({ message, className, children, title }: { message: string; className?: string; children: React.ReactNode; title?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      title={title}
      aria-label={title}
      disabled={pending}
      onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}
      className={cn('disabled:opacity-60', className)}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  );
}

export function SubmitButton({ className, children, title }: { className?: string; children: React.ReactNode; title?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" title={title} aria-label={title} disabled={pending} className={cn('disabled:opacity-60', className)}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  );
}
