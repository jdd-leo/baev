"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/auth/session";
import { hotScore } from "@/lib/ranking";
import { checkRateLimit } from "@/lib/rate-limit";

const voteValueSchema = z.enum(["UP", "DOWN", "NONE"]);

export type VoteValue = "UP" | "DOWN" | null;

export type VoteResult = {
  argumentId: string;
  myVote: VoteValue;
  upvotes: number;
  downvotes: number;
  score: number;
};

export async function voteOnArgument(
  argumentId: string,
  next: VoteValue,
): Promise<VoteResult> {
  const user = await requireUser();
  const parsedValue = voteValueSchema.parse(next ?? "NONE");
  const cuid = z.string().cuid().parse(argumentId);

  await checkRateLimit({
    action: "vote",
    identifier: user.id,
    limit: 60,
    windowSec: 60,
  });

  const result = await prisma.$transaction(async (tx) => {
    const arg = await tx.argument.findUnique({
      where: { id: cuid },
      select: {
        id: true,
        createdAt: true,
        deletedAt: true,
        slug: true,
        rootArgumentId: true,
        topic: { select: { slug: true } },
      },
    });
    if (!arg || arg.deletedAt) throw new Error("Argumento não encontrado.");

    const existing = await tx.vote.findUnique({
      where: { userId_argumentId: { userId: user.id, argumentId: cuid } },
      select: { value: true },
    });

    if (parsedValue === "NONE") {
      if (existing) {
        await tx.vote.delete({
          where: { userId_argumentId: { userId: user.id, argumentId: cuid } },
        });
      }
    } else if (!existing || existing.value !== parsedValue) {
      await tx.vote.upsert({
        where: { userId_argumentId: { userId: user.id, argumentId: cuid } },
        create: { userId: user.id, argumentId: cuid, value: parsedValue },
        update: { value: parsedValue },
      });
    }

    const counts = await tx.vote.groupBy({
      by: ["value"],
      where: { argumentId: cuid },
      _count: { _all: true },
    });
    const upvotes = counts.find((c) => c.value === "UP")?._count._all ?? 0;
    const downvotes = counts.find((c) => c.value === "DOWN")?._count._all ?? 0;
    const score = upvotes - downvotes;

    await tx.argument.update({
      where: { id: cuid },
      data: {
        upvotes,
        downvotes,
        score,
        hotScore: hotScore(upvotes, downvotes, arg.createdAt),
      },
    });

    return {
      result: {
        argumentId: cuid,
        myVote: parsedValue === "NONE" ? null : (parsedValue as VoteValue),
        upvotes,
        downvotes,
        score,
      },
      topicSlug: arg.topic.slug,
      rootArgumentId: arg.rootArgumentId ?? arg.id,
      argSlug: arg.slug,
    };
  });

  revalidatePath(`/arg/${result.topicSlug}`);
  if (result.rootArgumentId === result.result.argumentId) {
    revalidatePath(`/arg/${result.topicSlug}/${result.argSlug}`);
  } else {
    // voto em contra-argumento → re-renderiza a thread inteira
    const root = await prisma.argument.findUnique({
      where: { id: result.rootArgumentId },
      select: { slug: true },
    });
    if (root) revalidatePath(`/arg/${result.topicSlug}/${root.slug}`);
  }

  return result.result;
}
