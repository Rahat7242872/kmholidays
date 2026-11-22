/**
 * Data layer for listings (tours, hotels, visa, eSIM, services) and inquiries.
 *
 * - If DATABASE_URL points at a real Postgres (Neon) database, everything is stored there
 *   (run `npm run db:push` once to create the tables).
 * - Otherwise data is kept in `data/local-db.json` so the site and admin panel work
 *   locally with zero setup. That file store is for development only — serverless hosts
 *   like Vercel have a read-only filesystem, so use a database in production.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { and, desc, eq, gt, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  conversations as conversationsTable,
  inquiries as inquiriesTable,
  listings as listingsTable,
  messages as messagesTable,
  settings as settingsTable,
  users as usersTable,
  type ConversationRow,
  type InquiryRow,
  type ListingRow,
  type MessageRow,
} from '@/db/schema';
import { normalizeDetails } from '@/lib/listing-details';
import { normalizeDocument, type OrderDocument } from '@/lib/order-document';
import { seedListings } from '@/lib/seed-data';
import { isCategory, slugify, type Category } from '@/lib/site';
import {
  INQUIRY_STATUSES,
  type ChatMessage,
  type Conversation,
  type Customer,
  type CustomerProfile,
  type Inquiry,
  type InquiryInput,
  type InquiryStatus,
  type Listing,
  type ListingInput,
} from '@/lib/types';

export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL || '';
  return url.startsWith('postgres') && !url.includes('placeholder') && !url.includes('your_password');
}

export function dataBackend(): 'database' | 'local' {
  return isDatabaseConfigured() ? 'database' : 'local';
}

/* ------------------------------------------------------------------ */
/* Local JSON store                                                    */
/* ------------------------------------------------------------------ */

type LocalUser = Customer & { passwordHash: string | null };

type LocalDb = {
  listings: Listing[];
  inquiries: Inquiry[];
  users: LocalUser[];
  conversations: Conversation[];
  messages: ChatMessage[];
  settings: Record<string, unknown>;
  nextListingId: number;
  nextInquiryId: number;
  nextUserId: number;
  nextConversationId: number;
  nextMessageId: number;
};

const emptyExtras = { users: [], conversations: [], messages: [], settings: {}, nextUserId: 1, nextConversationId: 1, nextMessageId: 1 };

const LOCAL_FILE = path.join(process.cwd(), 'data', 'local-db.json');
let writeQueue: Promise<unknown> = Promise.resolve();

async function readLocal(): Promise<LocalDb> {
  if (process.env.NODE_ENV === 'production') {
    // Never silently fall back to a file in production — the real database must be configured.
    throw new Error('DATABASE_URL is not configured. Set it to your Neon Postgres URL.');
  }
  try {
    // Older files lack the newer collections, so fill in defaults.
    const data = { ...emptyExtras, ...(JSON.parse(await fs.readFile(LOCAL_FILE, "utf8")) as Partial<LocalDb>) } as LocalDb;
    data.listings = (data.listings ?? []).map((l) => ({ ...l, details: normalizeDetails(l.details) }));
    data.inquiries = (data.inquiries ?? []).map((q) => ({ ...q, document: normalizeDocument(q.document) }));
    return data;
  } catch {
    const now = new Date().toISOString();
    const listings = seedListings.map((l, i) => ({ ...l, id: i + 1, createdAt: now, updatedAt: now }));
    const fresh: LocalDb = { ...emptyExtras, listings, inquiries: [], nextListingId: listings.length + 1, nextInquiryId: 1 };
    await writeLocal(fresh).catch(() => undefined);
    return fresh;
  }
}

async function writeLocal(data: LocalDb) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(data, null, 2));
}

