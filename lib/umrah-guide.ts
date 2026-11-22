/**
 * Umrah A–Z guide content in English and Bangla.
 * General, widely-followed guidance — the page tells pilgrims to follow their muallim / a scholar for detailed masail.
 */
import type { Locale } from '@/lib/i18n';

type L = { en: string; bn: string };
const l = (en: string, bn: string): L => ({ en, bn });
export const pick = (v: L, locale: Locale) => v[locale];

export type GuideStep = { place: L; title: L; doThis: L[]; dua?: { arabic: string; meaning: L } };

/** Ihram: what to do and what is forbidden. */
export const IHRAM = {
  before: [
    l('Clip nails, trim hair and take a bath (ghusl) before Ihram.', 'ইহরামের আগে নখ কাটা, অবাঞ্ছিত চুল পরিষ্কার করা ও গোসল করা।'),
    l('Men wear two white unstitched sheets (izar and rida); women wear normal modest clothing.', 'পুরুষরা দুটি সাদা সেলাইবিহীন কাপড় (ইযার ও রিদা) পরবেন; নারীরা স্বাভাবিক শালীন পোশাক পরবেন।'),
    l('Men may use perfume on the body before the niyyah — not on the Ihram cloth.', 'নিয়তের আগে পুরুষরা শরীরে আতর ব্যবহার করতে পারেন — ইহরামের কাপড়ে নয়।'),
    l('Make the niyyah for Umrah before crossing the Miqat — on flights from Bangladesh this is usually announced before landing in Jeddah.', 'মীকাত অতিক্রমের আগে উমরাহর নিয়ত করুন — বাংলাদেশ থেকে ফ্লাইটে সাধারণত জেদ্দায় নামার আগে ঘোষণা দেওয়া হয়।'),
  ],
  forbidden: [
    l('Cutting hair or nails', 'চুল বা নখ কাটা'),
    l('Using perfume or scented soap', 'আতর বা সুগন্ধি সাবান ব্যবহার'),
    l('Marital relations, and arguing or bad speech', 'স্বামী-স্ত্রীর মিলন এবং ঝগড়া-বিবাদ বা খারাপ কথা'),
    l('Hunting or harming animals', 'শিকার করা বা প্রাণীকে কষ্ট দেওয়া'),
    l('Men: stitched clothes and covering the head', 'পুরুষ: সেলাই করা পোশাক পরা ও মাথা ঢাকা'),
    l('Women: niqab (face cover tied on the face) and gloves', 'নারী: মুখে বাঁধা নিকাব ও হাতমোজা'),
  ],
  talbiyah: {
    arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
    transliteration: 'Labbaik Allahumma labbaik, labbaika la sharika laka labbaik, innal-hamda wan-ni‘mata laka wal-mulk, la sharika lak.',
    meaning: l('Here I am, O Allah, here I am. You have no partner, here I am. All praise, blessings and dominion are Yours. You have no partner.', 'আমি হাজির, হে আল্লাহ, আমি হাজির। আপনার কোনো শরীক নেই, আমি হাজির। নিশ্চয়ই সকল প্রশংসা, নিয়ামত ও রাজত্ব আপনারই। আপনার কোনো শরীক নেই।'),
  },
};

