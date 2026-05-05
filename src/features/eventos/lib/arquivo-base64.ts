/** Lê um `File` e devolve apenas o payload Base64 (sem prefixo `data:…;base64,`). */
export function arquivoParaCodigoBase64(arquivo: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const r = reader.result;
			if (typeof r !== "string") {
				reject(new Error("Leitura do ficheiro falhou."));
				return;
			}
			const i = r.indexOf("base64,");
			resolve(i >= 0 ? r.slice(i + "base64,".length) : r);
		};
		reader.onerror = () => reject(reader.error ?? new Error("Leitura do ficheiro falhou."));
		reader.readAsDataURL(arquivo);
	});
}
