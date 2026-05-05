import { horaFimPadraoAposInicio, horaMinimaLocalAgora, paraYmdLocal } from "@/components/base/calendario-pt-shared";
import { Button } from "@/components/base/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/base/card";
import { EditorDescricaoRica } from "@/components/base/editor-descricao-rica";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { SeletorDataPt } from "@/components/base/seletor-data-pt";
import { SeletorHora24 } from "@/components/base/seletor-hora-24";
import { Select } from "@/components/base/select";
import {
	DialogoPrevisualizacaoImagemLocal,
	formatarTamanhoArquivo,
	MiniaturaArquivoLocal,
	UploadArquivos,
	type AnexoEmUpload,
} from "@/components/base/upload-arquivos";
import { EventoEmDestaqueBarraFormulario } from "@/features/eventos/components/evento-em-destaque-barra-formulario";
import { CardLotesIngressoFormulario } from "@/features/eventos/components/card-lotes-ingresso-formulario";
import { CategoriaELocalFormulario } from "@/features/eventos/components/categoria-local-formulario";
import { DialogoEnvioImagensEvento } from "@/features/eventos/components/dialogo-envio-imagens-evento";
import { PeriodoDatasEventoFormulario } from "@/features/eventos/components/periodo-datas-evento-form";
import { EventosApi } from "@/features/eventos/api/eventos-api";
import {
	MAX_IMAGENS_EVENTO,
	MIN_IMAGENS_EVENTO,
	TAMANHO_MAX_IMAGEM_EVENTO_BYTES,
} from "@/features/eventos/constants/imagens-evento";
import {
	combinarDataHoraIsoLocal,
	formatarDataHoraPortugues24,
	formatarDataPortugues,
	formatarHoraPortugues24,
	formatarPeriodoDatasFormularioPt,
} from "@/features/eventos/lib/datas-evento";
import { criarLotesIniciaisParaTotal, validarLotesIngresso } from "@/features/eventos/lib/lotes-ingresso";
import { formatarPontosDeTrocaResumo } from "@/features/eventos/lib/pontos-troca-evento";
import {
	eventoListadoComDatas,
	rotuloEstadoPortalFormulario,
	rotuloElegivelCatalogoPortal,
} from "@/features/eventos/lib/visibilidade-evento";
import type { EventoFormValores } from "@/features/eventos/types";
import { descricaoHtmlNaoVazia } from "@/lib/descricao-html-texto";
import { sanitizeDescricaoEventoHtml } from "@/lib/sanitize-descricao-html";
import { Eye } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Controller, FormProvider, useForm, useFormContext, useWatch, type FieldErrors } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";

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

function CardIdentificacao() {
	const { register, control } = useFormContext<EventoFormValores>();
	return (
		<Card>
			<CardHeader>
				<CardTitle>Identificação</CardTitle>
				<CardDescription>Nome e descrição do evento (descrição com formatação).</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='grid gap-2'>
					<Label htmlFor='nomeEvento' required>
						Nome do evento
					</Label>
					<Input
						id='nomeEvento'
						{...register("nomeEvento", { required: "O nome do evento é obrigatório" })}
					/>
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
								placeholder='Mensagem após inscrição confirmada (mesmo tipo de formatação que a descrição).'
							/>
						)}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function CardClassificacaoELocal() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Classificação e pontos de troca</CardTitle>
				<CardDescription>Categoria e pontos de troca de ingresso (listas do servidor).</CardDescription>
			</CardHeader>
			<CardContent>
				<CategoriaELocalFormulario />
			</CardContent>
		</Card>
	);
}

/** Desativa «Criar evento» enquanto a soma dos lotes ≠ vagas totais (ou regras de lote inválidas). */
function BotaoIrConfirmarEvento({ onClicar }: { onClicar: () => void }) {
	const { control } = useFormContext<EventoFormValores>();
	const lotes = useWatch({ control, name: "lotes" });
	const total = useWatch({ control, name: "quantidadeIngressosTotal" });
	const erroLotes = validarLotesIngresso(lotes, total);
	return (
		<Button
			type='button'
			onClick={() => void onClicar()}
			disabled={erroLotes != null}
			title={
				erroLotes ??
				"Avançar para rever os dados e confirmar a criação do evento (vagas dos lotes têm de coincidir com o total)."
			}>
			Criar evento
		</Button>
	);
}