/** Serialises read-modify-write cycles so concurrent requests don't clobber each other. */
function mutateLocal<T>(fn: (data: LocalDb) => T): Promise<T> {
  const run = writeQueue.then(async () => {
    const data = await readLocal();
    const result = fn(data);
    await writeLocal(data);
    return result;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

/* ------------------------------------------------------------------ */
/* Mappers                                                             */
/* ------------------------------------------------------------------ */

function fromListingRow(row: ListingRow): Listing {
  return {
    ...row,
    category: (isCategory(row.category) ? row.category : 'service') as Category,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    details: normalizeDetails(row.details),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function fromInquiryRow(row: InquiryRow): Inquiry {
  const status = (INQUIRY_STATUSES as readonly string[]).includes(row.status) ? (row.status as InquiryStatus) : 'new';
  return { ...row, status, document: normalizeDocument(row.document), createdAt: row.createdAt.toISOString() };
}

/* ------------------------------------------------------------------ */
/* Listings                                                            */
/* ------------------------------------------------------------------ */

type ListingQuery = { category?: Category; q?: string; featured?: boolean; includeInactive?: boolean };

export async function getListings(query: ListingQuery = {}): Promise<Listing[]> {
  let all: Listing[];
  if (isDatabaseConfigured()) {
    const rows = await db.select().from(listingsTable).orderBy(desc(listingsTable.featured), desc(listingsTable.updatedAt));
    all = rows.map(fromListingRow);
  } else {
    all = [...(await readLocal()).listings].sort(
      (a, b) => Number(b.featured) - Number(a.featured) || b.updatedAt.localeCompare(a.updatedAt),
    );
  }

  const q = query.q?.trim().toLowerCase();
  return all.filter((l) => {
    if (!query.includeInactive && !l.active) return false;
    if (query.category && l.category !== query.category) return false;
    if (query.featured && !l.featured) return false;
    if (q && !`${l.title} ${l.location} ${l.summary} ${l.badge}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  if (isDatabaseConfigured()) {
    const [row] = await db.select().from(listingsTable).where(eq(listingsTable.slug, slug)).limit(1);
    return row ? fromListingRow(row) : null;
  }
  return (await readLocal()).listings.find((l) => l.slug === slug) ?? null;
}

export async function getListingById(id: number): Promise<Listing | null> {
  if (isDatabaseConfigured()) {
    const [row] = await db.select().from(listingsTable).where(eq(listingsTable.id, id)).limit(1);
    return row ? fromListingRow(row) : null;
  }
  return (await readLocal()).listings.find((l) => l.id === id) ?? null;
}

async function uniqueSlug(base: string, ignoreId?: number) {
  const root = slugify(base) || 'listing';
  const taken = new Set(
    (await getListings({ includeInactive: true })).filter((l) => l.id !== ignoreId).map((l) => l.slug),
  );
  let slug = root;
  for (let i = 2; taken.has(slug); i++) slug = `${root}-${i}`;
  return slug;
}

export async function createListing(input: ListingInput): Promise<Listing> {
  const slug = await uniqueSlug(input.slug || input.title);
  if (isDatabaseConfigured()) {
    const [row] = await db.insert(listingsTable).values({ ...input, slug }).returning();
    return fromListingRow(row);
  }
  return mutateLocal((data) => {
    const now = new Date().toISOString();
    const listing: Listing = { ...input, slug, id: data.nextListingId++, createdAt: now, updatedAt: now };
    data.listings.push(listing);
    return listing;
  });
}

export async function updateListing(id: number, input: Partial<ListingInput>): Promise<void> {
  const patch = { ...input };
  if (patch.slug !== undefined) patch.slug = await uniqueSlug(patch.slug || patch.title || 'listing', id);
  if (isDatabaseConfigured()) {
    await db.update(listingsTable).set({ ...patch, updatedAt: new Date() }).where(eq(listingsTable.id, id));
    return;
  }
  await mutateLocal((data) => {
    const index = data.listings.findIndex((l) => l.id === id);
    if (index >= 0) data.listings[index] = { ...data.listings[index], ...patch, updatedAt: new Date().toISOString() };
  });
}

export async function deleteListing(id: number): Promise<void> {
  if (isDatabaseConfigured()) {
    await db.delete(listingsTable).where(eq(listingsTable.id, id));
    return;
  }
  await mutateLocal((data) => {
    data.listings = data.listings.filter((l) => l.id !== id);
    data.inquiries = data.inquiries.map((q) => (q.listingId === id ? { ...q, listingId: null } : q));
  });
}

/**
 * Adds any sample listings whose slug isn't already present, and fills in the detail sections
 * (itinerary, visa process…) of existing sample listings that have none yet. Returns how many were added.
 */
export async function seedSampleListings(): Promise<number> {
  const current = await getListings({ includeInactive: true });
  for (const l of current) {
    const sample = seedListings.find((s) => s.slug === l.slug);
    if (sample && Object.keys(sample.details).length && !Object.keys(l.details).length) {
      await updateListing(l.id, { details: sample.details });
    }
  }
  const existing = new Set(current.map((l) => l.slug));
  const missing = seedListings.filter((l) => !existing.has(l.slug));
  if (!missing.length) return 0;
  if (isDatabaseConfigured()) {
    await db.insert(listingsTable).values(missing);
  } else {
    await mutateLocal((data) => {
      const now = new Date().toISOString();
      for (const l of missing) data.listings.push({ ...l, id: data.nextListingId++, createdAt: now, updatedAt: now });
    });
  }
  return missing.length;
}

/* ------------------------------------------------------------------ */
/* Inquiries                                                           */
/* ------------------------------------------------------------------ */

export async function createInquiry(input: InquiryInput): Promise<Inquiry> {
  if (isDatabaseConfigured()) {
    const [row] = await db.insert(inquiriesTable).values(input).returning();
    return fromInquiryRow(row);
  }
  return mutateLocal((data) => {
    const inquiry: Inquiry = { ...input, id: data.nextInquiryId++, status: 'new', document: {}, createdAt: new Date().toISOString() };
    data.inquiries.push(inquiry);
    return inquiry;
  });
}

export async function getInquiries(status?: InquiryStatus): Promise<Inquiry[]> {
  let all: Inquiry[];
  if (isDatabaseConfigured()) {
    all = (await db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt))).map(fromInquiryRow);
  } else {
    all = [...(await readLocal()).inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return status ? all.filter((q) => q.status === status) : all;
}

export async function getInquiryById(id: number): Promise<Inquiry | null> {
  if (isDatabaseConfigured()) {
    const [row] = await db.select().from(inquiriesTable).where(eq(inquiriesTable.id, id)).limit(1);
    return row ? fromInquiryRow(row) : null;
  }
  return (await readLocal()).inquiries.find((q) => q.id === id) ?? null;
}

export async function updateInquiryDocument(id: number, document: OrderDocument): Promise<void> {
  if (isDatabaseConfigured()) {
    await db.update(inquiriesTable).set({ document }).where(eq(inquiriesTable.id, id));
    return;
  }
  await mutateLocal((data) => {
    const inquiry = data.inquiries.find((q) => q.id === id);
    if (inquiry) inquiry.document = document;
  });
}

export async function updateInquiryStatus(id: number, status: InquiryStatus): Promise<void> {
  if (isDatabaseConfigured()) {
    await db.update(inquiriesTable).set({ status }).where(eq(inquiriesTable.id, id));
    return;
  }
  await mutateLocal((data) => {
    const inquiry = data.inquiries.find((q) => q.id === id);
    if (inquiry) inquiry.status = status;
  });
}

export async function deleteInquiry(id: number): Promise<void> {
  if (isDatabaseConfigured()) {
    await db.delete(inquiriesTable).where(eq(inquiriesTable.id, id));
    return;
  }
  await mutateLocal((data) => {
    data.inquiries = data.inquiries.filter((q) => q.id !== id);
  });
}

/** A signed-in customer's requests: linked by account, or made earlier with the same email. */
export async function getInquiriesForUser(userId: number, email: string): Promise<Inquiry[]> {
  const mail = email.trim().toLowerCase();
  if (isDatabaseConfigured()) {
    const rows = await db
      .select()
      .from(inquiriesTable)
      .where(or(eq(inquiriesTable.userId, userId), sql`lower(${inquiriesTable.email}) = ${mail}`))
      .orderBy(desc(inquiriesTable.createdAt));
    return rows.map(fromInquiryRow);
  }
  return (await readLocal()).inquiries
    .filter((q) => q.userId === userId || (!!mail && q.email.toLowerCase() === mail))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ------------------------------------------------------------------ */
/* Customers (website accounts)                                        */
/* ------------------------------------------------------------------ */

type UserWithHash = Customer & { passwordHash: string | null };

function fromUserRow(row: typeof usersTable.$inferSelect): Customer {
  return { id: row.id, name: row.name ?? '', email: row.email, phone: row.phone, role: row.role.trim().toLowerCase() === 'admin' ? 'admin' : 'customer', profile: row.profile ?? {}, createdAt: row.createdAt.toISOString() };
}

function stripHash({ passwordHash: _omit, ...rest }: LocalUser): Customer {
  void _omit;
  return { ...rest, role: String(rest.role ?? '').trim().toLowerCase() === 'admin' ? 'admin' : 'customer', profile: rest.profile ?? {} };
}

export async function findUserByEmail(email: string): Promise<UserWithHash | null> {
  const mail = email.trim().toLowerCase();
  if (isDatabaseConfigured()) {
    const [row] = await db.select().from(usersTable).where(sql`lower(${usersTable.email}) = ${mail}`).limit(1);
    return row ? { ...fromUserRow(row), passwordHash: row.passwordHash } : null;
  }
  return (await readLocal()).users.find((u) => u.email.toLowerCase() === mail) ?? null;
}

export async function getUserById(id: number): Promise<Customer | null> {
  if (isDatabaseConfigured()) {
    const [row] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return row ? fromUserRow(row) : null;
  }
  const user = (await readLocal()).users.find((u) => u.id === id);
  return user ? stripHash(user) : null;
}

export async function createUser(input: { name: string; email: string; phone: string; passwordHash: string | null }): Promise<Customer> {
  const email = input.email.trim().toLowerCase();
  if (isDatabaseConfigured()) {
    const [row] = await db.insert(usersTable).values({ ...input, email }).returning();
    return fromUserRow(row);
  }
  return mutateLocal((data) => {
    if (data.users.some((u) => u.email === email)) throw new Error('EMAIL_TAKEN');
    const user: LocalUser = { id: data.nextUserId++, name: input.name, email, phone: input.phone, role: 'customer', profile: {}, passwordHash: input.passwordHash, createdAt: new Date().toISOString() };
    data.users.push(user);
    return stripHash(user);
  });
}

export async function getCustomers(): Promise<Customer[]> {
  if (isDatabaseConfigured()) {
    const rows = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    return rows.map(fromUserRow);
  }
  return (await readLocal()).users
    .map(stripHash)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setUserRole(id: number, role: 'customer' | 'admin'): Promise<void> {
  if (isDatabaseConfigured()) {
    await db.update(usersTable).set({ role }).where(eq(usersTable.id, id));
    return;
  }
  await mutateLocal((data) => {
    const user = data.users.find((u) => u.id === id);
    if (user) user.role = role;
  });
}

export async function updateUserProfile(id: number, patch: { name: string; phone: string; profile: CustomerProfile }): Promise<void> {
  if (isDatabaseConfigured()) {
    await db.update(usersTable).set(patch).where(eq(usersTable.id, id));
    return;
  }
  await mutateLocal((data) => {
    const user = data.users.find((u) => u.id === id);
    if (user) Object.assign(user, patch);
  });
}

/* ------------------------------------------------------------------ */
/* Live chat                                                           */
/* ------------------------------------------------------------------ */

function fromConversationRow(row: ConversationRow): Conversation {
  return {
    ...row,
    status: row.status === 'closed' ? 'closed' : 'open',
    lastMessageAt: row.lastMessageAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

function fromMessageRow(row: MessageRow): ChatMessage {
  return { ...row, sender: row.sender === 'admin' ? 'admin' : 'customer', createdAt: row.createdAt.toISOString() };
}

export async function createConversation(input: { token: string; userId: number | null; name: string; phone: string }): Promise<Conversation> {
  if (isDatabaseConfigured()) {
    const [row] = await db.insert(conversationsTable).values(input).returning();
    return fromConversationRow(row);
  }
  return mutateLocal((data) => {
    const now = new Date().toISOString();
    const conv: Conversation = { ...input, id: data.nextConversationId++, status: 'open', unreadForAdmin: 0, unreadForCustomer: 0, lastMessageAt: now, createdAt: now };
    data.conversations.push(conv);
    return conv;
  });
}

export async function getConversationByToken(token: string): Promise<Conversation | null> {
  if (!token) return null;
  if (isDatabaseConfigured()) {
    const [row] = await db.select().from(conversationsTable).where(eq(conversationsTable.token, token)).limit(1);
    return row ? fromConversationRow(row) : null;
  }
  return (await readLocal()).conversations.find((c) => c.token === token) ?? null;
}

export async function getConversationById(id: number): Promise<Conversation | null> {
  if (isDatabaseConfigured()) {
    const [row] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id)).limit(1);
    return row ? fromConversationRow(row) : null;
  }
  return (await readLocal()).conversations.find((c) => c.id === id) ?? null;
}

export async function getConversations(): Promise<Conversation[]> {
  if (isDatabaseConfigured()) {
    return (await db.select().from(conversationsTable).orderBy(desc(conversationsTable.lastMessageAt))).map(fromConversationRow);
  }
  return [...(await readLocal()).conversations].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

/** Messages in a conversation, optionally only those after a given message id (for polling). */
export async function getMessages(conversationId: number, afterId = 0): Promise<ChatMessage[]> {
  if (isDatabaseConfigured()) {
    const rows = await db
      .select()
      .from(messagesTable)
      .where(and(eq(messagesTable.conversationId, conversationId), gt(messagesTable.id, afterId)))
      .orderBy(messagesTable.id);
    return rows.map(fromMessageRow);
  }
  return (await readLocal()).messages.filter((m) => m.conversationId === conversationId && m.id > afterId).sort((a, b) => a.id - b.id);
}

export async function addMessage(conversationId: number, sender: 'customer' | 'admin', body: string): Promise<ChatMessage> {
  if (isDatabaseConfigured()) {
    const [row] = await db.insert(messagesTable).values({ conversationId, sender, body }).returning();
    await db
      .update(conversationsTable)
      .set({
        lastMessageAt: new Date(),
        status: 'open',
        ...(sender === 'customer'
          ? { unreadForAdmin: sql`${conversationsTable.unreadForAdmin} + 1` }
          : { unreadForCustomer: sql`${conversationsTable.unreadForCustomer} + 1` }),
      })
      .where(eq(conversationsTable.id, conversationId));
    return fromMessageRow(row);
  }
  return mutateLocal((data) => {
    const now = new Date().toISOString();
    const msg: ChatMessage = { id: data.nextMessageId++, conversationId, sender, body, createdAt: now };
    data.messages.push(msg);
    const conv = data.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessageAt = now;
      conv.status = 'open';
      if (sender === 'customer') conv.unreadForAdmin += 1;
      else conv.unreadForCustomer += 1;
    }
    return msg;
  });
}

export async function markConversationRead(conversationId: number, reader: 'admin' | 'customer'): Promise<void> {
  const field = reader === 'admin' ? 'unreadForAdmin' : 'unreadForCustomer';
  if (isDatabaseConfigured()) {
    await db.update(conversationsTable).set({ [field]: 0 }).where(eq(conversationsTable.id, conversationId));
    return;
  }
  await mutateLocal((data) => {
    const conv = data.conversations.find((c) => c.id === conversationId);
    if (conv) conv[field] = 0;
  });
}

export async function setConversationStatus(conversationId: number, status: 'open' | 'closed'): Promise<void> {
  if (isDatabaseConfigured()) {
    await db.update(conversationsTable).set({ status }).where(eq(conversationsTable.id, conversationId));
    return;
  }
  await mutateLocal((data) => {
    const conv = data.conversations.find((c) => c.id === conversationId);
    if (conv) conv.status = status;
  });
}

/* ------------------------------------------------------------------ */
/* Database status (admin)                                             */
/* ------------------------------------------------------------------ */

export type DatabaseStatus =
  | { backend: 'database'; ok: true; host: string; latencyMs: number; tables: { name: string; rows: number }[] }
  | { backend: 'database'; ok: false; host: string; error: string }
  | { backend: 'local'; ok: true; tables: { name: string; rows: number }[] };

export async function databaseStatus(): Promise<DatabaseStatus> {
  if (!isDatabaseConfigured()) {
    const data = await readLocal();
    return { backend: 'local', ok: true, tables: [
      { name: 'listings', rows: data.listings.length }, { name: 'inquiries', rows: data.inquiries.length }, { name: 'users', rows: data.users.length },
      { name: 'conversations', rows: data.conversations.length }, { name: 'messages', rows: data.messages.length },
    ] };
  }
  let host = 'database';
  try { host = new URL(process.env.DATABASE_URL ?? '').hostname; } catch { /* keep default */ }
  try {
    const started = Date.now();
    await db.execute(sql`select 1`);
    const latencyMs = Date.now() - started;
    const names = ['listings', 'inquiries', 'users', 'conversations', 'messages'] as const;
    const tables = await Promise.all(names.map(async (name) => {
      const result = await db.execute(sql.raw(`select count(*)::int as n from "${name}"`));
      const row = (result as unknown as { rows: { n: number }[] }).rows[0];
      return { name, rows: Number(row?.n ?? 0) };
    }));
    return { backend: 'database', ok: true, host, latencyMs, tables };
  } catch (error) {
    return { backend: 'database', ok: false, host, error: error instanceof Error ? error.message : String(error) };
  }
}

/* ------------------------------------------------------------------ */
/* Settings (admin-editable JSON blobs)                                */
/* ------------------------------------------------------------------ */

export async function getSetting<T>(key: string): Promise<T | null> {
  if (isDatabaseConfigured()) {
    const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
    return (row?.value as T | undefined) ?? null;
  }
  return ((await readLocal()).settings[key] as T | undefined) ?? null;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  if (isDatabaseConfigured()) {
    await db
      .insert(settingsTable)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } });
    return;
  }
  await mutateLocal((data) => {
    data.settings[key] = value;
  });
}
