import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Phone } from 'lucide-react';
import { adminSetChatStatus } from '@/app/actions/chat';
import { ChatThread } from '@/components/admin/chat-thread';
import { SubmitButton } from '@/components/admin/confirm-button';
import { getConversationById, getMessages, getUserById, markConversationRead } from '@/lib/data';

export default async function AdminChatPage({ params }: { params: Promise<{ id: string }> }) {
  const conv = await getConversationById(Number((await params).id));
  if (!conv) notFound();
  const [messages, member] = await Promise.all([getMessages(conv.id), conv.userId ? getUserById(conv.userId) : null]);
  if (conv.unreadForAdmin > 0) await markConversationRead(conv.id, 'admin');
  const digits = conv.phone.replace(/[^\d+]/g, '');

  return (
    <>
      <Link href="/admin/chats" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-ink">
        <ArrowLeft className="size-4" /> All chats
      </Link>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{conv.name}</h1>
          <p className="text-sm text-muted-foreground">
            {conv.phone}
            {member && <> · Member: {member.email}{member.profile.occupation ? ` · ${member.profile.occupation}` : ''}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${digits}`} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-bold ring-1 ring-border"><Phone className="size-4" /> Call</a>
          <a href={`https://wa.me/${digits.replace('+', '')}`} target="_blank" rel="noreferrer" className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand">WhatsApp</a>
          <form action={adminSetChatStatus}>
            <input type="hidden" name="id" value={conv.id} />
            <input type="hidden" name="status" value={conv.status === 'open' ? 'closed' : 'open'} />
            <SubmitButton className="rounded-xl bg-ink px-3 py-2 text-sm font-bold text-white">{conv.status === 'open' ? 'Mark closed' : 'Reopen'}</SubmitButton>
          </form>
        </div>
      </div>
      <ChatThread conversationId={conv.id} initial={messages} customerName={conv.name} />
    </>
  );
}
