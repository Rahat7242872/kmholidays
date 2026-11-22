/** Airports offered as suggestions in the flight search (free text is allowed too). */
export const AIRPORTS = [
  { code: 'DAC', city: 'Dhaka', country: 'Bangladesh' },
  { code: 'CGP', city: 'Chattogram', country: 'Bangladesh' },
  { code: 'ZYL', city: 'Sylhet', country: 'Bangladesh' },
  { code: 'CXB', city: "Cox's Bazar", country: 'Bangladesh' },
  { code: 'JSR', city: 'Jashore', country: 'Bangladesh' },
  { code: 'DXB', city: 'Dubai', country: 'UAE' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'UAE' },
  { code: 'SHJ', city: 'Sharjah', country: 'UAE' },
  { code: 'DOH', city: 'Doha', country: 'Qatar' },
  { code: 'JED', city: 'Jeddah', country: 'Saudi Arabia' },
  { code: 'MED', city: 'Madinah', country: 'Saudi Arabia' },
  { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia' },
  { code: 'DMM', city: 'Dammam', country: 'Saudi Arabia' },
  { code: 'MCT', city: 'Muscat', country: 'Oman' },
  { code: 'KWI', city: 'Kuwait City', country: 'Kuwait' },
  { code: 'BAH', city: 'Bahrain', country: 'Bahrain' },
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand' },
  { code: 'HKT', city: 'Phuket', country: 'Thailand' },
  { code: 'DPS', city: 'Bali', country: 'Indonesia' },
  { code: 'MLE', city: 'Malé', country: 'Maldives' },
  { code: 'CCU', city: 'Kolkata', country: 'India' },
  { code: 'DEL', city: 'Delhi', country: 'India' },
  { code: 'MAA', city: 'Chennai', country: 'India' },
  { code: 'SXR', city: 'Srinagar', country: 'India' },
  { code: 'KTM', city: 'Kathmandu', country: 'Nepal' },
  { code: 'CMB', city: 'Colombo', country: 'Sri Lanka' },
  { code: 'IST', city: 'Istanbul', country: 'Türkiye' },
  { code: 'LHR', city: 'London', country: 'United Kingdom' },
  { code: 'CDG', city: 'Paris', country: 'France' },
  { code: 'FCO', city: 'Rome', country: 'Italy' },
  { code: 'JFK', city: 'New York', country: 'USA' },
  { code: 'YYZ', city: 'Toronto', country: 'Canada' },
  { code: 'SYD', city: 'Sydney', country: 'Australia' },
  { code: 'NRT', city: 'Tokyo', country: 'Japan' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea' },
  { code: 'CAN', city: 'Guangzhou', country: 'China' },
] as const;

export const airportLabel = (a: (typeof AIRPORTS)[number]) => `${a.city} (${a.code})`;

export const CABIN_CLASSES = ['Economy', 'Premium Economy', 'Business', 'First'] as const;

/** Popular routes shown on the flights page (no fares — prices change daily, our team quotes live). */
export const POPULAR_ROUTES = [
  { from: 'DAC', to: 'DXB', note: 'Holiday & work' },
  { from: 'DAC', to: 'JED', note: 'Umrah' },
  { from: 'DAC', to: 'KUL', note: 'Study & work' },
  { from: 'DAC', to: 'BKK', note: 'Holiday' },
  { from: 'DAC', to: 'SIN', note: 'Business' },
  { from: 'DAC', to: 'CCU', note: 'Medical & holiday' },
  { from: 'DAC', to: 'DOH', note: 'Work' },
  { from: 'DAC', to: 'LHR', note: 'Study & family' },
] as const;

export function findAirport(code: string) {
  return AIRPORTS.find((a) => a.code === code);
}
