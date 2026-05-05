type ResolvePermissionParams = {
	claim?: string;
	claims?: string[];
	requireAll: boolean;
	hasClaim: (claim: string) => boolean;
	hasAnyClaim: (claims: string[]) => boolean;
	hasAllClaims: (claims: string[]) => boolean;
};

/** Resolve se o usuário tem permissão com base nas claims informadas */
export function resolvePermission({
	claim,
	claims,
	requireAll,
	hasClaim,
	hasAnyClaim,
	hasAllClaims,
}: ResolvePermissionParams): boolean {
	if (claim) {
		return hasClaim(claim);
	}

	if (claims && claims.length > 0) {
		return requireAll ? hasAllClaims(claims) : hasAnyClaim(claims);
	}

	return true;
}
