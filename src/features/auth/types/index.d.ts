type SignInRequest = {
	login: string;
	senha: string;
};

type SignInResponse = {
	token: string;
	user: {
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
};

type SendWhatsAppCodeResponse = {
	telefoneMascarado: string;
	mensagem: string;
};
