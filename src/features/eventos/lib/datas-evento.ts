import type {
	EventoCadastroDto,
	EventoCriarPayload,
	EventoFormValores,
	EventoLoteIngressoForm,
	EventoLoteIngressoPayload,
	EventoProgramacaoDiaDto,
} from "@/features/eventos/types";

/** Corpo enviado ao Spring (LocalDateTime em ISO sem offset). */
export type EventoCriarBodySpring = Omit<
	EventoCriarPayload,
	| "dataEvento"
	| "horaInicio"
	| "horaFim"
	| "dataDesativacaoAutomatica"
	| "dataInicioExibicaoPortal"
	| "dataInicioExibicaoApp"
	| "lotes"
> & {
	dataEvento: string;
	dataFimEvento: string;
	dataDesativacaoAutomatica: string;
	/** No JSON Spring: `LocalDateTime` início do dia no aplicativo (ex.: `YYYY-MM-DDT00:00:00`). */
	dataInicioExibicaoApp: string;
	/** No JSON Spring: `LocalDateTime` início do dia de listagem (ex.: `YYYY-MM-DDT00:00:00`). */
	dataInicioExibicaoPortal: string;
	programacaoDiaria?: EventoProgramacaoDiaDto[];
	lotes?: EventoCriarPayload["lotes"];
};

