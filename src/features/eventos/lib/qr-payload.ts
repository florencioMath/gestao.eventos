/**
 * Extrai o token/payload do QR a partir do texto lido no scanner.
 * Suporta texto puro ou URL com query (`t`, `token`, `qr`) ou último segmento do path.
 */
export function extrairPayloadQr(raw: string): string {
	const s = raw.trim();
	if (!s) return "";
	try {
		const u = new URL(s);
		const q = u.searchParams;
		const fromQuery = q.get("t") ?? q.get("token") ?? q.get("qr") ?? q.get("payload");
		if (fromQuery?.trim()) return fromQuery.trim();
		const parts = u.pathname.split("/").filter(Boolean);
		const last = parts[parts.length - 1];
		if (last?.trim()) return last.trim();
	} catch {
		/* não é URL absoluta — tentar path relativo */
	}
	const semPrefixo = s.replace(/^https?:\/\//i, "");
	if (semPrefixo !== s) {
		try {
			const u2 = new URL(`https://${semPrefixo}`);
			const q2 = u2.searchParams;
			const fq = q2.get("t") ?? q2.get("token") ?? q2.get("qr");
			if (fq?.trim()) return fq.trim();
		} catch {
			/* ignora */
		}
	}
	return s;
}
