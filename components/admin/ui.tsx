import { cn } from '@/lib/utils';
import type { InquiryStatus } from '@/lib/types';

export function PageHeader({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-medium text-ink sm:text-4xl">{title}</h1>
        {text && <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>}
      </div>
      {action}
    </div>
  );
}

const statusStyles: Record<InquiryStatus, string> = {
  new: 'bg-cta/15 text-cta-600',
  contacted: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-brand-50 text-brand',
  closed: 'bg-muted text-muted-foreground',
};

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize', statusStyles[status])}>{status}</span>;
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-2xl bg-white ring-1 ring-border/70', className)}>{children}</div>;
}
