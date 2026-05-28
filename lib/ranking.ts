// Adaptação do "Hot" algorithm do Reddit.
// Maior peso para votos absolutos, decai pelo tempo (45.000s ≈ 12,5h por unidade de log).
const EPOCH_BASE = 1_700_000_000;
const TIME_DIVISOR = 45_000;

export function hotScore(upvotes: number, downvotes: number, createdAt: Date): number {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = createdAt.getTime() / 1000 - EPOCH_BASE;
  return Number((sign * order + seconds / TIME_DIVISOR).toFixed(7));
}
