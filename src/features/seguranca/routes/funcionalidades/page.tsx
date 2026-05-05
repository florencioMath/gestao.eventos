import { Button } from '@/components/base/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/base/dialog';
import { Input } from '@/components/base/input';
import { Label } from '@/components/base/label';
import { ArrowDown, ArrowUp, ChevronDown, Edit, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FuncionalidadeService } from '../../api/funcionalidade-service';

type DialogType =
	| { kind: 'grupo'; mode: 'criar' }
	| { kind: 'grupo'; mode: 'editar'; grupoId: string; nome: string }
	| { kind: 'feature'; mode: 'criar'; grupoId: string }
	| {
			kind: 'feature';
			mode: 'editar';
			grupoId: string;
			featureId: string;
			key: string;
			label: string;
	  }
	| { kind: 'claim'; mode: 'criar'; grupoId: string; featureId: string }
	| {
			kind: 'claim';
			mode: 'editar';
			grupoId: string;
			featureId: string;
			claimId: string;
			value: string;
			label: string;
	  }
	| null;

type DeleteTarget =
	| { kind: 'grupo'; grupoId: string; label: string }
	| { kind: 'feature'; grupoId: string; featureId: string; label: string }
	| { kind: 'claim'; grupoId: string; featureId: string; claimId: string; label: string }
	| null;

