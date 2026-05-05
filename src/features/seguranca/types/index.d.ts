interface PerfilUsuario {
	id: string;
	name: string;
}

interface Usuario {
	id: string;
	userName: string;
	displayName: string;
	cpf: string;
	email: string;
	status: boolean;
	photo: string | null;
	perfis: PerfilUsuario[];
	unidadeId: string;
	criadoEm: string;
	atualizadoEm: string | null;
	emailSecundario?: string;
	telefone?: string;
}

interface UsuarioFormData {
	status: boolean;
	displayName: string;
	cpf: string;
	email: string;
	emailSecundario: string;
	telefone: string;
	perfilId: string;
	unidadeId: number;
	senha: string;
	confirmarSenha: string;
}

interface PerfilOption {
	id: string;
	name: string;
}

interface UnidadeOption {
	id: string;
	descricao: string;
}

interface PaginatedUsuarioResponse {
	content: Usuario[];
	page: number;
	pageSize: number;
	totalElements: number;
	totalPages: number;
}

// --- Perfil / Controle de Acesso ---

interface Perfil {
	id: string;
	name: string;
	userCount: number;
}

interface PerfilDetalhado extends Perfil {
	funcionalidades: GrupoFuncionalidade[];
}

interface ClaimItem {
	value: string;
	label: string;
}

interface ClaimFeature {
	key: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	claims: ClaimItem[];
}

interface ClaimGroup {
	group: string;
	features: ClaimFeature[];
}

// --- Funcionalidades (CRUD dinâmico hierárquico) ---

interface ClaimFuncionalidade {
	id: string;
	value: string;
	label: string;
}

interface FeatureFuncionalidade {
	id: string;
	key: string;
	label: string;
	claims: ClaimFuncionalidade[];
}

interface GrupoFuncionalidade {
	id: string;
	nome: string;
	features: FeatureFuncionalidade[];
}
