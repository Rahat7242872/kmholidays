import type { ListingDetails } from '@/lib/listing-details';
import type { OrderDocument } from '@/lib/order-document';
import type { Category } from '@/lib/site';

export type Listing = {
  id: number;
  category: Category;
  title: string;
  slug: string;
  location: string;
  price: number | null;
  priceNote: string;
  duration: string;
  image: string;
  summary: string;
  description: string;
  highlights: string[];
  details: ListingDetails;
  badge: string;
  rating: number | null;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListingInput = Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>;

export const INQUIRY_STATUSES = ['new', 'contacted', 'confirmed', 'closed'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export type Inquiry = {
  id: number;
  listingId: number | null;
  userId: number | null;
  listingTitle: string;
  category: string;
  name: string;
  phone: string;
  email: string;
  travelDate: string;
  travelers: number | null;
  message: string;
  status: InquiryStatus;
  document: OrderDocument;
  createdAt: string;
};

export type InquiryInput = Omit<Inquiry, "id" | "createdAt" | "status" | "document">;

export const OCCUPATIONS = ["Student", "Job holder", "Business owner", "Worker / labour", "Homemaker", "Retired", "Other"] as const;

export type CustomerProfile = { occupation?: string; city?: string; travelHistory?: string };

export type UserRole = "customer" | "admin";

export type Customer = { id: number; name: string; email: string; phone: string; role: UserRole; profile: CustomerProfile; createdAt: string };

export type Conversation = {
  id: number;
  token: string;
  userId: number | null;
  name: string;
  phone: string;
  status: "open" | "closed";
  unreadForAdmin: number;
  unreadForCustomer: number;
  lastMessageAt: string;
  createdAt: string;
};

export type ChatMessage = { id: number; conversationId: number; sender: "customer" | "admin"; body: string; createdAt: string };
