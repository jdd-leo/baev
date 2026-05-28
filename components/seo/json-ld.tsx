import { getBaseUrl, SITE_NAME } from "@/lib/seo";

export type ArgumentForJsonLd = {
  slug: string;
  title: string;
  content: string;
  image: string | null;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
  author: { username: string; name: string | null };
  topic: { slug: string; name: string };
  _count: { replies: number };
};

/**
 * schema.org DiscussionForumPosting — Google indexa argumentos como threads de fórum.
 * https://developers.google.com/search/docs/appearance/structured-data/discussion-forum
 */
export function ArgumentJsonLd({ arg }: { arg: ArgumentForJsonLd }) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/arg/${arg.topic.slug}/${arg.slug}`;
  const authorName = arg.author.name ?? `@${arg.author.username}`;
  const authorUrl = `${baseUrl}/u/${arg.author.username}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "@id": url,
    url,
    headline: arg.title,
    articleBody: arg.content,
    datePublished: arg.createdAt.toISOString(),
    dateModified: arg.updatedAt.toISOString(),
    inLanguage: "pt-BR",
    image: arg.image ?? undefined,
    author: {
      "@type": "Person",
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: baseUrl,
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: arg.upvotes,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ReplyAction",
        userInteractionCount: arg._count.replies,
      },
    ],
    isPartOf: {
      "@type": "DiscussionForumPosting",
      url: `${baseUrl}/arg/${arg.topic.slug}`,
      name: arg.topic.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify escapa caracteres perigosos; o conteúdo é nosso, não input arbitrário sem sanitização.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
