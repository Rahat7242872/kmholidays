/**
 * Rich, optional detail sections for a listing (tour itinerary, visa process, fees…).
 * Stored as JSON in `listings.details`. Admins edit each section as plain text in a simple
 * line/block format, parsed by the helpers below (used by both the admin form and the server action).
 */

export type Fact = { label: string; value: string };
export type ItineraryDay = { title: string; text: string; meta: Fact[] };
export type Block = { title: string; text: string };
export type Group = { title: string; items: string[] };

export type ListingDetails = {
  /** Quick facts — tour: transport, hotel, meals…; visa: type, entry, validity, stay… */
  facts?: Fact[];
  /** Tour: day-by-day plan. */
  itinerary?: ItineraryDay[];
  /** Tour: what's NOT included. Visa: what the price does NOT cover. */
  excluded?: string[];
  /** Visa: required documents, grouped by applicant type. */
  documentGroups?: Group[];
  /** Visa: how the processing works, step by step. */
  steps?: Block[];
  /** Visa: fee breakdown. */
  fees?: Fact[];
  faqs?: Block[];
};

export type DetailsKey = keyof ListingDetails;

/* ---------- parsing (text -> data) ---------- */

const lines = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);
/** Blocks are separated by one or more blank lines. */
const blocks = (text: string) => text.replace(/\r/g, '').split(/\n\s*\n/).map(lines).filter((b) => b.length > 0);

/** "Label: value" per line. A line without a colon becomes a value with an empty label. */
export function parseFacts(text: string, max = 20): Fact[] {
  return lines(text).slice(0, max).map((line) => {
    const i = line.indexOf(':');
    return i > 0 ? { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() } : { label: '', value: line };
  });
}

export const parseList = (text: string, max = 40) => lines(text).slice(0, max);

/** First line = title, remaining lines = text. */
export function parseBlocks(text: string, max = 30): Block[] {
  return blocks(text).slice(0, max).map(([title, ...rest]) => ({ title, text: rest.join('\n') }));
}

/** First line = group title, remaining lines = items. */
export function parseGroups(text: string, max = 12): Group[] {
  return blocks(text).slice(0, max).map(([title, ...items]) => ({ title, items: items.slice(0, 40) }));
}

const META = /^(meals?|stay|hotel|transport|travel|activity|activities|খাবার|থাকা|হোটেল|যাতায়াত)\s*:/i;

/** Like blocks, but lines such as "Stay: Ubud" or "Meals: Breakfast" become small labelled chips. */
export function parseItinerary(text: string, max = 30): ItineraryDay[] {
  return blocks(text).slice(0, max).map(([title, ...rest]) => ({
    title,
    text: rest.filter((l) => !META.test(l)).join('\n'),
    meta: parseFacts(rest.filter((l) => META.test(l)).join('\n')),
  }));
}

/** Parse every detail field from a submitted form (field names = `details.<key>`). Empty sections are dropped. */
export function detailsFromForm(form: FormData): ListingDetails {
  const get = (key: DetailsKey) => String(form.get(`details.${key}`) ?? '').slice(0, 12000);
  const out: ListingDetails = {
    facts: parseFacts(get('facts')),
    itinerary: parseItinerary(get('itinerary')),
    excluded: parseList(get('excluded')),
    documentGroups: parseGroups(get('documentGroups')),
    steps: parseBlocks(get('steps')),
    fees: parseFacts(get('fees')),
    faqs: parseBlocks(get('faqs')),
  };
  for (const key of Object.keys(out) as DetailsKey[]) if (!out[key]?.length) delete out[key];
  return out;
}

/* ---------- serialising (data -> text, for the admin form) ---------- */

const factsText = (f: Fact[] = []) => f.map((x) => (x.label ? `${x.label}: ${x.value}` : x.value)).join('\n');
const blocksText = (b: Block[] = []) => b.map((x) => [x.title, x.text].filter(Boolean).join('\n')).join('\n\n');

export function detailsToText(d: ListingDetails = {}): Record<DetailsKey, string> {
  return {
    facts: factsText(d.facts),
    itinerary: (d.itinerary ?? []).map((x) => [x.title, x.text, factsText(x.meta)].filter(Boolean).join('\n')).join('\n\n'),
    excluded: (d.excluded ?? []).join('\n'),
    documentGroups: (d.documentGroups ?? []).map((g) => [g.title, ...g.items].join('\n')).join('\n\n'),
    steps: blocksText(d.steps),
    fees: factsText(d.fees),
    faqs: blocksText(d.faqs),
  };
}

/** Defensive read of whatever is stored (old rows / local JSON may have nothing). */
export function normalizeDetails(value: unknown): ListingDetails {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as ListingDetails) : {};
}
