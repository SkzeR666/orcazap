"use client";

import { useId, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/cn";

type AvatarUploadProps = {
  initials: string;
  label: string;
  hint?: string;
  size?: "md" | "lg";
  className?: string;
  dark?: boolean;
};

export function AvatarUpload({
  initials,
  label,
  hint = "Clique para trocar a foto",
  size = "md",
  className,
  dark = false,
}: AvatarUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const dim = size === "lg" ? "size-14 text-sm" : "size-10 text-[11px]";

  function onPick(file?: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <label
        htmlFor={inputId}
        className={cn(
          "group relative grid shrink-0 cursor-pointer place-items-center overflow-hidden rounded-[3px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)]",
          dim,
          dark
            ? "bg-[var(--dash-hover)] text-[var(--dash-accent)]"
            : "bg-[var(--dash-accent)] text-[var(--dash-accent-ink)]",
        )}
        aria-label={label}
        title={hint}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          initials
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="size-3.5" />
        </span>
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-[var(--dash-ink)]">
          {label}
        </p>
        <p className="truncate text-[11px] text-[var(--dash-muted)]">{hint}</p>
      </div>
    </div>
  );
}
