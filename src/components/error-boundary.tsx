import { Component, type ReactNode } from 'react';
import { Button } from './base/button';

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.error('Error capturado pelo Error Boundary:', error, errorInfo);

		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	handleReset = (): void => {
		this.setState({
			hasError: false,
			error: null,
		});
	};

	render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
					<div className='max-w-md w-full text-center'>
						<div className='mb-8'>
							<div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
								<svg
									className='w-8 h-8 text-red-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
									/>
								</svg>
							</div>
							<h1 className='text-2xl font-bold text-gray-900 mb-2'>
								Algo deu errado
							</h1>
							<p className='text-gray-600 mb-6'>
								Desculpe, ocorreu um erro inesperado. Nossa equipe já foi
								notificada.
							</p>
						</div>

						{import.meta.env.DEV && this.state.error && (
							<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left'>
								<p className='text-sm font-semibold text-red-800 mb-2'>
									Detalhes do erro (apenas em desenvolvimento):
								</p>
								<p className='text-xs text-red-700 font-mono break-all'>
									{this.state.error.toString()}
								</p>
								{this.state.error.stack && (
									<details className='mt-2'>
										<summary className='text-xs text-red-600 cursor-pointer hover:text-red-700'>
											Ver stack trace
										</summary>
										<pre className='mt-2 text-xs text-red-700 overflow-auto max-h-48'>
											{this.state.error.stack}
										</pre>
									</details>
								)}
							</div>
						)}

						<div className='flex flex-col sm:flex-row gap-3 justify-center'>
							<Button
								onClick={this.handleReset}
								className='px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors'>
								Tentar novamente
							</Button>
							<Button
								onClick={() => (window.location.href = import.meta.env.BASE_URL)}
								className='px-6 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors'>
								Voltar para home
							</Button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
