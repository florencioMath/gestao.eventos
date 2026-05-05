import type { EventoAnexoDto, EventoImagemDto } from "@/features/eventos/types";

/** Converte anexo da API para o DTO usado na listagem e edição de imagens. */
/** Inverso de {@link eventoAnexoDtoParaImagemDto} (ex.: log alinhado ao mock `evento` + `anexos`). */
export function imagemDtoParaAnexoDto(im: EventoImagemDto): EventoAnexoDto {
	const id = im.cdEventosImagens || im.id || "";
	const codigoBase64 = im.conteudoBase64Preview ?? im.conteudoBase64 ?? "";
	return {
		id,
		idEvento: im.cdEventosCadastro,
		nome: im.nomeArquivo,
		posicao: im.posicao,
		codigoBase64,
	};
}

export function eventoAnexoDtoParaImagemDto(
	a: EventoAnexoDto,
	opcoes?: { imagemPrincipal?: boolean }
): EventoImagemDto {
	const principal = opcoes?.imagemPrincipal ?? a.posicao === 0;
	return {
		cdEventosImagens: a.id,
		cdEventosCadastro: a.idEvento,
		nomeArquivo: a.nome,
		caminhoArquivo: "",
		imagemPrincipal: principal,
		ordemExibicao: a.posicao,
		posicao: a.posicao,
		ativo: true,
		dataCriacao: new Date().toISOString(),
		conteudoBase64Preview: a.codigoBase64 || undefined,
		conteudoBase64: a.codigoBase64 || undefined,
		id: a.id,
	};
}

export function tipoMimeImagemPorNome(nome: string): string {
	const n = nome.toLowerCase();
	if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
	if (n.endsWith(".webp")) return "image/webp";
	if (n.endsWith(".gif")) return "image/gif";
	return "image/png";
}

export function imagemDtoParaDataUrl(im: EventoImagemDto | null | undefined): string | null {
	if (!im) return null;
	const b64 = im.conteudoBase64Preview ?? im.conteudoBase64;
	if (!b64) return null;
	const mime = tipoMimeImagemPorNome(im.nomeArquivo);
	return `data:${mime};base64,${b64}`;
}

/** Primeira imagem principal, ou a primeira da lista, para capa em cartões. */
export function escolherImagemCapa(imagens: EventoImagemDto[]): EventoImagemDto | null {
	if (imagens.length === 0) return null;
	const ordenadas = [...imagens].sort((a, b) => a.ordemExibicao - b.ordemExibicao);
	return ordenadas.find((i) => i.imagemPrincipal) ?? ordenadas[0] ?? null;
}
