"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  Copy,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const LABEL_W = "w-[118px]";

function FieldShell({
  icon: Icon,
  label,
  children,
  className,
  tall,
  tallClass,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
  tall?: boolean;
  tallClass?: string;
}) {
  return (
    <div
      className={cn(
        "group/field flex items-stretch rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-card)] transition-[border-color,box-shadow,background] duration-150",
        tall
          ? cn("flex-1", tallClass ?? "min-h-[160px]")
          : "h-[var(--field-h)]",
        "hover:border-[var(--dash-muted)]",
        "focus-within:border-[var(--dash-accent)] focus-within:shadow-[0_0_0_1px_var(--dash-accent)] focus-within:hover:border-[var(--dash-accent)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 gap-2 border-r border-[var(--dash-border)] bg-[var(--dash-hover)] px-3 text-[12px] font-medium text-[var(--dash-muted)] transition-colors group-hover/field:text-[var(--dash-fg)] group-focus-within/field:text-[var(--dash-fg)]",
          LABEL_W,
          tall ? "items-start pt-3.5" : "items-center",
        )}
      >
        <Icon className="size-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
        <span className="truncate">{label}</span>
      </div>
      <div className={cn("flex min-w-0 flex-1", tall ? "items-stretch" : "items-center")}>
        {children}
      </div>
    </div>
  );
}

type Option = { value: string; label: string; hint?: string };

