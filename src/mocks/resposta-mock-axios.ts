import type { InternalAxiosRequestConfig } from 'axios';

/**
 * Curto-circuita o axios com um adapter que devolve `handler()` como corpo 200.
 */
export function aplicarRespostaMockada(
	config: InternalAxiosRequestConfig,
	handler: () => unknown
): InternalAxiosRequestConfig {
	config.adapter = async () => {
		await new Promise((resolve) => setTimeout(resolve, 120 + Math.random() * 180));

		try {
			const data = await Promise.resolve(handler());

			return {
				data,
				status: 200,
				statusText: 'OK',
				headers: {},
				config,
			};
		} catch (error) {
			const err = error as { status?: number; message?: string };

			const axiosError = {
				response: {
					status: err.status ?? 500,
					data: { message: err.message ?? 'Erro interno do mock' },
					statusText: 'Error',
					headers: {},
					config,
				},
				config,
				isAxiosError: true,
				message: err.message ?? 'Mock error',
				name: 'AxiosError',
				toJSON: () => ({}),
			};

			return Promise.reject(axiosError);
		}
	};

	return config;
}
