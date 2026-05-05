import { ClaimGuard } from '@/components/claim-guard';
import type { RouteObject } from 'react-router-dom';
import { UsuariosPage } from './page';

export const usuariosPath = '/seguranca/usuarios';
export const usuariosRoute: RouteObject = {
	path: usuariosPath,
	element: (
		<ClaimGuard claim='cadastro-usuario.view'>
			<UsuariosPage />
		</ClaimGuard>
	),
};
