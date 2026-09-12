"use client";

import { createClient } from "@/lib/supabase/client";
import type { ListingMessage, ListingThread } from "@/lib/types/thread";

export async function openListingThread(listingId: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("open_listing_thread", { p_listing_id: listingId });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return (row?.id ?? row) as string;
}

export async function sendListingMessage(threadId: string, body: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("send_listing_message", { p_thread_id: threadId, p_body: body });
  if (error) throw new Error(error.message);
}

export async function markThreadRead(threadId: string) {
  const supabase = createClient();
  await supabase.rpc("mark_listing_thread_read", { p_thread_id: threadId });
}

export async function fetchMyThreads(): Promise<ListingThread[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("listing_threads")
    .select("*")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("last_at", { ascending: false });

  if (error) {
    console.error("fetchMyThreads", error.message);
    return [];
  }
  return (data ?? []) as ListingThread[];
}

export async function fetchThreadById(threadId: string): Promise<ListingThread | null> {
  const supabase = createClient();
  const { data } = await supabase.from("listing_threads").select("*").eq("id", threadId).maybeSingle();
  return (data as ListingThread) ?? null;
}

export async function fetchThreadMessages(threadId: string): Promise<ListingMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listing_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchThreadMessages", error.message);
    return [];
  }
  return (data ?? []) as ListingMessage[];
}

export function subscribeToThreadMessages(threadId: string, onInsert: (message: ListingMessage) => void) {
  const supabase = createClient();
  const channel = supabase
    .channel(`thread-${threadId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "listing_messages", filter: `thread_id=eq.${threadId}` },
      (payload) => onInsert(payload.new as ListingMessage)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
