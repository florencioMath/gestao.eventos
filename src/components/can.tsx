import { resolvePermission, useClaims } from '@/hooks/use-claims';

type CanProps = {
	/** Claim única necessária para exibir o conteúdo */
	claim?: string;
	/** Lista de claims necessárias para exibir o conteúdo */
	claims?: string[];
	/** Se true, exige TODAS as claims. Se false (padrão), exige pelo menos uma */
	requireAll?: boolean;
	/** Conteúdo alternativo quando o usuário não tem permissão */
	fallback?: React.ReactNode;
	children: React.ReactNode;
};

export const Can = ({
	claim,
	claims,
	requireAll = false,
	fallback = null,
	children,
}: CanProps) => {
	const { hasClaim, hasAnyClaim, hasAllClaims } = useClaims();

	const hasPermission = resolvePermission({
		claim,
		claims,
		requireAll,
		hasClaim,
		hasAnyClaim,
		hasAllClaims,
	});

	if (!hasPermission) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};
