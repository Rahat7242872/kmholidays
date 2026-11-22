import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { getAdminSession } from '@/lib/auth';
import { getConversations, getInquiries } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  const [newList, conversations] = await Promise.all([getInquiries('new'), getConversations()]);
  const newInquiries = newList.length;
  const unreadChats = conversations.filter((c) => c.unreadForAdmin > 0).length;

  return (
    <Suspense>
      <AdminShell newInquiries={newInquiries} unreadChats={unreadChats} email={session.user?.email ?? ''}>
        {children}
      </AdminShell>
    </Suspense>
  );
}
