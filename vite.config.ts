import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	/** Destino do backend local (requisições /demutran-ws/* são encaminhadas aqui) */
	const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080';

	return {
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
				'@/features': path.resolve(__dirname, './src/features'),
				'@/lib': path.resolve(__dirname, './src/lib'),
			},
		},
		server: {
			proxy: {
				'/demutran-ws': {
					target: proxyTarget,
					changeOrigin: true,
				},
			},
		},
	};
});
