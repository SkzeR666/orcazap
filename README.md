# OrçaZap

**Orce. Cobre. Receba.**

Checkout simples para serviços vendidos pelo WhatsApp.

Micro-SaaS para pequenos prestadores: transformar a conversa com o cliente no fluxo **criar → enviar → aprovar → cobrar → receber** — sem ERP.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

Dados atuais são mock para validar o shell do produto.

## Rodar local

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

- Landing: `/`
- Visão geral: `/dashboard`
- Orçamentos: `/orcamentos`
- Novo orçamento: `/orcamentos/novo`
- Cobranças: `/cobrancas`

## Produto

Resumo completo em [`docs/produto.md`](docs/produto.md).

## Próximos passos

- Auth e multi-tenant
- Persistência (Supabase)
- Link público de orçamento para o cliente
- Cobrança Pix (provedor a definir)
- Envio assistido via WhatsApp
