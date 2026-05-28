"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { requireUser } from "@/server/auth/session";
import { createArgumentSchema, replyArgumentSchema } from "@/lib/validation/argument.schema";
import { slugify } from "@/lib/slug";
import { shortId } from "@/lib/ids";
import { checkRateLimit, RateLimitError } from "@/lib/rate-limit";

export type CreateArgumentState = {
  errors?: Partial<Record<"topicName" | "title" | "content" | "image" | "form", string>>;
  values?: { topicName?: string; title?: string; content?: string; image?: string };
};

export async function createArgument(
  _prev: CreateArgumentState,
  formData: FormData,
): Promise<CreateArgumentState> {
  const user = await requireUser();

  try {
    await checkRateLimit({
      action: "createArgument",
      identifier: user.id,
      limit: 5,
      windowSec: 3600,
    });
  } catch (e) {
    if (e instanceof RateLimitError) {
      return { errors: { form: e.message } };
    }
    throw e;
  }

  const raw = {
    topicName: formData.get("topicName")?.toString() ?? "",
    title: formData.get("title")?.toString() ?? "",
    content: formData.get("content")?.toString() ?? "",
    image: formData.get("image")?.toString() ?? "",
    parentArgumentId: formData.get("parentArgumentId")?.toString() ?? "",
  };

  const parsed = createArgumentSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: CreateArgumentState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<CreateArgumentState["errors"]>;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return {
      errors,
      values: { topicName: raw.topicName, title: raw.title, content: raw.content, image: raw.image },
    };
  }

  const { topicName, title, content, image, parentArgumentId } = parsed.data;

  // Upsert do Topic: se o slug derivado já existe, reusa; senão cria.
  const topicSlug = slugify(topicName);
  const topic = await prisma.topic.upsert({
    where: { slug: topicSlug },
    update: {},
    create: { slug: topicSlug, name: topicName },
    select: { id: true, slug: true },
  });

  let depth = 0;
  let rootArgumentId: string | null = null;
  if (parentArgumentId) {
    const parent = await prisma.argument.findUnique({
      where: { id: parentArgumentId },
      select: { id: true, depth: true, rootArgumentId: true, topicId: true, deletedAt: true },
    });
    if (!parent || parent.deletedAt || parent.topicId !== topic.id) {
      return {
        errors: { form: "Argumento pai inválido." },
        values: { topicName: raw.topicName, title: raw.title, content: raw.content, image: raw.image },
      };
    }
    depth = parent.depth + 1;
    rootArgumentId = parent.rootArgumentId ?? parent.id;
  }

  const baseSlug = slugify(title) || "argumento";
  const slug = `${baseSlug}-${shortId(6)}`.slice(0, 80);

  const created = await prisma.argument.create({
    data: {
      slug,
      title,
      content,
      image: image ?? null,
      authorId: user.id,
      topicId: topic.id,
      parentArgumentId: parentArgumentId ?? null,
      rootArgumentId,
      depth,
    },
    select: { slug: true, topic: { select: { slug: true } } },
  });

  revalidatePath(`/arg/${created.topic.slug}`);
  revalidatePath("/");
  if (parentArgumentId && rootArgumentId) {
    const root = await prisma.argument.findUnique({
      where: { id: rootArgumentId },
      select: { slug: true },
    });
    if (root) redirect(`/arg/${created.topic.slug}/${root.slug}#${created.slug}`);
  }

  redirect(`/arg/${created.topic.slug}/${created.slug}`);
}

export type ReplyArgumentState = {
  errors?: Partial<Record<"content" | "image" | "form", string>>;
  values?: { content?: string; image?: string };
  ok?: boolean;
};

export async function replyToArgument(
  _prev: ReplyArgumentState,
  formData: FormData,
): Promise<ReplyArgumentState> {
  const user = await requireUser();

  try {
    await checkRateLimit({
      action: "replyArgument",
      identifier: user.id,
      limit: 15,
      windowSec: 3600,
    });
  } catch (e) {
    if (e instanceof RateLimitError) return { errors: { form: e.message } };
    throw e;
  }

  const raw = {
    parentArgumentId: formData.get("parentArgumentId")?.toString() ?? "",
    content: formData.get("content")?.toString() ?? "",
    image: formData.get("image")?.toString() ?? "",
  };

  const parsed = replyArgumentSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: ReplyArgumentState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ReplyArgumentState["errors"]>;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return { errors, values: { content: raw.content, image: raw.image } };
  }

  const { parentArgumentId, content, image } = parsed.data;

  const parent = await prisma.argument.findUnique({
    where: { id: parentArgumentId },
    select: {
      id: true,
      depth: true,
      rootArgumentId: true,
      topicId: true,
      deletedAt: true,
      topic: { select: { slug: true } },
    },
  });
  if (!parent || parent.deletedAt) {
    return { errors: { form: "Argumento pai não encontrado." }, values: raw };
  }

  const derivedTitle = content.split(/\s+/).slice(0, 12).join(" ").slice(0, 140) || "Resposta";
  const baseSlug = slugify(derivedTitle) || "resposta";
  const slug = `${baseSlug}-${shortId(6)}`.slice(0, 80);
  const rootArgumentId = parent.rootArgumentId ?? parent.id;

  await prisma.argument.create({
    data: {
      slug,
      title: derivedTitle,
      content,
      image: image ?? null,
      authorId: user.id,
      topicId: parent.topicId,
      parentArgumentId: parent.id,
      rootArgumentId,
      depth: parent.depth + 1,
    },
    select: { id: true },
  });

  const rootSlug = await getRootSlug(rootArgumentId);
  revalidatePath(`/arg/${parent.topic.slug}/${rootSlug}`);
  revalidatePath(`/arg/${parent.topic.slug}`);

  return { ok: true };
}

async function getRootSlug(rootId: string): Promise<string> {
  const r = await prisma.argument.findUnique({ where: { id: rootId }, select: { slug: true } });
  return r?.slug ?? "";
}
