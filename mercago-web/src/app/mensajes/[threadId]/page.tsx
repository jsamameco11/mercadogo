"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  fetchThreadById,
  fetchThreadMessages,
  markThreadRead,
  sendListingMessage,
  subscribeToThreadMessages,
} from "@/lib/messaging";
import type { ListingMessage, ListingThread } from "@/lib/types/thread";
import { IconChevronLeft } from "@/components/icons/line-art";

export default function ConversacionPage() {
  const params = useParams<{ threadId: string }>();
  const router = useRouter();
  const [thread, setThread] = useState<ListingThread | null>(null);
  const [messages, setMessages] = useState<ListingMessage[]>([]);
  const [userId, setUserId] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"loading" | "idle" | "forbidden">("loading");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let unsubscribe: (() => void) | undefined;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?next=/mensajes/${params.threadId}`);
        return;
      }
      setUserId(user.id);
      const t = await fetchThreadById(params.threadId);
      if (!t || (t.buyer_id !== user.id && t.seller_id !== user.id)) {
        setStatus("forbidden");
        return;
      }
      setThread(t);
      const msgs = await fetchThreadMessages(params.threadId);
      setMessages(msgs);
      void markThreadRead(params.threadId);
      setStatus("idle");
      unsubscribe = subscribeToThreadMessages(params.threadId, (m) => setMessages((prev) => [...prev, m]));
    })();
    return () => unsubscribe?.();
  }, [params.threadId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setBody("");
    await sendListingMessage(params.threadId, text);
  }

  if (status === "loading") return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">Cargando…</div>;
  if (status === "forbidden" || !thread) return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-danger">No tienes acceso a esta conversación.</div>;

  const otherName = thread.seller_id === userId ? thread.buyer_name : thread.seller_name;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Link href="/mensajes" className="rounded-full p-1.5 hover:bg-muted"><IconChevronLeft className="h-5 w-5" /></Link>
        <Link href={`/anuncio/${thread.listing_id}`} className="flex items-center gap-3 hover:opacity-80">
          <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted">
            {thread.listing_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thread.listing_image} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{otherName || "Usuario"}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{thread.listing_name}</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-accent text-accent-foreground" : "bg-muted"}`}>
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border pt-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          Enviar
        </button>
      </form>
    </div>
  );
}