function CardDatasHorarios() {
	const { control, getValues } = useFormContext<EventoFormValores>();
	const hojeYmd = paraYmdLocal(new Date());

	return (
		<Card>
			<CardHeader>
				<CardTitle>Datas e horários</CardTitle>
				<CardDescription>Realização do evento, janela no portal e abertura de reservas.</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<PeriodoDatasEventoFormulario apenasDatasFuturas />
				<div className='rounded-lg border border-border bg-muted/15 p-4'>
					<p className='mb-3 text-sm font-medium'>Portal e início das reservas</p>
					<p className='mb-4 text-xs text-muted-foreground'>
						Com «Exibir no catálogo» desligado, o evento fica oculto no portal. Com ligado, aparece no catálogo; antes do
						início de vendas mostra «Em breve» (sem reserva).
					</p>
					<div className='space-y-4'>
						<Controller
							name='dataInicioExibicaoApp'
							control={control}
							rules={{
								required: "Indique o início da exibição no aplicativo",
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
										placeholder='dd/mm/aaaa'
										dataMinimaYmd={hojeYmd}
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
								required: "Indique o início da exibição no portal",
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
										placeholder='dd/mm/aaaa'
										dataMinimaYmd={hojeYmd}
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
									required: "Indique o dia de início das vendas",
									validate: (y) =>
										/^\d{4}-\d{2}-\d{2}$/.test((y ?? "").trim().slice(0, 10)) ? true : "Indique a data.",
								}}
								render={({ field, fieldState }) => (
									<div className='grid gap-1'>
										<SeletorDataPt
											label='Início das vendas (dia)'
											required
											value={field.value ?? ""}
											onChange={field.onChange}
											placeholder='dd/mm/aaaa'
											dataMinimaYmd={hojeYmd}
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
										onChange={(e) => field.onChange(e.target.checked)}
									/>
									<span>Exibir vagas (total no portal)</span>
								</label>
							)}
						/>
						<div className='grid min-w-0 gap-2'>
							<Label htmlFor='exibir-no-portal-novo'>Exibir para o cidadão</Label>
							<Controller
								name='exibirParaCidadao'
								control={control}
								render={({ field }) => (
									<Select
										triggerId='exibir-no-portal-novo'
										value={field.value ? "true" : "false"}
										onValueChange={(v) => field.onChange(v === "true")}
										options={[
											{ value: "true", label: "Sim" },
											{ value: "false", label: "Não" },
										]}
									/>
								)}
							/>
							<p className='text-xs text-muted-foreground' id='exibir-no-portal-novo-hint'>
								Com <span className='font-medium text-foreground'>Não</span>, o evento deixa de aparecer no catálogo do
								portal, independentemente das datas.
							</p>
						</div>
					</div>
				</div>
				<Controller
					name='dataDesativacaoAutomatica'
					control={control}
					rules={{ required: true }}
					render={({ field }) => (
						<SeletorDataPt
							label='Desativação automática'
							required
							value={field.value ?? ""}
							onChange={field.onChange}
							placeholder='dd/mm/aaaa'
							dataMinimaYmd={hojeYmd}
						/>
					)}
				/>
			</CardContent>
		</Card>
	);
}

function CardVagasELotesVenda() {
	const { register } = useFormContext<EventoFormValores>();
	return (
		<Card>
			<CardHeader>
				<CardTitle>Vagas e lotes de venda</CardTitle>
				<CardDescription>
					Capacidade, limite por CPF e distribuição das vagas em lotes com regras de liberação.
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
									required: "O limite de ingressos por CPF é obrigatório",
									min: { value: 1, message: "Mínimo 1" },
									validate: (v) =>
										(Number.isFinite(v) && Number(v) >= 1) || "Indique um número inteiro maior ou igual a 1",
								})}
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
									required: "As vagas totais são obrigatórias",
									min: { value: 1, message: "Mínimo 1 vaga" },
									validate: (v) =>
										(Number.isFinite(v) && Number(v) >= 1) || "Indique um número válido de vagas (mínimo 1)",
								})}
							/>
						</div>
					</div>
				</div>
				<div className='border-t border-border pt-6'>
					<CardLotesIngressoFormulario semEnvelope />
				</div>
			</CardContent>
		</Card>
	);
}

function mensagemErroApi(e: unknown): string {
	const ax = e as AxiosError<{ message?: string }>;
	return ax.response?.data?.message ?? ax.message ?? "Não foi possível concluir a criação.";
}