/** Normaliza `H:mm` ou `HH:mm` para `HH:mm` (24h). */
export function normalizarHoraHm(hora: string | undefined): string {
	if (!hora?.trim()) return "00:00";
	const m = hora.trim().match(/^(\d{1,2}):(\d{2})/);
	if (!m) return "09:00";
	const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
	const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
	return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** `YYYY-MM-DD` + `HH:mm` → `YYYY-MM-DDTHH:mm:00` (ISO local para Spring). */
export function combinarDataHoraIsoLocal(dataYmd: string, horaHm: string): string {
	const d = (dataYmd ?? "").trim().slice(0, 10);
	const t = normalizarHoraHm(horaHm);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${new Date().toISOString().slice(0, 10)}T${t}:00`;
	return `${d}T${t}:00`;
}

/** Fim do dia civil (inclusivo na regra de visibilidade) em ISO local. */
export function desativacaoFimDiaIso(dataYmd: string): string {
	const d = (dataYmd ?? "").trim().slice(0, 10);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${new Date().toISOString().slice(0, 10)}T23:59:59`;
	return `${d}T23:59:59`;
}

function ymdValidoAgenda(s: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test((s ?? "").trim().slice(0, 10));
}

/** Avança um dia civil `YYYY-MM-DD` (calendário local). */
export function adicionarUmDiaYmd(ymd: string): string {
	const d = ymd.slice(0, 10);
	const [y, m, day] = d.split("-").map((x) => parseInt(x, 10));
	const dt = new Date(y, m - 1, day);
	dt.setDate(dt.getDate() + 1);
	const yy = dt.getFullYear();
	const mm = String(dt.getMonth() + 1).padStart(2, "0");
	const dd = String(dt.getDate()).padStart(2, "0");
	return `${yy}-${mm}-${dd}`;
}

/** Lista inclusiva de dias civis entre `inicioYmd` e `fimYmd` (ordem crescente). */
export function listarDiasCivisEntre(inicioYmd: string, fimYmd: string): string[] {
	const a = inicioYmd.slice(0, 10);
	const b = fimYmd.slice(0, 10);
	if (!ymdValidoAgenda(a)) return [];
	if (!ymdValidoAgenda(b)) return [a];
	if (b < a) return [a];
	const out: string[] = [];
	let cur = a;
	while (true) {
		out.push(cur);
		if (cur === b) break;
		cur = adicionarUmDiaYmd(cur);
	}
	return out;
}

export function programacaoMesmasHorasPorDias(
	diasYmd: string[],
	horaInicio: string,
	horaFim: string
): EventoProgramacaoDiaDto[] {
	const hi = normalizarHoraHm(horaInicio);
	const hf = normalizarHoraHm(horaFim);
	return diasYmd.map((data) => ({ data, horaInicio: hi, horaFim: hf }));
}

export function ordenarProgramacaoDiaria(p: EventoProgramacaoDiaDto[]): EventoProgramacaoDiaDto[] {
	return [...p].sort((x, y) => x.data.localeCompare(y.data));
}

/** Normaliza entradas do formulário ou deriva do intervalo + horas globais. */
export function programacaoDiariaDoFormulario(v: EventoFormValores): EventoProgramacaoDiaDto[] {
	const dInicio = v.dataEvento?.trim().slice(0, 10) ?? "";
	const varios = Boolean(v.eventoVariosDias);
	const rawFim = v.dataFimEventoDia?.trim().slice(0, 10) ?? "";
	const dFim =
		varios && ymdValidoAgenda(rawFim) && rawFim >= dInicio ? rawFim : dInicio;
	const brutas = (v.programacaoDiaria ?? []).filter((x) => x && ymdValidoAgenda(x.data));
	if (brutas.length > 0) {
		return ordenarProgramacaoDiaria(
			brutas.map((x) => ({
				data: x.data.trim().slice(0, 10),
				horaInicio: normalizarHoraHm(x.horaInicio),
				horaFim: normalizarHoraHm(x.horaFim),
			}))
		);
	}
	const dias = listarDiasCivisEntre(dInicio, dFim);
	return programacaoMesmasHorasPorDias(dias.length > 0 ? dias : [dInicio || new Date().toISOString().slice(0, 10)], v.horaInicio, v.horaFim);
}

/** A partir do DTO: usa `programacaoDiaria` se existir; senão deriva do par data/hora legado. */
export function programacaoDiariaDeDtoOuDerivada(e: EventoCadastroDto): EventoProgramacaoDiaDto[] {
	const expl = e.programacaoDiaria?.filter((x) => x && ymdValidoAgenda(x.data)) ?? [];
	if (expl.length > 0) {
		return ordenarProgramacaoDiaria(
			expl.map((x) => ({
				data: x.data.trim().slice(0, 10),
				horaInicio: normalizarHoraHm(x.horaInicio),
				horaFim: normalizarHoraHm(x.horaFim),
			}))
		);
	}
	const { dataDia, dataFimDia, horaInicio, horaFim } = extrairDataEHoraDoDtoLegadoSemProgramacao(e);
	const dias = listarDiasCivisEntre(dataDia, dataFimDia);
	return programacaoMesmasHorasPorDias(dias.length > 0 ? dias : [dataDia], horaInicio, horaFim);
}

/** Igual a {@link extrairDataEHoraDoDto} mas sem ler `programacaoDiaria` (evita recursão). */
function extrairDataEHoraDoDtoLegadoSemProgramacao(d: EventoCadastroDto): {
	dataDia: string;
	dataFimDia: string;
	horaInicio: string;
	horaFim: string;
} {
	const de = d.dataEvento ?? "";
	const df = d.dataFimEvento ?? "";
	if (de.includes("T")) {
		const dataDia = de.slice(0, 10);
		const hi = de.length >= 16 ? de.slice(11, 16) : normalizarHoraHm(d.horaInicio);
		let dataFimDia = dataDia;
		let hf = normalizarHoraHm(d.horaFim);
		if (df.includes("T") && df.length >= 10) {
			dataFimDia = df.slice(0, 10);
			if (df.length >= 16) hf = df.slice(11, 16);
		}
		return { dataDia, dataFimDia, horaInicio: hi, horaFim: hf };
	}
	const dataDia = de.slice(0, 10);
	const hi = normalizarHoraHm(d.horaInicio);
	let dataFimDia = dataDia;
	let hf = normalizarHoraHm(d.horaFim);
	if (df.includes("T") && df.length >= 10) {
		dataFimDia = df.slice(0, 10);
		if (df.length >= 16) hf = df.slice(11, 16);
	} else {
		const raw = df.trim().slice(0, 10);
		if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) dataFimDia = raw;
	}
	return { dataDia, dataFimDia, horaInicio: hi, horaFim: hf };
}

