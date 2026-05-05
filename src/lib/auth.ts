import { TOKEN_KEY } from '@/config';

/**
 * Helper para salvar o token no localStorage
 */
export const setAuthToken = (token: string) => {
	localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Helper para remover o token do localStorage
 */
export const removeAuthToken = () => {
	localStorage.removeItem(TOKEN_KEY);
};

/**
 * Helper para obter o token do localStorage
 */
export const getAuthToken = () => {
	return localStorage.getItem(TOKEN_KEY);
};
