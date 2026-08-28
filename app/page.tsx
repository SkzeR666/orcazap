import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, Zap } from "lucide-react";
import { Brand } from "@/components/brand";

const steps = [
  { title: "Criar", text: "Monte o orçamento em segundos com serviços e preços prontos." },
  { title: "Enviar", text: "Compartilhe um link limpo direto no WhatsApp do cliente." },
  { title: "Aprovar", text: "Cliente confirma o serviço sem PDF, Canva ou conversa perdida." },
  { title: "Cobrar", text: "Gere cobrança Pix e acompanhe o status sem conferência manual." },
  { title: "Receber", text: "Histórico organizado: valor, serviço e pagamento no mesmo lugar." },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,245,66,0.28),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(26,107,69,0.18),transparent_50%),linear-gradient(180deg,#f7fbf8_0%,#eef5f0_55%,#e6f0e9_100%)]"
      />
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute -right-24 top-10 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(200,245,66,0.45),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="hero-shape pointer-events-none absolute -left-16 bottom-24 size-[22rem] rounded-full bg-[radial-gradient(circle,rgba(26,107,69,0.22),transparent_70%)] blur-2xl"
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Brand />
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)] sm:inline"
          >
            Entrar
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-[var(--paper)] transition-transform hover:-translate-y-0.5"
          >
            Abrir app
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-6xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20">
          <div>
            <p className="animate-rise inline-flex items-center gap-2 text-sm font-medium text-[var(--forest)]">
              <Zap className="size-4 text-[var(--forest)]" />
              Micro-SaaS para quem vende pelo WhatsApp
            </p>
            <h1 className="animate-rise-delay mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.95] tracking-tight text-[var(--ink)] sm:text-6xl lg:text-7xl">
              OrçaZap
            </h1>
            <p className="animate-rise-delay mt-5 max-w-md text-lg text-[var(--muted)] sm:text-xl">
              Orce. Cobre. Receba. Um checkout simples para serviços vendidos
              pelo WhatsApp.
            </p>
            <div className="animate-rise-delay-2 mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/orcamentos/novo"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--zap)] px-5 py-3 text-sm font-semibold text-[var(--ink)] shadow-[0_12px_32px_rgba(200,245,66,0.35)] transition-transform hover:-translate-y-0.5"
              >
                Criar primeiro orçamento
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/60 px-5 py-3 text-sm font-medium text-[var(--ink)] backdrop-blur transition-colors hover:bg-white"
              >
                Ver visão geral
              </Link>
            </div>
          </div>

          <div className="animate-rise-delay-2 relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(160deg,#0c1f17_0%,#164f34_48%,#1a6b45_100%)] p-6 text-[var(--paper)] shadow-[0_30px_80px_rgba(12,31,23,0.28)] sm:min-h-[26rem] sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(200,245,66,0.35),transparent_35%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                  <MessageCircle className="size-3.5" />
                  Fluxo WhatsApp
                </p>
                <p className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
                  criar → enviar → aprovar → cobrar → receber
                </p>
                <p className="mt-4 max-w-sm text-sm text-white/75">
                  Sem ERP. Sem CRM gigante. Só a operação que o prestador
                  precisa fechar o serviço.
                </p>
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  "Orçamento profissional em mensagem",
                  "Cobrança Pix com status claro",
                  "Histórico de valores e serviços",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--zap)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--line)] bg-white/50 py-16 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
              O problema que resolve
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--muted)]">
              Hoje o prestador responde preço no zap, monta PDF, manda Pix na
              mão e perde o histórico. O OrçaZap organiza só essa parte da
              operação.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((step, index) => (
                <div key={step.title} className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[var(--line)] py-8 text-center text-sm text-[var(--muted)]">
        OrçaZap — orce, cobre e receba pelo WhatsApp.
      </footer>
    </div>
  );
}
