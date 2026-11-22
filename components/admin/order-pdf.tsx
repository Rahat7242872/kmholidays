import { KmLogo } from '@/components/site/brand';
import { DOC_TYPES, orderNo, taka, totals } from '@/lib/order-document';
import { contacts, formatPrice, requestLabel, site } from '@/lib/site';
import type { Customer, Inquiry, Listing } from '@/lib/types';

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex gap-3 py-1 text-[12.5px]">
      <dt className="w-28 shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 font-semibold break-words text-ink">{value}</dd>
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid rounded-xl border border-slate-200 p-4">
      <h3 className="mb-2 text-[10px] font-extrabold tracking-[0.14em] text-brand uppercase">{title}</h3>
      {children}
    </section>
  );
}

/** A4 branded order document. Rendered on screen and printed / saved as PDF. */
export function OrderPdf({ inquiry, listing, customer }: { inquiry: Inquiry; listing: Listing | null; customer: Customer | null }) {
  const doc = inquiry.document;
  const type = doc.type ?? (inquiry.category === 'visa' ? 'visa' : 'booking');
  const title = DOC_TYPES[type];
  const t = totals(doc);
  const items = doc.items ?? [];
  const showMoney = items.length > 0 || type === 'invoice' || type === 'receipt' || type === 'quotation';
  const docGroups = type === 'visa' ? listing?.details.documentGroups ?? (listing?.highlights.length ? [{ title: 'Documents required', items: listing.highlights }] : []) : [];
  const itinerary = type !== 'visa' ? listing?.details.itinerary ?? [] : [];
  const profile = customer?.profile ?? {};

  return (
    <article className="order-sheet relative mx-auto flex w-[210mm] max-w-full flex-col bg-white text-ink shadow-xl print:shadow-none">
      <div className="bg-swoosh h-2" />

      {/* Header */}
      <header className="flex items-start justify-between gap-6 px-[14mm] pt-8 pb-5">
        <div>
          <KmLogo className="h-[22mm] w-auto" />
          <p className="mt-2 text-[10px] font-bold tracking-wide text-cta uppercase">{site.tagline}</p>
        </div>
        <div className="text-right">
          <p className="text-[22px] leading-tight font-extrabold tracking-tight text-brand uppercase">{title}</p>
          <dl className="mt-2 space-y-0.5 text-[12px]">
            <div><dt className="inline text-slate-500">No: </dt><dd className="inline font-bold">{orderNo(inquiry.id)}</dd></div>
            <div><dt className="inline text-slate-500">Date: </dt><dd className="inline font-bold">{fmtDate(doc.issueDate || new Date().toISOString())}</dd></div>
            <div><dt className="inline text-slate-500">Request received: </dt><dd className="inline font-semibold">{fmtDate(inquiry.createdAt)}</dd></div>
            <div><dt className="inline text-slate-500">Status: </dt><dd className="inline font-semibold capitalize">{inquiry.status}</dd></div>
          </dl>
        </div>
      </header>

      <div className="mx-[14mm] grid grid-cols-3 gap-3 rounded-xl bg-paper px-4 py-2.5 text-[11px] text-slate-600">
        <p className="col-span-3 sm:col-span-1"><span className="font-bold text-ink">Office: </span>{site.address}</p>
        <p className="col-span-3 sm:col-span-1"><span className="font-bold text-ink">Phone: </span>{contacts.map((c) => c.display).join(', ')}</p>
        <p className="col-span-3 sm:col-span-1"><span className="font-bold text-ink">Web: </span>facebook.com/kmholidaysltd{site.email ? ` · ${site.email}` : ''}</p>
      </div>

      <div className="flex-1 space-y-4 px-[14mm] py-5">
        <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
          <Box title="Customer">
            <dl>
              <Row label="Name" value={inquiry.name} />
              <Row label="Phone" value={inquiry.phone} />
              <Row label="Email" value={inquiry.email} />
              <Row label="Occupation" value={profile.occupation} />
              <Row label="City" value={profile.city} />
              <Row label="Account" value={inquiry.userId ? 'Registered member' : undefined} />
            </dl>
          </Box>
          <Box title="Service">
            <dl>
              <Row label="Type" value={requestLabel(inquiry.category)} />
              <Row label="Package / item" value={inquiry.listingTitle || 'General inquiry'} />
              <Row label="Destination" value={listing?.location} />
              <Row label="Duration" value={listing?.duration} />
              <Row label="Travel date" value={inquiry.travelDate ? fmtDate(inquiry.travelDate) : undefined} />
              <Row label="Travellers" value={inquiry.travelers ?? undefined} />
              {!showMoney && listing?.price ? <Row label="Listed price" value={`${formatPrice(listing.price)} ${listing.priceNote}`} /> : null}
            </dl>
          </Box>
        </div>

        {doc.info?.length ? (
          <Box title="Details">
            <dl className="grid gap-x-6 sm:grid-cols-2 print:grid-cols-2">
              {doc.info.map((r, i) => <Row key={i} label={r.label} value={r.value || '—'} />)}
            </dl>
          </Box>
        ) : null}

        {showMoney && (
          <section className="break-inside-avoid overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-[12.5px]">
              <thead className="bg-ink text-left text-[10px] tracking-[0.12em] text-white uppercase">
                <tr><th className="w-10 px-4 py-2.5">#</th><th className="px-2 py-2.5">Description</th><th className="px-4 py-2.5 text-right">Amount</th></tr>
              </thead>
              <tbody>
                {items.length ? items.map((it, i) => (
                  <tr key={i} className="border-t border-slate-200 even:bg-paper/60">
                    <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                    <td className="px-2 py-2.5 font-medium">{it.label}</td>
                    <td className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">{taka(it.amount)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-4 py-4 text-center text-slate-500">No cost lines added yet.</td></tr>
                )}
              </tbody>
            </table>
            <dl className="ml-auto w-full max-w-[85mm] space-y-1 border-t border-slate-200 px-4 py-3 text-[12.5px]">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{taka(t.subtotal)}</dd></div>
              {t.discount > 0 && <div className="flex justify-between"><dt className="text-slate-500">Discount</dt><dd className="font-semibold text-emerald-700">− {taka(t.discount)}</dd></div>}
              <div className="flex justify-between border-t border-dashed border-slate-300 pt-1.5 text-[14px]"><dt className="font-bold">Total</dt><dd className="font-extrabold">{taka(t.total)}</dd></div>
              {t.paid > 0 && <div className="flex justify-between"><dt className="text-slate-500">Paid</dt><dd className="font-semibold">{taka(t.paid)}</dd></div>}
              {(t.paid > 0 || type === 'invoice') && (
                <div className="mt-1 flex justify-between rounded-lg bg-cta/10 px-2.5 py-1.5 text-[13px]"><dt className="font-bold text-cta-600">Due</dt><dd className="font-extrabold text-cta-600">{taka(t.due)}</dd></div>
              )}
            </dl>
          </section>
        )}

        {docGroups.length > 0 && (
          <Box title="Document checklist">
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 print:grid-cols-2">
              {docGroups.map((g, i) => (
                <div key={i} className="break-inside-avoid">
                  <p className="mb-1 text-[12px] font-bold">{g.title}</p>
                  <ul className="space-y-0.5 text-[12px] text-slate-700">
                    {g.items.map((item, k) => <li key={k} className="flex gap-2"><span className="mt-[3px] inline-block size-3 shrink-0 rounded-[3px] border border-slate-400" /> {item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Box>
        )}

        {itinerary.length > 0 && (
          <Box title="Itinerary">
            <ol className="space-y-1 text-[12px]">
              {itinerary.map((d, i) => <li key={i} className="flex gap-2"><span className="font-bold text-brand">{i + 1}.</span> {d.title}</li>)}
            </ol>
          </Box>
        )}

        {inquiry.message && (
          <Box title="Customer request">
            <p className="text-[12px] leading-relaxed whitespace-pre-line text-slate-700">{inquiry.message}</p>
          </Box>
        )}

        {doc.notes && (
          <Box title="Notes & terms">
            <p className="text-[12px] leading-relaxed whitespace-pre-line text-slate-700">{doc.notes}</p>
          </Box>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto px-[14mm] pb-6">
        <div className="flex items-end justify-between gap-6 pt-6">
          <p className="max-w-[95mm] text-[10.5px] leading-relaxed text-slate-500">
            Thank you for choosing KM Holidays. For any change, call {contacts[0].display} or message us on Facebook. This document is computer generated.
          </p>
          <div className="w-[55mm] text-center">
            <div className="border-t border-slate-400 pt-1 text-[11px] font-semibold text-slate-600">Authorised signature</div>
          </div>
        </div>
      </footer>
      <div className="bg-swoosh h-1.5" />
    </article>
  );
}
