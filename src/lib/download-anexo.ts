import { baixarArquivoBase64 } from '@/lib/download-arquivo-base64';

/** Representação genérica de anexo para listagem, visualização ou download. */
export type ArquivoAnexo = {
	id: string;
	nome: string;
	tipoMime?: string;
	tamanhoBytes?: number;
	/** Base64 puro, sem prefixo `data:...;base64,`. */
	conteudoBase64?: string;
	/** URL absoluta ou relativa para abrir/baixar. */
	url?: string;
};

/** @deprecated Use ArquivoAnexo */
export type AnexoFile = ArquivoAnexo;

export function criarUrlParaVisualizacao(anexo: ArquivoAnexo): string | null {
	if (anexo.url) return anexo.url;
	if (anexo.conteudoBase64) {
		const mime = anexo.tipoMime ?? 'application/octet-stream';
		return `data:${mime};base64,${anexo.conteudoBase64}`;
	}
	return null;
}

/** @deprecated Use criarUrlParaVisualizacao */
export const createAnexoViewUrl = criarUrlParaVisualizacao;

export async function baixarAnexo(anexo: ArquivoAnexo): Promise<void> {
	if (anexo.conteudoBase64) {
		baixarArquivoBase64({
			nomeArquivo: anexo.nome,
			base64: anexo.conteudoBase64,
			tipoMime: anexo.tipoMime,
		});
		return;
	}
	if (anexo.url) {
		const resposta = await fetch(anexo.url);
		if (!resposta.ok) throw new Error('Falha ao baixar o arquivo.');
		const blob = await resposta.blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = anexo.nome;
		a.rel = 'noopener';
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
		return;
	}
	throw new Error('Anexo sem conteúdo para download.');
}

/** @deprecated Use baixarAnexo */
export const downloadAnexo = baixarAnexo;
