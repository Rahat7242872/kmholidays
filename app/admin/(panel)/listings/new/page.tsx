import { ListingForm } from '@/components/admin/listing-form';
import { PageHeader } from '@/components/admin/ui';
import { isCategory } from '@/lib/site';

export default async function NewListingPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  return (
    <>
      <PageHeader title="New listing" text="Add a tour, hotel, visa, eSIM plan or other service." />
      <ListingForm defaultCategory={category && isCategory(category) ? category : undefined} />
    </>
  );
}
