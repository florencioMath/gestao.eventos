import { ClaimGuard } from '@/components/claim-guard';
import type { RouteObject } from 'react-router-dom';
import { CriarPerfilPage } from './page';

export const criarPerfilPath = '/seguranca/perfis/criar';
export const criarPerfilRoute: RouteObject = {
	path: criarPerfilPath,
	element: (
		<ClaimGuard claim='perfil-acesso.view'>
			<CriarPerfilPage />
		</ClaimGuard>
	),
};
