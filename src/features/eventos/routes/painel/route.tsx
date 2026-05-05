import { ClaimGuard } from '@/components/claim-guard';
import type { RouteObject } from 'react-router-dom';
import { PaginaPainel } from './page';

export const caminhoPainel = '/painel';
export const rotaPainel: RouteObject = {
	path: caminhoPainel,
	element: (
		<ClaimGuard claim='painel.view'>
			<PaginaPainel />
		</ClaimGuard>
	),
};
