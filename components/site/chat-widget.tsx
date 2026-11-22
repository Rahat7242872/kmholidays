'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, MessageCircle, Phone, Send, X } from 'lucide-react';
import { chatUnread, pollChat, sendChat, startChat } from '@/app/actions/chat';
import { useT } from '@/components/i18n-provider';
import { KmLogo } from '@/components/site/brand';
import { categoryFromPath, contacts, site } from '@/lib/site';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

const TOKEN_KEY = 'km-chat-token';

function time(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** Floating live-chat: visitors message the KM team; admins reply from /admin/chats. */
export function ChatWidget() {
  const segments = usePathname().split('/').filter(Boolean);
  const onDetailPage = segments.length === 2 && !!categoryFromPath(segments[0]);
  const me = useSession().data?.user;
  const c = useT().chat;

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const lastId = messages.length ? messages[messages.length - 1].id : 0;

  useEffect(() => setToken(localStorage.getItem(TOKEN_KEY)), []);

  const refresh = useCallback(async () => {
    if (!token) return;
    const res = await pollChat(token, lastId);
    if (!res.ok) {
      if (res.error === 'not_found') {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setMessages([]);
      }
      return;
    }
    if (res.messages.length) setMessages((prev) => [...prev, ...res.messages.filter((m) => !prev.some((p) => p.id === m.id))]);
  }, [token, lastId]);

  // Poll while open; check the unread count slowly while closed.
  useEffect(() => {
    if (!token) return;
    if (open) {
      setUnread(0);
      refresh();
      const t = setInterval(refresh, 4000);
      return () => clearInterval(t);
    }
    const check = () => chatUnread(token).then(setUnread).catch(() => undefined);
    check();
    const t = setInterval(check, 20000);
    return () => clearInterval(t);
  }, [open, token, refresh]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, open]);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open && window.innerWidth < 640);
  }, [open]);

  async function onStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setError('');
    const res = await startChat({ name: String(form.get('name')), phone: String(form.get('phone')), message: String(form.get('message')) });
    setSending(false);
    if (!res.ok) return setError(res.error);
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setMessages(res.messages);
  }

  async function onSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !draft.trim()) return;
    setSending(true);
    const text = draft;
    setDraft('');
    const res = await sendChat(token, text);
    setSending(false);
    if (!res.ok) {
      setDraft(text);
      return setError(c.notSent);
    }
    await refresh();
  }

  const field = 'w-full rounded-xl border border-input bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/10';

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={c.open}
          className={cn(
            'group fixed right-4 z-40 flex items-center gap-2 rounded-full bg-brand p-3.5 text-white shadow-xl shadow-brand/30 transition hover:-translate-y-1 hover:bg-brand-700 lg:right-6 lg:bottom-6 lg:py-3 lg:pr-5 lg:pl-3.5',
            onDetailPage ? 'bottom-[calc(144px+env(safe-area-inset-bottom))]' : 'bottom-[calc(76px+env(safe-area-inset-bottom))]',
          )}
        >
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand/40 [animation-duration:2.5s]" />
          <MessageCircle className="size-6" />
          <span className="hidden text-sm font-bold lg:inline">{c.live}</span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-cta text-[11px] font-bold ring-2 ring-white">{unread}</span>
          )}
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={c.support}
          className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-white animate-fade-up sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[600px] sm:max-h-[calc(100svh-48px)] sm:w-[380px] sm:rounded-3xl sm:shadow-[0_30px_80px_-20px_rgba(27,29,85,.5)] sm:ring-1 sm:ring-border"
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-ink px-4 pt-4 pb-5 text-white">
            <div className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-grape/50 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-white p-1.5"><KmLogo withText={false} className="h-auto w-full" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold">{c.support}</p>
                <p className="flex items-center gap-1.5 text-xs text-white/70">
                  <span className="size-2 rounded-full bg-emerald-400" /> {c.replySoon}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={c.close} className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <X className="size-5" />
              </button>
            </div>
          </div>
          <div className="bg-swoosh h-1" />

          {/* Body */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-paper p-4">
            <div className="flex gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">KM</span>
              <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm">
                {c.greeting}
              </div>
            </div>

            {messages.map((m) =>
              m.sender === 'customer' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-brand px-3.5 py-2.5 text-sm text-white shadow-sm">
                    <p className="whitespace-pre-line">{m.body}</p>
                    <p className="mt-1 text-right text-[10px] text-white/60">{time(m.createdAt)}</p>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">KM</span>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm">
                    <p className="whitespace-pre-line">{m.body}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{time(m.createdAt)}</p>
                  </div>
                </div>
              ),
            )}

            {!token && (
              <form onSubmit={onStart} key={me?.email ?? 'guest'} className="space-y-2.5 rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-ink">{c.start}</p>
                <input name="name" required defaultValue={me?.name ?? undefined} placeholder={c.name} autoComplete="name" className={field} />
                <input name="phone" required type="tel" inputMode="tel" placeholder={c.phone} autoComplete="tel" className={field} />
                <textarea name="message" required rows={3} placeholder={c.question} className={cn(field, 'resize-none')} />
                {error && <p className="text-xs text-destructive">{error}</p>}
                <button type="submit" disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cta py-3 text-sm font-bold text-white disabled:opacity-70">
                  {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} {c.startBtn}
                </button>
              </form>
            )}

            {!token && (
              <div className="grid grid-cols-2 gap-2">
                <a href={site.messenger} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-bold text-brand shadow-sm">
                  <MessageCircle className="size-4" /> Messenger
                </a>
                <a href={`tel:${contacts[0].tel}`} className="flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-bold text-brand shadow-sm">
                  <Phone className="size-4" /> {c.call}
                </a>
              </div>
            )}
          </div>

          {token && (
            <form onSubmit={onSend} className="flex items-end gap-2 border-t bg-white p-3 pb-safe">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={1}
                placeholder={c.typeMsg}
                aria-label="Message"
                className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-input px-3.5 py-2.5 text-[15px] outline-none focus:border-brand"
              />
              <button type="submit" disabled={sending || !draft.trim()} aria-label={c.send} className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-white disabled:opacity-50">
                {sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              </button>
            </form>
          )}
          {token && error && <p className="bg-white px-4 pb-2 text-xs text-destructive">{error}</p>}
        </div>
      )}
    </>
  );
}
