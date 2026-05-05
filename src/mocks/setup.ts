import { api, apiPublic, apiPublicSilent, apiSilent } from '@/lib/api';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { aplicarRespostaMockada } from './resposta-mock-axios';
import { registrarMocksApiSeguranca } from './seguranca-mock-api';
import { MOCK_PASSWORD, MOCK_USERS } from './users';

/**
 * Habilita interceptadores de mock nas instâncias axios.
 *
 * - Login: `apiPublic` e `apiPublicSilent` (AuthService usa silent).
 * - Segurança e endereço: `api` e `apiSilent` (ex.: `EnderecoService` usa silent).
 *
 * Ativado por: VITE_MOCK_API=true (ou 1 / yes)
 */
export function enableMocks() {
	const registrarMockLogin = (cliente: AxiosInstance) => {
		cliente.interceptors.request.use((config: InternalAxiosRequestConfig) => {
			if (config.url?.includes('/auth/login') && config.method === 'post') {
				const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
				const { login, senha } = body as { login: string; senha: string };

				return aplicarRespostaMockada(config, () => {
					const mockUser = MOCK_USERS[login.toLowerCase()];

					if (!mockUser || senha !== MOCK_PASSWORD) {
						throw { status: 401, message: 'Email ou senha incorretos.' };
					}
					return mockUser;
				});
			}

			return config;
		});
	};

	registrarMockLogin(apiPublic);
	registrarMockLogin(apiPublicSilent);
	registrarMocksApiSeguranca(api, apiSilent);
}
