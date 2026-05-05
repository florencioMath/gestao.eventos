import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Label } from "./label";
import { ITEM_ALTURA_ROLO, pad2 } from "./calendario-pt-shared";

const HORAS = Array.from({ length: 24 }, (_, i) => i);
const MINUTOS = Array.from({ length: 60 }, (_, i) => i);

function parseHm(v: string): { h: number; m: number } {
	const m = (v ?? "").trim().match(/^(\d{1,2}):(\d{2})/);
	if (!m) return { h: 9, m: 0 };
	const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
	const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
	return { h, m: min };
}

function paraHm(h: number, m: number): string {
	return `${pad2(h)}:${pad2(m)}`;
}

function limHoraMinima(horaMinima?: string): { h: number; m: number } | null {
	if (!horaMinima?.trim()) return null;
	const m = horaMinima.trim().match(/^(\d{1,2}):(\d{2})/);
	if (!m) return null;
	const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
	const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
	return { h, m: min };
}

type Props = {
	value: string;
	onChange: (hm: string) => void;
	label: string;
	required?: boolean;
	disabled?: boolean;
	placeholder?: string;
	/** `HH:mm` — horas/minutos anteriores ficam indisponíveis (ex.: hoje, não antes de agora). */
	horaMinima?: string;
};

export function SeletorHora24({ value, onChange, label, required, disabled, placeholder = "hh:mm", horaMinima }: Props) {
	const [aberto, setAberto] = useState(false);
	const lim = limHoraMinima(horaMinima);
	const { h: h0, m: m0 } = parseHm(value);
	const [hora, setHora] = useState(h0);
	const [minuto, setMinuto] = useState(m0);
	const refH = useRef<HTMLDivElement>(null);
	const refM = useRef<HTMLDivElement>(null);

	const encaixarEmMinimo = (h: number, m: number): { h: number; m: number } => {
		if (!lim) return { h, m };
		if (h < lim.h) return { h: lim.h, m: lim.m };
		if (h === lim.h && m < lim.m) return { h, m: lim.m };
		return { h, m };
	};

	useEffect(() => {
		if (!aberto) return;
		const limV = limHoraMinima(horaMinima);
		let { h, m } = parseHm(value);
		if (limV) {
			if (h < limV.h) {
				h = limV.h;
				m = limV.m;
			} else if (h === limV.h && m < limV.m) m = limV.m;
		}
		setHora(h);
		setMinuto(m);
		const t = setTimeout(() => {
			refH.current?.scrollTo({ top: h * ITEM_ALTURA_ROLO, behavior: "instant" });
			refM.current?.scrollTo({ top: m * ITEM_ALTURA_ROLO, behavior: "instant" });
		}, 80);
		return () => clearTimeout(t);
	}, [aberto, value, horaMinima]);

	const abrir = () => {
		if (disabled) return;
		const { h, m } = parseHm(value);
		const adj = encaixarEmMinimo(h, m);
		setHora(adj.h);
		setMinuto(adj.m);
		setAberto(true);
	};

	const confirmar = () => {
		const adj = encaixarEmMinimo(hora, minuto);
		onChange(paraHm(adj.h, adj.m));
		setAberto(false);
	};

	const scrollH = (h: number) => {
		let nh = h;
		let nm = minuto;
		if (lim && nh < lim.h) nh = lim.h;
		if (lim && nh === lim.h && nm < lim.m) nm = lim.m;
		setHora(nh);
		setMinuto(nm);
		refH.current?.scrollTo({ top: nh * ITEM_ALTURA_ROLO, behavior: "smooth" });
		if (nm !== minuto) refM.current?.scrollTo({ top: nm * ITEM_ALTURA_ROLO, behavior: "smooth" });
	};

	const scrollM = (m: number) => {
		let nm = m;
		if (lim && hora === lim.h && nm < lim.m) nm = lim.m;
		setMinuto(nm);
		refM.current?.scrollTo({ top: nm * ITEM_ALTURA_ROLO, behavior: "smooth" });
	};

	const texto = value?.trim() ? paraHm(parseHm(value).h, parseHm(value).m) : "";

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
				<span className={cn("flex-1 text-left tabular-nums", !texto && "text-muted-foreground")}>
					{texto || placeholder}
				</span>
				<Clock className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden />
			</button>

			<Dialog open={aberto} onOpenChange={setAberto}>
				<DialogContent className='sm:max-w-sm p-4'>
					<DialogHeader>
						<DialogTitle className='text-base'>Selecionar hora</DialogTitle>
					</DialogHeader>

					<div className='flex items-center justify-center gap-2'>
						<div className='relative h-44 w-11 overflow-hidden'>
							<div
								ref={refH}
								className='h-full overflow-y-auto scroll-smooth'
								style={{ scrollSnapType: "y mandatory" }}
								onScroll={(e) => {
									let i = Math.round(e.currentTarget.scrollTop / ITEM_ALTURA_ROLO);
									i = Math.min(23, Math.max(0, i));
									if (lim && i < lim.h) i = lim.h;
									setHora(i);
									if (lim && i === lim.h && minuto < lim.m) {
										setMinuto(lim.m);
										refM.current?.scrollTo({ top: lim.m * ITEM_ALTURA_ROLO, behavior: "smooth" });
									}
								}}>
								<div style={{ height: ITEM_ALTURA_ROLO * 2.5 }} />
								{HORAS.map((h) => {
									const bloqueada = Boolean(lim && h < lim.h);
									return (
										<div
											key={h}
											style={{ height: ITEM_ALTURA_ROLO, scrollSnapAlign: "center" }}
											className='flex items-center justify-center'>
											<button
												type='button'
												disabled={bloqueada}
												onClick={() => !bloqueada && scrollH(h)}
												className={cn(
													"h-8 w-8 rounded text-sm transition-colors",
													h === hora ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground",
													bloqueada && "cursor-not-allowed opacity-30 hover:text-muted-foreground"
												)}>
												{pad2(h)}
											</button>
										</div>
									);
								})}
								<div style={{ height: ITEM_ALTURA_ROLO * 2.5 }} />
							</div>
							<div
								className='pointer-events-none absolute left-0 right-0 border-y border-primary'
								style={{
									top: "50%",
									marginTop: -ITEM_ALTURA_ROLO / 2,
									height: ITEM_ALTURA_ROLO,
								}}
							/>
						</div>

						<span className='text-lg font-bold'>:</span>

						<div className='relative h-44 w-11 overflow-hidden'>
							<div
								ref={refM}
								className='h-full overflow-y-auto scroll-smooth'
								style={{ scrollSnapType: "y mandatory" }}
								onScroll={(e) => {
									let i = Math.round(e.currentTarget.scrollTop / ITEM_ALTURA_ROLO);
									i = Math.min(59, Math.max(0, i));
									if (lim && hora === lim.h && i < lim.m) i = lim.m;
									setMinuto(i);
								}}>
								<div style={{ height: ITEM_ALTURA_ROLO * 2.5 }} />
								{MINUTOS.map((m) => {
									const bloqueado = Boolean(lim && hora === lim.h && m < lim.m);
									return (
										<div
											key={m}
											style={{ height: ITEM_ALTURA_ROLO, scrollSnapAlign: "center" }}
											className='flex items-center justify-center'>
											<button
												type='button'
												disabled={bloqueado}
												onClick={() => !bloqueado && scrollM(m)}
												className={cn(
													"h-8 w-8 rounded text-sm transition-colors",
													m === minuto ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground",
													bloqueado && "cursor-not-allowed opacity-30 hover:text-muted-foreground"
												)}>
												{pad2(m)}
											</button>
										</div>
									);
								})}
								<div style={{ height: ITEM_ALTURA_ROLO * 2.5 }} />
							</div>
							<div
								className='pointer-events-none absolute left-0 right-0 border-y border-primary'
								style={{
									top: "50%",
									marginTop: -ITEM_ALTURA_ROLO / 2,
									height: ITEM_ALTURA_ROLO,
								}}
							/>
						</div>
					</div>

					<p className='text-center text-sm tabular-nums text-muted-foreground'>
						{pad2(hora)}:{pad2(minuto)}
					</p>

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
