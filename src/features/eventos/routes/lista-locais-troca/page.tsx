import { Button } from "@/components/base/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/base/card";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { Select } from "@/components/base/select";
import { Can } from "@/components/can";
import { LocaisTrocaApi } from "@/features/eventos/api/locais-troca-api";
import { DialogoLocalTroca } from "@/features/eventos/components/dialogo-local-troca";
import type { LocalTrocaDto, LocalTrocaSalvarPayload } from "@/features/eventos/types";
import { Pencil, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function rotuloAtivo(ativo: boolean) {
	return ativo ? "Ativo" : "Inativo";
}

export function PaginaListaLocaisTroca() {
	const [itens, setItens] = useState<LocalTrocaDto[]>([]);
	const [carregando, setCarregando] = useState(true);
	const [filtro, setFiltro] = useState("");
	const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "inativo">("todos");

	const [dialogoAberto, setDialogoAberto] = useState(false);
	const [modoDialogo, setModoDialogo] = useState<"novo" | "editar">("novo");
	const [editando, setEditando] = useState<LocalTrocaDto | null>(null);
	const [salvando, setSalvando] = useState(false);

	const carregar = useCallback(async () => {
		setCarregando(true);
		try {
			const lista = await LocaisTrocaApi.listar();
			setItens(lista);
		} catch {
			toast.error("Não foi possível carregar os locais de troca.");
		} finally {
			setCarregando(false);
		}
	}, []);

	useEffect(() => {
		void carregar();
	}, [carregar]);

	const filtrados = useMemo(() => {
		const t = filtro.trim().toLowerCase();
		return itens.filter((item) => {
			if (t && !item.nome.toLowerCase().includes(t)) return false;
			if (filtroStatus === "ativo" && !item.ativo) return false;
			if (filtroStatus === "inativo" && item.ativo) return false;
			return true;
		});
	}, [itens, filtro, filtroStatus]);

	const abrirNovo = () => {
		setModoDialogo("novo");
		setEditando(null);
		setDialogoAberto(true);
	};

	const abrirEditar = (item: LocalTrocaDto) => {
		setModoDialogo("editar");
		setEditando(item);
		setDialogoAberto(true);
	};

	const fecharDialogo = () => {
		setDialogoAberto(false);
		setEditando(null);
	};

	const salvar = async (payload: LocalTrocaSalvarPayload) => {
		setSalvando(true);
		try {
			if (modoDialogo === "novo") {
				await LocaisTrocaApi.criar(payload);
				toast.success("Local de troca cadastrado.");
			} else if (editando) {
				await LocaisTrocaApi.atualizar(editando.cdLocalTroca, payload);
				toast.success("Local de troca atualizado.");
			}
			fecharDialogo();
			await carregar();
		} catch {
			toast.error("Não foi possível salvar o local de troca.");
		} finally {
			setSalvando(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Locais de troca</h1>
					<p className="text-sm text-muted-foreground">Gerencie endereços utilizados como local de troca.</p>
				</div>
				<Can claim="local-troca.create">
					<Button type="button" className="gap-2" onClick={abrirNovo}>
						<Plus className="h-4 w-4 shrink-0" aria-hidden />
						Novo endereço
					</Button>
				</Can>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Filtros</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-wrap items-end gap-4">
					<div className="grid min-w-[min(100%,18rem)] flex-1 basis-[16rem] gap-2">
						<Label htmlFor="filtro-locais-nome">Busca por nome</Label>
						<Input
							id="filtro-locais-nome"
							placeholder="Digite o nome…"
							value={filtro}
							onChange={(e) => setFiltro(e.target.value)}
						/>
					</div>
					<div className="grid w-full min-w-[10rem] gap-2 sm:w-44">
						<Label htmlFor="filtro-locais-status">Status</Label>
						<Select
							triggerId="filtro-locais-status"
							value={filtroStatus}
							onValueChange={(v) => setFiltroStatus(v as "todos" | "ativo" | "inativo")}
							options={[
								{ value: "todos", label: "Todos" },
								{ value: "ativo", label: "Ativo" },
								{ value: "inativo", label: "Inativo" },
							]}
						/>
					</div>
					<Button type="button" variant="secondary" onClick={() => void carregar()} disabled={carregando}>
						{carregando ? "Atualizando…" : "Atualizar"}
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Locais encontrados ({filtrados.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{carregando ? (
						<p className="text-sm text-muted-foreground">Carregando…</p>
					) : filtrados.length === 0 ? (
						<p className="text-sm text-muted-foreground">Nenhum local encontrado com os filtros atuais.</p>
					) : (
						<div className="overflow-x-auto rounded-md border">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b bg-muted/40 text-left text-muted-foreground">
										<th className="px-3 py-2.5 pr-4 font-medium">Nome</th>
										<th className="px-3 py-2.5 pr-4 font-medium">Endereço</th>
										<th className="px-3 py-2.5 pr-4 font-medium">Status</th>
										<th className="px-3 py-2.5 font-medium text-center">Ações</th>
									</tr>
								</thead>
								<tbody>
									{filtrados.map((item) => (
										<tr key={item.cdLocalTroca} className="border-b border-border/60 last:border-0">
											<td className="px-3 py-2.5 pr-4 font-medium">{item.nome}</td>
											<td className="px-3 py-2.5 pr-4 text-muted-foreground whitespace-pre-wrap">{item.endereco}</td>
											<td className="px-3 py-2.5 pr-4">{rotuloAtivo(item.ativo)}</td>
											<td className="px-3 py-2.5">
												<div className="flex items-center justify-center">
													<Can claim="local-troca.edit">
														<Button
															type="button"
															size="icon"
															className="bg-primary text-primary-foreground hover:bg-primary/90"
															aria-label={`Editar ${item.nome}`}
															onClick={() => abrirEditar(item)}>
															<Pencil className="h-4 w-4" />
														</Button>
													</Can>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>

			<DialogoLocalTroca
				aberto={dialogoAberto}
				onOpenChange={(aberto) => !aberto && fecharDialogo()}
				modo={modoDialogo}
				registro={editando}
				onSalvar={salvar}
				salvando={salvando}
			/>
		</div>
	);
}
