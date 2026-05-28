import { prisma } from "@/server/db/client";
import type { Prisma } from "@prisma/client";
import type { ArgumentListItem } from "./arguments";

export type FeedTab = "recent" | "popular" | "favorites";

const LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  content: true,
  image: true,
  score: true,
  upvotes: true,
  downvotes: true,
  hotScore: true,
  createdAt: true,
  author: { select: { id: true, username: true, image: true, name: true } },
  topic: { select: { slug: true, name: true } },
  _count: { select: { replies: true } },
} satisfies Prisma.ArgumentSelect;

const POPULAR_WINDOW_DAYS = 7;

export type FeedCursor = { hotScore?: number; createdAt?: string; id: string };

export async function getFeed(params: {
  tab: FeedTab;
  userId?: string;
  limit?: number;
  cursor?: FeedCursor;
}): Promise<{ items: ArgumentListItem[]; nextCursor: FeedCursor | null }> {
  const limit = Math.min(params.limit ?? 20, 50);

  let where: Prisma.ArgumentWhereInput = {
    parentArgumentId: null,
    deletedAt: null,
  };
  let orderBy: Prisma.ArgumentOrderByWithRelationInput[];

  switch (params.tab) {
    case "recent":
      orderBy = [{ createdAt: "desc" }, { id: "desc" }];
      break;
    case "popular": {
      const since = new Date(Date.now() - POPULAR_WINDOW_DAYS * 24 * 60 * 60 * 1000);
      where = { ...where, createdAt: { gte: since } };
      orderBy = [{ hotScore: "desc" }, { id: "desc" }];
      break;
    }
    case "favorites":
      if (!params.userId) return { items: [], nextCursor: null };
      where = {
        ...where,
        topic: { favorites: { some: { userId: params.userId } } },
      };
      orderBy = [{ hotScore: "desc" }, { id: "desc" }];
      break;
  }

  const items = await prisma.argument.findMany({
    where,
    orderBy,
    take: limit + 1,
    ...(params.cursor ? { cursor: { id: params.cursor.id }, skip: 1 } : {}),
    select: LIST_SELECT,
  });

  let nextCursor: FeedCursor | null = null;
  if (items.length > limit) {
    const last = items.pop()!;
    nextCursor =
      params.tab === "recent"
        ? { createdAt: last.createdAt.toISOString(), id: last.id }
        : { hotScore: last.hotScore, id: last.id };
  }

  return { items, nextCursor };
}

export async function getFavoriteTopics(userId: string) {
  return prisma.topicFavorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { topic: { select: { id: true, slug: true, name: true } } },
  });
}

export async function isTopicFavoritedBy(userId: string, topicId: string): Promise<boolean> {
  const fav = await prisma.topicFavorite.findUnique({
    where: { userId_topicId: { userId, topicId } },
    select: { topicId: true },
  });
  return !!fav;
}
