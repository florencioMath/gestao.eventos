import { Button } from "@/components/base/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/base/card";
import { Dialog, DialogContent } from "@/components/base/dialog";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { Select } from "@/components/base/select";
import { Can } from "@/components/can";
import type { AnexoEmUpload } from "@/components/base/upload-arquivos";
import { DialogoDetalhesEvento } from "@/features/eventos/components/dialogo-detalhes-evento";
import {
	DialogoEventoEmDestaque,
	type DialogoEventoEmDestaqueIntent,
} from "@/features/eventos/components/dialogo-evento-em-destaque";
import { EventoCartaoListagem } from "@/features/eventos/components/evento-cartao-listagem";
import { EventoFormulario } from "@/features/eventos/components/evento-formulario";
import { ImagensEdicaoEvento } from "@/features/eventos/components/imagens-edicao-evento";
import { useCapasPrimeiraImagemEventos } from "@/features/eventos/hooks/use-capas-primeira-imagem-eventos";
import { MIN_IMAGENS_EVENTO } from "@/features/eventos/constants/imagens-evento";
import { EventosApi, ImagensApi } from "@/features/eventos/api/eventos-api";
import { LocaisTrocaApi } from "@/features/eventos/api/locais-troca-api";
import {
	extrairDataEHoraDoDto,
	programacaoDiariaDeDtoOuDerivada,
	extrairSoDataDesativacao,
	formatarEventoDataPeriodoPt,
} from "@/features/eventos/lib/datas-evento";
import { inferirLotesDoDto, validarLotesIngresso } from "@/features/eventos/lib/lotes-ingresso";
import {
	guardarVistaListagemEventos,
	lerVistaListagemEventos,
	type VistaListagemEventos,
} from "@/features/eventos/lib/vista-listagem-eventos";
import {
	formatarPontosDeTrocaResumo,
	normalizarPontosDeTrocaDoDto,
} from "@/features/eventos/lib/pontos-troca-evento";
import {
	eventoListadoNoPortal,
	rotuloEstadoPortalPublico,
	rotuloElegivelCatalogoPortal,
} from "@/features/eventos/lib/visibilidade-evento";
import type { EventoCadastroDto, EventoFormValores, EventoImagemDto, LocalTrocaDto } from "@/features/eventos/types";
import type { EventoMockListaItem } from "@/mocks/eventos-mock-lista";
import { Eye, LayoutGrid, LayoutList, Pencil, Plus, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function mapDtoParaForm(d: EventoCadastroDto, locais: LocalTrocaDto[]): EventoFormValores {
	const { dataDia, dataFimDia, horaInicio, horaFim } = extrairDataEHoraDoDto(d);
	const eventoVariosDias = dataFimDia !== dataDia;
	const portalYmd = (() => {
		const raw = d.dataInicioExibicaoPortal?.trim().slice(0, 10) ?? "";
		return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : dataDia;
	})();
	const appYmd = (() => {
		const raw = d.dataInicioExibicaoApp?.trim().slice(0, 10) ?? "";
		return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : portalYmd;
	})();
	return {
		nomeEvento: d.nomeEvento,
		descricao: d.descricao,
		textoSucessoRegistro: d.textoSucessoRegistro ?? "",
		ingressoPorCpf: d.ingressoPorCpf != null && Number.isFinite(d.ingressoPorCpf) ? Math.max(1, d.ingressoPorCpf) : 1,
		categoria: d.categoria,
		pontosDeTrocaCodigos: normalizarPontosDeTrocaDoDto(d.pontosDeTrocaCodigos, locais),
		semPontoDeTroca: Boolean(d.semPontoDeTroca),
		dataEvento: dataDia,
		dataFimEventoDia: eventoVariosDias ? dataFimDia : dataDia,
		eventoVariosDias,
		horaInicio,
		horaFim,
		dataDesativacaoAutomatica: extrairSoDataDesativacao(d),
		dataInicioExibicaoApp: appYmd,
		dataInicioExibicaoPortal: portalYmd,
		dataInicioVendasDia: (() => {
			const raw = d.dataHoraInicioVendas?.trim() ?? "";
			if (raw.includes("T") && raw.length >= 10) return raw.slice(0, 10);
			return dataDia;
		})(),
		horaInicioVendas: (() => {
			const raw = d.dataHoraInicioVendas?.trim() ?? "";
			if (raw.includes("T") && raw.length >= 16) return raw.slice(11, 16);
			return horaInicio;
		})(),
		quantidadeIngressosTotal: d.quantidadeIngressosTotal,
		exibirParaCidadao: d.exibirParaCidadao !== false,
		exibirVagas: d.exibirVagas !== false,
		eventoEmDestaque: Boolean(d.eventoEmDestaque),
		statusEvento: d.statusEvento?.trim() || "ATIVO",
		lotes: inferirLotesDoDto(d.quantidadeIngressosTotal, d.lotes),
		programacaoDiaria: programacaoDiariaDeDtoOuDerivada(d),
	};
}

export function PaginaListaEventos() {
	const navigate = useNavigate();
	const [itens, setItens] = useState<EventoCadastroDto[]>([]);
	const [carregando, setCarregando] = useState(true);
	const [filtro, setFiltro] = useState("");
	const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "inativo">("todos");
	const [filtroVisivel, setFiltroVisivel] = useState<"todos" | "sim" | "nao">("todos");
	const [detalhe, setDetalhe] = useState<EventoCadastroDto | null>(null);
	const [detalheAberto, setDetalheAberto] = useState(false);
	const [editando, setEditando] = useState<EventoCadastroDto | null>(null);
	const [valoresEdicao, setValoresEdicao] = useState<EventoFormValores | null>(null);
	const [edicaoAberto, setEdicaoAberto] = useState(false);
	const [imgEdicao, setImgEdicao] = useState<EventoImagemDto[]>([]);
	const [imgEdicaoRemover, setImgEdicaoRemover] = useState<Set<string>>(() => new Set());
	const [imgEdicaoNovos, setImgEdicaoNovos] = useState<AnexoEmUpload[]>([]);
	const [vistaListagem, setVistaListagem] = useState<VistaListagemEventos>(() => lerVistaListagemEventos());
	const [destaqueDialogo, setDestaqueDialogo] = useState<DialogoEventoEmDestaqueIntent | null>(null);
	const [destaqueGravando, setDestaqueGravando] = useState(false);
	/** Incrementa após listar eventos com sucesso para o log do console voltar a buscar anexos (ex.: só imagens mudaram). */
	const [listaLogTick, setListaLogTick] = useState(0);
	const [locaisTroca, setLocaisTroca] = useState<LocalTrocaDto[]>([]);

	useEffect(() => {
		let ok = true;
		void LocaisTrocaApi.listar()
			.then((lista) => {
				if (ok) setLocaisTroca(lista);
			})
			.catch(() => {
				/* listagem funciona sem nomes dos pontos */
			});
		return () => {
			ok = false;
		};
	}, []);

	const carregar = useCallback(async () => {
		setCarregando(true);
		let ok = false;
		try {
			const lista = await EventosApi.listar();
			setItens(lista);
			ok = true;
		} catch {
			toast.error("Não foi possível carregar os eventos.");
		} finally {
			setCarregando(false);
			if (ok) setListaLogTick((n) => n + 1);
		}
	}, []);

	useEffect(() => {
		void carregar();
	}, [carregar]);

	useEffect(() => {
		guardarVistaListagemEventos(vistaListagem);
	}, [vistaListagem]);

	const filtrados = useMemo(() => {
		return itens.filter((e) => {
			const t = filtro.trim().toLowerCase();
			if (t) {
				const pontosTxt = formatarPontosDeTrocaResumo(e.pontosDeTrocaCodigos, e.semPontoDeTroca, locaisTroca).toLowerCase();
				const nome = String(e.nomeEvento ?? "").toLowerCase();
				const cat = String(e.categoria ?? "").toLowerCase();
				const okTexto = nome.includes(t) || cat.includes(t) || pontosTxt.includes(t);
				if (!okTexto) return false;
			}
			if (filtroStatus === "ativo" && !e.exibirParaCidadao) return false;
			if (filtroStatus === "inativo" && e.exibirParaCidadao) return false;
			const vis = eventoListadoNoPortal(e);
			if (filtroVisivel === "sim" && !vis) return false;
			if (filtroVisivel === "nao" && vis) return false;
			return true;
		});
	}, [itens, filtro, filtroStatus, filtroVisivel, locaisTroca]);

	/**
	 * Depuração: mesmo objeto que `EventoMockListaItem` em `eventos-mock-lista.ts` — só `{ evento, anexos }`.
	 * `anexos` vêm direto de GET `/imagens/:id` como `EventoAnexoDto` (sem chave `imagens`). Atualiza após cada `carregar()`.
	 */
	useEffect(() => {
		if (carregando) return;
		const lista = filtrados;
		if (lista.length === 0) {
			console.log("[Lista de Eventos] Eventos (dados completos):", []);
			return;
		}
		let cancelado = false;
		void (async () => {
			const completo: EventoMockListaItem[] = await Promise.all(
				lista.map(async (e) => {
					const evento = { ...e };
					try {
						const anexosBrutos = await ImagensApi.listarAnexosPorEvento(e.cdEventosCadastro);
						const anexos = anexosBrutos.map((a) => ({ ...a }));
						return { evento, anexos };
					} catch {
						return { evento, anexos: [] };
					}
				})
			);
			if (!cancelado) {
				console.log("[Lista de Eventos] Eventos (dados completos):", completo);
			}
		})();
		return () => {
			cancelado = true;
		};
	}, [carregando, filtrados, listaLogTick]);

	const idsCapa = useMemo(() => filtrados.map((e) => e.cdEventosCadastro), [filtrados]);
	const { mapaCapa, carregandoCapas } = useCapasPrimeiraImagemEventos(idsCapa, vistaListagem === "cartoes");

	const abrirDetalhe = async (e: EventoCadastroDto) => {
		try {
			const full = await EventosApi.obter(e.cdEventosCadastro);
			setDetalhe(full);
			setDetalheAberto(true);
		} catch {
			toast.error("Não foi possível carregar o evento.");
		}
	};

	const abrirEdicao = async (e: EventoCadastroDto) => {
		try {
			const [full, imagens] = await Promise.all([
				EventosApi.obter(e.cdEventosCadastro),
				ImagensApi.listarPorEvento(e.cdEventosCadastro),
			]);
			setEditando(full);
			setValoresEdicao(mapDtoParaForm(full, locaisTroca));
			setImgEdicao(imagens);
			setImgEdicaoRemover(new Set());
			setImgEdicaoNovos([]);
			setEdicaoAberto(true);
		} catch {
			toast.error("Não foi possível carregar o evento para edição.");
		}
	};

	const fecharEdicao = () => {
		setEdicaoAberto(false);
		setEditando(null);
		setValoresEdicao(null);
		setImgEdicao([]);
		setImgEdicaoRemover(new Set());
		setImgEdicaoNovos([]);
	};

	const alternarRemocaoImagem = useCallback((cdImg: string) => {
		setImgEdicaoRemover((prev) => {
			const next = new Set(prev);
			if (next.has(cdImg)) {
				next.delete(cdImg);
				return next;
			}
			next.add(cdImg);
			return next;
		});
	}, []);

	const confirmarDestaque = async () => {
		if (!destaqueDialogo) return;
		setDestaqueGravando(true);
		try {
			const { evento, valorDesejado } = destaqueDialogo;
			const atualizado = await EventosApi.atualizar(evento.cdEventosCadastro, {
				...mapDtoParaForm(evento, locaisTroca),
				eventoEmDestaque: valorDesejado,
			});
			toast.success(valorDesejado ? "Evento definido como destaque no portal." : "Destaque removido.");
			setDestaqueDialogo(null);
			await carregar();
			if (detalhe?.cdEventosCadastro === atualizado.cdEventosCadastro) {
				setDetalhe(atualizado);
			}
		} catch {
			toast.error("Não foi possível atualizar o destaque.");
		} finally {
			setDestaqueGravando(false);
		}
	};

	const salvarEdicao = async (values: EventoFormValores) => {
		if (!editando) return;
		const errLotes = validarLotesIngresso(values.lotes, values.quantidadeIngressosTotal);
		if (errLotes) {
			toast.error(errLotes);
			return;
		}
		const visiveis = imgEdicao.filter((im) => !imgEdicaoRemover.has(im.cdEventosImagens));
		if (visiveis.length + imgEdicaoNovos.length < MIN_IMAGENS_EVENTO) {
			toast.error("Inclua ao menos uma imagem (mantenha uma existente ou adicione novas).");
			return;
		}
		try {
			const atualizado = await EventosApi.atualizar(editando.cdEventosCadastro, values);
			const idEv = atualizado.cdEventosCadastro;
			const visiveisOrdenados = imgEdicao.filter((im) => !imgEdicaoRemover.has(im.cdEventosImagens));
			const idsNovos: string[] = [];
			/** Com anexos novos e remoções, enviar primeiro os novos para o servidor nunca ficar sem o mínimo de imagens ao apagar (ex.: mock/real). */
			const anexarNovosAntesDeExcluir =
				imgEdicaoNovos.length > 0 && imgEdicaoRemover.size > 0;

			if (anexarNovosAntesDeExcluir) {
				const posBase = imgEdicao.length;
				for (let i = 0; i < imgEdicaoNovos.length; i++) {
					const dto = await ImagensApi.upload(idEv, imgEdicaoNovos[i].arquivo, posBase + i, false);
					idsNovos.push(dto.cdEventosImagens);
				}
				for (const cdImg of imgEdicaoRemover) {
					await ImagensApi.excluir(idEv, cdImg);
				}
			} else {
				for (const cdImg of imgEdicaoRemover) {
					await ImagensApi.excluir(idEv, cdImg);
				}
				for (let i = 0; i < imgEdicaoNovos.length; i++) {
					const dto = await ImagensApi.upload(
						idEv,
						imgEdicaoNovos[i].arquivo,
						visiveisOrdenados.length + i,
						false
					);
					idsNovos.push(dto.cdEventosImagens);
				}
			}

			const ordemIds = [...visiveisOrdenados.map((x) => x.cdEventosImagens), ...idsNovos];
			if (ordemIds.length > 0) {
				await ImagensApi.reordenar(idEv, ordemIds);
			}
			setListaLogTick((n) => n + 1);
			toast.success("Evento, lotes e imagens atualizados.");
			fecharEdicao();
			await carregar();
			if (detalhe?.cdEventosCadastro === atualizado.cdEventosCadastro) {
				setDetalhe(atualizado);
			}
		} catch {
			toast.error("Não foi possível salvar as alterações.");
		}
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>Eventos</h1>
					<p className='text-sm text-muted-foreground'>Consulte os detalhes de cada evento.</p>
				</div>
				<Can claim='eventos.create'>
					<Button type='button' className='gap-2' onClick={() => navigate("novo")}>
						<Plus className='h-4 w-4 shrink-0' aria-hidden />
						Novo evento
					</Button>
				</Can>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Filtros</CardTitle>
				</CardHeader>
				<CardContent className='flex flex-wrap items-end gap-4'>
					<div className='grid min-w-[min(100%,18rem)] flex-1 basis-[16rem] gap-2'>
						<Label htmlFor='filtro-eventos'>Busca</Label>
						<Input
							id='filtro-eventos'
							placeholder='Nome, categoria ou ponto de troca…'
							value={filtro}
							onChange={(e) => setFiltro(e.target.value)}
						/>
					</div>
					<div className='grid w-full min-w-[10rem] gap-2 sm:w-44'>
						<Label htmlFor='filtro-status'>Catálogo</Label>
						<Select
							value={filtroStatus}
							onValueChange={(v) => setFiltroStatus(v as "todos" | "ativo" | "inativo")}
							options={[
								{ value: "todos", label: "Todos" },
								{ value: "ativo", label: "Exibe no catálogo" },
								{ value: "inativo", label: "Não exibe" },
							]}
						/>
					</div>
					<div className='grid w-full min-w-[10rem] gap-2 sm:w-44'>
						<Label htmlFor='filtro-visivel'>Visível</Label>
						<Select
							value={filtroVisivel}
							onValueChange={(v) => setFiltroVisivel(v as "todos" | "sim" | "nao")}
							options={[
								{ value: "todos", label: "Todos" },
								{ value: "sim", label: "Sim" },
								{ value: "nao", label: "Não" },
							]}
						/>
					</div>
					<Button type='button' variant='secondary' onClick={() => void carregar()} disabled={carregando}>
						{carregando ? "Atualizando…" : "Atualizar"}
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='space-y-3'>
					<div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
						<div className='min-w-0 space-y-1'>
							<CardTitle>Eventos encontrados ({filtrados.length})</CardTitle>
							<p className='text-sm font-normal text-muted-foreground'>
								{vistaListagem === "tabela"
									? "A coluna «No catálogo» indica se o evento está elegível no catálogo. «Listado» reflete elegível e o dia atual entre o início de exibição e a desativação automática. Estado indica Em breve ou reservas conforme a data/hora de início de vendas."
									: "Cada card mostra a imagem principal (ou a primeira) do evento. Listado e estado seguem as mesmas regras."}
							</p>
						</div>
						<div
							className='inline-flex shrink-0 self-start rounded-lg border border-input bg-muted/40 p-1'
							role='group'
							aria-label='Formato da listagem'>
							<Button
								type='button'
								variant={vistaListagem === "tabela" ? "secondary" : "ghost"}
								size='sm'
								className='gap-1.5 rounded-md px-3'
								aria-pressed={vistaListagem === "tabela"}
								onClick={() => setVistaListagem("tabela")}>
								<LayoutList className='h-4 w-4 shrink-0' aria-hidden />
								Tabela
							</Button>
							<Button
								type='button'
								variant={vistaListagem === "cartoes" ? "secondary" : "ghost"}
								size='sm'
								className='gap-1.5 rounded-md px-3'
								aria-pressed={vistaListagem === "cartoes"}
								onClick={() => setVistaListagem("cartoes")}>
								<LayoutGrid className='h-4 w-4 shrink-0' aria-hidden />
								Cards
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{carregando ? (
						<p className='text-sm text-muted-foreground'>Carregando…</p>
					) : filtrados.length === 0 ? (
						<p className='text-sm text-muted-foreground'>Nenhum evento encontrado com os filtros atuais.</p>
					) : vistaListagem === "tabela" ? (
						<div className='overflow-x-auto rounded-md border'>
							<table className='w-full text-sm'>
								<thead>
									<tr className='border-b bg-muted/40 text-left text-muted-foreground'>
										<th className='w-12 px-2 py-2.5 text-center font-medium' title='Destaque no portal'>
											<span className='sr-only'>Destaque</span>
											<Star className='mx-auto h-4 w-4 opacity-70' aria-hidden />
										</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>Nome</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>Data / horário</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>Vagas</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>No catálogo</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>Listado</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>Estado portal</th>
										<th className='px-3 py-2.5 font-medium text-center'>Ações</th>
									</tr>
								</thead>
								<tbody>
									{filtrados.map((e) => (
										<tr key={e.cdEventosCadastro} className='border-b border-border/60 last:border-0'>
											<td className='px-2 py-2.5 text-center align-middle'>
												<Can
													claim='eventos.edit'
													fallback={
														e.eventoEmDestaque ? (
															<span
																className='inline-flex h-8 w-8 items-center justify-center'
																title='Evento em destaque no portal'
																aria-label='Evento em destaque no portal'>
																<Star className='h-4 w-4 fill-amber-400 text-amber-600' aria-hidden />
															</span>
														) : (
															<span className='inline-block h-8 w-8' aria-hidden />
														)
													}>
													<Button
														type='button'
														variant='ghost'
														size='icon'
														className='h-8 w-8'
														aria-label={
															e.eventoEmDestaque
																? `Remover destaque de ${e.nomeEvento}`
																: `Definir ${e.nomeEvento} como destaque no portal`
														}
														onClick={() =>
															setDestaqueDialogo({
																evento: e,
																valorDesejado: !e.eventoEmDestaque,
															})
														}>
														<Star
															className={`h-4 w-4 ${e.eventoEmDestaque ? "fill-amber-400 text-amber-600" : "text-muted-foreground"}`}
														/>
													</Button>
												</Can>
											</td>
											<td className='px-3 py-2.5 pr-4 font-medium'>{e.nomeEvento}</td>
											<td className='px-3 py-2.5 pr-4'>{formatarEventoDataPeriodoPt(e)}</td>
											<td className='px-3 py-2.5 pr-4'>
												{e.quantidadeIngressosReservados}/{e.quantidadeIngressosTotal}
											</td>
											<td className='px-3 py-2.5 pr-4'>{rotuloElegivelCatalogoPortal(e.exibirParaCidadao)}</td>
											<td className='px-3 py-2.5 pr-4 text-muted-foreground'>
												{eventoListadoNoPortal(e) ? "Sim" : "Não"}
											</td>
											<td className='px-3 py-2.5 pr-4 text-muted-foreground text-xs leading-snug'>
												{rotuloEstadoPortalPublico(e)}
											</td>
											<td className='px-3 py-2.5'>
												<div className='flex items-center justify-center gap-1'>
													<Button
														type='button'
														variant='outline'
														size='icon'
														aria-label={`Detalhes de ${e.nomeEvento}`}
														onClick={() => void abrirDetalhe(e)}>
														<Eye className='h-4 w-4' />
													</Button>
													<Can claim='eventos.edit'>
														<Button
															type='button'
															size='icon'
															className='bg-primary text-primary-foreground hover:bg-primary/90'
															aria-label={`Editar ${e.nomeEvento}`}
															onClick={() => void abrirEdicao(e)}>
															<Pencil className='h-4 w-4' />
														</Button>
													</Can>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
							{filtrados.map((e) => (
								<EventoCartaoListagem
									key={e.cdEventosCadastro}
									evento={e}
									locaisDeTroca={locaisTroca}
									capaDataUrl={mapaCapa[e.cdEventosCadastro]}
									carregandoCapa={carregandoCapas && !(e.cdEventosCadastro in mapaCapa)}
									onVerDetalhes={() => void abrirDetalhe(e)}
									onEditar={() => void abrirEdicao(e)}
									onAlternarDestaque={() =>
										setDestaqueDialogo({
											evento: e,
											valorDesejado: !e.eventoEmDestaque,
										})
									}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<DialogoEventoEmDestaque
				aberto={destaqueDialogo != null}
				intent={destaqueDialogo}
				onAbertoChange={(aberto) => {
					if (!aberto) setDestaqueDialogo(null);
				}}
				carregando={destaqueGravando}
				onConfirmar={confirmarDestaque}
			/>

			<DialogoDetalhesEvento
				aberto={detalheAberto}
				onAbertoChange={(aberto: boolean) => {
					setDetalheAberto(aberto);
					if (!aberto) setDetalhe(null);
				}}
				evento={detalhe}
				onEditar={(ev) => {
					setDetalheAberto(false);
					setDetalhe(null);
					void abrirEdicao(ev);
				}}
				onEventoAtualizado={async () => {
					if (!detalhe?.cdEventosCadastro) return;
					try {
						const full = await EventosApi.obter(detalhe.cdEventosCadastro);
						setDetalhe(full);
					} catch {
						toast.error("Não foi possível atualizar os dados do evento.");
					}
				}}
			/>

			<Dialog open={edicaoAberto} onOpenChange={(aberto) => !aberto && fecharEdicao()}>
				<DialogContent className='flex max-h-[90vh] min-w-0 w-full max-w-6xl flex-col gap-0 overflow-hidden p-0'>
					{valoresEdicao && editando && (
						<EventoFormulario
							key={editando.cdEventosCadastro}
							className='min-h-0 flex-1'
							layoutPainelEdicao
							tituloPainelEdicao='Editar evento'
							formId={`editar-evento-${editando.cdEventosCadastro}`}
							defaultValues={valoresEdicao}
							mostrarLotesIngresso
							submitLabel='Salvar alterações'
							onSubmit={salvarEdicao}>
							<ImagensEdicaoEvento
								existentes={imgEdicao}
								idsMarcadosRemocao={imgEdicaoRemover}
								onAlternarRemocao={alternarRemocaoImagem}
								onReordenarExistentes={setImgEdicao}
								novos={imgEdicaoNovos}
								onNovosChange={setImgEdicaoNovos}
							/>
						</EventoFormulario>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
