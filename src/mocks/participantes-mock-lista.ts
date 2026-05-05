/**
 * Lista mestre participant-centric: cada pessoa contém reservas por evento (show).
 * IDs estáveis para o mock mutável do interceptor.
 */

export type ReservaMockItem = {
	cdEventosReservas: string;
	cdEventosCadastro: string;
	/** Ordem do lote (`lotes[].ordem`) como string, ex.: `"0"`. */
	cdLoteIngresso?: string;
	quantidadeIngressos: number;
	statusReserva: "ATIVA" | "CANCELADA";
	presencaConfirmada: boolean;
	dataRetirada?: string;
	cdLocalRetirada?: string;
	nomeLocalRetirada?: string;
	nomeOperadorRetirada?: string;
	dataCriacao: string;
	dataCancelamento?: string;
};

export type ParticipanteMockListaItem = {
	cdParticipante: string;
	nome: string;
	documento: string;
	email: string;
	telefone: string;
	reservas: ReservaMockItem[];
};

export const MOCK_PARTICIPANTES_LISTA: ParticipanteMockListaItem[] = [
	{
		cdParticipante: "part-maria-silva",
		nome: "Maria Silva",
		documento: "11111111111",
		email: "maria.silva@email.com",
		telefone: "11987654321",
		reservas: [
			{
				cdEventosReservas: "res-oz-maria-1",
				cdEventosCadastro: "evt-oz-2026",
				cdLoteIngresso: "0",
				quantidadeIngressos: 2,
				statusReserva: "ATIVA",
				presencaConfirmada: false,
				dataCriacao: "2026-04-01T14:00:00.000Z",
			},
			{
				cdEventosReservas: "res-ana-maria-2",
				cdEventosCadastro: "evt-ana-castela",
				cdLoteIngresso: "0",
				quantidadeIngressos: 1,
				statusReserva: "ATIVA",
				presencaConfirmada: true,
				dataRetirada: "2026-05-02T16:30:00.000Z",
				cdLocalRetirada: "lt-rochdale",
				nomeLocalRetirada: "Estádio do Rochdale",
				nomeOperadorRetirada: "Operador mock",
				dataCriacao: "2026-04-10T11:00:00.000Z",
			},
		],
	},
	{
		cdParticipante: "part-joao-santos",
		nome: "João Santos",
		documento: "22222222222",
		email: "joao.santos@email.com",
		telefone: "11999887766",
		reservas: [
			{
				cdEventosReservas: "res-oz-joao-cancel",
				cdEventosCadastro: "evt-oz-2026",
				cdLoteIngresso: "0",
				quantidadeIngressos: 2,
				statusReserva: "CANCELADA",
				presencaConfirmada: false,
				dataCriacao: "2026-03-15T10:00:00.000Z",
				dataCancelamento: "2026-04-28T09:00:00.000Z",
			},
		],
	},
	{
		cdParticipante: "part-ana-costa",
		nome: "Ana Costa",
		documento: "33333333333",
		email: "ana.costa@email.com",
		telefone: "11988776655",
		reservas: [
			{
				cdEventosReservas: "res-ana-costa-1",
				cdEventosCadastro: "evt-ana-castela",
				cdLoteIngresso: "0",
				quantidadeIngressos: 1,
				statusReserva: "ATIVA",
				presencaConfirmada: false,
				dataCriacao: "2026-04-12T08:30:00.000Z",
			},
		],
	},
	/** Mesmo CPF/dados do `DADOS_PERFIL_MOCK` do portal — presente em todos os shows exceto Oz Festival 2026 (cadastro manual no portal para testes). */
	{
		cdParticipante: "f58e9e7b-756b-461a-b6f1-e576ea8f74b0",
		nome: "Cidadão",
		documento: "75526311201",
		email: "cidadao@transito.gov.br",
		telefone: "41997489304",
		reservas: [
			{
				cdEventosReservas: "res-cidadao-ana-pendente",
				cdEventosCadastro: "evt-ana-castela",
				cdLoteIngresso: "0",
				quantidadeIngressos: 1,
				statusReserva: "ATIVA",
				presencaConfirmada: false,
				dataCriacao: "2026-04-20T10:00:00.000Z",
			},
			{
				cdEventosReservas: "res-cidadao-wesley-cancel",
				cdEventosCadastro: "evt-leg-wesley",
				cdLoteIngresso: "0",
				quantidadeIngressos: 2,
				statusReserva: "CANCELADA",
				presencaConfirmada: false,
				dataCriacao: "2026-03-01T12:00:00.000Z",
				dataCancelamento: "2026-03-10T15:00:00.000Z",
			},
			{
				cdEventosReservas: "res-cidadao-natan-ativa",
				cdEventosCadastro: "evt-leg-natanzinho",
				cdLoteIngresso: "0",
				quantidadeIngressos: 2,
				statusReserva: "ATIVA",
				presencaConfirmada: false,
				dataCriacao: "2026-03-18T09:00:00.000Z",
			},
		],
	},
];
