/**
 * Usuários mockados para teste do sistema de claims/funcionalidades.
 * As árvores `funcionalidadesAdministrador|Gestor|Operador` são reutilizadas
 * pelo mock da API de segurança (`seguranca-mock-api.ts`) nas telas de cadastro.
 *
 * | Login              | Senha  | Perfil          | Acesso resumido                                      |
 * |--------------------|--------|-----------------|------------------------------------------------------|
 * | admin@teste.com    | 123456 | Administrador   | Eventos (painel + eventos) + Segurança (completo)    |
 * | gestor@teste.com   | 123456 | Gestor          | Eventos (completo) + Segurança (usuários/perfis view)|
 * | operador@teste.com | 123456 | Operador        | Eventos (painel + eventos, sem excluir)              |
 */

function extrairClaims(funcionalidades: GrupoFuncionalidade[]): string[] {
	return funcionalidades.flatMap((g) =>
		g.features.flatMap((f) => f.claims.map((c) => c.value))
	);
}

const claimPainelCompleto = [
	{ id: 'p1', value: 'painel.view', label: 'Visualizar' },
	{ id: 'p2', value: 'painel.create', label: 'Cadastrar' },
	{ id: 'p3', value: 'painel.edit', label: 'Editar' },
	{ id: 'p4', value: 'painel.delete', label: 'Excluir' },
] as const;

const claimEventosCompleto = [
	{ id: 'e1', value: 'eventos.view', label: 'Visualizar' },
	{ id: 'e2', value: 'eventos.create', label: 'Cadastrar' },
	{ id: 'e3', value: 'eventos.edit', label: 'Editar' },
	{ id: 'e4', value: 'eventos.delete', label: 'Excluir' },
] as const;

const claimLocalTrocaCompleto = [
	{ id: 'lt1', value: 'local-troca.view', label: 'Visualizar' },
	{ id: 'lt2', value: 'local-troca.create', label: 'Cadastrar' },
	{ id: 'lt3', value: 'local-troca.edit', label: 'Editar' },
	{ id: 'lt4', value: 'local-troca.delete', label: 'Excluir' },
] as const;

const claimSegurancaUsuario = [
	{ id: 'u1', value: 'cadastro-usuario.view', label: 'Visualizar' },
	{ id: 'u2', value: 'cadastro-usuario.create', label: 'Cadastrar' },
	{ id: 'u3', value: 'cadastro-usuario.edit', label: 'Editar' },
	{ id: 'u4', value: 'cadastro-usuario.delete', label: 'Excluir' },
] as const;

const claimSegurancaPerfil = [
	{ id: 'pf1', value: 'perfil-acesso.view', label: 'Visualizar' },
	{ id: 'pf2', value: 'perfil-acesso.create', label: 'Cadastrar' },
	{ id: 'pf3', value: 'perfil-acesso.edit', label: 'Editar' },
	{ id: 'pf4', value: 'perfil-acesso.delete', label: 'Excluir' },
] as const;

const claimSegurancaFuncionalidades = [
	{ id: 'fn1', value: 'funcionalidades.view', label: 'Visualizar' },
	{ id: 'fn2', value: 'funcionalidades.create', label: 'Cadastrar' },
	{ id: 'fn3', value: 'funcionalidades.edit', label: 'Editar' },
	{ id: 'fn4', value: 'funcionalidades.delete', label: 'Excluir' },
] as const;

const claimExemplosComponentes = [
	{ id: 'ex1', value: 'exemplos-componentes.view', label: 'Visualizar' },
] as const;

const grupoEventosAdmin: GrupoFuncionalidade = {
	id: 'grp-eventos',
	nome: 'Eventos',
	features: [
		{
			id: 'feat-painel',
			key: 'painel',
			label: 'Painel',
			claims: [...claimPainelCompleto],
		},
		{
			id: 'feat-eventos',
			key: 'eventos',
			label: 'Eventos',
			claims: [...claimEventosCompleto],
		},
		{
			id: 'feat-local-troca',
			key: 'local-troca',
			label: 'Local de troca',
			claims: [...claimLocalTrocaCompleto],
		},
		{
			id: 'feat-relatorios-eventos',
			key: 'relatorios-eventos',
			label: 'Relatórios',
			claims: [{ id: 'rev1', value: 'relatorios-eventos.view', label: 'Visualizar' }],
		},
	],
};

const grupoSegurancaAdmin: GrupoFuncionalidade = {
	id: 'grp-seguranca',
	nome: 'Segurança',
	features: [
		{
			id: 'feat-usuarios',
			key: 'cadastro-usuario',
			label: 'Cadastro de usuário',
			claims: [...claimSegurancaUsuario],
		},
		{
			id: 'feat-perfis',
			key: 'perfil-acesso',
			label: 'Perfil de acesso',
			claims: [...claimSegurancaPerfil],
		},
		{
			id: 'feat-func',
			key: 'funcionalidades',
			label: 'Funcionalidades',
			claims: [...claimSegurancaFuncionalidades],
		},
		{
			id: 'feat-exemplos-componentes',
			key: 'exemplos-componentes',
			label: 'Componentes',
			claims: [...claimExemplosComponentes],
		},
	],
};

