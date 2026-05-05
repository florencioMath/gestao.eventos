import { api } from '@/lib/api';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { aplicarRespostaMockada } from './resposta-mock-axios';
import {
	funcionalidadesAdministrador,
	funcionalidadesGestor,
	funcionalidadesOperador,
} from './users';

function clonar<T>(valor: T): T {
	return JSON.parse(JSON.stringify(valor)) as T;
}

function caminhoRequisicao(config: InternalAxiosRequestConfig): string {
	const u = config.url ?? '';
	return u.split('?')[0];
}

/** Estado mutável só para o mock (listagens e PUT refletem na mesma sessão). */
let gruposFuncionalidades = clonar(funcionalidadesAdministrador);

const permissoesPorPerfil = new Map<string, GrupoFuncionalidade[]>([
	['1', clonar(funcionalidadesAdministrador)],
	['2', clonar(funcionalidadesGestor)],
	['3', clonar(funcionalidadesOperador)],
]);

let perfisMock: Perfil[] = [
	{ id: '1', name: 'Administrador', userCount: 1 },
	{ id: '2', name: 'Gestor', userCount: 1 },
	{ id: '3', name: 'Operador', userCount: 1 },
];

let usuariosMock: Usuario[] = [
	{
		id: '1',
		userName: 'admin@teste.com',
		displayName: 'Administrador Teste',
		cpf: '00000000000',
		email: 'admin@teste.com',
		status: true,
		photo: null,
		perfis: [{ id: '1', name: 'Administrador' }],
		unidadeId: '1',
		criadoEm: '2025-01-15T10:00:00.000Z',
		atualizadoEm: null,
		emailSecundario: '',
		telefone: '',
	},
	{
		id: '2',
		userName: 'gestor@teste.com',
		displayName: 'Gestor Teste',
		cpf: '11111111111',
		email: 'gestor@teste.com',
		status: true,
		photo: null,
		perfis: [{ id: '2', name: 'Gestor' }],
		unidadeId: '1',
		criadoEm: '2025-01-15T10:00:00.000Z',
		atualizadoEm: null,
		emailSecundario: '',
		telefone: '',
	},
	{
		id: '3',
		userName: 'operador@teste.com',
		displayName: 'Operador Teste',
		cpf: '22222222222',
		email: 'operador@teste.com',
		status: true,
		photo: null,
		perfis: [{ id: '3', name: 'Operador' }],
		unidadeId: '2',
		criadoEm: '2025-01-15T10:00:00.000Z',
		atualizadoEm: null,
		emailSecundario: '',
		telefone: '',
	},
];

const unidadesMock: UnidadeOption[] = [
	{ id: '1', descricao: 'Unidade central' },
	{ id: '2', descricao: 'Unidade regional' },
];

function novoId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `mock-${Date.now()}`;
}

function responderVazio(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
	return aplicarRespostaMockada(config, () => ({}));
}

