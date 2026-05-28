import { requireUser } from "@/server/auth/session";
import { getTopicBySlug, listTopics } from "@/server/db/queries/topics";
import { ArgumentForm } from "@/components/argument/argument-form";

export const metadata = { title: "Criar argumento" };

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  await requireUser();
  const [topics, params] = await Promise.all([listTopics(), searchParams]);

  // ?topic=slug pré-popula com o nome do topic existente (se houver).
  let defaultTopicName: string | null = null;
  if (params.topic) {
    const t = await getTopicBySlug(params.topic);
    defaultTopicName = t?.name ?? params.topic;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Criar argumento</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Escreva de forma clara e objetiva. Máximo de 500 caracteres. Se o assunto não existir,
          ele será criado automaticamente.
        </p>
      </header>
      <ArgumentForm topics={topics} defaultTopicName={defaultTopicName} />
    </div>
  );
}
