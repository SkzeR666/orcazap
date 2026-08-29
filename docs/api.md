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

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/signup` | Cria usuário + negócio (plano **free**) + sessão. Body: `name, email, password, businessName?` |
| POST | `/api/auth/login` | Body: `email, password` |
| POST | `/api/auth/logout` | Encerra a sessão |
| GET | `/api/auth/me` | Usuário, negócio, plano (limites/recursos) e uso atual |

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
| PUT/DELETE | `/api/business/logo` | Define/remove logo (data URL) — Pro/Negócio |
| PATCH | `/api/business/branding` | `removed: bool` — remover marca OrçaZap (Pro/Negócio) |
| PUT/DELETE | `/api/business/template` | Modelo de mensagem personalizado (Pro/Negócio). DELETE volta ao padrão |

## Clientes e Serviços

| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/clients` | Lista/cria (cap free: 10) |
| GET/PATCH/DELETE | `/api/clients/{id}` | — |
| GET/POST | `/api/services` | Lista/cria (cap free: 10). `price` ou `priceCents` |
| GET/PATCH/DELETE | `/api/services/{id}` | — |

## Orçamentos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/quotes?status=` | Lista (free: só últimos 30 dias) |
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
| POST | `/api/webhooks/pix` | Confirmação do provedor. Body: `txid, status?`. Header `x-webhook-secret` se `ORCAZAP_WEBHOOK_SECRET` estiver definido |

## Variáveis de ambiente

| Var | Padrão | Uso |
|---|---|---|
| `ORCAZAP_DB_PATH` | `.data/orcazap.db` | Caminho do SQLite |
| `ORCAZAP_PUBLIC_URL` | origem da requisição | Base dos links públicos de orçamento |
| `ORCAZAP_WEBHOOK_SECRET` | — | Se definido, exige o header no webhook Pix |
