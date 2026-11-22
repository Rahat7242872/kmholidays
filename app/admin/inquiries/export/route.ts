import { NextResponse, type NextRequest } from 'next/server';
import { csvCell } from '@/lib/admin-stats';
import { getAdminSession } from '@/lib/auth';
import { getInquiries } from '@/lib/data';
import { requestLabel } from '@/lib/site';

/** Download inquiries as CSV (Excel-friendly, UTF-8 with BOM). Admin only. */
export async function GET(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const type = params.get('type');
  const status = params.get('status');

  const rows = (await getInquiries()).filter((i) => {
    if (type && i.category !== type) return false;
    if (status && i.status !== status) return false;
    if (q && !`${i.name} ${i.phone} ${i.email} ${i.listingTitle} ${i.message}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const header = ['ID', 'Date', 'Status', 'Type', 'Item', 'Name', 'Phone', 'Email', 'Travel date', 'Travellers', 'Message', 'Member'];
  const lines = rows.map((i) =>
    [i.id, new Date(i.createdAt).toISOString(), i.status, requestLabel(i.category), i.listingTitle, i.name, i.phone, i.email, i.travelDate, i.travelers ?? '', i.message, i.userId ? 'yes' : 'no']
      .map(csvCell)
      .join(','),
  );
  const csv = '﻿' + [header.join(','), ...lines].join('\r\n');
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="km-holidays-inquiries-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
