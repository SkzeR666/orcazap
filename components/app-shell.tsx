"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Puzzle,
  Receipt,
  Search,
  Settings,
  Store,
  Sun,
  Users,
  UsersRound,
  Wallet,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import {
  ACCENTS,
  useShell,
  type CreateModal,
} from "@/components/shell-context";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operação",
    items: [
      { href: "/orcamentos", label: "Orçamentos", icon: FileText },
      { href: "/clientes", label: "Clientes", icon: Users },
      { href: "/catalogo", label: "Catálogo", icon: BookOpen },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/cobrancas", label: "Cobranças", icon: Wallet },
      { href: "/extrato", label: "Extrato", icon: Receipt },
    ],
  },
  {
    label: "Time",
    items: [
      { href: "/equipe", label: "Equipe", icon: UsersRound },
      { href: "/integracoes", label: "Integrações", icon: Puzzle },
    ],
  },
  {
    label: "Conta",
    items: [{ href: "/configuracoes", label: "Conta", icon: Settings }],
  },
];

const notifications = [
  {
    id: "1",
    title: "Pix recebido",
    body: "Marina Costa · R$ 680",
    time: "há 12 min",
    unread: true,
    tone: "success" as const,
  },
  {
    id: "2",
    title: "Orçamento aprovado",
    body: "João Ferreira · instalação",
    time: "há 1 h",
    unread: true,
    tone: "info" as const,
  },
  {
    id: "3",
    title: "Cobrança em aberto",
    body: "Carlos Eduardo · R$ 1.200",
    time: "ontem",
    unread: false,
    tone: "warn" as const,
  },
];

