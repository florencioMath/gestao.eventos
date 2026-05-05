import { PrivateGuard } from '@/components/private-guard';
import { RouteErrorBoundary } from '@/components/route-error-boundary';
import { HomeRedirect } from '@/components/home-redirect';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PrivateLayout } from '../layouts/private-layout';
import { PublicLayout } from '../layouts/public-layout';

import { authRoutes } from '@/features/auth';
import { eventosRoutes } from '@/features/eventos';
import { segurancaRoutes } from '@/features/seguranca';
// [generate:import]

export const router = createBrowserRouter([
	{
		path: '/',
		element: <HomeRedirect />,
	},

	// Rotas públicas (não requerem autenticação)
	{
		element: <PublicLayout />,
		errorElement: <RouteErrorBoundary />,
		children: [
			...authRoutes,
			// [generate:public-route]
		],
	},

	// Rotas privadas (requerem autenticação)
	{
		element: (
			<PrivateGuard>
				<PrivateLayout />
			</PrivateGuard>
		),
		errorElement: <RouteErrorBoundary />,
		children: [
			...eventosRoutes,
			...segurancaRoutes,
			// [generate:private-route]
		],
	},

	// Rota 404 - redireciona para home
	{
		path: '*',
		element: <Navigate to='/entrar' replace />,
	},
]);
