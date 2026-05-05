import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/error-boundary.tsx';
import './index.css';

async function init() {
	// Habilita mocks de API (Vite só injeta strings; aceita true/1/yes case-insensitive)
	const mockApi = String(import.meta.env.VITE_MOCK_API ?? '').toLowerCase();
	if (mockApi === 'true' || mockApi === '1' || mockApi === 'yes') {
		const { enableMocks } = await import('./mocks/setup.ts');
		enableMocks();
	}

	createRoot(document.getElementById('root')!).render(
		<StrictMode>
			<ErrorBoundary>
				<App />
			</ErrorBoundary>
		</StrictMode>
	);
}

init();
