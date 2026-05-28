export function getBaseUrl(): string {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${stripTrailingSlash(vercel)}`;

  return "http://localhost:3000";
}

function stripTrailingSlash(s: string): string {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

export const SITE_NAME = "DEBATI - The Argument Database";
export const SITE_DESCRIPTION = "Plataforma social de debates e argumentos organizados por assunto.";
export const SITE_LOCALE = "pt_BR";
