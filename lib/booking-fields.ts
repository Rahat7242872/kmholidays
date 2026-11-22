import type { Locale } from '@/lib/i18n';

/**
 * Extra questions on the booking / request form, per service. Answers are stored on the inquiry
 * as `answers` (English label + value) so the admin panel and PDF can show them neatly.
 */

type Text = { en: string; bn: string };
type Option = { value: string; label: Text };

export type BookingField = {
  key: string;
  label: Text;
  type: 'text' | 'select' | 'date' | 'number';
  options?: Option[];
  placeholder?: Text;
  /** Spans both columns on wider screens. */
  wide?: boolean;
  /** Uppercase the value (passport numbers). */
  upper?: boolean;
};

export type Answer = { key: string; label: string; value: string };

const o = (value: string, bn: string): Option => ({ value, label: { en: value, bn } });
const yesNo = [o('Yes', 'হ্যাঁ'), o('No', 'না')];

const occupation: BookingField = {
  key: 'occupation', label: { en: 'Occupation', bn: 'পেশা' }, type: 'select',
  options: [o('Job holder', 'চাকরিজীবী'), o('Business owner', 'ব্যবসায়ী'), o('Student', 'শিক্ষার্থী'), o('Homemaker', 'গৃহিণী'), o('Retired', 'অবসরপ্রাপ্ত'), o('Other', 'অন্যান্য')],
};
const passportStatus: BookingField = {
  key: 'passportStatus', label: { en: 'Passport', bn: 'পাসপোর্ট' }, type: 'select',
  options: [o('Have valid passport', 'বৈধ পাসপোর্ট আছে'), o('Passport expiring soon', 'মেয়াদ শেষের পথে'), o('Need a new passport', 'নতুন পাসপোর্ট লাগবে')],
};
const departureCity: BookingField = {
  key: 'departureCity', label: { en: 'Departing from', bn: 'যাত্রা শুরু' }, type: 'select',
  options: [o('Dhaka', 'ঢাকা'), o('Chattogram', 'চট্টগ্রাম'), o('Sylhet', 'সিলেট'), o('Other', 'অন্যান্য')],
};
const children: BookingField = { key: 'children', label: { en: 'Children (under 12)', bn: 'শিশু (১২ বছরের নিচে)' }, type: 'number', placeholder: { en: '0', bn: '০' } };

/** Asked on every form. */
const CONTACT: BookingField[] = [
  {
    key: 'contactVia', label: { en: 'Best way to reach you', bn: 'কীভাবে যোগাযোগ করব' }, type: 'select',
    options: [o('Phone call', 'ফোন কল'), o('WhatsApp', 'হোয়াটসঅ্যাপ'), o('Messenger', 'মেসেঞ্জার'), o('Email', 'ইমেইল')],
  },
  {
    key: 'contactTime', label: { en: 'Best time to call', bn: 'কল করার ভালো সময়' }, type: 'select',
    options: [o('Any time', 'যেকোনো সময়'), o('Morning (9–12)', 'সকাল (৯–১২)'), o('Afternoon (12–5)', 'দুপুর (১২–৫)'), o('Evening (5–9)', 'সন্ধ্যা (৫–৯)')],
  },
];