const notifTone = {
  success: "bg-[color-mix(in_srgb,var(--dash-success)_18%,transparent)] text-[var(--dash-success)]",
  info: "bg-[color-mix(in_srgb,var(--dash-accent)_16%,transparent)] text-[var(--dash-accent)]",
  warn: "bg-[color-mix(in_srgb,var(--dash-danger)_16%,transparent)] text-[var(--dash-danger)]",
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const CHROME = "h-[var(--chrome-h)]";
const TOP_H = "h-14";

function BrandMark({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-[var(--radius)] bg-[var(--zap)] text-[var(--ink)]",
        size === "sm" ? "size-7" : "size-8",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={size === "sm" ? "size-3.5" : "size-4"}
        fill="none"
      >
        <path
          d="M7 13.5 11 4l1.2 6.5H17L13 20l-1.1-6.5H7Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function navItemClass(active: boolean, collapsed: boolean) {
  return cn(
    "group relative flex items-center rounded-[var(--radius)] text-[13px] transition-colors duration-150",
    collapsed
      ? "mx-auto size-9 justify-center"
      : "h-10 w-full gap-3 px-3",
    active
      ? "bg-[color-mix(in_srgb,var(--zap)_14%,transparent)] font-medium text-white"
      : "text-[var(--side-fg)] hover:bg-[color-mix(in_srgb,var(--zap)_9%,transparent)]",
  );
}

function ThemePanel({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme, setTheme, accent, setAccent } = useShell();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className={cn("relative", !collapsed && "w-full")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Tema"
        aria-expanded={open}
        className={navItemClass(open, collapsed)}
      >
        {theme === "dark" ? (
          <Moon className="size-4 text-[var(--zap)]" strokeWidth={1.75} />
        ) : (
          <Sun className="size-4 text-[var(--zap)]" strokeWidth={1.75} />
        )}
        {!collapsed ? (
          <>
            <span className="min-w-0 flex-1 truncate text-left">Tema</span>
            <ChevronDown
              className={cn(
                "size-3.5 text-[var(--side-muted)] transition-transform",
                open && "rotate-180",
              )}
            />
          </>
        ) : (
          <span className="sr-only">Tema</span>
        )}
      </button>

      {open ? (
        <div
          className={cn(
            "absolute z-50 rounded-[var(--radius)] border border-white/[0.08] bg-[#121614] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.55)]",
            collapsed
              ? "bottom-0 left-full ml-2.5 w-56"
              : "bottom-full left-0 right-0 mb-2 w-full",
          )}
        >
          <p className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-[var(--side-muted)] uppercase">
            Modo
          </p>
          <div className="grid w-full grid-cols-2 gap-1 rounded-[var(--radius)] bg-black/25 p-1">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex h-9 w-full items-center justify-center gap-1.5 rounded-[calc(var(--radius)-1px)] text-[12px] transition-colors",
                theme === "dark"
                  ? "bg-[color-mix(in_srgb,var(--zap)_20%,transparent)] font-medium text-white"
                  : "text-[var(--side-muted)] hover:bg-white/[0.04] hover:text-[var(--side-fg)]",
              )}
            >
              <Moon className="size-3.5 shrink-0" strokeWidth={1.75} />
              Escuro
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex h-9 w-full items-center justify-center gap-1.5 rounded-[calc(var(--radius)-1px)] text-[12px] transition-colors",
                theme === "light"
                  ? "bg-[color-mix(in_srgb,var(--zap)_20%,transparent)] font-medium text-white"
                  : "text-[var(--side-muted)] hover:bg-white/[0.04] hover:text-[var(--side-fg)]",
              )}
            >
              <Sun className="size-3.5 shrink-0" strokeWidth={1.75} />
              Claro
            </button>
          </div>

          <div
            className="my-3 h-px w-full bg-white/[0.08]"
            aria-hidden
          />

          <p className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-[var(--side-muted)] uppercase">
            Cor
          </p>
          <div className="grid w-full grid-cols-5 gap-1 rounded-[var(--radius)] bg-black/25 p-1">
            {ACCENTS.map((a) => {
              const active = accent === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  title={a.label}
                  aria-label={`Cor ${a.label}`}
                  aria-pressed={active}
                  onClick={() => setAccent(a.id)}
                  className={cn(
                    "flex h-9 flex-col items-center justify-center gap-1 rounded-[calc(var(--radius)-1px)] transition-colors",
                    active
                      ? "bg-[color-mix(in_srgb,var(--zap)_20%,transparent)]"
                      : "hover:bg-white/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "size-3 rounded-full transition-transform",
                      active && "scale-110 ring-2 ring-[var(--zap)]/45 ring-offset-1 ring-offset-[#121614]",
                    )}
                    style={{ background: a.swatch }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useShell();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-[var(--dash-border)] bg-[var(--side-bg)] text-[var(--side-fg)] transition-[width] duration-200 ease-out",
        collapsed ? "w-14" : "w-[280px]",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-[var(--dash-border)]",
          TOP_H,
          collapsed ? "justify-center" : "px-3",
        )}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!collapsed}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className="grid size-9 place-items-center rounded-[var(--radius)] text-[var(--side-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--zap)_9%,transparent)] hover:text-[var(--zap)]"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" strokeWidth={1.75} />
          ) : (
            <PanelLeftClose className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <nav
        className={cn(
          "flex-1 overflow-y-auto py-3",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <div className="flex flex-col gap-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed ? (
                <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-[0.14em] text-[var(--side-muted)] uppercase">
                  {group.label}
                </p>
              ) : (
                <div className="mx-auto mb-1.5 h-px w-4 bg-white/[0.08]" />
              )}
              <ul
                className={cn(
                  "flex flex-col gap-1",
                  collapsed && "items-center",
                )}
              >
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(pathname, href);
                  return (
                    <li key={href} className={collapsed ? undefined : "w-full"}>
                      <Link
                        href={href}
                        title={label}
                        className={navItemClass(active, collapsed)}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors duration-150",
                            active
                              ? "text-[var(--zap)]"
                              : "text-[var(--side-muted)] group-hover:text-[var(--zap)]",
                          )}
                          strokeWidth={1.75}
                        />
                        {!collapsed ? (
                          <span className="truncate">{label}</span>
                        ) : (
                          <span className="sr-only">{label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div
        className={cn(
          "mt-auto shrink-0 border-t border-[var(--dash-border)]",
          collapsed
            ? "flex flex-col items-center gap-1.5 px-2 py-3"
            : "flex flex-col gap-1.5 px-3 py-3",
        )}
      >
        <ThemePanel collapsed={collapsed} />
        <div
          className={cn(
            "shrink-0 bg-[var(--dash-border)]",
            collapsed ? "my-0.5 h-px w-4" : "my-0.5 h-px w-full",
          )}
          aria-hidden
        />
        <Link
          href="/negocio"
          title="Estúdio Limpeza Pro"
          className={navItemClass(isActive(pathname, "/negocio"), collapsed)}
        >
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-[var(--radius)] bg-[color-mix(in_srgb,var(--zap)_16%,transparent)] text-[var(--zap)]",
              collapsed ? "size-full" : "size-6",
            )}
          >
            <Store className="size-3.5" strokeWidth={1.75} />
          </span>
          {!collapsed ? (
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-white">
              Estúdio Limpeza Pro
            </span>
          ) : (
            <span className="sr-only">Estúdio Limpeza Pro</span>
          )}
        </Link>
      </div>
    </aside>
  );
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => n.unread).length;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificações"
        aria-expanded={open}
        className={cn(
          "relative grid place-items-center rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-muted)] transition-colors hover:border-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-ink)]",
          "size-[var(--chrome-h)]",
        )}
      >
        <Bell className="size-3.5" strokeWidth={1.75} />
        {unread > 0 ? (
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[var(--dash-accent)]" />
        ) : null}
      </button>
      {open ? (
        <div className="absolute top-full right-0 z-40 mt-2 w-[320px] overflow-hidden rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-card)] shadow-[var(--dash-shadow)]">
          <div className="flex h-10 items-center justify-between border-b border-[var(--dash-border)] px-3.5">
            <p className="text-[13px] font-semibold text-[var(--dash-ink)]">
              Notificações
            </p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] font-medium text-[var(--dash-accent)] hover:underline"
              >
                Ler todas
              </button>
            ) : (
              <span className="text-[11px] text-[var(--dash-muted)]">
                Tudo lido
              </span>
            )}
          </div>
          <ul>
            {items.map((n) => {
              const Icon =
                n.tone === "success"
                  ? CheckCircle2
                  : n.tone === "warn"
                    ? AlertCircle
                    : FileText;
              return (
                <li
                  key={n.id}
                  className="border-b border-[var(--dash-border)] last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((x) =>
                          x.id === n.id ? { ...x, unread: false } : x,
                        ),
                      )
                    }
                    className={cn(
                      "flex w-full gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[var(--dash-hover)]",
                      n.unread && "bg-[color-mix(in_srgb,var(--dash-accent)_5%,transparent)]",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-[var(--radius)]",
                        notifTone[n.tone],
                      )}
                    >
                      <Icon className="size-3.5" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="truncate text-[13px] font-medium text-[var(--dash-ink)]">
                          {n.title}
                        </span>
                        <span className="shrink-0 text-[10px] text-[var(--dash-muted)]">
                          {n.time}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-[var(--dash-muted)]">
                        {n.body}
                      </span>
                    </span>
                    {n.unread ? (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--dash-accent)]" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Menu da conta"
        className={cn(
          "flex items-center gap-2.5 rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-card)] py-0 pr-3 pl-1.5 transition-colors hover:border-[var(--dash-muted)] hover:bg-[var(--dash-hover)]",
          CHROME,
        )}
      >
        <span className="grid size-7 place-items-center rounded-[3px] bg-[var(--dash-accent)] text-[10px] font-semibold text-[var(--dash-accent-ink)]">
          MC
        </span>
        <span className="hidden max-w-[120px] truncate text-[13px] font-medium text-[var(--dash-ink)] sm:inline">
          Marina
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-[var(--dash-muted)] transition-transform duration-150",
            open && "rotate-180",
          )}
          strokeWidth={1.75}
        />
      </button>
      {open ? (
        <div className="absolute top-full right-0 z-40 mt-2 w-52 overflow-hidden rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-card)] shadow-[var(--dash-shadow)]">
          <div className="border-b border-[var(--dash-border)] px-3 py-2.5">
            <p className="truncate text-[13px] font-medium text-[var(--dash-ink)]">
              Marina Costa
            </p>
            <p className="truncate text-[11px] text-[var(--dash-muted)]">
              Plano Pro
            </p>
          </div>
          <div className="p-1">
            <Link
              href="/configuracoes"
              onClick={() => setOpen(false)}
              className="flex h-9 items-center gap-2 rounded-[var(--radius)] px-2.5 text-[13px] text-[var(--dash-fg)] transition-colors hover:bg-[var(--dash-hover)] hover:text-[var(--dash-ink)]"
            >
              <Settings className="size-3.5 text-[var(--dash-muted)]" />
              Conta
            </Link>
            <Link
              href="/negocio"
              onClick={() => setOpen(false)}
              className="flex h-9 items-center gap-2 rounded-[var(--radius)] px-2.5 text-[13px] text-[var(--dash-fg)] transition-colors hover:bg-[var(--dash-hover)] hover:text-[var(--dash-ink)]"
            >
              <Store className="size-3.5 text-[var(--dash-muted)]" />
              Negócio
            </Link>
            <Link
              href="/"
              className="flex h-9 items-center gap-2 rounded-[var(--radius)] px-2.5 text-[13px] text-[var(--dash-fg)] transition-colors hover:bg-[var(--dash-hover)] hover:text-[var(--dash-ink)]"
            >
              <LogOut className="size-3.5 text-[var(--dash-muted)]" />
              Sair
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function chromeAction(pathname: string): {
  label: string;
  modal?: Exclude<CreateModal, null>;
} | null {
  if (pathname.match(/^\/orcamentos\/[^/]+$/) && !pathname.endsWith("/novo")) {
    return { label: "Enviar WhatsApp" };
  }
  if (pathname.startsWith("/orcamentos") || pathname.startsWith("/dashboard")) {
    return { label: "Novo orçamento", modal: "quote" };
  }
  if (pathname.startsWith("/clientes")) {
    return { label: "Novo cliente", modal: "client" };
  }
  if (pathname.startsWith("/catalogo")) {
    return { label: "Novo serviço", modal: "service" };
  }
  if (pathname.startsWith("/cobrancas")) {
    return { label: "Nova cobrança", modal: "charge" };
  }
  if (pathname.startsWith("/equipe")) {
    return { label: "Convidar", modal: "invite" };
  }
  if (
    pathname.startsWith("/negocio") ||
    pathname.startsWith("/configuracoes")
  ) {
    return { label: "Salvar" };
  }
  if (pathname.startsWith("/integracoes")) {
    return { label: "Conectar" };
  }
  if (pathname.startsWith("/extrato")) {
    return null;
  }
  return { label: "Novo orçamento", modal: "quote" };
}

export function AppChrome() {
  const pathname = usePathname();
  const { openCreate } = useShell();
  const action = chromeAction(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2.5 border-b border-[var(--dash-border)] bg-[var(--dash-bg)]/95 px-[var(--space)] backdrop-blur-md">
      <button
        type="button"
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-card)] px-3 text-left text-[13px] text-[var(--dash-muted)] transition-colors hover:border-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-fg)]",
          CHROME,
        )}
      >
        <Search className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span className="truncate">Buscar orçamento, cliente, cobrança…</span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        {action ? (
          <button
            type="button"
            className="dash-btn dash-btn-primary"
            onClick={() => {
              if (action.modal) openCreate(action.modal);
            }}
          >
            {/^(Novo|Nova|Convidar|Conectar)/.test(action.label) ? (
              <Plus className="size-3.5" />
            ) : null}
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ) : null}
        <UserMenu />
        <NotificationsMenu />
      </div>
    </header>
  );
}

export function PageActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-[var(--space)]">
      {children}
    </div>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { openCreate } = useShell();
  const flat = navGroups.flatMap((g) => g.items);

  return (
    <div className="border-b border-[var(--dash-border)] bg-[var(--side-bg)] lg:hidden">
      <div className="flex h-12 items-center justify-between px-3.5">
        <div className="flex items-center gap-2">
          <BrandMark />
          <span className="text-[13px] font-semibold text-white">OrçaZap</span>
        </div>
        <button
          type="button"
          onClick={() => openCreate("quote")}
          aria-label="Novo orçamento"
          className="grid size-8 place-items-center rounded-[var(--radius)] bg-[var(--dash-accent)] text-[var(--dash-accent-ink)]"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <div className="flex gap-1 overflow-x-auto px-2.5 pb-2.5">
        {flat.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-8 shrink-0 items-center whitespace-nowrap rounded-[var(--radius)] px-2.5 text-[12px] transition-colors",
                active
                  ? "bg-white/[0.1] text-white"
                  : "text-[var(--side-muted)] hover:text-white",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
