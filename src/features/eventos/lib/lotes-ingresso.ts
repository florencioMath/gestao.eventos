import type {
	EventoLoteIngressoForm,
	EventoLoteIngressoPayload,
	ModoLiberacaoLoteIngresso,
} from "@/features/eventos/types";

function novoIdLote(): string {
	return globalThis.crypto?.randomUUID?.() ?? `lote-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function criarLoteIngressoVazio(ordem: number, parcial?: Partial<EventoLoteIngressoForm>): EventoLoteIngressoForm {
	return {
		id: novoIdLote(),
		rotulo: parcial?.rotulo ?? (ordem === 0 ? "1.º lote" : `${ordem + 1}.º lote`),
		quantidade: parcial?.quantidade ?? 0,
		ordem,
		modoLiberacao: parcial?.modoLiberacao ?? (ordem === 0 ? "IMEDIATA" : "APOS_ESGOTAR_ANTERIOR"),
		dataLiberacaoVenda: parcial?.dataLiberacaoVenda ?? "",
		horaLiberacaoVenda: parcial?.horaLiberacaoVenda ?? "09:00",
	};
}

export function criarLotesIniciaisParaTotal(total: number): EventoLoteIngressoForm[] {
	return [
		{
			id: novoIdLote(),
			rotulo: "1.º lote",
			quantidade: total,
			ordem: 0,
			modoLiberacao: "IMEDIATA",
			dataLiberacaoVenda: "",
			horaLiberacaoVenda: "09:00",
		},
	];
}

/** Erro humano ou `null` se válido. */
export function validarLotesIngresso(lotes: EventoLoteIngressoForm[] | undefined, totalVagas: number): string | null {
	const total = Math.floor(Number(totalVagas) || 0);
	if (total < 1) return "Defina vagas totais (mínimo 1).";
	const lista = lotes?.length ? lotes : criarLotesIniciaisParaTotal(total);
	for (let i = 0; i < lista.length; i++) {
		const l = lista[i];
		const q = Math.floor(Number(l.quantidade) || 0);
		if (q < 1) return `O lote «${l.rotulo || i + 1}» precisa de pelo menos 1 vaga.`;
		if (q > total) {
			return `O lote «${l.rotulo || i + 1}» tem ${q} vagas, mas o total do evento é ${total}. Nenhum lote pode ultrapassar o total.`;
		}
	}
	const sum = lista.reduce((s, x) => s + Math.max(0, Math.floor(Number(x.quantidade) || 0)), 0);
	if (sum !== total) {
		return `A soma das vagas dos lotes (${sum}) tem de ser exatamente igual às vagas totais (${total}). Não pode ser maior nem menor.`;
	}
	for (let i = 0; i < lista.length; i++) {
		const l = lista[i];
		if (i === 0 && l.modoLiberacao === "APOS_ESGOTAR_ANTERIOR") {
			return "O primeiro lote não pode abrir apenas após esgotar outro lote.";
		}
		if (i > 0 && l.modoLiberacao === "IMEDIATA") {
			return "Só o primeiro lote pode ter venda imediata.";
		}
		if (l.modoLiberacao === "DATA_HORA") {
			const d = l.dataLiberacaoVenda?.trim() ?? "";
			const h = l.horaLiberacaoVenda?.trim() ?? "";
			if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
				return `Defina a data de abertura da venda para o lote «${l.rotulo || i + 1}».`;
			}
			if (!h) {
				return `Defina a hora de abertura da venda para o lote «${l.rotulo || i + 1}».`;
			}
		}
	}
	return null;
}

export function inferirLotesDoDto(
	total: number,
	lotesApi: EventoLoteIngressoPayload[] | undefined
): EventoLoteIngressoForm[] {
	if (lotesApi?.length) {
		return lotesApi.map((l, i) => ({
			id: novoIdLote(),
			rotulo: l.rotulo || `Lote ${i + 1}`,
			quantidade: l.quantidade,
			ordem: i,
			modoLiberacao: l.modoLiberacao,
			dataLiberacaoVenda: l.dataLiberacaoVenda ?? "",
			horaLiberacaoVenda: l.horaLiberacaoVenda ?? "09:00",
		}));
	}
	return criarLotesIniciaisParaTotal(total);
}

export const ROTULOS_MODO_LIBERACAO: Record<ModoLiberacaoLoteIngresso, string> = {
	IMEDIATA: "Após a data/hora global de início de vendas do evento (1.º lote)",
	DATA_HORA: "Abrir venda a partir de data e hora",
	APOS_ESGOTAR_ANTERIOR: "Abrir quando o lote anterior esgotar",
};

export function opcoesModoPrimeiroLote(): { value: ModoLiberacaoLoteIngresso; label: string }[] {
	return [
		{ value: "IMEDIATA", label: ROTULOS_MODO_LIBERACAO.IMEDIATA },
		{ value: "DATA_HORA", label: ROTULOS_MODO_LIBERACAO.DATA_HORA },
	];
}

export function opcoesModoLoteSeguinte(): { value: ModoLiberacaoLoteIngresso; label: string }[] {
	return [
		{ value: "DATA_HORA", label: ROTULOS_MODO_LIBERACAO.DATA_HORA },
		{ value: "APOS_ESGOTAR_ANTERIOR", label: ROTULOS_MODO_LIBERACAO.APOS_ESGOTAR_ANTERIOR },
	];
}
