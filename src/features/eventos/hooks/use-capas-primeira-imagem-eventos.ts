import { ImagensApi } from "@/features/eventos/api/eventos-api";
import { escolherImagemCapa, imagemDtoParaDataUrl } from "@/features/eventos/lib/imagem-evento";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Carrega a primeira imagem de capa por evento (em paralelo), para vista em cartões.
 */
export function useCapasPrimeiraImagemEventos(ids: string[], enabled: boolean) {
	const [mapaCapa, setMapaCapa] = useState<Record<string, string | null>>({});
	const [carregandoCapas, setCarregandoCapas] = useState(false);

	const idsKey = useMemo(() => [...ids].sort().join(","), [ids]);
	const idsRef = useRef(ids);
	idsRef.current = ids;

	useEffect(() => {
		const listaIds = idsRef.current;
		if (!enabled || listaIds.length === 0) {
			setMapaCapa({});
			setCarregandoCapas(false);
			return;
		}

		let cancelado = false;
		setCarregandoCapas(true);

		void (async () => {
			const pares = await Promise.all(
				listaIds.map(async (id) => {
					try {
						const imgs = await ImagensApi.listarPorEvento(id);
						const capa = escolherImagemCapa(imgs);
						return [id, imagemDtoParaDataUrl(capa)] as const;
					} catch {
						return [id, null] as const;
					}
				})
			);
			if (!cancelado) {
				setMapaCapa(Object.fromEntries(pares));
				setCarregandoCapas(false);
			}
		})();

		return () => {
			cancelado = true;
		};
	}, [enabled, idsKey]);

	return { mapaCapa, carregandoCapas };
}
