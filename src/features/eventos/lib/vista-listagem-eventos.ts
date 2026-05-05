const STORAGE_KEY = "ge:vista-listagem-eventos";

export type VistaListagemEventos = "tabela" | "cartoes";

export function lerVistaListagemEventos(): VistaListagemEventos {
	try {
		const v = localStorage.getItem(STORAGE_KEY);
		if (v === "cartoes" || v === "tabela") return v;
	} catch {
		/* ignore */
	}
	return "cartoes";
}

export function guardarVistaListagemEventos(vista: VistaListagemEventos): void {
	try {
		localStorage.setItem(STORAGE_KEY, vista);
	} catch {
		/* ignore */
	}
}
