/**
 * URL base da API: usa exatamente `VITE_API_BASE` (ex.: http://localhost:8080/api).
 * O backend precisa liberar CORS para a origem do front quando a URL for absoluta.
 */
export function getResolvedApiBaseUrl(): string {
	const raw = import.meta.env.VITE_API_BASE as string | undefined;
	const trimmed = raw?.trim().replace(/^["']|["']$/g, '') ?? '';
	const fallbackProd = 'http://localhost:3000/api';
	const devFallback = 'http://localhost:8080/api';

	if (!trimmed) {
		return import.meta.env.DEV ? devFallback : fallbackProd;
	}

	return trimmed;
}
