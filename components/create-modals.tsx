"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Mail,
  Phone,
  Radio,
  StickyNote,
  UserRound,
} from "lucide-react";
import { useShell } from "@/components/shell-context";
import { Modal } from "@/components/ui/modal";
import {
  FieldInput,
  FieldSegment,
  FieldSelect,
  FieldTextarea,
  FieldToggle,
  Fields,
} from "@/components/ui/field";
import {
  WhatsAppBubble,
  WhatsAppChatFrame,
  WhatsAppLinkPreview,
  buildQuoteMessage,
  renderWhatsAppText,
} from "@/components/whatsapp-preview";
import { catalogServices, mockClients } from "@/lib/mock";
import { formatBRL } from "@/lib/format";

const serviceOptions = catalogServices.map((s) => ({
  value: s.id,
  label: `${s.name} · ${formatBRL(s.price)}`,
}));

function Footer({
  onClose,
  primary,
}: {
  onClose: () => void;
  primary: string;
}) {
  return (
    <>
      <button
        type="button"
        className="dash-btn dash-btn-ghost"
        onClick={onClose}
      >
        Cancelar
      </button>
      <button
        type="button"
        className="dash-btn dash-btn-primary"
        onClick={onClose}
      >
        {primary}
      </button>
    </>
  );
}

function QuoteCreateForm() {
  const [mode, setMode] = useState<"list" | "new">("list");
  const [clientId, setClientId] = useState(mockClients[0]?.id ?? "");
  const [newName, setNewName] = useState("");
  const [phone, setPhone] = useState(mockClients[0]?.phone ?? "");
  const [serviceId, setServiceId] = useState(serviceOptions[0]?.value ?? "");
  const [notes, setNotes] = useState("");
  const [live, setLive] = useState(false);

  const selected = mockClients.find((c) => c.id === clientId);

  const service = useMemo(
    () => catalogServices.find((s) => s.id === serviceId),
    [serviceId],
  );

  function onMode(next: string) {
    const m = next === "new" ? "new" : "list";
    setMode(m);
    if (m === "list") {
      const c = mockClients.find((x) => x.id === clientId) ?? mockClients[0];
      if (c) {
        setClientId(c.id);
        setPhone(c.phone);
      }
    } else {
      setNewName("");
      setPhone("");
    }
  }

  function onPickClient(id: string) {
    setClientId(id);
    const c = mockClients.find((x) => x.id === id);
    if (c) setPhone(c.phone);
  }

  const name =
    (mode === "new" ? newName : (selected?.name ?? "")).trim() || "Cliente";
  const svc = service?.name ?? "Serviço";
  const price = service ? formatBRL(service.price) : "—";
  const link = "https://orcazap.app/o/preview";

  const message = useMemo(
    () =>
      buildQuoteMessage({
        name,
        service: svc,
        price,
        notes,
        link,
      }),
    [name, svc, price, notes],
  );

  return (
    <div className="grid h-[min(520px,62dvh)] gap-[var(--space)] md:grid-cols-2 md:items-stretch">
      <div className="flex min-h-0 flex-col gap-[var(--space)]">
        <FieldSegment
          icon={UserRound}
          label="Cliente"
          options={[
            { value: "list", label: "Lista" },
            { value: "new", label: "Novo" },
          ]}
          value={mode}
          onChange={onMode}
        />
        {mode === "list" ? (
          <FieldSelect
            icon={UserRound}
            label="Nome"
            options={mockClients.map((c) => ({
              value: c.id,
              label: c.name,
              hint: c.phone,
            }))}
            value={clientId}
            onChange={onPickClient}
          />
        ) : (
          <FieldInput
            icon={UserRound}
            label="Nome"
            name="client"
            placeholder="Nome do cliente"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        )}
        <FieldInput
          icon={Phone}
          label="WhatsApp"
          name="phone"
          placeholder="(11) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <FieldSelect
          icon={FileText}
          label="Serviço"
          options={serviceOptions}
          value={serviceId}
          onChange={setServiceId}
        />
        <FieldTextarea
          icon={StickyNote}
          label="Obs."
          name="notes"
          className="min-h-0 flex-1"
          compact
          placeholder="Prazo, materiais, acesso…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <FieldToggle
          icon={Radio}
          label="Ao vivo"
          hint="Status no link do orçamento"
          checked={live}
          onCheckedChange={setLive}
        />
      </div>

      <WhatsAppChatFrame
        className="h-full min-h-0"
        headerRight={
          phone.trim() ? (
            <span className="truncate text-[11px] text-white/45">{phone}</span>
          ) : null
        }
      >
        <WhatsAppBubble>
          {renderWhatsAppText(message)}
          <WhatsAppLinkPreview
            url={link}
            title={`${svc} · ${price}`}
            subtitle={
              live
                ? "Abrir · acompanhar em tempo real"
                : "Abrir orçamento · aprovar e pagar"
            }
          />
        </WhatsAppBubble>
      </WhatsAppChatFrame>
    </div>
  );
}

