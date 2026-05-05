import { RelatoriosApi } from "@/features/eventos/api/eventos-api";
import type { RelatorioGeradoDto } from "@/features/eventos/types";
import { toast } from "sonner";

function nomeArquivoSeguro(titulo: string, extensao: string) {
	const base = titulo.replace(/[/\\?%*:|"<>]/g, "-").trim() || "relatorio";
	return `${base}.${extensao}`;
}

function dispararDownloadBlob(blob: Blob, nomeArquivo: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = nomeArquivo;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

/**
 * Download a partir do endpoint atual (blob). Quando o back passar a expor Base64, prefira
 * {@link baixarRelatorioDeBase64} ou combine com {@link blobAPartirDeBase64}.
 */
export async function baixarRelatorioGerado(r: RelatorioGeradoDto): Promise<void> {
	const blob = await RelatoriosApi.baixarRelatorio(r.id);
	dispararDownloadBlob(blob, nomeArquivoSeguro(r.titulo, "txt"));
	toast.success("Download iniciado.");
}

/** Converte Base64 (sem prefixo `data:`) em `Blob` para download ou gravação. */
export function blobAPartirDeBase64(dataBase64: string, tipoMime = "application/octet-stream"): Blob {
	const bin = atob(dataBase64);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return new Blob([bytes], { type: tipoMime });
}

/**
 * Reservado para quando o backend retornar o ficheiro em Base64 (ex.: JSON com `conteudoBase64`).
 * Não utilizado pelo mock atual.
 */
export async function baixarRelatorioDeBase64(
	titulo: string,
	dataBase64: string,
	opcoes?: { tipoMime?: string; extensao?: string }
): Promise<void> {
	const tipo = opcoes?.tipoMime ?? "application/octet-stream";
	const blob = blobAPartirDeBase64(dataBase64, tipo);
	const ext = opcoes?.extensao ?? "bin";
	dispararDownloadBlob(blob, nomeArquivoSeguro(titulo, ext));
	toast.success("Download iniciado.");
}

/** Exportação agregada do período (`GET /relatorios/excel`). Quando o back passar a Base64, trocar implementação aqui. */
export async function baixarExportacaoExcelRelatorios(params: { dataInicio: string; dataFim: string }): Promise<void> {
	const blob = await RelatoriosApi.exportarExcel(params);
	dispararDownloadBlob(blob, `relatorios-eventos-${params.dataInicio}-${params.dataFim}.xls`);
	toast.success("Download iniciado.");
}
