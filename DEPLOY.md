# Deploy na Vercel + Neon

Guia passo-a-passo para subir o Banco de Argumentos em produção.

**Stack de deploy:**
- Vercel (hosting)
- Neon (Postgres serverless com pooler)
- GitHub (auto-deploy a cada push)

---

## 1. Pré-requisitos
- Conta no [GitHub](https://github.com)
- Conta no [Neon](https://console.neon.tech) (login com GitHub)
- Conta na [Vercel](https://vercel.com) (login com GitHub)
- Credenciais Google OAuth (já configuradas em dev)

---

## 2. Subir código no GitHub

```bash
# No diretório do projeto:
git add .
git commit -m "deploy: ready for production"

# Criar repo no GitHub via CLI (gh) ou pela web e adicionar como remote:
gh repo create banco-de-argumentos --private --source=. --remote=origin --push

# Ou manualmente:
# git remote add origin git@github.com:<seu-usuario>/banco-de-argumentos.git
# git push -u origin main
```

---

## 3. Criar projeto Neon

1. Acesse https://console.neon.tech → **New Project**
2. Nome: `banco-de-argumentos`, região mais próxima do seu público
3. Postgres version: 16 (mesma do dev)
4. Após criar, vá em **Connection Details** e copie **DUAS** connection strings:

   **Pooled** (uso normal, com `-pooler` no host):
   ```
   postgresql://USER:PASS@ep-XXX-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```

   **Direct** (sem `-pooler`, para `prisma migrate`):
   ```
   postgresql://USER:PASS@ep-XXX.region.aws.neon.tech/neondb?sslmode=require
   ```

   Na UI do Neon: toggle "**Connection pooling**" mostra/esconde o `-pooler`. Copie as duas.

---

## 4. Importar projeto na Vercel

1. https://vercel.com/new → selecione seu repo
2. **Framework Preset**: Next.js (auto-detectado)
3. **Build Command**: deixe vazio (Vercel usa `vercel-build` do `package.json` automaticamente)
4. **Root Directory**: `./` (default)
5. Antes de clicar em **Deploy**, expanda **Environment Variables** e adicione:

   | Nome | Valor |
   |------|-------|
   | `DATABASE_URL` | string pooled do Neon |
   | `DIRECT_URL` | string direct do Neon |
   | `AUTH_SECRET` | gere local com `openssl rand -base64 32` |
   | `AUTH_GOOGLE_ID` | mesma do dev |
   | `AUTH_GOOGLE_SECRET` | mesma do dev |
   | `APP_URL` | `https://<projeto>.vercel.app` (você sabe o nome após o primeiro deploy — pode atualizar depois) |

   > **Não precisa setar `AUTH_URL`** — Auth.js v5 detecta via `VERCEL_URL`.

6. Clique em **Deploy**. A primeira build vai:
   - Rodar `npm install`
   - Rodar `prisma generate` (postinstall)
   - Rodar `prisma migrate deploy` (aplica todas as migrations no Neon)
   - Rodar `next build`

   Vai falhar a primeira vez se `DATABASE_URL` estiver errada ou se as migrations não rodarem. Veja o log de build na Vercel para diagnosticar.

---

## 5. Popular assuntos iniciais (opcional)

A seed cria 5 topics de exemplo. Como usuários podem criar topics on-the-fly, isso é opcional — sirvam só como inspiração.

```bash
# Localmente, apontando para o Neon:
DATABASE_URL="<string direct do Neon>" npm run db:seed
```

---

## 6. Atualizar Google OAuth callback

Sem isso, o login com Google falha em produção.

1. https://console.cloud.google.com/apis/credentials
2. Edite o OAuth 2.0 Client ID
3. Em **Authorized redirect URIs**, adicione:
   ```
   https://<projeto>.vercel.app/api/auth/callback/google
   ```
4. Salve

> Mantenha também `http://localhost:3000/api/auth/callback/google` para continuar testando local.

---

## 7. Atualizar `APP_URL` na Vercel

Após o primeiro deploy você descobre o domínio (algo como `banco-de-argumentos.vercel.app`).

1. Vercel dashboard → seu projeto → **Settings** → **Environment Variables**
2. Edite `APP_URL` para `https://<projeto>.vercel.app`
3. **Redeploy** (Settings → Deployments → ⋯ → Redeploy) para o sitemap/OG/canonical refletirem

---

## 8. Verificação

Acesse `https://<projeto>.vercel.app`:

- [ ] Home carrega
- [ ] Login com Google funciona (cria usuário no Neon)
- [ ] Criar argumento funciona (incluindo criação de topic novo)
- [ ] Voto persiste após refresh
- [ ] `/robots.txt` retorna `Host: https://<projeto>.vercel.app`
- [ ] `/sitemap.xml` lista os argumentos criados
- [ ] OG dinâmico: `https://<projeto>.vercel.app/arg/<topic>/<slug>/opengraph-image`

Se algum link tem `localhost` em produção, é porque `APP_URL` não foi atualizada — refaça o passo 7.

---

## 9. Deploys subsequentes

Toda `git push origin main` dispara deploy automático. Pull requests geram **Preview Deployments** com URLs `https://<projeto>-<branch>-<hash>.vercel.app` (use a mesma callback do Google? Sim, com `*` wildcard se houver muitos branches — ou só não teste login em previews).

---

## Troubleshooting

**`P3009 migrate found failed migrations`** durante build:
Uma migration deu erro. No Neon SQL Editor, rode:
```sql
SELECT * FROM "_prisma_migrations" WHERE finished_at IS NULL;
```
Veja qual ficou pendente e resolva manualmente.

**`prepared statement "s1" does not exist`** em runtime:
Você está usando o pooler com modo `transaction` mas o Prisma precisa de prepared statements. Solução: `DATABASE_URL` deve ter `?pgbouncer=true&connect_timeout=10` no final:
```
postgresql://...?sslmode=require&pgbouncer=true&connect_timeout=10
```

**OAuth `redirect_uri_mismatch`**:
A callback URL configurada no Google não bate com a do deploy. Confira passo 6.

**Build trava em `Collecting page data`**:
Provavelmente alguma página tenta acessar o banco em build-time e o `DATABASE_URL` está vazio/errado. Confira env vars na Vercel.
