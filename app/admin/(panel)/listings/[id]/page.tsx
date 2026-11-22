import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { ListingForm } from '@/components/admin/listing-form';
import { PageHeader } from '@/components/admin/ui';
import { getListingById } from '@/lib/data';
import { categoryMeta } from '@/lib/site';

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const listing = await getListingById(Number((await params).id));
  if (!listing) notFound();

  return (
    <>
      <PageHeader
        title="Edit listing"
        text={listing.title}
        action={
          listing.active ? (
            <a href={`/${categoryMeta[listing.category].path}/${listing.slug}`} target="_blank" className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-border">
              <ExternalLink className="size-4" /> View on site
            </a>
          ) : undefined
        }
      />
      <ListingForm listing={listing} />
    </>
  );
}
