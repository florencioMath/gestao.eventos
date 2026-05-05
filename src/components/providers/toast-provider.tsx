import { Toaster } from 'sonner';

export const ToastProvider = () => {
	return (
		<Toaster
			position='top-right'
			expand={false}
			richColors
			closeButton
			duration={4000}
			toastOptions={{
				className: 'bg-white border border-gray-200 text-gray-900 shadow-lg',
				descriptionClassName: 'text-gray-600',
			}}
		/>
	);
};
