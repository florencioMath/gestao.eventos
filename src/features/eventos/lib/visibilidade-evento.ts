import type { EventoCadastroDto, EventoFormValores } from "@/features/eventos/types";
import { combinarDataHoraIsoLocal, extrairDataEHoraDoDto } from "@/features/eventos/lib/datas-evento";

/** Primeiro dia civil de listagem no portal (`YYYY-MM-DD`). */
export function obterYmdInicioListagemPortal(evento: EventoCadastroDto): string {
	const raw = evento.dataInicioExibicaoPortal?.trim();
	if (raw && raw.length >= 10) return raw.slice(0, 10);
	return extrairDataEHoraDoDto(evento).dataDia;
}

/** Primeiro dia civil de exibição no aplicativo (`YYYY-MM-DD`). */
export function obterYmdInicioExibicaoApp(evento: EventoCadastroDto): string {
	const raw = evento.dataInicioExibicaoApp?.trim();
	if (raw && raw.length >= 10) return raw.slice(0, 10);
	return obterYmdInicioListagemPortal(evento);
}

/** ISO local `YYYY-MM-DDTHH:mm:ss` usado para exibir o início global de vendas. */
export function obterIsoDataHoraInicioVendas(evento: EventoCadastroDto): string {
	const raw = evento.dataHoraInicioVendas?.trim();
	if (raw?.includes("T")) return raw.slice(0, 19);
	const { dataDia, horaInicio } = extrairDataEHoraDoDto(evento);
	return combinarDataHoraIsoLocal(dataDia, horaInicio);
}

/** Instantâneo (ms) a partir do qual as reservas podem abrir (regra global do evento). */
export function obterInstanteInicioVendasMs(evento: EventoCadastroDto): number {
	const ms = Date.parse(obterIsoDataHoraInicioVendas(evento));
	return Number.isNaN(ms) ? Number.MAX_SAFE_INTEGER : ms;
}

/**
 * O evento aparece no catálogo do portal quando `exibirParaCidadao` é verdadeiro.
 * As datas de exibição/desativação não retiram o evento do catálogo; regem sobretudo inscrição e cópia administrativa.
 */
export function eventoListadoNoPortal(evento: EventoCadastroDto, _ref: Date = new Date()): boolean {
	void _ref;
	return Boolean(evento.exibirParaCidadao);
}

export type EstadoPortalPublico = "fora_listagem" | "em_breve" | "apos_inicio_vendas";

/**
 * Estado percebido no portal: oculto no catálogo, visível como «Em breve» (sem reserva), ou após início de vendas.
 */
export function eventoEstadoPortal(evento: EventoCadastroDto, ref: Date = new Date()): EstadoPortalPublico {
	if (!evento.exibirParaCidadao) return "fora_listagem";
	const t = ref.getTime();
	if (t < obterInstanteInicioVendasMs(evento)) return "em_breve";
	return "apos_inicio_vendas";
}

export function rotuloEstadoPortalPublico(evento: EventoCadastroDto, ref: Date = new Date()): string {
	switch (eventoEstadoPortal(evento, ref)) {
		case "fora_listagem":
			return "Oculto no catálogo";
		case "em_breve":
			return "Em breve (sem reserva)";
		case "apos_inicio_vendas":
			return "Reservas conforme lotes";
		default:
			return "—";
	}
}

/**
 * @deprecated Preferir {@link eventoListadoNoPortal}. Mantido para chamadas antigas: equivale a listagem no portal.
 */
export function eventoVisivelNoPeriodo(evento: EventoCadastroDto, ref: Date = new Date()): boolean {
	return eventoListadoNoPortal(evento, ref);
}

/**
 * Elegível ao catálogo do portal conforme `exibirParaCidadao`.
 * Os parâmetros de data mantêm-se por compatibilidade de chamadas; são ignorados na regra de listagem.
 */
export function eventoListadoComDatas(
	exibirParaCidadao: boolean,
	_dataInicioExibicaoPortalYmd?: string,
	_dataDesativacaoAutomaticaYmd?: string,
	_ref?: Date
): boolean {
	void _dataInicioExibicaoPortalYmd;
	void _dataDesativacaoAutomaticaYmd;
	void _ref;
	return Boolean(exibirParaCidadao);
}

/**
 * @deprecated Preferir {@link eventoListadoComDatas}.
 */
export function eventoVisivelComDatas(
	exibirParaCidadao: boolean,
	_dataEventoYmd?: string,
	_dataDesativacaoAutomaticaYmd?: string,
	_ref?: Date,
	_dataInicioExibicaoPortalYmd?: string
): boolean {
	void _dataEventoYmd;
	void _dataDesativacaoAutomaticaYmd;
	void _ref;
	void _dataInicioExibicaoPortalYmd;
	return Boolean(exibirParaCidadao);
}

/** Elegível a aparecer no catálogo do portal. */
export function rotuloElegivelCatalogoPortal(exibirParaCidadao: boolean): string {
	return exibirParaCidadao ? "Exibe no catálogo" : "Não exibe";
}

/** @deprecated Usar {@link rotuloElegivelCatalogoPortal}. */
export function rotuloStatusPublicacao(exibirParaCidadao: boolean): "Ativo" | "Inativo" {
	return exibirParaCidadao ? "Ativo" : "Inativo";
}

type ResumoPortalCampos = Pick<
	EventoFormValores,
	| "exibirParaCidadao"
	| "dataInicioExibicaoPortal"
	| "dataDesativacaoAutomatica"
	| "dataInicioVendasDia"
	| "horaInicioVendas"
	| "dataEvento"
>;

/** Igual a {@link eventoEstadoPortal} para valores de formulário (resumo de criação). */
export function estadoPortalFormularioResumo(v: ResumoPortalCampos, ref: Date = new Date()): EstadoPortalPublico {
	if (!v.exibirParaCidadao) return "fora_listagem";
	const diaV = (v.dataInicioVendasDia ?? "").trim().slice(0, 10);
	const isoVendas = /^\d{4}-\d{2}-\d{2}$/.test(diaV)
		? combinarDataHoraIsoLocal(diaV, v.horaInicioVendas ?? "09:00")
		: "";
	const ms = isoVendas ? Date.parse(isoVendas) : Number.NaN;
	if (Number.isNaN(ms) || ref.getTime() < ms) return "em_breve";
	return "apos_inicio_vendas";
}

export function rotuloEstadoPortalFormulario(v: ResumoPortalCampos, ref: Date = new Date()): string {
	switch (estadoPortalFormularioResumo(v, ref)) {
		case "fora_listagem":
			return "Oculto no catálogo";
		case "em_breve":
			return "Em breve (sem reserva)";
		case "apos_inicio_vendas":
			return "Reservas conforme lotes";
		default:
			return "—";
	}
}

/** Portal: se o utilizador pode tentar reservar (passou «Em breve»); regras de lote aplicam-se em seguida. */
export function eventoPermiteTentativaReservaPortal(evento: EventoCadastroDto, ref: Date = new Date()): boolean {
	return eventoEstadoPortal(evento, ref) === "apos_inicio_vendas";
}
