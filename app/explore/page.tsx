import Link from "next/link";
import type { Metadata } from "next";
import { listTrendingTopics } from "@/server/db/queries/topics";

export const metadata: Metadata = {
  title: "Explorar",
  description: "Assuntos mais ativos no Banco de Argumentos.",
  alternates: { canonical: "/explore" },
};

export const revalidate = 300; // 5 min

export default async function ExplorePage() {
  const topics = await listTrendingTopics(60);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Explorar</h1>
        <p className="text-sm text-foreground/70">
          Assuntos mais ativos nos últimos 7 dias.
        </p>
      </header>

      {topics.length === 0 ? (
        <div className="py-12 text-center text-sm text-foreground/60 space-y-3">
          <p>Nenhum assunto ainda.</p>
          <Link
            href="/create"
            className="inline-block rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Criar o primeiro
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topics.map((t) => (
            <li key={t.id}>
              <Link
                href={`/arg/${t.slug}`}
                className="block rounded-lg border border-black/10 dark:border-white/15 p-4 hover:bg-black/[.04] dark:hover:bg-white/[.06] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.name}</div>
                    <p className="mt-0.5 text-xs text-foreground/60">/arg/{t.slug}</p>
                  </div>
                  {t.recentArguments > 0 && (
                    <span className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-xs tabular-nums">
                      {t.recentArguments} novo{t.recentArguments === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                {t.description && (
                  <p className="mt-2 text-sm text-foreground/80 line-clamp-2">{t.description}</p>
                )}
                <p className="mt-2 text-xs text-foreground/60">
                  {t.totalArguments} argumento{t.totalArguments === 1 ? "" : "s"} no total
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
