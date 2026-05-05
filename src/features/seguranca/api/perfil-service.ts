import { api } from '@/lib/api';

export class PerfilService {
	static async getPerfis(): Promise<Perfil[]> {
		const response = await api.get<Perfil[]>('/seguranca/perfis');
		return response.data;
	}

	static async getPerfilById(id: string): Promise<Perfil | undefined> {
		const perfis = await this.getPerfis();
		return perfis.find((p) => p.id === id);
	}

	static async getPermissoes(id: string): Promise<GrupoFuncionalidade[]> {
		const response = await api.get<GrupoFuncionalidade[]>(`/seguranca/perfis/${id}/permissoes`);
		return response.data;
	}

	static async criarPerfil(
		name: string,
		funcionalidades: GrupoFuncionalidade[]
	): Promise<{ id: string }> {
		const response = await api.post<{ id: string }>('/seguranca/perfis', { name });
		const { id } = response.data;

		if (funcionalidades.length > 0) {
			await this.atualizarPerfil(id, name, funcionalidades);
		}

		return { id };
	}

	static async excluirPerfil(id: string): Promise<void> {
		await api.delete(`/seguranca/perfis/${id}`);
	}

	static async atualizarPerfil(
		id: string,
		nome: string,
		funcionalidades: GrupoFuncionalidade[]
	): Promise<void> {
		await api.put('/seguranca/perfis/permissoes', { id, nome, funcionalidades });
	}
}
