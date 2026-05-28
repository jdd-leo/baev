import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUserProfileByUsername, getUserArguments } from "@/server/db/queries/users";
import { getUserVotesFor } from "@/server/db/queries/arguments";
import { getCurrentUser } from "@/server/auth/session";
import { LoadMoreList } from "@/components/feed/load-more-list";
import { fetchMoreUser } from "@/server/actions/pagination";

type Params = { username: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getUserProfileByUsername(username);
  if (!profile) return { title: "Usuário não encontrado" };
  const display = profile.name ?? `@${profile.username}`;
  const description = profile.bio ?? `${display} no Banco de Argumentos.`;
  return {
    title: display,
    description,
    alternates: { canonical: `/u/${profile.username}` },
    openGraph: {
      title: display,
      description,
      type: "profile",
      url: `/u/${profile.username}`,
      images: profile.image ? [profile.image] : undefined,
    },
  };
}

export default async function UserProfilePage({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  const [profile, viewer] = await Promise.all([
    getUserProfileByUsername(username),
    getCurrentUser(),
  ]);
  if (!profile) notFound();

  const { items, nextCursor } = await getUserArguments({ userId: profile.id, limit: 20 });
  const votesMap = viewer
    ? await getUserVotesFor(viewer.id, items.map((i) => i.id))
    : new Map();
  const myVotes = Object.fromEntries(votesMap);

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-4 border-b border-black/10 dark:border-white/15 pb-4">
        {profile.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.image}
            alt=""
            className="size-16 rounded-full border border-black/10 dark:border-white/15"
          />
        ) : (
          <div className="size-16 rounded-full bg-foreground/10" />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">
            {profile.name ?? `@${profile.username}`}
          </h1>
          <p className="text-xs text-foreground/60">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-sm text-foreground/80">{profile.bio}</p>}
          <p className="mt-2 text-xs text-foreground/60">
            {profile.argumentCount} argumento{profile.argumentCount === 1 ? "" : "s"} ·
            Membro desde {new Intl.DateTimeFormat("pt-BR", { year: "numeric", month: "long" }).format(profile.createdAt)}
          </p>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground/80">Argumentos</h2>
        <LoadMoreList
          initialItems={items}
          initialMyVotes={myVotes}
          initialCursor={nextCursor}
          isAuthenticated={!!viewer}
          fetcher={fetchMoreUser.bind(null, profile.id)}
          emptyMessage="Este usuário ainda não publicou nada."
        />
      </section>
    </div>
  );
}
