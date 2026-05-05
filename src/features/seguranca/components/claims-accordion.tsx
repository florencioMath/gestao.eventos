import { Button } from '@/components/base/button';
import { Card, CardContent } from '@/components/base/card';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

type ClaimsAccordionProps = {
	grupos: GrupoFuncionalidade[];
	selectedClaims: Set<string>;
	onToggle: (claim: string) => void;
	onCheckAllGroup: (group: GrupoFuncionalidade) => void;
	isGroupAllChecked: (group: GrupoFuncionalidade) => boolean;
};

export function ClaimsAccordion({
	grupos,
	selectedClaims,
	onToggle,
	onCheckAllGroup,
	isGroupAllChecked,
}: ClaimsAccordionProps) {
	const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

	const toggleGroup = (id: string) => {
		setOpenGroups((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	return (
		<div className='space-y-2'>
			<h2 className='text-lg font-semibold'>Funcionalidades</h2>

			<div className='space-y-3'>
				{grupos.map((group) => {
					const isOpen = openGroups.has(group.id);
					const allChecked = isGroupAllChecked(group);

					return (
						<div
							key={group.id}
							className='border rounded-lg overflow-hidden'>
							<button
								type='button'
								onClick={() => toggleGroup(group.id)}
								className='flex items-center justify-between w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors'>
								<span className='font-medium'>{group.nome}</span>
								<ChevronDown
									className={`h-4 w-4 text-muted-foreground transition-transform ${
										isOpen ? 'rotate-180' : ''
									}`}
								/>
							</button>

							{isOpen && (
								<div className='px-4 pb-4 border-t'>
									<div className='flex justify-end pt-3 pb-2'>
										<Button
											variant={allChecked ? 'outline' : 'default'}
											size='sm'
											onClick={() => onCheckAllGroup(group)}>
											<Check className='h-3.5 w-3.5 mr-1.5' />
											{allChecked ? 'Desmarcar todos' : 'Marcar todos'}
										</Button>
									</div>

									<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
										{group.features.map((feature) => (
											<FeatureCard
												key={feature.id}
												feature={feature}
												selectedClaims={selectedClaims}
												onToggle={onToggle}
											/>
										))}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function FeatureCard({
	feature,
	selectedClaims,
	onToggle,
}: {
	feature: FeatureFuncionalidade;
	selectedClaims: Set<string>;
	onToggle: (claim: string) => void;
}) {
	return (
		<Card>
			<CardContent className='pt-4 pb-3 px-4'>
				<div className='flex items-center gap-2 mb-3'>
					<span className='text-sm font-semibold'>{feature.label}</span>
				</div>
				<div className='space-y-2'>
					{feature.claims.map((claim) => (
						<label
							key={claim.id}
							className='flex items-center gap-2 cursor-pointer group'>
							<input
								type='checkbox'
								checked={selectedClaims.has(claim.value)}
								onChange={() => onToggle(claim.value)}
								className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer'
							/>
							<span className='text-sm text-muted-foreground group-hover:text-foreground transition-colors'>
								{claim.label}
							</span>
						</label>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
