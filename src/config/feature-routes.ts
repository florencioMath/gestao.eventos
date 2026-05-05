const ROTAS_POR_FEATURE: Record<string, string> = {
	eventos: '/eventos',
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
