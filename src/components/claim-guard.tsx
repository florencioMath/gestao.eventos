import { useAuth } from '@/hooks/use-auth';
import { resolvePermission, useClaims } from '@/hooks/use-claims';
import { AccessDeniedPage } from '@/features/auth/routes/access-denied/page';
import { Outlet } from 'react-router-dom';

type ClaimGuardProps = {
	/** Claim única necessária para acessar o conteúdo */
	claim?: string;
	/** Lista de claims necessárias para acessar o conteúdo */
	claims?: string[];
	/** Se true, exige TODAS as claims. Se false (padrão), exige pelo menos uma */
	requireAll?: boolean;
	/** Conteúdo alternativo quando o usuário não tem permissão. Padrão: página de Acesso Negado */
	fallback?: React.ReactNode;
	children?: React.ReactNode;
};

export const ClaimGuard = ({
	claim,
	claims,
	requireAll = false,
	fallback,
	children,
}: ClaimGuardProps) => {
	const { isLoading } = useAuth();
	const { hasClaim, hasAnyClaim, hasAllClaims } = useClaims();

	if (isLoading) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<div className='text-center'>
					<div className='mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'></div>
					<p className='text-gray-600'>Carregando...</p>
				</div>
			</div>
		);
	}

	const hasPermission = resolvePermission({
		claim,
		claims,
		requireAll,
		hasClaim,
		hasAnyClaim,
		hasAllClaims,
	});

	if (!hasPermission) {
		return fallback !== undefined ? <>{fallback}</> : <AccessDeniedPage />;
	}

	return children ? <>{children}</> : <Outlet />;
};
