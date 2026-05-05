import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

export const RouteErrorBoundary = () => {
	const error = useRouteError();
	const navigate = useNavigate();

	let errorMessage: string;
	let errorStatus: number | undefined;

	if (isRouteErrorResponse(error)) {
		errorStatus = error.status;
		errorMessage = error.statusText || error.data?.message || 'Erro desconhecido';
	} else if (error instanceof Error) {
		errorMessage = error.message;
	} else {
		errorMessage = 'Erro desconhecido';
	}

	const is404 = errorStatus === 404;

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='max-w-md w-full text-center'>
				<div className='mb-8'>
					<div className='inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4'>
						{is404 ? (
							<span className='text-4xl font-bold text-blue-600'>404</span>
						) : (
							<svg
								className='w-10 h-10 text-blue-600'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
						)}
					</div>
					<h1 className='text-2xl font-bold text-gray-900 mb-2'>
						{is404 ? 'Página não encontrada' : 'Erro na navegação'}
					</h1>
					<p className='text-gray-600 mb-6'>
						{is404
							? 'A página que você está procurando não existe ou foi movida.'
							: 'Ocorreu um erro ao carregar esta página.'}
					</p>
				</div>

				{import.meta.env.DEV && (
					<div className='mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left'>
						<p className='text-sm font-semibold text-yellow-800 mb-2'>
							Detalhes do erro (apenas em desenvolvimento):
						</p>
						<p className='text-xs text-yellow-700 font-mono break-all'>
							{errorMessage}
						</p>
						{error instanceof Error && error.stack && (
							<details className='mt-2'>
								<summary className='text-xs text-yellow-600 cursor-pointer hover:text-yellow-700'>
									Ver stack trace
								</summary>
								<pre className='mt-2 text-xs text-yellow-700 overflow-auto max-h-48'>
									{error.stack}
								</pre>
							</details>
						)}
					</div>
				)}

				<div className='flex flex-col sm:flex-row gap-3 justify-center'>
					<button
						onClick={() => navigate(-1)}
						className='px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors'>
						Voltar
					</button>
					<button
						onClick={() => navigate('/')}
						className='px-6 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors'>
						Ir para home
					</button>
				</div>
			</div>
		</div>
	);
};
