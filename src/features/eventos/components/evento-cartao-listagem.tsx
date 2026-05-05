import { Button } from "@/components/base/button";
import { Can } from "@/components/can";
import { formatarEventoDataPeriodoPt } from "@/features/eventos/lib/datas-evento";
import { formatarPontosDeTrocaResumo } from "@/features/eventos/lib/pontos-troca-evento";
import {
	eventoListadoNoPortal,
	rotuloEstadoPortalPublico,
	rotuloElegivelCatalogoPortal,
} from "@/features/eventos/lib/visibilidade-evento";
import type { EventoCadastroDto, LocalTrocaDto } from "@/features/eventos/types";
import { cn } from "@/lib/utils";
import { Calendar, Eye, ImageIcon, MapPin, Pencil, Star, Tag, Ticket, Users } from "lucide-react";

type Props = {
	evento: EventoCadastroDto;
	/** Opcional: resolve nomes dos códigos de ponto de troca. */
	locaisDeTroca?: LocalTrocaDto[];
	/** `data:` da pré-visualização ou `null` se não houver; `undefined` = ainda a carregar. */
	capaDataUrl?: string | null;
	carregandoCapa?: boolean;
	onVerDetalhes: () => void;
	onEditar?: () => void;
	/** Se definido, a estrela abre o fluxo de confirmação (ex.: diálogo na página pai). */
	onAlternarDestaque?: () => void;
};

export function EventoCartaoListagem({
	evento,
	locaisDeTroca = [],
	capaDataUrl,
	carregandoCapa,
	onVerDetalhes,
	onEditar,
	onAlternarDestaque,
}: Props) {
	const listado = eventoListadoNoPortal(evento);
	const estadoPortal = rotuloEstadoPortalPublico(evento);
	const statusRotulo = rotuloElegivelCatalogoPortal(evento.exibirParaCidadao);
	const emDestaque = Boolean(evento.eventoEmDestaque);
	const pontosResumo = formatarPontosDeTrocaResumo(
		evento.pontosDeTrocaCodigos,
		evento.semPontoDeTroca,
		locaisDeTroca
	);

	return (
		<article
			className={cn(
				"flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm",
				"transition-shadow hover:shadow-md"
			)}>
			<div className='relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-sidebar'>
				{carregandoCapa && capaDataUrl === undefined ? (
					<div className='absolute inset-0 animate-pulse bg-sidebar/80' aria-hidden />
				) : capaDataUrl ? (
					<img src={capaDataUrl} alt='' className='h-full w-full object-cover' loading='lazy' />
				) : (
					<div className='flex h-full w-full items-center justify-center text-sidebar-foreground'>
						<ImageIcon className='h-16 w-16' strokeWidth={1.25} aria-hidden />
					</div>
				)}
				<div className='absolute right-2 top-2 z-10 flex items-center gap-2'>
					<span
						className={cn(
							"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm backdrop-blur-sm",
							evento.exibirParaCidadao
								? "border border-emerald-600/30 bg-emerald-100/95 text-emerald-900 dark:bg-emerald-950/95 dark:text-emerald-100"
								: "border border-border/60 bg-background/90 text-muted-foreground"
						)}>
						{statusRotulo}
					</span>
					{onAlternarDestaque ? (
						<Can
							claim='eventos.edit'
							fallback={
								emDestaque ? (
									<span
										className='inline-flex h-9 w-9 items-center justify-center rounded-md border border-amber-500/60 bg-amber-500/90 text-white shadow-sm'
										title='Evento em destaque no portal'
										aria-label='Evento em destaque no portal'>
										<Star className='h-4 w-4 fill-white' aria-hidden />
									</span>
								) : null
							}>
							<Button
								type='button'
								size='icon'
								variant='secondary'
								className='h-9 w-9 shrink-0 border border-border/80 bg-background/90 shadow-sm backdrop-blur-sm hover:bg-background'
								aria-label={
									emDestaque
										? `Remover destaque de ${evento.nomeEvento}`
										: `Definir ${evento.nomeEvento} como evento em destaque`
								}
								onClick={(ev) => {
									ev.stopPropagation();
									onAlternarDestaque();
								}}>
								<Star
									className={cn(
										"h-4 w-4",
										emDestaque ? "fill-amber-400 text-amber-600" : "text-muted-foreground"
									)}
								/>
							</Button>
						</Can>
					) : emDestaque ? (
						<span
							className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-amber-500/60 bg-amber-500/90 text-white shadow-sm'
							title='Evento em destaque no portal'
							aria-label='Evento em destaque no portal'>
							<Star className='h-4 w-4 fill-white' aria-hidden />
						</span>
					) : null}
				</div>
			</div>

			<div className='flex flex-1 flex-col gap-3 p-4'>
				<h3 className='line-clamp-2 min-w-0 text-base font-semibold leading-tight'>{evento.nomeEvento}</h3>

				<ul className='space-y-2 text-sm text-muted-foreground'>
					<li className='flex items-start gap-2'>
						<Tag className='mt-0.5 h-4 w-4 shrink-0 opacity-70' aria-hidden />
						<span className='min-w-0'>{evento.categoria || "—"}</span>
					</li>
					<li className='flex items-start gap-2'>
						<MapPin className='mt-0.5 h-4 w-4 shrink-0 opacity-70' aria-hidden />
						<span className='min-w-0'>{pontosResumo}</span>
					</li>
					<li className='flex items-start gap-2'>
						<Calendar className='mt-0.5 h-4 w-4 shrink-0 opacity-70' aria-hidden />
						<span className='min-w-0'>{formatarEventoDataPeriodoPt(evento)}</span>
					</li>
					<li className='flex items-start gap-2'>
						<Ticket className='mt-0.5 h-4 w-4 shrink-0 opacity-70' aria-hidden />
						<span>
							{evento.exibirVagas
								? `${evento.quantidadeIngressosReservados}/${evento.quantidadeIngressosTotal} reservadas`
								: "Vagas não exibidas no portal"}
						</span>
					</li>
					<li className='flex items-start gap-2'>
						<Users className='mt-0.5 h-4 w-4 shrink-0 opacity-70' aria-hidden />
						<span>
							Listado: {listado ? "Sim" : "Não"} · {estadoPortal}
						</span>
					</li>
				</ul>

				<div className='mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-3'>
					<Button type='button' variant='ghost' size='sm' className='text-muted-foreground hover:text-foreground' onClick={onVerDetalhes}>
						<Eye className='h-4 w-4' />
						Ver detalhes
					</Button>
					{onEditar ? (
						<Can claim='eventos.edit'>
							<Button
								type='button'
								size='sm'
								className='bg-primary text-primary-foreground hover:bg-primary/90'
								onClick={onEditar}>
								<Pencil className='h-4 w-4' />
								Editar
							</Button>
						</Can>
					) : null}
				</div>
			</div>
		</article>
	);
}
