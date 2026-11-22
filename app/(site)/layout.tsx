import { ChatWidget } from '@/components/site/chat-widget';
import { MobileTabBar } from '@/components/site/mobile-tab-bar';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <ChatWidget />
      <MobileTabBar />
    </>
  );
}
