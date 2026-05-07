import { combinarDataHoraIsoLocal } from "@/features/eventos/lib/datas-evento";
import { api } from "@/lib/api";
import type { EventoAnexoDto, EventoCadastroDto, LocalTrocaDto, RelatorioGeradoDto } from "@/features/eventos/types";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {
	agoraIso,
	camposDataDeBodyEvento,
	isoSóData,
	lotesPadraoParaTotal,
	parseDataYmdOpcionalDoBody,
	parseexibirParaCidadaoCatalogoEventoBody,
	parseexibirParaCidadaoCatalogoEventoCriacao,
	parseExibirVagasDoBody,
	parseLotesDoBody,
	parsePontosDeTrocaDoBody,
	parseSemPontoDeTrocaDoBody,
} from "./eventos-mock-helpers.ts";
import {
	MOCK_DOMINIO_CATEGORIAS,
	MOCK_DOMINIO_LOCAIS,
	clonarEventosIniciais,
	clonarImagensIniciaisPorEvento,
	clonarIngressosIniciais,
	clonarParticipantesIniciais,
} from "./eventos-mock-dados.ts";
import {
	encontrarReservaPorParticipanteId,
	encontrarPessoaPorDocumento,
	lotePorOrdemString,
	nomeLocalPorId,
	reservaParaHistoricoDto,
	reservaParaParticipanteDto,
	somaIngressosAtivosNoEvento,
	somaIngressosReservadosNoLote,
} from "./participantes-mock-helpers.ts";
import {
	desmarcarIngressosAoDesfazerReserva,
	dtoParticipanteParaNomeDoc,
	encontrarIngressoPorTokenQr,
	marcarTodosIngressosRetiradosParaReserva,
	montarResolverIngressoQr,
	sincronizarReservaAPartirDosIngressos,
} from "./ingressos-mock-helpers.ts";
import type { ParticipanteMockListaItem } from "./participantes-mock-lista.ts";
import { aplicarRespostaMockada } from "./resposta-mock-axios.ts";

