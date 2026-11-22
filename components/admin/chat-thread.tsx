'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2, Send } from 'lucide-react';
import { adminFetchMessages, adminReply } from '@/app/actions/chat';
import type { ChatMessage } from '@/lib/types';

/** Admin side of a live chat: shows messages, polls for new ones, sends replies. */
export function ChatThread({ conversationId, initial, customerName }: { conversationId: number; initial: ChatMessage[]; customerName: string }) {
  const [messages, setMessages] = useState(initial);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const lastId = messages.length ? messages[messages.length - 1].id : 0;

  const refresh = useCallback(async () => {
    const fresh = await adminFetchMessages(conversationId, lastId);
    if (fresh.length) setMessages((prev) => [...prev, ...fresh.filter((m) => !prev.some((p) => p.id === m.id))]);
  }, [conversationId, lastId]);

  useEffect(() => {
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  async function onSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    const text = draft;
    setDraft('');
    const res = await adminReply(conversationId, text);
    if (!res.ok) setDraft(text);
    await refresh();
    setSending(false);
  }

  return (
    <div className="flex h-[calc(100svh-220px)] min-h-[420px] flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-border/70">
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-paper p-4 sm:p-6">
        {messages.map((m) => (
          <div key={m.id} className={m.sender === 'admin' ? 'flex justify-end' : 'flex'}>
            <div className={m.sender === 'admin' ? 'max-w-[80%] rounded-2xl rounded-tr-md bg-brand px-4 py-2.5 text-sm text-white' : 'max-w-[80%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-sm text-ink shadow-sm'}>
              <p className="mb-0.5 text-[10px] font-bold opacity-60">{m.sender === 'admin' ? 'KM Holidays' : customerName}</p>
              <p className="whitespace-pre-line">{m.body}</p>
              <p className="mt-1 text-right text-[10px] opacity-60">
                {new Date(m.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={onSend} className="flex items-end gap-2 border-t p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          rows={2}
          placeholder="Write a reply… (Enter to send, Shift+Enter for new line)"
          aria-label="Reply"
          className="flex-1 resize-none rounded-xl border border-input px-3.5 py-2.5 text-[15px] outline-none focus:border-brand"
        />
        <button type="submit" disabled={sending || !draft.trim()} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white disabled:opacity-50">
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send
        </button>
      </form>
    </div>
  );
}
