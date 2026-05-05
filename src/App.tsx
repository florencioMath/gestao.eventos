import { AuthProvider } from '@/hooks/use-auth';
import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from './components/providers/toast-provider';
import { router } from './routes';

function App() {
	return (
		<AuthProvider>
			<ToastProvider />
			<RouterProvider router={router} />
		</AuthProvider>
	);
}

export default App;
