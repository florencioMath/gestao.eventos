import { Button } from "@/components/base/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/base/dialog";
import { DialogoPrevisualizacaoImagemLocal, type AnexoEmUpload } from "@/components/base/upload-arquivos";
import { ImagensApi } from "@/features/eventos/api/eventos-api";
import { Check, Eye, FileText, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type StatusEnvio = "pending" | "uploading" | "success" | "error";

type ItemEnvio = {
	idLocal: string;
	arquivo: File;
	previewUrl: string;
	status: StatusEnvio;
	retries: number;
};

const MAX_TENTATIVAS = 3;

const ROTULO_STATUS: Record<StatusEnvio, { label: string; className: string }> = {
	pending: {
		label: "Pendente",
		className: "bg-muted text-muted-foreground",
	},
	uploading: {
		label: "A enviar…",
		className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
	},
	success: {
		label: "Enviado",
		className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
	},
	error: {
		label: "Erro",
		className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
	},
};

export type DialogoEnvioImagensEventoProps = {
	open: boolean;
	cdEventosCadastro: string;
	/** Cópia estável dos anexos a enviar (ex.: ao abrir o diálogo). */
	anexos: AnexoEmUpload[];
	onFecharSucesso: () => void;
	/** Texto opcional na descrição (ex.: nome do evento). */
	descricaoContexto?: string;
};

/**
 * Após criar o evento, envia cada imagem em sequência com feedback por ficheiro
 * (padrão da apreensão no demutran: {@link AnexoUploadDialog}).
 */
export function DialogoEnvioImagensEvento({
	open,
	cdEventosCadastro,
	anexos,
	onFecharSucesso,
	descricaoContexto,
}: DialogoEnvioImagensEventoProps) {
	const [itens, setItens] = useState<ItemEnvio[]>([]);
	const [arquivoPrevisualizar, setArquivoPrevisualizar] = useState<File | null>(null);
	const aProcessar = useRef(false);
	const itensRef = useRef<ItemEnvio[]>([]);
	const fluxoEncerrado = useRef(false);

	useEffect(() => {
		itensRef.current = itens;
	}, [itens]);

	useEffect(() => {
		if (!open) fluxoEncerrado.current = false;
	}, [open]);

	useEffect(() => {
		if (!open || anexos.length === 0) {
			setItens([]);
			aProcessar.current = false;
			return;
		}

		const inicial: ItemEnvio[] = anexos.map((a) => ({
			idLocal: a.id,
			arquivo: a.arquivo,
			previewUrl: URL.createObjectURL(a.arquivo),
			status: "pending",
			retries: 0,
		}));
		setItens(inicial);
		itensRef.current = inicial;
		aProcessar.current = false;

		return () => {
			for (const p of inicial) URL.revokeObjectURL(p.previewUrl);
		};
	}, [open, anexos]);

	const enviarProximo = useCallback(async () => {
		if (aProcessar.current) return;

		const lista = itensRef.current;
		const idx = lista.findIndex((it) => it.status === "pending");
		if (idx === -1) return;

		aProcessar.current = true;
		const item = lista[idx];

		setItens((prev) => {
			const next = [...prev];
			next[idx] = { ...next[idx], status: "uploading" };
			return next;
		});

		try {
			await ImagensApi.upload(cdEventosCadastro, item.arquivo, idx, idx === 0);
			setItens((prev) => {
				const next = [...prev];
				next[idx] = { ...next[idx], status: "success" };
				return next;
			});
		} catch {
			setItens((prev) => {
				const next = [...prev];
				const novasTentativas = next[idx].retries + 1;
				next[idx] = {
					...next[idx],
					retries: novasTentativas,
					status: novasTentativas < MAX_TENTATIVAS ? "pending" : "error",
				};
				return next;
			});
		} finally {
			aProcessar.current = false;
		}
	}, [cdEventosCadastro]);

	useEffect(() => {
		if (!open || itens.length === 0) return;

		const temPendente = itens.some((it) => it.status === "pending");
		const temAEnviar = itens.some((it) => it.status === "uploading");

		if (temPendente && !temAEnviar) {
			void enviarProximo();
			return;
		}

		if (!temPendente && !temAEnviar) {
			const todosOk = itens.every((it) => it.status === "success");
			if (todosOk && !fluxoEncerrado.current) {
				fluxoEncerrado.current = true;
				toast.success("Todas as imagens foram enviadas.");
				queueMicrotask(() => onFecharSucesso());
			}
		}
	}, [open, itens, enviarProximo, onFecharSucesso]);

	const repetirItem = (index: number) => {
		setItens((prev) => {
			const next = [...prev];
			next[index] = { ...next[index], status: "pending", retries: 0 };
			return next;
		});
	};

	const pendenteOuAEnviar = itens.some((it) => it.status === "pending" || it.status === "uploading");
	const enviados = itens.filter((it) => it.status === "success").length;

	return (
		<>
			<Dialog open={open} onOpenChange={() => {}}>
				<DialogContent
					className='sm:max-w-md [&>button:last-child]:hidden'
					onInteractOutside={(e) => e.preventDefault()}
					onEscapeKeyDown={(e) => {
						if (pendenteOuAEnviar) e.preventDefault();
					}}>
					<DialogHeader>
						<DialogTitle>A enviar imagens</DialogTitle>
						<DialogDescription>
							{pendenteOuAEnviar
								? descricaoContexto
									? `A enviar imagens do evento: ${descricaoContexto}`
									: "A enviar imagens do evento criado…"
								: `${enviados} de ${itens.length} imagem(ns) processada(s).`}
						</DialogDescription>
					</DialogHeader>

					<div className='max-h-72 space-y-2 overflow-y-auto pr-1'>
						{itens.map((item, idx) => {
							const cfg = ROTULO_STATUS[item.status];
							const ehImagem = item.arquivo.type.startsWith("image/");

							return (
								<div key={item.idLocal} className='flex items-center gap-3 rounded-md border p-2'>
									<div className='shrink-0'>
										{ehImagem ? (
											<img
												src={item.previewUrl}
												alt=''
												className='h-10 w-10 rounded border object-cover'
											/>
										) : (
											<div className='flex h-10 w-10 items-center justify-center rounded border bg-muted text-muted-foreground'>
												<FileText className='h-4 w-4' />
											</div>
										)}
									</div>
									<span className='min-w-0 flex-1 truncate text-sm' title={item.arquivo.name}>
										{item.arquivo.name}
									</span>
									<div className='flex shrink-0 items-center gap-1'>
										<span
											className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
											{item.status === "uploading" ? <Loader2 className='h-3 w-3 animate-spin' /> : null}
											{item.status === "success" ? <Check className='h-3 w-3' /> : null}
											{cfg.label}
										</span>
										{ehImagem ? (
											<Button
												type='button'
												variant='outline'
												size='icon'
												className='h-8 w-8 shrink-0'
												title='Visualizar'
												onClick={() => setArquivoPrevisualizar(item.arquivo)}>
												<Eye className='h-4 w-4' />
											</Button>
										) : null}
										{item.status === "error" ? (
											<Button
												type='button'
												variant='ghost'
												size='icon'
												className='h-8 w-8 shrink-0'
												title='Reenviar'
												onClick={() => repetirItem(idx)}>
												<RefreshCw className='h-3.5 w-3.5' />
											</Button>
										) : null}
									</div>
								</div>
							);
						})}
					</div>

					<DialogFooter>
						<Button type='button' variant='secondary' disabled={pendenteOuAEnviar} onClick={onFecharSucesso}>
							Fechar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<DialogoPrevisualizacaoImagemLocal
				arquivo={arquivoPrevisualizar}
				aberto={arquivoPrevisualizar != null}
				onAbertoChange={(v) => {
					if (!v) setArquivoPrevisualizar(null);
				}}
			/>
		</>
	);
}
