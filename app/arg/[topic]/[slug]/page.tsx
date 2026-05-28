import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getArgumentBySlug,
  getArgumentTree,
  getUserVotesFor,
  collectIds,
} from "@/server/db/queries/arguments";
import { getCurrentUser } from "@/server/auth/session";
import { ArgumentTree } from "@/components/argument/argument-tree";
import { ArgumentJsonLd } from "@/components/seo/json-ld";

type Params = { topic: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { topic: topicSlug, slug } = await params;
  const arg = await getArgumentBySlug(slug);
  if (!arg) return { title: "Argumento não encontrado" };
  const description = arg.content.slice(0, 160);
  const canonical = `/arg/${arg.topic.slug}/${arg.slug}`;
  return {
    title: arg.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: arg.title,
      description,
      type: "article",
      url: canonical,
      images: arg.image ? [arg.image] : undefined,
      authors: [arg.author.username],
      publishedTime: arg.createdAt.toISOString(),
      modifiedTime: arg.updatedAt.toISOString(),
      section: arg.topic.name,
    },
    twitter: {
      card: "summary_large_image",
      title: arg.title,
      description,
    },
  };
}

export default async function ArgumentPage({ params }: { params: Promise<Params> }) {
  const { topic: topicSlug, slug } = await params;
  const arg = await getArgumentBySlug(slug);
  if (!arg || arg.topic.slug !== topicSlug) notFound();

  // Se este argumento é raiz, busca a árvore a partir dele;
  // se for filho, redireciona conceitualmente para o root (URL canônica).
  const rootId = arg.rootArgumentId ?? arg.id;

  const [tree, user] = await Promise.all([getArgumentTree(rootId), getCurrentUser()]);
  if (!tree) notFound();

  const ids = collectIds(tree);
  const myVotes = user ? await getUserVotesFor(user.id, ids) : new Map();

  return (
    <div className="space-y-5">
      <ArgumentJsonLd arg={arg} />

      <nav className="text-xs text-foreground/60">
        <Link href={`/arg/${arg.topic.slug}`} className="hover:underline">
          ← {arg.topic.name}
        </Link>
      </nav>

      <ArgumentTree node={tree} myVotes={myVotes} isAuthenticated={!!user} />
    </div>
  );
}
