import { Card, CardBody } from "@/components/ui/card";
import { DashGrid, PageStack } from "@/components/ui/dash-grid";
import { catalogServices } from "@/lib/mock";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Catálogo" };

export default function CatalogoPage() {
  return (
    <PageStack>
      <DashGrid cols={3}>
        {catalogServices.map((service) => (
          <Card key={service.id}>
            <CardBody className="justify-between gap-4">
              <p className="text-[15px] font-medium leading-snug text-[var(--dash-ink)]">
                {service.name}
              </p>
              <p className="mt-auto font-[family-name:var(--font-display)] text-2xl font-semibold tabular-nums text-[var(--dash-ink)]">
                {formatBRL(service.price)}
              </p>
            </CardBody>
          </Card>
        ))}
      </DashGrid>
    </PageStack>
  );
}
