import { Button } from "@/components/base/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/base/dialog";
import { ListaAnexos } from "@/components/base/lista-anexos";
import { ModalVisualizadorAnexo } from "@/components/base/modal-visualizador-anexo";
import { Can } from "@/components/can";
import { ImagensApi, ParticipantesApi } from "@/features/eventos/api/eventos-api";
import { DialogoParticipantesEvento } from "@/features/eventos/components/dialogo-participantes-evento";
import { LocaisTrocaApi } from "@/features/eventos/api/locais-troca-api";
import {
	extrairSoDataDesativacao,
	formatarDataHoraPortugues24,
	formatarDataPortugues,
	formatarEventoDataPeriodoPt,
	formatarHoraPortugues24,
	formatarProgramacaoDiariaPt,
	programacaoDiariaDeDtoOuDerivada,
} from "@/features/eventos/lib/datas-evento";
import {
	eventoListadoNoPortal,
	obterIsoDataHoraInicioVendas,
	obterYmdInicioExibicaoApp,
	obterYmdInicioListagemPortal,
	rotuloEstadoPortalPublico,
	rotuloElegivelCatalogoPortal,
} from "@/features/eventos/lib/visibilidade-evento";
import type {
	EventoCadastroDto,
	EventoImagemDto,
	EventoLoteIngressoPayload,
	LocalTrocaDto,
	ParticipanteDto,
	PontoTrocaEventoDto,
} from "@/features/eventos/types";
import type { ArquivoAnexo } from "@/lib/download-anexo";
import { sanitizeDescricaoEventoHtml } from "@/lib/sanitize-descricao-html";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function tipoMimeImagemPorNome(nome: string): string {
	const n = nome.toLowerCase();
	if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
	if (n.endsWith(".webp")) return "image/webp";
	if (n.endsWith(".gif")) return "image/gif";
	if (n.endsWith(".png")) return "image/png";
	return "image/png";
}

function textoLiberacaoLoteDetalhe(l: EventoLoteIngressoPayload): string {
	switch (l.modoLiberacao) {
		case "IMEDIATA":
			return "Após a data/hora global de início de vendas do evento (1.º lote).";
		case "APOS_ESGOTAR_ANTERIOR":
			return "Abre quando o lote anterior esgotar as vagas.";
		case "DATA_HORA": {
			const d = l.dataLiberacaoVenda?.trim();
			if (d)
				return `Abre a venda em ${formatarDataPortugues(d)} às ${formatarHoraPortugues24(l.horaLiberacaoVenda)}.`;
			return "Abre a venda numa data e hora definidas.";
		}
		default:
			return "—";
	}
}

function rotuloPontoTrocaDetalhe(p: PontoTrocaEventoDto, locais: LocalTrocaDto[]): string {
	const n = p.nome?.trim();
	if (n) return n;
	return locais.find((l) => l.cdLocalTroca === p.id)?.nome?.trim() || p.id;
}

function mapImagemParaAnexo(im: EventoImagemDto): ArquivoAnexo {
	const b64 = im.conteudoBase64Preview ?? im.conteudoBase64;
	return {
		id: im.cdEventosImagens,
		nome: im.nomeArquivo,
		tipoMime: tipoMimeImagemPorNome(im.nomeArquivo),
		tamanhoBytes: undefined,
		conteudoBase64: b64,
	};
}

type Props = {
	aberto: boolean;
	onAbertoChange: (aberto: boolean) => void;
	evento: EventoCadastroDto | null;
	/** Chamado ao clicar em Editar no rodapé (ex.: abrir formulário de edição na página pai). */
	onEditar?: (evento: EventoCadastroDto) => void;
	/** Após alterações em participantes/vagas (ex.: recarregar evento na página pai). */
	onEventoAtualizado?: () => void;
};

