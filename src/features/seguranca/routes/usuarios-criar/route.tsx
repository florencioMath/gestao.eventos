import { ClaimGuard } from '@/components/claim-guard';
import type { RouteObject } from 'react-router-dom';
import { CriarUsuarioPage } from './page';

export const criarUsuarioPath = '/seguranca/usuarios/criar';
export const criarUsuarioRoute: RouteObject = {
	path: criarUsuarioPath,
	element: (
		<ClaimGuard claim='cadastro-usuario.view'>
			<CriarUsuarioPage />
		</ClaimGuard>
	),
};
