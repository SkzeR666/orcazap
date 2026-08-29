"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[var(--space)]">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex max-h-[min(92dvh,800px)] w-full flex-col rounded-[3px] border border-[var(--dash-border)] bg-[var(--dash-card)] shadow-[0_24px_64px_rgba(0,0,0,0.55)]",
          size === "sm" && "max-w-md",
          size === "md" && "max-w-lg",
          size === "lg" && "max-w-2xl",
          size === "xl" && "max-w-4xl",
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-[var(--space)] border-b border-[var(--dash-border)] p-[var(--space)]">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-[15px] font-semibold text-[var(--dash-ink)]"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-[12px] text-[var(--dash-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-[3px] text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-ink)]"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-[var(--space)]">
          {children}
        </div>
        {footer ? (
          <div className="flex shrink-0 items-center justify-end gap-[var(--space)] border-t border-[var(--dash-border)] p-[var(--space)]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
