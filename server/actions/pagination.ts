"use server";

import { z } from "zod";
import { getArgumentsByTopic, getUserVotesFor } from "@/server/db/queries/arguments";
import { getFeed, type FeedTab } from "@/server/db/queries/feed";
import { getUserArguments } from "@/server/db/queries/users";
import { getCurrentUser } from "@/server/auth/session";
import { dbIdSchema } from "@/lib/validation/argument.schema";
import type { ArgumentListItem } from "@/server/db/queries/arguments";

export type Cursor = { hotScore?: number; createdAt?: string; id: string };

export type PageResult = {
  items: ArgumentListItem[];
  myVotes: Record<string, "UP" | "DOWN">;
  nextCursor: Cursor | null;
};

const cursorSchema = z
  .object({
    hotScore: z.number().optional(),
    createdAt: z.string().optional(),
    id: dbIdSchema,
  })
  .nullable();

async function hydrate(items: ArgumentListItem[]): Promise<Record<string, "UP" | "DOWN">> {
  const user = await getCurrentUser();
  if (!user) return {};
  const map = await getUserVotesFor(
    user.id,
    items.map((i) => i.id),
  );
  return Object.fromEntries(map);
}

export async function fetchMoreTopic(
  topicId: string,
  sort: "hot" | "new",
  cursor: Cursor | null,
): Promise<PageResult> {
  const parsedCursor = cursorSchema.parse(cursor);
  const { items, nextCursor } = await getArgumentsByTopic({
    topicId: dbIdSchema.parse(topicId),
    sort,
    cursor: parsedCursor ?? undefined,
  });
  return { items, myVotes: await hydrate(items), nextCursor };
}

export async function fetchMoreFeed(
  tab: FeedTab,
  cursor: Cursor | null,
): Promise<PageResult> {
  const parsedCursor = cursorSchema.parse(cursor);
  const user = await getCurrentUser();
  const { items, nextCursor } = await getFeed({
    tab,
    userId: user?.id,
    cursor: parsedCursor ?? undefined,
  });
  return { items, myVotes: await hydrate(items), nextCursor };
}

export async function fetchMoreUser(
  userId: string,
  cursor: Cursor | null,
): Promise<PageResult> {
  const parsedCursor = cursorSchema.parse(cursor);
  const userIdSafe = dbIdSchema.parse(userId);
  const { items, nextCursor } = await getUserArguments({
    userId: userIdSafe,
    cursor: parsedCursor
      ? { id: parsedCursor.id, createdAt: parsedCursor.createdAt ?? "" }
      : undefined,
  });
  return {
    items,
    myVotes: await hydrate(items),
    nextCursor: nextCursor ? { id: nextCursor.id, createdAt: nextCursor.createdAt } : null,
  };
}
