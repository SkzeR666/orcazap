"use client";

import { Fragment, type ReactNode } from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/cn";

/** WhatsApp-style inline + block formatting (not full Markdown). */
export function renderWhatsAppText(raw: string) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code fence ```
    if (line.trimStart().startsWith("```")) {
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1; // closing ```
      nodes.push(
        <pre
          key={`code-${i}`}
          className="my-1 overflow-x-auto rounded-[4px] bg-black/25 px-2 py-1.5 font-mono text-[12px] leading-5 whitespace-pre-wrap"
        >
          {buf.join("\n")}
        </pre>,
      );
      continue;
    }

    // Block quote
    if (/^>\s?/.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoted.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      nodes.push(
        <div
          key={`q-${i}`}
          className="my-1 border-l-[3px] border-white/35 pl-2 text-[13px] leading-[1.45] text-white/85"
        >
          {quoted.map((q, qi) => (
            <p key={qi}>{renderInline(q)}</p>
          ))}
        </div>,
      );
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i += 1;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-0.5 space-y-0.5 pl-0.5">
          {items.map((item, ii) => (
            <li key={ii} className="flex gap-2 text-[14px] leading-[1.45]">
              <span className="shrink-0 text-white/55">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-0.5 space-y-0.5">
          {items.map((item, ii) => (
            <li key={ii} className="flex gap-2 text-[14px] leading-[1.45]">
              <span className="w-4 shrink-0 text-right text-white/55 tabular-nums">
                {ii + 1}.
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Empty line
    if (line === "") {
      nodes.push(<div key={`br-${i}`} className="h-2" />);
      i += 1;
      continue;
    }

    nodes.push(
      <p key={`p-${i}`} className="text-[14px] leading-[1.45]">
        {renderInline(line)}
      </p>,
    );
    i += 1;
  }

  return nodes;
}

function renderInline(text: string): ReactNode[] {
  // Order: code · bold · italic · strike · urls
  const re =
    /(`[^`]+`)|(\*[^*\n]+\*)|(_[^_\n]+_)|(~[^~\n]+~)|(https?:\/\/[^\s]+)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = re.exec(text))) {
    if (m.index > last) {
      out.push(<Fragment key={`t-${k++}`}>{text.slice(last, m.index)}</Fragment>);
    }
    const token = m[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      out.push(
        <code
          key={`c-${k++}`}
          className="rounded-[3px] bg-black/30 px-1 py-px font-mono text-[12.5px]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      out.push(
        <strong key={`b-${k++}`} className="font-semibold">
          {token.slice(1, -1)}
        </strong>,
      );
    } else if (token.startsWith("_") && token.endsWith("_")) {
      out.push(
        <em key={`i-${k++}`} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith("~") && token.endsWith("~")) {
      out.push(
        <span key={`s-${k++}`} className="line-through opacity-80">
          {token.slice(1, -1)}
        </span>,
      );
    } else if (token.startsWith("http")) {
      out.push(
        <span key={`u-${k++}`} className="underline decoration-white/35">
          {token}
        </span>,
      );
    }
    last = m.index + token.length;
  }

  if (last < text.length) {
    out.push(<Fragment key={`t-${k++}`}>{text.slice(last)}</Fragment>);
  }
  return out;
}

export function buildQuoteMessage({
  name,
  service,
  price,
  notes,
  validity = "7 dias",
  link = "https://orcazap.app/o/preview",
}: {
  name: string;
  service: string;
  price: string;
  notes?: string;
  validity?: string;
  link?: string;
}) {
  const parts = [
    `Olá, *${name}*!`,
    "",
    `Orçamento: *${service}*`,
    `Valor: *${price}*`,
  ];

  if (notes?.trim()) {
    parts.push("", `> ${notes.trim().replace(/\n/g, "\n> ")}`);
  }

  parts.push("", `_Válido por ${validity}_`, link);
  return parts.join("\n");
}

export function WhatsAppBubble({
  children,
  time = "agora",
  outgoing = true,
  className,
}: {
  children: ReactNode;
  time?: string;
  outgoing?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-[min(100%,92%)] max-w-none rounded-lg px-3 pt-2 pb-1.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)]",
        outgoing
          ? "ml-auto rounded-tr-[3px] bg-[#005c4b] text-[#e9edef]"
          : "mr-auto rounded-tl-[3px] bg-[#202c33] text-[#e9edef]",
        className,
      )}
    >
      <div className="pr-1">{children}</div>
      <div className="mt-0.5 flex items-center justify-end gap-1 pl-8">
        <span className="text-[10px] leading-none text-white/45">{time}</span>
        {outgoing ? (
          <CheckCheck
            className="size-3.5 text-[#53bdeb]"
            strokeWidth={2}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}

export function WhatsAppLinkPreview({
  url,
  title,
  subtitle,
}: {
  url: string;
  title: string;
  subtitle: string;
}) {
  const host = url.replace(/^https?:\/\//, "").split("/")[0];
  return (
    <div className="mt-1 mb-1 overflow-hidden rounded-[6px] border-l-[3px] border-[#06cf9c] bg-black/20">
      <div className="px-2.5 py-2">
        <p className="truncate text-[11px] uppercase tracking-wide text-[#06cf9c]">
          {host}
        </p>
        <p className="mt-0.5 truncate text-[13px] font-medium text-[#e9edef]">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-white/55">{subtitle}</p>
      </div>
    </div>
  );
}

export function WhatsAppChatFrame({
  children,
  headerRight,
  className,
}: {
  children: ReactNode;
  headerRight?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[280px] flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-card)]",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--dash-border)] bg-[#1f2c34] px-3.5 py-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-[#6b7c85] text-[10px] font-semibold text-white">
          EL
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-[#e9edef]">
            Estúdio Limpeza Pro
          </p>
          <p className="truncate text-[11px] text-white/45">online</p>
        </div>
        {headerRight}
      </div>

      <div
        className="relative flex flex-1 flex-col justify-end gap-2 overflow-hidden p-3"
        style={{
          backgroundColor: "#0b141a",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        {children}
      </div>
    </div>
  );
}
