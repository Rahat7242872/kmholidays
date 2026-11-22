'use client';

import { useActionState, useMemo, useState } from 'react';
import { CheckCircle2, Download, Eye, Loader2, Save } from 'lucide-react';
import { saveInquiryDocument, type DocumentFormState } from '@/app/admin/actions';
import { DOC_TYPES, infoToText, itemsToText, parseItems, taka, totals, type LineItem, type OrderDocument } from '@/lib/order-document';
import { cn } from '@/lib/utils';

const INFO_PLACEHOLDER: Record<string, string> = {
  visa: 'Passport no: A01234567\nVisa type: Tourist, single entry\nSubmission date: 25 Nov 2026\nExpected delivery: 2 Dec 2026',
  booking: 'Hotel: Ubud Village Resort (Deluxe room)\nFlight: BG-388 DAC → DPS, 10 Dec\nPickup: 10:30 AM, airport',
};

export function DocumentForm({ id, doc, suggestedItems, defaultType }: { id: number; doc: OrderDocument; suggestedItems: LineItem[]; defaultType: string }) {
  const [state, action, pending] = useActionState<DocumentFormState, FormData>(saveInquiryDocument, { ok: false, message: '' });
  const [type, setType] = useState<string>(doc.type ?? defaultType);
  const [items, setItems] = useState(itemsToText(doc.items?.length ? doc.items : suggestedItems));
  const [discount, setDiscount] = useState(doc.discount ? String(doc.discount) : '');
  const [paid, setPaid] = useState(doc.paid ? String(doc.paid) : '');
  const t = useMemo(() => totals({ items: parseItems(items), discount: Number(discount) || 0, paid: Number(paid) || 0 }), [items, discount, paid]);

  const field = 'w-full rounded-xl border border-input bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10';
  const label = 'mb-1.5 block text-xs font-semibold text-ink/70';
  const saved = state.ok && !pending;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      <div>
        <p className={label}>Document type</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DOC_TYPES).map(([key, name]) => (
            <label key={key} className={cn('cursor-pointer rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition', type === key ? 'bg-brand text-white ring-brand' : 'bg-white text-ink/70 ring-border hover:ring-brand/40')}>
              <input type="radio" name="type" value={key} checked={type === key} onChange={() => setType(key)} className="sr-only" />
              {name}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="issueDate" className={label}>Issue date</label>
          <input id="issueDate" name="issueDate" type="date" defaultValue={doc.issueDate ?? new Date().toISOString().slice(0, 10)} className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="info" className={label}>Details shown on the PDF <span className="font-normal text-muted-foreground">(one per line — Label: value)</span></label>
        <textarea id="info" name="info" rows={4} defaultValue={infoToText(doc.info)} placeholder={INFO_PLACEHOLDER[type === 'visa' ? 'visa' : 'booking']} className={cn(field, 'font-mono text-[13px]')} />
      </div>

      <div>
        <label htmlFor="items" className={label}>Cost breakdown <span className="font-normal text-muted-foreground">(one per line — Description: amount)</span></label>
        <textarea id="items" name="items" rows={5} value={items} onChange={(e) => setItems(e.target.value)} placeholder={'Tour package (2 × 68,500): 137000\nVisa processing: 6500'} className={cn(field, 'font-mono text-[13px]')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="discount" className={label}>Discount (৳)</label>
          <input id="discount" name="discount" inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value.replace(/[^\d]/g, ''))} placeholder="0" className={field} />
        </div>
        <div>
          <label htmlFor="paid" className={label}>Paid / advance (৳)</label>
          <input id="paid" name="paid" inputMode="numeric" value={paid} onChange={(e) => setPaid(e.target.value.replace(/[^\d]/g, ''))} placeholder="0" className={field} />
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2 rounded-xl bg-paper p-3 text-center text-xs">
        <div><dt className="text-muted-foreground">Total</dt><dd className="text-base font-extrabold text-ink">{taka(t.total)}</dd></div>
        <div><dt className="text-muted-foreground">Paid</dt><dd className="text-base font-extrabold text-emerald-700">{taka(t.paid)}</dd></div>
        <div><dt className="text-muted-foreground">Due</dt><dd className="text-base font-extrabold text-cta-600">{taka(t.due)}</dd></div>
      </dl>

      <div>
        <label htmlFor="notes" className={label}>Notes & terms</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={doc.notes} placeholder="e.g. Remaining amount payable 7 days before travel. Visa fee is non-refundable." className={field} />
      </div>

      {state.message && <p className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm', state.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive')}>{state.ok && <CheckCircle2 className="size-4" />}{state.message}</p>}

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <button type="submit" disabled={pending} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-brand disabled:opacity-70 sm:flex-none">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save details
        </button>
        <a href={`/admin/inquiries/${id}/pdf`} target="_blank" rel="noreferrer" className={cn('inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold ring-1 ring-border hover:bg-muted sm:flex-none', saved && 'ring-brand')}>
          <Eye className="size-4" /> Preview
        </a>
        <a href={`/admin/inquiries/${id}/pdf?print=1`} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cta px-5 py-3 text-sm font-bold text-white hover:bg-cta-600 sm:flex-none">
          <Download className="size-4" /> Download PDF
        </a>
      </div>
      <p className="text-[11px] text-muted-foreground">Save first — the PDF uses the saved details.</p>
    </form>
  );
}
