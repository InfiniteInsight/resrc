import type { ResourceScope, PostCategory, ReportCategory } from "@/lib/constants";

export interface LocationInfo {
  zip: string;
  city: string;
  county: string;
  state: string;
}

export interface ResourceResult {
  id: string;
  name: string;
  description: string;
  category: {
    slug: string;
    name: string;
    icon: string;
  };
  subcategory: string | null;
  scope: ResourceScope;
  url: string;
  phone: string | null;
  address: string | null;
  eligibilitySummary: string | null;
  incomeLimitNotes: string | null;
  hours: string | null;
  languages: string | null;
  verifiedAt: string | null;
}

export interface ResourcesResponse {
  location: LocationInfo;
  results: ResourceResult[];
  total: number;
  page: number;
  totalPages: number;
  categories: CategoryCount[];
}

export interface CategoryCount {
  slug: string;
  name: string;
  icon: string;
  count: number;
}

export interface FeedPost {
  id: string;
  body: string;
  category: PostCategory;
  upvotes: number;
  flags: number;
  createdAt: string;
}

export interface FeedResponse {
  posts: FeedPost[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ReportSubmission {
  zip: string;
  category: ReportCategory;
  body: string;
  severity: number;
  locationDetails?: string;
  contactInfo?: string;
}

export interface ReportAggregation {
  category: ReportCategory;
  count: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
