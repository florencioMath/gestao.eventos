const MAPA_STATUS = {
	AGUARDANDO_REVISAO_DEPARTAMENTO: {
		rotulo: 'Aguardando revisão departamento',
		classe: 'bg-purple-600/10 text-purple-800',
	},
	AGUARDANDO_REVISAO_PATIO: {
		rotulo: 'Aguardando revisão pátio',
		classe: 'bg-indigo-600/10 text-indigo-800',
	},
	NO_PATIO: { rotulo: 'No pátio', classe: 'bg-blue-600/10 text-blue-800' },
	RETIRADO: { rotulo: 'Retirado', classe: 'bg-green-600/10 text-green-800' },
	RECUSADO_DEPARTAMENTO: {
		rotulo: 'Recusado pelo departamento',
		classe: 'bg-red-600/10 text-red-800',
	},
	DEVOLVIDO_PATIO: { rotulo: 'Devolvido pelo pátio', classe: 'bg-amber-600/10 text-amber-800' },
	PENDENTE: { rotulo: 'Pendente', classe: 'bg-yellow-600/10 text-yellow-800' },
	APROVADO: { rotulo: 'Aprovado', classe: 'bg-emerald-600/10 text-emerald-800' },
	CONCLUIDO: { rotulo: 'Concluído', classe: 'bg-teal-600/10 text-teal-800' },
	PRAZO_ENCERRADO: { rotulo: 'Prazo encerrado', classe: 'bg-orange-600/10 text-orange-800' },
	REPROVADO: {
		rotulo: 'Reprovado',
		classe: 'bg-red-600/10 text-red-800 p-1 px-2 rounded-lg',
	},
} as const;

const mapaRotulo: Record<string, string> = {};
const mapaClasse: Record<string, string> = {};

for (const [chave, { rotulo, classe }] of Object.entries(MAPA_STATUS)) {
	mapaRotulo[chave] = rotulo;
	mapaRotulo[rotulo] = rotulo;
	mapaClasse[chave] = classe;
	mapaClasse[rotulo] = classe;
}

/** Rótulo amigável para chave ou texto de status. */
export function obterRotuloStatusVeiculoRemovido(status: string): string {
	return mapaRotulo[status] ?? status;
}

/** @deprecated Use obterRotuloStatusVeiculoRemovido */
export const getVeiculoRemovidoStatusLabel = obterRotuloStatusVeiculoRemovido;

/** Classes Tailwind para o badge. */
export function obterClasseStatusVeiculoRemovido(status: string): string {
	return mapaClasse[status] ?? 'bg-muted text-muted-foreground';
}

/** @deprecated Use obterClasseStatusVeiculoRemovido */
export const getVeiculoRemovidoStatusClass = obterClasseStatusVeiculoRemovido;

/** Mapa chave → rótulo (útil para selects). */
export const STATUS_VEICULO_REMOVIDO = mapaRotulo as Record<string, string>;

/** @deprecated Use STATUS_VEICULO_REMOVIDO */
export const VEICULO_REMOVIDO_STATUS = STATUS_VEICULO_REMOVIDO;
