"use client";

import { signIn } from "next-auth/react";

export function LoginButton({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: callbackUrl ?? "/" })}
      className="w-full rounded-md bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90"
    >
      Entrar com Google
    </button>
  );
}