export function lotesFormParaPayload(lotes: EventoLoteIngressoForm[]): EventoLoteIngressoPayload[] {
	return lotes.map((l, i) => ({
		rotulo: l.rotulo?.trim() || `Lote ${i + 1}`,
		quantidade: Math.max(0, Math.floor(Number(l.quantidade) || 0)),
		ordem: i,
		modoLiberacao: l.modoLiberacao,
		dataLiberacaoVenda: l.modoLiberacao === "DATA_HORA" ? l.dataLiberacaoVenda?.trim().slice(0, 10) : undefined,
		horaLiberacaoVenda: l.modoLiberacao === "DATA_HORA" ? normalizarHoraHm(l.horaLiberacaoVenda) : undefined,
	}));
}

/** Converte valores do formulário para o JSON esperado pelo backend Spring. */
export function eventoFormParaPayloadSpring(v: EventoFormValores): EventoCriarBodySpring {
	const prog = programacaoDiariaDoFormulario(v);
	const primeiro = prog[0]!;
	const último = prog[prog.length - 1]!;
	const ingressoPorCpf = Math.max(1, Math.floor(Number(v.ingressoPorCpf) || 0));
	const ymdApp = v.dataInicioExibicaoApp?.trim().slice(0, 10) ?? "";
	const ymdPortal = v.dataInicioExibicaoPortal?.trim().slice(0, 10) ?? "";
	const ymdVendas = v.dataInicioVendasDia?.trim().slice(0, 10) ?? "";
	const dInicioUi = v.dataEvento?.trim().slice(0, 10) ?? primeiro.data;
	const dataInicioExibicaoAppIso =
		/^\d{4}-\d{2}-\d{2}$/.test(ymdApp) ? combinarDataHoraIsoLocal(ymdApp, "00:00") : combinarDataHoraIsoLocal(dInicioUi, "00:00");
	const base: EventoCriarBodySpring = {
		nomeEvento: v.nomeEvento,
		descricao: v.descricao,
		textoSucessoRegistro: v.textoSucessoRegistro,
		ingressoPorCpf,
		categoria: v.categoria,
		pontosDeTrocaCodigos: v.semPontoDeTroca
			? []
			: (v.pontosDeTrocaCodigos ?? []).map((p) => ({ ...p })),
		semPontoDeTroca: Boolean(v.semPontoDeTroca),
		dataEvento: combinarDataHoraIsoLocal(primeiro.data, primeiro.horaInicio),
		dataFimEvento: combinarDataHoraIsoLocal(último.data, último.horaFim),
		dataDesativacaoAutomatica: desativacaoFimDiaIso(v.dataDesativacaoAutomatica?.trim().slice(0, 10) ?? ""),
		dataInicioExibicaoApp: dataInicioExibicaoAppIso,
		dataInicioExibicaoPortal: /^\d{4}-\d{2}-\d{2}$/.test(ymdPortal) ? combinarDataHoraIsoLocal(ymdPortal, "00:00") : combinarDataHoraIsoLocal(dInicioUi, "00:00"),
		dataHoraInicioVendas: /^\d{4}-\d{2}-\d{2}$/.test(ymdVendas)
			? combinarDataHoraIsoLocal(ymdVendas, v.horaInicioVendas ?? "09:00")
			: combinarDataHoraIsoLocal(dInicioUi, v.horaInicio ?? "09:00"),
		quantidadeIngressosTotal: v.quantidadeIngressosTotal,
		exibirParaCidadao: Boolean(v.exibirParaCidadao),
		exibirVagas: Boolean(v.exibirVagas),
		eventoEmDestaque: Boolean(v.eventoEmDestaque),
		statusEvento: v.statusEvento,
		programacaoDiaria: prog,
	};
	if (v.lotes != null && v.lotes.length > 0) {
		return { ...base, lotes: lotesFormParaPayload(v.lotes) };
	}
	return base;
}

