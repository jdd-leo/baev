import { getCurrentUser } from "@/server/auth/session";
import { getFeed, type FeedTab } from "@/server/db/queries/feed";
import { getUserVotesFor } from "@/server/db/queries/arguments";
import { FeedTabs } from "@/components/feed/feed-tabs";
import { FeedSidebar } from "@/components/feed/sidebar";
import { LoadMoreList } from "@/components/feed/load-more-list";
import { fetchMoreFeed } from "@/server/actions/pagination";

type Search = { tab?: string };

function parseTab(input: string | undefined, isAuthenticated: boolean): FeedTab {
  if (input === "recent") return "recent";
  if (input === "favorites" && isAuthenticated) return "favorites";
  return "popular";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const [user, sp] = await Promise.all([getCurrentUser(), searchParams]);
  const tab = parseTab(sp.tab, !!user);

  const { items, nextCursor } = await getFeed({ tab, userId: user?.id });
  const votesMap = user ? await getUserVotesFor(user.id, items.map((i) => i.id)) : new Map();
  const myVotes = Object.fromEntries(votesMap);

  const emptyMessage =
    tab === "favorites"
      ? "Favorite assuntos para vê-los aqui."
      : tab === "popular"
        ? "Sem argumentos populares nos últimos 7 dias."
        : "Nenhum argumento ainda.";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
      <div className="space-y-4">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Baev - The Argument Database</h1>
          <FeedTabs current={tab} isAuthenticated={!!user} />
        </header>
        <LoadMoreList
          initialItems={items}
          initialMyVotes={myVotes}
          initialCursor={nextCursor}
          isAuthenticated={!!user}
          fetcher={fetchMoreFeed.bind(null, tab)}
          emptyMessage={emptyMessage}
        />
      </div>
      <FeedSidebar userId={user?.id} />
    </div>
  );
}
