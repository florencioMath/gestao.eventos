import type { IngressoQrResolverDto, ValidarLeituraQrPayload } from "@/features/eventos/types";
import { extrairPayloadQr } from "@/features/eventos/lib/qr-payload";
import { api } from "@/lib/api";

export class IngressosApi {
	/**
	 * Resolve o conteúdo lido do QR para dados do ingresso e flags de retirada.
	 * `payloadBruto` pode ser URL ou token (normalização no cliente e no servidor).
	 */
	static async validarLeitura(payloadBruto: string): Promise<IngressoQrResolverDto> {
		const payloadQr = extrairPayloadQr(payloadBruto);
		const body: ValidarLeituraQrPayload = { payloadQr };
		const { data } = await api.post<IngressoQrResolverDto>("/ingressos/validar-leitura", body);
		return data;
	}

	static async confirmarRetirada(
		cdIngresso: string,
		p: { cdLocalRetirada?: string; nomeOperadorRetirada?: string }
	): Promise<void> {
		await api.patch(`/ingressos/${cdIngresso}/retirada`, {
			cdLocalRetirada: p.cdLocalRetirada,
			nomeOperadorRetirada: p.nomeOperadorRetirada,
		});
	}
}
