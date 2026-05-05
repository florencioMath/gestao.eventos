import type {
	EventoCadastroDto,
	EventoLoteIngressoPayload,
	ParticipanteDto,
	ParticipanteHistoricoEventoDto,
	PontoTrocaEventoDto,
} from "@/features/eventos/types";
import { isoSóData } from "./eventos-mock-helpers.ts";
import type { ParticipanteMockListaItem, ReservaMockItem } from "./participantes-mock-lista.ts";

export type EncontrarReservaResultado = {
	pessoaIndex: number;
	reservaIndex: number;
	pessoa: ParticipanteMockListaItem;
	reserva: ReservaMockItem;
};

/** Normaliza documento e telefone para dígitos. */
export function normalizarDocumentoMock(doc: string): string {
	return String(doc ?? "").replace(/\D/g, "");
}

export function encontrarReservaPorParticipanteId(
	lista: ParticipanteMockListaItem[],
	cdEventosParticipantes: string
): EncontrarReservaResultado | null {
	for (let pi = 0; pi < lista.length; pi++) {
		const pessoa = lista[pi]!;
		for (let ri = 0; ri < pessoa.reservas.length; ri++) {
			const r = pessoa.reservas[ri]!;
			if (r.cdEventosReservas === cdEventosParticipantes) {
				return { pessoaIndex: pi, reservaIndex: ri, pessoa, reserva: r };
			}
		}
	}
	return null;
}

export function encontrarPessoaPorDocumento(
	lista: ParticipanteMockListaItem[],
	documento: string
): ParticipanteMockListaItem | null {
	const d = normalizarDocumentoMock(documento);
	return lista.find((p) => normalizarDocumentoMock(p.documento) === d) ?? null;
}

function ymdDataEventoDto(ev: EventoCadastroDto): string {
	const raw = String(ev.dataEvento ?? "").trim();
	return raw.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : isoSóData(raw);
}

export function reservaParaParticipanteDto(
	pessoa: ParticipanteMockListaItem,
	reserva: ReservaMockItem
): ParticipanteDto {
	return {
		cdEventosParticipantes: reserva.cdEventosReservas,
		cdEventosReservas: reserva.cdEventosReservas,
		cdEventosCadastro: reserva.cdEventosCadastro,
		nomeParticipante: pessoa.nome,
		emailParticipante: pessoa.email,
		telefoneParticipante: normalizarDocumentoMock(pessoa.telefone) || pessoa.telefone,
		documentoParticipante: normalizarDocumentoMock(pessoa.documento),
		quantidadeIngressos: reserva.quantidadeIngressos,
		cdLoteIngresso: reserva.cdLoteIngresso,
		statusReserva: reserva.statusReserva,
		presencaConfirmada: reserva.presencaConfirmada,
		dataRetirada: reserva.dataRetirada,
		cdLocalRetirada: reserva.cdLocalRetirada,
		nomeLocalRetirada: reserva.nomeLocalRetirada,
		nomeOperadorRetirada: reserva.nomeOperadorRetirada,
		dataCriacao: reserva.dataCriacao,
		dataCancelamento: reserva.dataCancelamento,
	};
}

export function reservaParaHistoricoDto(reserva: ReservaMockItem, evento: EventoCadastroDto): ParticipanteHistoricoEventoDto {
	return {
		cdEventosCadastro: reserva.cdEventosCadastro,
		nomeEvento: evento.nomeEvento,
		dataEvento: ymdDataEventoDto(evento),
		quantidadeIngressos: reserva.quantidadeIngressos,
		statusReserva: reserva.statusReserva,
		presencaConfirmada: reserva.presencaConfirmada,
		dataRetirada: reserva.dataRetirada,
		nomeLocalRetirada: reserva.nomeLocalRetirada,
	};
}

/** Lotes ordenados por `ordem` (mesma convenção do formulário). */
export function lotesOrdenados(ev: EventoCadastroDto): EventoLoteIngressoPayload[] {
	const lotes = ev.lotes?.length ? [...ev.lotes] : [];
	return lotes.sort((a, b) => a.ordem - b.ordem);
}

export function lotePorOrdemString(ev: EventoCadastroDto, ordemStr: string | undefined): EventoLoteIngressoPayload | undefined {
	if (ordemStr == null || ordemStr === "") return lotesOrdenados(ev)[0];
	const n = Number.parseInt(ordemStr, 10);
	if (!Number.isFinite(n)) return undefined;
	return lotesOrdenados(ev).find((l) => l.ordem === n);
}

/**
 * Soma `quantidadeIngressos` de reservas ATIVAS no evento e lote (por ordem).
 * Opcionalmente exclui uma reserva ao calcular capacidade para alteração.
 */
export function somaIngressosReservadosNoLote(
	participantes: ParticipanteMockListaItem[],
	cdEvento: string,
	ordemLote: number,
	excluirCdReserva?: string
): number {
	let sum = 0;
	for (const p of participantes) {
		for (const r of p.reservas) {
			if (r.cdEventosCadastro !== cdEvento || r.statusReserva !== "ATIVA") continue;
			const ord = r.cdLoteIngresso != null ? Number.parseInt(r.cdLoteIngresso, 10) : 0;
			if (!Number.isFinite(ord) || ord !== ordemLote) continue;
			if (excluirCdReserva && r.cdEventosReservas === excluirCdReserva) continue;
			sum += r.quantidadeIngressos;
		}
	}
	return sum;
}

export function somaIngressosAtivosNoEvento(
	participantes: ParticipanteMockListaItem[],
	cdEvento: string,
	excluirCdReserva?: string
): number {
	let sum = 0;
	for (const p of participantes) {
		for (const r of p.reservas) {
			if (r.cdEventosCadastro !== cdEvento || r.statusReserva !== "ATIVA") continue;
			if (excluirCdReserva && r.cdEventosReservas === excluirCdReserva) continue;
			sum += r.quantidadeIngressos;
		}
	}
	return sum;
}

export function nomeLocalPorId(pontos: PontoTrocaEventoDto[], id: string): string | undefined {
	const p = pontos.find((x) => x.id === id);
	return p?.nome?.trim() || undefined;
}