const funcionalidadesAdministrador: GrupoFuncionalidade[] = [
	grupoEventosAdmin,
	grupoSegurancaAdmin,
];

const funcionalidadesGestor: GrupoFuncionalidade[] = [
	{
		id: 'grp-eventos',
		nome: 'Eventos',
		features: [
			{
				id: 'feat-painel',
				key: 'painel',
				label: 'Painel',
				claims: [...claimPainelCompleto],
			},
			{
				id: 'feat-eventos',
				key: 'eventos',
				label: 'Eventos',
				claims: [...claimEventosCompleto],
			},
			{
				id: 'feat-local-troca',
				key: 'local-troca',
				label: 'Local de troca',
				claims: [...claimLocalTrocaCompleto],
			},
			{
				id: 'feat-relatorios-eventos',
				key: 'relatorios-eventos',
				label: 'Relatórios',
				claims: [{ id: 'rev1', value: 'relatorios-eventos.view', label: 'Visualizar' }],
			},
		],
	},
	{
		id: 'grp-seguranca',
		nome: 'Segurança',
		features: [
			{
				id: 'feat-usuarios',
				key: 'cadastro-usuario',
				label: 'Cadastro de usuário',
				claims: [{ id: 'u1', value: 'cadastro-usuario.view', label: 'Visualizar' }],
			},
			{
				id: 'feat-perfis',
				key: 'perfil-acesso',
				label: 'Perfil de acesso',
				claims: [{ id: 'pf1', value: 'perfil-acesso.view', label: 'Visualizar' }],
			},
			{
				id: 'feat-exemplos-componentes',
				key: 'exemplos-componentes',
				label: 'Componentes',
				claims: [...claimExemplosComponentes],
			},
		],
	},
];

const funcionalidadesOperador: GrupoFuncionalidade[] = [
	{
		id: 'grp-eventos',
		nome: 'Eventos',
		features: [
			{
				id: 'feat-painel',
				key: 'painel',
				label: 'Painel',
				claims: [{ id: 'p1', value: 'painel.view', label: 'Visualizar' }],
			},
			{
				id: 'feat-eventos',
				key: 'eventos',
				label: 'Eventos',
				claims: [
					{ id: 'e1', value: 'eventos.view', label: 'Visualizar' },
					{ id: 'e2', value: 'eventos.create', label: 'Cadastrar' },
					{ id: 'e3', value: 'eventos.edit', label: 'Editar' },
				],
			},
			{
				id: 'feat-local-troca',
				key: 'local-troca',
				label: 'Local de troca',
				claims: [
					{ id: 'lt1', value: 'local-troca.view', label: 'Visualizar' },
					{ id: 'lt2', value: 'local-troca.create', label: 'Cadastrar' },
					{ id: 'lt3', value: 'local-troca.edit', label: 'Editar' },
				],
			},
			{
				id: 'feat-relatorios-eventos',
				key: 'relatorios-eventos',
				label: 'Relatórios',
				claims: [{ id: 'rev1', value: 'relatorios-eventos.view', label: 'Visualizar' }],
			},
		],
	},
];

type UsuarioMock = {
	token: string;
	user: {
		id: string;
		name: string;
		email: string;
		profile: {
			id: string;
			name: string;
		};
		claims: string[];
		funcionalidades: GrupoFuncionalidade[];
	};
};

/** Árvore de funcionalidades usada também pelo mock da API de segurança. */
export {
	funcionalidadesAdministrador,
	funcionalidadesGestor,
	funcionalidadesOperador,
};

export const MOCK_USERS: Record<string, UsuarioMock> = {
	'admin@teste.com': {
		token: 'mock-token-admin',
		user: {
			id: '1',
			name: 'Administrador Teste',
			email: 'admin@teste.com',
			profile: { id: '1', name: 'Administrador' },
			funcionalidades: funcionalidadesAdministrador,
			claims: extrairClaims(funcionalidadesAdministrador),
		},
	},

	'gestor@teste.com': {
		token: 'mock-token-gestor',
		user: {
			id: '2',
			name: 'Gestor Teste',
			email: 'gestor@teste.com',
			profile: { id: '2', name: 'Gestor' },
			funcionalidades: funcionalidadesGestor,
			claims: extrairClaims(funcionalidadesGestor),
		},
	},

	'operador@teste.com': {
		token: 'mock-token-operador',
		user: {
			id: '3',
			name: 'Operador Teste',
			email: 'operador@teste.com',
			profile: { id: '3', name: 'Operador' },
			funcionalidades: funcionalidadesOperador,
			claims: extrairClaims(funcionalidadesOperador),
		},
	},
};

export const MOCK_PASSWORD = '123456';
