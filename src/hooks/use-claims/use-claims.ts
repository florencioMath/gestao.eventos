import { useAuth } from '@/hooks/use-auth';

export const useClaims = () => {
	const { user } = useAuth();
	const claims = user?.claims ?? [];

	/** Verifica se o usuário possui uma claim específica */
	const hasClaim = (claim: string): boolean => claims.includes(claim);

	/** Verifica se o usuário possui pelo menos UMA das claims informadas */
	const hasAnyClaim = (required: string[]): boolean =>
		required.some((claim) => claims.includes(claim));

	/** Verifica se o usuário possui TODAS as claims informadas */
	const hasAllClaims = (required: string[]): boolean =>
		required.every((claim) => claims.includes(claim));

	return { claims, hasClaim, hasAnyClaim, hasAllClaims };
};