function novoId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`;
}

/** Caminho lógico da API (axios pode expor URL com prefixo do proxy, ex.: `/demutran-ws/eventos`). */
function pathNormalizado(config: InternalAxiosRequestConfig): string {
	const raw = (config.url ?? "").split("?")[0];
	let p = raw;
	if (p.startsWith("http")) {
		try {
			p = new URL(p).pathname;
		} catch {
			/* mantém */
		}
	}
	const marcas = ["/eventos", "/imagens", "/ingressos", "/participantes", "/relatorios", "/locais-troca"];
	for (const m of marcas) {
		const i = p.indexOf(m);
		if (i >= 0) return p.slice(i);
	}
	return p.startsWith("/") ? p : `/${p}`;
}

let eventos: EventoCadastroDto[] = clonarEventosIniciais();

let locaisTroca: LocalTrocaDto[] = [
	{
		cdLocalTroca: "lt-rochdale",
		nome: "Estádio do Rochdale",
		endereco: "Av. Brasil, 1361 — Rochdale, Osasco/SP",
		ativo: true,
		dataCriacao: agoraIso(),
		dataAtualizacao: agoraIso(),
	},
	{
		cdLocalTroca: "lt-escola-salvi",
		nome: "Escola de Artes César Antônio Salvi",
		endereco: "Rua Ten. Avelar Píres de Azevedo, 360 — Centro, Osasco/SP",
		ativo: true,
		dataCriacao: agoraIso(),
		dataAtualizacao: agoraIso(),
	},
];

const imagensPorEvento = clonarImagensIniciaisPorEvento();

/** Estado mutável participant-centric (reservas por pessoa). */
const participantes: ParticipanteMockListaItem[] = clonarParticipantesIniciais();

/** Ingressos individuais (mock QR por ingresso). */
const ingressos = clonarIngressosIniciais();

function reconciliarContadoresEventos(): void {
	for (let i = 0; i < eventos.length; i++) {
		const ev = eventos[i]!;
		const reservados = somaIngressosAtivosNoEvento(participantes, ev.cdEventosCadastro);
		eventos[i] = {
			...ev,
			quantidadeIngressosReservados: reservados,
			quantidadeIngressosDisponiveis: Math.max(0, ev.quantidadeIngressosTotal - reservados),
		};
	}
}

reconciliarContadoresEventos();

function obterEventoPorId(id: string): EventoCadastroDto | undefined {
	return eventos.find((x) => x.cdEventosCadastro === id);
}

function diasAtrasIso(dias: number): string {
	const d = new Date();
	d.setDate(d.getDate() - dias);
	return d.toISOString();
}

const relatoriosGerados: RelatorioGeradoDto[] = [
	{
		id: "rel-1",
		titulo: "Resumo de ocupação — eventos ativos",
		dataGeracao: diasAtrasIso(3),
		periodoInicio: diasAtrasIso(30),
		periodoFim: diasAtrasIso(0),
	},
	{
		id: "rel-2",
		titulo: "Lista de reservas por período",
		dataGeracao: diasAtrasIso(10),
		periodoInicio: diasAtrasIso(25),
		periodoFim: diasAtrasIso(5),
	},
	{
		id: "rel-3",
		titulo: "Participação confirmada",
		dataGeracao: diasAtrasIso(20),
		periodoInicio: diasAtrasIso(28),
		periodoFim: diasAtrasIso(12),
	},
];

function blobTexto(linhas: string[]): Blob {
	const texto = linhas.join("\n");
	return new Blob([texto], { type: "application/octet-stream" });
}

function tratar(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | void {
	const metodo = (config.method ?? "get").toLowerCase();
	const path = pathNormalizado(config);

	if (metodo === "get" && path === "/eventos") {
		return aplicarRespostaMockada(config, () => [...eventos]);
	}

	if (metodo === "get" && path === "/eventos/dominio/categorias") {
		return aplicarRespostaMockada(config, () => [...MOCK_DOMINIO_CATEGORIAS]);
	}

	if (metodo === "get" && path === "/eventos/dominio/locais") {
		return aplicarRespostaMockada(config, () => [...MOCK_DOMINIO_LOCAIS]);
	}

	if (metodo === "get" && path.startsWith("/eventos/")) {
		const id = path.slice("/eventos/".length);
		if (!id || id.includes("/")) return;
		return aplicarRespostaMockada(config, () => {
			const e = eventos.find((x) => x.cdEventosCadastro === id);
			if (!e) throw { status: 404, message: "Evento não encontrado." };
			return e;
		});
	}

	if (metodo === "post" && path === "/eventos") {
		return aplicarRespostaMockada(config, () => {
			const body = (typeof config.data === "string" ? JSON.parse(config.data) : config.data) as Record<string, unknown>;
			const id = novoId();
			const total = Number(body.quantidadeIngressosTotal);
			if (!Number.isFinite(total) || total < 1) {
				throw { status: 400, message: "quantidadeIngressosTotal inválido." };
			}
			const exibirParaCidadao = parseexibirParaCidadaoCatalogoEventoCriacao(body);
			const emDestaque =
				body.eventoEmDestaque === true ||
				body.eventoEmDestaque === "true" ||
				String(body.eventoEmDestaque).toLowerCase() === "on";
			const dt = camposDataDeBodyEvento(body);
			const lotesApi = parseLotesDoBody(body);
			const ingressoPorCpfRaw = Number(body.ingressoPorCpf);
			const ingressoPorCpf =
				Number.isFinite(ingressoPorCpfRaw) && ingressoPorCpfRaw >= 1 ? Math.floor(ingressoPorCpfRaw) : 1;
			const ymdPrimeiroDia = isoSóData(dt.dataEvento);
			const dataInicioExibicaoPortal =
				body.dataInicioExibicaoPortal != null ? String(body.dataInicioExibicaoPortal).slice(0, 10) : ymdPrimeiroDia;
			const dataInicioExibicaoApp =
				parseDataYmdOpcionalDoBody(body, "dataInicioExibicaoApp") ?? dataInicioExibicaoPortal;
			const semPontoDeTroca =
				body.semPontoDeTroca === true ||
				body.semPontoDeTroca === "true" ||
				String(body.semPontoDeTroca).toLowerCase() === "on" ||
				String(body.semPontoDeTroca).toLowerCase() === "sim";
			const pontosDeTrocaCodigos = semPontoDeTroca
				? []
				: parsePontosDeTrocaDoBody(body, [], locaisTroca);
			const exibirVagas =
				body.exibirVagas === false ||
				body.exibirVagas === "false" ||
				String(body.exibirVagas).toLowerCase() === "off" ||
				String(body.exibirVagas).toLowerCase() === "nao" ||
				String(body.exibirVagas).toLowerCase() === "não"
					? false
					: true;
			const dataHoraInicioVendas =
				body.dataHoraInicioVendas != null
					? String(body.dataHoraInicioVendas)
					: combinarDataHoraIsoLocal(ymdPrimeiroDia, dt.horaInicio);
			const novo: EventoCadastroDto = {
				cdEventosCadastro: id,
				nomeEvento: String(body.nomeEvento ?? ""),
				descricao: String(body.descricao ?? ""),
				textoSucessoRegistro: String(body.textoSucessoRegistro ?? ""),
				ingressoPorCpf,
				categoria: String(body.categoria ?? ""),
				pontosDeTrocaCodigos,
				semPontoDeTroca,
				dataEvento: dt.dataEvento,
				horaInicio: dt.horaInicio,
				horaFim: dt.horaFim,
				dataFimEvento: dt.dataFimEvento,
				dataDesativacaoAutomatica: dt.dataDesativacaoAutomatica,
				dataInicioExibicaoApp,
				dataInicioExibicaoPortal,
				dataHoraInicioVendas,
				quantidadeIngressosTotal: total,
				quantidadeIngressosReservados: 0,
				quantidadeIngressosDisponiveis: total,
				exibirParaCidadao,
				exibirVagas,
				eventoEmDestaque: emDestaque,
				statusEvento: String(body.statusEvento ?? "RASCUNHO"),
				cdEventosUsuariosCriacao: "1",
				dataCriacao: agoraIso(),
				dataAtualizacao: agoraIso(),
				lotes: lotesApi ?? lotesPadraoParaTotal(total),
				programacaoDiaria: dt.programacaoDiaria,
			};
			eventos = [novo, ...eventos];
			imagensPorEvento.set(id, []);
			return novo;
		});
	}

	if (metodo === "get" && path === "/locais-troca") {
		return aplicarRespostaMockada(config, () => [...locaisTroca]);
	}

	if (metodo === "post" && path === "/locais-troca") {
		return aplicarRespostaMockada(config, () => {
			const body = (typeof config.data === "string" ? JSON.parse(config.data) : config.data) as Record<string, unknown>;
			const nome = String(body.nome ?? "").trim();
			const endereco = String(body.endereco ?? "").trim();
			if (!nome || !endereco) {
				throw { status: 400, message: "Nome e endereço são obrigatórios." };
			}
			const ativo =
				body.ativo === true ||
				body.ativo === "true" ||
				body.ativo === "on" ||
				String(body.ativo).toLowerCase() === "sim";
			const id = novoId();
			const novo: LocalTrocaDto = {
				cdLocalTroca: id,
				nome,
				endereco,
				ativo,
				dataCriacao: agoraIso(),
				dataAtualizacao: agoraIso(),
			};
			locaisTroca = [novo, ...locaisTroca];
			return novo;
		});
	}

	if (metodo === "put" && path.startsWith("/locais-troca/")) {
		const id = path.slice("/locais-troca/".length);
		if (id.includes("/")) return;
		return aplicarRespostaMockada(config, () => {
			const body = (typeof config.data === "string" ? JSON.parse(config.data) : config.data) as Record<string, unknown>;
			const idx = locaisTroca.findIndex((x) => x.cdLocalTroca === id);
			if (idx < 0) throw { status: 404, message: "Local de troca não encontrado." };
			const atual = locaisTroca[idx]!;
			const nome = body.nome != null ? String(body.nome).trim() : atual.nome;
			const endereco = body.endereco != null ? String(body.endereco).trim() : atual.endereco;
			if (!nome || !endereco) {
				throw { status: 400, message: "Nome e endereço são obrigatórios." };
			}
			const ativo =
				body.ativo !== undefined
					? body.ativo === true ||
						body.ativo === "true" ||
						body.ativo === "on" ||
						String(body.ativo).toLowerCase() === "sim"
					: atual.ativo;
			const atualizado: LocalTrocaDto = {
				...atual,
				nome,
				endereco,
				ativo,
				dataAtualizacao: agoraIso(),
			};
			const copia = [...locaisTroca];
			copia[idx] = atualizado;
			locaisTroca = copia;
			return atualizado;
		});
	}

	if (metodo === "put" && path.startsWith("/eventos/")) {
		const id = path.slice("/eventos/".length);
		return aplicarRespostaMockada(config, () => {
			const body = (typeof config.data === "string" ? JSON.parse(config.data) : config.data) as Record<string, unknown>;
			const idx = eventos.findIndex((x) => x.cdEventosCadastro === id);
			if (idx < 0) throw { status: 404, message: "Evento não encontrado." };
			const atual = eventos[idx]!;
			const reservados = atual.quantidadeIngressosReservados;
			const total = Number(body.quantidadeIngressosTotal ?? atual.quantidadeIngressosTotal);
			if (total < reservados) throw { status: 400, message: "Total de ingressos não pode ser menor que reservados." };
			const merged: Record<string, unknown> = { ...atual, ...body };
			if (!Object.prototype.hasOwnProperty.call(body, "programacaoDiaria")) {
				delete merged.programacaoDiaria;
			}
			const dt = camposDataDeBodyEvento(merged);
			const lotesApi = parseLotesDoBody(body);
			const ingressoPut =
				body.ingressoPorCpf != null
					? (() => {
							const n = Math.floor(Number(body.ingressoPorCpf));
							return Number.isFinite(n) && n >= 1 ? n : (atual.ingressoPorCpf ?? 1);
						})()
					: (atual.ingressoPorCpf ?? 1);
			const novoDestaque =
				body.eventoEmDestaque !== undefined
					? body.eventoEmDestaque === true ||
						body.eventoEmDestaque === "true" ||
						String(body.eventoEmDestaque).toLowerCase() === "on"
					: Boolean(atual.eventoEmDestaque);
			const semPonto = Object.prototype.hasOwnProperty.call(body, "semPontoDeTroca")
				? parseSemPontoDeTrocaDoBody(body, atual.semPontoDeTroca)
				: atual.semPontoDeTroca;
			let pontosFinal = atual.pontosDeTrocaCodigos ?? [];
			if (semPonto) pontosFinal = [];
			else if (Object.prototype.hasOwnProperty.call(body, "pontosDeTrocaCodigos")) {
				pontosFinal = parsePontosDeTrocaDoBody(body, pontosFinal, locaisTroca);
			}
			const dataAppYmd =
				parseDataYmdOpcionalDoBody(body, "dataInicioExibicaoApp") ??
				(atual.dataInicioExibicaoApp != null ? String(atual.dataInicioExibicaoApp).slice(0, 10) : undefined);
			const atualizado: EventoCadastroDto = {
				...atual,
				nomeEvento: body.nomeEvento != null ? String(body.nomeEvento) : atual.nomeEvento,
				descricao: body.descricao != null ? String(body.descricao) : atual.descricao,
				textoSucessoRegistro:
					body.textoSucessoRegistro != null ? String(body.textoSucessoRegistro) : atual.textoSucessoRegistro,
				ingressoPorCpf: ingressoPut,
				categoria: body.categoria != null ? String(body.categoria) : atual.categoria,
				semPontoDeTroca: semPonto,
				pontosDeTrocaCodigos: pontosFinal,
				dataEvento: dt.dataEvento,
				horaInicio: dt.horaInicio,
				horaFim: dt.horaFim,
				dataFimEvento: dt.dataFimEvento ?? atual.dataFimEvento,
				dataDesativacaoAutomatica: dt.dataDesativacaoAutomatica,
				dataInicioExibicaoApp:
					body.dataInicioExibicaoApp != null
						? String(body.dataInicioExibicaoApp).slice(0, 10)
						: (dataAppYmd ?? atual.dataInicioExibicaoApp),
				dataInicioExibicaoPortal:
					body.dataInicioExibicaoPortal != null
						? String(body.dataInicioExibicaoPortal).slice(0, 10)
						: atual.dataInicioExibicaoPortal,
				dataHoraInicioVendas:
					body.dataHoraInicioVendas != null ? String(body.dataHoraInicioVendas) : atual.dataHoraInicioVendas,
				quantidadeIngressosTotal: total,
				quantidadeIngressosDisponiveis: total - reservados,
				exibirParaCidadao: parseexibirParaCidadaoCatalogoEventoBody(body, atual.exibirParaCidadao),
				exibirVagas: parseExibirVagasDoBody(body, atual.exibirVagas),
				eventoEmDestaque: novoDestaque,
				statusEvento: body.statusEvento != null ? String(body.statusEvento) : atual.statusEvento,
				dataAtualizacao: agoraIso(),
				lotes: lotesApi ?? atual.lotes ?? lotesPadraoParaTotal(total),
				programacaoDiaria: dt.programacaoDiaria,
			};
			eventos[idx] = atualizado;
			return atualizado;
		});
	}

	const mImgDownload = path.match(/^\/imagens\/([^/]+)\/download\/([^/]+)$/);
	if (metodo === "get" && mImgDownload) {
		const [, cdEv, cdImg] = mImgDownload;
		config.adapter = async () => {
			await new Promise((r) => setTimeout(r, 120));
			const lista = imagensPorEvento.get(cdEv) ?? [];
			const im = lista.find((x) => x.id === cdImg);
			const b64 =
				im?.codigoBase64 ??
				"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
			const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
			const blob = new Blob([bin], { type: "image/png" });
			return { data: blob, status: 200, statusText: "OK", headers: {}, config };
		};
		return config;
	}

	const mImgList = path.match(/^\/imagens\/([^/]+)$/);
	if (metodo === "get" && mImgList) {
		const cdEv = mImgList[1];
		return aplicarRespostaMockada(config, () => {
			const lista = [...(imagensPorEvento.get(cdEv) ?? [])];
			return lista.sort((a, b) => a.posicao - b.posicao);
		});
	}

	const mImgOrdem = path.match(/^\/imagens\/([^/]+)\/ordem$/);
	if (metodo === "put" && mImgOrdem) {
		const cdEv = mImgOrdem[1];
		return aplicarRespostaMockada(config, () => {
			const body = (typeof config.data === "string" ? JSON.parse(config.data) : config.data) as { ids?: string[] };
			const ids = Array.isArray(body.ids) ? body.ids : [];
			const lista = [...(imagensPorEvento.get(cdEv) ?? [])];
			const map = new Map(lista.map((im) => [im.id, im]));
			const ordenados = ids.map((id) => map.get(id)).filter(Boolean) as EventoAnexoDto[];
			const faltando = lista.filter((im) => !ids.includes(im.id));
			const mesclada = [...ordenados, ...faltando].map((im, i) => ({ ...im, posicao: i }));
			imagensPorEvento.set(cdEv, mesclada);
			return {};
		});
	}

	const mImgDel = path.match(/^\/imagens\/([^/]+)\/([^/]+)$/);
	if (metodo === "delete" && mImgDel) {
		const [, cdEv, cdImg] = mImgDel;
		return aplicarRespostaMockada(config, () => {
			const lista = [...(imagensPorEvento.get(cdEv) ?? [])];
			if (lista.length <= 1) {
				throw { status: 400, message: "O evento deve manter ao menos uma imagem." };
			}
			const filtrada = lista.filter((x) => x.id !== cdImg);
			if (filtrada.length === lista.length) throw { status: 404, message: "Imagem não encontrada." };
			const finalLista = filtrada.map((im, i) => ({ ...im, posicao: i }));
			imagensPorEvento.set(cdEv, finalLista);
			return {};
		});
	}

	if (metodo === "put" && path.includes("/imagens/") && path.includes("/principal/")) {
		const m = path.match(/^\/imagens\/([^/]+)\/principal\/([^/]+)$/);
		if (!m) return;
		const [, cdEv, cdImg] = m;
		return aplicarRespostaMockada(config, () => {
			const lista = imagensPorEvento.get(cdEv) ?? [];
			const hit = lista.find((im) => im.id === cdImg);
			if (!hit) return {};
			const outros = lista.filter((im) => im.id !== cdImg);
			imagensPorEvento.set(
				cdEv,
				[hit, ...outros].map((im, i) => ({ ...im, posicao: i }))
			);
			return {};
		});
	}

	if (metodo === "post" && path === "/imagens/upload") {
		return aplicarRespostaMockada(config, async () => {
			await new Promise((r) => setTimeout(r, 150));
			const body =
				typeof config.data === "string"
					? (JSON.parse(config.data) as Record<string, unknown>)
					: (config.data as Record<string, unknown>);
			const idEv = String(body.IdEvento ?? body.idEvento ?? "");
			const codigobase64 = String(body.codigobase64 ?? body.codigoBase64 ?? "");
			const nome = String(body.nome ?? "arquivo");
			const posBody = Number(body.posicao);
			const idCliente = String(body.id ?? "").trim();
			if (!idEv) throw { status: 400, message: "IdEvento obrigatório." };
			if (!codigobase64) throw { status: 400, message: "codigobase64 obrigatório." };
			const lista = [...(imagensPorEvento.get(idEv) ?? [])];
			if (lista.length >= 5) {
				throw { status: 400, message: "Limite de 5 imagens por evento." };
			}
			const idImg = idCliente || novoId();
			const posicao = Number.isFinite(posBody) ? posBody : lista.length;
			const novo: EventoAnexoDto = {
				id: idImg,
				idEvento: idEv,
				nome,
				posicao,
				codigoBase64: codigobase64,
			};
			lista.push(novo);
			imagensPorEvento.set(idEv, lista);
			return {
				id: novo.id,
				IdEvento: novo.idEvento,
				nome: novo.nome,
				posicao: novo.posicao,
				codigobase64: novo.codigoBase64,
			};
		});
	}

	if (metodo === "post" && path === "/ingressos/validar-leitura") {
		return aplicarRespostaMockada(config, () => {
			const body = (typeof config.data === "string" ? JSON.parse(config.data) : config.data) as {
				payloadQr?: string;
			};
			const payloadQr = String(body.payloadQr ?? "").trim();
			if (!payloadQr) throw { status: 400, message: "payloadQr obrigatório." };
			const ing = encontrarIngressoPorTokenQr(ingressos, payloadQr);
			if (!ing) throw { status: 404, message: "QR não reconhecido." };
			const hit = encontrarReservaPorParticipanteId(participantes, ing.cdEventosReservas);
			if (!hit) throw { status: 404, message: "Reserva não encontrada." };
			const ev = obterEventoPorId(hit.reserva.cdEventosCadastro);
			if (!ev) throw { status: 404, message: "Evento não encontrado." };
			const { nome, documento } = dtoParticipanteParaNomeDoc(participantes, ing.cdEventosReservas);
			return montarResolverIngressoQr({
				ingresso: ing,
				participantes,
				evento: ev,
				quantidadeIngressosReserva: hit.reserva.quantidadeIngressos,
				nomeParticipante: nome,
				documentoParticipante: documento,
			});
		});
	}

	const mIngRet = path.match(/^\/ingressos\/([^/]+)\/retirada$/);
	if (metodo === "patch" && mIngRet) {
		const cdIngresso = mIngRet[1]!;
		return aplicarRespostaMockada(config, () => {
			const body = (typeof config.data === "string" ? JSON.parse(config.data) : config.data) as {
				cdLocalRetirada?: string;
				nomeOperadorRetirada?: string;
			};
			const ing = ingressos.find((x) => x.cdIngresso === cdIngresso);
			if (!ing) throw { status: 404, message: "Ingresso não encontrado." };
			const hit = encontrarReservaPorParticipanteId(participantes, ing.cdEventosReservas);
			if (!hit) throw { status: 404, message: "Reserva não encontrada." };
			const { reserva } = hit;
			const ev = obterEventoPorId(reserva.cdEventosCadastro);
			if (!ev) throw { status: 404, message: "Evento não encontrado." };
			if (reserva.statusReserva !== "ATIVA") {
				throw { status: 400, message: "Reserva não está ativa." };
			}
			if (ing.retirado) throw { status: 400, message: "Ingresso já retirado." };
			const pontos = ev.pontosDeTrocaCodigos ?? [];
			let cdLocal = body.cdLocalRetirada?.trim();
			if (!ev.semPontoDeTroca && pontos.length > 0) {
				if (pontos.length === 1) cdLocal = pontos[0]!.id;
				if (!cdLocal || !pontos.some((p) => p.id === cdLocal)) {
					throw { status: 400, message: "Ponto de troca inválido ou obrigatório." };
				}
				ing.cdLocalRetirada = cdLocal;
				ing.nomeLocalRetirada = nomeLocalPorId(pontos, cdLocal) ?? pontos.find((p) => p.id === cdLocal)?.nome;
			} else {
				ing.cdLocalRetirada = cdLocal;
				ing.nomeLocalRetirada = cdLocal ? nomeLocalPorId(pontos, cdLocal) : undefined;
			}
			ing.retirado = true;
			ing.dataRetirada = agoraIso();
			ing.nomeOperadorRetirada = body.nomeOperadorRetirada?.trim() || undefined;
			sincronizarReservaAPartirDosIngressos(participantes, ingressos, ing.cdEventosReservas, agoraIso);
			reconciliarContadoresEventos();
			return {};
		});
	}

	const mPartDoc = path.match(/^\/participantes\/documento\/([^/]+)$/);
	if (metodo === "get" && mPartDoc) {
		const docRaw = decodeURIComponent(mPartDoc[1] ?? "");
		return aplicarRespostaMockada(config, () => {
			const pessoa = encontrarPessoaPorDocumento(participantes, docRaw);
			if (!pessoa) return [];
			const out = [];
			for (const r of pessoa.reservas) {
				const ev = obterEventoPorId(r.cdEventosCadastro);
				if (!ev) continue;
				out.push(reservaParaHistoricoDto(r, ev));
			}
			return out.sort((a, b) => a.dataEvento.localeCompare(b.dataEvento));
		});
	}

	if (metodo === "get" && path.startsWith("/participantes/") && !path.endsWith("/presenca")) {
		const rest = path.slice("/participantes/".length);
		if (!rest || rest.includes("/")) return;
		const cdEv = rest;
		if (cdEv === "documento") return;
		return aplicarRespostaMockada(config, () => {
			const rows = [];
			for (const p of participantes) {
				for (const r of p.reservas) {
					if (r.cdEventosCadastro === cdEv) {
						rows.push(reservaParaParticipanteDto(p, r));
					}
				}
			}
			return rows.sort((a, b) => a.nomeParticipante.localeCompare(b.nomeParticipante));
		});
	}

	if (metodo === "patch" && path.endsWith("/presenca")) {
		const idPart = path.slice("/participantes/".length, -"/presenca".length);
		return aplicarRespostaMockada(config, () => {
			const body = (typeof config.data === "string" ? JSON.parse(config.data) : config.data) as {
				presencaConfirmada: boolean;
				cdLocalRetirada?: string;
				nomeOperadorRetirada?: string;
			};
			const hit = encontrarReservaPorParticipanteId(participantes, idPart);
			if (!hit) throw { status: 404, message: "Participante não encontrado." };
			const { reserva } = hit;
			const ev = obterEventoPorId(reserva.cdEventosCadastro);
			if (!ev) throw { status: 404, message: "Evento não encontrado." };
			if (reserva.statusReserva !== "ATIVA") {
				throw { status: 400, message: "Reserva não está ativa." };
			}
			if (body.presencaConfirmada) {
				const pontos = ev.pontosDeTrocaCodigos ?? [];
				let cdLocal = body.cdLocalRetirada?.trim();
				if (!ev.semPontoDeTroca && pontos.length > 0) {
					if (pontos.length === 1) cdLocal = pontos[0]!.id;
					if (!cdLocal || !pontos.some((p) => p.id === cdLocal)) {
						throw { status: 400, message: "Ponto de troca inválido ou obrigatório." };
					}
					reserva.cdLocalRetirada = cdLocal;
					reserva.nomeLocalRetirada = nomeLocalPorId(pontos, cdLocal) ?? pontos.find((p) => p.id === cdLocal)?.nome;
				} else {
					reserva.cdLocalRetirada = cdLocal;
					reserva.nomeLocalRetirada = cdLocal ? nomeLocalPorId(pontos, cdLocal) : undefined;
				}
				reserva.presencaConfirmada = true;
				reserva.dataRetirada = agoraIso();
				reserva.nomeOperadorRetirada = body.nomeOperadorRetirada?.trim() || undefined;
				marcarTodosIngressosRetiradosParaReserva(
					ingressos,
					reserva.cdEventosReservas,
					{
						cdLocalRetirada: reserva.cdLocalRetirada,
						nomeLocalRetirada: reserva.nomeLocalRetirada,
						nomeOperadorRetirada: reserva.nomeOperadorRetirada,
					},
					agoraIso
				);
			} else {
				reserva.presencaConfirmada = false;
				reserva.dataRetirada = undefined;
				reserva.cdLocalRetirada = undefined;
				reserva.nomeLocalRetirada = undefined;
				reserva.nomeOperadorRetirada = undefined;
				desmarcarIngressosAoDesfazerReserva(ingressos, reserva.cdEventosReservas);
			}
			return {};
		});
	}

	const mCancel = path.match(/^\/participantes\/([^/]+)\/cancelar$/);
	if (metodo === "patch" && mCancel) {
		const idPart = mCancel[1]!;
		return aplicarRespostaMockada(config, () => {
			const hit = encontrarReservaPorParticipanteId(participantes, idPart);
			if (!hit) throw { status: 404, message: "Participante não encontrado." };
			const { reserva } = hit;
			if (reserva.statusReserva === "CANCELADA") return {};
			reserva.statusReserva = "CANCELADA";
			reserva.dataCancelamento = agoraIso();
			reserva.presencaConfirmada = false;
			reserva.dataRetirada = undefined;
			reserva.cdLocalRetirada = undefined;
			reserva.nomeLocalRetirada = undefined;
			reserva.nomeOperadorRetirada = undefined;
			reconciliarContadoresEventos();
			return {};
		});
	}

	const mReativ = path.match(/^\/participantes\/([^/]+)\/reativar$/);
	if (metodo === "patch" && mReativ) {
		const idPart = mReativ[1]!;
		return aplicarRespostaMockada(config, () => {
			const hit = encontrarReservaPorParticipanteId(participantes, idPart);
			if (!hit) throw { status: 404, message: "Participante não encontrado." };
			const { reserva } = hit;
			if (reserva.statusReserva === "ATIVA") throw { status: 400, message: "Reserva já está ativa." };
			const ev = obterEventoPorId(reserva.cdEventosCadastro);
			if (!ev) throw { status: 404, message: "Evento não encontrado." };
			const q = reserva.quantidadeIngressos;
			const limiteCpf = Math.max(1, Math.floor(Number(ev.ingressoPorCpf ?? 1)));
			if (q > limiteCpf) throw { status: 400, message: "Quantidade acima do limite por CPF." };
			const somaEvt = somaIngressosAtivosNoEvento(participantes, ev.cdEventosCadastro);
			if (somaEvt + q > ev.quantidadeIngressosTotal) {
				throw { status: 400, message: "Não há vagas suficientes no evento." };
			}
			const ordem = reserva.cdLoteIngresso != null ? Number.parseInt(reserva.cdLoteIngresso, 10) : 0;
			const lote = lotePorOrdemString(ev, String(ordem));
			if (lote) {
				const occ = somaIngressosReservadosNoLote(participantes, ev.cdEventosCadastro, lote.ordem);
				if (occ + q > lote.quantidade) throw { status: 400, message: "Não há vagas suficientes no lote." };
			}
			reserva.statusReserva = "ATIVA";
			reserva.dataCancelamento = undefined;
			reconciliarContadoresEventos();
			return {};
		});
	}

	const mQtd = path.match(/^\/participantes\/([^/]+)\/quantidade$/);
	if (metodo === "patch" && mQtd) {
		const idPart = mQtd[1]!;
		return aplicarRespostaMockada(config, () => {
			const body = (typeof config.data === "string" ? JSON.parse(config.data) : config.data) as {
				quantidadeIngressos?: number;
			};
			const n = Math.floor(Number(body.quantidadeIngressos));
			if (!Number.isFinite(n) || n < 1) throw { status: 400, message: "quantidadeIngressos inválido." };
			const hit = encontrarReservaPorParticipanteId(participantes, idPart);
			if (!hit) throw { status: 404, message: "Participante não encontrado." };
			const { reserva } = hit;
			if (reserva.statusReserva !== "ATIVA") throw { status: 400, message: "Reserva não está ativa." };
			const ev = obterEventoPorId(reserva.cdEventosCadastro);
			if (!ev) throw { status: 404, message: "Evento não encontrado." };
			const limiteCpf = Math.max(1, Math.floor(Number(ev.ingressoPorCpf ?? 1)));
			if (n > limiteCpf) throw { status: 400, message: "Quantidade acima do limite por CPF." };
			if (reserva.presencaConfirmada && n < reserva.quantidadeIngressos) {
				throw { status: 400, message: "Não é possível reduzir após retirada confirmada." };
			}
			const oldQ = reserva.quantidadeIngressos;
			const delta = n - oldQ;
			if (delta === 0) return {};
			const somaEvtExcl = somaIngressosAtivosNoEvento(participantes, ev.cdEventosCadastro, reserva.cdEventosReservas);
			if (somaEvtExcl + n > ev.quantidadeIngressosTotal) {
				throw { status: 400, message: "Não há vagas suficientes no evento." };
			}
			const ordem = reserva.cdLoteIngresso != null ? Number.parseInt(reserva.cdLoteIngresso, 10) : 0;
			const lote = lotePorOrdemString(ev, Number.isFinite(ordem) ? String(ordem) : "0");
			if (lote) {
				const occExcl = somaIngressosReservadosNoLote(
					participantes,
					ev.cdEventosCadastro,
					lote.ordem,
					reserva.cdEventosReservas
				);
				if (occExcl + n > lote.quantidade) throw { status: 400, message: "Não há vagas suficientes no lote." };
			}
			reserva.quantidadeIngressos = n;
			reconciliarContadoresEventos();
			return {};
		});
	}

	if (metodo === "get" && path === "/relatorios") {
		return aplicarRespostaMockada(config, () => {
			const p = (config.params ?? {}) as { dataInicio?: string; dataFim?: string };
			const ini = p.dataInicio ?? "1970-01-01";
			const fim = p.dataFim ?? "2999-12-31";
			return relatoriosGerados.filter((r) => {
				const pi = isoSóData(r.periodoInicio);
				const pf = isoSóData(r.periodoFim);
				return pi <= fim && pf >= ini;
			});
		});
	}

	const mRelDown = path.match(/^\/relatorios\/([^/]+)\/download$/);
	if (metodo === "get" && mRelDown) {
		const rid = mRelDown[1];
		config.adapter = async () => {
			await new Promise((r) => setTimeout(r, 100));
			const rel = relatoriosGerados.find((x) => x.id === rid);
			const titulo = rel?.titulo ?? "relatorio";
			const blob = blobTexto([
				`Relatório: ${titulo}`,
				`Gerado em: ${rel?.dataGeracao ?? ""}`,
				`Período: ${rel?.periodoInicio ?? ""} a ${rel?.periodoFim ?? ""}`,
				"",
				"... conteúdo simulado (mock) ...",
			]);
			return { data: blob, status: 200, statusText: "OK", headers: {}, config };
		};
		return config;
	}

	if (metodo === "get" && path === "/relatorios/excel") {
		config.adapter = async () => {
			await new Promise((r) => setTimeout(r, 120));
			const csv = "evento;vagas_total;reservados\n" + eventos.map((e) => `${e.nomeEvento};${e.quantidadeIngressosTotal};${e.quantidadeIngressosReservados}`).join("\n");
			const blob = new Blob([csv], { type: "application/vnd.ms-excel;charset=utf-8" });
			return { data: blob, status: 200, statusText: "OK", headers: {}, config };
		};
		return config;
	}
}

export function registrarMocksApiEventos(...clientes: AxiosInstance[]): void {
	const lista = clientes.length > 0 ? clientes : [api];
	for (const cliente of lista) {
		cliente.interceptors.request.use((config: InternalAxiosRequestConfig) => {
			return tratar(config) ?? config;
		});
	}
}
