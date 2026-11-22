'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Download, Printer } from 'lucide-react';

/** Screen-only toolbar above the PDF sheet. "Download PDF" opens the browser's Save-as-PDF dialog. */
export function PrintToolbar({ backHref, fileName, auto }: { backHref: string; fileName: string; auto?: boolean }) {
  useEffect(() => {
    // The saved PDF takes its file name from the page title.
    document.title = fileName;
    if (auto) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [fileName, auto]);

  return (
    <div className="sticky top-0 z-10 mb-6 border-b bg-white/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm font-semibold text-ink/70 hover:text-brand">
          <ChevronLeft className="size-4" /> Back to order
        </Link>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold ring-1 ring-border hover:bg-muted">
            <Printer className="size-4" /> Print
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">
            <Download className="size-4" /> Download PDF
          </button>
        </div>
      </div>
      <p className="mx-auto max-w-[210mm] px-4 pb-2 text-[11px] text-muted-foreground">In the dialog choose <b>“Save as PDF”</b> as the destination.</p>
    </div>
  );
}
