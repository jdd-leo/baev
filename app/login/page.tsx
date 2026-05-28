import { getCurrentUser } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { LoginButton } from "./login-button";

export const metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const user = await getCurrentUser();
  const { callbackUrl } = await searchParams;
  if (user) redirect(callbackUrl ?? "/");

  return (
    <div className="mx-auto max-w-sm py-16 text-center space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
      <p className="text-sm text-foreground/70">
        Use sua conta Google para criar argumentos e votar.
      </p>
      <LoginButton callbackUrl={callbackUrl} />
    </div>
  );
}