const FIELDS: Record<string, BookingField[]> = {
  visa: [
    {
      key: 'visaType', label: { en: 'Visa type', bn: 'ভিসার ধরন' }, type: 'select',
      options: [o('Tourist', 'ট্যুরিস্ট'), o('Business', 'বিজনেস'), o('Medical', 'মেডিকেল'), o('Student', 'স্টুডেন্ট'), o('Family visit', 'ফ্যামিলি ভিজিট'), o('Transit', 'ট্রানজিট')],
    },
    occupation,
    { key: 'passportNo', label: { en: 'Passport number', bn: 'পাসপোর্ট নম্বর' }, type: 'text', placeholder: { en: 'e.g. A01234567', bn: 'যেমন: A01234567' }, upper: true },
    { key: 'passportExpiry', label: { en: 'Passport expiry', bn: 'পাসপোর্টের মেয়াদ' }, type: 'date' },
    {
      key: 'travelHistory', label: { en: 'Travel history', bn: 'ভ্রমণ ইতিহাস' }, type: 'select',
      options: [o('First time abroad', 'প্রথমবার বিদেশ'), o('Travelled before', 'আগে বিদেশ গিয়েছি'), o('Had a visa refusal', 'আগে ভিসা রিজেক্ট হয়েছে')],
    },
    { key: 'countriesVisited', label: { en: 'Countries visited (if any)', bn: 'যেসব দেশে গিয়েছেন' }, type: 'text', placeholder: { en: 'e.g. India 2023, Thailand 2024', bn: 'যেমন: ভারত ২০২৩, থাইল্যান্ড ২০২৪' } },
  ],
  tour: [
    departureCity,
    children,
    {
      key: 'hotelClass', label: { en: 'Hotel preference', bn: 'হোটেলের মান' }, type: 'select',
      options: [o('As in package', 'প্যাকেজ অনুযায়ী'), o('Budget', 'বাজেট'), o('3-star', '৩ তারকা'), o('4-star', '৪ তারকা'), o('5-star', '৫ তারকা')],
    },
    {
      key: 'roomType', label: { en: 'Room', bn: 'রুম' }, type: 'select',
      options: [o('Double', 'ডাবল'), o('Twin', 'টুইন'), o('Triple', 'ট্রিপল'), o('Family room', 'ফ্যামিলি রুম')],
    },
    { key: 'needFlight', label: { en: 'Need air ticket?', bn: 'এয়ার টিকেট লাগবে?' }, type: 'select', options: yesNo },
    { key: 'needVisa', label: { en: 'Need visa support?', bn: 'ভিসা সাপোর্ট লাগবে?' }, type: 'select', options: yesNo },
    { key: 'budget', label: { en: 'Budget per person (৳)', bn: 'জনপ্রতি বাজেট (৳)' }, type: 'text', placeholder: { en: 'e.g. 60,000', bn: 'যেমন: ৬০,০০০' } },
  ],
  hotel: [
    { key: 'checkOut', label: { en: 'Check-out', bn: 'চেক-আউট' }, type: 'date' },
    { key: 'rooms', label: { en: 'Rooms', bn: 'রুম সংখ্যা' }, type: 'number', placeholder: { en: '1', bn: '১' } },
    children,
    {
      key: 'roomType', label: { en: 'Room type', bn: 'রুমের ধরন' }, type: 'select',
      options: [o('Standard', 'স্ট্যান্ডার্ড'), o('Deluxe', 'ডিলাক্স'), o('Sea / city view', 'সি / সিটি ভিউ'), o('Suite', 'স্যুট'), o('Family room', 'ফ্যামিলি রুম')],
    },
    {
      key: 'meals', label: { en: 'Meals', bn: 'খাবার' }, type: 'select',
      options: [o('Room only', 'শুধু রুম'), o('With breakfast', 'নাস্তাসহ'), o('Half board', 'হাফ বোর্ড'), o('Full board', 'ফুল বোর্ড')],
    },
  ],
  esim: [
    { key: 'device', label: { en: 'Phone model', bn: 'ফোনের মডেল' }, type: 'text', placeholder: { en: 'e.g. iPhone 13, Galaxy S23', bn: 'যেমন: iPhone 13, Galaxy S23' } },
    { key: 'days', label: { en: 'Days abroad', bn: 'কত দিন বিদেশে' }, type: 'number', placeholder: { en: '7', bn: '৭' } },
    { key: 'countries', label: { en: 'Countries you’ll visit', bn: 'যেসব দেশে যাবেন' }, type: 'text', wide: true },
  ],
  service: [
    { key: 'route', label: { en: 'From → to (if travel related)', bn: 'কোথা থেকে → কোথায়' }, type: 'text', placeholder: { en: 'e.g. Dhaka → Dubai', bn: 'যেমন: ঢাকা → দুবাই' }, wide: true },
  ],
  flight: [
    { key: 'nameAsPassport', label: { en: 'Name as in passport', bn: 'পাসপোর্ট অনুযায়ী নাম' }, type: 'text', upper: true, wide: true },
    { key: 'flexibleDates', label: { en: 'Flexible dates?', bn: 'তারিখ বদলানো যাবে?' }, type: 'select', options: [o('Exact date', 'নির্দিষ্ট তারিখ'), o('± 1–3 days', '± ১–৩ দিন'), o('Any day that week', 'ওই সপ্তাহের যেকোনো দিন')] },
    { key: 'airline', label: { en: 'Preferred airline', bn: 'পছন্দের এয়ারলাইন' }, type: 'text', placeholder: { en: 'Any', bn: 'যেকোনো' } },
  ],
  umrah: [
    passportStatus,
    { key: 'firstUmrah', label: { en: 'First Umrah?', bn: 'প্রথম উমরাহ?' }, type: 'select', options: yesNo },
    departureCity,
    { key: 'seniors', label: { en: 'Elderly travellers (60+)', bn: 'বয়স্ক যাত্রী (৬০+)' }, type: 'number', placeholder: { en: '0', bn: '০' } },
  ],
  'visa-guide': [occupation, passportStatus],
};

export function bookingFields(kind: string | undefined): BookingField[] {
  return [...(FIELDS[kind ?? ''] ?? []), ...CONTACT];
}

export const fieldLabel = (f: BookingField, locale: Locale) => f.label[locale];
export const optionLabel = (opt: Option, locale: Locale) => opt.label[locale];

/** Read and validate the answers for `kind` from a submitted form (field names = `ans.<key>`). */
export function answersFromForm(kind: string, form: FormData): Answer[] {
  const out: Answer[] = [];
  for (const f of bookingFields(kind)) {
    let value = String(form.get(`ans.${f.key}`) ?? '').trim().slice(0, 200);
    if (!value) continue;
    if (f.type === 'select' && !f.options?.some((opt) => opt.value === value)) continue;
    if (f.type === 'number') {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0 || n > 999) continue;
      value = String(Math.round(n));
    }
    if (f.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) continue;
    if (f.upper) value = value.toUpperCase();
    out.push({ key: f.key, label: f.label.en, value });
  }
  return out;
}

export function normalizeAnswers(value: unknown): Answer[] {
  return Array.isArray(value) ? value.filter((a): a is Answer => !!a && typeof a === 'object' && 'label' in a && 'value' in a) : [];
}

/** Dates as "12 Dec 2026", everything else unchanged. */
export function formatAnswer(a: Answer) {
  return /^\d{4}-\d{2}-\d{2}$/.test(a.value) ? new Date(a.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : a.value;
}
