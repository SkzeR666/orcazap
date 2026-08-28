"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Plus, Wallet } from "lucide-react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/cobrancas", label: "Cobranças", icon: Wallet },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Brand href="/dashboard" />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-colors",
                  active
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "text-[var(--muted)] hover:bg-[var(--mist)] hover:text-[var(--ink)]",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/orcamentos/novo"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--zap)] px-3.5 py-2 text-sm font-semibold text-[var(--ink)] transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" />
          Novo orçamento
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-[var(--line)] px-4 py-2 md:hidden">
        {links.map(({ href, label }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-sm",
                active
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "text-[var(--muted)]",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
