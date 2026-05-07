import {
	Blocks,
	FileSpreadsheet,
	LayoutDashboard,
	ListTodo,
	MapPin,
	QrCode,
	Settings,
	User,
	Users,
} from 'lucide-react';

export const claimsConfig: ClaimGroup[] = [
	{
		group: 'Eventos',
		features: [
			{
				key: 'painel',
				label: 'Painel',
				icon: LayoutDashboard,
				claims: [
					{ value: 'painel.view', label: 'Visualizar' },
					{ value: 'painel.create', label: 'Cadastrar' },
					{ value: 'painel.edit', label: 'Editar' },
					{ value: 'painel.delete', label: 'Excluir' },
				],
			},
			{
				key: 'eventos',
				label: 'Eventos',
				icon: ListTodo,
				claims: [
					{ value: 'eventos.view', label: 'Visualizar' },
					{ value: 'eventos.create', label: 'Cadastrar' },
					{ value: 'eventos.edit', label: 'Editar' },
					{ value: 'eventos.delete', label: 'Excluir' },
				],
			},
			{
				key: 'local-troca',
				label: 'Local de troca',
				icon: MapPin,
				claims: [
					{ value: 'local-troca.view', label: 'Visualizar' },
					{ value: 'local-troca.create', label: 'Cadastrar' },
					{ value: 'local-troca.edit', label: 'Editar' },
					{ value: 'local-troca.delete', label: 'Excluir' },
				],
			},
			{
				key: 'relatorios-eventos',
				label: 'Relatórios',
				icon: FileSpreadsheet,
				claims: [{ value: 'relatorios-eventos.view', label: 'Visualizar' }],
			},
			{
				key: 'leitor-qr',
				label: 'Leitor QR',
				icon: QrCode,
				claims: [{ value: 'leitor-qr.view', label: 'Visualizar' }],
			},
		],
	},
	{
		group: 'Segurança',
		features: [
			{
				key: 'cadastro-usuario',
				label: 'Cadastro de usuário',
				icon: Users,
				claims: [
					{ value: 'cadastro-usuario.view', label: 'Visualizar' },
					{ value: 'cadastro-usuario.create', label: 'Cadastrar' },
					{ value: 'cadastro-usuario.edit', label: 'Editar' },
					{ value: 'cadastro-usuario.delete', label: 'Excluir' },
				],
			},
			{
				key: 'perfil-acesso',
				label: 'Perfil de acesso',
				icon: User,
				claims: [
					{ value: 'perfil-acesso.view', label: 'Visualizar' },
					{ value: 'perfil-acesso.create', label: 'Cadastrar' },
					{ value: 'perfil-acesso.edit', label: 'Editar' },
					{ value: 'perfil-acesso.delete', label: 'Excluir' },
				],
			},
			{
				key: 'funcionalidades',
				label: 'Funcionalidades',
				icon: Settings,
				claims: [
					{ value: 'funcionalidades.view', label: 'Visualizar' },
					{ value: 'funcionalidades.create', label: 'Cadastrar' },
					{ value: 'funcionalidades.edit', label: 'Editar' },
					{ value: 'funcionalidades.delete', label: 'Excluir' },
				],
			},
			{
				key: 'exemplos-componentes',
				label: 'Componentes',
				icon: Blocks,
				claims: [{ value: 'exemplos-componentes.view', label: 'Visualizar' }],
			},
		],
	},
];
