'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import {
  createListing,
  deleteInquiry,
  deleteListing,
  seedSampleListings,
  setUserRole,
  updateInquiryDocument,
  updateInquiryStatus,
  updateListing,
} from '@/lib/data';
import { detailsFromForm } from '@/lib/listing-details';
import { DOC_TYPES, parseInfo, parseItems, type DocType, type OrderDocument } from '@/lib/order-document';
import { isCategory } from '@/lib/site';
import { INQUIRY_STATUSES, type InquiryStatus, type ListingInput } from '@/lib/types';

export type ListingFormState = { ok: boolean; message: string; errors?: Partial<Record<keyof ListingInput, string>> };

const str = (form: FormData, key: string, max = 300) => String(form.get(key) ?? '').trim().slice(0, max);

function refresh() {
  revalidatePath('/', 'layout');
}

export async function saveListing(_prev: ListingFormState, form: FormData): Promise<ListingFormState> {
  await requireAdmin();

  const id = Number(form.get('id')) || null;
  const category = str(form, 'category', 20);
  const priceRaw = str(form, 'price', 20).replace(/[,\s৳]/g, '');
  const ratingRaw = str(form, 'rating', 5);

  const input: ListingInput = {
    category: isCategory(category) ? category : 'tour',
    title: str(form, 'title', 160),
    slug: str(form, 'slug', 100),
    location: str(form, 'location', 160),
    price: priceRaw ? Math.round(Number(priceRaw)) : null,
    priceNote: str(form, 'priceNote', 60),
    duration: str(form, 'duration', 80),
    image: str(form, 'image', 1000),
    summary: str(form, 'summary', 300),
    description: str(form, 'description', 8000),
    highlights: str(form, 'highlights', 4000).split('\n').map((h) => h.trim()).filter(Boolean).slice(0, 30),
    details: detailsFromForm(form),
    badge: str(form, 'badge', 40),
    rating: ratingRaw ? Number(ratingRaw) : null,
    featured: form.get('featured') === 'on',
    active: form.get('active') === 'on',
  };

  const errors: ListingFormState['errors'] = {};
  if (!isCategory(category)) errors.category = 'Choose a category.';
  if (input.title.length < 3) errors.title = 'Title must be at least 3 characters.';
  if (input.price !== null && (!Number.isFinite(input.price) || input.price < 0)) errors.price = 'Enter a valid price (numbers only).';
  if (input.rating !== null && (!Number.isFinite(input.rating) || input.rating < 0 || input.rating > 5)) errors.rating = 'Rating must be between 0 and 5.';
  if (input.image && !/^https?:\/\//i.test(input.image)) errors.image = 'Image must be a full URL starting with https://';
  if (Object.keys(errors).length) return { ok: false, message: 'Please fix the highlighted fields.', errors };

  try {
    if (id) await updateListing(id, input);
    else await createListing(input);
  } catch (error) {
    console.error('Failed to save listing', error);
    return { ok: false, message: 'Could not save. Check the database connection and try again.' };
  }

  refresh();
  redirect(`/admin/listings?category=${input.category}&saved=1`);
}

export async function deleteListingAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get('id'));
  if (id) await deleteListing(id);
  refresh();
}

export async function toggleListingFlag(form: FormData) {
  await requireAdmin();
  const id = Number(form.get('id'));
  const flag = form.get('flag');
  const value = form.get('value') === 'true';
  if (id && (flag === 'active' || flag === 'featured')) await updateListing(id, { [flag]: value });
  refresh();
}

export async function seedSampleDataAction() {
  await requireAdmin();
  await seedSampleListings();
  refresh();
}

export async function setInquiryStatus(form: FormData) {
  await requireAdmin();
  const id = Number(form.get('id'));
  const status = String(form.get('status'));
  if (id && (INQUIRY_STATUSES as readonly string[]).includes(status)) await updateInquiryStatus(id, status as InquiryStatus);
  revalidatePath('/admin', 'layout');
}

export async function deleteInquiryAction(form: FormData) {
  await requireAdmin();
  const id = Number(form.get('id'));
  if (id) await deleteInquiry(id);
  revalidatePath('/admin', 'layout');
}

/** Promote a website user to admin, or make an admin a normal user again. */
export async function setUserRoleAction(form: FormData) {
  const session = await requireAdmin();
  const id = Number(form.get('id'));
  const role = form.get('role') === 'admin' ? 'admin' : 'customer';
  const me = (session.user as { id?: number } | undefined)?.id;
  // Don't let an admin lock themselves out by removing their own access.
  if (!id || (me === id && role !== 'admin')) return;
  await setUserRole(id, role);
  revalidatePath('/admin', 'layout');
}

export type DocumentFormState = { ok: boolean; message: string };

/** Save the admin-entered data used for an order's PDF (type, cost lines, payment, notes). */
export async function saveInquiryDocument(_prev: DocumentFormState, form: FormData): Promise<DocumentFormState> {
  await requireAdmin();
  const id = Number(form.get('id'));
  if (!id) return { ok: false, message: 'Missing order id.' };
  const type = str(form, 'type', 20);
  const amount = (key: string) => {
    const n = Number(str(form, key, 20).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
  };
  const doc: OrderDocument = {
    type: type in DOC_TYPES ? (type as DocType) : 'booking',
    info: parseInfo(str(form, 'info', 4000)),
    items: parseItems(str(form, 'items', 4000)),
    discount: amount('discount'),
    paid: amount('paid'),
    notes: str(form, 'notes', 3000),
    issueDate: str(form, 'issueDate', 20) || new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
  };
  try {
    await updateInquiryDocument(id, doc);
  } catch (error) {
    console.error('Failed to save order document', error);
    return { ok: false, message: 'Could not save. Check the database connection and try again.' };
  }
  revalidatePath(`/admin/inquiries/${id}`);
  return { ok: true, message: 'Saved. The PDF now uses these details.' };
}
