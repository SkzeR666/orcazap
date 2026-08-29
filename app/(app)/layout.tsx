"use client";

import { AppChrome, AppSidebar, MobileNav } from "@/components/app-shell";
import { CreateModals } from "@/components/create-modals";
import { ShellProvider, useShell } from "@/components/shell-context";
import { cn } from "@/lib/cn";

function ShellFrame({ children }: { children: React.ReactNode }) {
  const { collapsed } = useShell();

  return (
    <div
      className={cn(
        "grid min-h-screen grid-cols-1 bg-[var(--dash-bg)] text-[var(--dash-fg)] transition-[grid-template-columns] duration-200",
        collapsed
          ? "lg:grid-cols-[56px_minmax(0,1fr)]"
          : "lg:grid-cols-[280px_minmax(0,1fr)]",
      )}
    >
      <div className="sticky top-0 z-20 hidden h-screen lg:block">
        <AppSidebar />
      </div>
      <div className="flex min-h-screen min-w-0 flex-col">
        <MobileNav />
        <AppChrome />
        <main className="w-full flex-1 p-[var(--space)]">{children}</main>
      </div>
      <CreateModals />
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShellProvider>
      <ShellFrame>{children}</ShellFrame>
    </ShellProvider>
  );
}
