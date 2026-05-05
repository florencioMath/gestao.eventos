import { eventoFormParaPayloadSpring } from "@/features/eventos/lib/datas-evento";
import { arquivoParaCodigoBase64 } from "@/features/eventos/lib/arquivo-base64";
import { normalizarEventoAnexoApi } from "@/features/eventos/lib/normalizar-imagem-api";
import { api, apiSilent } from "@/lib/api";
import { eventoAnexoDtoParaImagemDto } from "@/features/eventos/lib/imagem-evento";
import type {
	EventoAnexoDto,
	EventoCadastroDto,
	EventoDominioOpcaoDto,
	EventoFormValores,
	EventoImagemDto,
	ParticipanteDto,
	ParticipanteHistoricoEventoDto,
	RelatorioGeradoDto,
} from "@/features/eventos/types";

/**
 * Corpo JSON para o Spring: inclui `exibirParaCidadao`, `pontosDeTrocaCodigos` (objetos com id, nome, endereço), `dataInicioExibicaoApp`,
 * `dataInicioExibicaoPortal`, `dataHoraInicioVendas` (ISO local) e `eventoEmDestaque`.
 */
function serializarEventoParaSpring(payload: EventoFormValores) {
	return eventoFormParaPayloadSpring(payload);
}

/** Payload de gravação alinhado ao exemplo do back-end (`IdEvento`, `codigobase64`, …). */
export function anexoParaCorpoSalvar(p: {
	idEvento: string;
	nome: string;
	posicao: number;
	codigoBase64: string;
	id?: string;
}): Record<string, string | number> {
	return {
		codigobase64: p.codigoBase64,
		posicao: p.posicao,
		nome: p.nome,
		id: p.id ?? "",
		IdEvento: p.idEvento,
	};
}

export class EventosApi {
	static async listar(): Promise<EventoCadastroDto[]> {
		const { data } = await api.get<EventoCadastroDto[]>("/eventos");
		return data;
	}

	/** Domínio: categorias disponíveis para classificação do evento. */
	static async listarDominioCategorias(): Promise<EventoDominioOpcaoDto[]> {
		const { data } = await api.get<EventoDominioOpcaoDto[]>("/eventos/dominio/categorias");
		return data;
	}

	/** Domínio: locais/espaços cadastrados para realização do evento. */
	static async listarDominioLocais(): Promise<EventoDominioOpcaoDto[]> {
		const { data } = await api.get<EventoDominioOpcaoDto[]>("/eventos/dominio/locais");
		return data;
	}

	static async obter(id: string): Promise<EventoCadastroDto> {
		const { data } = await api.get<EventoCadastroDto>(`/eventos/${id}`);
		return data;
	}

	static async criar(payload: EventoFormValores): Promise<EventoCadastroDto> {
		const { data } = await api.post<EventoCadastroDto>("/eventos", serializarEventoParaSpring(payload));
		return data;
	}

	static async atualizar(id: string, payload: EventoFormValores): Promise<EventoCadastroDto> {
		const { data } = await api.put<EventoCadastroDto>(`/eventos/${id}`, serializarEventoParaSpring(payload));
		return data;
	}
}

export class ImagensApi {
	/**
	 * Lista anexos como no mock (`EventoAnexoDto`: `id`, `idEvento`, `nome`, `posicao`, `codigoBase64`).
	 * Preferir para logs ou integrações que não precisam de {@link EventoImagemDto}.
	 */
	static async listarAnexosPorEvento(idEvento: string): Promise<EventoAnexoDto[]> {
		const { data } = await apiSilent.get<unknown>(`/imagens/${idEvento}`);
		const rows = Array.isArray(data) ? data : [];
		return rows
			.map((raw) => {
				const r = raw as Record<string, unknown>;
				const n = normalizarEventoAnexoApi(r);
				return { ...n, idEvento: n.idEvento || idEvento };
			})
			.sort((a, b) => a.posicao - b.posicao);
	}

	static async listarPorEvento(idEvento: string): Promise<EventoImagemDto[]> {
		const { data } = await apiSilent.get<Record<string, unknown>[]>(`/imagens/${idEvento}`);
		const itens = (Array.isArray(data) ? data : []).map((raw) => {
			const n = normalizarEventoAnexoApi(raw);
			const anexo = { ...n, idEvento: n.idEvento || idEvento };
			const principalApi = Boolean(raw.imagemPrincipal);
			return { anexo, principalApi };
		});
		itens.sort((x, y) => x.anexo.posicao - y.anexo.posicao);
		const algumPrincipal = itens.some((x) => x.principalApi);
		return itens.map((x, i) =>
			eventoAnexoDtoParaImagemDto(x.anexo, {
				imagemPrincipal: x.principalApi || (!algumPrincipal && i === 0),
			})
		);
	}

	/** Download individual (quando o back-end expõe blob por id). */
	static async baixarArquivo(idEvento: string, idAnexo: string): Promise<Blob> {
		const { data } = await apiSilent.get<Blob>(
			`/imagens/${idEvento}/download/${idAnexo}`,
			{ responseType: "blob" }
		);
		return data;
	}

