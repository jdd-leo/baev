"use client";

import { useState, useTransition } from "react";
import { ArgumentNode } from "@/components/argument/argument-node";
import type { ArgumentListItem } from "@/server/db/queries/arguments";
import type { Cursor, PageResult } from "@/server/actions/pagination";

type Props = {
  initialItems: ArgumentListItem[];
  initialMyVotes: Record<string, "UP" | "DOWN">;
  initialCursor: Cursor | null;
  isAuthenticated: boolean;
  fetcher: (cursor: Cursor | null) => Promise<PageResult>;
  emptyMessage?: string;
};

export function LoadMoreList({
  initialItems,
  initialMyVotes,
  initialCursor,
  isAuthenticated,
  fetcher,
  emptyMessage = "Nada por aqui ainda.",
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [myVotes, setMyVotes] = useState<Record<string, "UP" | "DOWN">>(initialMyVotes);
  const [cursor, setCursor] = useState<Cursor | null>(initialCursor);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    setError(null);
    startTransition(async () => {
      try {
        const next = await fetcher(cursor);
        setItems((prev) => [...prev, ...next.items]);
        setMyVotes((prev) => ({ ...prev, ...next.myVotes }));
        setCursor(next.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha ao carregar.");
      }
    });
  }

  if (items.length === 0) {
    return <p className="py-12 text-center text-sm text-foreground/60">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {items.map((arg) => (
          <li key={arg.id}>
            <ArgumentNode
              argument={arg}
              myVote={myVotes[arg.id] ?? null}
              isAuthenticated={isAuthenticated}
              variant="card"
            />
          </li>
        ))}
      </ul>
      {cursor && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={pending}
            className="rounded-md border border-black/10 dark:border-white/15 px-4 py-2 text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06] disabled:opacity-50"
          >
            {pending ? "Carregando…" : "Carregar mais"}
          </button>
        </div>
      )}
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
