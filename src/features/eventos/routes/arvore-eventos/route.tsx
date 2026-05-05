import { ClaimGuard } from "@/components/claim-guard";
import type { RouteObject } from "react-router-dom";
import { PaginaLayoutEventos } from "../eventos-layout/page";
import { PaginaListaEventos } from "../lista-eventos/page";
import { PaginaListaLocaisTroca } from "../lista-locais-troca/page";
import { PaginaNovaEvento } from "../novo-evento/page";
import { PaginaRelatoriosEventos } from "../relatorios-eventos/page";

export const caminhoEventos = "/eventos";

export const rotaEventosArvore: RouteObject = {
	path: caminhoEventos,
	element: (
		<ClaimGuard claim="eventos.view">
			<PaginaLayoutEventos />
		</ClaimGuard>
	),
	children: [
		{ index: true, element: <PaginaListaEventos /> },
		{
			path: "locais-troca",
			element: (
				<ClaimGuard claim="local-troca.view">
					<PaginaListaLocaisTroca />
				</ClaimGuard>
			),
		},
		{
			path: "novo",
			element: (
				<ClaimGuard claim="eventos.create">
					<PaginaNovaEvento />
				</ClaimGuard>
			),
		},
		{
			path: "relatorios",
			element: (
				<ClaimGuard claim="relatorios-eventos.view">
					<PaginaRelatoriosEventos />
				</ClaimGuard>
			),
		},
	],
};
