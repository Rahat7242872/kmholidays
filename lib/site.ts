export type Contact = { name: string; display: string; tel: string };

/** Office hotlines (shown in header, footer, office section and booking cards). */
export const contacts: Contact[] = [
  { name: 'Shanto', display: '+880 1975-179167', tel: '+8801975179167' },
  { name: 'Tareq Ibrahim', display: '+880 1940-777444', tel: '+8801940777444' },
];

const address = process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'House-03, Level-02, Road-20, Gulshan-01, Dhaka-1212';

export const site = {
  name: 'KM Holidays',
  tagline: 'Your 1 Stop Travel Solution',
  messenger: 'https://m.me/kmholidaysltd',
  facebook: 'https://web.facebook.com/kmholidaysltd/',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || contacts[0].display,
  // WhatsApp number (digits with country code). Leave empty to send the chat button to Messenger.
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  address,
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`KM Holidays, ${address}`)}`,
};

export const CATEGORIES = ['tour', 'hotel', 'visa', 'esim', 'service'] as const;
export type Category = (typeof CATEGORIES)[number];

export type CategoryMeta = {
  key: Category;
  label: string;
  plural: string;
  path: string;
  title: string;
  blurb: string;
  image: string;
  durationLabel: string;
  locationLabel: string;
};

export const categoryMeta: Record<Category, CategoryMeta> = {
  tour: {
    key: 'tour',
    label: 'Tour',
    plural: 'Tours',
    path: 'tours',
    title: "Tour Packages",
    blurb: "Handpicked holiday packages with hotels, transfers and sightseeing included — at the best price.",
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
    durationLabel: 'Duration',
    locationLabel: 'Destination',
  },
  hotel: {
    key: 'hotel',
    label: 'Hotel',
    plural: 'Hotels',
    path: 'hotels',
    title: "Hotels & Resorts",
    blurb: "Great deals on hotels and resorts at home and abroad, with free support if your plans change.",
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80',
    durationLabel: 'Stay',
    locationLabel: 'City',
  },
  visa: {
    key: 'visa',
    label: 'Visa',
    plural: 'Visa',
    path: 'visa',
    title: "Visa Processing",
    blurb: "Hassle-free visa processing with expert document checks, form filling and appointment support.",
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80',
    durationLabel: 'Processing time',
    locationLabel: 'Country',
  },
  esim: {
    key: 'esim',
    label: 'eSIM',
    plural: 'eSIM',
    path: 'esim',
    title: "Travel eSIM",
    blurb: "Stay connected abroad with affordable data plans. Instant QR delivery, no roaming bills.",
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=2000&q=80',
    durationLabel: 'Validity',
    locationLabel: 'Coverage',
  },
  service: {
    key: 'service',
    label: 'Service',
    plural: 'Other services',
    path: 'services',
    title: "Other Travel Services",
    blurb: "Air tickets, travel insurance, airport transfers, Hajj & Umrah and more — all in one place.",
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2000&q=80',
    durationLabel: 'Turnaround',
    locationLabel: 'Where',
  },
};

export const categoryList = CATEGORIES.map((c) => categoryMeta[c]);

export function categoryFromPath(path: string): Category | null {
  return categoryList.find((c) => c.path === path)?.key ?? null;
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function formatPrice(amount: number | null | undefined, onRequest = 'On request') {
  if (!amount) return onRequest;
  return `৳${amount.toLocaleString('en-IN')}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

const FLAGS: [RegExp, string][] = [
  [/dubai|uae|emirates|abu dhabi/i, '🇦🇪'],
  [/thailand|bangkok|phuket|krabi/i, '🇹🇭'],
  [/malaysia|kuala lumpur/i, '🇲🇾'],
  [/singapore/i, '🇸🇬'],
  [/indonesia|bali/i, '🇮🇩'],
  [/maldives/i, '🇲🇻'],
  [/india|kashmir|delhi|goa/i, '🇮🇳'],
  [/nepal/i, '🇳🇵'],
  [/bhutan/i, '🇧🇹'],
  [/sri lanka/i, '🇱🇰'],
  [/vietnam/i, '🇻🇳'],
  [/china/i, '🇨🇳'],
  [/japan/i, '🇯🇵'],
  [/korea/i, '🇰🇷'],
  [/turkey|t[üu]rkiye|istanbul/i, '🇹🇷'],
  [/saudi|makkah|madinah|umrah|hajj/i, '🇸🇦'],
  [/schengen|europe/i, '🇪🇺'],
  [/united kingdom|\buk\b|london/i, '🇬🇧'],
  [/usa|united states|america/i, '🇺🇸'],
  [/canada/i, '🇨🇦'],
  [/australia/i, '🇦🇺'],
  [/bangladesh|cox|sajek|sylhet/i, '🇧🇩'],
  [/asia/i, '🌏'],
  [/worldwide|global/i, '🌍'],
];

/** Best-effort flag emoji for a location/title, or null if unknown. */
export function flagFor(...texts: string[]): string | null {
  const text = texts.join(' ');
  return FLAGS.find(([re]) => re.test(text))?.[1] ?? null;
}

/** Request types that aren't listing categories (flight tickets, Umrah plans, go-abroad guide). */
export const REQUEST_TYPES = { flight: 'Air ticket', umrah: 'Umrah', 'visa-guide': 'Go abroad guide' } as const;
export type RequestType = keyof typeof REQUEST_TYPES;

export function isRequestType(value: string): value is RequestType {
  return value in REQUEST_TYPES;
}

/** Human label for an inquiry's category. */
export function requestLabel(category: string): string {
  if (isCategory(category)) return categoryMeta[category].label;
  if (isRequestType(category)) return REQUEST_TYPES[category];
  return 'Inquiry';
}
