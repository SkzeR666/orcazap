import { NegocioSettings } from "@/components/negocio-settings";
import { PageStack } from "@/components/ui/dash-grid";

export const metadata = { title: "Negócio" };

export default function NegocioPage() {
  return (
    <PageStack>
      <NegocioSettings />
    </PageStack>
  );
}
