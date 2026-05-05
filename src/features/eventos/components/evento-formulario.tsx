import { Button } from "@/components/base/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/base/card";
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/base/dialog";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { EventoEmDestaqueBarraFormulario } from "@/features/eventos/components/evento-em-destaque-barra-formulario";
import { CardLotesIngressoFormulario } from "@/features/eventos/components/card-lotes-ingresso-formulario";
import { EventoFormularioCampos } from "@/features/eventos/components/evento-formulario-campos";
import { criarLotesIniciaisParaTotal, validarLotesIngresso } from "@/features/eventos/lib/lotes-ingresso";
import { cn } from "@/lib/utils";
import type { EventoFormValores } from "@/features/eventos/types";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";

export type { EventoFormValores };

type Props = {
	defaultValues?: Partial<EventoFormValores>;
	onSubmit: (values: EventoFormValores) => Promise<void>;
	submitLabel: string;
	disabled?: boolean;
	/** Novo cadastro: data ≥ hoje e hora de início ≥ agora se o evento for hoje. */
	apenasDatasFuturas?: boolean;
	/** Diálogo largo: grelha (formulário | filhos) + rodapé fixo com envio. */
	layoutPainelEdicao?: boolean;
	/** Com `layoutPainelEdicao`: título no cabeçalho e barra «Em destaque» à direita (antes do fechar do diálogo). */
	tituloPainelEdicao?: string;
	/** Obrigatório com `layoutPainelEdicao` — liga o botão do rodapé ao `<form>`. */
	formId?: string;
	/** Exibe edição de lotes de venda (soma = vagas totais). */
	mostrarLotesIngresso?: boolean;
	children?: ReactNode;
	className?: string;
};

const padrao: EventoFormValores = {
	nomeEvento: "",
	descricao: "",
	textoSucessoRegistro: "",
	ingressoPorCpf: 1,
	categoria: "",
	pontosDeTrocaCodigos: [],
	semPontoDeTroca: false,
	dataEvento: "",
	dataFimEventoDia: "",
	eventoVariosDias: false,
	horaInicio: "09:00",
	horaFim: "18:00",
	dataInicioExibicaoApp: "",
	dataInicioExibicaoPortal: "",
	dataInicioVendasDia: "",
	horaInicioVendas: "09:00",
	dataDesativacaoAutomatica: "",
	quantidadeIngressosTotal: 50,
	exibirParaCidadao: true,
	exibirVagas: true,
	eventoEmDestaque: false,
	statusEvento: "ATIVO",
};

function mergeEventoFormDefaults(dv?: Partial<EventoFormValores>): EventoFormValores {
	const base = { ...padrao, ...dv };
	const total = base.quantidadeIngressosTotal ?? padrao.quantidadeIngressosTotal;
	const di = (base.dataEvento ?? "").trim().slice(0, 10);
	const appIni = (base.dataInicioExibicaoApp ?? "").trim().slice(0, 10);
	const portalIni = (base.dataInicioExibicaoPortal ?? "").trim().slice(0, 10);
	const vendasDia = (base.dataInicioVendasDia ?? "").trim().slice(0, 10);
	return {
		...base,
		eventoEmDestaque: Boolean(base.eventoEmDestaque),
		eventoVariosDias: Boolean(base.eventoVariosDias),
		dataFimEventoDia: base.dataFimEventoDia ?? "",
		semPontoDeTroca: Boolean(base.semPontoDeTroca),
		pontosDeTrocaCodigos: Array.isArray(base.pontosDeTrocaCodigos)
			? base.pontosDeTrocaCodigos.map((p) => ({ ...p }))
			: [],
		dataInicioExibicaoApp: /^\d{4}-\d{2}-\d{2}$/.test(appIni) ? appIni : di,
		dataInicioExibicaoPortal: /^\d{4}-\d{2}-\d{2}$/.test(portalIni) ? portalIni : di,
		dataInicioVendasDia: /^\d{4}-\d{2}-\d{2}$/.test(vendasDia) ? vendasDia : di,
		horaInicioVendas: (base.horaInicioVendas ?? "").trim() || base.horaInicio || padrao.horaInicioVendas,
		exibirParaCidadao: base.exibirParaCidadao !== false,
		exibirVagas: base.exibirVagas !== false,
		lotes: base.lotes != null && base.lotes.length > 0 ? base.lotes : criarLotesIniciaisParaTotal(total),
	};
}

