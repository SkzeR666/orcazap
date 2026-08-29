"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShell } from "@/components/shell-context";

/** Legacy route — abre o modal e volta pra lista. */
export default function NewQuoteRedirect() {
  const router = useRouter();
  const { openCreate } = useShell();

  useEffect(() => {
    openCreate("quote");
    router.replace("/orcamentos");
  }, [openCreate, router]);

  return null;
}
