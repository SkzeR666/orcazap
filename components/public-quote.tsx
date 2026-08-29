"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  QrCode,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { formatBRL } from "@/lib/format";
import {
  LIVE_STEPS,
  type PublicQuote,
  type QuoteStatus,
} from "@/lib/mock";
import { ORCAZAP_QUOTES } from "@/lib/orcazap-quotes";

type Stage =
  | "review"
  | "deposit"
  | "progress"
  | "confirm"
  | "done"
  | "refused";

function stageFromStatus(status: QuoteStatus, liveStep: number): Stage {
  if (status === "recusado") return "refused";
  if (status === "pago") return "done";
  if (status === "cobrado") {
    return liveStep >= LIVE_STEPS.length - 1 ? "confirm" : "progress";
  }
  if (status === "aprovado") return "deposit";
  return "review";
}

function stageLabel(stage: Stage) {
  switch (stage) {
    case "review":
      return "Aguardando aprovação";
    case "deposit":
      return "Aguardando pagamento";
    case "progress":
      return "Em andamento";
    case "confirm":
      return "Confirmar conclusão";
    case "done":
      return "Concluído";
    case "refused":
      return "Recusado";
  }
}

function OrcaMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-[var(--radius)] bg-[var(--dash-accent)] text-[var(--dash-accent-ink)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none">
        <path
          d="M7 13.5 11 4l1.2 6.5H17L13 20l-1.1-6.5H7Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function OrcaQuotePanel() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [ready, setReady] = useState(false);
  const quote = ORCAZAP_QUOTES[index]!;

  useEffect(() => {
    setIndex(Math.floor(Math.random() * ORCAZAP_QUOTES.length));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      setPhase("out");
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % ORCAZAP_QUOTES.length);
        setPhase("in");
      }, 420);
    }, 3 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [ready]);

  const label = quote.kind === "tip" ? "Você sabia?" : quote.name;

  return (
    <div className="flex flex-1 flex-col justify-end pb-12 lg:pb-14">
      <div
        className={cn(
          "ml-auto w-full max-w-xl text-right transition-all duration-[420ms] ease-out",
          phase === "in"
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0",
        )}
      >
        <p className="text-[11px] font-medium tracking-tight text-[var(--dash-muted)]">
          {label}
        </p>
        <p className="mt-2 line-clamp-2 min-h-[calc(1.35em*2)] font-[family-name:var(--font-display)] text-[clamp(1.2rem,2.1vw,1.55rem)] font-medium leading-[1.35] tracking-tight text-[var(--dash-ink)]">
          {quote.text}
        </p>
      </div>
    </div>
  );
}

type PayMethod = "pix" | "card";