/** Extrai primeiro dia, último dia civil e horas do DTO (API em ISO ou legado só data + horas). */
export function extrairDataEHoraDoDto(d: EventoCadastroDto): {
	dataDia: string;
	dataFimDia: string;
	horaInicio: string;
	horaFim: string;
} {
	const ordenada = ordenarProgramacaoDiaria(
		(d.programacaoDiaria ?? []).filter((x) => x != null && ymdValidoAgenda(x.data)).map((x) => ({
			data: x.data.trim().slice(0, 10),
			horaInicio: normalizarHoraHm(x.horaInicio),
			horaFim: normalizarHoraHm(x.horaFim),
		}))
	);
	if (ordenada.length > 0) {
		const p0 = ordenada[0]!;
		const p1 = ordenada[ordenada.length - 1]!;
		return {
			dataDia: p0.data,
			dataFimDia: p1.data,
			horaInicio: p0.horaInicio,
			horaFim: p1.horaFim,
		};
	}
	return extrairDataEHoraDoDtoLegadoSemProgramacao(d);
}

export function extrairSoDataDesativacao(d: EventoCadastroDto): string {
	const s = d.dataDesativacaoAutomatica ?? "";
	if (s.includes("T")) return s.slice(0, 10);
	return s.slice(0, 10);
}

/** Data em calendário (só dia): `dd/mm/aaaa` em português. */
export function formatarDataPortugues(dataYmdOuIso: string): string {
	const s = dataYmdOuIso?.trim() ?? "";
	if (!s) return "—";
	const ymd = s.includes("T") ? s.slice(0, 10) : s.slice(0, 10);
	const parts = ymd.split("-").map(Number);
	if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return s;
	const [y, m, d] = parts;
	const dt = new Date(y, m - 1, d);
	if (Number.isNaN(dt.getTime())) return s;
	return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Hora `HH:mm` já em 24h; devolve normalizada para exibição. */
export function formatarHoraPortugues24(horaHm: string | undefined): string {
	return normalizarHoraHm(horaHm);
}

/** Instante ISO (com `T`) em português, 24h. */
export function formatarDataHoraPortugues24(iso: string): string {
	if (!iso?.trim()) return "—";
	const bruto = iso.trim();
	const paraParse = bruto.includes("T") ? bruto : `${bruto.slice(0, 10)}T12:00:00`;
	const d = new Date(paraParse);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

/** Texto compacto da agenda por dia (`dd/mm/aaaa HH:mm–HH:mm · …`). */
export function formatarProgramacaoDiariaPt(prog: EventoProgramacaoDiaDto[]): string {
	const o = ordenarProgramacaoDiaria(prog);
	if (o.length === 0) return "—";
	return o
		.map(
			(x) =>
				`${formatarDataPortugues(x.data)} ${formatarHoraPortugues24(x.horaInicio)}–${formatarHoraPortugues24(x.horaFim)}`
		)
		.join(" · ");
}

/** Resumo de período a partir dos valores do formulário (criação / confirmação). */
export function formatarPeriodoDatasFormularioPt(
	v: Pick<EventoFormValores, "dataEvento" | "dataFimEventoDia" | "eventoVariosDias" | "horaInicio" | "horaFim" | "programacaoDiaria">
): string {
	return formatarProgramacaoDiariaPt(programacaoDiariaDoFormulario(v as EventoFormValores));
}

/** Uma linha para tabelas: agenda por dia ou legado intervalo + horas. */
export function formatarEventoDataPeriodoPt(e: EventoCadastroDto): string {
	return formatarProgramacaoDiariaPt(programacaoDiariaDeDtoOuDerivada(e));
}
