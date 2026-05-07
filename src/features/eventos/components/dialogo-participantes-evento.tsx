import { Button } from "@/components/base/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/base/dialog";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { Tooltip } from "@/components/base/tooltip";
import { Can } from "@/components/can";
import { ParticipantesApi } from "@/features/eventos/api/eventos-api";
import { IngressosApi } from "@/features/eventos/api/ingressos-api";
import { formatarDataHoraPortugues24 } from "@/features/eventos/lib/datas-evento";
import type {
	EventoCadastroDto,
	EventoLoteIngressoPayload,
	IngressoQrResolverDto,
	ParticipanteDto,
} from "@/features/eventos/types";
import { useAuth } from "@/hooks/use-auth";
import { cn, maskCPF, maskPhone, onlyDigits } from "@/lib/utils";
import {
	CheckCircle2,
	CircleCheck,
	Clock,
	Layers,
	Minus,
	Plus,
	RotateCcw,
	RotateCw,
	QrCode,
	Ticket,
	UserCircle,
	UserMinus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { DialogoConfirmarRetirada } from "./dialogo-confirmar-retirada";
import {
	DialogoFluxoRetiradaQrIngresso,
	type ResultadoProcessarLeituraQr,
} from "./dialogo-fluxo-retirada-qr-ingresso";
import { DialogoDetalhesParticipante } from "./dialogo-detalhes-participante";

type Props = {
	aberto: boolean;
	onAbertoChange: (aberto: boolean) => void;
	evento: EventoCadastroDto | null;
	/** Chamado após mutações que alteram vagas/reservas no servidor (ex.: recarregar evento). */
	onEventoAtualizado?: () => void;
};

/** Atalhos da grelha (estilo Painel); «vagasRestantes» só destaca o saldo — a tabela lista todas as reservas como em «Todos». */
type CartaoParticipantes = "todos" | "retiradasConfirmadas" | "naoConfirmadas" | "vagasRestantes";

/** Confirmação antes de mutações (exceto «ver detalhes», só leitura). */
type AcaoConfirmacao =
	| { kind: "retirada"; p: ParticipanteDto }
	| { kind: "desfazer"; p: ParticipanteDto }
	| { kind: "cancelar"; p: ParticipanteDto }
	| { kind: "reativar"; p: ParticipanteDto }
	| { kind: "qtd"; p: ParticipanteDto; delta: number; novoValor: number };

function lotesOrdenados(ev: EventoCadastroDto): EventoLoteIngressoPayload[] {
	if (!ev.lotes?.length) return [];
	return [...ev.lotes].sort((a, b) => a.ordem - b.ordem);
}

function rotuloLote(ev: EventoCadastroDto, cdLote?: string): string {
	const lotes = lotesOrdenados(ev);
	const ord = cdLote != null && cdLote !== "" ? Number.parseInt(cdLote, 10) : 0;
	const l = lotes.find((x) => x.ordem === ord) ?? lotes[0];
	if (!l) return "—";
	const r = l.rotulo?.trim() || `Lote ${l.ordem + 1}`;
	return `${l.ordem + 1}. ${r}`;
}

function somaIngressosAtivosNesteEvento(lista: ParticipanteDto[], cdEv: string): number {
	return lista
		.filter((p) => p.cdEventosCadastro === cdEv && p.statusReserva === "ATIVA")
		.reduce((s, p) => s + p.quantidadeIngressos, 0);
}

function somaNoLote(
	lista: ParticipanteDto[],
	cdEv: string,
	ordemStr: string | undefined,
	excluirParticipanteId?: string
): number {
	const ord = ordemStr != null && ordemStr !== "" ? ordemStr : "0";
	return lista
		.filter(
			(p) =>
				p.cdEventosCadastro === cdEv &&
				p.statusReserva === "ATIVA" &&
				(p.cdLoteIngresso ?? "0") === ord &&
				(!excluirParticipanteId || p.cdEventosParticipantes !== excluirParticipanteId)
		)
		.reduce((s, p) => s + p.quantidadeIngressos, 0);
}

function capacidadeLote(ev: EventoCadastroDto, ordemStr: string | undefined): number {
	const ord = ordemStr != null && ordemStr !== "" ? Number.parseInt(ordemStr, 10) : 0;
	const l = lotesOrdenados(ev).find((x) => x.ordem === ord);
	return l?.quantidade ?? ev.quantidadeIngressosTotal;
}

export function DialogoParticipantesEvento({ aberto, onAbertoChange, evento, onEventoAtualizado }: Props) {
	const { user } = useAuth();
	const [lista, setLista] = useState<ParticipanteDto[]>([]);
	const [carregando, setCarregando] = useState(false);
	const [filtroNome, setFiltroNome] = useState("");
	const [filtroCpf, setFiltroCpf] = useState("");
	const [filtroTel, setFiltroTel] = useState("");
	const [cartaoAtivo, setCartaoAtivo] = useState<CartaoParticipantes>("todos");
	const [debounced, setDebounced] = useState({ nome: "", cpf: "", tel: "" });
	const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const [confirmarPara, setConfirmarPara] = useState<ParticipanteDto | null>(null);
	const [confirmarAberto, setConfirmarAberto] = useState(false);
	const [gravandoConfirmar, setGravandoConfirmar] = useState(false);

	const [detalheDoc, setDetalheDoc] = useState<{
		documento: string;
		nome?: string;
		email?: string;
		telefone?: string;
	} | null>(null);

	const [acaoConfirmacao, setAcaoConfirmacao] = useState<AcaoConfirmacao | null>(null);

	const [fluxoQrAberto, setFluxoQrAberto] = useState(false);

	useEffect(() => {
		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			setDebounced({
				nome: filtroNome,
				cpf: filtroCpf,
				tel: filtroTel,
			});
		}, 400);
		return () => clearTimeout(debounceRef.current);
	}, [filtroNome, filtroCpf, filtroTel]);

	const recarregar = useCallback(async () => {
		if (!evento?.cdEventosCadastro) return;
		setCarregando(true);
		try {
			const rows = await ParticipantesApi.listarPorEvento(evento.cdEventosCadastro);
			setLista(rows);
		} catch {
			toast.error("Não foi possível carregar os participantes.");
			setLista([]);
		} finally {
			setCarregando(false);
		}
	}, [evento?.cdEventosCadastro]);

	useEffect(() => {
		if (!aberto || !evento?.cdEventosCadastro) {
			setLista([]);
			setFiltroNome("");
			setFiltroCpf("");
			setFiltroTel("");
			setCartaoAtivo("todos");
			setDebounced({ nome: "", cpf: "", tel: "" });
			return;
		}
		void recarregar();
	}, [aberto, evento?.cdEventosCadastro, recarregar]);

	const filtrados = useMemo(() => {
		const n = debounced.nome.trim().toLowerCase();
		const cpfD = onlyDigits(debounced.cpf);
		const telD = onlyDigits(debounced.tel);
		return lista.filter((p) => {
			if (n && !p.nomeParticipante.toLowerCase().includes(n)) return false;
			if (cpfD && !onlyDigits(p.documentoParticipante).includes(cpfD)) return false;
			if (telD && !onlyDigits(p.telefoneParticipante).includes(telD)) return false;
			switch (cartaoAtivo) {
				case "retiradasConfirmadas":
					if (p.statusReserva !== "ATIVA" || !p.presencaConfirmada) return false;
					break;
				case "naoConfirmadas":
					if (p.statusReserva !== "ATIVA" || p.presencaConfirmada) return false;
					break;
				case "todos":
				case "vagasRestantes":
				default:
					break;
			}
			return true;
		});
	}, [lista, debounced, cartaoAtivo]);

	const totaisCartoes = useMemo(() => {
		if (!evento) {
			return {
				todos: 0,
				retiradasConfirmadas: 0,
				naoConfirmadas: 0,
				vagasRestantes: 0,
			};
		}
		const todos = lista.length;
		const retiradasConfirmadas = lista.filter(
			(p) => p.cdEventosCadastro === evento.cdEventosCadastro && p.statusReserva === "ATIVA" && p.presencaConfirmada
		).length;
		const naoConfirmadas = lista.filter(
			(p) => p.cdEventosCadastro === evento.cdEventosCadastro && p.statusReserva === "ATIVA" && !p.presencaConfirmada
		).length;
		return {
			todos,
			retiradasConfirmadas,
			naoConfirmadas,
			vagasRestantes: evento.quantidadeIngressosDisponiveis,
		};
	}, [lista, evento]);

	const limiteCpf = evento?.ingressoPorCpf != null && Number.isFinite(evento.ingressoPorCpf)
		? Math.max(1, Math.floor(evento.ingressoPorCpf))
		: 1;

	const motivoMais = (p: ParticipanteDto): string | null => {
		if (!evento) return "Evento indisponível.";
		if (p.quantidadeIngressos >= limiteCpf) return "Limite de ingressos por CPF atingido.";
		const cap = capacidadeLote(evento, p.cdLoteIngresso);
		const occExcl = somaNoLote(lista, evento.cdEventosCadastro, p.cdLoteIngresso, p.cdEventosParticipantes);
		if (occExcl + p.quantidadeIngressos + 1 > cap) return "Sem vagas suficientes neste lote.";
		const listaSemLinha = lista.filter((x) => x.cdEventosParticipantes !== p.cdEventosParticipantes);
		const resExcl = somaIngressosAtivosNesteEvento(listaSemLinha, evento.cdEventosCadastro);
		if (resExcl + p.quantidadeIngressos + 1 > evento.quantidadeIngressosTotal) return "Sem vagas no evento.";
		return null;
	};

	const motivoMenos = (p: ParticipanteDto): string | null => {
		if (p.quantidadeIngressos <= 1) return "Mínimo de 1 ingresso.";
		if (p.presencaConfirmada) return "Não é possível reduzir após retirada confirmada.";
		return null;
	};

	const aposMutacao = async () => {
		await recarregar();
		onEventoAtualizado?.();
	};

	const processarLeituraQrParticipantes = useCallback(
		async (payloadBruto: string): Promise<ResultadoProcessarLeituraQr> => {
			if (!evento) return { ok: false };
			try {
				const dto = await IngressosApi.validarLeitura(payloadBruto);
				if (dto.cdEventosCadastro !== evento.cdEventosCadastro) {
					toast.error("Este ingresso não pertence a este evento.");
					return { ok: false };
				}
				return { ok: true, dto, evento };
			} catch {
				return { ok: false };
			}
		},
		[evento]
	);

	const confirmarRetiradaQrParticipantes = useCallback(
		async (dto: IngressoQrResolverDto, cdLocal?: string) => {
			if (!dto.podeConfirmarRetirada) return;
			try {
				await IngressosApi.confirmarRetirada(dto.cdIngresso, {
					cdLocalRetirada: cdLocal,
					nomeOperadorRetirada: user?.name,
				});
			} catch {
				toast.error("Não foi possível confirmar a retirada.");
				throw new Error("confirmar");
			}
		},
		[user]
	);

	const executarRetiradaDireta = async (p: ParticipanteDto) => {
		const pontos = evento?.semPontoDeTroca ? [] : (evento?.pontosDeTrocaCodigos ?? []);
		try {
			await ParticipantesApi.confirmarRetirada(p.cdEventosParticipantes, {
				cdLocalRetirada: pontos[0]?.id,
				nomeOperadorRetirada: user?.name,
			});
			toast.success("Retirada confirmada.");
			await aposMutacao();
		} catch {
			toast.error("Não foi possível confirmar a retirada.");
		}
	};

	const iniciarConfirmarRetirada = (p: ParticipanteDto) => {
		setAcaoConfirmacao({ kind: "retirada", p });
	};

	const handleConfirmarDialogo = async (cdLocal?: string) => {
		if (!confirmarPara) return;
		setGravandoConfirmar(true);
		try {
			await ParticipantesApi.confirmarRetirada(confirmarPara.cdEventosParticipantes, {
				cdLocalRetirada: cdLocal,
				nomeOperadorRetirada: user?.name,
			});
			toast.success("Retirada confirmada.");
			setConfirmarAberto(false);
			setConfirmarPara(null);
			await aposMutacao();
		} catch {
			toast.error("Não foi possível confirmar a retirada.");
		} finally {
			setGravandoConfirmar(false);
		}
	};

	const confirmarAcaoPendente = async () => {
		if (!acaoConfirmacao || !evento) return;
		const ctx = acaoConfirmacao;
		setAcaoConfirmacao(null);

		switch (ctx.kind) {
			case "retirada": {
				const pontos = evento.semPontoDeTroca ? [] : (evento.pontosDeTrocaCodigos ?? []);
				if (pontos.length > 1) {
					setConfirmarPara(ctx.p);
					setConfirmarAberto(true);
					return;
				}
				await executarRetiradaDireta(ctx.p);
				break;
			}
			case "desfazer": {
				try {
					await ParticipantesApi.desfazerRetirada(ctx.p.cdEventosParticipantes);
					toast.success("Retirada desfeita.");
					await aposMutacao();
				} catch {
					toast.error("Não foi possível desfazer a retirada.");
				}
				break;
			}
			case "cancelar": {
				try {
					await ParticipantesApi.cancelar(ctx.p.cdEventosParticipantes);
					toast.success("Reserva cancelada — vagas liberadas no lote.");
					await aposMutacao();
				} catch {
					toast.error("Não foi possível cancelar.");
				}
				break;
			}
			case "reativar": {
				try {
					await ParticipantesApi.reativar(ctx.p.cdEventosParticipantes);
					toast.success("Reserva reativada.");
					await aposMutacao();
				} catch {
					toast.error("Não foi possível reativar (verifique vagas).");
				}
				break;
			}
			case "qtd": {
				try {
					await ParticipantesApi.atualizarQuantidade(ctx.p.cdEventosParticipantes, ctx.novoValor);
					toast.success("Quantidade atualizada.");
					await aposMutacao();
				} catch {
					toast.error("Não foi possível alterar a quantidade.");
				}
				break;
			}
		}
	};

	const textoConfirmacao = useMemo((): { titulo: string; descricao: ReactNode } | null => {
		if (!acaoConfirmacao) return null;
		const { p } = acaoConfirmacao;
		switch (acaoConfirmacao.kind) {
			case "retirada":
				return {
					titulo: "Confirmar retirada de ingressos",
					descricao: (
						<>
							Confirmar retirada para <strong>{p.nomeParticipante}</strong> ({p.quantidadeIngressos}{" "}
							{p.quantidadeIngressos === 1 ? "ingresso" : "ingressos"}) e registar presença no ponto de troca?
						</>
					),
				};
			case "desfazer":
				return {
					titulo: "Desfazer retirada",
					descricao: (
						<>
							Remover o registo de retirada de <strong>{p.nomeParticipante}</strong>? A presença deixará de estar
							confirmada.
						</>
					),
				};
			case "cancelar":
				return {
					titulo: "Cancelar reserva",
					descricao: (
						<>Cancelar a reserva de <strong>{p.nomeParticipante}</strong>? As vagas serão liberadas no lote.</>
					),
				};
			case "reativar":
				return {
					titulo: "Reativar reserva",
					descricao: (
						<>
							Reativar a reserva cancelada de <strong>{p.nomeParticipante}</strong>? Serão novamente contabilizados{" "}
							{p.quantidadeIngressos} {p.quantidadeIngressos === 1 ? "ingresso" : "ingressos"} nas vagas.
						</>
					),
				};
			case "qtd": {
				const { novoValor, delta } = acaoConfirmacao;
				const atual = p.quantidadeIngressos;
				return {
					titulo: delta > 0 ? "Aumentar quantidade" : "Reduzir quantidade",
					descricao: (
						<>
							Alterar de <strong>{atual}</strong> para <strong>{novoValor}</strong>{" "}
							{novoValor === 1 ? "ingresso" : "ingressos"} para <strong>{p.nomeParticipante}</strong>?
						</>
					),
				};
			}
		}
	}, [acaoConfirmacao]);

	if (!evento) return null;

	return (
		<>
			<Dialog
				open={acaoConfirmacao != null}
				onOpenChange={(open) => {
					if (!open) setAcaoConfirmacao(null);
				}}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>{textoConfirmacao?.titulo}</DialogTitle>
						<DialogDescription className='text-left sm:text-left'>
							{textoConfirmacao?.descricao}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className='gap-2 sm:justify-end'>
						<Button type='button' variant='outline' onClick={() => setAcaoConfirmacao(null)}>
							Voltar
						</Button>
						<Button type='button' onClick={() => void confirmarAcaoPendente()}>
							Confirmar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={aberto} onOpenChange={onAbertoChange}>
				<DialogContent className='flex max-h-[90vh] w-full max-w-5xl flex-col gap-0 overflow-hidden p-0'>
					<DialogHeader className='shrink-0 border-b px-6 pb-4 pt-6 text-left'>
						<DialogTitle>Participantes — {evento.nomeEvento}</DialogTitle>
						<p className='text-sm font-normal text-muted-foreground'>
							Clique nos cartões para filtrar a tabela. Use nome, CPF ou telefone para refinar.
						</p>
					</DialogHeader>
					<div className='min-h-0 flex-1 overflow-y-auto px-6 py-4'>
						<div className='mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
							<button
								type='button'
								onClick={() => setCartaoAtivo("todos")}
								className={cn(
									"flex items-start justify-between gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50",
									cartaoAtivo === "todos"
										? "border-sky-500 bg-sky-50 ring-1 ring-sky-200 dark:border-sky-600 dark:bg-sky-950/35 dark:ring-sky-900"
										: "border-border"
								)}>
								<div className='min-w-0 space-y-2'>
									<span className='flex h-10 w-10 items-center justify-center rounded-md bg-sky-100 dark:bg-sky-950'>
										<Layers className='h-5 w-5 text-sky-700 dark:text-sky-300' aria-hidden />
									</span>
									<p className='text-sm leading-snug text-muted-foreground'>Todos</p>
								</div>
								<span className='text-2xl font-semibold tabular-nums tracking-tight'>{totaisCartoes.todos}</span>
							</button>

							<button
								type='button'
								onClick={() => setCartaoAtivo("retiradasConfirmadas")}
								className={cn(
									"flex items-start justify-between gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50",
									cartaoAtivo === "retiradasConfirmadas"
										? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-200 dark:border-emerald-600 dark:bg-emerald-950/35 dark:ring-emerald-900"
										: "border-border"
								)}>
								<div className='min-w-0 space-y-2'>
									<span className='flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950'>
										<CircleCheck className='h-5 w-5 text-emerald-700 dark:text-emerald-300' aria-hidden />
									</span>
									<p className='text-sm leading-snug text-muted-foreground'>Retiradas confirmadas</p>
								</div>
								<span className='text-2xl font-semibold tabular-nums tracking-tight'>
									{totaisCartoes.retiradasConfirmadas}
								</span>
							</button>

							<button
								type='button'
								onClick={() => setCartaoAtivo("naoConfirmadas")}
								className={cn(
									"flex items-start justify-between gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50",
									cartaoAtivo === "naoConfirmadas"
										? "border-amber-600 bg-amber-50 ring-1 ring-amber-200 dark:border-amber-600 dark:bg-amber-950/35 dark:ring-amber-900"
										: "border-border"
								)}>
								<div className='min-w-0 space-y-2'>
									<span className='flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-950'>
										<Clock className='h-5 w-5 text-amber-800 dark:text-amber-300' aria-hidden />
									</span>
									<p className='text-sm leading-snug text-muted-foreground'>Não confirmadas</p>
								</div>
								<span className='text-2xl font-semibold tabular-nums tracking-tight'>
									{totaisCartoes.naoConfirmadas}
								</span>
							</button>

							<button
								type='button'
								onClick={() => setCartaoAtivo("vagasRestantes")}
								className={cn(
									"flex items-start justify-between gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50",
									cartaoAtivo === "vagasRestantes"
										? "border-violet-600 bg-violet-50 ring-1 ring-violet-200 dark:border-violet-600 dark:bg-violet-950/35 dark:ring-violet-900"
										: "border-border"
								)}>
								<div className='min-w-0 space-y-2'>
									<span className='flex h-10 w-10 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-950'>
										<Ticket className='h-5 w-5 text-violet-700 dark:text-violet-300' aria-hidden />
									</span>
									<p className='text-sm leading-snug text-muted-foreground'>Vagas restantes</p>
								</div>
								<span className='text-2xl font-semibold tabular-nums tracking-tight'>
									{totaisCartoes.vagasRestantes}
								</span>
							</button>
						</div>

						<div className='mb-4 flex flex-wrap items-end gap-4'>
							<Can claim='eventos.edit'>
								<div className='flex flex-col gap-2'>
									<span className='text-sm font-medium leading-none'>QR Code</span>
									<Button
										type='button'
										variant='secondary'
										className='gap-2'
										onClick={() => setFluxoQrAberto(true)}>
										<QrCode className='h-4 w-4' aria-hidden />
										Ler QR
									</Button>
								</div>
							</Can>
							<div className='grid min-w-[min(100%,12rem)] flex-1 gap-2'>
								<Label htmlFor='filtro-part-nome'>Nome</Label>
								<Input
									id='filtro-part-nome'
									value={filtroNome}
									onChange={(e) => setFiltroNome(e.target.value)}
									placeholder='Filtrar…'
								/>
							</div>
							<div className='grid min-w-[min(100%,10rem)] flex-1 gap-2'>
								<Label htmlFor='filtro-part-cpf'>CPF</Label>
								<Input
									id='filtro-part-cpf'
									value={filtroCpf}
									onChange={(e) => setFiltroCpf(maskCPF(e.target.value))}
									placeholder='000.000.000-00'
								/>
							</div>
							<div className='grid min-w-[min(100%,10rem)] flex-1 gap-2'>
								<Label htmlFor='filtro-part-tel'>Telefone</Label>
								<Input
									id='filtro-part-tel'
									value={filtroTel}
									onChange={(e) => setFiltroTel(maskPhone(e.target.value))}
									placeholder='(00) 00000-0000'
								/>
							</div>
						</div>

						{carregando ? (
							<p className='text-sm text-muted-foreground'>Carregando…</p>
						) : filtrados.length === 0 ? (
							<p className='text-sm text-muted-foreground'>
								{cartaoAtivo === "retiradasConfirmadas"
									? "Nenhuma retirada confirmada com os filtros atuais."
									: cartaoAtivo === "naoConfirmadas"
										? "Nenhuma reserva pendente de retirada com os filtros atuais."
										: "Nenhum participante com os filtros atuais."}
							</p>
						) : (
							<div className='overflow-x-auto rounded-md border'>
								<table className='w-full text-sm'>
									<thead>
										<tr className='border-b bg-muted/40 text-left text-muted-foreground'>
											<th className='px-3 py-2.5 font-medium'>Nome</th>
											<th className='px-3 py-2.5 font-medium'>CPF</th>
											<th className='px-3 py-2.5 font-medium'>Telefone</th>
											<th className='px-3 py-2.5 font-medium'>Lote</th>
											<th className='px-3 py-2.5 font-medium text-center'>Qtd</th>
											<th className='px-3 py-2.5 font-medium'>Estado</th>
											<th className='px-3 py-2.5 font-medium text-center'>Ações</th>
										</tr>
									</thead>
									<tbody>
										{filtrados.map((p) => {
											const cancelada = p.statusReserva === "CANCELADA";
											const ativa = p.statusReserva === "ATIVA";
											const mm = motivoMenos(p);
											const mp = motivoMais(p);
											return (
												<tr
													key={p.cdEventosParticipantes}
													className={cn(
														"border-b border-border/60 last:border-0",
														cancelada && "opacity-60"
													)}>
													<td className='px-3 py-2.5 font-medium'>{p.nomeParticipante}</td>
													<td className='px-3 py-2.5 tabular-nums'>{maskCPF(p.documentoParticipante)}</td>
													<td className='px-3 py-2.5 tabular-nums'>{maskPhone(p.telefoneParticipante)}</td>
													<td className='px-3 py-2.5 text-muted-foreground text-xs'>{rotuloLote(evento, p.cdLoteIngresso)}</td>
													<td className='px-3 py-2.5'>
														<div className='flex items-center justify-center gap-1'>
															<Can
																claim='eventos.edit'
																fallback={
																	<span className='tabular-nums font-medium'>{p.quantidadeIngressos}</span>
																}>
																<Tooltip content={mm ?? "Diminuir quantidade"}>
																	<span>
																		<Button
																			type='button'
																			variant='outline'
																			size='icon'
																			className='h-8 w-8'
																			disabled={ativa === false || Boolean(mm)}
																			aria-label='Diminuir quantidade'
																			onClick={() =>
																				setAcaoConfirmacao({
																					kind: "qtd",
																					p,
																					delta: -1,
																					novoValor: p.quantidadeIngressos - 1,
																				})
																			}>
																			<Minus className='h-4 w-4' />
																		</Button>
																	</span>
																</Tooltip>
																<span className='min-w-[2ch] text-center font-medium tabular-nums'>
																	{p.quantidadeIngressos}
																</span>
																<Tooltip content={mp ?? "Aumentar quantidade"}>
																	<span>
																		<Button
																			type='button'
																			variant='outline'
																			size='icon'
																			className='h-8 w-8'
																			disabled={ativa === false || Boolean(mp)}
																			aria-label='Aumentar quantidade'
																			onClick={() =>
																				setAcaoConfirmacao({
																					kind: "qtd",
																					p,
																					delta: 1,
																					novoValor: p.quantidadeIngressos + 1,
																				})
																			}>
																			<Plus className='h-4 w-4' />
																		</Button>
																	</span>
																</Tooltip>
															</Can>
														</div>
													</td>
													<td className='px-3 py-2.5'>
														{cancelada ? (
															<span className='text-destructive text-xs font-medium'>Cancelada</span>
														) : p.presencaConfirmada ? (
															<div className='text-xs leading-snug'>
																<span className='font-medium text-emerald-700'>Retirado</span>
																{p.dataRetirada ? (
																	<span className='mt-0.5 block text-muted-foreground'>
																		{p.nomeLocalRetirada ? `${p.nomeLocalRetirada} · ` : ""}
																		{formatarDataHoraPortugues24(p.dataRetirada)}
																	</span>
																) : null}
															</div>
														) : (
															<span className='text-amber-700 text-xs font-medium'>Pendente retirada</span>
														)}
													</td>
													<td className='px-3 py-2.5'>
														<div className='flex flex-nowrap items-center justify-end gap-0.5'>
															<Can claim='eventos.edit'>
																<Tooltip content='Ver dados e histórico do participante'>
																	<Button
																		type='button'
																		variant='outline'
																		size='icon'
																		className='h-8 w-8 shrink-0'
																		aria-label='Ver detalhes do participante'
																		onClick={() =>
																			setDetalheDoc({
																				documento: p.documentoParticipante,
																				nome: p.nomeParticipante,
																				email: p.emailParticipante,
																				telefone: p.telefoneParticipante,
																			})
																		}>
																		<UserCircle className='h-4 w-4' />
																	</Button>
																</Tooltip>
																{ativa && !p.presencaConfirmada ? (
																	<Tooltip content='Confirmar retirada no ponto de troca'>
																		<Button
																			type='button'
																			size='icon'
																			className='h-8 w-8 shrink-0'
																			aria-label='Confirmar retirada'
																			onClick={() => iniciarConfirmarRetirada(p)}>
																			<CheckCircle2 className='h-4 w-4' />
																		</Button>
																	</Tooltip>
																) : null}
																{ativa && p.presencaConfirmada ? (
																	<Tooltip content='Desfazer retirada'>
																		<Button
																			type='button'
																			variant='secondary'
																			size='icon'
																			className='h-8 w-8 shrink-0'
																			aria-label='Desfazer retirada'
																			onClick={() => setAcaoConfirmacao({ kind: "desfazer", p })}>
																			<RotateCcw className='h-4 w-4' />
																		</Button>
																	</Tooltip>
																) : null}
																{ativa ? (
																	<Tooltip content='Cancelar reserva'>
																		<Button
																			type='button'
																			variant='outline'
																			size='icon'
																			className='h-8 w-8 shrink-0 text-destructive hover:text-destructive'
																			aria-label='Cancelar reserva'
																			onClick={() => setAcaoConfirmacao({ kind: "cancelar", p })}>
																			<UserMinus className='h-4 w-4' />
																		</Button>
																	</Tooltip>
																) : null}
																{cancelada ? (
																	<Tooltip content='Reativar reserva'>
																		<Button
																			type='button'
																			variant='secondary'
																			size='icon'
																			className='h-8 w-8 shrink-0'
																			aria-label='Reativar reserva'
																			onClick={() => setAcaoConfirmacao({ kind: "reativar", p })}>
																			<RotateCw className='h-4 w-4' />
																		</Button>
																	</Tooltip>
																) : null}
															</Can>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</div>
					<DialogFooter className='shrink-0 border-t px-6 py-4'>
						<Button type='button' variant='outline' onClick={() => onAbertoChange(false)}>
							Fechar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<DialogoConfirmarRetirada
				aberto={confirmarAberto}
				onAbertoChange={(v) => {
					setConfirmarAberto(v);
					if (!v) setConfirmarPara(null);
				}}
				evento={evento}
				participante={confirmarPara}
				onConfirmar={handleConfirmarDialogo}
				gravando={gravandoConfirmar}
			/>

			<DialogoFluxoRetiradaQrIngresso
				aberto={fluxoQrAberto}
				onAbertoChange={setFluxoQrAberto}
				processarLeitura={processarLeituraQrParticipantes}
				onConfirmarRetirada={confirmarRetiradaQrParticipantes}
				aposConfirmarSucesso={aposMutacao}
				tituloLeitura='Ler QR Code do ingresso'
			/>

			<DialogoDetalhesParticipante
				aberto={detalheDoc != null}
				onAbertoChange={(v) => {
					if (!v) setDetalheDoc(null);
				}}
				documentoParticipante={detalheDoc?.documento ?? ""}
				nomeParticipante={detalheDoc?.nome}
				emailParticipante={detalheDoc?.email}
				telefoneParticipante={detalheDoc?.telefone}
			/>
		</>
	);
}
