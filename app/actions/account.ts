'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';
import { createUser, findUserByEmail, updateUserProfile } from '@/lib/data';
import { hashPassword } from '@/lib/password';
import { OCCUPATIONS } from '@/lib/types';

export type FormState = { ok: boolean; message: string; errors?: Record<string, string>; values?: Record<string, string> };

const text = (form: FormData, key: string, max = 200) => String(form.get(key) ?? '').trim().slice(0, max);
const PHONE_RE = /^[+\d][\d\s-]{6,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerCustomer(_prev: FormState, form: FormData): Promise<FormState> {
  const name = text(form, 'name', 120);
  const email = text(form, 'email', 160).toLowerCase();
  const phone = text(form, 'phone', 40);
  const password = String(form.get('password') ?? '');
  const values = { name, email, phone };

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'Please enter your full name.';
  if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email.';
  if (!PHONE_RE.test(phone)) errors.phone = 'Please enter a valid phone number.';
  if (password.length < 8) errors.password = 'Use at least 8 characters.';
  if (Object.keys(errors).length) return { ok: false, message: 'Please fix the highlighted fields.', errors, values };

  if (await findUserByEmail(email)) {
    return { ok: false, message: 'An account with this email already exists. Please log in instead.', errors: { email: 'Already registered.' }, values };
  }

  try {
    await createUser({ name, email, phone, passwordHash: await hashPassword(password) });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_TAKEN') {
      return { ok: false, message: 'An account with this email already exists.', errors: { email: 'Already registered.' }, values };
    }
    console.error('Registration failed', error);
    return { ok: false, message: 'Could not create your account right now. Please try again.', values };
  }
  return { ok: true, message: 'Account created.' };
}

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user?.id) return { ok: false, message: 'Please log in again.' };

  const name = text(form, 'name', 120);
  const phone = text(form, 'phone', 40);
  const occupation = text(form, 'occupation', 40);
  const city = text(form, 'city', 80);
  const travelHistory = text(form, 'travelHistory', 1000);
  const values = { name, phone, occupation, city, travelHistory };

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'Please enter your full name.';
  if (!PHONE_RE.test(phone)) errors.phone = 'Please enter a valid phone number.';
  if (Object.keys(errors).length) return { ok: false, message: 'Please fix the highlighted fields.', errors, values };

  await updateUserProfile(user.id, {
    name,
    phone,
    profile: {
      occupation: (OCCUPATIONS as readonly string[]).includes(occupation) ? occupation : '',
      city,
      travelHistory,
    },
  });
  revalidatePath('/account');
  return { ok: true, message: 'Profile saved.', values };
}
