import { handlers } from "@/server/auth/config";

export const { GET, POST } = handlers;

// PrismaAdapter usa o engine binário do Prisma → Node runtime obrigatório.
export const runtime = "nodejs";
