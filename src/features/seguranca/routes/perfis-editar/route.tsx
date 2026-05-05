import { ClaimGuard } from '@/components/claim-guard';
import type { RouteObject } from 'react-router-dom';
import { EditarPerfilPage } from './page';

export const editarPerfilPath = '/seguranca/perfis/editar/:id';
export const editarPerfilRoute: RouteObject = {
	path: editarPerfilPath,
	element: (
		<ClaimGuard claim='perfil-acesso.view'>
			<EditarPerfilPage />
		</ClaimGuard>
	),
};
