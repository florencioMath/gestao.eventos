import { Button } from "@/components/base/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/base/card";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { Select } from "@/components/base/select";
import { DialogoDetalhesEvento } from "@/features/eventos/components/dialogo-detalhes-evento";
import { EventoCartaoListagem } from "@/features/eventos/components/evento-cartao-listagem";
import { EventosApi } from "@/features/eventos/api/eventos-api";
import { LocaisTrocaApi } from "@/features/eventos/api/locais-troca-api";
import { useCapasPrimeiraImagemEventos } from "@/features/eventos/hooks/use-capas-primeira-imagem-eventos";
import { formatarEventoDataPeriodoPt } from "@/features/eventos/lib/datas-evento";
import { formatarPontosDeTrocaResumo } from "@/features/eventos/lib/pontos-troca-evento";
import {
	guardarVistaListagemEventos,
	lerVistaListagemEventos,
	type VistaListagemEventos,
} from "@/features/eventos/lib/vista-listagem-eventos";
import {
	eventoListadoNoPortal,
	rotuloEstadoPortalPublico,
	rotuloElegivelCatalogoPortal,
} from "@/features/eventos/lib/visibilidade-evento";
import type { EventoCadastroDto, LocalTrocaDto } from "@/features/eventos/types";
import { cn } from "@/lib/utils";
import { CircleCheck, Eye, LayoutGrid, LayoutList, Layers, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type FiltroStatus = "todos" | "ativo" | "inativo";
type FiltroVisivel = "todos" | "sim" | "nao";
type CartaoAtalho = "todos" | "ativos" | "visiveis";

/** Destaque do atalho só quando combinação coincide com um dos três cartões. */
function cartaoCorrespondente(status: FiltroStatus, visivel: FiltroVisivel): CartaoAtalho | null {
	if (status === "todos" && visivel === "todos") return "todos";
	if (status === "ativo" && visivel === "todos") return "ativos";
	if (status === "todos" && visivel === "sim") return "visiveis";
	return null;
}

export function PaginaPainel() {
	const [eventos, setEventos] = useState<EventoCadastroDto[]>([]);
	const [filtro, setFiltro] = useState("");
	const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todos");
	const [filtroVisivel, setFiltroVisivel] = useState<FiltroVisivel>("todos");
	const [carregando, setCarregando] = useState(true);
	const [vistaListagem, setVistaListagem] = useState<VistaListagemEventos>(() => lerVistaListagemEventos());
	const [detalhe, setDetalhe] = useState<EventoCadastroDto | null>(null);
	const [detalheAberto, setDetalheAberto] = useState(false);
	const [locaisTroca, setLocaisTroca] = useState<LocalTrocaDto[]>([]);

	useEffect(() => {
		let ok = true;
		void LocaisTrocaApi.listar()
			.then((lista) => {
				if (ok) setLocaisTroca(lista);
			})
			.catch(() => {});
		return () => {
			ok = false;
		};
	}, []);

	const carregar = useCallback(async () => {
		setCarregando(true);
		try {
			const lista = await EventosApi.listar();
			setEventos(lista);
		} catch {
			setEventos([]);
		} finally {
			setCarregando(false);
		}
	}, []);

	useEffect(() => {
		void carregar();
	}, [carregar]);

	useEffect(() => {
		guardarVistaListagemEventos(vistaListagem);
	}, [vistaListagem]);

	const filtrados = useMemo(() => {
		return eventos.filter((e) => {
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
	}, [eventos, filtro, filtroStatus, filtroVisivel, locaisTroca]);

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

	const totalTodos = eventos.length;
	const totalAtivos = useMemo(() => eventos.filter((e) => e.exibirParaCidadao).length, [eventos]);
	const totalVisiveis = useMemo(() => eventos.filter((e) => eventoListadoNoPortal(e)).length, [eventos]);

	const cartaoDestacado = cartaoCorrespondente(filtroStatus, filtroVisivel);

	const aplicarAtalhoCartao = (c: CartaoAtalho) => {
		if (c === "todos") {
			setFiltroStatus("todos");
			setFiltroVisivel("todos");
		} else if (c === "ativos") {
			setFiltroStatus("ativo");
			setFiltroVisivel("todos");
		} else {
			setFiltroStatus("todos");
			setFiltroVisivel("sim");
		}
	};

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight'>Painel</h1>
				<p className='text-sm text-muted-foreground'>Resumo e listagem de todos os eventos cadastrados.</p>
			</div>

			<div className='grid gap-4 sm:grid-cols-3'>
				<button
					type='button'
					onClick={() => aplicarAtalhoCartao("todos")}
					className={cn(
						"flex items-start justify-between gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50",
						cartaoDestacado === "todos"
							? "border-sky-500 bg-sky-50 ring-1 ring-sky-200 dark:border-sky-600 dark:bg-sky-950/35 dark:ring-sky-900"
							: "border-border"
					)}>
					<div className='min-w-0 space-y-2'>
						<span className='flex h-10 w-10 items-center justify-center rounded-md bg-sky-100 dark:bg-sky-950'>
							<Layers className='h-5 w-5 text-sky-700 dark:text-sky-300' aria-hidden />
						</span>
						<p className='text-sm leading-snug text-muted-foreground'>Todos</p>
					</div>
					<span className='text-2xl font-semibold tabular-nums tracking-tight'>{totalTodos}</span>
				</button>

				<button
					type='button'
					onClick={() => aplicarAtalhoCartao("ativos")}
					className={cn(
						"flex items-start justify-between gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50",
						cartaoDestacado === "ativos"
							? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-200 dark:border-emerald-600 dark:bg-emerald-950/35 dark:ring-emerald-900"
							: "border-border"
					)}>
					<div className='min-w-0 space-y-2'>
						<span className='flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950'>
							<CircleCheck className='h-5 w-5 text-emerald-700 dark:text-emerald-300' aria-hidden />
						</span>
						<p className='text-sm leading-snug text-muted-foreground'>No catálogo</p>
					</div>
					<span className='text-2xl font-semibold tabular-nums tracking-tight'>{totalAtivos}</span>
				</button>

				<button
					type='button'
					onClick={() => aplicarAtalhoCartao("visiveis")}
					className={cn(
						"flex items-start justify-between gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50",
						cartaoDestacado === "visiveis"
							? "border-violet-600 bg-violet-50 ring-1 ring-violet-200 dark:border-violet-600 dark:bg-violet-950/35 dark:ring-violet-900"
							: "border-border"
					)}>
					<div className='min-w-0 space-y-2'>
						<span className='flex h-10 w-10 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-950'>
							<Eye className='h-5 w-5 text-violet-700 dark:text-violet-300' aria-hidden />
						</span>
						<p className='text-sm leading-snug text-muted-foreground'>Listados no portal</p>
					</div>
					<span className='text-2xl font-semibold tabular-nums tracking-tight'>{totalVisiveis}</span>
				</button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Filtros</CardTitle>
				</CardHeader>
				<CardContent className='flex flex-wrap items-end gap-4'>
					<div className='grid min-w-[min(100%,18rem)] flex-1 basis-[16rem] gap-2'>
						<Label htmlFor='filtro-painel-busca'>Busca</Label>
						<Input
							id='filtro-painel-busca'
							placeholder='Nome, categoria ou ponto de troca…'
							value={filtro}
							onChange={(e) => setFiltro(e.target.value)}
						/>
					</div>
					<div className='grid w-full min-w-[10rem] gap-2 sm:w-44'>
						<Label htmlFor='filtro-painel-status'>Catálogo</Label>
						<Select
							value={filtroStatus}
							onValueChange={(v) => setFiltroStatus(v as FiltroStatus)}
							options={[
								{ value: "todos", label: "Todos" },
								{ value: "ativo", label: "Exibe no catálogo" },
								{ value: "inativo", label: "Não exibe" },
							]}
						/>
					</div>
					<div className='grid w-full min-w-[10rem] gap-2 sm:w-44'>
						<Label htmlFor='filtro-painel-visivel'>Listado no portal</Label>
						<Select
							value={filtroVisivel}
							onValueChange={(v) => setFiltroVisivel(v as FiltroVisivel)}
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
									? "«Listado» = Exibir para o cidadão (`exibirParaCidadao`). O estado (Em breve / reservas) segue a data de início de vendas."
									: "Os cards mostram a imagem principal (ou a primeira) de cada evento."}
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
						<p className='text-sm text-muted-foreground'>Nenhum evento para exibir com os filtros atuais.</p>
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
										<th className='px-3 py-2.5 pr-4 font-medium'>Categoria</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>Ponto de troca</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>Data / horário</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>Vagas</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>No catálogo</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>Listado</th>
										<th className='px-3 py-2.5 pr-4 font-medium'>Estado portal</th>
									</tr>
								</thead>
								<tbody>
									{filtrados.map((e) => (
										<tr key={e.cdEventosCadastro} className='border-b border-border/60 last:border-0'>
											<td className='px-2 py-2.5 text-center align-middle'>
												{e.eventoEmDestaque ? (
													<span
														className='inline-flex h-8 w-8 items-center justify-center'
														title='Evento em destaque no portal'
														aria-label='Evento em destaque no portal'>
														<Star className='h-4 w-4 fill-amber-400 text-amber-600' aria-hidden />
													</span>
												) : (
													<span className='inline-block h-8 w-8' aria-hidden />
												)}
											</td>
											<td className='px-3 py-2.5 pr-4 font-medium'>{e.nomeEvento}</td>
											<td className='px-3 py-2.5 pr-4'>{e.categoria}</td>
											<td className='px-3 py-2.5 pr-4'>
												{formatarPontosDeTrocaResumo(e.pontosDeTrocaCodigos, e.semPontoDeTroca, locaisTroca)}
											</td>
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
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<DialogoDetalhesEvento
				aberto={detalheAberto}
				onAbertoChange={(aberto) => {
					setDetalheAberto(aberto);
					if (!aberto) setDetalhe(null);
				}}
				evento={detalhe}
			/>
		</div>
	);
}
