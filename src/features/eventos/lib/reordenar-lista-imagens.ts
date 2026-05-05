import type { EventoImagemDto } from "@/features/eventos/types";

/** Troca posição entre dois itens ativos (não marcados para remoção) e renumera `ordemExibicao` / `posicao`. */
export function moverImagemExistenteNaLista(
	lista: EventoImagemDto[],
	idsMarcadosRemocao: Set<string>,
	cdEventosImagens: string,
	delta: -1 | 1
): EventoImagemDto[] {
	if (idsMarcadosRemocao.has(cdEventosImagens)) return lista;
	const ativos = lista.filter((im) => !idsMarcadosRemocao.has(im.cdEventosImagens));
	const i = ativos.findIndex((im) => im.cdEventosImagens === cdEventosImagens);
	if (i < 0) return lista;
	const j = i + delta;
	if (j < 0 || j >= ativos.length) return lista;
	const cdA = ativos[i].cdEventosImagens;
	const cdB = ativos[j].cdEventosImagens;
	const idxA = lista.findIndex((x) => x.cdEventosImagens === cdA);
	const idxB = lista.findIndex((x) => x.cdEventosImagens === cdB);
	const next = [...lista];
	[next[idxA], next[idxB]] = [next[idxB], next[idxA]];
	return next.map((im, ord) => ({ ...im, ordemExibicao: ord, posicao: ord }));
}