function tratarRequisicao(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | void {
	const metodo = (config.method ?? 'get').toLowerCase();
	const caminho = caminhoRequisicao(config);

	// --- Dominios ---
	if (metodo === 'get' && caminho === '/dominios/unidades') {
		return aplicarRespostaMockada(config, () => unidadesMock);
	}

	// --- Endereço (apiSilent — FormularioEndereco) ---
	const matchCep = caminho.match(/^\/endereco\/buscar-por-cep\/(\d{8})$/);
	if (metodo === 'get' && matchCep) {
		const digitos = matchCep[1];
		return aplicarRespostaMockada(config, () => ({
			id: `mock-cep-${digitos}`,
			city: 'São Paulo',
			state: 'SP',
			street: 'AVENIDA PAULISTA',
			neighborhood: 'BELA VISTA',
			zipcode: digitos,
			lat: '-23.561414',
			longitude: '-46.655881',
			isOfficialAddress: true,
			region: 'Sudeste',
			source: 'mock',
		}));
	}
	if (metodo === 'post' && caminho === '/endereco/buscar-por-logradouro') {
		return aplicarRespostaMockada(config, () => {
			const corpo =
				typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
			const logr = ((corpo as { logradouro?: string }).logradouro ?? 'RUA').toUpperCase();
			return [
				{
					id: 'mock-log-1',
					city: 'São Paulo',
					state: 'SP',
					street: `${logr} MOCK 100`,
					neighborhood: 'CENTRO',
					zipcode: '01001000',
					lat: '-23.5500',
					longitude: '-46.6333',
					isOfficialAddress: true,
					region: '',
					source: 'mock',
				},
				{
					id: 'mock-log-2',
					city: 'São Paulo',
					state: 'SP',
					street: `${logr} MOCK 200`,
					neighborhood: 'JARDINS',
					zipcode: '01415000',
					lat: '-23.5670',
					longitude: '-46.6480',
					isOfficialAddress: true,
					region: '',
					source: 'mock',
				},
			];
		});
	}

	// --- Histórico (demo — mesmo formato do backend: HistoricoItem[]) ---
	if (metodo === 'get' && caminho === '/seguranca/exemplos/historico') {
		return aplicarRespostaMockada(config, () => {
			const linhas: HistoricoItem[] = [
				{
					visivelAoSolicitante: true,
					usuario: {
						nome: 'admin transito',
						email: 'admin@transito.gov.br',
						perfil: 'ADMINISTRADOR',
					},
					acao: {
						status: 'RETIRADO',
						descricao: 'Remoção finalizada - veículo retirado',
					},
					data: '2026-04-27T15:33:31.256496-03:00',
				},
				{
					visivelAoSolicitante: true,
					usuario: {
						nome: 'admin transito',
						email: 'admin@transito.gov.br',
						perfil: 'ADMINISTRADOR',
					},
					acao: {
						status: 'CONCLUIDO',
						descricao: 'Veículo retirado do pátio. Motivo: Solicitação concluída',
					},
					data: '2026-04-27T15:33:31.206981-03:00',
				},
				{
					visivelAoSolicitante: true,
					usuario: {
						nome: 'Matheus Florêncio da Silva',
						email: 'matheusflsilva@ici.tec.br',
						perfil: 'CIDADAO',
					},
					acao: {
						status: 'PENDENTE',
						descricao: 'Solicitação de retirada cadastrada',
					},
					data: '2026-04-27T15:31:33.16027-03:00',
				},
				{
					visivelAoSolicitante: false,
					usuario: {
						nome: 'operador transito',
						email: 'app@transito.gov.br',
						perfil: 'OPERADOR',
					},
					acao: {
						status: 'AGUARDANDO_REVISAO_DEPARTAMENTO',
						descricao: 'Remoção cadastrada.',
					},
					data: '2026-04-27T14:41:25.57096-03:00',
				},
			];
			return linhas;
		});
	}

	// --- Funcionalidades (árvore exibida na tela; administrador = template completo) ---
	if (metodo === 'get' && caminho === '/seguranca/funcionalidades') {
		return aplicarRespostaMockada(config, () => clonar(gruposFuncionalidades));
	}
	if (metodo === 'put' && caminho === '/seguranca/funcionalidades') {
		const corpo =
			typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
		gruposFuncionalidades = clonar(corpo as GrupoFuncionalidade[]);
		return responderVazio(config);
	}

	// --- Perfis (lista) ---
	if (metodo === 'get' && caminho === '/seguranca/perfis') {
		return aplicarRespostaMockada(config, () => clonar(perfisMock));
	}

	const matchPermissoes = caminho.match(/^\/seguranca\/perfis\/([^/]+)\/permissoes$/);
	if (metodo === 'get' && matchPermissoes) {
		const idPerfil = matchPermissoes[1];
		const perm = permissoesPorPerfil.get(idPerfil);
		return aplicarRespostaMockada(config, () =>
			clonar(perm ?? funcionalidadesAdministrador)
		);
	}

	if (metodo === 'post' && caminho === '/seguranca/perfis') {
		return aplicarRespostaMockada(config, () => {
			const corpo =
				typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
			const nome = (corpo as { name?: string }).name ?? 'Novo perfil';
			const id = novoId();
			perfisMock = [...perfisMock, { id, name: nome, userCount: 0 }];
			permissoesPorPerfil.set(id, clonar(funcionalidadesAdministrador));
			return { id };
		});
	}

	const matchPerfilId = caminho.match(/^\/seguranca\/perfis\/([^/]+)$/);
	if (metodo === 'delete' && matchPerfilId) {
		const id = matchPerfilId[1];
		perfisMock = perfisMock.filter((p) => p.id !== id);
		permissoesPorPerfil.delete(id);
		return responderVazio(config);
	}

	if (metodo === 'put' && caminho === '/seguranca/perfis/permissoes') {
		return aplicarRespostaMockada(config, () => {
			const corpo =
				typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
			const { id, nome, funcionalidades } = corpo as {
				id: string;
				nome: string;
				funcionalidades: GrupoFuncionalidade[];
			};
			perfisMock = perfisMock.map((p) =>
				p.id === id ? { ...p, name: nome, userCount: p.userCount } : p
			);
			permissoesPorPerfil.set(id, clonar(funcionalidades));
			return {};
		});
	}

	// --- Usuários (paginado) ---
	if (metodo === 'get' && caminho === '/seguranca/usuarios') {
		return aplicarRespostaMockada(config, () => {
			const params = config.params as Record<string, string | number> | undefined;
			const pageSize = Number(params?.pageSize ?? 10);
			const pageApi = Number(params?.page ?? 1);
			const termo = String(params?.term ?? '')
				.trim()
				.toLowerCase();

			let lista = [...usuariosMock];
			if (termo) {
				lista = lista.filter(
					(u) =>
						u.displayName.toLowerCase().includes(termo) ||
						u.email.toLowerCase().includes(termo) ||
						u.cpf.includes(termo.replace(/\D/g, ''))
				);
			}

			const totalElements = lista.length;
			const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
			const pageIndex = Math.min(Math.max(pageApi, 1), totalPages) - 1;
			const inicio = pageIndex * pageSize;
			const content = lista.slice(inicio, inicio + pageSize);

			const resposta: PaginatedUsuarioResponse = {
				content,
				page: pageIndex,
				pageSize,
				totalElements,
				totalPages,
			};
			return resposta;
		});
	}

	const matchUsuarioId = caminho.match(/^\/seguranca\/usuarios\/([^/]+)$/);
	if (metodo === 'get' && matchUsuarioId) {
		const id = matchUsuarioId[1];
		return aplicarRespostaMockada(config, () => {
			const u = usuariosMock.find((x) => x.id === id);
			if (!u) throw { status: 404, message: 'Usuário não encontrado' };
			return clonar(u);
		});
	}

	if (metodo === 'post' && caminho === '/seguranca/usuarios') {
		return aplicarRespostaMockada(config, () => {
			const corpo =
				typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
			const f = corpo as UsuarioFormData;
			const id = novoId();
			const perfil = perfisMock.find((p) => p.id === String(f.perfilId));
			const novo: Usuario = {
				id,
				userName: f.email,
				displayName: f.displayName,
				cpf: f.cpf,
				email: f.email,
				status: f.status,
				photo: null,
				perfis: perfil ? [{ id: perfil.id, name: perfil.name }] : [],
				unidadeId: String(f.unidadeId),
				criadoEm: new Date().toISOString(),
				atualizadoEm: null,
				emailSecundario: f.emailSecundario,
				telefone: f.telefone,
			};
			usuariosMock = [...usuariosMock, novo];
			if (perfil) {
				perfisMock = perfisMock.map((p) =>
					p.id === perfil.id ? { ...p, userCount: p.userCount + 1 } : p
				);
			}
			return { id };
		});
	}

	if (metodo === 'put' && caminho === '/seguranca/usuarios') {
		return aplicarRespostaMockada(config, () => {
			const corpo =
				typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
			const { id, displayName, email, emailSecundario, perfilId, unidadeId, status, telefone } =
				corpo as {
					id: string;
					displayName?: string;
					email?: string;
					emailSecundario?: string;
					perfilId?: string;
					unidadeId?: number;
					status?: boolean;
					telefone?: string;
				};

			usuariosMock = usuariosMock.map((u) => {
				if (u.id !== id) return u;
				const perfil = perfilId ? perfisMock.find((p) => p.id === String(perfilId)) : undefined;
				return {
					...u,
					displayName: displayName ?? u.displayName,
					email: email ?? u.email,
					emailSecundario: emailSecundario ?? u.emailSecundario,
					telefone: telefone ?? u.telefone,
					status: status ?? u.status,
					unidadeId: unidadeId != null ? String(unidadeId) : u.unidadeId,
					perfis: perfil ? [{ id: perfil.id, name: perfil.name }] : u.perfis,
					atualizadoEm: new Date().toISOString(),
				};
			});
			return {};
		});
	}
}

/**
 * Intercepta chamadas das instâncias autenticadas (`api` e `apiSilent`, ex.: endereço).
 */
export function registrarMocksApiSeguranca(...clientes: AxiosInstance[]): void {
	const lista = clientes.length > 0 ? clientes : [api];
	for (const cliente of lista) {
		cliente.interceptors.request.use((config: InternalAxiosRequestConfig) => {
			const resultado = tratarRequisicao(config);
			return resultado ?? config;
		});
	}
}