function BareSelect({
  options,
  value: valueProp,
  defaultValue,
  onChange,
}: {
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [internal, setInternal] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const value = valueProp ?? internal;
  const selected = options.find((o) => o.value === value) ?? options[0];

  function place() {
    const shell = rootRef.current?.closest(".group\\/field") as HTMLElement | null;
    const el = shell ?? btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const menuH = Math.min(options.length * 52 + 20, 320);
    const spaceBelow = window.innerHeight - r.bottom - 10;
    const openUp = spaceBelow < menuH && r.top > spaceBelow;
    setPos({
      top: openUp ? r.top - menuH - 6 : r.bottom + 6,
      left: r.left,
      width: r.width,
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function pick(next: string) {
    setInternal(next);
    onChange?.(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative h-full w-full">
      <button
        ref={btnRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-full w-full items-center justify-between gap-3 px-3.5 text-left text-[13px] text-[var(--dash-ink)]"
      >
        <span className="min-w-0 truncate">{selected?.label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[var(--dash-muted)] transition-transform duration-150",
            open && "rotate-180 text-[var(--dash-ink)]",
          )}
        />
      </button>
      {open && pos
        ? createPortal(
            <ul
              ref={menuRef}
              role="listbox"
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                width: pos.width,
                zIndex: 80,
              }}
              className="max-h-[320px] overflow-auto rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-card)] p-2 shadow-[var(--dash-shadow)]"
            >
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => pick(opt.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-[calc(var(--radius)-1px)] px-3.5 py-3 text-left transition-colors",
                        active
                          ? "bg-[var(--dash-hover)] text-[var(--dash-ink)]"
                          : "text-[var(--dash-fg)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-ink)]",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium leading-snug">
                          {opt.label}
                        </span>
                        {opt.hint ? (
                          <span className="mt-1 block truncate text-[11px] leading-snug text-[var(--dash-muted)]">
                            {opt.hint}
                          </span>
                        ) : null}
                      </span>
                      {active ? (
                        <Check className="size-4 shrink-0 text-[var(--dash-accent)]" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}

function BareSegment({
  options,
  value: valueProp,
  defaultValue,
  onChange,
}: {
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const [internal, setInternal] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const value = valueProp ?? internal;

  return (
    <div
      className="grid h-full w-full gap-1.5 bg-[var(--dash-hover)]/50 p-1.5"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setInternal(opt.value);
              onChange?.(opt.value);
            }}
            className={cn(
              "truncate rounded-[calc(var(--radius)-1px)] px-2.5 text-[12px] font-medium transition-colors duration-150",
              active
                ? "bg-[var(--dash-card)] text-[var(--dash-ink)] shadow-sm"
                : "text-[var(--dash-muted)] hover:bg-[var(--dash-card)]/50 hover:text-[var(--dash-ink)]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function FieldInput({
  icon,
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <FieldShell icon={icon} label={label} className={className}>
      <input
        {...props}
        className="h-full w-full bg-transparent px-3.5 text-[13px] text-[var(--dash-ink)] outline-none placeholder:text-[var(--dash-muted)]"
      />
    </FieldShell>
  );
}

export function FieldTextarea({
  icon,
  label,
  className,
  readOnly,
  compact,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  icon: LucideIcon;
  label: string;
  compact?: boolean;
}) {
  return (
    <FieldShell
      icon={icon}
      label={label}
      className={className}
      tall
      tallClass={compact ? "min-h-[108px]" : undefined}
    >
      <textarea
        {...props}
        readOnly={readOnly}
        className={cn(
          "w-full flex-1 resize-none bg-transparent px-3.5 py-3 text-[13px] leading-5 text-[var(--dash-ink)] outline-none placeholder:text-[var(--dash-muted)]",
          compact ? "min-h-[90px]" : "min-h-[140px] leading-6 py-3.5",
          readOnly && "cursor-default text-[var(--dash-fg)]",
        )}
      />
    </FieldShell>
  );
}

export function FieldSelect({
  icon,
  label,
  options,
  value,
  defaultValue,
  onChange,
  className,
}: {
  icon: LucideIcon;
  label: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <FieldShell icon={icon} label={label} className={className}>
      <BareSelect
        options={options}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
      />
    </FieldShell>
  );
}

export function FieldSegment({
  icon,
  label,
  options,
  value,
  defaultValue,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <FieldShell icon={icon} label={label}>
      <BareSegment
        options={options}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
      />
    </FieldShell>
  );
}

export function FieldToggle({
  icon,
  label,
  hint,
  defaultChecked = false,
  checked,
  onCheckedChange,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
}) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;

  function toggle() {
    const next = !on;
    setInternal(next);
    onCheckedChange?.(next);
  }

  return (
    <FieldShell icon={icon} label={label}>
      <div className="flex h-full w-full items-center justify-between gap-3 px-3.5">
        {hint ? (
          <span className="truncate text-[12px] text-[var(--dash-muted)]">
            {hint}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={toggle}
          className={cn(
            "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150",
            on ? "bg-[var(--dash-accent)]" : "bg-[var(--dash-border)]",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-4 rounded-full bg-[var(--dash-card)] shadow-sm transition-transform duration-150",
              on && "translate-x-4",
            )}
          />
        </button>
      </div>
    </FieldShell>
  );
}

export function FieldUrl({
  value,
  label = "Sua URL",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`https://${value}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <FieldShell icon={Link2} label={label}>
      <div className="flex h-full w-full items-center gap-2 px-3">
        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[var(--dash-ink)]">
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copiado" : "Copiar URL"}
          className="grid size-8 shrink-0 place-items-center rounded-[var(--radius)] text-[var(--dash-muted)] transition-colors hover:bg-[var(--dash-hover)] hover:text-[var(--dash-ink)]"
        >
          {copied ? (
            <Check className="size-3.5 text-[var(--dash-accent)]" />
          ) : (
            <Copy className="size-3.5" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </FieldShell>
  );
}

export function FieldDisplay({
  icon,
  label,
  children,
  className,
  tall,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
  tall?: boolean;
}) {
  return (
    <FieldShell icon={icon} label={label} className={className} tall={tall} tallClass={tall ? "min-h-[88px]" : undefined}>
      <div
        className={cn(
          "flex w-full px-3.5 text-[13px] text-[var(--dash-ink)]",
          tall ? "items-start py-3.5" : "h-full items-center",
        )}
      >
        {children}
      </div>
    </FieldShell>
  );
}

export function FieldAccent({
  icon,
  label = "Cor",
  value,
  onChange,
  options,
}: {
  icon: LucideIcon;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string; swatch: string }[];
}) {
  return (
    <FieldShell icon={icon} label={label}>
      <div
        className="grid h-full w-full gap-1 bg-[var(--dash-hover)]/50 p-1.5"
        style={{
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              title={opt.label}
              aria-label={opt.label}
              aria-pressed={active}
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex h-full min-w-0 items-center justify-center gap-1.5 rounded-[calc(var(--radius)-1px)] px-1 text-[11px] font-medium transition-colors duration-150",
                active
                  ? "bg-[var(--dash-card)] text-[var(--dash-ink)] shadow-sm"
                  : "text-[var(--dash-muted)] hover:bg-[var(--dash-card)]/50 hover:text-[var(--dash-ink)]",
              )}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: opt.swatch }}
              />
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </FieldShell>
  );
}

export function Fields({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-[var(--space)]">{children}</div>;
}

export function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export const ControlInput = (
  props: React.InputHTMLAttributes<HTMLInputElement>,
) => (
  <input
    {...props}
    className={cn(
      "h-full w-full bg-transparent px-3.5 text-[13px] text-[var(--dash-ink)] outline-none placeholder:text-[var(--dash-muted)]",
      props.className,
    )}
  />
);

export function SettingRow({
  icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <FieldShell icon={icon} label={label}>
      {children}
    </FieldShell>
  );
}

export const CustomSelect = BareSelect;
export const SegmentedControl = BareSegment;
export const ToggleRow = FieldToggle;
export const SettingsStack = Fields;
