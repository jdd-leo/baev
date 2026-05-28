import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">404</h1>
      <p className="text-sm text-foreground/70">Não encontramos o que você procura.</p>
      <Link
        href="/"
        className="inline-block rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
