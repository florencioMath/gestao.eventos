import { apiSilent } from '@/lib/api';

/** Resposta dos endpoints de endereço (CEP e busca por logradouro). */
export interface EnderecoApiDto {
	id: string;
	city: string;
	isOfficialAddress: boolean;
	lat: string;
	longitude: string;
	neighborhood: string;
	region: string;
	source: string;
	state: string;
	street: string;
	zipcode: string;
}

export interface EnderecoResumido {
	logradouro: string;
	bairro: string;
	cidade: string;
	uf: string;
}

/** Se `VITE_ENDERECO_CIDADE_FILTRO` e `VITE_ENDERECO_UF_FILTRO` estiverem definidos, restringe endereços a esse município. */
export function obterFiltroGeograficoAtivo(): { cidade: string; uf: string } | null {
	const cidade = import.meta.env.VITE_ENDERECO_CIDADE_FILTRO?.trim();
	const uf = import.meta.env.VITE_ENDERECO_UF_FILTRO?.trim();
	if (cidade && uf) return { cidade, uf };
	return null;
}

export function enderecoDentroDoFiltroGeografico(cidade: string, uf: string): boolean {
	const f = obterFiltroGeograficoAtivo();
	if (!f) return true;
	return (
		cidade.trim().toUpperCase() === f.cidade.toUpperCase() &&
		uf.trim().toUpperCase() === f.uf.toUpperCase()
	);
}

function validarFiltroOpcional(cidade: string, uf: string): void {
	const f = obterFiltroGeograficoAtivo();
	if (!f) return;
	if (!enderecoDentroDoFiltroGeografico(cidade, uf)) {
		throw new Error(`O endereço não pertence a ${f.cidade}/${f.uf}.`);
	}
}

function isEnderecoDtoLike(item: unknown): item is EnderecoApiDto {
	if (item === null || typeof item !== 'object') return false;
	const o = item as Record<string, unknown>;
	return (
		'id' in o ||
		typeof o.zipcode === 'string' ||
		typeof o.street === 'string'
	);
}

function normalizarListaEnderecos(payload: unknown): EnderecoApiDto[] {
	const extrair = (arr: unknown[]): EnderecoApiDto[] => arr.filter(isEnderecoDtoLike);

	if (Array.isArray(payload)) return extrair(payload);
	if (payload && typeof payload === 'object') {
		const o = payload as Record<string, unknown>;
		for (const key of [
			'data',
			'content',
			'results',
			'items',
			'body',
			'enderecos',
			'lista',
			'value',
		]) {
			const v = o[key];
			if (Array.isArray(v)) return extrair(v);
		}
		const embedded = o._embedded;
		if (embedded && typeof embedded === 'object') {
			for (const v of Object.values(embedded as Record<string, unknown>)) {
				if (Array.isArray(v)) return extrair(v);
			}
		}
	}
	return [];
}

function normalizarEnderecoUnico(payload: unknown): EnderecoApiDto | null {
	if (!payload || typeof payload !== 'object') return null;
	if (isEnderecoDtoLike(payload)) return payload;
	const o = payload as Record<string, unknown>;
	for (const key of ['data', 'result', 'content', 'body', 'value']) {
		const v = o[key];
		if (v && typeof v === 'object' && isEnderecoDtoLike(v)) return v;
	}
	return null;
}

/** Formato único para linhas de opção: CEP - Logradouro, Bairro, Cidade - UF */
export function formatarLinhaOpcaoEndereco(e: {
	zipcode?: string;
	street?: string;
	neighborhood?: string;
	city?: string;
	state?: string;
}): string {
	const digits = (e.zipcode || '').replace(/\D/g, '');
	const cepFmt =
		digits.length === 8
			? `${digits.slice(0, 5)}-${digits.slice(5)}`
			: (e.zipcode?.trim() || '—');
	const logr = (e.street || '—').toUpperCase();
	const bairro = (e.neighborhood || '—').toUpperCase();
	const cidade = e.city || '—';
	const uf = e.state || '—';
	return `${cepFmt} - ${logr}, ${bairro}, ${cidade} - ${uf}`;
}

export class EnderecoService {
	/** GET /endereco/buscar-por-cep/{cep} */
	static async buscarPorCepDetalhado(cepDigits: string): Promise<EnderecoApiDto> {
		const { data } = await apiSilent.get<unknown>(
			`/endereco/buscar-por-cep/${encodeURIComponent(cepDigits)}`
		);
		const item = normalizarEnderecoUnico(data);
		if (!item) throw new Error('CEP não encontrado ou indisponível');
		validarFiltroOpcional(item.city, item.state);
		return item;
	}

	/** POST /endereco/buscar-por-logradouro */
	static async buscarPorLogradouro(
		logradouro: string,
		cidade: string,
		uf: string
	): Promise<EnderecoApiDto[]> {
		const { data } = await apiSilent.post<unknown>('/endereco/buscar-por-logradouro', {
			logradouro: logradouro.trim(),
			cidade: cidade.trim(),
			uf: uf.trim().toUpperCase(),
		});
		const lista = normalizarListaEnderecos(data);
		const f = obterFiltroGeograficoAtivo();
		if (!f) return lista;
		return lista.filter((item) => enderecoDentroDoFiltroGeografico(item.city, item.state));
	}

	static async buscarPorCep(cepDigits: string): Promise<EnderecoResumido> {
		const d = await this.buscarPorCepDetalhado(cepDigits);
		return {
			logradouro: d.street || '',
			bairro: d.neighborhood || '',
			cidade: d.city || '',
			uf: d.state || '',
		};
	}
}
