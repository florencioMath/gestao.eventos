import { USER_KEY } from '@/config';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { AuthContext } from './auth-context';
import type { AuthContextValue, AuthState, User } from './types';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, setState] = useState<AuthState>({
		user: null,
		token: null,
		isAuthenticated: false,
		isLoading: true,
	});

	useEffect(() => {
		const initAuth = () => {
			const token = getAuthToken();
			const userJson = localStorage.getItem(USER_KEY);

			if (token && userJson) {
				try {
					const parsed = JSON.parse(userJson) as User;

					const user: User = {
						...parsed,
						claims: Array.isArray(parsed.claims) ? parsed.claims : [],
						profile: parsed.profile ?? { id: '', name: '' },
						funcionalidades: Array.isArray(parsed.funcionalidades) ? parsed.funcionalidades : [],
					};

					setState({
						user,
						token,
						isAuthenticated: true,
						isLoading: false,
					});
				} catch {
					removeAuthToken();
					localStorage.removeItem(USER_KEY);
					setState({
						user: null,
						token: null,
						isAuthenticated: false,
						isLoading: false,
					});
				}
			} else {
				setState({
					user: null,
					token: null,
					isAuthenticated: false,
					isLoading: false,
				});
			}
		};

		initAuth();
	}, []);

	const login = (token: string, user: User) => {
		setAuthToken(token);
		localStorage.setItem(USER_KEY, JSON.stringify(user));

		setState({
			user,
			token,
			isAuthenticated: true,
			isLoading: false,
		});
	};

	const logout = () => {
		removeAuthToken();
		localStorage.removeItem(USER_KEY);

		setState({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,
		});
	};

	const value: AuthContextValue = {
		...state,
		login,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
