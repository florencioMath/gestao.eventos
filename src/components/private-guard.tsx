import { signInPath } from '@/features/auth/routes/sign-in/route';
import { useAuth } from '@/hooks/use-auth';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateGuard = ({ children }: { children?: React.ReactNode }) => {
	const { isAuthenticated, isLoading } = useAuth();

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

	if (!isAuthenticated) {
		return <Navigate to={signInPath} replace />;
	}

	return children ? <>{children}</> : <Outlet />;
};
