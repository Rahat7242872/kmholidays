/**
 * "Go Abroad Guide" rules: turns a traveller's purpose, destination, travel history and
 * current status into a checklist, process and tips. This is general guidance — embassy
 * rules change, so the page always tells people our team confirms the details.
 */

export const PURPOSES = [
  { key: 'tourist', label: 'Tourist / Holiday', labelBn: 'ভ্রমণ / ছুটি', emoji: '🏝️', blurb: 'Sightseeing, honeymoon, family holiday', blurbBn: 'ঘোরাঘুরি, হানিমুন, পারিবারিক ছুটি' },
  { key: 'student', label: 'Student', labelBn: 'স্টুডেন্ট', emoji: '🎓', blurb: 'Higher study, language course', blurbBn: 'উচ্চশিক্ষা, ল্যাঙ্গুয়েজ কোর্স' },
  { key: 'worker', label: 'Job / Work', labelBn: 'চাকরি / কাজ', emoji: '💼', blurb: 'Employment or work visa', blurbBn: 'চাকরি বা ওয়ার্ক ভিসা' },
  { key: 'business', label: 'Business', labelBn: 'ব্যবসা', emoji: '🤝', blurb: 'Meetings, trade fairs, conferences', blurbBn: 'মিটিং, ট্রেড ফেয়ার, কনফারেন্স' },
  { key: 'medical', label: 'Medical', labelBn: 'চিকিৎসা', emoji: '🏥', blurb: 'Treatment or check-up abroad', blurbBn: 'বিদেশে চিকিৎসা বা চেকআপ' },
  { key: 'family', label: 'Family visit', labelBn: 'পরিবারের কাছে', emoji: '👨‍👩‍👧', blurb: 'Visiting relatives abroad', blurbBn: 'বিদেশে আত্মীয়দের কাছে বেড়ানো' },
] as const;

export const REGIONS = [
  { key: 'asia', label: 'South-East Asia', emoji: '🌴', examples: 'Thailand, Malaysia, Singapore, Indonesia, Maldives, Nepal', level: 1, time: '3–10 working days' },
  { key: 'india', label: 'India', emoji: '🇮🇳', examples: 'Kolkata, Delhi, Kashmir, Chennai', level: 2, time: '5–15 working days' },
  { key: 'gulf', label: 'Middle East', emoji: '🕌', examples: 'UAE, Saudi Arabia, Qatar, Oman, Kuwait', level: 2, time: '3–10 working days (many are e-visas)' },
  { key: 'eastasia', label: 'East Asia', emoji: '🏯', examples: 'Japan, South Korea, China', level: 3, time: '7–20 working days' },
  { key: 'europe', label: 'Europe (Schengen)', emoji: '🇪🇺', examples: 'France, Italy, Germany, Spain and others', level: 4, time: '15–45 days including the appointment' },
  { key: 'uk', label: 'United Kingdom', emoji: '🇬🇧', examples: 'England, Scotland, Wales', level: 4, time: 'About 3–6 weeks' },
  { key: 'oceania', label: 'Australia / New Zealand', emoji: '🦘', examples: 'Sydney, Melbourne, Auckland', level: 4, time: 'About 3–8 weeks' },
  { key: 'northamerica', label: 'USA / Canada', emoji: '🗽', examples: 'New York, Toronto, Vancouver', level: 5, time: 'Varies widely — interview slots can take weeks to months' },
] as const;

export const HISTORY = [
  { key: 'none', label: 'First time abroad', emoji: '🆕', blurb: 'No previous foreign travel' },
  { key: 'regional', label: 'Asia / India / Middle East', emoji: '🧭', blurb: 'Visited nearby countries before' },
  { key: 'strong', label: 'UK, USA, Canada, Schengen…', emoji: '🌍', blurb: 'Held a visa for a “strong” country' },
] as const;

export const STATUSES = [
  { key: 'job', label: 'Job holder', emoji: '🧑‍💼' },
  { key: 'business', label: 'Business owner', emoji: '🏢' },
  { key: 'student', label: 'Student', emoji: '📚' },
  { key: 'other', label: 'Homemaker / retired / other', emoji: '🏠' },
] as const;

export type PurposeKey = (typeof PURPOSES)[number]['key'];
export type RegionKey = (typeof REGIONS)[number]['key'];
export type HistoryKey = (typeof HISTORY)[number]['key'];
export type StatusKey = (typeof STATUSES)[number]['key'];

export type GuideAnswers = { purpose: PurposeKey; region: RegionKey; history: HistoryKey; status: StatusKey };

const COMMON_DOCS = [
  'Passport valid for at least 6 months (plus old passports, if any)',
  'Recent photos to the embassy’s size and background rules',
  'National ID card / birth certificate',
  'Personal bank statement (usually last 6 months) and solvency certificate',
];

