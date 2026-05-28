import { z } from "zod";
import { slugify } from "@/lib/slug";

export const ARGUMENT_CONTENT_MAX = 500;
export const ARGUMENT_TITLE_MAX = 140;
export const TOPIC_NAME_MIN = 2;
export const TOPIC_NAME_MAX = 50;

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined));

// IDs no banco podem ser CUIDs gerados (@default(cuid())) ou strings
// determinísticas usadas em seed (ex: "seed_arg_02"). A validação aqui é
// só sanidade de tamanho — Prisma escapa parâmetros e findUnique retorna
// null para IDs inexistentes.
export const dbIdSchema = z.string().min(1).max(64);

export const topicNameSchema = z
  .string()
  .trim()
  .min(TOPIC_NAME_MIN, `Assunto deve ter ao menos ${TOPIC_NAME_MIN} caracteres.`)
  .max(TOPIC_NAME_MAX, `Assunto acima de ${TOPIC_NAME_MAX} caracteres.`)
  .refine((v) => slugify(v).length > 0, "Assunto deve conter ao menos uma letra ou número.");

export const createArgumentSchema = z.object({
  topicName: topicNameSchema,
  title: z
    .string()
    .trim()
    .min(3, "Título deve ter ao menos 3 caracteres.")
    .max(ARGUMENT_TITLE_MAX, `Título acima de ${ARGUMENT_TITLE_MAX} caracteres.`),
  content: z
    .string()
    .trim()
    .min(10, "Conteúdo deve ter ao menos 10 caracteres.")
    .max(ARGUMENT_CONTENT_MAX, `Conteúdo acima de ${ARGUMENT_CONTENT_MAX} caracteres.`),
  image: optionalString.pipe(z.string().url("URL inválida.").max(2000).optional()),
  parentArgumentId: optionalString.pipe(dbIdSchema.optional()),
});

export type CreateArgumentInput = z.infer<typeof createArgumentSchema>;

export const replyArgumentSchema = z.object({
  parentArgumentId: z
    .string()
    .min(1, "Argumento pai inválido.")
    .max(64, "Argumento pai inválido."),
  content: z
    .string()
    .trim()
    .min(10, "Conteúdo deve ter ao menos 10 caracteres.")
    .max(ARGUMENT_CONTENT_MAX, `Conteúdo acima de ${ARGUMENT_CONTENT_MAX} caracteres.`),
  image: optionalString.pipe(z.string().url("URL inválida.").max(2000).optional()),
});

export type ReplyArgumentInput = z.infer<typeof replyArgumentSchema>;
