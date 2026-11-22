import { seedDetails } from '@/lib/seed-details';
import type { ListingInput } from '@/lib/types';

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

/**
 * Starter content so the site never looks empty. Prices are SAMPLE values —
 * edit or replace everything from the admin panel before going live.
 */
const base: Omit<ListingInput, 'details'>[] = [
  // Tours
  {
    category: 'tour', title: 'Bali, your way', slug: 'bali-your-way', location: 'Bali, Indonesia',
    price: 68500, priceNote: 'per person', duration: '5 nights · 6 days', image: img('photo-1537996194471-e657df975ab4'),
    summary: 'Island days, temple trails and slow mornings by the rice terraces.',
    description: 'A relaxed Bali escape split between Ubud’s green hills and the beaches of Nusa Dua. Private transfers, handpicked hotels and enough free time to do nothing at all.',
    highlights: ['4-star hotels with breakfast', 'Ubud & Kintamani day tour', 'Uluwatu sunset & Kecak dance', 'Private airport transfers'],
    badge: 'Bestseller', rating: 4.9, featured: true, active: true,
  },
  {
    category: 'tour', title: 'Maldives, unhurried', slug: 'maldives-unhurried', location: 'Maldives',
    price: 92000, priceNote: 'per person', duration: '3 nights · 4 days', image: img('photo-1514282401047-d79a71a590e8'),
    summary: 'Turquoise water, overwater villas and sunsets made for two.',
    description: 'A honeymoon-favourite resort stay with speedboat transfers, all meals and a sandbank picnic.',
    highlights: ['Beach / water villa', 'Full board meals', 'Speedboat transfers', 'Snorkelling trip'],
    badge: 'Honeymoon', rating: 4.8, featured: true, active: true,
  },
  {
    category: 'tour', title: 'Kashmir in bloom', slug: 'kashmir-in-bloom', location: 'Kashmir, India',
    price: 42500, priceNote: 'per person', duration: '5 nights · 6 days', image: img('photo-1506905925346-21bda4d32df4'),
    summary: 'Mountain air, houseboats on Dal Lake and valley views.',
    description: 'Srinagar, Gulmarg and Pahalgam with a night on a traditional houseboat and a shikara ride at dusk.',
    highlights: ['Houseboat night stay', 'Gulmarg gondola', 'Pahalgam valleys', 'All transfers by private car'],
    badge: '', rating: 4.7, featured: true, active: true,
  },
  {
    category: 'tour', title: 'Dubai, after dark', slug: 'dubai-after-dark', location: 'Dubai, UAE',
    price: 58000, priceNote: 'per person', duration: '4 nights · 5 days', image: img('photo-1512453979798-5ea266f8880c'),
    summary: 'A little skyline, a little desert, a lot of good food.',
    description: 'City tour, Burj Khalifa, desert safari with BBQ dinner and a dhow cruise — visa assistance included.',
    highlights: ['Desert safari + BBQ', 'Burj Khalifa entry', 'Marina dhow cruise', 'Visa assistance'],
    badge: 'Visa included', rating: 4.8, featured: true, active: true,
  },
  {
    category: 'tour', title: 'Thailand island hop', slug: 'thailand-island-hop', location: 'Phuket & Krabi, Thailand',
    price: 49500, priceNote: 'per person', duration: '5 nights · 6 days', image: img('photo-1552465011-b4e21bf6e79a'),
    summary: 'Phi Phi, longtail boats and night markets.',
    description: 'Split stay in Phuket and Krabi with a Phi Phi island speedboat tour and four-island hopping.',
    highlights: ['Phi Phi island tour', '4-island hopping', 'Hotel with breakfast', 'Ferry transfers'],
    badge: '', rating: 4.6, featured: false, active: true,
  },
  {
    category: 'tour', title: 'Sajek & Cox’s Bazar', slug: 'sajek-coxs-bazar', location: 'Bangladesh',
    price: 14500, priceNote: 'per person', duration: '3 nights · 4 days', image: img('photo-1590077428593-a55bb07c4665'),
    summary: 'Clouds in the hills, then the longest beach in the world.',
    description: 'A home-country favourite: sunrise above the clouds at Sajek, then easy beach days in Cox’s Bazar.',
    highlights: ['AC transport', 'Resort stays', 'Local guide', 'Meals included'],
    badge: 'Local favourite', rating: 4.7, featured: false, active: true,
  },
  // Hotels
  {
    category: 'hotel', title: 'Seaside Resort & Spa', slug: 'seaside-resort-spa', location: 'Cox’s Bazar, Bangladesh',
    price: 9500, priceNote: 'per night', duration: 'Flexible nights', image: img('photo-1571896349842-33c89424de2d'),
    summary: 'Sea-view rooms, infinity pool and breakfast included.',
    description: 'Ocean-facing rooms a short walk from the beach with a spa, pool and family suites.',
    highlights: ['Sea-view rooms', 'Infinity pool', 'Breakfast included', 'Family suites'],
    badge: 'Sea view', rating: 4.6, featured: true, active: true,
  },
  {
    category: 'hotel', title: 'Marina Skyline Hotel', slug: 'marina-skyline-hotel', location: 'Dubai, UAE',
    price: 14500, priceNote: 'per night', duration: 'Flexible nights', image: img('photo-1566073771259-6a8506099945'),
    summary: 'Walk to the marina, metro and beach.',
    description: 'Modern rooms with skyline views, a rooftop pool and easy metro access.',
    highlights: ['Rooftop pool', 'Near metro', 'Free Wi-Fi', '24h front desk'],
    badge: '', rating: 4.5, featured: true, active: true,
  },
  {
    category: 'hotel', title: 'Ubud Jungle Villas', slug: 'ubud-jungle-villas', location: 'Bali, Indonesia',
    price: 12000, priceNote: 'per night', duration: 'Flexible nights', image: img('photo-1582719508461-905c673771fd'),
    summary: 'Private pool villas tucked into the rainforest.',
    description: 'Quiet private villas with floating breakfast and a free shuttle into Ubud centre.',
    highlights: ['Private pool', 'Floating breakfast', 'Free shuttle', 'Yoga deck'],
    badge: 'Couples', rating: 4.9, featured: true, active: true,
  },
  {
    category: 'hotel', title: 'Old Town Boutique Stay', slug: 'old-town-boutique-stay', location: 'Bangkok, Thailand',
    price: 6500, priceNote: 'per night', duration: 'Flexible nights', image: img('photo-1551882547-ff40c63fe5fa'),
    summary: 'Characterful rooms near the river and street-food lanes.',
    description: 'A small boutique hotel close to the Grand Palace with a rooftop bar.',
    highlights: ['Rooftop bar', 'Near Grand Palace', 'Breakfast included'],
    badge: '', rating: 4.4, featured: false, active: true,
  },
  // Visa
  {
    category: 'visa', title: 'Dubai tourist visa', slug: 'dubai-tourist-visa', location: 'United Arab Emirates',
    price: 12500, priceNote: 'service + visa fee', duration: '3–5 working days', image: img('photo-1518684079-3c830dcef090'),
    summary: '30-day single-entry e-visa, applied fully online.',
    description: 'We check your documents, file the application and send the e-visa straight to your email.',
    highlights: ['Passport scan', 'Recent photo (white background)', 'Bank statement (last 6 months)', 'Return ticket copy'],
    badge: 'E-visa', rating: null, featured: true, active: true,
  },
  {
    category: 'visa', title: 'Thailand tourist visa', slug: 'thailand-tourist-visa', location: 'Thailand',
    price: 6500, priceNote: 'service + visa fee', duration: '7–10 working days', image: img('photo-1528181304800-259b08848526'),
    summary: 'Complete file preparation and submission support.',
    description: 'Checklist, form filling, hotel and ticket bookings for the application, and submission support.',
    highlights: ['Passport (6+ months valid)', 'Bank solvency certificate', 'NOC / trade licence', 'Hotel booking'],
    badge: '', rating: null, featured: true, active: true,
  },
  {
    category: 'visa', title: 'Malaysia e-visa', slug: 'malaysia-e-visa', location: 'Malaysia',
    price: 5500, priceNote: 'service + visa fee', duration: '3–7 working days', image: img('photo-1596422846543-75c6fc197f07'),
    summary: 'Online e-visa with document review.',
    description: 'Fast online e-visa processing with a full document review before submission.',
    highlights: ['Passport scan', 'Photo', 'Flight itinerary', 'Hotel booking'],
    badge: 'E-visa', rating: null, featured: false, active: true,
  },
  {
    category: 'visa', title: 'Schengen visa support', slug: 'schengen-visa-support', location: 'Europe',
    price: 15000, priceNote: 'service charge', duration: '15–30 working days', image: img('photo-1499856871958-5b9627545d1a'),
    summary: 'File preparation, cover letter and appointment booking.',
    description: 'End-to-end support for Schengen tourist visa files including itinerary and travel insurance.',
    highlights: ['Cover letter drafting', 'Appointment booking', 'Travel insurance', 'Day-by-day itinerary'],
    badge: '', rating: null, featured: true, active: true,
  },
  // eSIM
  {
    category: 'esim', title: 'Asia 10GB eSIM', slug: 'asia-10gb-esim', location: '13 Asian countries',
    price: 2200, priceNote: 'one-time', duration: '30 days validity', image: img('photo-1512941937669-90a1b58e7e9c'),
    summary: '10GB high-speed data across Thailand, Malaysia, Singapore and more.',
    description: 'Scan the QR code before you fly and you are online the moment you land.',
    highlights: ['10GB 4G/5G data', 'Instant QR delivery', 'Hotspot allowed', 'Works in 13 countries'],
    badge: 'Popular', rating: null, featured: true, active: true,
  },
  {
    category: 'esim', title: 'UAE 5GB eSIM', slug: 'uae-5gb-esim', location: 'United Arab Emirates',
    price: 1600, priceNote: 'one-time', duration: '15 days validity', image: img('photo-1546412414-e1885259563a'),
    summary: 'Fast local data for Dubai and Abu Dhabi.',
    description: 'A data-only eSIM on a local network — perfect for maps, rides and messaging.',
    highlights: ['5GB data', 'Local network', 'Instant activation'],
    badge: '', rating: null, featured: true, active: true,
  },
  {
    category: 'esim', title: 'Europe 20GB eSIM', slug: 'europe-20gb-esim', location: '35+ European countries',
    price: 3900, priceNote: 'one-time', duration: '30 days validity', image: img('photo-1467269204594-9661b134dd2b'),
    summary: 'One plan for your whole Europe trip.',
    description: 'Cross borders without swapping SIMs — one plan across 35+ countries.',
    highlights: ['20GB data', '35+ countries', 'Hotspot allowed'],
    badge: 'Best value', rating: null, featured: true, active: true,
  },
  // Other services
  {
    category: 'service', title: 'Air tickets', slug: 'air-tickets', location: 'Domestic & international',
    price: null, priceNote: 'best available fare', duration: 'Same-day issue', image: img('photo-1436491865332-7a61a109cc05'),
    summary: 'Domestic and international flights on all major airlines.',
    description: 'Tell us your route and dates — we compare airlines and hold the best fare for you.',
    highlights: ['All major airlines', 'Group fares', 'Date-change support'],
    badge: '', rating: null, featured: true, active: true,
  },
  {
    category: 'service', title: 'Travel insurance', slug: 'travel-insurance', location: 'Worldwide',
    price: 1200, priceNote: 'from', duration: 'Issued in 24 hours', image: img('photo-1450101499163-c8848c66ca85'),
    summary: 'Medical and trip cover, accepted for visa applications.',
    description: 'Embassy-accepted travel insurance with medical, baggage and trip-cancellation cover.',
    highlights: ['Embassy accepted', 'Medical cover', 'Baggage cover'],
    badge: '', rating: null, featured: true, active: true,
  },
  {
    category: 'service', title: 'Airport transfers', slug: 'airport-transfers', location: 'Major cities',
    price: 2500, priceNote: 'from', duration: 'Book 24h ahead', image: img('photo-1449965408869-eaa3f722e40d'),
    summary: 'A driver waiting with your name when you land.',
    description: 'Private car pick-up and drop-off at airports and hotels.',
    highlights: ['Meet & greet', 'Private car', 'Flight tracking'],
    badge: '', rating: null, featured: true, active: true,
  },
  {
    category: 'service', title: 'Hajj & Umrah packages', slug: 'hajj-umrah-packages', location: 'Makkah & Madinah',
    price: null, priceNote: 'on request', duration: 'Seasonal', image: img('photo-1591604129939-f1efa4d9f7fa'),
    summary: 'Guided packages with visa, flights and hotels near the Haram.',
    description: 'Carefully planned Umrah and Hajj packages with experienced guides.',
    highlights: ['Visa processing', 'Hotels near Haram', 'Guided ziyarah'],
    badge: '', rating: null, featured: false, active: true,
  },
];

export const seedListings: ListingInput[] = base.map((l) => ({ ...l, details: seedDetails[l.slug] ?? {} }));
