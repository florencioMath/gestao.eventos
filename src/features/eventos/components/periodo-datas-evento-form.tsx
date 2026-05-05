import {
	compararHm,
	horaMinimaLocalAgora,
	paraYmdLocal,
} from "@/components/base/calendario-pt-shared";
import { Button } from "@/components/base/button";
import { SeletorDataPt } from "@/components/base/seletor-data-pt";
import { SeletorHora24 } from "@/components/base/seletor-hora-24";
import {
	adicionarUmDiaYmd,
	formatarDataPortugues,
	normalizarHoraHm,
	ordenarProgramacaoDiaria,
} from "@/features/eventos/lib/datas-evento";
import type { EventoFormValores, EventoProgramacaoDiaDto } from "@/features/eventos/types";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

type Props = {
	disabled?: boolean;
	/** Se definido, a data de início não pode ser anterior a este dia (ex.: hoje em cadastros novos). */
	apenasDatasFuturas?: boolean;
};

function ordenarProg(p: EventoProgramacaoDiaDto[]): EventoProgramacaoDiaDto[] {
	return ordenarProgramacaoDiaria(
		p.map((x) => ({
			data: x.data.trim().slice(0, 10),
			horaInicio: normalizarHoraHm(x.horaInicio),
			horaFim: normalizarHoraHm(x.horaFim),
		}))
	);
}

