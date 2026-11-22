/**
 * Admin-entered data for an order's printable PDF (booking confirmation, invoice, receipt…).
 * Stored as JSON in `inquiries.document`.
 */

export const DOC_TYPES = {
  booking: 'Booking confirmation',
  invoice: 'Invoice',
  receipt: 'Money receipt',
  quotation: 'Quotation',
  visa: 'Visa application summary',
} as const;
export type DocType = keyof typeof DOC_TYPES;

export type LineItem = { label: string; amount: number };
export type InfoRow = { label: string; value: string };

export type OrderDocument = {
  type?: DocType;
  /** Extra info shown on the PDF — passport no, hotel, flight, visa type… ("Label: value"). */
  info?: InfoRow[];
  items?: LineItem[];
  discount?: number;
  paid?: number;
  notes?: string;
  issueDate?: string;
  updatedAt?: string;
};

export const orderNo = (id: number) => `KMH-${String(id).padStart(5, '0')}`;

const toAmount = (v: string) => {
  const n = Number(v.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? Math.round(n) : 0;
};

const lines = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);
const splitColon = (line: string) => {
  const i = line.lastIndexOf(':');
  return i > 0 ? [line.slice(0, i).trim(), line.slice(i + 1).trim()] : [line, ''];
};

export function parseItems(text: string): LineItem[] {
  return lines(text).slice(0, 40).map((l) => {
    const [label, amount] = splitColon(l);
    return { label, amount: toAmount(amount) };
  });
}

export function parseInfo(text: string): InfoRow[] {
  return lines(text).slice(0, 30).map((l) => {
    const i = l.indexOf(':');
    return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : { label: l, value: '' };
  });
}

export const itemsToText = (items: LineItem[] = []) => items.map((i) => `${i.label}: ${i.amount}`).join('\n');
export const infoToText = (info: InfoRow[] = []) => info.map((i) => (i.value ? `${i.label}: ${i.value}` : i.label)).join('\n');

export function totals(doc: OrderDocument) {
  const subtotal = (doc.items ?? []).reduce((s, i) => s + i.amount, 0);
  const discount = doc.discount ?? 0;
  const total = Math.max(0, subtotal - discount);
  const paid = doc.paid ?? 0;
  return { subtotal, discount, total, paid, due: Math.max(0, total - paid) };
}

export const taka = (n: number) => `৳ ${n.toLocaleString('en-IN')}`;

export function normalizeDocument(value: unknown): OrderDocument {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as OrderDocument) : {};
}
