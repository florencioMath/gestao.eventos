import { Button } from "@/components/base/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/base/card";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { RelatoriosApi } from "@/features/eventos/api/eventos-api";
import { baixarExportacaoExcelRelatorios } from "@/features/eventos/lib/relatorio-download";
import type { RelatorioGeradoDto } from "@/features/eventos/types";
import { Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function formatarDataBr(iso: string) {
	try {
		return new Date(iso).toLocaleString("pt-BR", {
			dateStyle: "short",
			timeStyle: "short",
			hour12: false,
		});
	} catch {
		return iso;
	}
}

function isoSóData(d: Date) {
	return d.toISOString().slice(0, 10);
}

function menosDias(d: Date, n: number) {
	const x = new Date(d);
	x.setDate(x.getDate() - n);
	return x;
}

export function PaginaRelatoriosEventos() {
	const hoje = new Date();
	const [ini, setIni] = useState(() => isoSóData(menosDias(hoje, 29)));
	const [fim, setFim] = useState(() => isoSóData(hoje));
	const [lista, setLista] = useState<RelatorioGeradoDto[]>([]);
	const [carregando, setCarregando] = useState(true);
	const [exportando, setExportando] = useState(false);

	const buscar = useCallback(async () => {
		setCarregando(true);
		try {
			const data = await RelatoriosApi.listarGerados({ dataInicio: ini, dataFim: fim });
			setLista(data);
		} catch {
			toast.error("Não foi possível carregar os relatórios.");
			setLista([]);
		} finally {
			setCarregando(false);
		}
	}, [ini, fim]);

	useEffect(() => {
		void buscar();
	}, [buscar]);

	const downloadExportacao = async () => {
		setExportando(true);
		try {
			await baixarExportacaoExcelRelatorios({ dataInicio: ini, dataFim: fim });
		} catch {
			toast.error("Falha no download.");
		} finally {
			setExportando(false);
		}
	};

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight'>Relatórios</h1>
				<p className='text-sm text-muted-foreground'>
					São listados apenas relatórios cujo período (início–fim) se cruza com o intervalo de datas selecionado.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Período</CardTitle>
				</CardHeader>
				<CardContent className='flex flex-wrap items-end gap-4'>
					<div className='grid gap-2'>
						<Label htmlFor='rel-ini'>Data início</Label>
						<Input id='rel-ini' type='date' value={ini} onChange={(e) => setIni(e.target.value)} />
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='rel-fim'>Data fim</Label>
						<Input id='rel-fim' type='date' value={fim} onChange={(e) => setFim(e.target.value)} />
					</div>
					<Button type='button' variant='secondary' onClick={() => void buscar()} disabled={carregando}>
						{carregando ? "Buscando…" : "Atualizar"}
					</Button>
					<Button
						type='button'
						disabled={exportando || carregando}
						className='ml-auto h-10 shrink-0 gap-2 bg-green-600 px-4 text-white hover:bg-green-700'
						onClick={() => void downloadExportacao()}>
						<Download className='h-4 w-4 shrink-0' aria-hidden />
						{exportando ? "A preparar…" : "Excel"}
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='space-y-1'>
					<CardTitle>Relatórios encontrados</CardTitle>
					<p className='text-sm font-normal text-muted-foreground'>
						Período do relatório deve intersectar as datas de filtro (início e fim) do cartão acima.
					</p>
				</CardHeader>
				<CardContent>
					{carregando ? (
						<p className='text-sm text-muted-foreground'>Carregando…</p>
					) : (
						<div className='overflow-x-auto rounded-md border'>
							{lista.length === 0 ? (
								<p className='p-4 text-sm text-muted-foreground'>Nenhum relatório no período.</p>
							) : (
								<table className='w-full text-sm'>
									<thead>
										<tr className='border-b bg-muted/40 text-left text-muted-foreground'>
											<th className='px-3 py-2.5 pr-4 font-medium'>Título</th>
											<th className='px-3 py-2.5 pr-4 font-medium'>Gerado em</th>
											<th className='px-3 py-2.5 pr-4 font-medium'>Período</th>
										</tr>
									</thead>
									<tbody>
										{lista.map((r) => (
											<tr key={r.id} className='border-b border-border/60 last:border-0'>
												<td className='px-3 py-2.5 pr-4 font-medium'>{r.titulo}</td>
												<td className='px-3 py-2.5 pr-4'>{formatarDataBr(r.dataGeracao)}</td>
												<td className='px-3 py-2.5 pr-4 text-muted-foreground'>
													{isoSóData(new Date(r.periodoInicio))} a {isoSóData(new Date(r.periodoFim))}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
