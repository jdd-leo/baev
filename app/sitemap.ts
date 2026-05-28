import type { MetadataRoute } from "next";
import { prisma } from "@/server/db/client";
import { getBaseUrl } from "@/lib/seo";

const SITEMAP_ARGUMENT_LIMIT = 500;

export const revalidate = 3600; // 1h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const [topics, args] = await Promise.all([
    prisma.topic.findMany({
      select: { slug: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.argument.findMany({
      where: { deletedAt: null, parentArgumentId: null },
      select: { slug: true, updatedAt: true, topic: { select: { slug: true } } },
      orderBy: { hotScore: "desc" },
      take: SITEMAP_ARGUMENT_LIMIT,
    }),
  ]);

  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    ...topics.map((t) => ({
      url: `${baseUrl}/arg/${t.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...args.map((a) => ({
      url: `${baseUrl}/arg/${a.topic.slug}/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
