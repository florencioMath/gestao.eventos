import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** Remove todos os caracteres não numéricos (para enviar CPF, telefone etc. à API) */
export function onlyDigits(value: string): string {
	return value.replace(/\D/g, '');
}

export function maskCPF(value: string) {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d{1,2})/, '$1-$2')
		.replace(/(-\d{2})\d+?$/, '$1');
}

export function maskPhone(value: string) {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{2})(\d)/, '($1) $2')
		.replace(/(\d{5})(\d)/, '$1-$2')
		.replace(/(-\d{4})\d+?$/, '$1');
}

export function maskCNPJ(value: string) {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{2})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1/$2')
		.replace(/(\d{4})(\d{1,2})/, '$1-$2')
		.replace(/(-\d{2})\d+?$/, '$1');
}

export function maskCEP(value: string) {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{5})(\d)/, '$1-$2')
		.replace(/(-\d{3})\d+?$/, '$1');
}

export function maskCurrency(value: string): string {
	let digits = value.replace(/\D/g, '');
	digits = digits.replace(/^0+/, '') || '0';
	digits = digits.padStart(3, '0');

	const integerPart = digits.slice(0, -2);
	const decimalPart = digits.slice(-2);
	const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

	return `${formattedInteger},${decimalPart}`;
}

export function maskBRL(value: string | number): string {
	const numeric = typeof value === 'number' ? value : parseFloat(value);

	if (isNaN(numeric)) return '0,00';

	return numeric.toLocaleString('pt-BR', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function maskDate(value: string) {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{2})(\d)/, '$1/$2')
		.replace(/(\d{2})(\d)/, '$1/$2')
		.replace(/(\/\d{4})\d+?$/, '$1');
}

const IGNORED_WORDS = new Set([
	'de',
	'do',
	'da',
	'dos',
	'das',
	'em',
	'no',
	'na',
	'nos',
	'nas',
	'a',
	'ao',
	'à',
	'aos',
	'às',
	'e',
	'ou',
	'que',
	'por',
	'para',
	'com',
	'sem',
	'sob',
	'sobre',
]);

export function toTitleCase(str: string | null | undefined): string {
	if (!str) return '';
	return str
		.toLowerCase()
		.split(' ')
		.map((word, index) =>
			index === 0 || !IGNORED_WORDS.has(word)
				? word.charAt(0).toUpperCase() + word.slice(1)
				: word
		)
		.join(' ');
}

export function getApiError(error: unknown, fallback: string): string {
	if (error instanceof Response) return fallback;
	if (error && typeof error === 'object' && 'response' in error) {
		const err = error as { response?: { data?: { message?: string } } };
		return err.response?.data?.message ?? fallback;
	}
	return fallback;
}
