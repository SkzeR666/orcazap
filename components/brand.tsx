import Link from "next/link";
import { cn } from "@/lib/cn";

type BrandProps = {
  href?: string;
  className?: string;
  markClassName?: string;
};

export function Brand({
  href = "/",
  className,
  markClassName,
}: BrandProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-[var(--zap)] text-[var(--ink)] shadow-[0_8px_24px_rgba(200,245,66,0.35)]",
          markClassName,
        )}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none">
          <path
            d="M7 13.5 11 4l1.2 6.5H17L13 20l-1.1-6.5H7Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--ink)]">
        Orça<span className="text-[var(--forest)]">Zap</span>
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="transition-opacity hover:opacity-80">
      {content}
    </Link>
  );
}