const PURPOSE_DOCS: Record<PurposeKey, string[]> = {
  tourist: ['Hotel booking and return air ticket reservation', 'Day-by-day travel itinerary', 'Travel insurance (mandatory for Schengen)'],
  student: [
    'Admission / offer letter from the university',
    'Academic certificates and transcripts',
    'English test result (IELTS / PTE / Duolingo, as required)',
    'Sponsor’s financial documents and income proof',
    'Statement of purpose / study plan',
  ],
  worker: [
    'Job offer / employment contract from a verified employer',
    'Work permit or visa approval issued by the destination country',
    'BMET clearance & smart card (for Bangladeshi workers)',
    'Medical fitness test from an approved centre',
    'Police clearance certificate',
  ],
  business: ['Invitation letter from the host company', 'Trade licence and company documents', 'Visiting card and company letterhead'],
  medical: ['Hospital appointment / invitation letter', 'Previous medical reports and doctor’s referral', 'Attendant’s documents (if someone travels with you)'],
  family: ['Invitation letter from your relative', 'Their passport / residence permit copy', 'Proof of relationship (birth or marriage certificate)'],
};

const STATUS_DOCS: Record<StatusKey, string[]> = {
  job: ['No-objection certificate (NOC) from employer', 'Salary certificate / recent payslips'],
  business: ['Trade licence (renewed)', 'TIN certificate and latest tax return'],
  student: ['Student ID card', 'NOC / leave letter from your institution'],
  other: ['Sponsor’s letter, ID and financial documents (if someone supports your trip)'],
};

export type GuideResult = {
  level: number; // 1 (easier) – 5 (strict)
  levelLabel: string;
  timeline: string;
  documents: string[];
  steps: { title: string; text: string }[];
  tips: string[];
  visaLink: string;
};

export function buildGuide(a: GuideAnswers): GuideResult {
  const region = REGIONS.find((r) => r.key === a.region)!;
  let level: number = region.level;
  if (a.history === 'none' && level >= 3) level += 1;
  if (a.history === 'strong') level -= 1;
  level = Math.min(5, Math.max(1, level));
  const levelLabel = level <= 2 ? 'Easier' : level === 3 ? 'Moderate' : 'Strict — prepare carefully';

  const steps: GuideResult['steps'] = [{ title: 'Free consultation', text: 'Share your profile with us — we check eligibility and the right visa type.' }];
  if (a.purpose === 'student') steps.push({ title: 'University & offer letter', text: 'Shortlist universities, apply and receive your admission / offer letter.' });
  if (a.purpose === 'worker') steps.push({ title: 'Verify job & employer', text: 'Confirm the employer and work permit are genuine, then complete BMET registration.' });
  steps.push(
    { title: 'Prepare documents', text: 'We give you a personal checklist, review every paper and arrange bookings and insurance.' },
    { title: level >= 4 ? 'Appointment & biometrics' : 'Submit application', text: level >= 4 ? 'Book the embassy / VFS appointment and give fingerprints; some visas need an interview.' : 'We file your application online or at the embassy and track it for you.' },
    { title: 'Visa decision & travel', text: 'Once approved, we sort tickets, hotel, travel eSIM and airport pick-up.' },
  );

  const tips: string[] = [];
  if (a.history === 'none' && level >= 4) tips.push('First trip abroad? Building travel history with easier visas (Thailand, Malaysia, India) first can strengthen future applications to strict countries.');
  if (a.history === 'strong') tips.push('Your previous visas are a strong point — include copies of them with your application.');
  if (a.purpose === 'worker') tips.push('Never pay anyone who “guarantees” a work visa. Verify the employer and visa with BMET and the embassy before paying.');
  if (a.purpose === 'student') tips.push('Start 6–9 months before your intake — offer letters, tests and visa queues all take time.');
  if (a.status === 'other') tips.push('Without your own income, a sponsor’s documents and clear ties to Bangladesh (family, property) are important.');
  if (a.purpose === 'tourist' && level >= 4) tips.push('Show strong ties to Bangladesh: steady income, job or business, family and a clear return plan.');
  tips.push('Make sure your bank statement shows steady transactions — sudden large deposits raise questions.');

  const visaQuery: Record<RegionKey, string> = { asia: 'Thailand', india: 'India', gulf: 'Dubai', eastasia: '', europe: 'Schengen', uk: '', oceania: '', northamerica: '' };

  return {
    level,
    levelLabel,
    timeline: region.time,
    documents: [...COMMON_DOCS, ...PURPOSE_DOCS[a.purpose], ...STATUS_DOCS[a.status]],
    steps,
    tips,
    visaLink: visaQuery[a.region] ? `/visa?q=${encodeURIComponent(visaQuery[a.region])}` : '/visa',
  };
}
