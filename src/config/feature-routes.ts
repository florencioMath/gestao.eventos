const ROTAS_POR_FEATURE: Record<string, string> = {
	eventos: '/eventos',
	'local-troca': '/eventos/locais-troca',
	'relatorios-eventos': '/eventos/relatorios',
	'cadastro-usuario': '/seguranca/usuarios',
	'perfil-acesso': '/seguranca/perfis',
	funcionalidades: '/seguranca/funcionalidades',
	'exemplos-componentes': '/seguranca/componentes',
};

/** Quando a feature é o painel, o caminho depende do nome do grupo de funcionalidade. */
const ROTAS_PAINEL_POR_GRUPO: Record<string, string> = {
	Eventos: '/painel',
};

export function resolverCaminhoDaFeature(nomeGrupo: string, chaveFeature: string): string | null {
	if (chaveFeature === 'painel') {
		return ROTAS_PAINEL_POR_GRUPO[nomeGrupo] ?? null;
	}
	return ROTAS_POR_FEATURE[chaveFeature] ?? null;
}

/** @deprecated Use resolverCaminhoDaFeature */
export const resolveFeaturePath = resolverCaminhoDaFeature;

/**
 * Destaque do item no menu lateral. O `NavLink` padrão trata `/eventos` como prefixo de
 * `/eventos/relatorios`, deixando "Eventos" e "Relatórios" ativos ao mesmo tempo.
 */
export function menuLateralItemAtivo(pathname: string, destino: string): boolean {
	if (destino === '/eventos') {
		return pathname === '/eventos' || pathname.startsWith('/eventos/novo');
	}
	if (destino === '/eventos/locais-troca') {
		return pathname === '/eventos/locais-troca' || pathname.startsWith('/eventos/locais-troca/');
	}
	return pathname === destino || pathname.startsWith(`${destino}/`);
}

export function resolverRotaInicial(funcionalidades: GrupoFuncionalidade[]): string {
	for (const grupo of funcionalidades) {
		for (const feature of grupo.features) {
			const path = resolverCaminhoDaFeature(grupo.nome, feature.key);
			if (path) return path;
		}
	}
	return '/entrar';
}

/** @deprecated Use resolverRotaInicial */
export const resolveHomeRoute = resolverRotaInicial;
