import Link from "next/link";
import type { FeedTab } from "@/server/db/queries/feed";

const TABS: { value: FeedTab; label: string; requiresAuth?: boolean }[] = [
  { value: "popular", label: "Populares" },
  { value: "recent", label: "Recentes" },
  { value: "favorites", label: "Favoritos", requiresAuth: true },
];

export function FeedTabs({
  current,
  isAuthenticated,
}: {
  current: FeedTab;
  isAuthenticated: boolean;
}) {
  return (
    <nav className="flex gap-2 text-sm" aria-label="Feed">
      {TABS.filter((t) => !t.requiresAuth || isAuthenticated).map((t) => {
        const active = t.value === current;
        const href = t.value === "popular" ? "/" : `/?tab=${t.value}`;
        return (
          <Link
            key={t.value}
            href={href}
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
