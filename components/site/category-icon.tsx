import { BedDouble, Palmtree, Plane, Smartphone, Stamp, type LucideProps } from 'lucide-react';
import type { Category } from '@/lib/site';

const icons = {
  tour: Palmtree,
  hotel: BedDouble,
  visa: Stamp,
  esim: Smartphone,
  service: Plane,
} satisfies Record<Category, React.ComponentType<LucideProps>>;

export function CategoryIcon({ category, ...props }: { category: Category } & LucideProps) {
  const Icon = icons[category];
  return <Icon {...props} />;
}
