/**
 * Umrah services, rates and muallim-led packages.
 *
 * The values below are DEFAULTS only. Admins edit the live rates and packages at
 * /admin/umrah — they are stored in the database (settings key "umrah").
 * Every price shown on the site is labelled as an estimate; the team confirms the final price.
 */

export const TIERS = ['economy', 'standard', 'premium'] as const;
export type Tier = (typeof TIERS)[number];

export type UmrahRates = {
  visa: number; // Umrah visa + mandatory insurance + processing, per person
  flight: { economy: number; business: number }; // Dhaka ⇄ Jeddah/Madinah return, per person
  makkahRoom: Record<Tier, number>; // whole room, per night
  madinahRoom: Record<Tier, number>;
  transport: { bus: number; car: number; train: number }; // airport transfers + Makkah ⇄ Madinah, per person
  ziyarat: { makkah: number; madinah: number; taif: number }; // per person
  food: { breakfast: number; full: number }; // per person per day
  muallim: { group: number; private: number }; // group: per person · private: per group (whole trip)
};

export type UmrahPackage = {
  id: string;
  name: string;
  nameBn: string;
  tier: Tier;
  makkahNights: number;
  madinahNights: number;
  makkahHotel: string;
  madinahHotel: string;
  makkahDistance: string;
  madinahDistance: string;
  muallim: string;
  muallimNote: string; // e.g. "12 years guiding Umrah groups"
  departure: string; // YYYY-MM-DD or free text like "Every Friday"
  seats: number | null; // seats left (null = not shown)
  price: number; // per person
  includes: ServiceKey[];
  featured: boolean;
};

export const SERVICE_KEYS = ['visa', 'flight', 'hotel', 'transport', 'ziyarat', 'food', 'muallim'] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

export type UmrahConfig = { rates: UmrahRates; packages: UmrahPackage[] };

export const DEFAULT_UMRAH: UmrahConfig = {
  // ⚠️ Sample rates — update them in the admin panel (Umrah → Rates).
  rates: {
    visa: 26000, // 1-year multiple Umrah visa "from ৳26,000" (KM Holidays Facebook offer)
    flight: { economy: 78000, business: 210000 },
    makkahRoom: { economy: 9000, standard: 16000, premium: 36000 },
    madinahRoom: { economy: 8000, standard: 14000, premium: 30000 },
    transport: { bus: 6000, car: 15000, train: 12000 },
    ziyarat: { makkah: 2000, madinah: 2000, taif: 4500 },
    food: { breakfast: 600, full: 1800 },
    muallim: { group: 5000, private: 40000 },
  },
  packages: [
    {
      id: 'economy-14', name: 'Economy Umrah — 14 days', nameBn: 'ইকোনমি উমরাহ — ১৪ দিন', tier: 'economy',
      makkahNights: 8, madinahNights: 5, makkahHotel: 'Economy hotel with shuttle', madinahHotel: 'Economy hotel near Markaziya',
      makkahDistance: '~700 m + shuttle', madinahDistance: '~500 m', muallim: 'Group muallim', muallimNote: 'Experienced Bangla-speaking guide',
      departure: 'Every month', seats: null, price: 175000, includes: ['visa', 'flight', 'hotel', 'transport', 'ziyarat', 'food', 'muallim'], featured: false,
    },
    {
      id: 'standard-12', name: 'Standard Umrah — 12 days', nameBn: 'স্ট্যান্ডার্ড উমরাহ — ১২ দিন', tier: 'standard',
      makkahNights: 7, madinahNights: 4, makkahHotel: '4★ hotel near Ibrahim Khalil Road', madinahHotel: '4★ hotel near Masjid an-Nabawi',
      makkahDistance: '~300 m', madinahDistance: '~200 m', muallim: 'Senior muallim', muallimNote: 'Leads every ritual with the group',
      departure: 'Every 2 weeks', seats: null, price: 225000, includes: ['visa', 'flight', 'hotel', 'transport', 'ziyarat', 'food', 'muallim'], featured: true,
    },
    {
      id: 'premium-10', name: 'Premium Umrah — 10 days', nameBn: 'প্রিমিয়াম উমরাহ — ১০ দিন', tier: 'premium',
      makkahNights: 5, madinahNights: 4, makkahHotel: '5★ Haram-view hotel', madinahHotel: '5★ hotel at the Haram gate',
      makkahDistance: '~100 m', madinahDistance: '~50 m', muallim: 'Private muallim', muallimNote: 'Dedicated guide for your family',
      departure: 'Any date', seats: null, price: 395000, includes: ['visa', 'flight', 'hotel', 'transport', 'ziyarat', 'food', 'muallim'], featured: false,
    },
  ],
};

