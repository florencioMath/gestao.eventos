/** Contrato alinhado à Parte 3 (JSON camelCase). */

/** Opção de domínio para categoria ou local de evento (listas administradas no back-end). */
export type EventoDominioOpcaoDto = {
	codigo: string;
	nome: string;
};

/** Ponto de troca persistido no evento (cópia com id, nome e endereço no momento da gravação). */
export type PontoTrocaEventoDto = {
	id: string;
	nome: string;
	endereco: string;
};

/** Como o próximo lote de vagas fica disponível para reserva. */
export type ModoLiberacaoLoteIngresso = "IMEDIATA" | "DATA_HORA" | "APOS_ESGOTAR_ANTERIOR";

/** Lote no formulário (inclui `id` estável no cliente). */
export type EventoLoteIngressoForm = {
	id: string;
	rotulo: string;
	quantidade: number;
	ordem: number;
	modoLiberacao: ModoLiberacaoLoteIngresso;
	/** Com `modoLiberacao === "DATA_HORA"`: data `YYYY-MM-DD` de início da venda. */
	dataLiberacaoVenda: string;
	horaLiberacaoVenda: string;
};

/** Lote enviado/recebido na API (sem `id` de cliente). */
export type EventoLoteIngressoPayload = {
	rotulo: string;
	quantidade: number;
	ordem: number;
	modoLiberacao: ModoLiberacaoLoteIngresso;
	dataLiberacaoVenda?: string;
	horaLiberacaoVenda?: string;
};

/** Um dia civil da realização com horário próprio (mock / futura API). */
export type EventoProgramacaoDiaDto = {
	/** Dia civil `YYYY-MM-DD`. */
	data: string;
	horaInicio: string;
	horaFim: string;
};

export type EventoCadastroDto = {
	cdEventosCadastro: string;
	nomeEvento: string;
	descricao: string;
	/** Mensagem de sucesso após inscrição (HTML rico). Pode ausentar em respostas antigas. */
	textoSucessoRegistro?: string;
	/** Quantidade máxima de ingressos por CPF (≥ 1). Pode ausentar em respostas antigas. */
	ingressoPorCpf?: number;
	categoria: string;
	/** Pontos de troca (cópia); ignorados quando `semPontoDeTroca`. */
	pontosDeTrocaCodigos: PontoTrocaEventoDto[];
	/** Quando verdadeiro, não há pontos de troca associados ao evento. */
	semPontoDeTroca: boolean;
	/** Início do evento: `YYYY-MM-DD` ou ISO `YYYY-MM-DDTHH:mm:ss` (resposta Spring). */
	dataEvento: string;
	horaInicio: string;
	horaFim: string;
	/** Fim do evento no mesmo dia (opcional na API em ISO). */
	dataFimEvento?: string;
	dataDesativacaoAutomatica: string;
	/** Primeiro dia em que o evento pode aparecer no aplicativo (`YYYY-MM-DD`). Ausente: alinhar com portal ou 1.º dia de `dataEvento`. */
	dataInicioExibicaoApp?: string;
	/** Primeiro dia em que o evento pode aparecer no portal (`YYYY-MM-DD`). Ausente: 1.º dia de `dataEvento`. */
	dataInicioExibicaoPortal?: string;
	/** Instantâneo local (`YYYY-MM-DDTHH:mm:ss`) a partir do qual reservas podem abrir. Ausente: início do evento. */
	dataHoraInicioVendas?: string;
	quantidadeIngressosTotal: number;
	quantidadeIngressosReservados: number;
	quantidadeIngressosDisponiveis: number;
	/** Quando falso, o evento não aparece no catálogo do portal (independente de datas). */
	exibirParaCidadao: boolean;
	/** Quando verdadeiro, o portal pode exibir o total de vagas do evento. */
	exibirVagas: boolean;
	/** Horário por dia civil quando o evento abrange vários dias; ausente = legado (um par início/fim). */
	programacaoDiaria?: EventoProgramacaoDiaDto[];
	/** Quando verdadeiro, o portal pode evidenciar este evento (ex.: secção de destaques). Vários eventos podem estar em destaque. Ausente em respostas antigas. */
	eventoEmDestaque?: boolean;
	statusEvento: string;
	cdEventosUsuariosCriacao: string;
	dataCriacao: string;
	dataAtualizacao: string;
	/** Divisão de vagas em lotes (opcional no legado). */
	lotes?: EventoLoteIngressoPayload[];
};