	/** Persiste anexo com Base64 e metadados (JSON). */
	static async salvarAnexo(p: {
		idEvento: string;
		nome: string;
		posicao: number;
		codigoBase64: string;
		id?: string;
	}): Promise<EventoAnexoDto> {
		const body = anexoParaCorpoSalvar(p);
		const { data } = await apiSilent.post<Record<string, unknown>>("/imagens/upload", body);
		return normalizarEventoAnexoApi(data);
	}

	static async salvarAnexoDeArquivo(idEvento: string, arquivo: File, posicao: number): Promise<EventoAnexoDto> {
		const codigoBase64 = await arquivoParaCodigoBase64(arquivo);
		return ImagensApi.salvarAnexo({
			idEvento,
			nome: arquivo.name,
			posicao,
			codigoBase64,
		});
	}

	/**
	 * Envia ficheiro de imagem (fluxos em lote / pós-criação).
	 * Opcionalmente marca como principal no servidor quando `definirComoPrincipal` é verdadeiro.
	 */
	static async upload(
		idEvento: string,
		arquivo: File,
		posicao: number,
		definirComoPrincipal: boolean
	): Promise<EventoImagemDto> {
		const anexo = await ImagensApi.salvarAnexoDeArquivo(idEvento, arquivo, posicao);
		if (definirComoPrincipal && anexo.id) {
			await apiSilent.put(`/imagens/${idEvento}/principal/${anexo.id}`, {});
		}
		return eventoAnexoDtoParaImagemDto(anexo, {
			imagemPrincipal: definirComoPrincipal || posicao === 0,
		});
	}

	static async excluir(idEvento: string, idAnexo: string): Promise<void> {
		await apiSilent.delete(`/imagens/${idEvento}/${idAnexo}`);
	}

	/** Persiste a ordem (`ids` na sequência desejada, primeiro = capa sugerida). */
	static async reordenar(idEvento: string, idsNaOrdem: string[]): Promise<void> {
		await apiSilent.put(`/imagens/${idEvento}/ordem`, { ids: idsNaOrdem });
	}
}

export class ParticipantesApi {
	static async listarPorEvento(cdEventosCadastro: string): Promise<ParticipanteDto[]> {
		const { data } = await api.get<ParticipanteDto[]>(`/participantes/${cdEventosCadastro}`);
		return data;
	}

	/** Histórico de inscrições do CPF (todos os eventos). */
	static async listarPorDocumento(documento: string): Promise<ParticipanteHistoricoEventoDto[]> {
		const enc = encodeURIComponent(String(documento).replace(/\D/g, ""));
		const { data } = await api.get<ParticipanteHistoricoEventoDto[]>(`/participantes/documento/${enc}`);
		return data;
	}

	static async confirmarRetirada(
		cdEventosParticipantes: string,
		p: { cdLocalRetirada?: string; nomeOperadorRetirada?: string }
	): Promise<void> {
		await api.patch(`/participantes/${cdEventosParticipantes}/presenca`, {
			presencaConfirmada: true,
			cdLocalRetirada: p.cdLocalRetirada,
			nomeOperadorRetirada: p.nomeOperadorRetirada,
		});
	}

	static async desfazerRetirada(cdEventosParticipantes: string): Promise<void> {
		await api.patch(`/participantes/${cdEventosParticipantes}/presenca`, { presencaConfirmada: false });
	}

	static async cancelar(cdEventosParticipantes: string): Promise<void> {
		await api.patch(`/participantes/${cdEventosParticipantes}/cancelar`, {});
	}

	static async reativar(cdEventosParticipantes: string): Promise<void> {
		await api.patch(`/participantes/${cdEventosParticipantes}/reativar`, {});
	}

	static async atualizarQuantidade(cdEventosParticipantes: string, quantidadeIngressos: number): Promise<void> {
		await api.patch(`/participantes/${cdEventosParticipantes}/quantidade`, { quantidadeIngressos });
	}

	/** @deprecated Preferir {@link confirmarRetirada} / {@link desfazerRetirada}. */
	static async atualizarPresenca(cdEventosParticipantes: string, presencaConfirmada: boolean): Promise<void> {
		await api.patch(`/participantes/${cdEventosParticipantes}/presenca`, { presencaConfirmada });
	}
}

export class RelatoriosApi {
	/** Lista relatórios cujo período (início–fim) intersecta `[dataInicio, dataFim]` (YYYY-MM-DD). */
	static async listarGerados(params: { dataInicio: string; dataFim: string }): Promise<RelatorioGeradoDto[]> {
		const { data } = await api.get<RelatorioGeradoDto[]>("/relatorios", { params });
		return data;
	}

	static async baixarRelatorio(id: string): Promise<Blob> {
		const { data } = await apiSilent.get<Blob>(`/relatorios/${id}/download`, { responseType: "blob" });
		return data;
	}

	static async exportarExcel(params?: { dataInicio?: string; dataFim?: string }): Promise<Blob> {
		const { data } = await api.get<Blob>("/relatorios/excel", {
			params,
			responseType: "blob",
		});
		return data;
	}
}
