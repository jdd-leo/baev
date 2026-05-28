import { prisma } from "@/server/db/client";
import type { Prisma } from "@prisma/client";

export type ArgumentSort = "hot" | "new";

export type ArgumentListItem = {
  id: string;
  slug: string;
  title: string;
  content: string;
  image: string | null;
  score: number;
  upvotes: number;
  downvotes: number;
  hotScore: number;
  createdAt: Date;
  author: { id: string; username: string; image: string | null; name: string | null };
  topic: { slug: string; name: string };
  _count: { replies: number };
};

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

type Cursor = { hotScore?: number; createdAt?: string; id: string };

export async function getArgumentsByTopic(params: {
  topicId: string;
  sort: ArgumentSort;
  limit?: number;
  cursor?: Cursor;
}): Promise<{ items: ArgumentListItem[]; nextCursor: Cursor | null }> {
  const limit = Math.min(params.limit ?? 20, 50);

  const where: Prisma.ArgumentWhereInput = {
    topicId: params.topicId,
    parentArgumentId: null,
    deletedAt: null,
  };

  const orderBy: Prisma.ArgumentOrderByWithRelationInput[] =
    params.sort === "hot"
      ? [{ hotScore: "desc" }, { id: "desc" }]
      : [{ createdAt: "desc" }, { id: "desc" }];

  const items = await prisma.argument.findMany({
    where,
    orderBy,
    take: limit + 1,
    ...(params.cursor
      ? {
          cursor: { id: params.cursor.id },
          skip: 1,
        }
      : {}),
    select: LIST_SELECT,
  });

  let nextCursor: Cursor | null = null;
  if (items.length > limit) {
    const last = items.pop()!;
    nextCursor =
      params.sort === "hot"
        ? { hotScore: last.hotScore, id: last.id }
        : { createdAt: last.createdAt.toISOString(), id: last.id };
  }

  return { items, nextCursor };
}

export async function getArgumentBySlug(slug: string) {
  return prisma.argument.findUnique({
    where: { slug },
    select: {
      ...LIST_SELECT,
      parentArgumentId: true,
      rootArgumentId: true,
      updatedAt: true,
    },
  });
}

export type ArgumentTreeNode = ArgumentListItem & {
  parentArgumentId: string | null;
  depth: number;
  replies: ArgumentTreeNode[];
};

/**
 * Busca o argumento raiz + todos os descendentes em uma única query.
 * Usa o índice em rootArgumentId; monta a árvore em memória.
 */
export async function getArgumentTree(rootId: string): Promise<ArgumentTreeNode | null> {
  const rows = await prisma.argument.findMany({
    where: {
      OR: [{ id: rootId }, { rootArgumentId: rootId }],
      deletedAt: null,
    },
    orderBy: [{ depth: "asc" }, { hotScore: "desc" }, { id: "asc" }],
    select: {
      ...LIST_SELECT,
      parentArgumentId: true,
      depth: true,
    },
    take: 500,
  });

  if (rows.length === 0) return null;

  const byId = new Map<string, ArgumentTreeNode>();
  for (const r of rows) byId.set(r.id, { ...r, replies: [] });

  let root: ArgumentTreeNode | null = null;
  for (const node of byId.values()) {
    if (node.id === rootId) {
      root = node;
    } else if (node.parentArgumentId) {
      byId.get(node.parentArgumentId)?.replies.push(node);
    }
  }
  return root;
}

export async function getUserVotesFor(
  userId: string,
  argumentIds: string[],
): Promise<Map<string, "UP" | "DOWN">> {
  if (argumentIds.length === 0) return new Map();
  const votes = await prisma.vote.findMany({
    where: { userId, argumentId: { in: argumentIds } },
    select: { argumentId: true, value: true },
  });
  return new Map(votes.map((v) => [v.argumentId, v.value]));
}

export function collectIds(node: ArgumentTreeNode): string[] {
  const out: string[] = [];
  const walk = (n: ArgumentTreeNode) => {
    out.push(n.id);
    n.replies.forEach(walk);
  };
  walk(node);
  return out;
}
