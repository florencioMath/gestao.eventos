/**
 * Converte erros de getUserMedia / ZXing em mensagens legíveis em português.
 * O browser costuma devolver DOMException em inglês (ex.: "Requested device not found").
 */
export function mensagemErroCameraParaUtilizador(erro: unknown): string {
	if (erro instanceof DOMException) {
		switch (erro.name) {
			case "NotFoundError":
			case "DevicesNotFoundError":
				return "Câmera não encontrada, tente novamente ou use o Código manual.";
			case "NotAllowedError":
			case "PermissionDeniedError":
				return "Permissão para usar a câmera foi negada. Permita o acesso nas definições do navegador ou use «Código manual».";
			case "NotReadableError":
			case "TrackStartError":
				return "A câmera está a ser usada por outra aplicação ou não está disponível. Tente novamente ou use «Código manual».";
			case "OverconstrainedError":
				return "A câmera não cumpre os requisitos pedidos. Tente outro dispositivo ou use «Código manual».";
			case "AbortError":
				return "A abertura da câmera foi cancelada.";
			case "SecurityError":
				return "O acesso à câmera exige uma ligação segura (HTTPS) ou localhost.";
			default:
				break;
		}
	}

	const msg = erro instanceof Error ? erro.message : String(erro);
	const lower = msg.toLowerCase();

	if (
		lower.includes("requested device not found") ||
		lower.includes("device not found") ||
		lower.includes("no camera") ||
		lower.includes("notfounderror")
	) {
		return "Câmera não encontrada, tente novamente ou use o Código manual.";
	}
	if (lower.includes("permission denied") || lower.includes("notallowederror")) {
		return "Permissão para usar a câmera foi negada. Permita o acesso nas definições do navegador ou use «Código manual».";
	}
	if (lower.includes("could not start video source") || lower.includes("notreadableerror")) {
		return "A câmera está a ser usada por outra aplicação ou não está disponível. Tente novamente ou use «Código manual».";
	}

	return "Não foi possível aceder à câmera ou ler o código. Use HTTPS ou localhost e, se o problema continuar, utilize «Código manual».";
}
