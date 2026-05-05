import DOMPurify from "dompurify";

/**
 * Sanitiza HTML da descrição de evento antes de `dangerouslySetInnerHTML`.
 * Mantém estilos inline seguros (TipTap: cor, tamanho) e ligações com `rel`.
 */
export function sanitizeDescricaoEventoHtml(html: string): string {
	if (!html?.trim()) return "";
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [
			"p",
			"br",
			"strong",
			"b",
			"em",
			"i",
			"u",
			"s",
			"strike",
			"span",
			"a",
			"ul",
			"ol",
			"li",
			"h1",
			"h2",
			"h3",
			"h4",
			"blockquote",
			"hr",
			"div",
		],
		ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
		ADD_ATTR: ["target"],
	});
}
