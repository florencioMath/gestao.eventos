import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AccessDeniedPage = () => {
	return (
		<div className='flex min-h-[60vh] flex-col items-center justify-center text-center'>
			<ShieldX className='h-16 w-16 text-destructive mb-4' />

			<h1 className='text-3xl font-bold text-gray-900 mb-2'>Acesso Negado</h1>

			<p className='text-gray-600 mb-6 max-w-md'>
				Você não tem permissão para acessar esta página. Entre em contato com o
				administrador caso acredite que isso seja um erro.
			</p>

			<Link
				to={'/'}
				className='inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors'>
				Voltar para o início
			</Link>
		</div>
	);
};
