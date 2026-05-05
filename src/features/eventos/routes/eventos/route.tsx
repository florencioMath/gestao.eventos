import { ClaimGuard } from '@/components/claim-guard';
import type { RouteObject } from 'react-router-dom';
import { PaginaEventos } from './page';

export const caminhoEventos = '/eventos';
export const rotaEventos: RouteObject = {
	path: caminhoEventos,
	element: (
		<ClaimGuard claim='eventos.view'>
			<PaginaEventos />
		</ClaimGuard>
	),
};