export function DialogoDetalhesEvento({ aberto, onAbertoChange, evento, onEditar, onEventoAtualizado }: Props) {
	const [imagens, setImagens] = useState<EventoImagemDto[]>([]);
	const [participantes, setParticipantes] = useState<ParticipanteDto[]>([]);
	const [participantesAberto, setParticipantesAberto] = useState(false);
	const [verAnexo, setVerAnexo] = useState<ArquivoAnexo | null>(null);
	const [modalVer, setModalVer] = useState(false);
	const [idsBaixando, setIdsBaixando] = useState<Set<string>>(new Set());
	const [locaisTroca, setLocaisTroca] = useState<LocalTrocaDto[]>([]);

	const id = evento?.cdEventosCadastro;

	const recarregarParticipantesResumo = useCallback(async () => {
		if (!id) return;
		try {
			const parts = await ParticipantesApi.listarPorEvento(id);
			setParticipantes(parts);
		} catch {
			/* mantém lista anterior */
		}
	}, [id]);

	useEffect(() => {
		if (!aberto) {
			setLocaisTroca([]);
			return;
		}
		let cancelado = false;
		void LocaisTrocaApi.listar()
			.then((lista) => {
				if (!cancelado) setLocaisTroca(lista);
			})
			.catch(() => {
				if (!cancelado) setLocaisTroca([]);
			});
		return () => {
			cancelado = true;
		};
	}, [aberto]);

	useEffect(() => {
		if (!aberto || !id) {
			setImagens([]);
			setParticipantes([]);
			setParticipantesAberto(false);
			return;
		}
		let cancelado = false;
		Promise.all([ImagensApi.listarPorEvento(id), ParticipantesApi.listarPorEvento(id)])
			.then(([imgs, parts]) => {
				if (!cancelado) {
					setImagens(imgs);
					setParticipantes(parts);
				}
			})
			.catch(() => {
				if (!cancelado) toast.error("Não foi possível carregar anexos ou participantes.");
			});
		return () => {
			cancelado = true;
		};
	}, [aberto, id]);

	const anexos = useMemo(() => imagens.map(mapImagemParaAnexo), [imagens]);

	const resumoParticipantesCard = useMemo(() => {
		const confirmados = participantes.filter(
			(p) => p.statusReserva === "ATIVA" && p.presencaConfirmada
		).length;
		const pendentes = participantes.filter(
			(p) => p.statusReserva === "ATIVA" && !p.presencaConfirmada
		).length;
		const cancelados = participantes.filter((p) => p.statusReserva === "CANCELADA").length;
		return { confirmados, pendentes, cancelados, total: participantes.length };
	}, [participantes]);

	const lotesOrdenados = useMemo(() => {
		if (!evento?.lotes?.length) return [];
		return [...evento.lotes].sort((a, b) => a.ordem - b.ordem);
	}, [evento?.lotes]);

	const baixarViaApi = async (anexo: ArquivoAnexo) => {
		if (!id) return;
		setIdsBaixando((s) => new Set(s).add(anexo.id));
		try {
			const blob = await ImagensApi.baixarArquivo(id, anexo.id);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = anexo.nome || "anexo";
			a.rel = "noopener";
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			toast.success("Download concluído.");
		} catch {
			toast.error("Falha ao baixar o anexo.");
		} finally {
			setIdsBaixando((s) => {
				const n = new Set(s);
				n.delete(anexo.id);
				return n;
			});
		}
	};

	if (!evento) return null;

	return (
		<>
			<Dialog open={aberto} onOpenChange={onAbertoChange}>
				<DialogContent className='flex max-h-[90vh] w-full max-w-5xl flex-col gap-0 overflow-hidden p-0'>
					<DialogHeader className='shrink-0 border-b px-6 pb-4 pt-6 pr-14 text-left'>
						<DialogTitle>Detalhes do evento</DialogTitle>
						<p className='text-sm font-normal text-muted-foreground'>{evento.nomeEvento}</p>
					</DialogHeader>
					<div className='min-h-0 flex-1 overflow-y-auto px-6 py-4'>
						<div className='grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:items-start'>
							<div className='min-w-0 space-y-4'>
								<dl className='grid grid-cols-1 gap-2 text-sm sm:grid-cols-2'>
									<div>
										<dt className='text-muted-foreground'>Categoria</dt>
										<dd className='font-medium'>{evento.categoria}</dd>
									</div>
									<div>
										<dt className='text-muted-foreground'>Ponto de troca</dt>
										<dd className='font-medium'>
											{evento.semPontoDeTroca ? (
												"Sem ponto de troca"
											) : (evento.pontosDeTrocaCodigos ?? []).length === 0 ? (
												"—"
											) : (
												<ul className='mt-1 list-none space-y-2'>
													{(evento.pontosDeTrocaCodigos ?? []).map((p) => {
														const end =
															p.endereco?.trim() ||
															locaisTroca.find((l) => l.cdLocalTroca === p.id)?.endereco?.trim() ||
															"";
														return (
															<li key={p.id} className='text-sm'>
																<span>{rotuloPontoTrocaDetalhe(p, locaisTroca)}</span>
																{end ? (
																	<span className='mt-0.5 block text-xs font-normal text-muted-foreground'>
																		{end}
																	</span>
																) : null}
															</li>
														);
													})}
												</ul>
											)}
										</dd>
									</div>
									<div className='sm:col-span-2'>
										<dt className='text-muted-foreground'>Período do evento</dt>
										<dd className='font-medium'>{formatarEventoDataPeriodoPt(evento)}</dd>
									</div>
									<div className='sm:col-span-2'>
										<dt className='text-muted-foreground'>Agenda por dia</dt>
										<dd className='font-medium leading-relaxed'>
											{formatarProgramacaoDiariaPt(programacaoDiariaDeDtoOuDerivada(evento))}
										</dd>
									</div>
									<div>
										<dt className='text-muted-foreground'>Início da exibição no aplicativo</dt>
										<dd className='font-medium'>{formatarDataPortugues(obterYmdInicioExibicaoApp(evento))}</dd>
									</div>
									<div>
										<dt className='text-muted-foreground'>Início da exibição no portal</dt>
										<dd className='font-medium'>{formatarDataPortugues(obterYmdInicioListagemPortal(evento))}</dd>
									</div>
									<div>
										<dt className='text-muted-foreground'>Início das vendas (global)</dt>
										<dd className='font-medium'>
											{formatarDataHoraPortugues24(obterIsoDataHoraInicioVendas(evento))}
										</dd>
									</div>
									<div>
										<dt className='text-muted-foreground'>Desativação automática</dt>
										<dd className='font-medium'>
											{evento ? formatarDataPortugues(extrairSoDataDesativacao(evento)) : "—"}
										</dd>
									</div>
									<div>
										<dt className='text-muted-foreground'>Vagas</dt>
										<dd className='font-medium'>
											{evento.exibirVagas
												? `${evento.quantidadeIngressosReservados} / ${evento.quantidadeIngressosTotal} reservadas`
												: "Total não exibido no portal"}
										</dd>
									</div>
									<div>
										<dt className='text-muted-foreground'>Exibir vagas no portal</dt>
										<dd className='font-medium'>{evento.exibirVagas ? "Sim" : "Não"}</dd>
									</div>
									{lotesOrdenados.length > 0 ? (
										<div className='sm:col-span-2'>
											<dt className='text-muted-foreground'>Lotes e liberação</dt>
											<dd className='mt-2'>
												<ul className='divide-y rounded-md border bg-card text-sm'>
													{lotesOrdenados.map((l, i) => (
														<li key={`${l.ordem}-${i}`} className='px-3 py-2.5'>
															<p className='font-medium'>
																{i + 1}. {l.rotulo?.trim() || `Lote ${i + 1}`}{" "}
																<span className='font-normal text-muted-foreground'>
																	— {l.quantidade} vagas
																</span>
															</p>
															<p className='mt-0.5 text-xs leading-relaxed text-muted-foreground'>
																<span className='font-medium text-foreground/80'>Liberação: </span>
																{textoLiberacaoLoteDetalhe(l)}
															</p>
														</li>
													))}
												</ul>
											</dd>
										</div>
									) : null}
									<div>
										<dt className='text-muted-foreground'>No catálogo do portal</dt>
										<dd className='font-medium'>{rotuloElegivelCatalogoPortal(evento.exibirParaCidadao)}</dd>
									</div>
									<div>
										<dt className='text-muted-foreground'>Evento em destaque</dt>
										<dd className='font-medium'>{evento.eventoEmDestaque ? "Sim" : "Não"}</dd>
									</div>
									<div>
										<dt className='text-muted-foreground'>Listado no portal</dt>
										<dd className='font-medium'>
											{eventoListadoNoPortal(evento) ? "Sim" : "Não"}
											<span className='mt-1 block text-xs font-normal text-muted-foreground'>
												Controlado por «Exibir para o cidadão»; não depende das datas de exibição.
											</span>
										</dd>
									</div>
									<div>
										<dt className='text-muted-foreground'>Estado no portal</dt>
										<dd className='font-medium'>{rotuloEstadoPortalPublico(evento)}</dd>
									</div>
									<div className='sm:col-span-2'>
										<dt className='text-muted-foreground'>Descrição</dt>
										<dd className='mt-1'>
											{evento.descricao?.trim() ? (
												<div
													className='max-h-60 overflow-y-auto rounded-md border border-border/60 bg-muted/20 p-3 text-sm text-foreground [&_a]:text-primary [&_blockquote]:my-2 [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-5'
													dangerouslySetInnerHTML={{ __html: sanitizeDescricaoEventoHtml(evento.descricao) }}
												/>
											) : (
												<span className='text-muted-foreground'>—</span>
											)}
										</dd>
									</div>
									<div>
										<dt className='text-muted-foreground'>Ingresso por CPF</dt>
										<dd className='font-medium tabular-nums'>
											{evento.ingressoPorCpf != null && Number.isFinite(evento.ingressoPorCpf)
												? Math.max(1, evento.ingressoPorCpf)
												: "—"}
										</dd>
									</div>
									<div className='sm:col-span-2'>
										<dt className='text-muted-foreground'>Texto de sucesso de registro</dt>
										<dd className='mt-1'>
											{evento.textoSucessoRegistro?.trim() ? (
												<div
													className='max-h-48 overflow-y-auto rounded-md border border-border/60 bg-muted/20 p-3 text-sm text-foreground [&_a]:text-primary [&_blockquote]:my-2 [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-5'
													dangerouslySetInnerHTML={{
														__html: sanitizeDescricaoEventoHtml(evento.textoSucessoRegistro),
													}}
												/>
											) : (
												<span className='text-muted-foreground'>—</span>
											)}
										</dd>
									</div>
								</dl>
							</div>
							<aside className='min-w-0 space-y-4 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0'>
								<ListaAnexos
									anexos={anexos}
									idsCarregando={idsBaixando}
									onVisualizar={(a) => {
										setVerAnexo(a);
										setModalVer(true);
									}}
									onBaixar={(a) => void baixarViaApi(a)}
									tituloSecao='Anexos'
								/>
								<div className='rounded-md border bg-muted/30 p-3'>
									<p className='text-sm font-medium'>Participantes</p>
									<p className='text-2xl font-semibold tabular-nums'>{resumoParticipantesCard.total}</p>
									<p className='text-xs text-muted-foreground'>
										Retirada confirmada: {resumoParticipantesCard.confirmados} · Pendente:{" "}
										{resumoParticipantesCard.pendentes} · Cancelada: {resumoParticipantesCard.cancelados}
									</p>
									<Button type='button' variant='secondary' className='mt-3' onClick={() => setParticipantesAberto(true)}>
										Ver participantes
									</Button>
								</div>
							</aside>
						</div>
					</div>
					<DialogFooter
						className={cn(
							"shrink-0 border-t bg-muted/20 px-6 py-4",
							"flex flex-row flex-wrap items-center gap-2 sm:justify-end"
						)}>
						<DialogClose asChild>
							<Button type='button' variant='outline' className='min-w-[7rem]'>
								Fechar
							</Button>
						</DialogClose>
						{onEditar ? (
							<Can claim='eventos.edit'>
								<Button
									type='button'
									className='min-w-[9rem] bg-primary text-primary-foreground hover:bg-primary/90'
									onClick={() => onEditar(evento)}>
									<Pencil className='h-4 w-4' />
									Editar
								</Button>
							</Can>
						) : null}
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<DialogoParticipantesEvento
				aberto={participantesAberto}
				onAbertoChange={setParticipantesAberto}
				evento={evento}
				onEventoAtualizado={() => {
					onEventoAtualizado?.();
					void recarregarParticipantesResumo();
				}}
			/>

			<ModalVisualizadorAnexo aberto={modalVer} onAbertoChange={setModalVer} anexo={verAnexo} titulo='Visualizar anexo' />
		</>
	);
}
