import { api } from '@/lib/api';

interface Dominio {
	id: number;
	descricao: string;
}

export class DominioService {
	static async getTiposExecucao(): Promise<Dominio[]> {
		const { data } = await api.get<Dominio[]>('/dominios/tipos-execucao');
		return data;
	}

	static async getRemovidoPor(): Promise<Dominio[]> {
		const { data } = await api.get<Dominio[]>('/dominios/removido-por');
		return data;
	}
}
