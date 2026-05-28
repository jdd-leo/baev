"use client";

import { useActionState, useId, useMemo, useState } from "react";
import { createArgument, type CreateArgumentState } from "@/server/actions/arguments";
import {
  ARGUMENT_CONTENT_MAX,
  ARGUMENT_TITLE_MAX,
  TOPIC_NAME_MAX,
} from "@/lib/validation/argument.schema";
import { slugify } from "@/lib/slug";
import type { TopicSummary } from "@/server/db/queries/topics";

const INITIAL: CreateArgumentState = {};

type Props = {
  topics: TopicSummary[];
  defaultTopicName?: string | null;
};

export function ArgumentForm({ topics, defaultTopicName }: Props) {
  const [state, action, pending] = useActionState(createArgument, INITIAL);
  const titleId = useId();
  const contentId = useId();
  const topicId = useId();
  const datalistId = useId();
  const imageId = useId();

  const [topicName, setTopicName] = useState(state.values?.topicName ?? defaultTopicName ?? "");
  const [content, setContent] = useState(state.values?.content ?? "");
  const [title, setTitle] = useState(state.values?.title ?? "");

  const { previewSlug, status } = useMemo(() => {
    const trimmed = topicName.trim();
    if (!trimmed) return { previewSlug: "", status: null as null | "existing" | "new" };
    const slug = slugify(trimmed);
    if (!slug) return { previewSlug: "", status: null };
    const existing = topics.find((t) => t.slug === slug);
    return { previewSlug: slug, status: existing ? "existing" : "new" };
  }, [topicName, topics]);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor={topicId} className="block text-sm font-medium">
          Assunto
        </label>
        <input
          id={topicId}
          name="topicName"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          list={datalistId}
          maxLength={TOPIC_NAME_MAX}
          required
          autoComplete="off"
          placeholder="Ex: Filosofia, Node.js, Política Brasileira…"
          className="w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm"
        />
        <datalist id={datalistId}>
          {topics.map((t) => (
            <option key={t.id} value={t.name} />
          ))}
        </datalist>
        {previewSlug && (
          <p className="text-xs text-foreground/60">
            {status === "existing" ? (
              <>
                Vai postar em <code className="font-mono">/arg/{previewSlug}</code>
              </>
            ) : (
              <>
                Novo assunto — será criado como <code className="font-mono">/arg/{previewSlug}</code>
              </>
            )}
          </p>
        )}
        <FieldError message={state.errors?.topicName} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor={titleId} className="block text-sm font-medium">
            Título
          </label>
          <span className="text-xs text-foreground/60">
            {title.length}/{ARGUMENT_TITLE_MAX}
          </span>
        </div>
        <input
          id={titleId}
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={ARGUMENT_TITLE_MAX}
          required
          className="w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm"
        />
        <FieldError message={state.errors?.title} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor={contentId} className="block text-sm font-medium">
            Conteúdo (markdown)
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
          id={contentId}
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={ARGUMENT_CONTENT_MAX}
          required
          rows={8}
          className="w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm font-mono"
        />
        <FieldError message={state.errors?.content} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={imageId} className="block text-sm font-medium">
          Imagem (URL, opcional)
        </label>
        <input
          id={imageId}
          name="image"
          type="url"
          defaultValue={state.values?.image ?? ""}
          placeholder="https://…"
          className="w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm"
        />
        <FieldError message={state.errors?.image} />
      </div>

      <FieldError message={state.errors?.form} />

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Publicando…" : "Publicar argumento"}
      </button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}