/** Merge a saved config over the defaults, so newly added fields always have a value. */
export function normalizeUmrahConfig(saved: Partial<UmrahConfig> | null): UmrahConfig {
  const r = saved?.rates ?? ({} as Partial<UmrahRates>);
  const d = DEFAULT_UMRAH.rates;
  return {
    rates: {
      visa: r.visa ?? d.visa,
      flight: { ...d.flight, ...r.flight },
      makkahRoom: { ...d.makkahRoom, ...r.makkahRoom },
      madinahRoom: { ...d.madinahRoom, ...r.madinahRoom },
      transport: { ...d.transport, ...r.transport },
      ziyarat: { ...d.ziyarat, ...r.ziyarat },
      food: { ...d.food, ...r.food },
      muallim: { ...d.muallim, ...r.muallim },
    },
    packages: Array.isArray(saved?.packages) ? saved.packages : DEFAULT_UMRAH.packages,
  };
}

/* ------------------------------------------------------------------ */
/* A-la-carte builder                                                  */
/* ------------------------------------------------------------------ */

export type UmrahSelection = {
  travellers: number;
  sharing: 2 | 3 | 4;
  visa: boolean;
  flight: 'none' | 'economy' | 'business';
  makkah: { on: boolean; tier: Tier; nights: number };
  madinah: { on: boolean; tier: Tier; nights: number };
  transport: 'none' | 'bus' | 'train' | 'car';
  ziyarat: { makkah: boolean; madinah: boolean; taif: boolean };
  food: 'none' | 'breakfast' | 'full';
  muallim: 'none' | 'group' | 'private';
};

export const DEFAULT_SELECTION: UmrahSelection = {
  travellers: 2,
  sharing: 4,
  visa: true,
  flight: 'economy',
  makkah: { on: true, tier: 'standard', nights: 7 },
  madinah: { on: true, tier: 'standard', nights: 4 },
  transport: 'bus',
  ziyarat: { makkah: true, madinah: true, taif: false },
  food: 'full',
  muallim: 'group',
};

export type CostLine = { key: ServiceKey | 'hotel-makkah' | 'hotel-madinah'; perPerson: number };

export function umrahEstimate(s: UmrahSelection, r: UmrahRates) {
  const n = Math.max(1, s.travellers);
  const nights = (s.makkah.on ? s.makkah.nights : 0) + (s.madinah.on ? s.madinah.nights : 0);
  const days = nights + 1;
  const lines: CostLine[] = [];
  if (s.visa) lines.push({ key: 'visa', perPerson: r.visa });
  if (s.flight !== 'none') lines.push({ key: 'flight', perPerson: r.flight[s.flight] });
  if (s.makkah.on) lines.push({ key: 'hotel-makkah', perPerson: Math.round((r.makkahRoom[s.makkah.tier] * s.makkah.nights) / s.sharing) });
  if (s.madinah.on) lines.push({ key: 'hotel-madinah', perPerson: Math.round((r.madinahRoom[s.madinah.tier] * s.madinah.nights) / s.sharing) });
  if (s.transport !== 'none') lines.push({ key: 'transport', perPerson: r.transport[s.transport] });
  const ziyarat = (s.ziyarat.makkah ? r.ziyarat.makkah : 0) + (s.ziyarat.madinah ? r.ziyarat.madinah : 0) + (s.ziyarat.taif ? r.ziyarat.taif : 0);
  if (ziyarat) lines.push({ key: 'ziyarat', perPerson: ziyarat });
  if (s.food !== 'none') lines.push({ key: 'food', perPerson: r.food[s.food] * days });
  if (s.muallim === 'group') lines.push({ key: 'muallim', perPerson: r.muallim.group });
  if (s.muallim === 'private') lines.push({ key: 'muallim', perPerson: Math.round(r.muallim.private / n) });
  const perPerson = lines.reduce((sum, l) => sum + l.perPerson, 0);
  return { lines, perPerson, total: perPerson * n, days, nights };
}
