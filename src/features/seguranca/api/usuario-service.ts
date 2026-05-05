import { api } from '@/lib/api';

export class UsuarioService {
	static async getUsuariosPaginado(
		page: number,
		pageSize: number,
		term?: string
	): Promise<PaginatedUsuarioResponse> {
		const params: Record<string, string | number> = {
			page: page + 1,
			pageSize,
		};
		if (term) params.term = term;

		const response = await api.get<PaginatedUsuarioResponse>('/seguranca/usuarios', { params });
		return response.data;
	}

	// TODO: integrar com endpoint real
	static async getUsuario(id: string): Promise<Usuario | undefined> {
		const response = await api.get<Usuario>(`/seguranca/usuarios/${id}`);
		return response.data;
	}

	static async getPerfis(): Promise<PerfilOption[]> {
		const response = await api.get<PerfilOption[]>('/seguranca/perfis');
		return response.data;
	}

	static async getUnidades(): Promise<UnidadeOption[]> {
		const response = await api.get<UnidadeOption[]>('/dominios/unidades');
		return response.data;
	}

	static async criarUsuario(data: UsuarioFormData): Promise<{ id: string }> {
		const response = await api.post<{ id: string }>('/seguranca/usuarios', data);
		return response.data;
	}

	static async editarUsuario(id: string, data: Partial<UsuarioFormData>): Promise<void> {
		await api.put('/seguranca/usuarios', {
			id,
			displayName: data.displayName,
			email: data.email,
			emailSecundario: data.emailSecundario,
			perfilId: data.perfilId,
			unidadeId: data.unidadeId,
			status: data.status,
			telefone: data.telefone,
		});
	}
}
