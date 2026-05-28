import { prisma } from "@/server/db/client";

export class RateLimitError extends Error {
  readonly retryAfterSec: number;
  constructor(message: string, retryAfterSec: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSec = retryAfterSec;
  }
}

type RateLimitOptions = {
  action: string;
  identifier: string; // ex: userId
  limit: number;
  windowSec: number;
};

/**
 * Janela fixa baseada em Postgres.
 * - key composta (action:identifier, windowStart) é PK → upsert atômico.
 * - count incrementado por UPSERT em raw SQL (atômico contra concorrência).
 * - Lança RateLimitError se exceder o limite na janela atual.
 */
export async function checkRateLimit({
  action,
  identifier,
  limit,
  windowSec,
}: RateLimitOptions): Promise<void> {
  const nowSec = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(nowSec / windowSec) * windowSec;
  const expiresAt = new Date((windowStart + windowSec * 2) * 1000);
  const key = `${action}:${identifier}`;

  // INSERT ... ON CONFLICT DO UPDATE retornando o novo count.
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "windowStart", "count", "expiresAt")
    VALUES (${key}, ${windowStart}, 1, ${expiresAt})
    ON CONFLICT ("key", "windowStart")
    DO UPDATE SET "count" = "RateLimit"."count" + 1
    RETURNING "count";
  `;

  const count = rows[0]?.count ?? 1;
  if (count > limit) {
    const retryAfter = windowStart + windowSec - nowSec;
    throw new RateLimitError(
      `Limite atingido. Tente novamente em ${retryAfter}s.`,
      Math.max(retryAfter, 1),
    );
  }
}

/**
 * GC de registros expirados. Pode ser chamado em job/cron.
 * Inofensivo se nunca rodado: linhas velhas ocupam pouco espaço e nunca colidem.
 */
export async function purgeExpiredRateLimits(): Promise<number> {
  const r = await prisma.rateLimit.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return r.count;
}
