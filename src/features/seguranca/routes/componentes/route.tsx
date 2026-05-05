import { ClaimGuard } from '@/components/claim-guard';
import type { RouteObject } from 'react-router-dom';
import { ComponentesSegurancaPage } from './page';

export const componentesSegurancaPath = '/seguranca/componentes';

export const componentesSegurancaRoute: RouteObject = {
	path: componentesSegurancaPath,
	element: (
		<ClaimGuard claim='exemplos-componentes.view'>
			<ComponentesSegurancaPage />
		</ClaimGuard>
	),
};
