"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { replyToArgument, type ReplyArgumentState } from "@/server/actions/arguments";
import { ARGUMENT_CONTENT_MAX } from "@/lib/validation/argument.schema";

const INITIAL: ReplyArgumentState = {};

type Props = {
  parentArgumentId: string;
  isAuthenticated: boolean;
};

export function ReplyForm({ parentArgumentId, isAuthenticated }: Props) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [state, action, pending] = useActionState(replyToArgument, INITIAL);
  const fieldId = useId();
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      setContent("");
      setOpen(false);
    }
  }, [state.ok]);

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() =>
          router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
        }
        className="text-xs text-foreground/60 hover:text-foreground"
      >
        Responder
      </button>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-foreground/60 hover:text-foreground"
      >
        Responder
      </button>
    );
  }

  return (
    <form action={action} className="mt-2 space-y-2">
      <input type="hidden" name="parentArgumentId" value={parentArgumentId} />
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor={fieldId} className="text-xs text-foreground/70">
            Seu contra-argumento
          </label>
          <span
            className={`text-xs ${
              content.length > ARGUMENT_CONTENT_MAX ? "text-red-600" : "text-foreground/60"
            }`}
          >
            {content.length}/{ARGUMENT_CONTENT_MAX}
          </span>
        </div>
        <textarea
          id={fieldId}
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={ARGUMENT_CONTENT_MAX}
          required
          autoFocus
          className="mt-1 w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm font-mono"
        />
        {state.errors?.content && <p className="text-xs text-red-600">{state.errors.content}</p>}
      </div>
      {state.errors?.form && <p className="text-xs text-red-600">{state.errors.form}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Publicando…" : "Publicar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setContent("");
          }}
          className="rounded-md px-3 py-1.5 text-xs hover:bg-black/[.04] dark:hover:bg-white/[.06]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
