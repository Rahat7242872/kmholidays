import { BedDouble, Compass, Landmark, Palmtree, PlaneTakeoff, Smartphone, Sparkles, Stamp } from 'lucide-react';
import type { Dict } from '@/lib/i18n';

type NavKey = 'flights' | 'tours' | 'hotels' | 'visa' | 'umrah' | 'esim' | 'others' | 'guide';

/** Main navigation, shared by the header, mobile drawer, footer and home shortcuts. Labels come from the dictionary. */
export const NAV_ITEMS = [
  { href: '/flights', key: 'flights', icon: PlaneTakeoff },
  { href: '/tours', key: 'tours', icon: Palmtree },
  { href: '/hotels', key: 'hotels', icon: BedDouble },
  { href: '/visa', key: 'visa', icon: Stamp },
  { href: '/umrah', key: 'umrah', icon: Landmark },
  { href: '/esim', key: 'esim', icon: Smartphone },
  { href: '/services', key: 'others', icon: Sparkles },
] as const satisfies readonly { href: string; key: NavKey; icon: unknown }[];

export const GUIDE_ITEM = { href: '/go-abroad', key: 'guide', icon: Compass } as const;

export const navLabel = (t: Dict, key: NavKey) => t.nav[key];
export const navSub = (t: Dict, key: NavKey) => t.nav[`${key}Sub` as `${NavKey}Sub`];
