import { notFound } from "next/navigation";
import { PublicQuoteView } from "@/components/public-quote";
import { getPublicQuote } from "@/lib/mock";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const quote = getPublicQuote(id);
  if (!quote) return { title: "Orçamento" };
  return {
    title: `${quote.service} · ${quote.business.name}`,
    description: `Orçamento de ${quote.business.name} para ${quote.client}`,
  };
}

export default async function PublicQuotePage({ params }: Props) {
  const { id } = await params;
  const quote = getPublicQuote(id);
  if (!quote) notFound();

  return <PublicQuoteView quote={quote} />;
}
