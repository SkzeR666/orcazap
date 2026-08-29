import { cn } from "@/lib/cn";

type Cols = 1 | 2 | 3 | 4;

const colClass: Record<Cols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

export function PageStack({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-[var(--space)]", className)}>
      {children}
    </div>
  );
}

export function DashGrid({
  cols = 2,
  equal = false,
  className,
  children,
}: {
  cols?: Cols;
  equal?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid w-full items-stretch gap-[var(--space)]",
        colClass[cols],
        equal && "auto-rows-fr",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Bento alinhado: colunas + linhas.
 * Cards na mesma linha esticam à mesma altura (auto-rows-fr + h-full).
 */
export function BentoGrid({
  children,
  cols = 2,
  className,
}: {
  children: React.ReactNode;
  cols?: 2 | 3;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid w-full items-stretch gap-[var(--space)] auto-rows-fr",
        cols === 2 && "grid-cols-1 md:grid-cols-2",
        cols === 3 && "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GridCell({
  children,
  className,
  span = 1,
}: {
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2;
}) {
  return (
    <div
      className={cn(
        "min-h-0 min-w-0",
        span === 2 && "md:col-span-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
