/**
 * Consulta de CEP (Brasil) — base reutilizável.
 * Por padrão usa a API pública ViaCEP (sem chave).
 */

export type EnderecoPorCep = {
	cep: string;
	logradouro: string;
	complemento: string;
	bairro: string;
	cidade: string;
	uf: string;
	ibge?: string;
};

export function normalizarCep(valor: string): string {
	return valor.replace(/\D/g, '').slice(0, 8);
}

export function formatarCepExibicao(digitos: string): string {
	const d = normalizarCep(digitos);
	if (d.length <= 5) return d;
	return `${d.slice(0, 5)}-${d.slice(5)}`;
}

type RespostaViaCep = {
	erro?: boolean;
	cep?: string;
	logradouro?: string;
	complemento?: string;
	bairro?: string;
	localidade?: string;
	uf?: string;
	ibge?: string;
};

function mapearViaCep(json: RespostaViaCep): EnderecoPorCep | null {
	if (json.erro || !json.cep) return null;
	const cepLimpo = normalizarCep(json.cep);
	return {
		cep: formatarCepExibicao(cepLimpo),
		logradouro: json.logradouro ?? '',
		complemento: json.complemento ?? '',
		bairro: json.bairro ?? '',
		cidade: json.localidade ?? '',
		uf: (json.uf ?? '').toUpperCase(),
		ibge: json.ibge,
	};
}

/**
 * Busca endereço pelo CEP (8 dígitos). Falha com Error em rede ou CEP inválido.
 */
export async function buscarEnderecoPorCep(cepBruto: string): Promise<EnderecoPorCep> {
	const cep = normalizarCep(cepBruto);
	if (cep.length !== 8) {
		throw new Error('Informe um CEP com 8 dígitos.');
	}

	const url = `https://viacep.com.br/ws/${cep}/json/`;
	const resposta = await fetch(url);
	if (!resposta.ok) {
		throw new Error('Não foi possível consultar o CEP. Tente novamente.');
	}

	const json = (await resposta.json()) as RespostaViaCep;
	const endereco = mapearViaCep(json);
	if (!endereco) {
		throw new Error('CEP não encontrado.');
	}
	return endereco;
}
