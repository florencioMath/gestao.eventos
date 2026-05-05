import { api } from '@/lib/api';

export class FuncionalidadeService {
	static async listarGrupos(): Promise<GrupoFuncionalidade[]> {
		const response = await api.get<GrupoFuncionalidade[]>('/seguranca/funcionalidades');
		return response.data;
	}

	static async salvarTudo(grupos: GrupoFuncionalidade[]): Promise<void> {
		await api.put('/seguranca/funcionalidades', grupos);
	}
}
