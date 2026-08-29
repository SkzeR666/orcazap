import { ContaSettings } from "@/components/conta-settings";
import { PageStack } from "@/components/ui/dash-grid";

export const metadata = { title: "Conta" };

export default function ConfiguracoesPage() {
  return (
    <PageStack>
      <ContaSettings />
    </PageStack>
  );
}
