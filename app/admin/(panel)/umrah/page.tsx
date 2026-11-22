import { ExternalLink } from 'lucide-react';
import { UmrahEditor } from '@/components/admin/umrah-editor';
import { PageHeader } from '@/components/admin/ui';
import { getUmrahConfig } from '@/lib/umrah-server';

export default async function AdminUmrahPage() {
  const config = await getUmrahConfig();
  return (
    <>
      <PageHeader
        title="Umrah"
        text="Edit muallim-led packages and the rates for every service in the custom Umrah builder."
        action={
          <a href="/umrah" target="_blank" className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-border">
            <ExternalLink className="size-4" /> View Umrah page
          </a>
        }
      />
      <UmrahEditor initial={config} />
    </>
  );
}
