/**
 * Filtra os grupos/features/claims para incluir apenas as claims selecionadas.
 * Retorna GrupoFuncionalidade[] mantendo a hierarquia completa (grupo > feature > claim),
 * omitindo grupos e features que não possuem claims selecionadas.
 */
export function buildSelectedGrupos(
	grupos: GrupoFuncionalidade[],
	selectedClaims: Set<string>
): GrupoFuncionalidade[] {
	const result: GrupoFuncionalidade[] = [];

	for (const grupo of grupos) {
		const filteredFeatures: FeatureFuncionalidade[] = [];

		for (const feature of grupo.features) {
			const filteredClaims = feature.claims.filter((c) =>
				selectedClaims.has(c.value)
			);
			if (filteredClaims.length > 0) {
				filteredFeatures.push({
					id: feature.id,
					key: feature.key,
					label: feature.label,
					claims: filteredClaims,
				});
			}
		}

		if (filteredFeatures.length > 0) {
			result.push({
				id: grupo.id,
				nome: grupo.nome,
				features: filteredFeatures,
			});
		}
	}

	return result;
}

/**
 * Extrai todos os claim values de um array de GrupoFuncionalidade[]
 * (para popular o Set de selectedClaims nos checkboxes).
 */
export function extractClaimValues(funcionalidades: GrupoFuncionalidade[]): string[] {
	return funcionalidades.flatMap((g) =>
		g.features.flatMap((f) => f.claims.map((c) => c.value))
	);
}
