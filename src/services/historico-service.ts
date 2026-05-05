import { api } from '@/lib/api';

/**
 * Busca genérica de histórico. Informe o caminho completo da API (ex.: `/eventos/123/historico`).
 * Espera array de {@link HistoricoItem} no formato do backend.
 */
export class HistoricoService {
	static async listar(caminho: string): Promise<HistoricoItem[]> {
		const { data } = await api.get<HistoricoItem[]>(caminho);
		return Array.isArray(data) ? data : [];
	}
}
