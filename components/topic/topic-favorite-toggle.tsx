"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavoriteTopic } from "@/server/actions/topics";

type Props = {
  topicId: string;
  initialFavorited: boolean;
  isAuthenticated: boolean;
};

export function TopicFavoriteToggle({ topicId, initialFavorited, isAuthenticated }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(initialFavorited, (_p, n: boolean) => n);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onClick() {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setError(null);
    startTransition(async () => {
      setOptimistic(!optimistic);
      try {
        await toggleFavoriteTopic(topicId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha ao favoritar.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      title={error ?? undefined}
      aria-pressed={optimistic}
      className={`rounded-md px-3 py-1.5 text-sm border transition ${
        optimistic
          ? "border-foreground bg-foreground text-background hover:opacity-90"
          : "border-black/10 dark:border-white/15 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
      }`}
    >
      {optimistic ? "★ Favoritado" : "☆ Favoritar"}
    </button>
  );
}
