/** Verifica se o HTML da descrição tem texto visível (não só tags ou espaços). */
export function descricaoHtmlNaoVazia(html: string | undefined): boolean {
	if (!html?.trim()) return false;
	if (typeof document === "undefined") {
		return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").trim().length > 0;
	}
	const doc = new DOMParser().parseFromString(html, "text/html");
	return (doc.body.textContent ?? "").trim().length > 0;
}
