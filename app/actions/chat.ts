'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getSessionUser, requireAdmin } from '@/lib/auth';
import {
  addMessage,
  createConversation,
  getConversationById,
  getConversationByToken,
  getMessages,
  markConversationRead,
  setConversationStatus,
} from '@/lib/data';
import type { ChatMessage } from '@/lib/types';

const clean = (s: unknown, max: number) => String(s ?? '').trim().slice(0, max);

export type ChatResult = { ok: true; token: string; messages: ChatMessage[]; status: 'open' | 'closed' } | { ok: false; error: string };

/** Visitor starts a new conversation (name + phone + first message). */
export async function startChat(input: { name: string; phone: string; message: string }): Promise<ChatResult> {
  const name = clean(input.name, 80);
  const phone = clean(input.phone, 40);
  const message = clean(input.message, 1000);
  if (name.length < 2) return { ok: false, error: 'Please enter your name.' };
  if (!/^[+\d][\d\s-]{6,}$/.test(phone)) return { ok: false, error: 'Please enter a valid phone number.' };
  if (!message) return { ok: false, error: 'Please type a message.' };

  const user = await getSessionUser();
  const token = randomBytes(24).toString('base64url');
  const conv = await createConversation({ token, userId: user?.id ?? null, name, phone });
  await addMessage(conv.id, 'customer', message);
  return { ok: true, token, messages: await getMessages(conv.id), status: 'open' };
}

/** Visitor fetches new messages (polling). Marks admin replies as read. */
export async function pollChat(token: string, afterId: number): Promise<ChatResult> {
  const conv = await getConversationByToken(clean(token, 100));
  if (!conv) return { ok: false, error: 'not_found' };
  const messages = await getMessages(conv.id, Math.max(0, Number(afterId) || 0));
  if (conv.unreadForCustomer > 0) await markConversationRead(conv.id, 'customer');
  return { ok: true, token: conv.token, messages, status: conv.status };
}

/** Number of unread admin replies — for the badge on the closed chat button. */
export async function chatUnread(token: string): Promise<number> {
  const conv = await getConversationByToken(clean(token, 100));
  return conv?.unreadForCustomer ?? 0;
}

export async function sendChat(token: string, body: string): Promise<ChatResult> {
  const conv = await getConversationByToken(clean(token, 100));
  if (!conv) return { ok: false, error: 'not_found' };
  const text = clean(body, 1000);
  if (!text) return { ok: false, error: 'Empty message' };
  await addMessage(conv.id, 'customer', text);
  return { ok: true, token: conv.token, messages: [], status: 'open' };
}

/* ---------------- Admin ---------------- */

export async function adminFetchMessages(conversationId: number, afterId: number): Promise<ChatMessage[]> {
  await requireAdmin();
  const messages = await getMessages(conversationId, afterId);
  const conv = await getConversationById(conversationId);
  if (conv && conv.unreadForAdmin > 0) await markConversationRead(conversationId, 'admin');
  return messages;
}

export async function adminReply(conversationId: number, body: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const text = clean(body, 2000);
  if (!text || !(await getConversationById(conversationId))) return { ok: false };
  await addMessage(conversationId, 'admin', text);
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function adminSetChatStatus(form: FormData) {
  await requireAdmin();
  const id = Number(form.get('id'));
  const status = form.get('status') === 'closed' ? 'closed' : 'open';
  if (id) await setConversationStatus(id, status);
  revalidatePath('/admin', 'layout');
}
