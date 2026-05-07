import type { EventoCadastroDto, IngressoQrResolverDto } from "@/features/eventos/types";
import { extrairPayloadQr } from "@/features/eventos/lib/qr-payload";
import { encontrarReservaPorParticipanteId } from "./participantes-mock-helpers.ts";
import type { IngressoMockItem } from "./participantes-mock-lista.ts";
import type { ParticipanteMockListaItem } from "./participantes-mock-lista.ts";

export function encontrarIngressoPorTokenQr(
	ingressos: IngressoMockItem[],
	payloadBruto: string
): IngressoMockItem | undefined {
	const token = extrairPayloadQr(payloadBruto);
	if (!token) return undefined;
	const norm = token.trim();
	return ingressos.find((i) => i.tokenQr === norm);
}

export function ingressosDaReserva(ingressos: IngressoMockItem[], cdEventosReservas: string): IngressoMockItem[] {
	return ingressos.filter((i) => i.cdEventosReservas === cdEventosReservas).sort((a, b) => a.ordem - b.ordem);
}

export function montarResolverIngressoQr(p: {
	ingresso: IngressoMockItem;
	participantes: ParticipanteMockListaItem[];
	evento: EventoCadastroDto;
	quantidadeIngressosReserva: number;
	nomeParticipante: string;
	documentoParticipante: string;
}): IngressoQrResolverDto {
	const { ingresso, evento, quantidadeIngressosReserva, nomeParticipante, documentoParticipante } = p;
	const hitRes = encontrarReservaPorParticipanteId(p.participantes, ingresso.cdEventosReservas);
	const reservaRow = hitRes?.reserva;
	const bloqueado =
		reservaRow?.statusReserva === "CANCELADA" ||
		ingresso.retirado ||
		String(evento.statusEvento ?? "").toUpperCase() !== "ATIVO";

	let motivoBloqueio: string | undefined;
	if (reservaRow?.statusReserva === "CANCELADA") motivoBloqueio = "Reserva cancelada.";
	else if (ingresso.retirado) motivoBloqueio = "Ingresso já retirado.";
	else if (String(evento.statusEvento ?? "").toUpperCase() !== "ATIVO") motivoBloqueio = "Evento não está ativo.";

	return {
		cdIngresso: ingresso.cdIngresso,
		cdEventosParticipantes: ingresso.cdEventosReservas,
		cdEventosReservas: ingresso.cdEventosReservas,
		cdEventosCadastro: evento.cdEventosCadastro,
		nomeEvento: evento.nomeEvento,
		nomeParticipante,
		documentoParticipante,
		ordemIngresso: ingresso.ordem,
		quantidadeIngressosReserva,
		podeConfirmarRetirada: !bloqueado,
		motivoBloqueio,
	};
}

/** Atualiza `presencaConfirmada` da reserva quando todos os ingressos estiverem retirados. */
export function sincronizarReservaAPartirDosIngressos(
	participantes: ParticipanteMockListaItem[],
	ingressos: IngressoMockItem[],
	cdEventosReservas: string,
	agoraIso: () => string
): void {
	const hit = encontrarReservaPorParticipanteId(participantes, cdEventosReservas);
	if (!hit) return;
	const { reserva } = hit;
	const listaIng = ingressosDaReserva(ingressos, cdEventosReservas);
	if (listaIng.length === 0) return;
	const todosRetirados = listaIng.every((i) => i.retirado);
	if (todosRetirados) {
		reserva.presencaConfirmada = true;
		const datas = listaIng.map((i) => i.dataRetirada).filter(Boolean) as string[];
		const ultima = datas.sort().at(-1);
		reserva.dataRetirada = ultima ?? agoraIso();
		const ultimoComLocal = [...listaIng].reverse().find((i) => i.cdLocalRetirada);
		reserva.cdLocalRetirada = ultimoComLocal?.cdLocalRetirada;
		reserva.nomeLocalRetirada = ultimoComLocal?.nomeLocalRetirada;
		reserva.nomeOperadorRetirada = ultimoComLocal?.nomeOperadorRetirada;
	} else {
		reserva.presencaConfirmada = false;
		reserva.dataRetirada = undefined;
		reserva.cdLocalRetirada = undefined;
		reserva.nomeLocalRetirada = undefined;
		reserva.nomeOperadorRetirada = undefined;
	}
}

/** Quando a retirada manual confirma a reserva inteira, marca todos os ingressos como retirados. */
export function marcarTodosIngressosRetiradosParaReserva(
	ingressos: IngressoMockItem[],
	cdEventosReservas: string,
	p: { cdLocalRetirada?: string; nomeLocalRetirada?: string; nomeOperadorRetirada?: string },
	agoraIso: () => string
): void {
	const iso = agoraIso();
	for (const ing of ingressos) {
		if (ing.cdEventosReservas !== cdEventosReservas) continue;
		ing.retirado = true;
		ing.dataRetirada = iso;
		ing.cdLocalRetirada = p.cdLocalRetirada;
		ing.nomeLocalRetirada = p.nomeLocalRetirada;
		ing.nomeOperadorRetirada = p.nomeOperadorRetirada;
	}
}

export function desmarcarIngressosAoDesfazerReserva(ingressos: IngressoMockItem[], cdEventosReservas: string): void {
	for (const ing of ingressos) {
		if (ing.cdEventosReservas !== cdEventosReservas) continue;
		ing.retirado = false;
		ing.dataRetirada = undefined;
		ing.cdLocalRetirada = undefined;
		ing.nomeLocalRetirada = undefined;
		ing.nomeOperadorRetirada = undefined;
	}
}

export function dtoParticipanteParaNomeDoc(participantes: ParticipanteMockListaItem[], cdEventosReservas: string) {
	const hit = encontrarReservaPorParticipanteId(participantes, cdEventosReservas);
	if (!hit) return { nome: "", documento: "" };
	return { nome: hit.pessoa.nome, documento: hit.pessoa.documento };
}
