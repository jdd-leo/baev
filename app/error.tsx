"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro global:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Algo deu errado</h1>
      <p className="text-sm text-foreground/70">
        Tente novamente. Se persistir, atualize a página.
      </p>
      {error.digest && (
        <p className="text-xs text-foreground/50 font-mono">ID: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
      >
        Tentar novamente
      </button>
    </div>
  );
}
