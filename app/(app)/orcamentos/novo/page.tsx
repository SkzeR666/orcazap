import Link from "next/link";
import { catalogServices } from "@/lib/mock";
import { formatBRL } from "@/lib/format";

export const metadata = {
  title: "Novo orçamento",
};

export default function NewQuotePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm font-medium text-[var(--forest)]">Passo 1 de 5</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Criar orçamento
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Escolha um serviço do catálogo ou descreva um avulso. Depois você
          envia pelo WhatsApp.
        </p>
      </div>

      <form className="space-y-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--ink)]">Cliente</span>
          <input
            name="client"
            placeholder="Nome do cliente"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none ring-[var(--zap)] placeholder:text-[var(--muted)] focus:ring-2"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--ink)]">WhatsApp</span>
          <input
            name="phone"
            placeholder="(11) 99999-9999"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none ring-[var(--zap)] placeholder:text-[var(--muted)] focus:ring-2"
          />
        </label>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[var(--ink)]">
            Serviço
          </legend>
          <div className="space-y-2">
            {catalogServices.map((service) => (
              <label
                key={service.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 transition-colors hover:border-[var(--forest)] has-[:checked]:border-[var(--forest)] has-[:checked]:bg-[color-mix(in_oklab,var(--zap)_18%,white)]"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="service"
                    value={service.id}
                    className="accent-[var(--forest)]"
                    defaultChecked={service.id === "svc-1"}
                  />
                  <span>{service.name}</span>
                </span>
                <span className="font-semibold text-[var(--ink)]">
                  {formatBRL(service.price)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--ink)]">
            Observações
          </span>
          <textarea
            name="notes"
            rows={3}
            placeholder="Detalhes do serviço, prazo, materiais..."
            className="w-full resize-y rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 outline-none ring-[var(--zap)] placeholder:text-[var(--muted)] focus:ring-2"
          />
        </label>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/orcamentos"
            className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-3 text-sm font-medium text-[var(--ink)]"
          >
            Cancelar
          </Link>
          <button
            type="button"
            className="rounded-full bg-[var(--zap)] px-5 py-3 text-sm font-semibold text-[var(--ink)] shadow-[0_10px_28px_rgba(200,245,66,0.3)]"
          >
            Salvar e preparar envio
          </button>
        </div>
      </form>
    </div>
  );
}
