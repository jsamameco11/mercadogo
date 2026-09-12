export interface ListingThread {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listing_name: string;
  listing_image: string;
  listing_price: string;
  listing_kind: string;
  seller_name: string;
  buyer_name: string;
  buyer_email: string;
  last_body: string;
  last_at: string;
  last_sender_id: string | null;
  buyer_unread: number;
  seller_unread: number;
  created_at: string;
}

export interface ListingMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}
