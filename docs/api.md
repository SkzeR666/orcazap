# OrçaZap — API

Backend completo do OrçaZap: autenticação, multi-tenant, planos com limites/gating,
orçamentos, cobrança **Pix** (BR Code real), **PDF**, relatórios, equipe e link público.

- **Persistência:** `node:sqlite` (embutido no Node 22, sem dependência nativa).
  O banco fica em `.data/orcazap.db` e é criado + populado no primeiro acesso.
- **Runtime:** todas as rotas rodam no runtime Node.js.
- **Dinheiro:** aceito como `amount` (reais, ex.: `19.9`) **ou** `amountCents`
  (inteiro). Respostas trazem os dois.
- **Erros:** envelope `{"error":{"code","message","details"}}`. Limite/recurso
  de plano retorna **HTTP 402** (`code: "plan_limit"`).

## Conta demo (seed)

```
email:    demo@orcazap.app
senha:    orcazap123
negócio:  Estúdio Limpeza Pro (plano Pro)
```

## Autenticação

Sessão via cookie `oz_session` (HttpOnly). Faça login/signup e reutilize o cookie.
Rotas sensíveis têm **rate-limit** por IP/conta (HTTP 429 ao estourar).

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/signup` | Cria usuário + negócio (plano **free**) + sessão. Body: `name, email, password, businessName?`. Retorna `verificationToken` (sem mailer, entregue no corpo; em produção, envie por e-mail) |
| POST | `/api/auth/login` | Body: `email, password` |
| POST | `/api/auth/logout` | Encerra a sessão |
| GET | `/api/auth/me` | Usuário, negócio, plano (limites/recursos) e uso atual |
| POST | `/api/auth/verify` | Confirma e-mail. Body: `token` |
| PUT | `/api/auth/verify` | Reemite token de verificação para o usuário logado |
| POST | `/api/auth/forgot` | Inicia reset de senha. Body: `email`. Retorna `resetToken` (mesma nota do mailer) |
| POST | `/api/auth/reset` | Body: `token, password`. Redefine a senha e revoga todas as sessões |
| POST | `/api/auth/switch` | Troca a org ativa da sessão. Body: `orgId` |

## Multi-negócio e Convites

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/orgs` | Negócios aos quais o usuário pertence + `activeOrgId` |
| GET | `/api/invites/{token}` | Visão pública do convite (negócio, papel, e-mail) |
| POST | `/api/invites/{token}/accept` | Aceita o convite: vincula/cria o usuário, ativa o vínculo e abre sessão. Body: `name?, password?` (senha obrigatória para usuário novo) |

## Planos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/plans` | Tabela pública de planos e preços |
| GET | `/api/subscription` | Plano atual + preços |
| POST | `/api/subscription` | Troca de plano. Body: `plan (free\|pro\|business), cycle (monthly\|annual)` |

Limites e recursos por plano (fonte única: `lib/server/plans.ts`):

| | Grátis | Pro | Negócio |
|---|---:|---:|---:|
| Mensal / Anual | R$ 0 | R$ 19,90 / R$ 199 | R$ 39,90 / R$ 399 |
| Orçamentos | 5/mês | ∞ | ∞ |
| Clientes / Serviços | 10 / 10 | ∞ | ∞ |
| Usuários | 1 | 1 | 3 |
| Histórico | 30 dias | completo | completo |
| PDF / WhatsApp | ✓ | ✓ | ✓ |
| Logo / Sem marca / Modelos / Status ao vivo | — | ✓ | ✓ |
| Relatórios | — | básico | completo |

## Negócio

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/business` | Perfil do negócio + limites/recursos |
| PATCH | `/api/business` | Atualiza perfil. Campos "completos" (segmento, documento, endereço, Pix avançado…) exigem Pro/Negócio |
| GET | `/api/business/logo` | Bytes da logo (imagem); 404 se não houver |
| PUT/DELETE | `/api/business/logo` | Define/remove logo (data URL, ≤512 KB) — Pro/Negócio, admin. Armazenada em tabela própria; o perfil expõe só `hasLogo`/`logoUrl` |
| PATCH | `/api/business/branding` | `removed: bool` — remover marca OrçaZap (Pro/Negócio) |
| PUT/DELETE | `/api/business/template` | Modelo de mensagem personalizado (Pro/Negócio). DELETE volta ao padrão |

## Clientes e Serviços

| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/clients` | Lista (paginada: `?limit=&offset=`, `meta.total`) / cria (cap free: 10) |
| GET/PATCH/DELETE | `/api/clients/{id}` | — |
| GET/POST | `/api/services` | Lista/cria (cap free: 10). `price` ou `priceCents` |
| GET/PATCH/DELETE | `/api/services/{id}` | — |

