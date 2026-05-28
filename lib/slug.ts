const NON_SLUG = /[^a-z0-9]+/g;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(NON_SLUG, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function usernameFromEmail(email: string, name?: string | null): string {
  const base = name ? slugify(name) : slugify(email.split("@")[0] ?? "");
  return base || "user";
}
