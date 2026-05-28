import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTopicBySlug } from "@/server/db/queries/topics";
import {
  getArgumentsByTopic,
  getUserVotesFor,
  type ArgumentSort,
} from "@/server/db/queries/arguments";
import { isTopicFavoritedBy } from "@/server/db/queries/feed";
import { getCurrentUser } from "@/server/auth/session";
import { TopicHeader } from "@/components/topic/topic-header";
import { LoadMoreList } from "@/components/feed/load-more-list";
import { fetchMoreTopic } from "@/server/actions/pagination";

type Params = { topic: string };
type Search = { sort?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { topic: slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) return { title: "Assunto não encontrado" };
  const description = topic.description ?? `Argumentos sobre ${topic.name}.`;
  return {
    title: topic.name,
    description,
    alternates: { canonical: `/arg/${topic.slug}` },
    openGraph: {
      title: topic.name,
      description,
      type: "website",
      url: `/arg/${topic.slug}`,
    },
  };
}

function parseSort(input?: string): ArgumentSort {
  return input === "new" ? "new" : "hot";
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const [{ topic: slug }, sp, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  const sort = parseSort(sp.sort);
  const [{ items, nextCursor }, favorited] = await Promise.all([
    getArgumentsByTopic({ topicId: topic.id, sort, limit: 20 }),
    user ? isTopicFavoritedBy(user.id, topic.id) : Promise.resolve(false),
  ]);
  const votesMap = user ? await getUserVotesFor(user.id, items.map((i) => i.id)) : new Map();
  const myVotes = Object.fromEntries(votesMap);

  return (
    <div className="space-y-6">
      <TopicHeader
        topic={topic}
        sort={sort}
        favorited={favorited}
        isAuthenticated={!!user}
      />
      <LoadMoreList
        initialItems={items}
        initialMyVotes={myVotes}
        initialCursor={nextCursor}
        isAuthenticated={!!user}
        fetcher={fetchMoreTopic.bind(null, topic.id, sort)}
        emptyMessage="Nenhum argumento ainda. Seja o primeiro."
      />
    </div>
  );
}
