import { ClaimGuard } from '@/components/claim-guard';
import type { RouteObject } from 'react-router-dom';
import { EditarUsuarioPage } from './page';

export const editarUsuarioPath = '/seguranca/usuarios/editar/:id';
export const editarUsuarioRoute: RouteObject = {
	path: editarUsuarioPath,
	element: (
		<ClaimGuard claim='cadastro-usuario.view'>
			<EditarUsuarioPage />
		</ClaimGuard>
	),
};