const rotulosCampoFormulario: Partial<Record<keyof EventoFormValores, string>> = {
	nomeEvento: "Nome do evento",
	descricao: "Descrição",
	textoSucessoRegistro: "Texto de sucesso de registro",
	ingressoPorCpf: "Ingresso por CPF",
	categoria: "Categoria",
	pontosDeTrocaCodigos: "Ponto de troca",
	semPontoDeTroca: "Sem ponto de troca",
	dataEvento: "Data do evento",
	horaInicio: "Hora de início",
	horaFim: "Hora de fim",
	dataDesativacaoAutomatica: "Data de desativação automática",
	dataInicioExibicaoApp: "Início da exibição no aplicativo",
	dataInicioExibicaoPortal: "Início da exibição no portal",
	dataInicioVendasDia: "Início das vendas (dia)",
	horaInicioVendas: "Início das vendas (hora)",
	quantidadeIngressosTotal: "Vagas totais",
	exibirParaCidadao: "Exibir para o cidadão",
	exibirVagas: "Exibir vagas",
	eventoEmDestaque: "Evento em destaque",
	statusEvento: "Status do cadastro",
};

function toastErrosValidacao(errors: FieldErrors<EventoFormValores>) {
	const chaves = Object.keys(errors) as (keyof EventoFormValores)[];
	if (chaves.length === 0) return;
	const nomes = chaves.map((k) => rotulosCampoFormulario[k] ?? String(k)).join(", ");
	toast.error(`Preencha corretamente: ${nomes}.`);
}

function valoresPadraoNovoEvento(): EventoFormValores {
	const hi = horaMinimaLocalAgora();
	const dataEvento = paraYmdLocal(new Date());
	const total = padrao.quantidadeIngressosTotal;
	return {
		...padrao,
		dataEvento,
		dataFimEventoDia: dataEvento,
		eventoVariosDias: false,
		horaInicio: hi,
		horaFim: horaFimPadraoAposInicio(hi),
		/** Obrigatório no formulário; sem valor inicial o `handleSubmit` falhava em silêncio. */
		dataDesativacaoAutomatica: dataEvento,
		dataInicioExibicaoApp: dataEvento,
		dataInicioExibicaoPortal: dataEvento,
		dataInicioVendasDia: dataEvento,
		horaInicioVendas: hi,
		lotes: criarLotesIniciaisParaTotal(total),
	};
}

