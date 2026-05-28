"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { voteOnArgument, type VoteValue } from "@/server/actions/votes";

type State = { score: number; myVote: VoteValue };

function applyVote(state: State, next: VoteValue): State {
  if (state.myVote === next) return state;
  let delta = 0;
  if (state.myVote === "UP") delta -= 1;
  if (state.myVote === "DOWN") delta += 1;
  if (next === "UP") delta += 1;
  if (next === "DOWN") delta -= 1;
  return { score: state.score + delta, myVote: next };
}

type Props = {
  argumentId: string;
  score: number;
  myVote: VoteValue;
  isAuthenticated: boolean;
};

export function VoteButtons({ argumentId, score, myVote, isAuthenticated }: Props) {
  const [optimistic, setOptimistic] = useOptimistic<State, VoteValue>(
    { score, myVote },
    applyVote,
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function vote(intent: "UP" | "DOWN") {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const next: VoteValue = optimistic.myVote === intent ? null : intent;
    setError(null);
    startTransition(async () => {
      setOptimistic(next);
      try {
        await voteOnArgument(argumentId, next);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha ao votar.");
      }
    });
  }

  const colorFor = (active: boolean, dir: "up" | "down") =>
    active
      ? dir === "up"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400"
      : "text-foreground/50 hover:text-foreground/80";

  const scoreColor =
    optimistic.score > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : optimistic.score < 0
        ? "text-red-600 dark:text-red-400"
        : "text-foreground/70";

  return (
    <div className="inline-flex items-center gap-1 text-xs" title={error ?? undefined}>
      <button
        type="button"
        onClick={() => vote("UP")}
        disabled={pending}
        aria-label="Votar positivamente"
        aria-pressed={optimistic.myVote === "UP"}
        className={`rounded p-1 transition ${colorFor(optimistic.myVote === "UP", "up")}`}
      >
        <ArrowUp />
      </button>
      <span className={`tabular-nums font-medium min-w-[1.5ch] text-center ${scoreColor}`}>
        {optimistic.score}
      </span>
      <button
        type="button"
        onClick={() => vote("DOWN")}
        disabled={pending}
        aria-label="Votar negativamente"
        aria-pressed={optimistic.myVote === "DOWN"}
        className={`rounded p-1 transition ${colorFor(optimistic.myVote === "DOWN", "down")}`}
      >
        <ArrowDown />
      </button>
    </div>
  );
}

function ArrowUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 2 2 9h3v5h6V9h3z" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 14 14 7h-3V2H5v5H2z" />
    </svg>
  );
}
