import {
	obterClasseStatusVeiculoRemovido,
	obterRotuloStatusVeiculoRemovido,
} from '@/lib/veiculo-removido-status';

type StatusBadgeVeiculoRemovidoProps = {
	status?: string;
};

export function StatusBadgeVeiculoRemovido({ status }: StatusBadgeVeiculoRemovidoProps) {
	const s = status ?? '—';
	const className = obterClasseStatusVeiculoRemovido(s);
	const label = obterRotuloStatusVeiculoRemovido(s);
	return (
		<span className={`inline-block p-1 px-2 rounded-lg text-xs font-medium ${className}`}>
			{label}
		</span>
	);
}
