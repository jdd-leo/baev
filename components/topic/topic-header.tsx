import Link from "next/link";
import type { TopicSummary } from "@/server/db/queries/topics";
import { TopicFavoriteToggle } from "./topic-favorite-toggle";

type Props = {
  topic: TopicSummary;
  sort: "hot" | "new";
  favorited: boolean;
  isAuthenticated: boolean;
};

export function TopicHeader({ topic, sort, favorited, isAuthenticated }: Props) {
  return (
    <header className="space-y-3 border-b border-black/10 dark:border-white/15 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{topic.name}</h1>
          <p className="text-xs text-foreground/60 mt-0.5">/arg/{topic.slug}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <TopicFavoriteToggle
            topicId={topic.id}
            initialFavorited={favorited}
            isAuthenticated={isAuthenticated}
          />
          <Link
            href={`/create?topic=${topic.slug}`}
            className="rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-90"
          >
            Novo argumento
          </Link>
        </div>
      </div>
      {topic.description && <p className="text-sm text-foreground/80">{topic.description}</p>}
      <SortTabs topicSlug={topic.slug} current={sort} />
    </header>
  );
}

function SortTabs({ topicSlug, current }: { topicSlug: string; current: "hot" | "new" }) {
  const tabs: { value: "hot" | "new"; label: string }[] = [
    { value: "hot", label: "Mais votados" },
    { value: "new", label: "Mais recentes" },
  ];
  return (
    <nav className="flex gap-2 text-sm">
      {tabs.map((t) => {
        const active = t.value === current;
        return (
          <Link
            key={t.value}
            href={`/arg/${topicSlug}${t.value === "hot" ? "" : `?sort=${t.value}`}`}
            className={`rounded-md px-3 py-1 ${
              active
                ? "bg-foreground text-background"
                : "border border-black/10 dark:border-white/15 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
