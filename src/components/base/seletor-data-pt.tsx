import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Label } from "./label";
import {
	DIAS_SEMANA_CURTOS,
	MESES_PT,
	obterDiasDoMes,
	pad2,
	parseYmdParaDate,
	paraYmdLocal,
} from "./calendario-pt-shared";

type Props = {
	value: string;
	onChange: (ymd: string) => void;
	label: string;
	required?: boolean;
	disabled?: boolean;
	/** Texto quando não há data (nunca formato US). */
	placeholder?: string;
	/** `YYYY-MM-DD` — dias anteriores ficam indisponíveis no calendário. */
	dataMinimaYmd?: string;
};

function formatarExibicao(ymd: string): string {
	const d = parseYmdParaDate(ymd);
	if (!d) return "";
	return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function SeletorDataPt({
	value,
	onChange,
	label,
	required,
	disabled,
	placeholder = "dd/mm/aaaa",
	dataMinimaYmd,
}: Props) {
	const [aberto, setAberto] = useState(false);
	const base = parseYmdParaDate(value) ?? new Date();
	const [mes, setMes] = useState(base.getMonth());
	const [ano, setAno] = useState(base.getFullYear());
	const [dia, setDia] = useState(base.getDate());

	useEffect(() => {
		if (!aberto) return;
		let d = parseYmdParaDate(value) ?? new Date();
		if (dataMinimaYmd) {
			const minD = parseYmdParaDate(dataMinimaYmd);
			if (minD && paraYmdLocal(d) < dataMinimaYmd) d = minD;
		}
		setMes(d.getMonth());
		setAno(d.getFullYear());
		setDia(d.getDate());
	}, [aberto, value, dataMinimaYmd]);

	const abrir = () => {
		if (disabled) return;
		const d = parseYmdParaDate(value) ?? new Date();
		setMes(d.getMonth());
		setAno(d.getFullYear());
		setDia(d.getDate());
		setAberto(true);
	};

	const confirmar = () => {
		let ymd = paraYmdLocal(new Date(ano, mes, dia));
		if (dataMinimaYmd && ymd < dataMinimaYmd) ymd = dataMinimaYmd;
		onChange(ymd);
		setAberto(false);
	};

	/** Último dia do mês anterior ao que está visível (`ano`, `mes`). */
	const podeMesAnterior =
		!dataMinimaYmd || paraYmdLocal(new Date(ano, mes, 0)) >= dataMinimaYmd;

	const mesAnterior = () => {
		if (!podeMesAnterior) return;
		if (mes === 0) {
			setMes(11);
			setAno((a) => a - 1);
		} else setMes((m) => m - 1);
	};

	const proximoMes = () => {
		if (mes === 11) {
			setMes(0);
			setAno((a) => a + 1);
		} else setMes((m) => m + 1);
	};

	const hoje = () => {
		const a = new Date();
		setMes(a.getMonth());
		setAno(a.getFullYear());
		setDia(a.getDate());
	};

	const texto = formatarExibicao(value);

	return (
		<div className='grid gap-2'>
			<Label className='text-sm font-medium leading-none' required={required}>
				{label}
			</Label>
			<button
				type='button'
				disabled={disabled}
				onClick={abrir}
				className={cn(
					"flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors",
					"hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					disabled && "cursor-not-allowed opacity-50"
				)}>
				<span className={cn("flex-1 text-left", !texto && "text-muted-foreground")}>{texto || placeholder}</span>
				<Calendar className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden />
			</button>

			<Dialog open={aberto} onOpenChange={setAberto}>
				<DialogContent className='sm:max-w-md p-4'>
					<DialogHeader>
						<DialogTitle className='text-base'>Selecionar data</DialogTitle>
					</DialogHeader>

					<div className='min-w-0'>
						<div className='mb-2 flex items-center justify-between'>
							<button
								type='button'
								onClick={mesAnterior}
								disabled={!podeMesAnterior}
								className={cn(
									"rounded p-1 transition-colors hover:bg-accent",
									!podeMesAnterior && "cursor-not-allowed opacity-40 hover:bg-transparent"
								)}>
								<ChevronLeft className='h-4 w-4' />
							</button>
							<span className='text-sm font-semibold'>
								{MESES_PT[mes]} {ano}
							</span>
							<button type='button' onClick={proximoMes} className='rounded p-1 transition-colors hover:bg-accent'>
								<ChevronRight className='h-4 w-4' />
							</button>
						</div>

						<div className='mb-1 grid grid-cols-7'>
							{DIAS_SEMANA_CURTOS.map((d) => (
								<span key={d} className='py-0.5 text-center text-[10px] font-semibold text-muted-foreground'>
									{d}
								</span>
							))}
						</div>

						<div className='grid grid-cols-7'>
							{obterDiasDoMes(ano, mes).map((dCell, i) => {
								if (dCell == null) return <div key={`e-${i}`} className='aspect-square' />;
								const sel = dCell === dia;
								const ymdCel = paraYmdLocal(new Date(ano, mes, dCell));
								const antesDoMinimo = Boolean(dataMinimaYmd && ymdCel < dataMinimaYmd);
								return (
									<button
										key={`d-${i}`}
										type='button'
										disabled={antesDoMinimo}
										onClick={() => !antesDoMinimo && setDia(dCell)}
										className={cn(
											"flex aspect-square items-center justify-center rounded-full text-xs transition-colors",
											sel ? "bg-primary font-semibold text-primary-foreground" : "hover:bg-accent",
											antesDoMinimo && "cursor-not-allowed text-muted-foreground opacity-40 hover:bg-transparent"
										)}>
										{dCell}
									</button>
								);
							})}
						</div>

						<div className='mt-2 flex justify-end border-t pt-2'>
							<button type='button' onClick={hoje} className='text-xs text-primary hover:underline'>
								Hoje
							</button>
						</div>
					</div>

					<div className='flex items-center justify-between rounded-md border px-3 py-2 text-sm text-muted-foreground'>
						<span>
							{pad2(dia)}/{pad2(mes + 1)}/{ano}
						</span>
						<Calendar className='h-4 w-4' aria-hidden />
					</div>

					<DialogFooter className='gap-2 sm:gap-2'>
						<Button type='button' variant='outline' className='flex-1' onClick={() => setAberto(false)}>
							Cancelar
						</Button>
						<Button type='button' className='flex-1' onClick={confirmar}>
							Confirmar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
