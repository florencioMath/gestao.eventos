import type { EventoAnexoDto, EventoCadastroDto, EventoDominioOpcaoDto } from "@/features/eventos/types";
import { enriquecerEventoComProgramacao } from "./eventos-mock-helpers";
import { MOCK_EVENTOS_LISTA, type EventoMockListaItem } from "./eventos-mock-lista";
import {
	MOCK_PARTICIPANTES_LISTA,
	type IngressoMockItem,
	type ParticipanteMockListaItem,
} from "./participantes-mock-lista";

/** @deprecated Use {@link EventoMockListaItem} — mantido para imports antigos. */
export type EventoMockComAnexos = EventoMockListaItem;

/** Referência à lista mestre (`eventos-mock-lista.ts`). */
export const MOCK_EVENTOS_COM_ANEXOS = MOCK_EVENTOS_LISTA;

export const MOCK_DOMINIO_CATEGORIAS: EventoDominioOpcaoDto[] = [
	{ codigo: "cultural", nome: "Cultural" },
	{ codigo: "entretenimento", nome: "Entretenimento" },
	{ codigo: "esportivo", nome: "Esportivo" },
	{ codigo: "educacional", nome: "Educacional" },
];

export const MOCK_DOMINIO_LOCAIS: EventoDominioOpcaoDto[] = [
	{ codigo: "estadio-rochdale", nome: "Estádio do Rochdale" },
	{ codigo: "teatro-municipal", nome: "Teatro Municipal de Osasco" },
	{ codigo: "centro-eventos", nome: "Centro de Eventos Pedro Bortolosso" },
];

/** Clona eventos para o estado mutável do interceptor (POST/PUT). */
export function clonarEventosIniciais(): EventoCadastroDto[] {
	return MOCK_EVENTOS_LISTA.map((item) => enriquecerEventoComProgramacao({ ...item.evento }));
}

/** Mapa id evento → cópia dos anexos (mutável no mock de upload/delete). */
export function clonarImagensIniciaisPorEvento(): Map<string, EventoAnexoDto[]> {
	const m = new Map<string, EventoAnexoDto[]>();
	for (const item of MOCK_EVENTOS_LISTA) {
		const id = item.evento.cdEventosCadastro;
		m.set(id, item.anexos.map((a) => ({ ...a })));
	}
	return m;
}

/** Cópia profunda da lista participant-centric para o mock mutável. */
export function clonarParticipantesIniciais(): ParticipanteMockListaItem[] {
	return MOCK_PARTICIPANTES_LISTA.map((p) => ({
		...p,
		documento: String(p.documento).replace(/\D/g, "") || p.documento,
		telefone: String(p.telefone).replace(/\D/g, "") || p.telefone,
		reservas: p.reservas.map((r) => ({
			...r,
			ingressos: r.ingressos?.map((ing) => ({ ...ing })),
		})),
	}));
}

/** Lista achatada de ingressos (tokens QR) a partir das reservas em `MOCK_PARTICIPANTES_LISTA`. */
export function clonarIngressosIniciais(): IngressoMockItem[] {
	const out: IngressoMockItem[] = [];
	for (const p of MOCK_PARTICIPANTES_LISTA) {
		for (const r of p.reservas) {
			for (const ing of r.ingressos ?? []) {
				out.push({ ...ing });
			}
		}
	}
	return out;
}

export type { EventoMockListaItem } from "./eventos-mock-lista";
export { MOCK_EVENTOS_LISTA } from "./eventos-mock-lista";
export type { IngressoMockItem, ParticipanteMockListaItem, ReservaMockItem } from "./participantes-mock-lista";
export { MOCK_PARTICIPANTES_LISTA } from "./participantes-mock-lista";
