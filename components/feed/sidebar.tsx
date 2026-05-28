import Link from "next/link";
import { listTopics } from "@/server/db/queries/topics";
import { getFavoriteTopics } from "@/server/db/queries/feed";

export async function FeedSidebar({ userId }: { userId?: string }) {
  const [allTopics, favorites] = await Promise.all([
    listTopics(),
    userId ? getFavoriteTopics(userId) : Promise.resolve([]),
  ]);

  return (
    <aside className="space-y-6 text-sm">
      {userId && favorites.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/60">
            Meus assuntos
          </h2>
          <ul className="space-y-1">
            {favorites.map((f) => (
              <li key={f.topic.id}>
                <Link
                  href={`/arg/${f.topic.slug}`}
                  className="block rounded px-2 py-1 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
                >
                  {f.topic.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/60">
          Todos os assuntos
        </h2>
        <ul className="space-y-1">
          {allTopics.map((t) => (
            <li key={t.id}>
              <Link
                href={`/arg/${t.slug}`}
                className="block rounded px-2 py-1 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
