"use client";

import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

type Props = {
  user: { id: string; username: string; name?: string | null; image?: string | null } | null;
};

export function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-90"
      >
        Entrar com Google
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-2 py-1 text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06]"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="size-6 rounded-full" />
        ) : (
          <div className="size-6 rounded-full bg-foreground/10" />
        )}
        <span className="hidden sm:inline">@{user.username}</span>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-md border border-black/10 dark:border-white/15 bg-background shadow-md py-1 z-50"
          onMouseLeave={() => setOpen(false)}
        >
          <Link
            href={`/u/${user.username}`}
            className="block px-3 py-1.5 text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06]"
            onClick={() => setOpen(false)}
          >
            Meu perfil
          </Link>
          <Link
            href="/create"
            className="block px-3 py-1.5 text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06]"
            onClick={() => setOpen(false)}
          >
            Criar argumento
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
