export type ListingCondition = "" | "new" | "used" | "refurbished";
export type OfferType = "article" | "service";
export type Currency = "PEN" | "USD";

export interface Listing {
  id: string;
  user_id: string;
  kind: string;
  name: string;
  description: string;
  price_label: string;
  city: string;
  country: string;
  country_code: string;
  department: string;
  province: string;
  district: string;
  category: string;
  phone: string;
  url: string;
  image: string;
  images: string[];
  active: boolean;
  hidden: boolean;
  visible_until: string | null;
  views: number;
  details: number;
  contacts: number;
  seller_email: string;
  seller_name: string;
  currency: Currency;
  origin_app: string;
  offer_type: OfferType;
  condition: ListingCondition;
  created_at: string;
  updated_at: string;
}

export interface ListingFilters {
  q?: string;
  categorySlug?: string;
  city?: string;
  condition?: ListingCondition;
  offerType?: OfferType;
  minPrice?: number;
  maxPrice?: number;
  sort?: "recent" | "price_asc" | "price_desc" | "views";
  page?: number;
  pageSize?: number;
}
