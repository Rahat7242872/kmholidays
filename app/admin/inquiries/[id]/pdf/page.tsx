import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { OrderPdf } from '@/components/admin/order-pdf';
import { PrintToolbar } from '@/components/admin/print-toolbar';
import { getAdminSession } from '@/lib/auth';
import { getInquiryById, getListingById, getUserById } from '@/lib/data';
import { orderNo } from '@/lib/order-document';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: { absolute: 'Order PDF · KM Holidays' }, robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ print?: string }> };

/** Printable A4 order document (booking confirmation / invoice / receipt / visa summary). Admin only. */
export default async function OrderPdfPage({ params, searchParams }: Props) {
  if (!(await getAdminSession())) redirect('/admin/login');
  const id = Number((await params).id);
  const inquiry = id ? await getInquiryById(id) : null;
  if (!inquiry) notFound();
  const [listing, customer] = await Promise.all([
    inquiry.listingId ? getListingById(inquiry.listingId) : null,
    inquiry.userId ? getUserById(inquiry.userId) : null,
  ]);
  const fileName = `${orderNo(inquiry.id)}-${inquiry.name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')}`;

  return (
    <div className="min-h-svh bg-slate-200/70 pb-10 print:bg-white print:pb-0">
      {/* A4, no browser margins, keep brand colours when printing */}
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .order-sheet { width: 210mm; min-height: 297mm; }
        }
        .order-sheet { min-height: 297mm; }
      `}</style>
      <PrintToolbar backHref={`/admin/inquiries/${inquiry.id}`} fileName={fileName} auto={(await searchParams).print === '1'} />
      <div className="overflow-x-auto px-2 print:overflow-visible print:px-0">
        <OrderPdf inquiry={inquiry} listing={listing} customer={customer} />
      </div>
    </div>
  );
}
