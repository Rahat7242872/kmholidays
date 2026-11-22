import { boolean, integer, jsonb, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { ListingDetails } from "@/lib/listing-details";
import type { Answer } from "@/lib/booking-fields";
import type { OrderDocument } from "@/lib/order-document";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("customer"), // customer | admin
  profile: jsonb("profile").$type<{ occupation?: string; city?: string; travelHistory?: string }>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  authorId: serial("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Tours, hotels, visa, eSIM plans and other services — one table, split by `category`. */
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // tour | hotel | visa | esim | service
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  location: text("location").notNull().default(""),
  price: integer("price"), // BDT, null = on request
  priceNote: text("price_note").notNull().default(""),
  duration: text("duration").notNull().default(""),
  image: text("image").notNull().default(""),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
  // Tour itinerary, visa process/documents/fees, FAQs… (see lib/listing-details.ts)
  details: jsonb("details").$type<ListingDetails>().notNull().default({}),
  badge: text("badge").notNull().default(""),
  rating: real("rating"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listings.id, { onDelete: "set null" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  listingTitle: text("listing_title").notNull().default(""),
  category: text("category").notNull().default(""),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  travelDate: text("travel_date").notNull().default(""),
  travelers: integer("travelers"),
  message: text("message").notNull().default(""),
  // Service-specific answers from the booking form (passport, visa type, rooms…) — see lib/booking-fields.ts
  answers: jsonb("answers").$type<Answer[]>().notNull().default([]),
  status: text("status").notNull().default("new"), // new | contacted | confirmed | closed
  // Admin-entered data for the order PDF (see lib/order-document.ts)
  document: jsonb("document").$type<OrderDocument>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Live chat between website visitors and the KM team. */
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(), // secret the visitor's browser uses to access this chat
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  status: text("status").notNull().default("open"), // open | closed
  unreadForAdmin: integer("unread_for_admin").notNull().default(0),
  unreadForCustomer: integer("unread_for_customer").notNull().default(0),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  sender: text("sender").notNull(), // customer | admin
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Key-value settings edited from the admin panel (e.g. Umrah packages & rates). */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ListingRow = typeof listings.$inferSelect;
export type InquiryRow = typeof inquiries.$inferSelect;
export type ConversationRow = typeof conversations.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;
