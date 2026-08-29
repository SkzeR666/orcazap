"use client";

import {
  Bell,
  CreditCard,
  Globe2,
  Lock,
  Mail,
  Moon,
  Palette,
  Shield,
  Sun,
  UserRound,
} from "lucide-react";
import { useShell, ACCENTS } from "@/components/shell-context";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { BentoGrid } from "@/components/ui/dash-grid";
import {
  FieldAccent,
  FieldInput,
  FieldSegment,
  FieldSelect,
  FieldToggle,
  Fields,
} from "@/components/ui/field";

export function ContaSettings() {
  const { theme, setTheme, accent, setAccent } = useShell();

  return (
    <BentoGrid>
      <Card>
        <CardHeader title="Perfil" />
        <CardBody className="gap-[var(--space)]">
          <AvatarUpload
            initials="MC"
            label="Marina Costa"
            hint="Clique na foto"
            size="lg"
          />
          <Fields>
            <FieldInput
              icon={UserRound}
              label="Nome"
              defaultValue="Marina Costa"
            />
            <FieldInput
              icon={Mail}
              label="E-mail"
              type="email"
              defaultValue="marina@limpezapro.com.br"
            />
            <FieldSelect
              icon={Globe2}
              label="Idioma"
              options={[
                { value: "pt", label: "Português (Brasil)" },
                { value: "en", label: "English" },
                { value: "es", label: "Español" },
              ]}
              defaultValue="pt"
            />
            <FieldSegment
              icon={theme === "dark" ? Moon : Sun}
              label="Modo"
              options={[
                { value: "dark", label: "Escuro" },
                { value: "light", label: "Claro" },
              ]}
              value={theme}
              onChange={(v) => setTheme(v === "light" ? "light" : "dark")}
            />
            <FieldAccent
              icon={Palette}
              label="Cor"
              value={accent}
              onChange={(id) => setAccent(id as typeof accent)}
              options={ACCENTS.map((a) => ({
                id: a.id,
                label: a.label,
                swatch: a.swatch,
              }))}
            />
          </Fields>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Plano" />
        <CardBody className="gap-[var(--space)]">
          <div className="flex items-center justify-between rounded-[var(--radius)] border border-[var(--dash-border)] bg-[var(--dash-hover)]/60 px-3.5 py-3.5">
            <div>
              <p className="text-[14px] font-semibold text-[var(--dash-ink)]">
                Pro
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--dash-muted)]">
                Ilimitado · Pix · histórico
              </p>
            </div>
            <span className="rounded-[var(--radius)] bg-[var(--dash-accent)] px-2.5 py-1 text-[11px] font-medium text-[var(--dash-accent-ink)]">
              Ativo
            </span>
          </div>
          <Fields>
            <FieldSegment
              icon={CreditCard}
              label="Ciclo"
              options={[
                { value: "mensal", label: "Mensal" },
                { value: "anual", label: "Anual" },
              ]}
              defaultValue="mensal"
            />
            <FieldSelect
              icon={CreditCard}
              label="Pagamento"
              options={[
                { value: "pix", label: "Pix" },
                { value: "card", label: "Cartão" },
                { value: "boleto", label: "Boleto" },
              ]}
              defaultValue="pix"
            />
          </Fields>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Alertas" />
        <CardBody>
          <Fields>
            <FieldToggle
              icon={Mail}
              label="Aprovado"
              hint="Cliente confirmou"
              defaultChecked
            />
            <FieldToggle
              icon={CreditCard}
              label="Pix"
              hint="Pagamento ok"
              defaultChecked
            />
            <FieldToggle
              icon={Bell}
              label="Vencendo"
              hint="Em aberto"
              defaultChecked
            />
            <FieldToggle icon={Mail} label="Resumo" hint="E-mail 8h" />
          </Fields>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Segurança" />
        <CardBody>
          <Fields>
            <FieldToggle icon={Lock} label="2FA" hint="Código no WhatsApp" />
            <FieldSelect
              icon={Shield}
              label="Sessões"
              options={[
                { value: "1", label: "1 dispositivo" },
                { value: "3", label: "Até 3 dispositivos" },
                { value: "all", label: "Sem limite" },
              ]}
              defaultValue="3"
            />
          </Fields>
        </CardBody>
        <CardFooter>
          <button type="button" className="dash-btn dash-btn-ghost w-full">
            Encerrar outras sessões
          </button>
        </CardFooter>
      </Card>
    </BentoGrid>
  );
}