export function PeriodoDatasEventoFormulario({ disabled, apenasDatasFuturas }: Props) {
	const { control, setValue, getValues } = useFormContext<EventoFormValores>();
	const dataEvento = useWatch({ control, name: "dataEvento" });
	const eventoVariosDias = useWatch({ control, name: "eventoVariosDias" });
	const programacaoDiaria = useWatch({ control, name: "programacaoDiaria" }) as EventoProgramacaoDiaDto[] | undefined;
	const hojeYmd = paraYmdLocal(new Date());

	const linhasOrdenadas = useMemo(() => ordenarProg(programacaoDiaria ?? []), [programacaoDiaria]);

	const sincronizarFimEHorasGlobais = useCallback(
		(prog: EventoProgramacaoDiaDto[]) => {
			const ord = ordenarProg(prog);
			if (ord.length === 0) return;
			const primeiro = ord[0]!;
			const último = ord[ord.length - 1]!;
			setValue("dataEvento", primeiro.data, { shouldDirty: true });
			setValue("dataFimEventoDia", último.data, { shouldDirty: true });
			setValue("horaInicio", primeiro.horaInicio, { shouldDirty: true });
			setValue("horaFim", último.horaFim, { shouldDirty: true });
		},
		[setValue]
	);

	useEffect(() => {
		if (apenasDatasFuturas !== true) return;
		if (dataEvento !== hojeYmd) return;
		const agora = horaMinimaLocalAgora();
		const hi = getValues("horaInicio") ?? "00:00";
		if (compararHm(hi, agora) < 0) setValue("horaInicio", agora);
	}, [apenasDatasFuturas, dataEvento, hojeYmd, setValue, getValues]);

	const dataMinimaInicio = apenasDatasFuturas === true ? hojeYmd : undefined;
	const dataMinimaSegundoDia = (dataLinhaYmd: string) => {
		const inicio = (getValues("dataEvento") ?? "").trim().slice(0, 10);
		if (/^\d{4}-\d{2}-\d{2}$/.test(inicio) && /^\d{4}-\d{2}-\d{2}$/.test(dataLinhaYmd)) {
			return inicio > dataLinhaYmd ? inicio : dataLinhaYmd;
		}
		return inicio || (apenasDatasFuturas === true ? hojeYmd : undefined);
	};

	const atualizarDataLinha = (idxOrdenado: number, novaDataYmd: string) => {
		const ord = ordenarProg((getValues("programacaoDiaria") ?? []) as EventoProgramacaoDiaDto[]);
		if (idxOrdenado < 0 || idxOrdenado >= ord.length) return;
		const ymd = (novaDataYmd ?? "").trim().slice(0, 10);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return;
		const inicio = (getValues("dataEvento") ?? "").trim().slice(0, 10);
		if (/^\d{4}-\d{2}-\d{2}$/.test(inicio) && ymd < inicio && idxOrdenado > 0) return;
		const next = ord.map((row, i) => (i === idxOrdenado ? { ...row, data: ymd } : row));
		const sorted = ordenarProg(next);
		setValue("programacaoDiaria", sorted, { shouldDirty: true });
		sincronizarFimEHorasGlobais(sorted);
	};

	const atualizarHoraLinha = (idxOrdenado: number, campo: "horaInicio" | "horaFim", valor: string) => {
		const ord = ordenarProg((getValues("programacaoDiaria") ?? []) as EventoProgramacaoDiaDto[]);
		if (idxOrdenado < 0 || idxOrdenado >= ord.length) return;
		const next = ord.map((row, i) => (i === idxOrdenado ? { ...row, [campo]: valor } : row));
		setValue("programacaoDiaria", next, { shouldDirty: true });
		sincronizarFimEHorasGlobais(next);
	};

	const adicionarDia = () => {
		const base = (getValues("programacaoDiaria") ?? []) as EventoProgramacaoDiaDto[];
		const ord = ordenarProg(base.length > 0 ? base : [{ data: getValues("dataEvento") ?? hojeYmd, horaInicio: "09:00", horaFim: "18:00" }]);
		const último = ord[ord.length - 1]!;
		const próximo = adicionarUmDiaYmd(último.data);
		const hi = normalizarHoraHm(último.horaInicio);
		const hf = normalizarHoraHm(último.horaFim);
		const next = ordenarProg([...ord, { data: próximo, horaInicio: hi, horaFim: hf }]);
		setValue("programacaoDiaria", next, { shouldDirty: true });
		sincronizarFimEHorasGlobais(next);
	};

	const removerDia = (idxOrdenado: number) => {
		if (idxOrdenado <= 0) return;
		const ord = ordenarProg((getValues("programacaoDiaria") ?? []) as EventoProgramacaoDiaDto[]);
		const removido = ord.filter((_, i) => i !== idxOrdenado);
		if (removido.length < 2) {
			setValue("eventoVariosDias", false, { shouldDirty: true });
			setValue("programacaoDiaria", undefined, { shouldDirty: true });
			const di = (getValues("dataEvento") ?? "").trim().slice(0, 10);
			if (/^\d{4}-\d{2}-\d{2}$/.test(di)) setValue("dataFimEventoDia", di, { shouldDirty: true });
			return;
		}
		const next = ordenarProg(removido);
		setValue("programacaoDiaria", next, { shouldDirty: true });
		sincronizarFimEHorasGlobais(next);
	};

	return (
		<div className='rounded-lg border border-border bg-muted/15 p-4'>
			<Controller
				name='eventoVariosDias'
				control={control}
				render={({ field }) => (
					<label
						htmlFor='evento-varios-dias'
						className='mb-4 flex cursor-pointer items-start gap-3 rounded-md border border-transparent p-1 hover:bg-muted/30'>
						<input
							id='evento-varios-dias'
							type='checkbox'
							className='mt-0.5 h-4 w-4 shrink-0 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
							checked={Boolean(field.value)}
							disabled={disabled}
							onChange={(e) => {
								const checked = e.target.checked;
								field.onChange(checked);
								if (checked) {
									const di = (getValues("dataEvento") ?? "").trim().slice(0, 10);
									const hi = normalizarHoraHm(getValues("horaInicio") ?? "09:00");
									const hf = normalizarHoraHm(getValues("horaFim") ?? "18:00");
									const ymd = /^\d{4}-\d{2}-\d{2}$/.test(di) ? di : hojeYmd;
									const d2 = adicionarUmDiaYmd(ymd);
									const next = ordenarProg([
										{ data: ymd, horaInicio: hi, horaFim: hf },
										{ data: d2, horaInicio: hi, horaFim: hf },
									]);
									setValue("programacaoDiaria", next, { shouldDirty: true });
									sincronizarFimEHorasGlobais(next);
								} else {
									setValue("programacaoDiaria", undefined, { shouldDirty: true });
									const di = (getValues("dataEvento") ?? "").trim().slice(0, 10);
									if (/^\d{4}-\d{2}-\d{2}$/.test(di)) setValue("dataFimEventoDia", di, { shouldDirty: true });
								}
							}}
						/>
						<span className='min-w-0'>
							<span className='block text-sm font-medium leading-snug'>Evento com mais de um dia</span>
							<span className='mt-0.5 block text-xs text-muted-foreground'>
								Adicione cada dia com «+ Adicionar dia»; use a lixeira para remover (com dois dias, ao apagar o segundo o
								evento volta a um único dia). As datas são ordenadas automaticamente.
							</span>
						</span>
					</label>
				)}
			/>

			<div className='space-y-4'>
				{!eventoVariosDias ? (
					<>
						<div className='grid gap-4 sm:max-w-xs'>
							<Controller
								name='dataEvento'
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<SeletorDataPt
										label='Data do evento'
										required
										value={field.value ?? ""}
										onChange={field.onChange}
										disabled={disabled}
										placeholder='dd/mm/aaaa'
										dataMinimaYmd={dataMinimaInicio}
									/>
								)}
							/>
						</div>
						<div className='grid gap-4 sm:grid-cols-2'>
							<Controller
								name='horaInicio'
								control={control}
								render={({ field }) => {
									const horaMinInicio =
										apenasDatasFuturas === true && dataEvento === hojeYmd ? horaMinimaLocalAgora() : undefined;
									return (
										<SeletorHora24
											label='Hora início'
											required
											value={field.value ?? "09:00"}
											onChange={field.onChange}
											disabled={disabled}
											placeholder='hh:mm'
											horaMinima={horaMinInicio}
										/>
									);
								}}
							/>
							<Controller
								name='horaFim'
								control={control}
								render={({ field }) => (
									<SeletorHora24
										label='Hora fim'
										required
										value={field.value ?? "18:00"}
										onChange={field.onChange}
										disabled={disabled}
										placeholder='hh:mm'
									/>
								)}
							/>
						</div>
					</>
				) : (
					<div className='space-y-3'>
						<p className='text-sm font-medium'>Dias e horários</p>
						<ul className='space-y-3 rounded-md border border-border bg-card/40 p-3'>
							{linhasOrdenadas.map((linha, idx) => (
								<li
									key={`${linha.data}-${idx}`}
									className={cn(
										"grid gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0",
										"sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
									)}>
									<SeletorDataPt
										label={`Dia ${idx + 1}`}
										required
										value={linha.data}
										onChange={(v) => atualizarDataLinha(idx, v)}
										disabled={disabled}
										placeholder='dd/mm/aaaa'
										dataMinimaYmd={idx === 0 ? dataMinimaInicio : dataMinimaSegundoDia(linha.data)}
									/>
									<SeletorHora24
										label='Início'
										required
										value={linha.horaInicio}
										onChange={(v) => atualizarHoraLinha(idx, "horaInicio", v)}
										disabled={disabled}
										placeholder='hh:mm'
										horaMinima={
											apenasDatasFuturas === true && linha.data === hojeYmd ? horaMinimaLocalAgora() : undefined
										}
									/>
									<SeletorHora24
										label='Fim'
										required
										value={linha.horaFim}
										onChange={(v) => atualizarHoraLinha(idx, "horaFim", v)}
										disabled={disabled}
										placeholder='hh:mm'
									/>
									<div className='flex items-end justify-end pb-0.5 sm:pb-1'>
										{idx > 0 ? (
											<Button
												type='button'
												variant='ghost'
												size='icon'
												className='shrink-0 text-muted-foreground hover:text-destructive'
												disabled={disabled}
												aria-label={`Remover dia ${formatarDataPortugues(linha.data)}`}
												title='Remover dia'
												onClick={() => removerDia(idx)}>
												<Trash2 className='h-4 w-4' aria-hidden />
											</Button>
										) : (
											<span className='inline-flex h-10 w-10 shrink-0' aria-hidden />
										)}
									</div>
								</li>
							))}
						</ul>
						<Button
							type='button'
							variant='outline'
							size='sm'
							className='gap-1.5'
							disabled={disabled}
							onClick={() => adicionarDia()}>
							<Plus className='h-4 w-4' aria-hidden />
							Adicionar dia
						</Button>
					</div>
				)}
			</div>
			{!eventoVariosDias ? (
				<p className='mt-3 text-xs text-muted-foreground'>
					Por omissão o evento ocorre num único dia; marque a opção acima para definir vários dias um a um.
				</p>
			) : null}
		</div>
	);
}
