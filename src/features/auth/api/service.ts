import { apiPublicSilent } from '@/lib/api';

export class AuthService {
	static async signIn(data: SignInRequest): Promise<SignInResponse> {
		const payload = { ...data, ambiente: 'GESTAO' };
		const response = await apiPublicSilent.post<SignInResponse>('/auth/login', payload);
		return response.data;
	}

	static async sendWhatsAppCode(data: { login: string }): Promise<SendWhatsAppCodeResponse> {
		const payload = { ...data };
		const response = await apiPublicSilent.post<SendWhatsAppCodeResponse>(
			'/auth/enviar-codigo',
			payload
		);
		return response.data;
	}

	static async signInWithWhatsApp(data: {
		login: string;
		codigo: string;
	}): Promise<SignInResponse> {
		const payload = { ...data, ambiente: 'GESTAO' };
		const response = await apiPublicSilent.post<SignInResponse>('/auth/login-codigo', payload);
		return response.data;
	}
}