## Orçamentos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/quotes?status=&limit=&offset=` | Lista paginada (free: só últimos 30 dias); `meta.total` |
| POST | `/api/quotes` | Cria (cap free: 5/mês). `clientId?` ou `clientName`, `serviceName`, `amount`, `notes?`, `live?` |
| GET | `/api/quotes/{id}` | Orçamento + linha do tempo de status |
| PATCH/DELETE | `/api/quotes/{id}` | Edita/remove |
| POST | `/api/quotes/{id}/status` | `action: enviar\|aprovar\|recusar\|cobrar\|pagar` ou `status:` |
| POST | `/api/quotes/{id}/live` | `step` — avança acompanhamento ao vivo (Pro/Negócio) |
| GET | `/api/quotes/{id}/whatsapp` | Mensagem renderizada + link `wa.me` |
| GET | `/api/quotes/{id}/pdf` | PDF profissional (`application/pdf`) |

Fluxo de status: `rascunho → enviado → aprovado → cobrado → pago` (+ `recusado`).
Transições inválidas retornam 400.

## Cobranças (Pix)

| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/charges` | Lista/gera cobrança. POST gera **BR Code** Pix (copia-e-cola, CRC16 válido). `quoteId?`, `amount?`, `pixKey?` |
| GET | `/api/charges/{id}` | — |
| POST | `/api/charges/{id}/paid` | Confirma pagamento e liquida o orçamento |

## Relatórios e Equipe

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/reports` | 402 no free · básico no Pro · completo no Negócio (funil, top clientes, ticket médio) |
| GET/POST | `/api/team` | Lista/convida membros (cap: 1/1/3) |
| DELETE | `/api/team/{id}` | Remove membro/convite |

## Público (link do cliente, sem auth)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/public/quotes/{publicId}` | Visão do cliente (negócio, valor, status, Pix/BR Code) |
| POST | `/api/public/quotes/{publicId}/action` | `action: approve\|refuse\|pay\|confirm` |

## Webhook

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/webhooks/pix` | Confirmação do provedor. Body: `txid, status?, id?`. Autenticidade via **assinatura HMAC-SHA256** no header `x-signature` (sobre o corpo cru) ou `x-webhook-secret`, quando `ORCAZAP_WEBHOOK_SECRET` está definido. **Idempotente** por `id`. Provider plugável em `lib/server/psp.ts` |

## Variáveis de ambiente

| Var | Padrão | Uso |
|---|---|---|
| `ORCAZAP_DB_PATH` | `.data/orcazap.db` | Caminho do SQLite |
| `ORCAZAP_PUBLIC_URL` | origem da requisição | Base dos links públicos de orçamento |
| `ORCAZAP_WEBHOOK_SECRET` | — | Se definido, exige assinatura HMAC ou secret no webhook Pix |

## Testes

Suíte de fumaça ponta a ponta (33 checagens) cobrindo planos, limites, upgrade,
Pix, PDF, convites, reset de senha e permissões:

```bash
npm run dev            # em um terminal
npm run smoke          # em outro (BASE=http://localhost:3000 por padrão)
```

## Migrações

Schema base + migrações versionadas e idempotentes em `lib/server/migrate.ts`
(tabela `_migrations`). Rodam automaticamente ao abrir o banco; novas alterações
de schema entram como um novo passo no array.

## Notas de produção

O que está pronto e o que precisa de serviço externo antes de ir ao ar:

- **Banco:** `node:sqlite` é ótimo para dev e instância única. Para produção
  (durável, multi-instância), troque a camada de `lib/server/db.ts` por
  Postgres/Supabase — os repositórios já isolam o acesso a dados.
- **Pagamento:** o Pix gera BR Code válido e o webhook valida assinatura +
  idempotência, mas a confirmação real depende de um PSP. Implemente
  `PixProvider` em `lib/server/psp.ts` e selecione-o em `getProvider()`.
- **E-mail:** signup/verify/forgot retornam o token no corpo porque não há
  mailer configurado. Em produção, envie o token por e-mail e pare de retorná-lo.
- **Retenção (free, 30 dias):** os dados antigos são **ocultados**, não
  apagados — troque para expurgo se precisar cumprir retenção rígida.