export function FuncionalidadesPage() {
	const hasFetched = useRef(false);
	const [grupos, setGrupos] = useState<GrupoFuncionalidade[]>([]);
	const [loading, setLoading] = useState(true);
	const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
	const [openFeatures, setOpenFeatures] = useState<Set<string>>(new Set());

	const [dialog, setDialog] = useState<DialogType>(null);

	const [formNome, setFormNome] = useState('');
	const [formKey, setFormKey] = useState('');
	const [formLabel, setFormLabel] = useState('');
	const [formValue, setFormValue] = useState('');

	const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
	const [savingAll, setSavingAll] = useState(false);

	const loadData = async () => {
		setLoading(true);
		try {
			const data = await FuncionalidadeService.listarGrupos();
			setGrupos(data);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (hasFetched.current) return;
		hasFetched.current = true;
		loadData();
	}, []);

	const toggleGroup = (id: string) => {
		setOpenGroups((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleFeature = (id: string) => {
		setOpenFeatures((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	// --- Reorder helpers ---

	function swap<T>(arr: T[], i: number, j: number): T[] {
		const copy = [...arr];
		[copy[i], copy[j]] = [copy[j], copy[i]];
		return copy;
	}

	const moveGrupo = (index: number, dir: -1 | 1) => {
		const target = index + dir;
		if (target < 0 || target >= grupos.length) return;
		setGrupos((prev) => swap(prev, index, target));
	};

	const moveFeature = (grupoId: string, index: number, dir: -1 | 1) => {
		setGrupos((prev) =>
			prev.map((g) => {
				if (g.id !== grupoId) return g;
				const target = index + dir;
				if (target < 0 || target >= g.features.length) return g;
				return { ...g, features: swap(g.features, index, target) };
			})
		);
	};

	const moveClaim = (grupoId: string, featureId: string, index: number, dir: -1 | 1) => {
		setGrupos((prev) =>
			prev.map((g) => {
				if (g.id !== grupoId) return g;
				return {
					...g,
					features: g.features.map((f) => {
						if (f.id !== featureId) return f;
						const target = index + dir;
						if (target < 0 || target >= f.claims.length) return f;
						return { ...f, claims: swap(f.claims, index, target) };
					}),
				};
			})
		);
	};

	// --- Dialog open helpers ---

	const openGrupoCreate = () => {
		setFormNome('');
		setDialog({ kind: 'grupo', mode: 'criar' });
	};

	const openGrupoEdit = (grupo: GrupoFuncionalidade) => {
		setFormNome(grupo.nome);
		setDialog({ kind: 'grupo', mode: 'editar', grupoId: grupo.id, nome: grupo.nome });
	};

	const openFeatureCreate = (grupoId: string) => {
		setFormKey('');
		setFormLabel('');
		setDialog({ kind: 'feature', mode: 'criar', grupoId });
	};

	const openFeatureEdit = (grupoId: string, feature: FeatureFuncionalidade) => {
		setFormKey(feature.key);
		setFormLabel(feature.label);
		setDialog({
			kind: 'feature',
			mode: 'editar',
			grupoId,
			featureId: feature.id,
			key: feature.key,
			label: feature.label,
		});
	};

	const openClaimCreate = (grupoId: string, featureId: string) => {
		setFormValue('');
		setFormLabel('');
		setDialog({ kind: 'claim', mode: 'criar', grupoId, featureId });
	};

	const openClaimEdit = (grupoId: string, featureId: string, claim: ClaimFuncionalidade) => {
		setFormValue(claim.value);
		setFormLabel(claim.label);
		setDialog({
			kind: 'claim',
			mode: 'editar',
			grupoId,
			featureId,
			claimId: claim.id,
			value: claim.value,
			label: claim.label,
		});
	};

	// --- Save (local state) ---

	const handleSave = () => {
		if (!dialog) return;

		switch (dialog.kind) {
			case 'grupo': {
				if (!formNome.trim()) {
					toast.error('Nome da funcionalidade é obrigatório');
					return;
				}
				if (dialog.mode === 'criar') {
					const novoGrupo: GrupoFuncionalidade = {
						id: crypto.randomUUID(),
						nome: formNome.trim(),
						features: [],
					};
					setGrupos((prev) => [...prev, novoGrupo]);
					toast.success('Funcionalidade criada!');
				} else {
					setGrupos((prev) =>
						prev.map((g) =>
							g.id === dialog.grupoId ? { ...g, nome: formNome.trim() } : g
						)
					);
					toast.success('Funcionalidade atualizada!');
				}
				break;
			}
			case 'feature': {
				if (!formKey.trim()) {
					toast.error('Chave da feature é obrigatória');
					return;
				}
				if (!formLabel.trim()) {
					toast.error('Nome da feature é obrigatório');
					return;
				}
				if (dialog.mode === 'criar') {
					const key = formKey.trim();
					const featureId = crypto.randomUUID();
					const novaFeature: FeatureFuncionalidade = {
						id: featureId,
						key,
						label: formLabel.trim(),
						claims: [
							{ id: crypto.randomUUID(), value: `${key}.view`, label: 'Visualizar' },
							{ id: crypto.randomUUID(), value: `${key}.create`, label: 'Cadastrar' },
							{ id: crypto.randomUUID(), value: `${key}.edit`, label: 'Editar' },
							{ id: crypto.randomUUID(), value: `${key}.delete`, label: 'Excluir' },
						],
					};
					setGrupos((prev) =>
						prev.map((g) =>
							g.id === dialog.grupoId
								? { ...g, features: [...g.features, novaFeature] }
								: g
						)
					);
					setOpenFeatures((prev) => new Set(prev).add(featureId));
					toast.success('Feature criada!');
				} else {
					setGrupos((prev) =>
						prev.map((g) =>
							g.id === dialog.grupoId
								? {
										...g,
										features: g.features.map((f) =>
											f.id === dialog.featureId
												? {
														...f,
														key: formKey.trim(),
														label: formLabel.trim(),
													}
												: f
										),
									}
								: g
						)
					);
					toast.success('Feature atualizada!');
				}
				break;
			}
			case 'claim': {
				if (!formValue.trim()) {
					toast.error('Valor da claim é obrigatório');
					return;
				}
				if (!formLabel.trim()) {
					toast.error('Rótulo da claim é obrigatório');
					return;
				}
				if (dialog.mode === 'criar') {
					const novaClaim: ClaimFuncionalidade = {
						id: crypto.randomUUID(),
						value: formValue.trim(),
						label: formLabel.trim(),
					};
					setGrupos((prev) =>
						prev.map((g) =>
							g.id === dialog.grupoId
								? {
										...g,
										features: g.features.map((f) =>
											f.id === dialog.featureId
												? { ...f, claims: [...f.claims, novaClaim] }
												: f
										),
									}
								: g
						)
					);
					toast.success('Claim criada!');
				} else {
					setGrupos((prev) =>
						prev.map((g) =>
							g.id === dialog.grupoId
								? {
										...g,
										features: g.features.map((f) =>
											f.id === dialog.featureId
												? {
														...f,
														claims: f.claims.map((c) =>
															c.id === dialog.claimId
																? {
																		...c,
																		value: formValue.trim(),
																		label: formLabel.trim(),
																	}
																: c
														),
													}
												: f
										),
									}
								: g
						)
					);
					toast.success('Claim atualizada!');
				}
				break;
			}
		}
		setDialog(null);
	};

	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (!deleteTarget) return;

		let updated: GrupoFuncionalidade[] = grupos;

		switch (deleteTarget.kind) {
			case 'grupo':
				updated = grupos.filter((g) => g.id !== deleteTarget.grupoId);
				break;
			case 'feature':
				updated = grupos.map((g) =>
					g.id === deleteTarget.grupoId
						? {
								...g,
								features: g.features.filter((f) => f.id !== deleteTarget.featureId),
							}
						: g
				);
				break;
			case 'claim':
				updated = grupos.map((g) =>
					g.id === deleteTarget.grupoId
						? {
								...g,
								features: g.features.map((f) =>
									f.id === deleteTarget.featureId
										? {
												...f,
												claims: f.claims.filter(
													(c) => c.id !== deleteTarget.claimId
												),
											}
										: f
								),
							}
						: g
				);
				break;
		}

		setDeleting(true);
		try {
			await FuncionalidadeService.salvarTudo(updated);
			setGrupos(updated);
			toast.success('Removido com sucesso!');
			setDeleteTarget(null);
			await loadData();
		} catch {
			toast.error('Erro ao remover');
		} finally {
			setDeleting(false);
		}
	};

	// --- Save all (API) ---

	const handleSaveAll = async () => {
		setSavingAll(true);
		try {
			await FuncionalidadeService.salvarTudo(grupos);
			toast.success('Funcionalidades salvas com sucesso!');
			await loadData();
		} catch {
			toast.error('Erro ao salvar funcionalidades');
		} finally {
			setSavingAll(false);
		}
	};

	// --- Dialog title / description ---

	const dialogTitle = (() => {
		if (!dialog) return '';
		if (dialog.kind === 'grupo') {
			return dialog.mode === 'criar' ? 'Nova Funcionalidade' : 'Editar Funcionalidade';
		}
		const action = dialog.mode === 'criar' ? 'Nova' : 'Editar';
		const entity = dialog.kind === 'feature' ? 'Feature' : 'Claim';
		return `${action} ${entity}`;
	})();

	const dialogDescription = (() => {
		if (!dialog) return '';
		if (dialog.mode === 'criar') return 'Preencha os dados para criar';
		return 'Altere os dados';
	})();

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Funcionalidades</h1>
					<p className='text-sm text-muted-foreground mt-1'>
						Gerencie grupos, features e permissões do sistema
					</p>
				</div>
				<Button onClick={openGrupoCreate}>
					<Plus className='h-4 w-4 mr-2' />
					Nova Funcionalidade
				</Button>
			</div>

			{/* Content */}
			{loading ? (
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
				</div>
			) : grupos.length === 0 ? (
				<p className='text-sm text-muted-foreground py-8 text-center'>
					Nenhuma funcionalidade cadastrada
				</p>
			) : (
				<div className='space-y-3'>
					{grupos.map((grupo, grupoIdx) => {
						const isOpen = openGroups.has(grupo.id);
						const totalClaims = grupo?.features?.reduce(
							(acc, f) => acc + f.claims.length,
							0
						);

						return (
							<div key={grupo.id} className='border rounded-lg overflow-hidden'>
								{/* Group header */}
								<div className='flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors'>
									<button
										type='button'
										onClick={() => toggleGroup(grupo.id)}
										className='flex items-center gap-2 flex-1 text-left'>
										<ChevronDown
											className={`h-4 w-4 text-muted-foreground transition-transform ${
												isOpen ? 'rotate-180' : ''
											}`}
										/>
										<span className='font-medium'>{grupo.nome}</span>
										<span className='text-xs text-muted-foreground'>
											({grupo?.features?.length}{' '}
											{grupo?.features?.length === 1 ? 'feature' : 'features'}
											, {totalClaims} {totalClaims === 1 ? 'claim' : 'claims'}
											)
										</span>
									</button>
									<div className='flex items-center gap-1'>
										<Button
											variant='ghost'
											size='icon'
											className='h-7 w-7'
											disabled={grupoIdx === 0}
											onClick={() => moveGrupo(grupoIdx, -1)}>
											<ArrowUp className='h-3.5 w-3.5' />
										</Button>
										<Button
											variant='ghost'
											size='icon'
											className='h-7 w-7'
											disabled={grupoIdx === grupos.length - 1}
											onClick={() => moveGrupo(grupoIdx, 1)}>
											<ArrowDown className='h-3.5 w-3.5' />
										</Button>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => openFeatureCreate(grupo.id)}>
											<Plus className='h-3.5 w-3.5 mr-1' />
											Feature
										</Button>
										<Button
											variant='ghost'
											size='icon'
											className='h-7 w-7'
											onClick={() => openGrupoEdit(grupo)}>
											<Edit className='h-3.5 w-3.5' />
										</Button>
										<Button
											variant='ghost'
											size='icon'
											className='h-7 w-7 text-destructive hover:text-destructive'
											onClick={() =>
												setDeleteTarget({
													kind: 'grupo',
													grupoId: grupo.id,
													label: grupo.nome,
												})
											}>
											<Trash2 className='h-3.5 w-3.5' />
										</Button>
									</div>
								</div>

								{/* Group content */}
								{isOpen && (
									<div className='border-t'>
										{grupo.features.length === 0 ? (
											<p className='text-sm text-muted-foreground px-4 py-4 text-center'>
												Nenhuma feature neste grupo
											</p>
										) : (
											grupo.features.map((feature, featureIdx) => {
												const featureOpen = openFeatures.has(feature.id);

												return (
													<div
														key={feature.id}
														className='border-b last:border-0'>
														{/* Feature header */}
														<div className='flex items-center justify-between px-6 py-2.5 bg-muted/20'>
															<button
																type='button'
																onClick={() =>
																	toggleFeature(feature.id)
																}
																className='flex items-center gap-2 flex-1 text-left'>
																<ChevronDown
																	className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
																		featureOpen
																			? 'rotate-180'
																			: ''
																	}`}
																/>
																<span className='text-sm font-semibold'>
																	{feature.label}
																</span>
																<span className='text-xs text-muted-foreground font-mono'>
																	({feature.key})
																</span>
																<span className='text-[10px] text-muted-foreground'>
																	{feature.claims.length}{' '}
																	{feature.claims.length === 1
																		? 'claim'
																		: 'claims'}
																</span>
															</button>
															<div className='flex items-center gap-1'>
																<Button
																	variant='ghost'
																	size='icon'
																	className='h-6 w-6'
																	disabled={featureIdx === 0}
																	onClick={() =>
																		moveFeature(
																			grupo.id,
																			featureIdx,
																			-1
																		)
																	}>
																	<ArrowUp className='h-3 w-3' />
																</Button>
																<Button
																	variant='ghost'
																	size='icon'
																	className='h-6 w-6'
																	disabled={
																		featureIdx ===
																		grupo.features.length - 1
																	}
																	onClick={() =>
																		moveFeature(
																			grupo.id,
																			featureIdx,
																			1
																		)
																	}>
																	<ArrowDown className='h-3 w-3' />
																</Button>
																<Button
																	variant='ghost'
																	size='sm'
																	className='h-7 text-xs'
																	onClick={() =>
																		openClaimCreate(
																			grupo.id,
																			feature.id
																		)
																	}>
																	<Plus className='h-3 w-3 mr-1' />
																	Claim
																</Button>
																<Button
																	variant='ghost'
																	size='icon'
																	className='h-7 w-7'
																	onClick={() =>
																		openFeatureEdit(
																			grupo.id,
																			feature
																		)
																	}>
																	<Edit className='h-3.5 w-3.5' />
																</Button>
																<Button
																	variant='ghost'
																	size='icon'
																	className='h-7 w-7 text-destructive hover:text-destructive'
																	onClick={() =>
																		setDeleteTarget({
																			kind: 'feature',
																			grupoId: grupo.id,
																			featureId: feature.id,
																			label: feature.label,
																		})
																	}>
																	<Trash2 className='h-3.5 w-3.5' />
																</Button>
															</div>
														</div>

														{/* Claims (colapsável) */}
														{featureOpen && (
															<>
																{feature.claims.length === 0 ? (
																	<p className='text-xs text-muted-foreground px-8 py-2 text-center'>
																		Nenhuma claim
																	</p>
																) : (
																	feature.claims.map(
																		(claim, claimIdx) => (
																			<div
																				key={claim.id}
																				className='flex items-center justify-between px-8 py-2 hover:bg-muted/10 transition-colors'>
																				<div className='flex items-center gap-3'>
																					<span className='font-mono text-xs text-muted-foreground'>
																						{
																							claim.value
																						}
																					</span>
																					<span className='text-sm'>
																						{
																							claim.label
																						}
																					</span>
																				</div>
																				<div className='flex items-center gap-1'>
																					<Button
																						variant='ghost'
																						size='icon'
																						className='h-5 w-5'
																						disabled={
																							claimIdx ===
																							0
																						}
																						onClick={() =>
																							moveClaim(
																								grupo.id,
																								feature.id,
																								claimIdx,
																								-1
																							)
																						}>
																						<ArrowUp className='h-2.5 w-2.5' />
																					</Button>
																					<Button
																						variant='ghost'
																						size='icon'
																						className='h-5 w-5'
																						disabled={
																							claimIdx ===
																							feature
																								.claims
																								.length -
																								1
																						}
																						onClick={() =>
																							moveClaim(
																								grupo.id,
																								feature.id,
																								claimIdx,
																								1
																							)
																						}>
																						<ArrowDown className='h-2.5 w-2.5' />
																					</Button>
																					<Button
																						variant='ghost'
																						size='icon'
																						className='h-6 w-6'
																						onClick={() =>
																							openClaimEdit(
																								grupo.id,
																								feature.id,
																								claim
																							)
																						}>
																						<Edit className='h-3 w-3' />
																					</Button>
																					<Button
																						variant='ghost'
																						size='icon'
																						className='h-6 w-6 text-destructive hover:text-destructive'
																						onClick={() =>
																							setDeleteTarget(
																								{
																									kind: 'claim',
																									grupoId:
																										grupo.id,
																									featureId:
																										feature.id,
																									claimId:
																										claim.id,
																									label: claim.value,
																								}
																							)
																						}>
																						<Trash2 className='h-3 w-3' />
																					</Button>
																				</div>
																			</div>
																		)
																	)
																)}
															</>
														)}
													</div>
												);
											})
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			{/* Save all */}
			{!loading && grupos.length > 0 && (
				<div className='flex justify-end pt-2'>
					<Button onClick={handleSaveAll} disabled={savingAll}>
						{savingAll ? (
							<Loader2 className='h-4 w-4 mr-2 animate-spin' />
						) : (
							<Save className='h-4 w-4 mr-2' />
						)}
						{savingAll ? 'Salvando...' : 'Salvar'}
					</Button>
				</div>
			)}

			{/* Create / Edit Dialog */}
			<Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle>{dialogTitle}</DialogTitle>
						<DialogDescription>{dialogDescription}</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						{dialog?.kind === 'grupo' && (
							<div className='space-y-2'>
								<Label required>Nome da funcionalidade</Label>
								<Input
									placeholder='ex: Operacional'
									value={formNome}
									onChange={(e) => setFormNome(e.target.value)}
								/>
							</div>
						)}
						{dialog?.kind === 'feature' && (
							<>
								<div className='space-y-2'>
									<Label required>Chave</Label>
									<Input
										placeholder='ex: eventos'
										value={formKey}
										onChange={(e) => setFormKey(e.target.value)}
									/>
								</div>
								<div className='space-y-2'>
									<Label required>Nome</Label>
									<Input
										placeholder='ex: Veículos Removidos'
										value={formLabel}
										onChange={(e) => setFormLabel(e.target.value)}
									/>
								</div>
							</>
						)}
						{dialog?.kind === 'claim' && (
							<>
								<div className='space-y-2'>
									<Label required>Valor</Label>
									<Input
										placeholder='ex: eventos.view'
										value={formValue}
										onChange={(e) => setFormValue(e.target.value)}
									/>
								</div>
								<div className='space-y-2'>
									<Label required>Rótulo</Label>
									<Input
										placeholder='ex: Visualizar'
										value={formLabel}
										onChange={(e) => setFormLabel(e.target.value)}
									/>
								</div>
							</>
						)}
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={() => setDialog(null)}>
							Cancelar
						</Button>
						<Button onClick={handleSave}>
							<Save className='h-4 w-4 mr-2' />
							Salvar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete confirmation */}
			<Dialog open={!!deleteTarget} onOpenChange={() => !deleting && setDeleteTarget(null)}>
				<DialogContent className='max-w-sm'>
					<DialogHeader>
						<DialogTitle>Confirmar exclusão</DialogTitle>
						<DialogDescription>
							Deseja remover <strong>{deleteTarget?.label}</strong>?{' '}
							{deleteTarget?.kind === 'grupo' &&
								'Todas as features e claims desta funcionalidade serão removidas. '}
							{deleteTarget?.kind === 'feature' &&
								'Todas as claims desta feature serão removidas. '}
							Essa ação não pode ser desfeita.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setDeleteTarget(null)}
							disabled={deleting}>
							Cancelar
						</Button>
						<Button variant='destructive' onClick={handleDelete} disabled={deleting}>
							{deleting ? (
								<Loader2 className='h-4 w-4 mr-2 animate-spin' />
							) : (
								<Trash2 className='h-4 w-4 mr-2' />
							)}
							{deleting ? 'Removendo...' : 'Remover'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