export function PaginaNovaEvento() {
	const navigate = useNavigate();
	const padraoNovo = useMemo(() => valoresPadraoNovoEvento(), []);
	const methods = useForm<EventoFormValores>({
		defaultValues: padraoNovo,
		shouldUnregister: false,
	});
	const [etapa, setEtapa] = useState<"formulario" | "confirmar">("formulario");
	const [anexos, setAnexos] = useState<AnexoEmUpload[]>([]);
	const [enviando, setEnviando] = useState(false);
	/** Snapshot validado ao ir para confirmação (o formulário desmonta e `getValues()` pode falhar). */
	const [dadosConfirmacao, setDadosConfirmacao] = useState<EventoFormValores | null>(null);
	const [arquivoPrevisualizar, setArquivoPrevisualizar] = useState<File | null>(null);
	const [dialogoEnvioImagensAberto, setDialogoEnvioImagensAberto] = useState(false);
	const [idEventoParaImagens, setIdEventoParaImagens] = useState<string | null>(null);
	const [anexosParaEnvio, setAnexosParaEnvio] = useState<AnexoEmUpload[]>([]);

	const { handleSubmit } = methods;

	const finalizarFluxoComImagens = useCallback(() => {
		setDialogoEnvioImagensAberto(false);
		setIdEventoParaImagens(null);
		setAnexosParaEnvio([]);
		navigate("/eventos");
	}, [navigate]);

	const irConfirmar = handleSubmit(
		(data) => {
			if (!descricaoHtmlNaoVazia(data.descricao)) {
				toast.error("A descrição é obrigatória.");
				return;
			}
			if (!descricaoHtmlNaoVazia(data.textoSucessoRegistro)) {
				toast.error("O texto de sucesso de registro é obrigatório.");
				return;
			}
			const errLotes = validarLotesIngresso(data.lotes, data.quantidadeIngressosTotal);
			if (errLotes) {
				toast.error(errLotes);
				return;
			}
			if (anexos.length < MIN_IMAGENS_EVENTO) {
				toast.error("Adicione pelo menos uma imagem do evento.");
				return;
			}
			setDadosConfirmacao(data);
			setEtapa("confirmar");
		},
		(errors) => {
			toastErrosValidacao(errors);
		}
	);

	const confirmarCriacao = async () => {
		const v = dadosConfirmacao;
		if (!v) {
			toast.error("Dados do formulário indisponíveis. Volte e preencha novamente.");
			setEtapa("formulario");
			return;
		}
		const errLotesConfirm = validarLotesIngresso(v.lotes, v.quantidadeIngressosTotal);
		if (errLotesConfirm) {
			toast.error(errLotesConfirm);
			setEtapa("formulario");
			return;
		}
		if (anexos.length < MIN_IMAGENS_EVENTO) {
			toast.error("É obrigatório pelo menos uma imagem.");
			return;
		}
		setEnviando(true);
		try {
			const criado = await EventosApi.criar({
				...v,
				statusEvento: v.statusEvento?.trim() || "ATIVO",
			});
			toast.success("Evento criado.");
			const copia = [...anexos];
			if (copia.length > 0) {
				setAnexosParaEnvio(copia);
				setIdEventoParaImagens(criado.cdEventosCadastro);
				setDialogoEnvioImagensAberto(true);
			} else {
				navigate("/eventos");
			}
		} catch (e) {
			toast.error(mensagemErroApi(e));
		} finally {
			setEnviando(false);
		}
	};

	const voltarTopo = () => {
		if (etapa === "confirmar") {
			setEtapa("formulario");
			return;
		}
		navigate("/eventos");
	};

	const resumo = dadosConfirmacao;
	const erroLotesNoResumo =
		resumo != null ? validarLotesIngresso(resumo.lotes, resumo.quantidadeIngressosTotal) : null;

	return (
		<div className='mx-auto max-w-3xl space-y-6'>
			{etapa === "formulario" ? (
				<FormProvider {...methods}>
					<div className='space-y-6'>
						<div className='flex flex-wrap items-center justify-between gap-4'>
							<div className='flex min-w-0 items-center gap-3'>
								<Button type='button' variant='outline' onClick={voltarTopo}>
									Voltar
								</Button>
								<h1 className='text-2xl font-semibold tracking-tight'>Novo evento</h1>
							</div>
							<EventoEmDestaqueBarraFormulario />
						</div>
						<form className='space-y-6' onSubmit={(e) => e.preventDefault()}>
						<CardIdentificacao />
						<CardClassificacaoELocal />
						<CardDatasHorarios />
						<CardVagasELotesVenda />
						<Card>
							<CardHeader>
								<CardTitle className='flex flex-wrap items-baseline gap-1'>
									Imagens
									<span className='text-destructive' aria-hidden>
										*
									</span>
								</CardTitle>
								<CardDescription>
									Obrigatório pelo menos {MIN_IMAGENS_EVENTO} imagem; até {MAX_IMAGENS_EVENTO},{" "}
									{formatarTamanhoArquivo(TAMANHO_MAX_IMAGEM_EVENTO_BYTES)} cada. Após criar o evento, abre-se um
									diálogo para enviar cada imagem em sequência.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<UploadArquivos
									anexos={anexos}
									onAnexosChange={setAnexos}
									multiplo
									apenasImagens
									maxArquivos={MAX_IMAGENS_EVENTO}
									minArquivos={MIN_IMAGENS_EVENTO}
									tamanhoMaximoBytes={TAMANHO_MAX_IMAGEM_EVENTO_BYTES}
									tituloDestaque='Imagens do evento'
									descricaoArraste='Arraste ficheiros ou clique para selecionar'
									textoAuxiliar={`Formatos: JPG, PNG, WebP ou GIF · máx. ${formatarTamanhoArquivo(TAMANHO_MAX_IMAGEM_EVENTO_BYTES)} cada · até ${MAX_IMAGENS_EVENTO} imagem(ns)`}
									textoBotao='Selecionar imagens'
								/>
							</CardContent>
						</Card>
						<div className='flex justify-end'>
							<BotaoIrConfirmarEvento onClicar={irConfirmar} />
						</div>
						</form>
					</div>
				</FormProvider>
			) : resumo ? (
				<div className='space-y-6'>
					<div className='flex items-center gap-3'>
						<Button type='button' variant='outline' onClick={voltarTopo}>
							Voltar
						</Button>
						<h1 className='text-2xl font-semibold tracking-tight'>Novo evento</h1>
					</div>
					<Card>
						<CardHeader>
							<CardTitle>Identificação</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2 text-sm'>
							<p>
								<span className='text-muted-foreground'>Nome do evento:</span>{" "}
								<span className='font-medium'>{resumo.nomeEvento}</span>
							</p>
							<div>
								<span className='text-muted-foreground'>Descrição:</span>
								{resumo.descricao?.trim() ? (
									<div
										className='mt-2 max-h-56 overflow-y-auto rounded-md border bg-card p-3 text-sm text-foreground [&_a]:text-primary [&_blockquote]:my-2 [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5'
										dangerouslySetInnerHTML={{ __html: sanitizeDescricaoEventoHtml(resumo.descricao) }}
									/>
								) : (
									<span className='mt-1 block'>—</span>
								)}
							</div>
							<div>
								<span className='text-muted-foreground'>Texto de sucesso de registro:</span>
								{resumo.textoSucessoRegistro?.trim() ? (
									<div
										className='mt-2 max-h-40 overflow-y-auto rounded-md border bg-card p-3 text-sm text-foreground [&_a]:text-primary [&_blockquote]:my-2 [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5'
										dangerouslySetInnerHTML={{
											__html: sanitizeDescricaoEventoHtml(resumo.textoSucessoRegistro),
										}}
									/>
								) : (
									<span className='mt-1 block'>—</span>
								)}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Classificação e pontos de troca</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2 text-sm'>
							<p>
								<span className='text-muted-foreground'>Categoria:</span> {resumo.categoria || "—"}
							</p>
							<p>
								<span className='text-muted-foreground'>Ponto de troca:</span>{" "}
								<span className='font-medium'>
									{formatarPontosDeTrocaResumo(
										resumo.pontosDeTrocaCodigos,
										resumo.semPontoDeTroca,
										[]
									)}
								</span>
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Datas e horários</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2 text-sm'>
							<p>
								<span className='text-muted-foreground'>Período do evento:</span>{" "}
								<span className='font-medium'>{formatarPeriodoDatasFormularioPt(resumo)}</span>
							</p>
							<p>
								<span className='text-muted-foreground'>Desativação automática:</span>{" "}
								<span className='font-medium'>{formatarDataPortugues(resumo.dataDesativacaoAutomatica)}</span>
							</p>
							<p>
								<span className='text-muted-foreground'>Início da exibição no aplicativo:</span>{" "}
								<span className='font-medium'>{formatarDataPortugues(resumo.dataInicioExibicaoApp)}</span>
							</p>
							<p>
								<span className='text-muted-foreground'>Início da exibição no portal:</span>{" "}
								<span className='font-medium'>{formatarDataPortugues(resumo.dataInicioExibicaoPortal)}</span>
							</p>
							<p>
								<span className='text-muted-foreground'>Início das vendas:</span>{" "}
								<span className='font-medium'>
									{formatarDataHoraPortugues24(
										combinarDataHoraIsoLocal(
											(resumo.dataInicioVendasDia ?? "").trim().slice(0, 10),
											resumo.horaInicioVendas ?? "09:00"
										)
									)}
								</span>
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Vagas e publicação</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2 text-sm'>
							<p>
								<span className='text-muted-foreground'>Ingresso por CPF:</span>{" "}
								<span className='font-medium tabular-nums'>{resumo.ingressoPorCpf}</span>
							</p>
							<p>
								<span className='text-muted-foreground'>Vagas:</span> {resumo.quantidadeIngressosTotal}
							</p>
							{resumo.lotes && resumo.lotes.length > 0 ? (
								<div className='mt-3 rounded-md border bg-muted/20 p-3'>
									<p className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
										Lotes ({resumo.lotes.length})
									</p>
									<ul className='space-y-2 text-sm'>
										{resumo.lotes.map((l, i) => (
											<li key={l.id} className='border-b border-border/60 pb-2 last:border-0 last:pb-0'>
												<p className='font-medium'>
													{i + 1}. {l.rotulo || `Lote ${i + 1}`} — {l.quantidade} vagas
												</p>
												<p className='text-muted-foreground text-xs'>
													{l.modoLiberacao === "IMEDIATA" && "Após início global de vendas (1.º lote)"}
													{l.modoLiberacao === "DATA_HORA" &&
														`Abre em ${l.dataLiberacaoVenda ? formatarDataPortugues(l.dataLiberacaoVenda) : "—"} às ${formatarHoraPortugues24(l.horaLiberacaoVenda)}`}
													{l.modoLiberacao === "APOS_ESGOTAR_ANTERIOR" && "Abre quando o lote anterior esgotar"}
												</p>
											</li>
										))}
									</ul>
								</div>
							) : null}
							<p>
								<span className='text-muted-foreground'>Exibir vagas no portal:</span>{" "}
								<span className='font-medium'>{resumo.exibirVagas ? "Sim" : "Não"}</span>
							</p>
							<p>
								<span className='text-muted-foreground'>No catálogo:</span>{" "}
								<span className='font-medium'>{rotuloElegivelCatalogoPortal(resumo.exibirParaCidadao)}</span>
							</p>
							<p>
								<span className='text-muted-foreground'>Destaque no portal:</span>{" "}
								<span className='font-medium'>{resumo.eventoEmDestaque ? "Sim" : "Não"}</span>
							</p>
							<p>
								<span className='text-muted-foreground'>Listado no portal (agora):</span>{" "}
								<span className='font-medium'>
									{eventoListadoComDatas(resumo.exibirParaCidadao) ? "Sim" : "Não"}
								</span>
							</p>
							<p>
								<span className='text-muted-foreground'>Estado no portal (agora):</span>{" "}
								<span className='font-medium'>{rotuloEstadoPortalFormulario(resumo)}</span>
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Imagens ({anexos.length})</CardTitle>
							<CardDescription>
								Após confirmar, o evento é criado e abre-se o diálogo de envio das imagens (um ficheiro de cada vez).
							</CardDescription>
						</CardHeader>
						<CardContent>
							{anexos.length === 0 ? (
								<p className='text-sm text-muted-foreground'>Nenhuma imagem selecionada.</p>
							) : (
								<ul className='space-y-2 text-sm'>
									{anexos.map((a) => {
										const ehImagem = a.arquivo.type.startsWith("image/");
										return (
											<li key={a.id} className='flex items-center gap-2 rounded-md border px-3 py-2'>
												<span className='flex min-w-0 flex-1 items-center gap-3'>
													<MiniaturaArquivoLocal arquivo={a.arquivo} />
													<span className='min-w-0 truncate font-medium'>{a.arquivo.name}</span>
													<span className='shrink-0 text-muted-foreground text-xs'>
														({formatarTamanhoArquivo(a.arquivo.size)})
													</span>
												</span>
												{ehImagem ? (
													<Button
														type='button'
														variant='ghost'
														size='icon'
														className='shrink-0'
														onClick={() => setArquivoPrevisualizar(a.arquivo)}
														aria-label={`Visualizar ${a.arquivo.name}`}>
														<Eye className='h-4 w-4' />
													</Button>
												) : null}
											</li>
										);
									})}
								</ul>
							)}
						</CardContent>
					</Card>
					<div className='flex justify-end gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setEtapa("formulario")}
							disabled={enviando || dialogoEnvioImagensAberto}>
							Editar dados
						</Button>
						<Button
							type='button'
							onClick={() => void confirmarCriacao()}
							disabled={enviando || dialogoEnvioImagensAberto || erroLotesNoResumo != null}
							title={erroLotesNoResumo ?? undefined}>
							{enviando ? "A criar…" : "Confirmar"}
						</Button>
					</div>

					<DialogoPrevisualizacaoImagemLocal
						arquivo={arquivoPrevisualizar}
						aberto={arquivoPrevisualizar != null}
						onAbertoChange={(aberto) => {
							if (!aberto) setArquivoPrevisualizar(null);
						}}
					/>
				</div>
			) : (
				<p className='text-sm text-muted-foreground'>Carregue o formulário novamente.</p>
			)}

			{idEventoParaImagens ? (
				<DialogoEnvioImagensEvento
					open={dialogoEnvioImagensAberto}
					cdEventosCadastro={idEventoParaImagens}
					anexos={anexosParaEnvio}
					onFecharSucesso={finalizarFluxoComImagens}
					descricaoContexto={dadosConfirmacao?.nomeEvento}
				/>
			) : null}
		</div>
	);
}
