import { requestLabel } from '@/lib/site';
import type { Customer, Inquiry, Listing } from '@/lib/types';

const DAY = 86_400_000;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Count of items created in [from, to). */
function countBetween<T extends { createdAt: string }>(items: T[], from: number, to: number) {
  return items.filter((i) => {
    const t = new Date(i.createdAt).getTime();
    return t >= from && t < to;
  }).length;
}

export type Trend = { value: number; previous: number; change: number | null };

function trend<T extends { createdAt: string }>(items: T[], days = 7): Trend {
  const now = Date.now();
  const value = countBetween(items, now - days * DAY, now + 1);
  const previous = countBetween(items, now - 2 * days * DAY, now - days * DAY);
  return { value, previous, change: previous ? Math.round(((value - previous) / previous) * 100) : value ? 100 : null };
}

export function buildDashboardStats(inquiries: Inquiry[], listings: Listing[], customers: Customer[]) {
  // Daily requests for the last 30 days.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today.getTime() - (29 - i) * DAY);
    return { date: dayKey(d), label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), count: 0 };
  });
  const index = new Map(daily.map((d, i) => [d.date, i]));
  for (const q of inquiries) {
    const i = index.get(dayKey(new Date(q.createdAt)));
    if (i !== undefined) daily[i].count += 1;
  }

  // Requests by type.
  const byTypeMap = new Map<string, number>();
  for (const q of inquiries) {
    const label = requestLabel(q.category);
    byTypeMap.set(label, (byTypeMap.get(label) ?? 0) + 1);
  }
  const byType = [...byTypeMap.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);

  // Pipeline.
  const pipeline = (['new', 'contacted', 'confirmed', 'closed'] as const).map((status) => ({
    status,
    count: inquiries.filter((q) => q.status === status).length,
  }));
  const decided = inquiries.filter((q) => q.status === 'confirmed' || q.status === 'closed').length;
  const conversion = decided ? Math.round((inquiries.filter((q) => q.status === 'confirmed').length / decided) * 100) : null;

  // Most requested listings.
  const perListing = new Map<number, number>();
  for (const q of inquiries) if (q.listingId) perListing.set(q.listingId, (perListing.get(q.listingId) ?? 0) + 1);
  const topListings = [...perListing.entries()]
    .map(([id, count]) => ({ listing: listings.find((l) => l.id === id), count }))
    .filter((x): x is { listing: Listing; count: number } => !!x.listing)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    daily,
    byType,
    pipeline,
    conversion,
    topListings,
    trends: {
      inquiries: trend(inquiries),
      customers: trend(customers),
    },
  };
}

/** CSV-escape one value. */
export function csvCell(value: unknown) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