function PayModal({
  open,
  onClose,
  amount,
  pixKey,
  onPaid,
}: {
  open: boolean;
  onClose: () => void;
  amount: number;
  pixKey: string;
  onPaid: () => void;
}) {
  const [method, setMethod] = useState<PayMethod>("pix");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMethod("pix");
    setCopied(false);
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  function confirmPaid() {
    onPaid();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pagamento"
      description={formatBRL(amount)}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="dash-btn dash-btn-ghost">
            Fechar
          </button>
          <button
            type="button"
            onClick={confirmPaid}
            className="dash-btn dash-btn-primary"
          >
            Já paguei
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod("pix")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-[var(--radius)] border px-3 py-3 text-[13px] font-medium transition-colors",
              method === "pix"
                ? "border-[color-mix(in_srgb,var(--dash-accent)_45%,var(--dash-border))] bg-[color-mix(in_srgb,var(--dash-accent)_10%,transparent)] text-[var(--dash-ink)]"
                : "border-[var(--dash-border)] text-[var(--dash-muted)] hover:bg-[var(--dash-hover)]",
            )}
          >
            <QrCode className="size-4" strokeWidth={1.75} />
            Pix
          </button>
          <button
            type="button"
            onClick={() => setMethod("card")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-[var(--radius)] border px-3 py-3 text-[13px] font-medium transition-colors",
              method === "card"
                ? "border-[color-mix(in_srgb,var(--dash-accent)_45%,var(--dash-border))] bg-[color-mix(in_srgb,var(--dash-accent)_10%,transparent)] text-[var(--dash-ink)]"
                : "border-[var(--dash-border)] text-[var(--dash-muted)] hover:bg-[var(--dash-hover)]",
            )}
          >
            <CreditCard className="size-4" strokeWidth={1.75} />
            Cartão
          </button>
        </div>

        {method === "pix" ? (
          <div className="space-y-3">
            <div className="flex flex-col items-center rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-bg)] py-6">
              <div className="grid size-40 grid-cols-5 gap-1 rounded-[var(--radius)] bg-white p-3">
                {Array.from({ length: 25 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "rounded-[1px]",
                      [
                        0, 1, 2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 21, 22, 24,
                      ].includes(i)
                        ? "bg-black"
                        : "bg-neutral-200",
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2.5 font-mono text-[12px] text-[var(--dash-ink)]">
                {pixKey}
              </code>
              <button
                type="button"
                onClick={copy}
                className="dash-btn dash-btn-ghost size-[var(--field-h)] shrink-0 px-0"
                aria-label="Copiar chave Pix"
              >
                {copied ? (
                  <Check className="size-4 text-[var(--dash-accent)]" />
                ) : (
                  <Copy className="size-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={confirmPaid}
            className="dash-btn dash-btn-primary w-full"
          >
            Pagar {formatBRL(amount)}
          </button>
        )}
      </div>
    </Modal>
  );
}

export function PublicQuoteView({ quote }: { quote: PublicQuote }) {
  const [stage, setStage] = useState<Stage>(() =>
    stageFromStatus(quote.status, quote.liveStep),
  );
  const [liveStep, setLiveStep] = useState(quote.liveStep);
  const [clientOk, setClientOk] = useState(false);
  const [bizOk, setBizOk] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const showLive = stage === "progress" || stage === "confirm";
  const paid =
    stage === "progress" ||
    stage === "confirm" ||
    stage === "done";

  useEffect(() => {
    if (stage !== "progress") return;
    if (liveStep >= LIVE_STEPS.length - 1) {
      setStage("confirm");
      return;
    }
    const id = window.setInterval(() => {
      setLiveStep((s) => {
        const next = Math.min(s + 1, LIVE_STEPS.length - 1);
        if (next >= LIVE_STEPS.length - 1) setStage("confirm");
        return next;
      });
    }, 3200);
    return () => window.clearInterval(id);
  }, [stage, liveStep]);

  useEffect(() => {
    if (stage !== "confirm") return;
    if (clientOk && bizOk) setStage("done");
  }, [stage, clientOk, bizOk]);

  useEffect(() => {
    if (stage !== "confirm" || !clientOk || bizOk) return;
    const id = window.setTimeout(() => setBizOk(true), 2500);
    return () => window.clearTimeout(id);
  }, [stage, clientOk, bizOk]);

  return (
    <div className="relative min-h-dvh bg-[var(--dash-bg)] text-[var(--dash-fg)]">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between bg-transparent px-10 pt-10 sm:px-12 sm:pt-12 lg:px-14 lg:pt-14">
        <div className="pointer-events-auto flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius)] bg-[var(--dash-accent)] text-[11px] font-semibold text-[var(--dash-accent-ink)]">
            {quote.business.initials}
          </span>
          <p className="truncate text-[14px] font-medium tracking-tight text-[var(--dash-ink)]">
            {quote.business.name}
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2.5">
          <p className="text-[13px] font-medium tracking-tight text-[var(--dash-ink)]">
            Orça<span className="text-[var(--dash-accent)]">Zap</span>
          </p>
          <OrcaMark />
        </div>
      </header>

      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]">
        <section className="flex flex-col border-[var(--dash-border)] bg-[var(--dash-bg)] lg:border-r">
          <div className="flex flex-1 flex-col justify-center py-14 pl-10 pr-10 sm:pl-12 sm:pr-12 lg:pl-14 lg:pr-12">
            <div className="w-full">
              <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-tight text-[var(--dash-ink)]">
                {quote.service}
              </h1>

              <p
                className={cn(
                  "mt-3 text-[12px] font-medium tracking-tight",
                  showLive || stage === "done"
                    ? "text-[var(--dash-accent)]"
                    : "text-[var(--dash-muted)]",
                )}
              >
                {showLive ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 animate-pulse rounded-full bg-[var(--dash-accent)]" />
                    {stageLabel(stage)}
                  </span>
                ) : (
                  stageLabel(stage)
                )}
              </p>

              <div className="mt-10 border-t border-[var(--dash-border)] pt-8">
                <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--dash-muted)] uppercase">
                  Total
                </p>
                <p
                  className={cn(
                    "mt-2 font-[family-name:var(--font-display)] text-[2rem] font-semibold tabular-nums tracking-tight",
                    paid
                      ? "text-[var(--dash-success)]"
                      : "text-[var(--dash-ink)]",
                  )}
                >
                  {formatBRL(quote.amount)}
                </p>
              </div>

              <div className="mt-10 space-y-3">
                {stage === "review" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setStage("deposit");
                        setPayOpen(true);
                      }}
                      className="dash-btn dash-btn-primary dash-btn-lg w-full gap-2"
                    >
                      <Check className="size-4" strokeWidth={2.25} />
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => setStage("refused")}
                      className="dash-btn dash-btn-ghost w-full"
                    >
                      Agora não
                    </button>
                  </>
                ) : null}

                {stage === "deposit" ? (
                  <button
                    type="button"
                    onClick={() => setPayOpen(true)}
                    className="dash-btn dash-btn-primary dash-btn-lg w-full"
                  >
                    Continuar pagamento
                  </button>
                ) : null}

                {stage === "confirm" ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={clientOk}
                      onClick={() => setClientOk(true)}
                      className={cn(
                        "dash-btn dash-btn-lg w-full gap-2",
                        clientOk
                          ? "dash-btn-ghost opacity-70"
                          : "dash-btn-primary",
                      )}
                    >
                      {clientOk ? (
                        <>
                          <CheckCircle2 className="size-4 text-[var(--dash-success)]" />
                          Você confirmou
                        </>
                      ) : (
                        <>
                          <Check className="size-4" strokeWidth={2.25} />
                          Confirmar conclusão
                        </>
                      )}
                    </button>
                    <div
                      className={cn(
                        "flex h-[var(--field-h)] items-center gap-2 rounded-[var(--radius)] border px-3.5 text-[13px]",
                        bizOk
                          ? "border-[color-mix(in_srgb,var(--dash-success)_40%,var(--dash-border))] text-[var(--dash-success)]"
                          : "border-[var(--dash-border)] text-[var(--dash-muted)]",
                      )}
                    >
                      {bizOk ? (
                        <CheckCircle2
                          className="size-4 shrink-0"
                          strokeWidth={1.75}
                        />
                      ) : (
                        <span className="size-1.5 animate-pulse rounded-full bg-[var(--dash-accent)]" />
                      )}
                      {bizOk
                        ? "Prestador confirmou"
                        : "Aguardando o prestador…"}
                    </div>
                  </div>
                ) : null}

                {stage === "done" ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className="size-5 shrink-0 text-[var(--dash-success)]"
                      strokeWidth={1.75}
                    />
                    <p className="text-[14px] font-medium tracking-tight text-[var(--dash-ink)]">
                      Tudo pago
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <aside className="flex min-h-[40dvh] flex-col bg-[var(--dash-card)] pr-10 pl-8 sm:pr-12 lg:min-h-0 lg:pr-14">
          <OrcaQuotePanel />
        </aside>
      </div>

      <PayModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        amount={quote.amount}
        pixKey={quote.pixKey}
        onPaid={() => {
          setLiveStep(0);
          setStage("progress");
        }}
      />
    </div>
  );
}
