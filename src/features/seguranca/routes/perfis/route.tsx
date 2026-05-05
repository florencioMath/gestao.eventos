import { ClaimGuard } from '@/components/claim-guard';
import type { RouteObject } from 'react-router-dom';
import { PerfisPage } from './page';

export const perfisPath = '/seguranca/perfis';
export const perfisRoute: RouteObject = {
	path: perfisPath,
	element: (
		<ClaimGuard claim='perfil-acesso.view'>
			<PerfisPage />
		</ClaimGuard>
	),
};
