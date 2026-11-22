import type { ListingDetails } from '@/lib/listing-details';

/**
 * SAMPLE detail sections for the starter listings (keyed by slug). Fees, timings and document
 * lists are illustrative — check them against current embassy rules and edit from the admin panel.
 */
export const seedDetails: Record<string, ListingDetails> = {
  /* ------------------------------ Tours ------------------------------ */
  'bali-your-way': {
    facts: [
      { label: 'Route', value: 'Dhaka → Denpasar (via Kuala Lumpur / Singapore)' },
      { label: 'Stay', value: '3 nights Ubud + 2 nights Nusa Dua' },
      { label: 'Hotel', value: '4-star, twin/double sharing' },
      { label: 'Meals', value: 'Daily breakfast' },
      { label: 'Transport', value: 'Private AC car with driver-guide' },
      { label: 'Group', value: 'Private — just your family / friends' },
    ],
    itinerary: [
      { title: 'Day 1 — Arrive in Bali, transfer to Ubud', text: 'Meet our driver at Ngurah Rai airport and drive (~1.5 h) up to Ubud. Check in and rest; evening walk around Ubud market and the palace.', meta: [{ label: 'Stay', value: 'Ubud' }, { label: 'Transport', value: 'Private car' }] },
      { title: 'Day 2 — Kintamani volcano & rice terraces', text: 'Full-day tour: Tegalalang rice terraces, a coffee plantation, lunch with a view of Mount Batur at Kintamani, then the Tirta Empul water temple.', meta: [{ label: 'Meals', value: 'Breakfast' }, { label: 'Stay', value: 'Ubud' }] },
      { title: 'Day 3 — Free day in Ubud', text: 'Slow morning, Monkey Forest, cafés and art shops. Optional: Bali swing, spa or a cooking class (ask us to add it).', meta: [{ label: 'Meals', value: 'Breakfast' }, { label: 'Stay', value: 'Ubud' }] },
      { title: 'Day 4 — To Nusa Dua via Uluwatu', text: 'Check out and drive south. Afternoon at Uluwatu cliff temple, Kecak fire dance at sunset, seafood dinner at Jimbaran beach (own cost).', meta: [{ label: 'Meals', value: 'Breakfast' }, { label: 'Stay', value: 'Nusa Dua' }] },
      { title: 'Day 5 — Beach day', text: 'Free day at the beach. Optional water sports at Tanjung Benoa — parasailing, banana boat, sea walk.', meta: [{ label: 'Meals', value: 'Breakfast' }, { label: 'Stay', value: 'Nusa Dua' }] },
      { title: 'Day 6 — Departure', text: 'Breakfast, check out and private transfer to the airport for your flight home.', meta: [{ label: 'Meals', value: 'Breakfast' }] },
    ],
    excluded: ['Air ticket (we can book it separately)', 'Indonesia visa on arrival fee', 'Lunch and dinner', 'Optional activities and entry tickets not mentioned', 'Tips and personal expenses'],
    faqs: [
      { title: 'Do Bangladeshi passport holders need a visa for Bali?', text: 'Yes. Indonesia offers visa on arrival / e-VOA for Bangladeshi passports. We prepare the paperwork and tell you the latest fee before you travel.' },
      { title: 'Can I change the hotels or number of nights?', text: 'Yes — this is a private tour, so we can upgrade hotels, add nights or swap activities. The price is updated accordingly.' },
    ],
  },
  'maldives-unhurried': {
    facts: [
      { label: 'Route', value: 'Dhaka → Malé (direct or via Colombo)' },
      { label: 'Stay', value: '3 nights resort — beach or water villa' },
      { label: 'Meals', value: 'Full board (breakfast, lunch, dinner)' },
      { label: 'Transport', value: 'Shared speedboat transfers' },
    ],
    itinerary: [
      { title: 'Day 1 — Arrive in Malé, speedboat to resort', text: 'Our representative meets you at Velana airport for the speedboat to your resort. Check in, welcome drink and sunset on the beach.', meta: [{ label: 'Meals', value: 'Dinner' }, { label: 'Stay', value: 'Resort' }] },
      { title: 'Day 2 — Snorkelling & sandbank picnic', text: 'Morning snorkelling trip to the house reef. Afternoon sandbank picnic, then free time.', meta: [{ label: 'Meals', value: 'Full board' }, { label: 'Stay', value: 'Resort' }] },
      { title: 'Day 3 — Free day', text: 'Relax, swim, spa or book a dolphin-watching cruise.', meta: [{ label: 'Meals', value: 'Full board' }, { label: 'Stay', value: 'Resort' }] },
      { title: 'Day 4 — Departure', text: 'Breakfast and speedboat back to the airport.', meta: [{ label: 'Meals', value: 'Breakfast' }] },
    ],
    excluded: ['Air ticket', 'Green tax and resort taxes (if not mentioned)', 'Drinks and minibar', 'Spa and optional excursions'],
  },
  'kashmir-in-bloom': {
    facts: [
      { label: 'Route', value: 'Dhaka → Kolkata/Delhi → Srinagar' },
      { label: 'Stay', value: 'Srinagar 3N (1N houseboat) · Pahalgam 2N' },
      { label: 'Hotel', value: '3-star hotels + deluxe houseboat' },
      { label: 'Meals', value: 'Breakfast & dinner' },
      { label: 'Transport', value: 'Private car for all sightseeing' },
    ],
    itinerary: [
      { title: 'Day 1 — Arrive Srinagar, shikara ride', text: 'Pickup from Srinagar airport, check in to your houseboat on Dal Lake. Evening shikara ride at sunset.', meta: [{ label: 'Meals', value: 'Dinner' }, { label: 'Stay', value: 'Houseboat' }] },
      { title: 'Day 2 — Srinagar Mughal gardens', text: 'Nishat Bagh, Shalimar Bagh, Chashme Shahi and the old city. Move to hotel.', meta: [{ label: 'Meals', value: 'Breakfast, dinner' }, { label: 'Stay', value: 'Srinagar' }] },
      { title: 'Day 3 — Day trip to Gulmarg', text: 'Drive (~2 h) to Gulmarg. Ride the Gondola (ticket own cost) up to Kongdori for snow views.', meta: [{ label: 'Meals', value: 'Breakfast, dinner' }, { label: 'Stay', value: 'Srinagar' }] },
      { title: 'Day 4 — To Pahalgam', text: 'Drive to Pahalgam via saffron fields and Avantipura ruins. Evening by the Lidder river.', meta: [{ label: 'Meals', value: 'Breakfast, dinner' }, { label: 'Stay', value: 'Pahalgam' }] },
      { title: 'Day 5 — Aru, Betaab & Chandanwari valleys', text: 'Local union taxi to the three valleys (own cost, paid locally).', meta: [{ label: 'Meals', value: 'Breakfast, dinner' }, { label: 'Stay', value: 'Pahalgam' }] },
      { title: 'Day 6 — Departure', text: 'Drive back to Srinagar airport for your flight.', meta: [{ label: 'Meals', value: 'Breakfast' }] },
    ],
    excluded: ['Air/train tickets', 'Indian visa fee', 'Gondola tickets, pony rides and local union taxis', 'Lunch'],
  },
  'dubai-after-dark': {
    facts: [
      { label: 'Route', value: 'Dhaka → Dubai (direct)' },
      { label: 'Stay', value: '4 nights in Dubai' },
      { label: 'Hotel', value: '4-star near metro, breakfast included' },
      { label: 'Transport', value: 'Shared transfers on tours, private airport transfers' },
      { label: 'Visa', value: '30-day tourist visa processing included' },
    ],
    itinerary: [
      { title: 'Day 1 — Arrive Dubai', text: 'Airport pickup, hotel check-in. Evening free — Dubai Mall & fountain show.', meta: [{ label: 'Stay', value: 'Dubai' }] },
      { title: 'Day 2 — City tour + Burj Khalifa', text: 'Half-day city tour (Jumeirah Mosque, Burj Al Arab photo stop, Palm Jumeirah). Evening Burj Khalifa 124th floor.', meta: [{ label: 'Meals', value: 'Breakfast' }, { label: 'Stay', value: 'Dubai' }] },
      { title: 'Day 3 — Desert safari with BBQ dinner', text: 'Afternoon pickup for dune bashing, camel ride, sandboarding and BBQ dinner with live shows.', meta: [{ label: 'Meals', value: 'Breakfast, BBQ dinner' }, { label: 'Stay', value: 'Dubai' }] },
      { title: 'Day 4 — Marina dhow cruise', text: 'Free day for shopping. Night dhow cruise with dinner at Dubai Marina.', meta: [{ label: 'Meals', value: 'Breakfast, dinner' }, { label: 'Stay', value: 'Dubai' }] },
      { title: 'Day 5 — Departure', text: 'Check out and transfer to the airport.', meta: [{ label: 'Meals', value: 'Breakfast' }] },
    ],
    excluded: ['Air ticket', 'Tourism Dirham fee (paid at hotel)', 'Lunch', 'Personal shopping'],
  },
  'thailand-island-hop': {
    facts: [
      { label: 'Route', value: 'Dhaka → Bangkok → Phuket' },
      { label: 'Stay', value: 'Phuket 3N + Krabi 2N' },
      { label: 'Hotel', value: '3–4 star with breakfast' },
      { label: 'Transport', value: 'Shared transfers + ferry Phuket → Krabi' },
    ],
    itinerary: [
      { title: 'Day 1 — Arrive Phuket', text: 'Airport pickup, hotel check-in near Patong. Evening at Bangla Road.', meta: [{ label: 'Stay', value: 'Phuket' }] },
      { title: 'Day 2 — Phi Phi islands by speedboat', text: 'Maya Bay, Pileh Lagoon, snorkelling and lunch on Phi Phi Don.', meta: [{ label: 'Meals', value: 'Breakfast, lunch' }, { label: 'Stay', value: 'Phuket' }] },
      { title: 'Day 3 — Phuket city tour', text: 'Big Buddha, Wat Chalong, Karon viewpoint and Old Phuket Town.', meta: [{ label: 'Meals', value: 'Breakfast' }, { label: 'Stay', value: 'Phuket' }] },
      { title: 'Day 4 — Ferry to Krabi', text: 'Morning ferry to Krabi (Ao Nang). Afternoon on the beach.', meta: [{ label: 'Transport', value: 'Ferry' }, { label: 'Stay', value: 'Krabi' }] },
      { title: 'Day 5 — 4-island hopping', text: 'Longtail boat to Phra Nang Cave, Chicken Island, Tup Island and Poda Island.', meta: [{ label: 'Meals', value: 'Breakfast, lunch' }, { label: 'Stay', value: 'Krabi' }] },
      { title: 'Day 6 — Departure', text: 'Transfer to Krabi airport.', meta: [{ label: 'Meals', value: 'Breakfast' }] },
    ],
    excluded: ['Air tickets', 'Thailand visa fee', 'National park fees', 'Dinners'],
  },
  'sajek-coxs-bazar': {
    facts: [
      { label: 'Start', value: 'Dhaka (night bus departure)' },
      { label: 'Stay', value: 'Sajek 1N + Cox’s Bazar 2N' },
      { label: 'Transport', value: 'AC bus + jeep (chander gari) in Sajek' },
      { label: 'Meals', value: 'All meals during the tour' },
      { label: 'Guide', value: 'Local tour guide throughout' },
    ],
    itinerary: [
      { title: 'Night 0 — Leave Dhaka', text: 'Board the AC night bus to Khagrachari (~8 h).', meta: [{ label: 'Transport', value: 'AC bus' }] },
      { title: 'Day 1 — Khagrachari → Sajek', text: 'Breakfast, then jeep ride through the hills to Sajek. Sunset at Konglak hill.', meta: [{ label: 'Meals', value: 'All meals' }, { label: 'Stay', value: 'Sajek resort' }] },
      { title: 'Day 2 — Sunrise above the clouds, on to Cox’s Bazar', text: 'Early sunrise point, then back to Khagrachari and AC bus to Cox’s Bazar.', meta: [{ label: 'Meals', value: 'All meals' }, { label: 'Stay', value: 'Cox’s Bazar' }] },
      { title: 'Day 3 — Marine Drive & Himchari', text: 'Marine Drive to Inani beach and Himchari waterfall. Evening at Laboni beach.', meta: [{ label: 'Meals', value: 'All meals' }, { label: 'Stay', value: 'Cox’s Bazar' }] },
      { title: 'Day 4 — Return to Dhaka', text: 'Free morning, night bus back to Dhaka.', meta: [{ label: 'Transport', value: 'AC bus' }] },
    ],
    excluded: ['Personal expenses and snacks', 'Entry tickets not mentioned'],
  },

  /* ------------------------------ Visas ------------------------------ */
  'dubai-tourist-visa': {
    facts: [
      { label: 'Visa type', value: 'Tourist e-visa' },
      { label: 'Entry', value: 'Single entry' },
      { label: 'Validity', value: '60 days from issue' },
      { label: 'Max stay', value: '30 days' },
      { label: 'Processing', value: '3–5 working days' },
      { label: 'Submission', value: 'Online — no embassy visit' },
    ],
    documentGroups: [
      { title: 'All applicants', items: ['Passport scan (min. 6 months validity, 2 blank pages)', 'Recent colour photo, white background', 'Bank statement — last 6 months', 'Confirmed return air ticket', 'Hotel booking'] },
      { title: 'Job holder', items: ['NOC from employer', 'Visiting card / office ID'] },
      { title: 'Business owner', items: ['Trade licence copy (with English translation)', 'Visiting card'] },
      { title: 'Student', items: ['Student ID card', 'Parents’ bank statement + sponsorship letter'] },
    ],
    steps: [
      { title: 'Send your documents', text: 'Share scans on WhatsApp / Messenger or visit our office. We check everything for free.' },
      { title: 'Pay and we file the application', text: 'Once the file is ready we submit it online the same day.' },
      { title: 'Track the status', text: 'We update you on WhatsApp as the application moves.' },
      { title: 'Receive your e-visa', text: 'The e-visa PDF arrives by email/WhatsApp. Print it and carry it with your passport.' },
    ],
    fees: [
      { label: 'Visa fee (government)', value: '৳ 10,000' },
      { label: 'Service charge', value: '৳ 2,500' },
      { label: 'Express processing (optional)', value: '+ ৳ 3,000' },
    ],
    excluded: ['Air ticket and hotel (we can book them)', 'Travel insurance', 'OK to board (if your airline needs it)'],
    faqs: [
      { title: 'Is the visa fee refundable if rejected?', text: 'No. The government fee and service charge are not refundable once the application is submitted.' },
      { title: 'Do I need to visit the embassy?', text: 'No — the UAE tourist visa is fully online.' },
    ],
  },
  'thailand-tourist-visa': {
    facts: [
      { label: 'Visa type', value: 'Tourist visa (TR)' },
      { label: 'Entry', value: 'Single entry' },
      { label: 'Validity', value: '3 months from issue' },
      { label: 'Max stay', value: '60 days' },
      { label: 'Processing', value: '7–10 working days' },
      { label: 'Submission', value: 'Thai e-Visa online + document upload' },
    ],
    documentGroups: [
      { title: 'All applicants', items: ['Passport (6+ months valid) + old passports', 'Photo 3.5 × 4.5 cm, white background', 'Bank solvency certificate (min. ৳ 1,50,000)', 'Bank statement — last 6 months', 'Return air ticket booking', 'Hotel booking for the whole stay', 'NID copy'] },
      { title: 'Job holder', items: ['NOC from employer', 'Last 3 months’ salary slips', 'Office ID card'] },
      { title: 'Business owner', items: ['Trade licence with notarised English translation', 'Company bank statement (optional)'] },
      { title: 'Student', items: ['Student ID + NOC from institution', 'Parents’ NOC and bank documents'] },
    ],
    steps: [
      { title: 'Free document check', text: 'We review your papers and tell you exactly what is missing.' },
      { title: 'Bookings & form', text: 'We prepare the hotel and flight bookings and fill the e-Visa form.' },
      { title: 'Submit & pay embassy fee', text: 'Application is submitted online and the fee paid.' },
      { title: 'Decision', text: 'Approved visa is emailed — we forward it to you with travel tips.' },
    ],
    fees: [
      { label: 'Embassy fee', value: '৳ 4,500' },
      { label: 'Service charge (file + bookings)', value: '৳ 2,000' },
    ],
    excluded: ['Real air ticket and hotel', 'Translation / notary costs'],
  },
  'malaysia-e-visa': {
    facts: [
      { label: 'Visa type', value: 'eVISA (tourist)' },
      { label: 'Entry', value: 'Single entry' },
      { label: 'Validity', value: '3 months from issue' },
      { label: 'Max stay', value: '30 days' },
      { label: 'Processing', value: '3–7 working days' },
    ],
    documentGroups: [
      { title: 'All applicants', items: ['Passport scan (bio page)', 'Recent photo, white background', 'Return flight itinerary', 'Hotel booking', 'Bank statement — last 3 months'] },
    ],
    steps: [
      { title: 'Send scans', text: 'Passport and photo on WhatsApp is enough to start.' },
      { title: 'We apply online', text: 'Form, uploads and payment handled by us.' },
      { title: 'Get your eVISA', text: 'Print the eVISA note and carry it at immigration.' },
    ],
    fees: [
      { label: 'eVISA + processing fee', value: '৳ 4,000' },
      { label: 'Service charge', value: '৳ 1,500' },
    ],
  },
  'schengen-visa-support': {
    facts: [
      { label: 'Visa type', value: 'Schengen short-stay (C)' },
      { label: 'Entry', value: 'Single / multiple (embassy decides)' },
      { label: 'Max stay', value: 'Up to 90 days in 180' },
      { label: 'Processing', value: '15–30 working days after biometrics' },
      { label: 'Submission', value: 'In person at VFS / embassy (biometrics)' },
    ],
    documentGroups: [
      { title: 'All applicants', items: ['Passport (3+ months beyond return, issued within 10 years) + old passports', 'Two photos 35 × 45 mm', 'Bank statement — 6 months, with solvency certificate', 'Travel insurance (min. €30,000 cover)', 'Flight reservation and hotel bookings', 'Day-by-day itinerary', 'Cover letter', 'Income tax return (TIN / IT-10B)'] },
      { title: 'Job holder', items: ['NOC + leave approval', 'Salary slips — 6 months', 'Employment contract / appointment letter'] },
      { title: 'Business owner', items: ['Trade licence (notarised translation)', 'Company bank statement — 6 months', 'Memorandum / partnership deed (if any)'] },
    ],
    steps: [
      { title: 'Consultation', text: 'We look at your travel history and finances and pick the right embassy.' },
      { title: 'File preparation', text: 'Cover letter, itinerary, insurance and reservations — all prepared by us.' },
      { title: 'Appointment booking', text: 'We book your VFS / embassy appointment slot.' },
      { title: 'Biometrics & submission', text: 'You visit for fingerprints; we brief you before the interview.' },
      { title: 'Decision & passport return', text: 'Collect your passport from VFS; we help with any next steps.' },
    ],
    fees: [
      { label: 'Embassy visa fee', value: '€90 (paid in BDT)' },
      { label: 'VFS service fee', value: 'As per VFS' },
      { label: 'Our service charge', value: '৳ 15,000' },
    ],
    excluded: ['Embassy and VFS fees', 'Translation and notary'],
    faqs: [
      { title: 'Can you guarantee the visa?', text: 'No agency can — the embassy decides. We make sure your file is complete and strong.' },
    ],
  },
};
