import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, ChevronLeft, Clock, Download, ExternalLink, FileText, Mail, MapPin, MessageSquareText, Phone, UserRound, Users } from 'lucide-react';
import { setInquiryStatus } from '@/app/admin/actions';
import { SubmitButton } from '@/components/admin/confirm-button';
import { DocumentForm } from '@/components/admin/document-form';
import { PageHeader, Panel, StatusBadge } from '@/components/admin/ui';
import { SafeImage } from '@/components/site/safe-image';
import { getInquiryById, getListingById, getUserById } from '@/lib/data';
import { orderNo, type LineItem } from '@/lib/order-document';
import { categoryMeta, formatPrice, requestLabel } from '@/lib/site';
import { INQUIRY_STATUSES, type Listing } from '@/lib/types';

const fmt = (iso: string, time = false) =>
  new Date(iso).toLocaleString('en-GB', time ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });

/** Starting cost lines for a new document: visa fee table, or listed price × travellers. */
function suggestItems(listing: Listing | null, travellers: number | null): LineItem[] {
  if (!listing) return [];
  const fees = (listing.details.fees ?? []).filter((f) => !f.value.trim().startsWith('+'));
  const parsed = fees.map((f) => ({ label: f.label, amount: Number(f.value.replace(/[^\d]/g, '')) || 0 })).filter((f) => f.amount > 0);
  if (listing.category === 'visa' && parsed.length) return parsed.map((f) => ({ ...f, amount: f.amount * (travellers || 1) }));
  if (!listing.price) return [];
  const n = travellers || 1;
  return [{ label: n > 1 ? `${listing.title} (${n} × ${formatPrice(listing.price)})` : listing.title, amount: listing.price * n }];
}

function Info({ icon: Icon, label, children }: { icon: typeof Phone; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand"><Icon className="size-4" /></span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
        <div className="text-sm font-semibold break-words text-ink">{children}</div>
      </div>
    </div>
  );
}

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const inquiry = id ? await getInquiryById(id) : null;
  if (!inquiry) notFound();
  const [listing, customer] = await Promise.all([
    inquiry.listingId ? getListingById(inquiry.listingId) : null,
    inquiry.userId ? getUserById(inquiry.userId) : null,
  ]);
  const phoneDigits = inquiry.phone.replace(/[^\d+]/g, '');
  const profile = customer?.profile ?? {};

  return (
    <>
      <Link href="/admin/inquiries" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-brand">
        <ChevronLeft className="size-4" /> All inquiries
      </Link>
      <PageHeader
        title={`${orderNo(inquiry.id)}`}
        text={`${requestLabel(inquiry.category)} · ${inquiry.listingTitle || 'General inquiry'} · received ${fmt(inquiry.createdAt, true)}`}
        action={
          <a href={`/admin/inquiries/${inquiry.id}/pdf?print=1`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start rounded-xl bg-cta px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cta/25 hover:bg-cta-600">
            <Download className="size-4" /> Download PDF
          </a>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-6">
          {/* Customer */}
          <Panel className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-bold">Customer</h2>
              <StatusBadge status={inquiry.status} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info icon={UserRound} label="Name">{inquiry.name}{inquiry.userId ? <span className="ml-1.5 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand">Member</span> : null}</Info>
              <Info icon={Phone} label="Phone"><a href={`tel:${phoneDigits}`} className="hover:underline">{inquiry.phone}</a></Info>
              {inquiry.email && <Info icon={Mail} label="Email"><a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a></Info>}
              {profile.occupation && <Info icon={FileText} label="Occupation">{profile.occupation}</Info>}
              {profile.city && <Info icon={MapPin} label="City">{profile.city}</Info>}
              {profile.travelHistory && <Info icon={Clock} label="Travel history">{profile.travelHistory}</Info>}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
              <a href={`tel:${phoneDigits}`} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white">Call</a>
              <a href={`https://wa.me/${phoneDigits.replace('+', '')}`} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">WhatsApp</a>
              <form action={setInquiryStatus} className="ml-auto flex items-center gap-1.5">
                <input type="hidden" name="id" value={inquiry.id} />
                <select name="status" defaultValue={inquiry.status} aria-label="Status" className="rounded-lg border border-input bg-white px-2 py-1.5 text-xs font-semibold capitalize">
                  {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <SubmitButton className="rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-brand">Update</SubmitButton>
              </form>
            </div>
          </Panel>

          {/* Order */}
          <Panel className="overflow-hidden">
            {listing && (
              <div className="flex gap-4 border-b p-4">
                <SafeImage src={listing.image} alt={listing.title} className="size-20 shrink-0 rounded-xl" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{requestLabel(listing.category)}</p>
                  <p className="font-bold">{listing.title}</p>
                  <p className="text-xs text-muted-foreground">{[listing.location, listing.duration].filter(Boolean).join(' · ')}</p>
                  <p className="mt-1 text-sm font-extrabold">{formatPrice(listing.price)} <span className="text-xs font-normal text-muted-foreground">{listing.priceNote}</span></p>
                </div>
                <a href={`/${categoryMeta[listing.category].path}/${listing.slug}`} target="_blank" rel="noreferrer" aria-label="View on site" className="ml-auto grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-brand">
                  <ExternalLink className="size-4" />
                </a>
              </div>
            )}
            <div className="space-y-4 p-5">
              <h2 className="font-bold">Request details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Info icon={FileText} label="Service">{requestLabel(inquiry.category)} — {inquiry.listingTitle || 'General inquiry'}</Info>
                {inquiry.travelDate && <Info icon={CalendarDays} label="Travel date">{fmt(inquiry.travelDate)}</Info>}
                {inquiry.travelers && <Info icon={Users} label="Travellers">{inquiry.travelers}</Info>}
              </div>
              {inquiry.message && (
                <div className="rounded-xl bg-paper p-4">
                  <p className="mb-1.5 flex items-center gap-2 text-xs font-bold text-muted-foreground"><MessageSquareText className="size-4 text-brand" /> Customer message</p>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-ink/85">{inquiry.message}</p>
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* PDF data */}
        <Panel className="p-5 sm:p-6 lg:self-start">
          <h2 className="font-bold">PDF document</h2>
          <p className="mb-5 text-xs text-muted-foreground">Fill in the details for the customer’s PDF (with KM Holidays logo). Save, then download.</p>
          <DocumentForm
            id={inquiry.id}
            doc={inquiry.document}
            suggestedItems={suggestItems(listing, inquiry.travelers)}
            defaultType={inquiry.category === 'visa' ? 'visa' : 'booking'}
          />
        </Panel>
      </div>
    </>
  );
}
