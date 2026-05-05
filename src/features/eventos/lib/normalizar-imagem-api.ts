import type { EventoAnexoDto, EventoImagemDto } from "@/features/eventos/types";

/** Normaliza JSON de anexo/imagem (`/imagens/…`, upload) para {@link EventoAnexoDto}. */
export function normalizarEventoAnexoApi(raw: Record<string, unknown>): EventoAnexoDto {
	const posRaw = raw.posicao ?? raw.ordemExibicao;
	const posicao = typeof posRaw === "number" && Number.isFinite(posRaw) ? posRaw : Number(posRaw ?? 0) || 0;
	return {
		id: String(raw.id ?? raw.cdEventosImagens ?? ""),
		idEvento: String(raw.idEvento ?? raw.IdEvento ?? raw.cdEventosCadastro ?? ""),
		nome: String(raw.nome ?? raw.nomeArquivo ?? "imagem"),
		posicao,
		codigoBase64: String(raw.codigoBase64 ?? raw.codigobase64 ?? raw.conteudoBase64 ?? ""),
	};
}

/**
 * Normaliza respostas da API que podem usar `id`, `posicao` e `conteudoBase64`
 * em vez de `cdEventosImagens`, `ordemExibicao` e `conteudoBase64Preview`.
 */
export function normalizarEventoImagemApi(raw: Record<string, unknown>): EventoImagemDto {
	const cdEventosImagens = String(raw.cdEventosImagens ?? raw.id ?? "");
	const cdEventosCadastro = String(raw.cdEventosCadastro ?? "");
	const nomeArquivo = String(raw.nomeArquivo ?? "");
	const caminhoArquivo = String(raw.caminhoArquivo ?? "");
	const imagemPrincipal = Boolean(raw.imagemPrincipal);
	const ordemRaw = raw.ordemExibicao ?? raw.posicao;
	const ordemExibicao = typeof ordemRaw === "number" && Number.isFinite(ordemRaw) ? ordemRaw : Number(ordemRaw ?? 0) || 0;
	const ativo = raw.ativo !== undefined ? Boolean(raw.ativo) : true;
	const dataCriacao = String(raw.dataCriacao ?? new Date().toISOString());
	const conteudoBase64Preview =
		(typeof raw.conteudoBase64Preview === "string" && raw.conteudoBase64Preview) ||
		(typeof raw.conteudoBase64 === "string" ? raw.conteudoBase64 : undefined);
	const conteudoBase64 = typeof raw.conteudoBase64 === "string" ? raw.conteudoBase64 : undefined;
	const posicao = typeof raw.posicao === "number" ? raw.posicao : ordemExibicao;
	const id = typeof raw.id === "string" ? raw.id : undefined;

	return {
		cdEventosImagens,
		cdEventosCadastro,
		nomeArquivo,
		caminhoArquivo,
		imagemPrincipal,
		ordemExibicao,
		ativo,
		dataCriacao,
		conteudoBase64Preview,
		conteudoBase64,
		posicao,
		id,
	};
}

/** Contrato simples (envio/recebimento) alinhado ao back-end. */
export type EventoImagemContratoSimples = {
	id: string;
	nomeArquivo: string;
	conteudoBase64: string;
	posicao: number;
};

export function imagemDtoParaContratoSimples(im: EventoImagemDto, posicao: number): EventoImagemContratoSimples {
	const conteudoBase64 = im.conteudoBase64 ?? im.conteudoBase64Preview ?? "";
	return {
		id: im.cdEventosImagens,
		nomeArquivo: im.nomeArquivo,
		conteudoBase64,
		posicao,
	};
}
