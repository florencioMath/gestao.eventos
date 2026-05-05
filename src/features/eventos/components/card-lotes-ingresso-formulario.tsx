import { Button } from "@/components/base/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/base/card";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { SeletorDataPt } from "@/components/base/seletor-data-pt";
import { SeletorHora24 } from "@/components/base/seletor-hora-24";
import { Select } from "@/components/base/select";
import {
	criarLoteIngressoVazio,
	opcoesModoLoteSeguinte,
	opcoesModoPrimeiroLote,
} from "@/features/eventos/lib/lotes-ingresso";
import type { EventoFormValores, ModoLiberacaoLoteIngresso } from "@/features/eventos/types";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";

type CardLotesProps = {
	disabled?: boolean;
	/** Quando verdadeiro, não renderiza o `Card` externo (útil para agrupar vagas e lotes no mesmo card). */
	semEnvelope?: boolean;
};

export function CardLotesIngressoFormulario({ disabled = false, semEnvelope = false }: CardLotesProps) {
	const { control, register, setValue } = useFormContext<EventoFormValores>();
	const { fields, append, remove } = useFieldArray({ control, name: "lotes" });
	const totalVagas = useWatch({ control, name: "quantidadeIngressosTotal" });
	const lotes = useWatch({ control, name: "lotes" });

	const soma = (lotes ?? []).reduce((s, l) => s + Math.max(0, Math.floor(Number(l?.quantidade) || 0)), 0);
	const total = Math.max(0, Math.floor(Number(totalVagas) || 0));
	const restanteParaNovoLote = Math.max(0, total - soma);
	const podeAdicionarLote = !disabled && restanteParaNovoLote > 0 && fields.length < 10;

	useEffect(() => {
		if (fields.length !== 1) return;
		setValue("lotes.0.quantidade", total, { shouldValidate: false, shouldDirty: false });
	}, [total, fields.length, setValue]);

	const tituloLotes = (
		<div className={semEnvelope ? "space-y-1.5" : undefined}>
			{semEnvelope ? (
				<h3 className='text-sm font-semibold leading-none tracking-tight'>
					Lotes de venda
					<span className='text-destructive' aria-hidden>
						{" "}
						*
					</span>
				</h3>
			) : (
				<CardTitle className='flex flex-wrap items-baseline gap-1'>
					Lotes de venda
					<span className='text-destructive' aria-hidden>
						*
					</span>
				</CardTitle>
			)}
			{semEnvelope ? (
				<p className='text-sm text-muted-foreground'>
					Divida as <span className='font-medium text-foreground'>vagas totais</span> em lotes. O primeiro lote pode abrir
					<strong> após o início global de vendas do evento</strong> ou numa <strong>data/hora</strong> (pode ser no passado — útil quando a
					venda já começou antes do evento). Os seguintes podem abrir por <strong>data/hora</strong> ou{" "}
					<strong>após esgotar</strong> o lote anterior. Só é possível <strong>adicionar outro lote</strong> enquanto a soma
					for menor que o total — o novo lote recebe automaticamente as vagas em falta (ex.: 50 totais, 1.º lote 30 → o 2.º
					vem com 20).
				</p>
			) : (
				<CardDescription>
					Divida as <span className='font-medium text-foreground'>vagas totais</span> em lotes. O primeiro lote pode abrir
					<strong> após o início global de vendas do evento</strong> ou numa <strong>data/hora</strong> (pode ser no passado — útil quando a
					venda já começou antes do evento). Os seguintes podem abrir por <strong>data/hora</strong> ou{" "}
					<strong>após esgotar</strong> o lote anterior. Só é possível <strong>adicionar outro lote</strong> enquanto a soma
					for menor que o total — o novo lote recebe automaticamente as vagas em falta (ex.: 50 totais, 1.º lote 30 → o 2.º
					vem com 20).
				</CardDescription>
			)}
		</div>
	);

	const corpo = (
		<div className='space-y-4'>
			{semEnvelope ? <div className='space-y-3'>{tituloLotes}</div> : null}
			<p className='rounded-md border bg-muted/40 px-3 py-2 text-sm'>
					<span className='text-muted-foreground'>Soma dos lotes:</span>{" "}
					<span className={soma === total && total > 0 ? "font-semibold text-foreground" : "font-semibold text-destructive"}>
						{soma}
					</span>
					<span className='text-muted-foreground'> / vagas totais: </span>
					<span className='font-semibold'>{total}</span>
					{soma !== total ? (
						<span className='mt-1 block text-xs text-destructive'>A soma tem de ser igual às vagas totais.</span>
					) : null}
			</p>

			<ul className='space-y-4'>
					{fields.map((field, index) => {
						const isPrimeiro = index === 0;
						const opcoesModo = isPrimeiro ? opcoesModoPrimeiroLote() : opcoesModoLoteSeguinte();
						return (
							<li key={field.id} className='rounded-lg border bg-card p-4 shadow-sm'>
								<div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
									<p className='text-sm font-medium'>Lote {index + 1}</p>
									{fields.length > 1 ? (
										<Button
											type='button'
											variant='outline'
											size='sm'
											disabled={disabled}
											className='border-destructive/50 text-destructive hover:bg-destructive/10'
											onClick={() => remove(index)}>
											<Trash2 className='h-4 w-4' />
											Remover lote
										</Button>
									) : null}
								</div>
								<div className='grid gap-3 sm:grid-cols-2'>
									<div className='grid gap-2'>
										<Label htmlFor={`lote-rotulo-${field.id}`}>Nome do lote</Label>
										<Input
											id={`lote-rotulo-${field.id}`}
											disabled={disabled}
											{...register(`lotes.${index}.rotulo` as const)}
											placeholder={`Ex.: Lote promocional`}
										/>
									</div>
									<div className='grid gap-2'>
										<Label htmlFor={`lote-qtd-${field.id}`} required>
											Vagas deste lote
										</Label>
										<Input
											id={`lote-qtd-${field.id}`}
											type='number'
											min={1}
											disabled={disabled}
											{...register(`lotes.${index}.quantidade` as const, { valueAsNumber: true, min: 1, required: true })}
										/>
									</div>
									<div className='grid gap-2 sm:col-span-2'>
										<Label>Liberação das reservas</Label>
										<Controller
											name={`lotes.${index}.modoLiberacao` as const}
											control={control}
											render={({ field: f }) => (
												<Select
													triggerId={`lote-modo-${field.id}`}
													disabled={disabled}
													value={f.value}
													onValueChange={(v) => {
														const modo = v as ModoLiberacaoLoteIngresso;
														f.onChange(modo);
														if (modo !== "DATA_HORA") {
															setValue(`lotes.${index}.dataLiberacaoVenda`, "");
														}
													}}
													options={opcoesModo.map((o) => ({ value: o.value, label: o.label }))}
												/>
											)}
										/>
									</div>
									{lotes?.[index]?.modoLiberacao === "DATA_HORA" ? (
										<>
											<Controller
												name={`lotes.${index}.dataLiberacaoVenda` as const}
												control={control}
												render={({ field: f }) => (
													<SeletorDataPt
														label='Início da venda (data)'
														disabled={disabled}
														value={f.value ?? ""}
														onChange={f.onChange}
														placeholder='dd/mm/aaaa'
													/>
												)}
											/>
											<Controller
												name={`lotes.${index}.horaLiberacaoVenda` as const}
												control={control}
												render={({ field: f }) => (
													<SeletorHora24
														label='Início da venda (hora)'
														disabled={disabled}
														value={f.value ?? "09:00"}
														onChange={f.onChange}
														placeholder='hh:mm'
													/>
												)}
											/>
										</>
									) : null}
								</div>
							</li>
						);
					})}
			</ul>

			<Button
					type='button'
					variant='secondary'
					className='gap-2'
					disabled={disabled || !podeAdicionarLote}
					title={
						!podeAdicionarLote
							? fields.length >= 10
								? "Limite de 10 lotes."
								: "A soma dos lotes já cobre todas as vagas totais. Reduza a quantidade num lote para liberar vagas a um novo lote."
							: `Adiciona um lote com as ${restanteParaNovoLote} vagas ainda por distribuir.`
					}
					onClick={() => {
						if (restanteParaNovoLote <= 0) return;
						append(
							criarLoteIngressoVazio(fields.length, {
								quantidade: restanteParaNovoLote,
								modoLiberacao: "APOS_ESGOTAR_ANTERIOR",
								rotulo: `${fields.length + 1}.º lote`,
							})
						);
					}}>
					<Plus className='h-4 w-4' />
					Adicionar lote
					{restanteParaNovoLote > 0 ? (
						<span className='text-muted-foreground font-normal'>(+{restanteParaNovoLote} vagas)</span>
					) : null}
			</Button>
		</div>
	);

	if (semEnvelope) {
		return corpo;
	}

	return (
		<Card>
			<CardHeader>{tituloLotes}</CardHeader>
			<CardContent className='space-y-4'>{corpo}</CardContent>
		</Card>
	);
}
