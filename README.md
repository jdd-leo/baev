# Banco de Argumentos

Plataforma social de debates organizados por assunto. Usuários autenticam com Google, criam argumentos (até 500 caracteres) dentro de um assunto, respondem com contra-argumentos infinitos e votam (up/down).

## Stack

- Next.js 16 (App Router, Server Components, Server Actions, Turbopack)
- TypeScript estrito
- TailwindCSS 4
- Prisma 6 + PostgreSQL 16
- Auth.js v5 (Google OAuth, JWT strategy)
- Zod (validação)
- Rate limit baseado em Postgres
- Hospedagem: Vercel + Neon

## Setup local

### 1. Pré-requisitos
- Node.js 22+
- Docker + Docker Compose

### 2. Variáveis de ambiente
```bash
cp .env.example .env
```
Preencha:
- `AUTH_SECRET` — gere com `openssl rand -base64 32`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google Cloud Console → APIs & Services → Credentials. Redirect URI: `http://localhost:3000/api/auth/callback/google`
- `DATABASE_URL` e `DIRECT_URL` — em dev local apontam para o mesmo endpoint do Docker

### 3. Banco de dados
```bash
docker compose up -d         # Postgres na porta 5433
npm install
npm run db:migrate           # aplica migrations
npm run db:seed              # cria 5 assuntos iniciais (opcional)
```

### 4. Rodar
```bash
npm run dev
```
Abra http://localhost:3000.

## Deploy em produção

Veja **[DEPLOY.md](./DEPLOY.md)** — guia passo-a-passo para subir na Vercel com Neon.

## Scripts
| Comando | Função |
|---------|--------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Build de produção |
| `npm run vercel-build` | Build em CI/Vercel (`migrate deploy` + `next build`) |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:seed` | Popular assuntos iniciais |
| `npm run db:studio` | Abrir Prisma Studio |

## Estrutura de pastas

```
app/                    rotas (App Router)
  api/auth/             Auth.js route handler
  arg/[topic]/          listagem + detalhe de argumentos (recursivos)
  create/               criar argumento (Server Action)
  explore/              ranking de assuntos mais ativos
  login/                página de login
  u/[username]/         perfil
  opengraph-image.tsx   OG default + dinâmico por argumento
  robots.ts, sitemap.ts SEO
components/             UI
  argument/             form, node, tree, vote-buttons, reply-form
  feed/                 feed-tabs, sidebar, load-more, skeletons
  layout/               header, user menu
  markdown/             renderer sanitizado
  seo/                  JSON-LD
  topic/                header, favorite toggle
server/
  auth/                 config Auth.js + helpers
  db/queries/           argumentos, topics, feed, users
  actions/              arguments, votes, topics, pagination
lib/                    utilidades puras
  ids.ts                shortId
  ranking.ts            hotScore
  rate-limit.ts         checkRateLimit
  sanitize/             (markdown sanitization via rehype-sanitize)
  seo.ts                getBaseUrl + constantes
  slug.ts               slugify + username
  validation/           schemas Zod
prisma/                 schema, migrations, seed
proxy.ts                Auth.js middleware (Edge)
```

## Roadmap

- [x] **Fase 1** — Setup + Auth + Schema
- [x] **Fase 2** — CRUD de argumentos + markdown sanitizado
- [x] **Fase 3** — Votos + árvore recursiva
- [x] **Fase 4** — Feed (3 abas) + favoritos + perfil + paginação
- [x] **Fase 5** — Rate limit (Postgres) + error/loading boundaries
- [x] **Fase 6** — SEO (sitemap, robots, OG dinâmico, JSON-LD, canonical)
- [x] **Fase 7** — Deploy na Vercel + Neon

## Arquitetura resumida

- **Camadas**: `app/` (UI) → `server/actions/` (mutations, auth, validação) → `server/db/queries/` (Prisma) → `prisma/`.
- **Server-first**: maioria das páginas são Server Components; Client Components só nas folhas interativas (votos, forms, tabs).
- **Mutations**: Server Actions com `useActionState`/`useOptimistic`; rate-limit + Zod no servidor.
- **Recursive tree**: `parentArgumentId` + `rootArgumentId` denormalizado → uma query busca a thread inteira, indexada.
- **Ranking**: `hotScore` à la Reddit recalculado dentro da transação do voto.
- **Auth**: Auth.js v5 com JWT strategy (Edge-compatible), PrismaAdapter envolvido pra injetar `username` no `createUser`.
