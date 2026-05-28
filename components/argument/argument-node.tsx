import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { VoteButtons } from "./vote-buttons";
import { ReplyForm } from "./reply-form";
import type { VoteValue } from "@/server/actions/votes";

export type ArgumentNodeData = {
  id: string;
  slug: string;
  title: string;
  content: string;
  image: string | null;
  score: number;
  createdAt: Date;
  author: { id: string; username: string; image: string | null; name: string | null };
  topic: { slug: string; name: string };
  _count: { replies: number };
};

type Props = {
  argument: ArgumentNodeData;
  myVote: VoteValue;
  isAuthenticated: boolean;
  variant?: "card" | "node" | "detail";
  showReply?: boolean;
};

export function ArgumentNode({
  argument,
  myVote,
  isAuthenticated,
  variant = "card",
  showReply = false,
}: Props) {
  const href = `/arg/${argument.topic.slug}/${argument.slug}`;
  const isCardLike = variant === "card";

  return (
    <article
      id={argument.slug}
      className={
        isCardLike
          ? "rounded-lg border border-black/10 dark:border-white/15 p-4 bg-background"
          : variant === "detail"
            ? "rounded-lg border border-black/10 dark:border-white/15 p-4 bg-background"
            : "py-2"
      }
    >
      <header className="flex items-center justify-between gap-3 text-xs text-foreground/70">
        <div className="flex items-center gap-2 min-w-0">
          <Link href={`/u/${argument.author.username}`} className="hover:underline truncate">
            @{argument.author.username}
          </Link>
          <span aria-hidden>·</span>
          {variant === "node" ? (
            <time dateTime={argument.createdAt.toISOString()}>
              {formatRelative(argument.createdAt)}
            </time>
          ) : (
            <>
              <Link href={`/arg/${argument.topic.slug}`} className="hover:underline truncate">
                {argument.topic.name}
              </Link>
              <span aria-hidden>·</span>
              <time dateTime={argument.createdAt.toISOString()}>
                {formatRelative(argument.createdAt)}
              </time>
            </>
          )}
        </div>
        <VoteButtons
          argumentId={argument.id}
          score={argument.score}
          myVote={myVote}
          isAuthenticated={isAuthenticated}
        />
      </header>

      {variant !== "node" && (
        <h2 className="mt-2 font-medium leading-snug">
          {variant === "detail" ? (
            argument.title
          ) : (
            <Link href={href} className="hover:underline">
              {argument.title}
            </Link>
          )}
        </h2>
      )}

      <div className="mt-2">
        <MarkdownRenderer>{argument.content}</MarkdownRenderer>
      </div>

      {argument.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={argument.image}
          alt=""
          className="mt-3 max-h-96 rounded-md border border-black/10 dark:border-white/15"
          loading="lazy"
        />
      )}

      <footer className="mt-3 flex items-center gap-4 text-xs text-foreground/70">
        {variant === "card" && (
          <Link href={href} className="hover:underline">
            {argument._count.replies} contra-argumento{argument._count.replies === 1 ? "" : "s"}
          </Link>
        )}
        {showReply && (
          <ReplyForm parentArgumentId={argument.id} isAuthenticated={isAuthenticated} />
        )}
      </footer>
    </article>
  );
}

const REL_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

function formatRelative(date: Date): string {
  const diff = (date.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  for (const [unit, secs] of REL_UNITS) {
    if (Math.abs(diff) >= secs || unit === "second") {
      return rtf.format(Math.round(diff / secs), unit);
    }
  }
  return "";
}
