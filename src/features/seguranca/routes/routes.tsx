import type { RouteObject } from 'react-router-dom';
import { componentesSegurancaRoute } from './componentes/route';
import { funcionalidadesRoute } from './funcionalidades/route';
import { criarPerfilRoute } from './perfis-criar/route';
import { editarPerfilRoute } from './perfis-editar/route';
import { perfisRoute } from './perfis/route';
import { criarUsuarioRoute } from './usuarios-criar/route';
import { editarUsuarioRoute } from './usuarios-editar/route';
import { usuariosRoute } from './usuarios/route';

export const segurancaRoutes: RouteObject[] = [
	usuariosRoute,
	criarUsuarioRoute,
	editarUsuarioRoute,
	perfisRoute,
	criarPerfilRoute,
	editarPerfilRoute,
	funcionalidadesRoute,
	componentesSegurancaRoute,
];
