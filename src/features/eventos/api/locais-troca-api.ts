import { api } from "@/lib/api";
import type { LocalTrocaDto, LocalTrocaSalvarPayload } from "@/features/eventos/types";

export class LocaisTrocaApi {
	static async listar(): Promise<LocalTrocaDto[]> {
		const { data } = await api.get<LocalTrocaDto[]>("/locais-troca");
		return data;
	}

	static async criar(payload: LocalTrocaSalvarPayload): Promise<LocalTrocaDto> {
		const { data } = await api.post<LocalTrocaDto>("/locais-troca", payload);
		return data;
	}

	static async atualizar(id: string, payload: LocalTrocaSalvarPayload): Promise<LocalTrocaDto> {
		const { data } = await api.put<LocalTrocaDto>(`/locais-troca/${id}`, payload);
		return data;
	}
}
