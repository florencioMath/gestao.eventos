type OpcoesDownload = {
	nomeArquivo: string;
	base64: string;
	tipoMime?: string;
};

/**
 * Dispara o download de um arquivo a partir de uma string base64 (sem prefixo data:).
 */
export function baixarArquivoBase64({ nomeArquivo, base64, tipoMime }: OpcoesDownload): void {
	const mime = tipoMime ?? 'application/octet-stream';
	const binario = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
	const blob = new Blob([binario], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = nomeArquivo;
	a.rel = 'noopener';
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
