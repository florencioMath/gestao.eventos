import {
	combinarDataHoraIsoLocal,
	listarDiasCivisEntre,
	normalizarHoraHm,
	programacaoDiariaDeDtoOuDerivada,
	programacaoMesmasHorasPorDias,
} from "@/features/eventos/lib/datas-evento";
import type {
	EventoCadastroDto,
	EventoLoteIngressoPayload,
	EventoProgramacaoDiaDto,
	LocalTrocaDto,
	PontoTrocaEventoDto,
} from "@/features/eventos/types";

export function agoraIso(): string {
	return new Date().toISOString();
}

export function isoSóData(isoOuYmd: string): string {
	const s = (isoOuYmd ?? "").trim();
	if (s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
	return "1970-01-01";
}

function ymdValido(s: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test((s ?? "").trim().slice(0, 10));
}

function ymdDeBruto(raw: string): string {
	const t = (raw ?? "").trim();
	if (t.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
	return new Date().toISOString().slice(0, 10);
}

function ordenarProgramacao(p: EventoProgramacaoDiaDto[]): EventoProgramacaoDiaDto[] {
	return [...p].sort((x, y) => x.data.localeCompare(y.data));
}

/** Interpreta `programacaoDiaria` enviada no JSON do mock. */
export function parseProgramacaoDiariaDoBody(body: Record<string, unknown>): EventoProgramacaoDiaDto[] | undefined {
	const raw = body.programacaoDiaria;
	if (!Array.isArray(raw) || raw.length === 0) return undefined;
	const out: EventoProgramacaoDiaDto[] = [];
	for (const item of raw) {
		if (!item || typeof item !== "object") continue;
		const o = item as Record<string, unknown>;
		const data = String(o.data ?? "").trim().slice(0, 10);
		if (!ymdValido(data)) continue;
		out.push({
			data,
			horaInicio: normalizarHoraHm(String(o.horaInicio ?? "09:00")),
			horaFim: normalizarHoraHm(String(o.horaFim ?? "18:00")),
		});
	}
	return out.length > 0 ? ordenarProgramacao(out) : undefined;
}

function parseBooleanoCorpo(body: Record<string, unknown>, chave: string, atual: boolean): boolean {
	if (!Object.prototype.hasOwnProperty.call(body, chave)) return atual;
	const v = body[chave];
	if (v === true || v === "true" || v === "on") return true;
	if (v === false || v === "false" || v === "off") return false;
	const s = String(v).trim().toLowerCase();
	if (s === "sim" || s === "yes" || s === "1") return true;
	if (s === "não" || s === "nao" || s === "no" || s === "0") return false;
	return Boolean(v);
}

/**
 * `exibirParaCidadao` no catálogo; o mock aceita `ativo` e `publicadoNoCatalogo` como sinónimos (entrada legada).
 * Em PUT, só altera quando um destes campos vem no body.
 */
export function parseexibirParaCidadaoCatalogoEventoBody(body: Record<string, unknown>, atual: boolean): boolean {
	const temChave =
		Object.prototype.hasOwnProperty.call(body, "ativo") ||
		Object.prototype.hasOwnProperty.call(body, "exibirParaCidadao") ||
		Object.prototype.hasOwnProperty.call(body, "publicadoNoCatalogo");
	if (!temChave) return atual;
	const raw = body.exibirParaCidadao ?? body.ativo ?? body.publicadoNoCatalogo;
	if (raw === true || raw === "true" || raw === "on") return true;
	if (raw === false || raw === "false" || raw === "off") return false;
	const s = String(raw).trim().toLowerCase();
	if (s === "sim" || s === "yes" || s === "1") return true;
	if (s === "não" || s === "nao" || s === "no" || s === "0") return false;
	return Boolean(raw);
}

/** @deprecated Usar {@link parseexibirParaCidadaoCatalogoEventoBody}. */
export const parseAtivoCatalogoEventoBody = parseexibirParaCidadaoCatalogoEventoBody;

/** Valor por omissão em criação quando nenhum campo de catálogo vem no body. */
export function parseexibirParaCidadaoCatalogoEventoCriacao(body: Record<string, unknown>): boolean {
	const temChave =
		Object.prototype.hasOwnProperty.call(body, "ativo") ||
		Object.prototype.hasOwnProperty.call(body, "exibirParaCidadao") ||
		Object.prototype.hasOwnProperty.call(body, "publicadoNoCatalogo");
	if (!temChave) return true;
	return parseexibirParaCidadaoCatalogoEventoBody(body, true);
}

/** @deprecated Usar {@link parseexibirParaCidadaoCatalogoEventoCriacao}. */
export const parseAtivoCatalogoEventoCriacao = parseexibirParaCidadaoCatalogoEventoCriacao;

export function parsePontosDeTrocaDoBody(
	body: Record<string, unknown>,
	atual: PontoTrocaEventoDto[],
	locaisCatalogo: LocalTrocaDto[]
): PontoTrocaEventoDto[] {
	if (!Object.prototype.hasOwnProperty.call(body, "pontosDeTrocaCodigos")) return atual;
	const raw = body.pontosDeTrocaCodigos;
	if (!Array.isArray(raw)) return atual;
	const out: PontoTrocaEventoDto[] = [];
	for (const x of raw) {
		if (typeof x === "string") {
			const id = x.trim();
			if (!id) continue;
			const l = locaisCatalogo.find((c) => c.cdLocalTroca === id);
			out.push({
				id,
				nome: l?.nome?.trim() || id,
				endereco: l?.endereco?.trim() || "",
			});
			continue;
		}
		if (x && typeof x === "object") {
			const o = x as Record<string, unknown>;
			const id = String(o.id ?? o.cdLocalTroca ?? "").trim();
			if (!id) continue;
			const nomeIn = String(o.nome ?? "").trim();
			const endIn = String(o.endereco ?? "").trim();
			const l = locaisCatalogo.find((c) => c.cdLocalTroca === id);
			out.push({
				id,
				nome: nomeIn || l?.nome?.trim() || id,
				endereco: endIn || l?.endereco?.trim() || "",
			});
		}
	}
	return out;
}

export function parseSemPontoDeTrocaDoBody(body: Record<string, unknown>, atual: boolean): boolean {
	return parseBooleanoCorpo(body, "semPontoDeTroca", atual);
}

export function parseExibirVagasDoBody(body: Record<string, unknown>, atual: boolean): boolean {
	return parseBooleanoCorpo(body, "exibirVagas", atual);
}

export function parseDataYmdOpcionalDoBody(body: Record<string, unknown>, chave: string): string | undefined {
	if (!Object.prototype.hasOwnProperty.call(body, chave)) return undefined;
	const s = String(body[chave] ?? "").trim();
	if (s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
	return undefined;
}

export function camposDataDeBodyEvento(body: Record<string, unknown>): {
	dataEvento: string;
	horaInicio: string;
	horaFim: string;
	dataFimEvento: string;
	dataDesativacaoAutomatica: string;
	programacaoDiaria: EventoProgramacaoDiaDto[];
} {
	const rawData = String(body.dataEvento ?? "").trim();
	const ymdInicio = ymdDeBruto(rawData);
	const horaInicioDefault = normalizarHoraHm(String(body.horaInicio ?? "09:00"));
	const horaFimDefault = normalizarHoraHm(String(body.horaFim ?? "18:00"));

	const dataFimBruto = body.dataFimEvento != null ? String(body.dataFimEvento).trim() : "";
	const ymdFimDeIso = dataFimBruto ? ymdDeBruto(dataFimBruto) : ymdInicio;

	const des = String(body.dataDesativacaoAutomatica ?? "").trim();
	const dataDesativacaoAutomatica =
		des.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(des) ? des.slice(0, 10) : ymdInicio;

	const explícita = parseProgramacaoDiariaDoBody(body);
	let programacaoDiaria: EventoProgramacaoDiaDto[];
	if (explícita && explícita.length > 0) {
		programacaoDiaria = explícita;
	} else {
		const dias = listarDiasCivisEntre(ymdInicio, ymdFimDeIso);
		programacaoDiaria = programacaoMesmasHorasPorDias(
			dias.length > 0 ? dias : [ymdInicio],
			horaInicioDefault,
			horaFimDefault
		);
	}

	const primeiro = programacaoDiaria[0]!;
	const último = programacaoDiaria[programacaoDiaria.length - 1]!;
	const horaInicio = primeiro.horaInicio;
	const horaFim = último.horaFim;
	const dataEvento = combinarDataHoraIsoLocal(primeiro.data, horaInicio);
	const dataFimEvento = combinarDataHoraIsoLocal(último.data, horaFim);

	return {
		dataEvento,
		horaInicio,
		horaFim,
		dataFimEvento,
		dataDesativacaoAutomatica,
		programacaoDiaria,
	};
}

export function lotesPadraoParaTotal(total: number): EventoLoteIngressoPayload[] {
	return [
		{
			rotulo: "1.º lote",
			quantidade: total,
			ordem: 0,
			modoLiberacao: "IMEDIATA",
		},
	];
}

/** @deprecated Usar {@link programacaoDiariaDeDtoOuDerivada} de `@/features/eventos/lib/datas-evento`. */
export const programacaoDiariaDerivadaDoEvento = programacaoDiariaDeDtoOuDerivada;

export function enriquecerEventoComProgramacao(e: EventoCadastroDto): EventoCadastroDto {
	if (e.programacaoDiaria != null && e.programacaoDiaria.length > 0) return e;
	return { ...e, programacaoDiaria: programacaoDiariaDeDtoOuDerivada(e) };
}

export function parseLotesDoBody(body: Record<string, unknown>): EventoLoteIngressoPayload[] | undefined {
	const raw = body.lotes;
	if (!Array.isArray(raw) || raw.length === 0) return undefined;
	const lotes: EventoLoteIngressoPayload[] = [];
	for (const item of raw) {
		if (!item || typeof item !== "object") continue;
		const o = item as Record<string, unknown>;
		const modo = o.modoLiberacao;
		const modoLiberacao: EventoLoteIngressoPayload["modoLiberacao"] =
			modo === "IMEDIATA" || modo === "DATA_HORA" || modo === "APOS_ESGOTAR_ANTERIOR" ? modo : "IMEDIATA";
		lotes.push({
			rotulo: String(o.rotulo ?? ""),
			quantidade: Math.max(0, Math.floor(Number(o.quantidade) || 0)),
			ordem: Number.isFinite(Number(o.ordem)) ? Math.floor(Number(o.ordem)) : lotes.length,
			modoLiberacao,
			dataLiberacaoVenda:
				o.dataLiberacaoVenda != null ? String(o.dataLiberacaoVenda).slice(0, 10) : undefined,
			horaLiberacaoVenda: o.horaLiberacaoVenda != null ? String(o.horaLiberacaoVenda) : undefined,
		});
	}
	return lotes.length > 0 ? lotes : undefined;
}