function CardVagasELotesPainelEdicao({
	disabled,
	mostrarLotesIngresso,
}: {
	disabled?: boolean;
	mostrarLotesIngresso: boolean;
}) {
	const { register } = useFormContext<EventoFormValores>();
	return (
		<Card className='min-w-0 w-full'>
			<CardHeader>
				<CardTitle>Vagas e lotes de venda</CardTitle>
				<CardDescription>
					{mostrarLotesIngresso
						? "Capacidade, limite por CPF e distribuição das vagas em lotes com regras de liberação."
						: "Capacidade e limite por CPF."}
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-6'>
				<div className='space-y-4'>
					<p className='text-sm font-medium'>Capacidade</p>
					<div className='grid gap-4 sm:grid-cols-2 sm:max-w-xl'>
						<div className='grid gap-2'>
							<Label htmlFor='ingressoPorCpf' required>
								Ingresso por CPF
							</Label>
							<Input
								id='ingressoPorCpf'
								type='number'
								min={1}
								step={1}
								className='h-10'
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
						<div className='grid gap-2'>
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
					</div>
				</div>
				{mostrarLotesIngresso ? (
					<div className='border-t border-border pt-6'>
						<CardLotesIngressoFormulario disabled={disabled} semEnvelope />
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}

function BotaoSubmeterEventoFormulario({
	formId,
	submitLabel,
	disabled,
	isSubmitting,
}: {
	formId?: string;
	submitLabel: string;
	disabled?: boolean;
	isSubmitting: boolean;
}) {
	const { control } = useFormContext<EventoFormValores>();
	const lotes = useWatch({ control, name: "lotes" });
	const total = useWatch({ control, name: "quantidadeIngressosTotal" });
	const erroLotes = validarLotesIngresso(lotes, total);
	return (
		<Button
			type='submit'
			{...(formId ? { form: formId } : {})}
			disabled={disabled || isSubmitting || erroLotes != null}
			title={erroLotes ?? undefined}
			className={formId ? "min-w-[11rem]" : undefined}>
			{isSubmitting ? "Salvando…" : submitLabel}
		</Button>
	);
}

export function EventoFormulario({
	defaultValues,
	onSubmit,
	submitLabel,
	disabled,
	apenasDatasFuturas,
	layoutPainelEdicao,
	tituloPainelEdicao,
	formId,
	mostrarLotesIngresso,
	children,
	className,
}: Props) {
	const methods = useForm<EventoFormValores>({
		defaultValues: mergeEventoFormDefaults(defaultValues),
	});
	const { reset, handleSubmit, formState: { isSubmitting } } = methods;

	useEffect(() => {
		reset(mergeEventoFormDefaults(defaultValues));
	}, [defaultValues, reset]);

	const enviar = handleSubmit(async (values) => {
		const errLotes = validarLotesIngresso(values.lotes, values.quantidadeIngressosTotal);
		if (errLotes) {
			toast.error(errLotes);
			return;
		}
		await onSubmit({
			...values,
			statusEvento: values.statusEvento?.trim() || "ATIVO",
		});
	});

	const idForm = formId ?? "form-evento";

	if (layoutPainelEdicao) {
		return (
			<FormProvider {...methods}>
				<div className={cn("flex min-h-0 flex-1 flex-col", className)}>
					{tituloPainelEdicao ? (
						<DialogHeader className='shrink-0 space-y-0 border-b px-6 pb-4 pt-6 pr-14 text-left'>
							<div className='flex flex-wrap items-center justify-between gap-3'>
								<DialogTitle className='min-w-0 flex-1 text-lg font-semibold leading-tight tracking-tight'>
									{tituloPainelEdicao}
								</DialogTitle>
								<EventoEmDestaqueBarraFormulario disabled={disabled} />
							</div>
						</DialogHeader>
					) : null}
					<div className='min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-4'>
						<div className='mx-auto flex min-w-0 max-w-full flex-col gap-8'>
							<form id={idForm} onSubmit={enviar} className='min-w-0 w-full'>
								<EventoFormularioCampos
									disabled={disabled}
									apenasDatasFuturas={apenasDatasFuturas}
									layoutPainelCardsComoNovoEvento
									painelExtensaoColunaDireita={
										<CardVagasELotesPainelEdicao
											disabled={disabled}
											mostrarLotesIngresso={Boolean(mostrarLotesIngresso)}
										/>
									}
								/>
							</form>
							{children != null ? (
								<div className='w-full min-w-0 border-t border-border pt-8'>{children}</div>
							) : null}
						</div>
					</div>
					<DialogFooter className='shrink-0 border-t bg-muted/20 px-6 py-4'>
						<BotaoSubmeterEventoFormulario
							formId={idForm}
							submitLabel={submitLabel}
							disabled={disabled}
							isSubmitting={isSubmitting}
						/>
					</DialogFooter>
				</div>
			</FormProvider>
		);
	}

	return (
		<FormProvider {...methods}>
			<form onSubmit={enviar} className='max-h-[70vh] space-y-4 overflow-y-auto pr-1'>
				<EventoFormularioCampos disabled={disabled} apenasDatasFuturas={apenasDatasFuturas} />
				{mostrarLotesIngresso ? <CardLotesIngressoFormulario disabled={disabled} /> : null}
				<div className='flex justify-end pt-2'>
					<BotaoSubmeterEventoFormulario submitLabel={submitLabel} disabled={disabled} isSubmitting={isSubmitting} />
				</div>
			</form>
		</FormProvider>
	);
}
