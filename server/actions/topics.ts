"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";

const cuidSchema = z.string().cuid();

export async function toggleFavoriteTopic(
  topicId: string,
): Promise<{ favorited: boolean }> {
  const user = await requireUser();
  const id = cuidSchema.parse(topicId);

  await checkRateLimit({
    action: "favoriteTopic",
    identifier: user.id,
    limit: 30,
    windowSec: 60,
  });

  const topic = await prisma.topic.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!topic) throw new Error("Assunto não encontrado.");

  const existing = await prisma.topicFavorite.findUnique({
    where: { userId_topicId: { userId: user.id, topicId: id } },
    select: { topicId: true },
  });

  let favorited: boolean;
  if (existing) {
    await prisma.topicFavorite.delete({
      where: { userId_topicId: { userId: user.id, topicId: id } },
    });
    favorited = false;
  } else {
    await prisma.topicFavorite.create({
      data: { userId: user.id, topicId: id },
    });
    favorited = true;
  }

  revalidatePath(`/arg/${topic.slug}`);
  revalidatePath("/");

  return { favorited };
}