export function CreateModals() {
  const { createModal, closeCreate } = useShell();

  return (
    <>
      <Modal
        open={createModal === "quote"}
        onClose={closeCreate}
        title="Novo orçamento"
        description="Preview real · formatação do WhatsApp"
        size="xl"
        footer={<Footer onClose={closeCreate} primary="Salvar e enviar" />}
      >
        <QuoteCreateForm />
      </Modal>

      <Modal
        open={createModal === "client"}
        onClose={closeCreate}
        title="Novo cliente"
        description="Cadastro rápido"
        size="md"
        footer={<Footer onClose={closeCreate} primary="Salvar" />}
      >
        <Fields>
          <FieldInput
            icon={UserRound}
            label="Nome"
            placeholder="Nome completo"
          />
          <FieldInput
            icon={Phone}
            label="WhatsApp"
            placeholder="(11) 99999-9999"
          />
          <FieldInput
            icon={Mail}
            label="E-mail"
            type="email"
            placeholder="opcional"
          />
        </Fields>
      </Modal>

      <Modal
        open={createModal === "service"}
        onClose={closeCreate}
        title="Novo serviço"
        description="Catálogo"
        size="md"
        footer={<Footer onClose={closeCreate} primary="Salvar" />}
      >
        <Fields>
          <FieldInput
            icon={FileText}
            label="Nome"
            placeholder="Ex.: Limpeza pós-obra"
          />
          <FieldInput icon={StickyNote} label="Preço" placeholder="R$ 0,00" />
        </Fields>
      </Modal>

      <Modal
        open={createModal === "charge"}
        onClose={closeCreate}
        title="Nova cobrança"
        description="Pix para orçamento aprovado"
        size="md"
        footer={<Footer onClose={closeCreate} primary="Gerar Pix" />}
      >
        <Fields>
          <FieldSelect
            icon={UserRound}
            label="Cliente"
            options={[
              { value: "1", label: "Marina Costa" },
              { value: "2", label: "João Ferreira" },
              { value: "3", label: "Ana Beatriz" },
            ]}
            defaultValue="1"
          />
          <FieldInput icon={StickyNote} label="Valor" placeholder="R$ 0,00" />
        </Fields>
      </Modal>

      <Modal
        open={createModal === "invite"}
        onClose={closeCreate}
        title="Convidar membro"
        description="Acesso à equipe"
        size="md"
        footer={<Footer onClose={closeCreate} primary="Enviar convite" />}
      >
        <Fields>
          <FieldInput icon={UserRound} label="Nome" placeholder="Nome" />
          <FieldInput
            icon={Mail}
            label="E-mail"
            type="email"
            placeholder="email@empresa.com"
          />
          <FieldSelect
            icon={StickyNote}
            label="Papel"
            options={[
              { value: "op", label: "Operador" },
              { value: "admin", label: "Admin" },
            ]}
            defaultValue="op"
          />
        </Fields>
      </Modal>
    </>
  );
}
