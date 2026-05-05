export type Profile = {
	id: string;
	name: string;
};

export type User = {
	claims: string[];
	email: string;
	id: string;
	name: string;
	profile: {
		id: string;
		name: string;
	};
	funcionalidades: GrupoFuncionalidade[];
};

export type AuthState = {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
};

export type AuthContextValue = AuthState & {
	login: (token: string, user: User) => void;
	logout: () => void;
};
