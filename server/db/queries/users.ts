import { prisma } from "@/server/db/client";
import type { Prisma } from "@prisma/client";
import type { ArgumentListItem } from "./arguments";

export type UserProfile = {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  createdAt: Date;
  argumentCount: number;
};

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      bio: true,
      createdAt: true,
      _count: { select: { arguments: { where: { deletedAt: null } } } },
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    image: user.image,
    bio: user.bio,
    createdAt: user.createdAt,
    argumentCount: user._count.arguments,
  };
}

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

export type UserArgumentsCursor = { createdAt: string; id: string };

export async function getUserArguments(params: {
  userId: string;
  limit?: number;
  cursor?: UserArgumentsCursor;
}): Promise<{ items: ArgumentListItem[]; nextCursor: UserArgumentsCursor | null }> {
  const limit = Math.min(params.limit ?? 20, 50);

  const items = await prisma.argument.findMany({
    where: { authorId: params.userId, deletedAt: null },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(params.cursor ? { cursor: { id: params.cursor.id }, skip: 1 } : {}),
    select: LIST_SELECT,
  });

  let nextCursor: UserArgumentsCursor | null = null;
  if (items.length > limit) {
    const last = items.pop()!;
    nextCursor = { createdAt: last.createdAt.toISOString(), id: last.id };
  }

  return { items, nextCursor };
}
