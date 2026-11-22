import Link from 'next/link';
import { MessagesSquare, Phone } from 'lucide-react';
import { PageHeader, Panel } from '@/components/admin/ui';
import { getConversations, getMessages } from '@/lib/data';
import { cn } from '@/lib/utils';

export default async function AdminChatsPage() {
  const conversations = await getConversations();
  const previews = await Promise.all(
    conversations.map(async (c) => {
      const msgs = await getMessages(c.id);
      return msgs[msgs.length - 1];
    }),
  );

  return (
    <>
      <PageHeader title="Live chat" text="Messages from the website chat. The list refreshes when you open it; open threads update live." />
      <Panel className="overflow-hidden">
        {conversations.length ? (
          <ul className="divide-y">
            {conversations.map((c, i) => (
              <li key={c.id}>
                <Link href={`/admin/chats/${c.id}`} className={cn('flex items-center gap-3 px-4 py-4 transition hover:bg-muted/50 sm:px-5', c.unreadForAdmin > 0 && 'bg-cta/5')}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 font-bold text-brand">{c.name.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{c.name}</p>
                      {c.userId && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand">Member</span>}
                      {c.status === 'closed' && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">Closed</span>}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {previews[i] ? `${previews[i].sender === 'admin' ? 'You: ' : ''}${previews[i].body}` : 'No messages'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(c.lastMessageAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {c.unreadForAdmin > 0 && <span className="rounded-full bg-cta px-2 py-0.5 text-[11px] font-bold text-white">{c.unreadForAdmin}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center text-sm text-muted-foreground">
            <MessagesSquare className="mb-3 size-10 text-brand/40" />
            No chats yet. When visitors use the chat button on the website, conversations appear here.
            <span className="mt-2 inline-flex items-center gap-1 text-xs"><Phone className="size-3.5" /> Tip: reply quickly — visitors see your answer live.</span>
          </div>
        )}
      </Panel>
    </>
  );
}
