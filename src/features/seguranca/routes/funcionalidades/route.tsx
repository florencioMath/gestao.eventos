import { ClaimGuard } from '@/components/claim-guard';
import type { RouteObject } from 'react-router-dom';
import { FuncionalidadesPage } from './page';

export const funcionalidadesPath = '/seguranca/funcionalidades';
export const funcionalidadesRoute: RouteObject = {
	path: funcionalidadesPath,
	element: (
		<ClaimGuard claim='funcionalidades.view'>
			<FuncionalidadesPage />
		</ClaimGuard>
	),
};
