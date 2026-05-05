import { Button } from '@/components/base/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/base/dialog';
import { StatusBadgeVeiculoRemovido } from '@/components/base/status-badge-veiculo-removido';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { HistoricoService } from '@/services/historico-service';
import { Clock, Eye, EyeOff, History, Loader2, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type DialogoHistoricoProps = {
	aberto: boolean;
	onAbertoChange: (aberto: boolean) => void;
	titulo?: string;
	/** Caminho GET da API que retorna `HistoricoItem[]`. */
	caminhoApi: string | null;
	/** Texto opcional exibido no cabeçalho (ex.: número de protocolo). */
	referencia?: string | null;
};

function formatarDataHora(iso: string): string {
	return new Date(iso).toLocaleString('pt-BR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function formatarDataRelativa(iso: string): string {
	const date = new Date(iso);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMin / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMin < 1) return 'Agora';
	if (diffMin < 60) return `${diffMin}min atrás`;
	if (diffHours < 24) return `${diffHours}h atrás`;
	if (diffDays < 7) return `${diffDays}d atrás`;
	return '';
}

export function DialogoHistorico({
	aberto,
	onAbertoChange,
	titulo = 'Histórico',
	caminhoApi,
	referencia,
}: DialogoHistoricoProps) {
	const [itens, setItens] = useState<HistoricoItem[]>([]);
	const [carregando, setCarregando] = useState(false);

	const carregar = useCallback(async () => {
		if (!caminhoApi) {
			setItens([]);
			return;
		}
		setCarregando(true);
		try {
			const dados = await HistoricoService.listar(caminhoApi);
			const ordenados = [...dados].sort(
				(a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
			);
			setItens(ordenados);
		} catch {
			toast.error('Não foi possível carregar o histórico.');
			setItens([]);
		} finally {
			setCarregando(false);
		}
	}, [caminhoApi]);

	useEffect(() => {
		if (aberto && caminhoApi) void carregar();
		if (!aberto) setItens([]);
	}, [aberto, caminhoApi, carregar]);

	return (
		<Dialog open={aberto} onOpenChange={onAbertoChange}>
			<DialogContent className='flex max-h-[85vh] max-w-lg flex-col gap-0 p-0'>
				<div className='shrink-0 px-6 pt-6 pb-2'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<History className='h-5 w-5' />
							{titulo}
						</DialogTitle>
						<DialogDescription>
							{referencia ? (
								<>
									Referência{' '}
									<span className='font-mono font-semibold text-foreground'>{referencia}</span>
								</>
							) : (
								'Linha do tempo de eventos e alterações.'
							)}
						</DialogDescription>
					</DialogHeader>
				</div>

				<div className='flex-1 overflow-y-auto px-6 pb-2 min-h-[200px]'>
					{carregando && (
						<div className='flex items-center justify-center py-12'>
							<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
						</div>
					)}

					{!carregando && itens.length === 0 && (
						<div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
							<History className='h-10 w-10 mb-2 opacity-40' />
							<p className='text-sm'>
								{caminhoApi ? 'Nenhum registro encontrado.' : 'Nada para exibir.'}
							</p>
						</div>
					)}

					{!carregando && itens.length > 0 && (
						<TooltipProvider delayDuration={150}>
							<div className='relative ml-3'>
								<div className='absolute left-0 top-2 bottom-2 w-px bg-border' />

								<div className='space-y-0'>
									{itens.map((item, idx) => {
										const relativo = formatarDataRelativa(item.data);
										const primeiro = idx === 0;

										return (
											<div
												key={`${item.data}-${idx}`}
												className='relative pl-6 pb-6 last:pb-0'>
												<div
													className={`absolute left-0 top-2 -translate-x-1/2 h-2.5 w-2.5 rounded-full border-2 ${
														primeiro
															? 'border-primary bg-primary'
															: 'border-muted-foreground/40 bg-background'
													}`}
												/>

												<div className='space-y-1.5'>
													<div className='flex items-center justify-between gap-2 flex-wrap'>
														<div className='flex items-center gap-2 flex-wrap'>
															<span className='flex items-center gap-1 text-xs text-muted-foreground'>
																<Clock className='h-3 w-3' />
																{formatarDataHora(item.data)}
															</span>
															{relativo && (
																<span className='text-xs text-muted-foreground/60'>
																	({relativo})
																</span>
															)}
															{item.visivelAoSolicitante ? (
																<span
																	className='flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400'
																	title='Visível ao solicitante'>
																	<Eye className='h-3 w-3' />
																</span>
															) : (
																<span
																	className='flex items-center gap-0.5 opacity-40'
																	title='Não visível ao solicitante'>
																	<EyeOff className='h-3 w-3' />
																</span>
															)}
														</div>

														<Tooltip>
															<TooltipTrigger asChild>
																<span className='inline-flex items-center gap-1 text-xs font-medium text-foreground/80 cursor-default max-w-[min(200px,45%)] truncate'>
																	<User className='h-3 w-3 shrink-0' />
																	{item.usuario.nome}
																</span>
															</TooltipTrigger>
															<TooltipContent side='bottom' className='p-0'>
																<div className='flex items-start gap-2.5 p-3 max-w-xs'>
																	<User className='h-4 w-4 text-muted-foreground shrink-0 mt-0.5' />
																	<div className='space-y-0.5'>
																		<p className='text-sm font-medium leading-tight'>
																			{item.usuario.nome}
																		</p>
																		<p className='text-xs text-muted-foreground break-all'>
																			{item.usuario.email}
																		</p>
																		<p className='text-xs text-muted-foreground/70'>
																			{item.usuario.perfil}
																		</p>
																	</div>
																</div>
															</TooltipContent>
														</Tooltip>
													</div>

													<div className='rounded-lg border bg-card p-3'>
														<div className='grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4'>
															<div className='space-y-1'>
																<p className='text-xs text-muted-foreground'>Descrição</p>
																<p className='text-sm font-medium leading-snug'>
																	{item.acao.descricao}
																</p>
															</div>

															<div className='space-y-1 sm:text-right'>
																<p className='text-xs text-muted-foreground'>Status</p>
																<div className='inline-flex'>
																	<StatusBadgeVeiculoRemovido status={item.acao.status} />
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</TooltipProvider>
					)}
				</div>

				<div className='shrink-0 flex justify-end gap-2 px-6 pb-6 pt-2 border-t bg-background'>
					<Button type='button' variant='secondary' onClick={() => onAbertoChange(false)}>
						Fechar
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