/** The four core acts of Umrah, place by place. */
export const UMRAH_STEPS: GuideStep[] = [
  {
    place: l('At the Miqat', 'মীকাতে'),
    title: l('Ihram & niyyah', 'ইহরাম ও নিয়ত'),
    doThis: [
      l('Wear Ihram, pray two rak‘ah if it is not a forbidden time, and make the niyyah for Umrah.', 'ইহরাম পরুন, নিষিদ্ধ সময় না হলে দুই রাকাত নামাজ পড়ুন এবং উমরাহর নিয়ত করুন।'),
      l('Start reciting the Talbiyah (men aloud, women quietly) and keep reciting until you start Tawaf.', 'তালবিয়া পড়া শুরু করুন (পুরুষ উচ্চস্বরে, নারী নিচু স্বরে) এবং তাওয়াফ শুরু পর্যন্ত পড়তে থাকুন।'),
    ],
    dua: { arabic: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً', meaning: l('O Allah, here I am for Umrah.', 'হে আল্লাহ, আমি উমরাহর জন্য হাজির।') },
  },
  {
    place: l('Masjid al-Haram — around the Kaaba', 'মসজিদুল হারাম — কাবা শরীফের চারপাশে'),
    title: l('Tawaf — 7 rounds', 'তাওয়াফ — ৭ চক্কর'),
    doThis: [
      l('Enter with the right foot and the dua for entering the masjid. Have wudu.', 'ডান পা দিয়ে মসজিদে প্রবেশের দোয়া পড়ে ঢুকুন। অজু অবস্থায় থাকুন।'),
      l('Men uncover the right shoulder (idtiba) for the whole Tawaf.', 'পুরুষরা পুরো তাওয়াফে ডান কাঁধ খোলা রাখবেন (ইযতিবা)।'),
      l('Start at the Black Stone (Hajar al-Aswad): face it, raise the right hand and say “Bismillahi Allahu Akbar”.', 'হাজরে আসওয়াদ থেকে শুরু করুন: সেদিকে মুখ করে ডান হাত তুলে “বিসমিল্লাহি আল্লাহু আকবার” বলুন।'),
      l('Walk 7 rounds anti-clockwise. Men walk briskly (raml) in the first 3 rounds if possible.', 'ঘড়ির কাঁটার উল্টো দিকে ৭ চক্কর দিন। সম্ভব হলে পুরুষরা প্রথম ৩ চক্করে দ্রুত হাঁটবেন (রমল)।'),
      l('Make any dua in your own language; between the Yemeni Corner and the Black Stone recite the dua below.', 'নিজের ভাষায় যেকোনো দোয়া করুন; রুকনে ইয়ামানি ও হাজরে আসওয়াদের মাঝে নিচের দোয়াটি পড়ুন।'),
    ],
    dua: {
      arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      meaning: l('Our Lord, give us good in this world and good in the Hereafter, and save us from the punishment of the Fire.', 'হে আমাদের রব, আমাদের দুনিয়াতে কল্যাণ দিন, আখিরাতে কল্যাণ দিন এবং জাহান্নামের আযাব থেকে রক্ষা করুন।'),
    },
  },
  {
    place: l('Behind Maqam Ibrahim & at Zamzam', 'মাকামে ইব্রাহিমের পেছনে ও জমজমে'),
    title: l('Two rak‘ah & Zamzam', 'দুই রাকাত নামাজ ও জমজম'),
    doThis: [
      l('Cover the right shoulder again and pray two rak‘ah behind Maqam Ibrahim if possible (anywhere in the masjid is fine when crowded).', 'আবার ডান কাঁধ ঢেকে সম্ভব হলে মাকামে ইব্রাহিমের পেছনে দুই রাকাত নামাজ পড়ুন (ভিড় থাকলে মসজিদের যেকোনো জায়গায়)।'),
      l('It is sunnah to recite Surah al-Kafirun and Surah al-Ikhlas.', 'সূরা কাফিরূন ও সূরা ইখলাস পড়া সুন্নাত।'),
      l('Drink Zamzam water and make dua.', 'জমজমের পানি পান করুন এবং দোয়া করুন।'),
    ],
  },
  {
    place: l('Between Safa and Marwah (Mas‘a)', 'সাফা ও মারওয়ার মাঝে (মাসআ)'),
    title: l('Sa‘i — 7 laps', 'সাঈ — ৭ বার'),
    doThis: [
      l('Go up Safa, face the Kaaba, raise your hands and make dua.', 'সাফা পাহাড়ে উঠে কাবার দিকে মুখ করে হাত তুলে দোয়া করুন।'),
      l('Walk to Marwah — that is one lap; Marwah back to Safa is the second. Finish the 7th lap at Marwah.', 'মারওয়া পর্যন্ত হাঁটুন — এটি এক বার; মারওয়া থেকে সাফা দ্বিতীয় বার। ৭ম বার মারওয়ায় শেষ হবে।'),
      l('Men walk briskly between the green lights.', 'সবুজ বাতির মাঝখানে পুরুষরা দ্রুত হাঁটবেন।'),
      l('Wudu is recommended but not required for Sa‘i.', 'সাঈর জন্য অজু উত্তম, তবে বাধ্যতামূলক নয়।'),
    ],
    dua: { arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ', meaning: l('Indeed, Safa and Marwah are among the symbols of Allah (recited when first approaching Safa).', 'নিশ্চয়ই সাফা ও মারওয়া আল্লাহর নিদর্শনসমূহের অন্তর্ভুক্ত (প্রথমবার সাফার কাছে গিয়ে পড়ুন)।') },
  },
  {
    place: l('After Sa‘i', 'সাঈর পরে'),
    title: l('Halq or Taqsir', 'হলক বা কসর'),
    doThis: [
      l('Men shave the head (better) or trim the hair evenly; women cut a fingertip’s length from the end of their hair.', 'পুরুষরা মাথা মুণ্ডন করবেন (উত্তম) বা চুল সমানভাবে ছাঁটবেন; নারীরা চুলের আগা থেকে আঙুলের এক কর পরিমাণ কাটবেন।'),
      l('Your Umrah is complete — all Ihram restrictions are lifted. Alhamdulillah!', 'আপনার উমরাহ সম্পন্ন — ইহরামের সব নিষেধাজ্ঞা শেষ। আলহামদুলিল্লাহ!'),
    ],
  },
];

/** Recommended deeds in each holy city. */
export const AMAL = {
  makkah: [
    l('Pray the five daily prayers in Masjid al-Haram — one prayer there is worth 100,000 elsewhere.', 'মসজিদুল হারামে পাঁচ ওয়াক্ত নামাজ পড়ুন — সেখানে এক নামাজ অন্য জায়গার এক লাখ নামাজের সমান।'),
    l('Do extra (nafl) Tawaf as often as you can — no Ihram needed.', 'যত বেশি সম্ভব নফল তাওয়াফ করুন — এর জন্য ইহরাম লাগে না।'),
    l('Drink Zamzam often and make dua with it.', 'বারবার জমজম পান করুন ও দোয়া করুন।'),
    l('Spend time in Qur’an recitation, dhikr and dua, especially near the Multazam.', 'কুরআন তিলাওয়াত, যিকির ও দোয়ায় সময় দিন, বিশেষ করে মুলতাযামের কাছে।'),
    l('Before leaving Makkah, perform the farewell Tawaf (Tawaf al-Wida) — recommended after Umrah.', 'মক্কা ছাড়ার আগে বিদায়ী তাওয়াফ (তাওয়াফুল বিদা) করুন — উমরাহর পরে এটি উত্তম।'),
  ],
  madinah: [
    l('Visiting Masjid an-Nabawi is a sunnah of its own (not part of Umrah). Enter with the right foot and pray two rak‘ah.', 'মসজিদে নববী জিয়ারত আলাদা সুন্নাত (উমরাহর অংশ নয়)। ডান পা দিয়ে ঢুকে দুই রাকাত নামাজ পড়ুন।'),
    l('Pray in the Rawdah (between the minbar and the Prophet’s ﷺ house) — book the slot in the Nusuk app.', 'রওজাতে নামাজ পড়ুন (মিম্বার ও রাসূল ﷺ-এর ঘরের মাঝখানে) — নুসুক অ্যাপে স্লট বুক করুন।'),
    l('Send salam to the Prophet ﷺ, then to Abu Bakr and Umar (may Allah be pleased with them), respectfully and quietly.', 'রাসূল ﷺ-কে সালাম দিন, তারপর আবু বকর ও উমর (রাদিয়াল্লাহু আনহুমা)-কে — আদবের সাথে, নিচু স্বরে।'),
    l('Visit Jannatul Baqi and make dua for the believers buried there.', 'জান্নাতুল বাকি জিয়ারত করে সেখানে শায়িতদের জন্য দোয়া করুন।'),
    l('Pray two rak‘ah in Masjid Quba — the reward is like that of an Umrah.', 'মসজিদে কুবায় দুই রাকাত নামাজ পড়ুন — এর সওয়াব একটি উমরাহর মতো।'),
  ],
};

export type ZiyaratPlace = { name: L; about: L };

export const ZIYARAT: { city: 'makkah' | 'madinah' | 'taif'; label: L; places: ZiyaratPlace[] }[] = [
  {
    city: 'makkah',
    label: l('Makkah', 'মক্কা'),
    places: [
      { name: l('Jabal al-Nour (Cave Hira)', 'জাবালে নূর (হেরা গুহা)'), about: l('Where the first revelation of the Qur’an came to the Prophet ﷺ.', 'যেখানে রাসূল ﷺ-এর উপর প্রথম কুরআন নাযিল হয়।') },
      { name: l('Jabal Thawr', 'জাবালে সওর'), about: l('The cave where the Prophet ﷺ and Abu Bakr sheltered during the Hijrah.', 'হিজরতের সময় রাসূল ﷺ ও আবু বকর (রা.) যে গুহায় আশ্রয় নিয়েছিলেন।') },
      { name: l('Arafat & Jabal al-Rahmah', 'আরাফাত ও জাবালে রহমত'), about: l('The plain where pilgrims stand on the Day of Arafah during Hajj.', 'হজের সময় আরাফার দিনে হাজিরা যে ময়দানে অবস্থান করেন।') },
      { name: l('Mina & Muzdalifah', 'মিনা ও মুজদালিফা'), about: l('The tent city and open plain of the Hajj rituals.', 'হজের আনুষ্ঠানিকতার তাঁবুর শহর ও খোলা ময়দান।') },
      { name: l('Jannatul Mu‘alla', 'জান্নাতুল মুআল্লা'), about: l('Historic graveyard where Khadijah (ra) is buried.', 'ঐতিহাসিক কবরস্থান, যেখানে খাদিজা (রা.) শায়িত।') },
      { name: l('Masjid Aisha (Tan‘im)', 'মসজিদে আয়েশা (তানঈম)'), about: l('The nearest Miqat for those in Makkah who wish to do another Umrah.', 'মক্কায় থেকে আরেকটি উমরাহ করতে চাইলে নিকটতম মীকাত।') },
    ],
  },
  {
    city: 'madinah',
    label: l('Madinah', 'মদিনা'),
    places: [
      { name: l('Masjid Quba', 'মসজিদে কুবা'), about: l('The first masjid built in Islam.', 'ইসলামের প্রথম নির্মিত মসজিদ।') },
      { name: l('Mount Uhud & martyrs’ graves', 'উহুদ পাহাড় ও শহীদদের কবর'), about: l('Site of the Battle of Uhud; Hamzah (ra) is buried here.', 'উহুদ যুদ্ধের স্থান; এখানে হামজা (রা.) শায়িত।') },
      { name: l('Masjid al-Qiblatain', 'মসজিদে কিবলাতাইন'), about: l('Where the qiblah was changed from Jerusalem to Makkah.', 'যেখানে কিবলা বায়তুল মুকাদ্দাস থেকে মক্কার দিকে পরিবর্তিত হয়।') },
      { name: l('Jannatul Baqi', 'জান্নাতুল বাকি'), about: l('Graveyard of many Companions and family of the Prophet ﷺ.', 'অনেক সাহাবি ও রাসূল ﷺ-এর পরিবারের সদস্যদের কবরস্থান।') },
      { name: l('Site of the Battle of the Trench (Khandaq)', 'খন্দকের যুদ্ধের স্থান'), about: l('Area of the Seven Mosques near Mount Sal‘.', 'সালা পাহাড়ের কাছে সাত মসজিদ এলাকা।') },
    ],
  },
  {
    city: 'taif',
    label: l('Taif (day trip)', 'তায়েফ (একদিনের ভ্রমণ)'),
    places: [
      { name: l('Masjid Abdullah ibn Abbas', 'মসজিদে আব্দুল্লাহ ইবনে আব্বাস'), about: l('Historic masjid in the city centre.', 'শহরের কেন্দ্রে ঐতিহাসিক মসজিদ।') },
      { name: l('Qarn al-Manazil (Masjid al-Sayl)', 'কারনুল মানাজিল (মসজিদে সাইল)'), about: l('One of the Miqats — you can enter Ihram here for another Umrah.', 'মীকাতগুলোর একটি — এখান থেকে আরেকটি উমরাহর জন্য ইহরাম বাঁধা যায়।') },
      { name: l('Al-Hada mountain road & rose farms', 'আল-হাদা পাহাড়ি রাস্তা ও গোলাপ বাগান'), about: l('Cool mountain air and Taif’s famous roses.', 'শীতল পাহাড়ি বাতাস ও তায়েফের বিখ্যাত গোলাপ।') },
    ],
  },
];

export const DOCUMENTS: L[] = [
  l('Passport valid for at least 6 months', 'কমপক্ষে ৬ মাস মেয়াদি পাসপোর্ট'),
  l('Recent photo with white background', 'সাদা ব্যাকগ্রাউন্ডের সাম্প্রতিক ছবি'),
  l('National ID card copy', 'জাতীয় পরিচয়পত্রের কপি'),
  l('Meningitis (ACWY) vaccination certificate', 'মেনিনজাইটিস (ACWY) টিকার সনদ'),
  l('For family travel: marriage / birth certificate copies', 'পরিবারসহ গেলে: বিবাহ / জন্ম সনদের কপি'),
];

export const PACKING: L[] = [
  l('Ihram set ×2 (men) and Ihram belt', 'ইহরামের কাপড় ২ সেট (পুরুষ) ও ইহরাম বেল্ট'),
  l('Comfortable sandals', 'আরামদায়ক স্যান্ডেল'),
  l('Unscented soap, shampoo & deodorant', 'সুগন্ধিহীন সাবান, শ্যাম্পু ও ডিওডোরেন্ট'),
  l('Small backpack and shoe bag', 'ছোট ব্যাকপ্যাক ও জুতার ব্যাগ'),
  l('Personal medicines', 'ব্যক্তিগত ওষুধ'),
  l('Pocket Qur’an / dua book', 'পকেট কুরআন / দোয়ার বই'),
  l('Power bank & plug adapter (type G)', 'পাওয়ার ব্যাংক ও প্লাগ অ্যাডাপ্টার (টাইপ G)'),
  l('Photocopies of passport, visa & tickets', 'পাসপোর্ট, ভিসা ও টিকেটের ফটোকপি'),
];

export const FAQ: { q: L; a: L }[] = [
  { q: l('When is the best time for Umrah?', 'উমরাহর জন্য সেরা সময় কখন?'), a: l('All year except the days of Hajj. Ramadan and school holidays are busiest and most expensive; winter months are cooler and often better value.', 'হজের দিনগুলো ছাড়া সারা বছর। রমজান ও স্কুল ছুটিতে ভিড় ও খরচ বেশি; শীতকালে আবহাওয়া আরামদায়ক এবং খরচও তুলনামূলক কম।') },
  { q: l('What if a woman has her period?', 'নারীর হায়েজ হলে কী করবেন?'), a: l('She stays in Ihram and does everything except Tawaf until she is clean, then completes Tawaf and Sa‘i. Your muallim will guide you.', 'তিনি ইহরাম অবস্থায় থাকবেন এবং পবিত্র হওয়া পর্যন্ত তাওয়াফ ছাড়া সব করতে পারবেন, তারপর তাওয়াফ ও সাঈ সম্পন্ন করবেন। আপনার মুয়াল্লিম গাইড করবেন।') },
  { q: l('Can women travel without a mahram?', 'মাহরাম ছাড়া নারীরা যেতে পারবেন?'), a: l('Saudi rules on this have changed in recent years. Our team will explain the current requirements for your case.', 'এ বিষয়ে সৌদি নিয়ম সাম্প্রতিক বছরগুলোতে পরিবর্তিত হয়েছে। আপনার ক্ষেত্রে বর্তমান নিয়ম আমাদের টিম জানিয়ে দেবে।') },
  { q: l('How early should I book?', 'কত আগে বুক করা উচিত?'), a: l('At least 3–4 weeks ahead normally, and 2–3 months ahead for Ramadan or holidays.', 'সাধারণত অন্তত ৩–৪ সপ্তাহ আগে, আর রমজান বা ছুটির সময় ২–৩ মাস আগে।') },
  { q: l('Is the online price final?', 'অনলাইনের দামই কি চূড়ান্ত?'), a: l('No — it is an estimate. Airline fares and hotel prices change with dates; we confirm the final price before you pay.', 'না — এটি আনুমানিক। তারিখ অনুযায়ী এয়ারলাইন ও হোটেলের দাম বদলায়; পেমেন্টের আগে আমরা চূড়ান্ত দাম নিশ্চিত করি।') },
];
