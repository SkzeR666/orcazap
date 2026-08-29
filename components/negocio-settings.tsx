"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Store,
  Timer,
  Wallet,
} from "lucide-react";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { BentoGrid } from "@/components/ui/dash-grid";
import {
  FieldInput,
  FieldSegment,
  FieldSelect,
  FieldTextarea,
  FieldToggle,
  FieldUrl,
  Fields,
  slugify,
} from "@/components/ui/field";

const DEFAULT_MSG = `Olá, *{cliente}*!

Orçamento: *{servico}*
Valor: *{valor}*

_Válido por {validade}_
{link}`;

const segmentos = [
  { value: "limpeza", label: "Limpeza" },
  { value: "eletrica", label: "Elétrica" },
  { value: "hidraulica", label: "Hidráulica" },
  { value: "pintura", label: "Pintura" },
  { value: "beleza", label: "Beleza" },
  { value: "outros", label: "Outros" },
];

const cidades = [
  { value: "sp", label: "São Paulo, SP" },
  { value: "rj", label: "Rio de Janeiro, RJ" },
  { value: "bh", label: "Belo Horizonte, MG" },
  { value: "curitiba", label: "Curitiba, PR" },
  { value: "poa", label: "Porto Alegre, RS" },
];

export function NegocioSettings() {
  const [nome, setNome] = useState("Estúdio Limpeza Pro");
  const [modelo, setModelo] = useState("padrao");
  const [msg, setMsg] = useState(DEFAULT_MSG);
  const slug = useMemo(() => slugify(nome) || "negocio", [nome]);
  const publicUrl = `orcazap.app/u/${slug}`;

  function onModelo(next: string) {
    setModelo(next);
    if (next === "padrao") setMsg(DEFAULT_MSG);
  }

  return (
    <BentoGrid>
      <Card>
        <CardHeader title="Identidade" />
        <CardBody className="gap-[var(--space)]">
          <AvatarUpload
            initials="EL"
            label={nome}
            hint="Clique na logo"
            dark
          />
          <Fields>
            <FieldInput
              icon={Store}
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <FieldUrl value={publicUrl} />
            <FieldSelect
              icon={Building2}
              label="Segmento"
              options={segmentos}
              defaultValue="limpeza"
            />
            <FieldSelect
              icon={MapPin}
              label="Cidade"
              options={cidades}
              defaultValue="sp"
            />
            <FieldInput
              icon={Phone}
              label="WhatsApp"
              defaultValue="(11) 90000-0000"
            />
          </Fields>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Orçamento" />
        <CardBody>
          <Fields>
            <FieldSegment
              icon={MessageCircle}
              label="Tom"
              options={[
                { value: "direto", label: "Direto" },
                { value: "formal", label: "Formal" },
                { value: "amigavel", label: "Amigável" },
                { value: "premium", label: "Premium" },
              ]}
              defaultValue="direto"
            />
            <FieldSelect
              icon={Timer}
              label="Validade"
              options={[
                { value: "3", label: "3 dias" },
                { value: "7", label: "7 dias" },
                { value: "15", label: "15 dias" },
                { value: "30", label: "30 dias" },
              ]}
              defaultValue="7"
            />
            <FieldToggle
              icon={MessageCircle}
              label="CTA"
              hint="Aprovar no Zap"
              defaultChecked
            />
            <FieldToggle
              icon={Bell}
              label="Lembrete"
              hint="1 dia antes"
              defaultChecked
            />
          </Fields>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Pix" />
        <CardBody>
          <Fields>
            <FieldSegment
              icon={Wallet}
              label="Tipo"
              options={[
                { value: "email", label: "E-mail" },
                { value: "cpf", label: "Doc" },
                { value: "phone", label: "Tel" },
                { value: "random", label: "Aleat." },
              ]}
              defaultValue="email"
            />
            <FieldInput
              icon={Wallet}
              label="Chave"
              defaultValue="estudio@limpezapro.com.br"
            />
            <FieldInput
              icon={Store}
              label="Titular"
              defaultValue="Estúdio Limpeza Pro LTDA"
            />
            <FieldSelect
              icon={Bell}
              label="Lembrete"
              options={[
                { value: "off", label: "Sem lembrete" },
                { value: "24", label: "Após 24h" },
                { value: "48", label: "Após 48h" },
                { value: "72", label: "Após 72h" },
              ]}
              defaultValue="24"
            />
            <FieldToggle
              icon={CreditCard}
              label="Auto"
              hint="Marcar pago"
              defaultChecked
            />
            <FieldToggle
              icon={Share2}
              label="QR"
              hint="No link"
              defaultChecked
            />
          </Fields>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Mensagem" />
        <CardBody className="gap-[var(--space)]">
          <FieldSegment
            icon={MessageCircle}
            label="Modelo"
            options={[
              { value: "padrao", label: "Padrão" },
              { value: "custom", label: "Custom" },
            ]}
            value={modelo}
            onChange={onModelo}
          />
          <FieldTextarea
            icon={MessageCircle}
            label="Texto"
            value={msg}
            onChange={(e) => {
              setMsg(e.target.value);
              if (modelo === "padrao") setModelo("custom");
            }}
            readOnly={modelo === "padrao"}
            placeholder="Use {cliente}, {servico}, {valor}, {validade}, {link}"
          />
          <p className="text-[11px] leading-relaxed text-[var(--dash-muted)]">
            Tokens: {"{cliente}"} · {"{servico}"} · {"{valor}"} · {"{validade}"}{" "}
            · {"{link}"}. Formatação: *negrito* · _itálico_ · ~riscado~ ·
            `código` · - lista · {">"} citação
          </p>
        </CardBody>
      </Card>
    </BentoGrid>
  );
}
