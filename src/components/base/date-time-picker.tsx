import { cn } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './dialog';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
	'Janeiro',
	'Fevereiro',
	'Março',
	'Abril',
	'Maio',
	'Junho',
	'Julho',
	'Agosto',
	'Setembro',
	'Outubro',
	'Novembro',
	'Dezembro',
];

const ITEM_HEIGHT = 36;
const HORAS = Array.from({ length: 24 }, (_, i) => i);
const MINUTOS = Array.from({ length: 60 }, (_, i) => i);

function getDiasDoMes(ano: number, mes: number): (number | null)[] {
	const primeiroDia = new Date(ano, mes, 1).getDay();
	const totalDias = new Date(ano, mes + 1, 0).getDate();
	const dias: (number | null)[] = Array(primeiroDia).fill(null);
	for (let i = 1; i <= totalDias; i++) dias.push(i);
	return dias;
}

const pad = (n: number) => String(n).padStart(2, '0');

type Props = {
	value: string;
	onChange: (v: string) => void;
	label?: string;
	required?: boolean;
};

export function DateTimePicker({ value, onChange, label = 'Data da Remoção', required }: Props) {
	const [modalAberto, setModalAberto] = useState(false);

	const base = value ? new Date(value) : new Date();
	const [mesSelecionado, setMesSelecionado] = useState(base.getMonth());
	const [anoSelecionado, setAnoSelecionado] = useState(base.getFullYear());
	const [diaSelecionado, setDiaSelecionado] = useState(base.getDate());
	const [horaSelecionada, setHoraSelecionada] = useState(base.getHours());
	const [minutoSelecionado, setMinutoSelecionado] = useState(base.getMinutes());

	const horaScrollRef = useRef<HTMLDivElement>(null);
	const minutoScrollRef = useRef<HTMLDivElement>(null);

	// ── Helpers de limite ──────────────────────────────────────────────
	const getNow = () => new Date();

	const isMesFuturo = (ano: number, mes: number) => {
		const now = getNow();
		return ano > now.getFullYear() || (ano === now.getFullYear() && mes > now.getMonth());
	};

	const isDiaFuturo = (dia: number) => {
		const now = getNow();
		const isMesAtual =
			anoSelecionado === now.getFullYear() && mesSelecionado === now.getMonth();
		return isMesAtual && dia > now.getDate();
	};

	const isHoraFutura = (h: number) => {
		const now = getNow();
		const isHoje =
			anoSelecionado === now.getFullYear() &&
			mesSelecionado === now.getMonth() &&
			diaSelecionado === now.getDate();
		return isHoje && h > now.getHours();
	};

	const isMinutoFuturo = (m: number) => {
		const now = getNow();
		const isHoje =
			anoSelecionado === now.getFullYear() &&
			mesSelecionado === now.getMonth() &&
			diaSelecionado === now.getDate();
		return isHoje && horaSelecionada === now.getHours() && m > now.getMinutes();
	};

	// Ajusta hora/minuto para não ultrapassar o limite ao trocar o dia
	const clampHoraMinuto = (dia: number) => {
		const now = getNow();
		const isHoje =
			anoSelecionado === now.getFullYear() &&
			mesSelecionado === now.getMonth() &&
			dia === now.getDate();

		if (!isHoje) return; // Dias no passado: sem restrição

		if (horaSelecionada > now.getHours()) {
			setHoraSelecionada(now.getHours());
			horaScrollRef.current?.scrollTo({
				top: now.getHours() * ITEM_HEIGHT,
				behavior: 'smooth',
			});
		}
		if (horaSelecionada >= now.getHours() && minutoSelecionado > now.getMinutes()) {
			setMinutoSelecionado(now.getMinutes());
			minutoScrollRef.current?.scrollTo({
				top: now.getMinutes() * ITEM_HEIGHT,
				behavior: 'smooth',
			});
		}
	};
	// ──────────────────────────────────────────────────────────────────

	const abrirModal = () => {
		const b = value ? new Date(value) : new Date();
		setMesSelecionado(b.getMonth());
		setAnoSelecionado(b.getFullYear());
		setDiaSelecionado(b.getDate());
		setHoraSelecionada(b.getHours());
		setMinutoSelecionado(b.getMinutes());
		setModalAberto(true);
	};

	useEffect(() => {
		if (!modalAberto) return;
		const timer = setTimeout(() => {
			horaScrollRef.current?.scrollTo({
				top: horaSelecionada * ITEM_HEIGHT,
				behavior: 'instant',
			});
			minutoScrollRef.current?.scrollTo({
				top: minutoSelecionado * ITEM_HEIGHT,
				behavior: 'instant',
			});
		}, 80);
		return () => clearTimeout(timer);
	}, [modalAberto]);

	const preencherDataAtual = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(new Date().toISOString());
	};

	const confirmar = () => {
		const data = new Date(
			anoSelecionado,
			mesSelecionado,
			diaSelecionado,
			horaSelecionada,
			minutoSelecionado
		);
		// Garantia final: nunca deixa passar um valor futuro
		const dataFinal = data > new Date() ? new Date() : data;
		onChange(dataFinal.toISOString());
		setModalAberto(false);
	};

	const hoje = () => {
		const agora = new Date();
		setMesSelecionado(agora.getMonth());
		setAnoSelecionado(agora.getFullYear());
		setDiaSelecionado(agora.getDate());
		setHoraSelecionada(agora.getHours());
		setMinutoSelecionado(agora.getMinutes());
		horaScrollRef.current?.scrollTo({
			top: agora.getHours() * ITEM_HEIGHT,
			behavior: 'smooth',
		});
		minutoScrollRef.current?.scrollTo({
			top: agora.getMinutes() * ITEM_HEIGHT,
			behavior: 'smooth',
		});
	};

	const limpar = () => {
		const agora = new Date();
		setMesSelecionado(agora.getMonth());
		setAnoSelecionado(agora.getFullYear());
		setDiaSelecionado(agora.getDate());
		setHoraSelecionada(0);
		setMinutoSelecionado(0);
		horaScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
		minutoScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const mesAnterior = () => {
		if (mesSelecionado === 0) {
			setMesSelecionado(11);
			setAnoSelecionado((a) => a - 1);
		} else {
			setMesSelecionado((m) => m - 1);
		}
	};

	const proximoMes = () => {
		const novoMes = mesSelecionado === 11 ? 0 : mesSelecionado + 1;
		const novoAno = mesSelecionado === 11 ? anoSelecionado + 1 : anoSelecionado;
		// Bloqueia navegação para mês futuro
		if (isMesFuturo(novoAno, novoMes)) return;
		setMesSelecionado(novoMes);
		if (mesSelecionado === 11) setAnoSelecionado((a) => a + 1);
	};

	const scrollParaHora = (h: number) => {
		if (isHoraFutura(h)) return; // Bloqueia hora futura
		setHoraSelecionada(h);
		horaScrollRef.current?.scrollTo({ top: h * ITEM_HEIGHT, behavior: 'smooth' });
	};

	const scrollParaMinuto = (m: number) => {
		if (isMinutoFuturo(m)) return; // Bloqueia minuto futuro
		setMinutoSelecionado(m);
		minutoScrollRef.current?.scrollTo({ top: m * ITEM_HEIGHT, behavior: 'smooth' });
	};

	const selecionarDia = (dia: number) => {
		if (isDiaFuturo(dia)) return; // Bloqueia dia futuro
		setDiaSelecionado(dia);
		clampHoraMinuto(dia);
	};

	const dataFormatada = value
		? new Date(value).toLocaleString('pt-BR', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		: '';

	const dias = getDiasDoMes(anoSelecionado, mesSelecionado);
	const isProximoMesBloqueado = isMesFuturo(
		mesSelecionado === 11 ? anoSelecionado + 1 : anoSelecionado,
		mesSelecionado === 11 ? 0 : mesSelecionado + 1
	);

	return (
		<div className='space-y-1.5'>
			<div className='flex items-center gap-2'>
				<label className='text-sm font-medium leading-none'>
					{label}
					{required && <span className='text-destructive ml-0.5'>*</span>}
				</label>
				<button
					type='button'
					onClick={preencherDataAtual}
					className='text-xs text-primary hover:underline cursor-pointer'>
					Data atual
				</button>
			</div>

			<button
				type='button'
				onClick={abrirModal}
				className='flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
				<span className={cn('flex-1 text-left', !dataFormatada && 'text-muted-foreground')}>
					{dataFormatada || 'DD/MM/AAAA HH:MM'}
				</span>
				<Calendar className='h-4 w-4 text-muted-foreground shrink-0' />
			</button>

			<Dialog open={modalAberto} onOpenChange={(open) => !open && setModalAberto(false)}>
				<DialogContent className='sm:max-w-md p-4'>
					<DialogHeader className='pb-2'>
						<DialogTitle className='text-base'>Selecionar data e hora</DialogTitle>
					</DialogHeader>

					<div className='flex gap-3'>
						{/* Calendário */}
						<div className='flex-1 min-w-0'>
							<div className='flex items-center justify-between mb-2'>
								<button
									type='button'
									onClick={mesAnterior}
									className='p-1 rounded hover:bg-accent transition-colors'>
									<ChevronLeft className='h-4 w-4' />
								</button>
								<span className='text-sm font-semibold'>
									{MESES[mesSelecionado]} {anoSelecionado}
								</span>
								<button
									type='button'
									onClick={proximoMes}
									disabled={isProximoMesBloqueado}
									className={cn(
										'p-1 rounded transition-colors',
										isProximoMesBloqueado
											? 'opacity-30 cursor-not-allowed'
											: 'hover:bg-accent'
									)}>
									<ChevronRight className='h-4 w-4' />
								</button>
							</div>

							<div className='grid grid-cols-7 mb-1'>
								{DIAS_SEMANA.map((d) => (
									<span
										key={d}
										className='text-center text-[10px] font-semibold text-muted-foreground py-0.5'>
										{d}
									</span>
								))}
							</div>

							<div className='grid grid-cols-7'>
								{dias.map((dia, i) => {
									if (!dia)
										return <div key={`e-${i}`} className='aspect-square' />;
									const selecionado = dia === diaSelecionado;
									const bloqueado = isDiaFuturo(dia);
									return (
										<button
											key={`d-${i}`}
											type='button'
											disabled={bloqueado}
											onClick={() => selecionarDia(dia)}
											className={cn(
												'aspect-square flex items-center justify-center rounded-full text-xs transition-colors',
												selecionado
													? 'bg-primary text-primary-foreground font-semibold'
													: bloqueado
														? 'text-muted-foreground/30 cursor-not-allowed'
														: 'hover:bg-accent'
											)}>
											{dia}
										</button>
									);
								})}
							</div>

							<div className='flex justify-between mt-2 pt-2 border-t'>
								<button
									type='button'
									onClick={limpar}
									className='text-xs text-primary hover:underline'>
									Limpar
								</button>
								<button
									type='button'
									onClick={hoje}
									className='text-xs text-primary hover:underline'>
									Hoje
								</button>
							</div>
						</div>

						{/* Seletor de hora e minuto */}
						<div className='flex gap-1 items-center shrink-0'>
							{/* Horas */}
							<div className='relative w-10 h-45 overflow-hidden'>
								<div
									ref={horaScrollRef}
									className='h-full overflow-y-scroll scroll-smooth'
									style={{ scrollSnapType: 'y mandatory' }}
									onScroll={(e) => {
										const index = Math.round(
											e.currentTarget.scrollTop / ITEM_HEIGHT
										);
										const h = Math.min(23, Math.max(0, index));
										if (!isHoraFutura(h)) setHoraSelecionada(h);
									}}>
									<div style={{ height: ITEM_HEIGHT * 2.5 }} />
									{HORAS.map((h) => {
										const bloqueado = isHoraFutura(h);
										return (
											<div
												key={h}
												style={{
													height: ITEM_HEIGHT,
													scrollSnapAlign: 'center',
												}}
												className='flex items-center justify-center'>
												<button
													type='button'
													disabled={bloqueado}
													onClick={() => scrollParaHora(h)}
													className={cn(
														'text-sm w-8 h-8 rounded transition-colors',
														h === horaSelecionada
															? 'font-bold text-primary'
															: bloqueado
																? 'text-muted-foreground/25 cursor-not-allowed'
																: 'text-muted-foreground hover:text-foreground'
													)}>
													{pad(h)}
												</button>
											</div>
										);
									})}
									<div style={{ height: ITEM_HEIGHT * 2.5 }} />
								</div>
								<div
									className='pointer-events-none absolute left-0 right-0 border-y border-primary'
									style={{
										top: '50%',
										marginTop: -ITEM_HEIGHT / 2,
										height: ITEM_HEIGHT,
									}}
								/>
							</div>

							<span className='text-base font-bold text-foreground'>:</span>

							{/* Minutos */}
							<div className='relative w-10 h-45 overflow-hidden'>
								<div
									ref={minutoScrollRef}
									className='h-full overflow-y-scroll scroll-smooth'
									style={{ scrollSnapType: 'y mandatory' }}
									onScroll={(e) => {
										const index = Math.round(
											e.currentTarget.scrollTop / ITEM_HEIGHT
										);
										const m = Math.min(59, Math.max(0, index));
										if (!isMinutoFuturo(m)) setMinutoSelecionado(m);
									}}>
									<div style={{ height: ITEM_HEIGHT * 2.5 }} />
									{MINUTOS.map((m) => {
										const bloqueado = isMinutoFuturo(m);
										return (
											<div
												key={m}
												style={{
													height: ITEM_HEIGHT,
													scrollSnapAlign: 'center',
												}}
												className='flex items-center justify-center'>
												<button
													type='button'
													disabled={bloqueado}
													onClick={() => scrollParaMinuto(m)}
													className={cn(
														'text-sm w-8 h-8 rounded transition-colors',
														m === minutoSelecionado
															? 'font-bold text-primary'
															: bloqueado
																? 'text-muted-foreground/25 cursor-not-allowed'
																: 'text-muted-foreground hover:text-foreground'
													)}>
													{pad(m)}
												</button>
											</div>
										);
									})}
									<div style={{ height: ITEM_HEIGHT * 2.5 }} />
								</div>
								<div
									className='pointer-events-none absolute left-0 right-0 border-y border-primary'
									style={{
										top: '50%',
										marginTop: -ITEM_HEIGHT / 2,
										height: ITEM_HEIGHT,
									}}
								/>
							</div>
						</div>
					</div>

					{/* Preview */}
					<div className='flex items-center justify-between rounded-md border px-3 py-2 mt-1 text-sm text-muted-foreground'>
						<span>
							{pad(diaSelecionado)}/{pad(mesSelecionado + 1)}/{anoSelecionado}{' '}
							{pad(horaSelecionada)}:{pad(minutoSelecionado)}
						</span>
						<Calendar className='h-4 w-4' />
					</div>

					<DialogFooter className='gap-2 sm:gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setModalAberto(false)}
							className='flex-1'>
							Cancelar
						</Button>
						<Button type='button' onClick={confirmar} className='flex-1'>
							Confirmar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