export type EventoCriarPayload = {
	nomeEvento: string;
	descricao: string;
	/** Texto rico exibido ao utilizador após registo com sucesso. */
	textoSucessoRegistro: string;
	/** Limite de ingressos reserváveis por CPF (inteiro ≥ 1). */
	ingressoPorCpf: number;
	categoria: string;
	pontosDeTrocaCodigos: PontoTrocaEventoDto[];
	semPontoDeTroca: boolean;
	dataEvento: string;
	horaInicio: string;
	horaFim: string;
	dataDesativacaoAutomatica: string;
	/** Início da exibição no aplicativo (`YYYY-MM-DD`). */
	dataInicioExibicaoApp: string;
	/** Início do período de listagem no portal (`YYYY-MM-DD`). */
	dataInicioExibicaoPortal: string;
	/** Início das vendas/reservas em ISO local (`YYYY-MM-DDTHH:mm:ss`). */
	dataHoraInicioVendas: string;
	quantidadeIngressosTotal: number;
	exibirParaCidadao: boolean;
	exibirVagas: boolean;
	/** Destaque no portal (vários eventos podem estar em destaque em simultâneo). */
	eventoEmDestaque: boolean;
	statusEvento: string;
	/** Agenda por dia civil (opcional; back-end / mock podem persistir). */
	programacaoDiaria?: EventoProgramacaoDiaDto[];
	lotes?: EventoLoteIngressoPayload[];
};

/** Valores do formulário de evento (criação / edição). */
export type EventoFormValores = Omit<EventoCriarPayload, "lotes" | "dataHoraInicioVendas"> & {
	lotes?: EventoLoteIngressoForm[];
	/** Dia civil de início das vendas (`YYYY-MM-DD`); enviado como parte de `dataHoraInicioVendas`. */
	dataInicioVendasDia: string;
	/** Hora de início das vendas (`HH:mm`). */
	horaInicioVendas: string;
	/** Quando verdadeiro, o evento termina noutro dia civil (usa `dataFimEventoDia`). */
	eventoVariosDias?: boolean;
	/** Último dia do evento `YYYY-MM-DD` (≥ `dataEvento`); só aplicado se `eventoVariosDias`. */
	dataFimEventoDia?: string;
};

export type EventoAtualizarPayload = Partial<EventoCriarPayload>;

/** Anexo de imagem do evento (contrato com o back-end). */
export type EventoAnexoDto = {
	id: string;
	idEvento: string;
	nome: string;
	posicao: number;
	/** Base64 puro, sem prefixo `data:`. */
	codigoBase64: string;
};

/**
 * Imagem do evento na UI administrativa (cartões, edição, detalhe).
 * Derivável de {@link EventoAnexoDto} quando a API expõe apenas anexos simples.
 */
export type EventoImagemDto = {
	cdEventosImagens: string;
	cdEventosCadastro: string;
	nomeArquivo: string;
	caminhoArquivo: string;
	imagemPrincipal: boolean;
	ordemExibicao: number;
	posicao: number;
	ativo: boolean;
	dataCriacao: string;
	conteudoBase64Preview?: string;
	conteudoBase64?: string;
	id?: string;
};

/** Estado da reserva no cadastro do participante (mock / futura API). */
export type StatusReservaParticipante = "ATIVA" | "CANCELADA";

export type ParticipanteDto = {
	cdEventosParticipantes: string;
	cdEventosReservas: string;
	/** Evento ao qual esta linha (reserva) pertence. */
	cdEventosCadastro: string;
	nomeParticipante: string;
	emailParticipante: string;
	telefoneParticipante: string;
	documentoParticipante: string;
	quantidadeIngressos: number;
	/** Ordem do lote no evento (`lotes[].ordem`), como string estável no mock. */
	cdLoteIngresso?: string;
	statusReserva: StatusReservaParticipante;
	presencaConfirmada: boolean;
	dataRetirada?: string;
	cdLocalRetirada?: string;
	nomeLocalRetirada?: string;
	nomeOperadorRetirada?: string;
	dataCriacao: string;
	dataCancelamento?: string;
};

/** Histórico de inscrições do CPF (lista administrativa). */
export type ParticipanteHistoricoEventoDto = {
	cdEventosCadastro: string;
	nomeEvento: string;
	dataEvento: string;
	quantidadeIngressos: number;
	statusReserva: StatusReservaParticipante;
	presencaConfirmada: boolean;
	dataRetirada?: string;
	nomeLocalRetirada?: string;
};

/** Item de relatório gerado (listagem administrativa). */
export type RelatorioGeradoDto = {
	id: string;
	titulo: string;
	dataGeracao: string;
	periodoInicio: string;
	periodoFim: string;
};

/** Local de troca (cadastro administrativo). */
export type LocalTrocaDto = {
	cdLocalTroca: string;
	nome: string;
	endereco: string;
	ativo: boolean;
	dataCriacao?: string;
	dataAtualizacao?: string;
};

export type LocalTrocaSalvarPayload = {
	nome: string;
	endereco: string;
	ativo: boolean;
};
