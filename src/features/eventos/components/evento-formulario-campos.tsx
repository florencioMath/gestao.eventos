import { paraYmdLocal } from "@/components/base/calendario-pt-shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/base/card";
import { CategoriaELocalFormulario } from "@/features/eventos/components/categoria-local-formulario";
import { PeriodoDatasEventoFormulario } from "@/features/eventos/components/periodo-datas-evento-form";
import { EditorDescricaoRica } from "@/components/base/editor-descricao-rica";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { SeletorDataPt } from "@/components/base/seletor-data-pt";
import { SeletorHora24 } from "@/components/base/seletor-hora-24";
import { Select } from "@/components/base/select";
import { descricaoHtmlNaoVazia } from "@/lib/descricao-html-texto";
import type { EventoFormValores } from "@/features/eventos/types";
import type { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";

type BlocoProps = {
	disabled?: boolean;
	apenasDatasFuturas?: boolean;
};

function ConteudoIdentificacaoTextos({ disabled }: Pick<BlocoProps, "disabled">) {
	const { register, control } = useFormContext<EventoFormValores>();
	return (
		<>
			<div className='grid gap-2'>
				<Label htmlFor='nomeEvento' required>
					Nome do evento
				</Label>
				<Input id='nomeEvento' {...register("nomeEvento", { required: true })} disabled={disabled} />
			</div>
			<div className='grid gap-2'>
				<Label htmlFor='descricao' required>
					Descrição
				</Label>
				<Controller
					name='descricao'
					control={control}
					rules={{
						validate: (v) => descricaoHtmlNaoVazia(v) || "A descrição é obrigatória",
					}}
					render={({ field }) => (
						<EditorDescricaoRica
							id='descricao'
							value={field.value ?? ""}
							onChange={field.onChange}
							disabled={disabled}
							placeholder='Texto formatado: negrito, listas, links, tamanho e cor…'
						/>
					)}
				/>
			</div>
			<div className='grid gap-2'>
				<Label htmlFor='textoSucessoRegistro' required>
					Texto de sucesso de registro
				</Label>
				<Controller
					name='textoSucessoRegistro'
					control={control}
					rules={{
						validate: (v) => descricaoHtmlNaoVazia(v) || "O texto de sucesso de registro é obrigatório",
					}}
					render={({ field }) => (
						<EditorDescricaoRica
							id='textoSucessoRegistro'
							value={field.value ?? ""}
							onChange={field.onChange}
							disabled={disabled}
							placeholder='Mensagem após inscrição confirmada (mesmo tipo de formatação que a descrição).'
						/>
					)}
				/>
			</div>
		</>
	);
}

function ConteudoIngressoPorCpf({ disabled }: Pick<BlocoProps, "disabled">) {
	const { register } = useFormContext<EventoFormValores>();
	return (
		<div className='grid gap-2 sm:max-w-xs'>
			<Label htmlFor='ingressoPorCpf' required>
				Ingresso por CPF
			</Label>
			<Input
				id='ingressoPorCpf'
				type='number'
				min={1}
				step={1}
				{...register("ingressoPorCpf", {
					valueAsNumber: true,
					required: true,
					min: { value: 1, message: "Mínimo 1" },
					validate: (v) =>
						(Number.isFinite(v) && Number(v) >= 1) || "Indique um número inteiro maior ou igual a 1",
				})}
				disabled={disabled}
			/>
		</div>
	);
}

function ConteudoCategoriaELocal({ disabled }: Pick<BlocoProps, "disabled">) {
	return <CategoriaELocalFormulario disabled={disabled} />;
}

function ConteudoPeriodoDatas({ disabled, apenasDatasFuturas }: BlocoProps) {
	return <PeriodoDatasEventoFormulario disabled={disabled} apenasDatasFuturas={apenasDatasFuturas} />;
}

function ConteudoPortalEInicioReservas({ disabled, apenasDatasFuturas }: BlocoProps) {
	const { control, getValues } = useFormContext<EventoFormValores>();
	const hojeYmd = paraYmdLocal(new Date());
	return (
		<div className='rounded-lg border border-border bg-muted/15 p-4'>
			<p className='mb-3 text-sm font-medium'>Portal e início das reservas</p>
			<p className='mb-4 text-xs text-muted-foreground'>
				Com <span className='font-medium text-foreground'>Exibir no catálogo</span> desligado, o evento fica oculto no
				portal. Com ligado, o evento aparece no catálogo; antes da data e hora de início de vendas aparece como «Em
				breve» e não permite reserva.
			</p>
			<div className='space-y-4'>
				<Controller
					name='dataInicioExibicaoApp'
					control={control}
					rules={{
						required: true,
						validate: (y) => {
							const f = (getValues("dataDesativacaoAutomatica") ?? "").trim().slice(0, 10);
							const v = (y ?? "").trim().slice(0, 10);
							if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "Indique a data.";
							if (/^\d{4}-\d{2}-\d{2}$/.test(f) && v > f) return "Não pode ser posterior à desativação automática.";
							return true;
						},
					}}
					render={({ field, fieldState }) => (
						<div className='grid gap-1'>
							<SeletorDataPt
								label='Início da exibição no aplicativo'
								required
								value={field.value ?? ""}
								onChange={field.onChange}
								disabled={disabled}
								placeholder='dd/mm/aaaa'
								dataMinimaYmd={apenasDatasFuturas ? hojeYmd : undefined}
							/>
							{fieldState.error?.message ? (
								<p className='text-xs text-destructive' role='alert'>
									{fieldState.error.message}
								</p>
							) : null}
						</div>
					)}
				/>
				<Controller
					name='dataInicioExibicaoPortal'
					control={control}
					rules={{
						required: true,
						validate: (y) => {
							const f = (getValues("dataDesativacaoAutomatica") ?? "").trim().slice(0, 10);
							const v = (y ?? "").trim().slice(0, 10);
							if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "Indique a data.";
							if (/^\d{4}-\d{2}-\d{2}$/.test(f) && v > f) return "Não pode ser posterior à desativação automática.";
							return true;
						},
					}}
					render={({ field, fieldState }) => (
						<div className='grid gap-1'>
							<SeletorDataPt
								label='Início da exibição no portal'
								required
								value={field.value ?? ""}
								onChange={field.onChange}
								disabled={disabled}
								placeholder='dd/mm/aaaa'
								dataMinimaYmd={apenasDatasFuturas ? hojeYmd : undefined}
							/>
							{fieldState.error?.message ? (
								<p className='text-xs text-destructive' role='alert'>
									{fieldState.error.message}
								</p>
							) : null}
						</div>
					)}
				/>
				<div className='grid gap-4 sm:grid-cols-2'>
					<Controller
						name='dataInicioVendasDia'
						control={control}
						rules={{
							required: true,
							validate: (y) => (/^\d{4}-\d{2}-\d{2}$/.test((y ?? "").trim().slice(0, 10)) ? true : "Indique a data."),
						}}
						render={({ field, fieldState }) => (
							<div className='grid gap-1'>
								<SeletorDataPt
									label='Início das vendas (dia)'
									required
									value={field.value ?? ""}
									onChange={field.onChange}
									disabled={disabled}
									placeholder='dd/mm/aaaa'
									dataMinimaYmd={apenasDatasFuturas ? hojeYmd : undefined}
								/>
								{fieldState.error?.message ? (
									<p className='text-xs text-destructive' role='alert'>
										{fieldState.error.message}
									</p>
								) : null}
							</div>
						)}
					/>
					<Controller
						name='horaInicioVendas'
						control={control}
						rules={{ required: true }}
						render={({ field }) => (
							<SeletorHora24
								label='Início das vendas (hora)'
								required
								value={field.value ?? "09:00"}
								onChange={field.onChange}
								disabled={disabled}
								placeholder='hh:mm'
							/>
						)}
					/>
				</div>
				<Controller
					name='exibirVagas'
					control={control}
					render={({ field }) => (
						<label className='flex cursor-pointer items-start gap-2 text-sm'>
							<input
								type='checkbox'
								className='mt-0.5 size-4 shrink-0 rounded border border-input accent-primary'
								checked={Boolean(field.value)}
								disabled={disabled}
								onChange={(e) => field.onChange(e.target.checked)}
							/>
							<span>Exibir vagas (total no portal)</span>
						</label>
					)}
				/>
				<div className='grid min-w-0 gap-2'>
					<Label htmlFor='exibir-no-portal-status'>Exibir para o cidadão</Label>
					<Controller
						name='exibirParaCidadao'
						control={control}
						render={({ field }) => (
							<Select
								triggerId='exibir-no-portal-status'
								value={field.value ? "true" : "false"}
								onValueChange={(v) => field.onChange(v === "true")}
								disabled={disabled}
								options={[
									{ value: "true", label: "Sim" },
									{ value: "false", label: "Não" },
								]}
							/>
						)}
					/>
					<p className='text-xs text-muted-foreground' id='exibir-no-portal-status-hint'>
						Com <span className='font-medium text-foreground'>Não</span>, o evento deixa de aparecer no catálogo do
						portal, independentemente das datas.
					</p>
				</div>
			</div>
		</div>
	);
}

function ConteudoDesativacaoAutomatica({ disabled, apenasDatasFuturas }: BlocoProps) {
	const { control } = useFormContext<EventoFormValores>();
	const hojeYmd = paraYmdLocal(new Date());
	return (
		<Controller
			name='dataDesativacaoAutomatica'
			control={control}
			rules={{ required: true }}
			render={({ field }) => (
				<SeletorDataPt
					label='Desativação automática (data)'
					required
					value={field.value ?? ""}
					onChange={field.onChange}
					disabled={disabled}
					placeholder='dd/mm/aaaa'
					dataMinimaYmd={apenasDatasFuturas ? hojeYmd : undefined}
				/>
			)}
		/>
	);
}

function ConteudoVagasTotais({ disabled }: Pick<BlocoProps, "disabled">) {
	const { register } = useFormContext<EventoFormValores>();
	return (
		<div className='grid gap-2 sm:max-w-xs'>
			<Label htmlFor='quantidadeIngressosTotal' required>
				Vagas totais
			</Label>
			<Input
				id='quantidadeIngressosTotal'
				className='h-10'
				type='number'
				min={1}
				{...register("quantidadeIngressosTotal", {
					valueAsNumber: true,
					required: true,
					min: { value: 1, message: "Mínimo 1" },
					validate: (v) =>
						(Number.isFinite(v) && Number(v) >= 1) || "Indique um número válido de vagas (mínimo 1)",
				})}
				disabled={disabled}
			/>
		</div>
	);
}

type Props = BlocoProps & {
	/**
	 * Painel «Editar evento»: mesma separação em cards que «Novo evento» (identificação, classificação, datas;
	 * vagas e lotes ficam no `EventoFormulario`).
	 */
	layoutPainelCardsComoNovoEvento?: boolean;
	/**
	 * Com `layoutPainelCardsComoNovoEvento`: conteúdo extra no fundo da **coluna da direita** (ex.: card vagas/lotes).
	 * Duas colunas em `flex` evitam o «buraco» da grelha quando um card é muito mais alto que o vizinho na mesma fila.
	 */
	painelExtensaoColunaDireita?: ReactNode;
};

export function EventoFormularioCampos({
	disabled,
	apenasDatasFuturas,
	layoutPainelCardsComoNovoEvento,
	painelExtensaoColunaDireita,
}: Props) {
	if (layoutPainelCardsComoNovoEvento) {
		return (
			<div className='flex w-full min-w-0 flex-col gap-6 sm:flex-row sm:items-start sm:gap-6'>
				<div className='flex min-w-0 flex-1 flex-col gap-6'>
					<Card className='min-w-0'>
						<CardHeader>
							<CardTitle>Identificação</CardTitle>
							<CardDescription>Nome e descrição do evento (descrição com formatação).</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<ConteudoIdentificacaoTextos disabled={disabled} />
						</CardContent>
					</Card>
					<Card className='min-w-0'>
						<CardHeader>
							<CardTitle>Datas e horários</CardTitle>
							<CardDescription>Realização do evento, janela no portal e abertura de reservas.</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<ConteudoPeriodoDatas disabled={disabled} apenasDatasFuturas={apenasDatasFuturas} />
							<ConteudoPortalEInicioReservas disabled={disabled} apenasDatasFuturas={apenasDatasFuturas} />
							<ConteudoDesativacaoAutomatica disabled={disabled} apenasDatasFuturas={apenasDatasFuturas} />
						</CardContent>
					</Card>
				</div>
				<div className='flex min-w-0 flex-1 flex-col gap-6'>
					<Card className='min-w-0'>
						<CardHeader>
							<CardTitle>Classificação e pontos de troca</CardTitle>
							<CardDescription>Categoria e pontos de troca de ingresso (listas do servidor).</CardDescription>
						</CardHeader>
						<CardContent>
							<ConteudoCategoriaELocal disabled={disabled} />
						</CardContent>
					</Card>
					{painelExtensaoColunaDireita}
				</div>
			</div>
		);
	}
	return (
		<div className='space-y-4'>
			<ConteudoIdentificacaoTextos disabled={disabled} />
			<ConteudoIngressoPorCpf disabled={disabled} />
			<ConteudoCategoriaELocal disabled={disabled} />
			<ConteudoPeriodoDatas disabled={disabled} apenasDatasFuturas={apenasDatasFuturas} />
			<ConteudoPortalEInicioReservas disabled={disabled} apenasDatasFuturas={apenasDatasFuturas} />
			<ConteudoDesativacaoAutomatica disabled={disabled} apenasDatasFuturas={apenasDatasFuturas} />
			<ConteudoVagasTotais disabled={disabled} />
		</div>
	);
}
