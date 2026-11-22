'use server';

import { getSessionUser } from '@/lib/auth';
import { createInquiry, getListingById } from '@/lib/data';
import { answersFromForm } from '@/lib/booking-fields';
import { isCategory, isRequestType } from '@/lib/site';

export type InquiryState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<"name" | "phone" | "email", string>>;
  // Echoed back on error so the form can keep what the visitor typed (React resets forms after actions).
  values?: Record<string, string>;
};

const text = (form: FormData, key: string, max = 500) => String(form.get(key) ?? '').trim().slice(0, max);

export async function submitInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  // Honeypot: real visitors never see or fill this field.
  if (text(form, 'website')) return { ok: true, message: 'Thanks! We’ll be in touch shortly.' };

  const name = text(form, 'name', 120);
  const phone = text(form, 'phone', 40);
  const email = text(form, 'email', 160);
  const errors: InquiryState['errors'] = {};
  if (name.length < 2) errors.name = 'Please tell us your name.';
  if (!/^[+\d][\d\s-]{6,}$/.test(phone)) errors.phone = 'Please enter a valid phone number.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'That email doesn’t look right.';
  if (Object.keys(errors).length) {
    const values = Object.fromEntries(
      [...form.keys()].filter((k) => ["name", "phone", "email", "travelDate", "travelers", "message"].includes(k) || k.startsWith("ans.")).map((k) => [k, text(form, k, 2000)]),
    );
    return { ok: false, message: "Please check the highlighted fields.", errors, values };
  }

  const listingId = Number(form.get('listingId')) || null;
  const listing = listingId ? await getListingById(listingId) : null;
  const category = text(form, 'category', 20);
  const kind = listing?.category ?? (isCategory(category) || isRequestType(category) ? category : '');
  const travelers = Number(form.get('travelers')) || null;
  const user = await getSessionUser();

  try {
    await createInquiry({
      listingId: listing?.id ?? null,
      userId: user?.id ?? null,
      listingTitle: listing?.title ?? text(form, 'listingTitle', 200),
      category: kind,
      name,
      phone,
      email,
      travelDate: text(form, 'travelDate', 40),
      travelers: travelers && travelers > 0 && travelers < 1000 ? travelers : null,
      message: [text(form, 'message', 2000), text(form, 'attachment', 3000)].filter(Boolean).join('\n\n'),
      answers: answersFromForm(kind, form),
    });
  } catch (error) {
    console.error('Failed to save inquiry', error);
    return { ok: false, message: 'Something went wrong on our side. Please message us on Messenger instead.' };
  }

  return { ok: true, message: `Thanks ${name.split(' ')[0]}! A trip planner will call you shortly.` };
}
