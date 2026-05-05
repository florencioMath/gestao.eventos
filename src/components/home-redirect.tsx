import { resolveHomeRoute } from '@/config/feature-routes';
import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';

export function HomeRedirect() {
	const { user, isAuthenticated, isLoading } = useAuth();

	if (isLoading) return null;

	if (!isAuthenticated || !user) {
		return <Navigate to='/entrar' replace />;
	}

	return <Navigate to={resolveHomeRoute(user.funcionalidades)} replace />;
}
