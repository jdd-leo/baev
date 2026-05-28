import { prisma } from "@/server/db/client";

export type TopicSummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
};

export async function listTopics(): Promise<TopicSummary[]> {
  return prisma.topic.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, description: true, image: true },
  });
}

export async function getTopicBySlug(slug: string): Promise<TopicSummary | null> {
  return prisma.topic.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, description: true, image: true },
  });
}

export type TrendingTopic = TopicSummary & {
  totalArguments: number;
  recentArguments: number;
};

const TRENDING_WINDOW_DAYS = 7;

export async function listTrendingTopics(limit = 40): Promise<TrendingTopic[]> {
  const since = new Date(Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const rows = await prisma.topic.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      image: true,
      _count: {
        select: {
          arguments: { where: { deletedAt: null } },
        },
      },
      arguments: {
        where: { deletedAt: null, createdAt: { gte: since } },
        select: { id: true },
      },
    },
  });

  return rows
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      description: r.description,
      image: r.image,
      totalArguments: r._count.arguments,
      recentArguments: r.arguments.length,
    }))
    .sort((a, b) => {
      // Mais ativos primeiro (últimos 7d), desempate por total, depois nome.
      if (b.recentArguments !== a.recentArguments) return b.recentArguments - a.recentArguments;
      if (b.totalArguments !== a.totalArguments) return b.totalArguments - a.totalArguments;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}
