export type OrcaQuote =
  | { kind: "tip"; text: string }
  | { kind: "user"; text: string; name: string; role: string };

export const ORCAZAP_QUOTES: OrcaQuote[] = [
  // Produto / features
  {
    kind: "tip",
    text: "O preview do WhatsApp mostra exatamente o que o cliente vai receber.",
  },
  {
    kind: "tip",
    text: "Um orçamento pode sair da conversa e chegar no WhatsApp em poucos minutos.",
  },
  {
    kind: "tip",
    text: "Serviços que você cobra sempre podem ficar salvos para o próximo orçamento.",
  },
  {
    kind: "tip",
    text: "Nem todo serviço precisa ser digitado do zero toda vez.",
  },
  {
    kind: "tip",
    text: "Cliente, serviço, valor e validade. O resto só entra se realmente precisar.",
  },
  {
    kind: "tip",
    text: "O cliente pode abrir o orçamento sem precisar criar conta.",
  },
  {
    kind: "tip",
    text: "Cada orçamento tem um link próprio para você enviar onde quiser.",
  },
  {
    kind: "tip",
    text: "A aprovação acontece no próprio orçamento, sem depender de um “fechado” perdido no WhatsApp.",
  },
  {
    kind: "tip",
    text: "Você consegue saber o que ainda está em rascunho, o que foi enviado e o que já foi aprovado.",
  },
  {
    kind: "tip",
    text: "Orçamento vencido não precisa continuar misturado com negociação ativa.",
  },
  {
    kind: "tip",
    text: "O histórico do cliente fica junto, não espalhado em várias conversas.",
  },
  {
    kind: "tip",
    text: "Um serviço com preço padrão pode entrar no orçamento praticamente pronto.",
  },
  {
    kind: "tip",
    text: "Você pode ajustar o valor só naquele orçamento sem alterar o serviço salvo.",
  },
  {
    kind: "tip",
    text: "O WhatsApp continua sendo o WhatsApp. O OrçaZap só organiza o que acontece antes e depois dele.",
  },
  {
    kind: "tip",
    text: "Você monta o orçamento e já sai com a mensagem pronta para enviar.",
  },
  {
    kind: "tip",
    text: "Quando o cliente aprova, o orçamento muda de status junto com a negociação.",
  },
  {
    kind: "tip",
    text: "O pagamento pode continuar no mesmo fluxo do orçamento com Mercado Pago.",
  },
  {
    kind: "tip",
    text: "Orçamento, aprovação e pagamento não precisam viver em três lugares diferentes.",
  },
  {
    kind: "tip",
    text: "Você não precisa montar um PDF manualmente para cada cliente.",
  },
  {
    kind: "tip",
    text: "Os dados da empresa entram no orçamento sem você repetir tudo a cada envio.",
  },
  {
    kind: "tip",
    text: "Você pode cadastrar o cliente uma vez e reaproveitar os dados depois.",
  },
  {
    kind: "tip",
    text: "O dashboard mostra o que merece atenção sem transformar seu trabalho em planilha.",
  },
  {
    kind: "tip",
    text: "O OrçaZap foi pensado para quem precisa fazer orçamento, não operar um ERP.",
  },
  {
    kind: "tip",
    text: "Se o orçamento ainda não está pronto, salva como rascunho e termina depois.",
  },
  {
    kind: "tip",
    text: "Dá para separar rapidamente o que foi enviado do que ainda está esperando resposta.",
  },
  {
    kind: "tip",
    text: "O orçamento continua apresentável mesmo quando foi feito pelo celular.",
  },
  {
    kind: "tip",
    text: "Preço fixo, preço ajustável ou serviço personalizado podem conviver no mesmo orçamento.",
  },
  {
    kind: "tip",
    text: "A observação existe para complementar o orçamento, não para virar um formulário enorme.",
  },
  {
    kind: "tip",
    text: "Um link bem apresentado costuma explicar melhor que dez mensagens soltas.",
  },
  {
    kind: "tip",
    text: "O cliente recebe uma proposta clara sem precisar entender como o sistema funciona.",
  },

  // Avaliações / voz de quem usa
  {
    kind: "user",
    text: "Antes eu escrevia praticamente a mesma coisa toda vez no WhatsApp. Agora só monto e mando.",
    name: "Camila Rocha",
    role: "Limpeza · Curitiba",
  },
  {
    kind: "user",
    text: "Gostei porque não precisei aprender um sistema inteiro só pra fazer orçamento.",
    name: "Bruno Costa",
    role: "Jardinagem · Florianópolis",
  },
  {
    kind: "user",
    text: "O que mais me ajuda é ter os serviços salvos. Parece detalhe, mas economiza um tempão.",
    name: "Juliana Paiva",
    role: "Estética · Recife",
  },
  {
    kind: "user",
    text: "Eu queria justamente isso: fazer o orçamento rápido e continuar falando com o cliente pelo WhatsApp.",
    name: "Thiago Nunes",
    role: "Marcenaria · Porto Alegre",
  },
  {
    kind: "user",
    text: "Ficou bem mais fácil saber quem recebeu e quem realmente aprovou.",
    name: "Patrícia Alves",
    role: "Faxina · Campinas",
  },
  {
    kind: "user",
    text: "Antes eu mandava valor no meio da conversa e depois tinha que procurar. Agora fica tudo certinho.",
    name: "Rafael Menezes",
    role: "Elétrica · BH",
  },
  {
    kind: "user",
    text: "Uso mais pelo celular e não senti que precisava sentar no computador pra fazer as coisas.",
    name: "Natália Reis",
    role: "Higienização · Salvador",
  },
  {
    kind: "user",
    text: "Meu cliente abre o link, vê tudo e já entende o que está sendo cobrado.",
    name: "Diego Santos",
    role: "Pintura · São Paulo",
  },
  {
    kind: "user",
    text: "Não tem cinquenta campos pra preencher. Isso pra mim fez diferença.",
    name: "Sofia Martins",
    role: "Pet care · Belo Horizonte",
  },
  {
    kind: "user",
    text: "Eu cadastro os serviços que mais faço e nos próximos orçamentos é quase só escolher.",
    name: "André Figueiredo",
    role: "Dedetização · Fortaleza",
  },
  {
    kind: "user",
    text: "Parece bem mais profissional do que mandar preço em três mensagens separadas.",
    name: "Igor Batista",
    role: "Climatização · Goiânia",
  },
  {
    kind: "user",
    text: "O preview antes de enviar me salvou algumas vezes de mandar valor errado.",
    name: "Larissa Duarte",
    role: "Personal organizer · Brasília",
  },
  {
    kind: "user",
    text: "Eu continuo fechando tudo pelo WhatsApp, só que agora a parte do orçamento ficou organizada.",
    name: "Marcelo Vieira",
    role: "Reforma · Santos",
  },
  {
    kind: "user",
    text: "Não queria CRM, funil, tarefa e mais um monte de coisa. Queria fazer orçamento direito.",
    name: "Fernanda Lima",
    role: "Organização · Rio",
  },
  {
    kind: "user",
    text: "Depois que o cliente aprova, eu não preciso ficar tentando lembrar em que pé ficou.",
    name: "Pedro Henrique",
    role: "Montagem · Joinville",
  },
  {
    kind: "user",
    text: "Achei simples no bom sentido. Entrei e já sabia onde criar o primeiro orçamento.",
    name: "Helena Borges",
    role: "Arquitetura de interiores · SP",
  },
  {
    kind: "user",
    text: "Ter o histórico do cliente ali é muito melhor do que subir conversa antiga procurando preço.",
    name: "Camila Rocha",
    role: "Limpeza · Curitiba",
  },
  {
    kind: "user",
    text: "Eu fazia os orçamentos pelo bloco de notas. Só de não precisar mais disso já valeu.",
    name: "Bruno Costa",
    role: "Jardinagem · Florianópolis",
  },
  {
    kind: "user",
    text: "Os serviços prontos ajudam bastante porque meu preço não muda toda hora.",
    name: "Juliana Paiva",
    role: "Estética · Recife",
  },
  {
    kind: "user",
    text: "Quando precisa mudar alguma coisa, eu ajusto só aquele orçamento e pronto.",
    name: "Rafael Menezes",
    role: "Elétrica · BH",
  },
  {
    kind: "user",
    text: "O cliente não precisa baixar nada nem instalar aplicativo. Eu mando o link e acabou.",
    name: "Diego Santos",
    role: "Pintura · São Paulo",
  },
  {
    kind: "user",
    text: "Gostei de conseguir revisar a mensagem antes de abrir o WhatsApp.",
    name: "Patrícia Alves",
    role: "Faxina · Campinas",
  },
  {
    kind: "user",
    text: "Pra quem atende sozinho, qualquer coisa que tire trabalho repetitivo já ajuda muito.",
    name: "Thiago Nunes",
    role: "Marcenaria · Porto Alegre",
  },
  {
    kind: "user",
    text: "Finalmente consigo separar orçamento enviado de orçamento que realmente virou serviço.",
    name: "André Figueiredo",
    role: "Dedetização · Fortaleza",
  },
  {
    kind: "user",
    text: "Não mudou meu jeito de atender. Só tirou a bagunça do meio.",
    name: "Sofia Martins",
    role: "Pet care · Belo Horizonte",
  },
  {
    kind: "user",
    text: "Eu não precisava de um sistema gigante. Precisava parar de montar orçamento na mão.",
    name: "Igor Batista",
    role: "Climatização · Goiânia",
  },
  {
    kind: "user",
    text: "A parte boa é que o cliente recebe algo organizado sem eu gastar mais tempo fazendo isso.",
    name: "Helena Borges",
    role: "Arquitetura de interiores · SP",
  },
  {
    kind: "user",
    text: "Depois que deixei meus serviços cadastrados, criar orçamento ficou muito mais rápido.",
    name: "Natália Reis",
    role: "Higienização · Salvador",
  },
  {
    kind: "user",
    text: "Eu consigo olhar e entender na hora quais propostas ainda estão esperando o cliente.",
    name: "Marcelo Vieira",
    role: "Reforma · Santos",
  },
  {
    kind: "user",
    text: "Tem pouca coisa na tela, mas é justamente a pouca coisa que eu uso todo dia.",
    name: "Fernanda Lima",
    role: "Organização · Rio",
  },
];
