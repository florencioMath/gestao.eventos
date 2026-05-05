import type { LocalTrocaDto, PontoTrocaEventoDto } from "@/features/eventos/types";

export function localTrocaDtoParaPontoTrocaEvento(l: LocalTrocaDto): PontoTrocaEventoDto {
	return { id: l.cdLocalTroca, nome: l.nome, endereco: l.endereco };
}

/**
 * Converte resposta de API (`PontoTrocaEventoDto[]` ou legado `string[]` com códigos)
 * para o formato do formulário.
 */
export function normalizarPontosDeTrocaDoDto(
	raw: unknown,
	locaisFallback: LocalTrocaDto[] = []
): PontoTrocaEventoDto[] {
	if (!Array.isArray(raw)) return [];
	const out: PontoTrocaEventoDto[] = [];
	for (const x of raw) {
		if (typeof x === "string") {
			const id = x.trim();
			if (!id) continue;
			const l = locaisFallback.find((c) => c.cdLocalTroca === id);
			out.push({
				id,
				nome: l?.nome?.trim() || id,
				endereco: l?.endereco?.trim() || "",
			});
			continue;
		}
		if (x && typeof x === "object") {
			const o = x as Record<string, unknown>;
			const id = String(o.id ?? o.cdLocalTroca ?? "").trim();
			if (!id) continue;
			const nomeIn = String(o.nome ?? "").trim();
			const endIn = String(o.endereco ?? "").trim();
			const l = locaisFallback.find((c) => c.cdLocalTroca === id);
			out.push({
				id,
				nome: nomeIn || l?.nome?.trim() || id,
				endereco: endIn || l?.endereco?.trim() || "",
			});
		}
	}
	return out;
}

/** Texto curto para listagens e cartões (usa `nome` gravado no evento; opcionalmente o catálogo de locais). */
export function formatarPontosDeTrocaResumo(
	pontos: PontoTrocaEventoDto[] | undefined,
	semPontoDeTroca: boolean | undefined,
	locaisFallback: LocalTrocaDto[]
): string {
	if (semPontoDeTroca) return "Sem ponto de troca";
	const items = pontos ?? [];
	if (items.length === 0) return "—";
	const nomes = items.map((p) => {
		const n = p.nome?.trim();
		if (n) return n;
		const id = p.id?.trim();
		return locaisFallback.find((l) => l.cdLocalTroca === id)?.nome?.trim() ?? id ?? "";
	}).filter(Boolean);
	if (nomes.length === items.length) return nomes.join(" · ");
	if (nomes.length > 0) return `${nomes.join(" · ")} (+${items.length - nomes.length})`;
	const ids = items.map((p) => p.id?.trim()).filter(Boolean);
	return ids.length > 0 ? ids.join(" · ") : "—";
}
