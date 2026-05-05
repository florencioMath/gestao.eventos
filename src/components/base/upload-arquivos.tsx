import { Button } from '@/components/base/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/base/dialog';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Eye, FileIcon, Trash2, Upload } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';

export type AnexoEmUpload = {
	id: string;
	arquivo: File;
};

export function formatarTamanhoArquivo(bytes: number): string {
	if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${bytes} B`;
}

/** Miniatura para `File` local (criar evento / confirmar). Revoga object URL ao desmontar. */
export function MiniaturaArquivoLocal({ arquivo, className }: { arquivo: File; className?: string }) {
	const [src, setSrc] = useState<string | null>(null);

	useEffect(() => {
		if (!arquivo.type.startsWith('image/')) {
			setSrc(null);
			return;
		}
		const u = URL.createObjectURL(arquivo);
		setSrc(u);
		return () => URL.revokeObjectURL(u);
	}, [arquivo]);

	if (src) {
		return (
			<img
				src={src}
				alt=''
				className={cn('h-12 w-12 shrink-0 rounded-md border object-cover', className)}
			/>
		);
	}
	return <FileIcon className={cn('h-8 w-8 shrink-0 text-muted-foreground', className)} />;
}

/** Diálogo para pré-visualizar um `File` de imagem (URLs de objeto revogadas ao fechar). */
export function DialogoPrevisualizacaoImagemLocal({
	arquivo,
	aberto,
	onAbertoChange,
}: {
	arquivo: File | null;
	aberto: boolean;
	onAbertoChange: (aberto: boolean) => void;
}) {
	const [src, setSrc] = useState<string | null>(null);

	useEffect(() => {
		if (!aberto || !arquivo?.type.startsWith('image/')) {
			setSrc(null);
			return;
		}
		const u = URL.createObjectURL(arquivo);
		setSrc(u);
		return () => URL.revokeObjectURL(u);
	}, [aberto, arquivo]);

	return (
		<Dialog open={aberto} onOpenChange={onAbertoChange}>
			<DialogContent className='max-w-[min(90vw,56rem)]'>
				<DialogTitle className='sr-only'>Visualizar imagem</DialogTitle>
				{src ? (
					<img src={src} alt='' className='max-h-[80vh] w-full rounded-md object-contain' />
				) : (
					<p className='text-sm text-muted-foreground'>Pré-visualização não disponível.</p>
				)}
			</DialogContent>
		</Dialog>
	);
}

type UploadArquivosProps = {
	anexos: AnexoEmUpload[];
	onAnexosChange: (lista: AnexoEmUpload[]) => void;
	aceitar?: string;
	multiplo?: boolean;
	/** Padrão alinhado ao restante do app em PT-BR. */
	textoBotao?: string;
	className?: string;
	/** Título em destaque dentro da zona tracejada. */
	tituloDestaque?: string;
	/** Linha de instrução (ex.: arrastar ou clicar). */
	descricaoArraste?: string;
	/** Texto auxiliar pequeno (formatos e limites). Se omitido, pode ser gerado a partir de `apenasImagens`, `tamanhoMaximoBytes` e `maxArquivos`. */
	textoAuxiliar?: string;
	/** Máximo de arquivos na lista. */
	maxArquivos?: number;
	/** Tamanho máximo por arquivo (bytes). */
	tamanhoMaximoBytes?: number;
	/** Restringe a `image/*` e valida o tipo MIME após seleção. */
	apenasImagens?: boolean;
	/** Impede remover da lista até ficar com menos que este número (ex.: 1). */
	minArquivos?: number;
};

export function UploadArquivos({
	anexos,
	onAnexosChange,
	aceitar,
	multiplo = true,
	textoBotao = 'Selecionar arquivos',
	className,
	tituloDestaque,
	descricaoArraste = 'Arraste arquivos ou clique para selecionar',
	textoAuxiliar: textoAuxiliarProp,
	maxArquivos,
	tamanhoMaximoBytes,
	apenasImagens,
	minArquivos,
}: UploadArquivosProps) {
	const inputId = useId();
	const refInput = useRef<HTMLInputElement>(null);
	const [arrastando, setArrastando] = useState(false);
	const [arquivoPrevisualizar, setArquivoPrevisualizar] = useState<File | null>(null);

	const acceptFinal = aceitar ?? (apenasImagens ? 'image/*' : undefined);
	const listaCheia = maxArquivos != null && anexos.length >= maxArquivos;
	const naoPodeRemoverItem = minArquivos != null && anexos.length <= minArquivos;

	const textoAuxiliarGerado = (() => {
		if (textoAuxiliarProp != null) return textoAuxiliarProp;
		if (!apenasImagens && tamanhoMaximoBytes == null && maxArquivos == null) return null;
		const partes: string[] = [];
		if (apenasImagens) partes.push('Formatos: JPG, PNG, WebP ou GIF');
		if (tamanhoMaximoBytes != null) partes.push(`máx. ${formatarTamanhoArquivo(tamanhoMaximoBytes)} cada`);
		if (maxArquivos != null) partes.push(`até ${maxArquivos} imagem(ns)`);
		return partes.length ? partes.join(' · ') : null;
	})();

	const abrirSelecao = () => {
		if (listaCheia) {
			toast.error(`Limite de ${maxArquivos} arquivo(s) atingido.`);
			return;
		}
		refInput.current?.click();
	};

	const adicionarArquivos = (lista: FileList | File[]) => {
		let arquivos = Array.from(lista);
		if (arquivos.length === 0) return;

		if (apenasImagens) {
			const naoImagens = arquivos.filter((f) => !f.type.startsWith('image/'));
			if (naoImagens.length > 0) {
				toast.error('Envie apenas imagens (JPG, PNG, WebP, etc.).');
			}
			arquivos = arquivos.filter((f) => f.type.startsWith('image/'));
		}

		if (tamanhoMaximoBytes != null) {
			const grandes = arquivos.filter((f) => f.size > tamanhoMaximoBytes);
			if (grandes.length > 0) {
				toast.error(`Cada arquivo deve ter no máximo ${formatarTamanhoArquivo(tamanhoMaximoBytes)}.`);
			}
			arquivos = arquivos.filter((f) => f.size <= tamanhoMaximoBytes);
		}

		const vagas = maxArquivos != null ? Math.max(0, maxArquivos - anexos.length) : arquivos.length;
		if (vagas <= 0) {
			toast.error(`É possível enviar no máximo ${maxArquivos} arquivo(s).`);
			return;
		}

		if (arquivos.length > vagas) {
			toast.info(`Foram adicionados ${vagas} arquivo(s). O limite é de ${maxArquivos}.`);
			arquivos = arquivos.slice(0, vagas);
		}

		if (arquivos.length === 0) return;

		const novos: AnexoEmUpload[] = arquivos.map((arquivo) => ({
			id: `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}-${Math.random().toString(36).slice(2)}`,
			arquivo,
		}));
		onAnexosChange(multiplo ? [...anexos, ...novos] : novos);
	};

	const podeInteragir = !listaCheia;

	return (
		<div className={cn('space-y-3', className)}>
			<input
				ref={refInput}
				id={inputId}
				type='file'
				className='sr-only'
				accept={acceptFinal}
				multiple={multiplo && (maxArquivos == null || maxArquivos > 1)}
				disabled={listaCheia}
				onChange={(e) => {
					if (e.target.files?.length) adicionarArquivos(e.target.files);
					e.target.value = '';
				}}
			/>

			<div
				className={cn(
					'flex flex-col items-center gap-2 rounded-lg border border-dashed bg-background p-8 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
					arrastando && podeInteragir ? 'border-primary bg-primary/5' : 'border-muted-foreground/30',
					podeInteragir ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
				)}
				onClick={() => podeInteragir && abrirSelecao()}
				onDragOver={(e) => {
					if (!podeInteragir) return;
					e.preventDefault();
					setArrastando(true);
				}}
				onDragLeave={() => setArrastando(false)}
				onDrop={(e) => {
					e.preventDefault();
					setArrastando(false);
					if (!podeInteragir) return;
					if (e.dataTransfer.files?.length) adicionarArquivos(e.dataTransfer.files);
				}}>
				<Upload className='h-10 w-10 text-muted-foreground' aria-hidden />
				{tituloDestaque ? (
					<p className='text-sm font-semibold text-foreground'>{tituloDestaque}</p>
				) : null}
				<p className='text-sm text-muted-foreground'>{descricaoArraste}</p>
				{textoAuxiliarGerado ? (
					<p className='max-w-md text-xs leading-relaxed text-muted-foreground'>{textoAuxiliarGerado}</p>
				) : null}
				<Button
					type='button'
					variant='outline'
					disabled={listaCheia}
					className='pointer-events-auto'
					onClick={(e) => {
						e.stopPropagation();
						abrirSelecao();
					}}>
					{textoBotao}
				</Button>
			</div>

			{anexos.length > 0 && (
				<ul className='space-y-2'>
					{anexos.map((item, index) => {
						const ehImagem = item.arquivo.type.startsWith('image/');
						const mover = (delta: number) => {
							const i = anexos.findIndex((a) => a.id === item.id);
							const j = i + delta;
							if (i < 0 || j < 0 || j >= anexos.length) return;
							const next = [...anexos];
							[next[i], next[j]] = [next[j], next[i]];
							onAnexosChange(next);
						};
						return (
							<li
								key={item.id}
								className='flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm'>
								<span className='flex min-w-0 flex-1 items-center gap-3'>
									<MiniaturaArquivoLocal arquivo={item.arquivo} />
									<span className='truncate font-medium'>{item.arquivo.name}</span>
									<span className='shrink-0 text-muted-foreground'>
										({formatarTamanhoArquivo(item.arquivo.size)})
									</span>
								</span>
								<div className='flex shrink-0 items-center gap-1'>
									<Button
										type='button'
										variant='outline'
										size='icon'
										className='h-8 w-8'
										disabled={index === 0}
										aria-label={`Mover ${item.arquivo.name} para cima`}
										onClick={() => mover(-1)}>
										<ChevronUp className='h-4 w-4' />
									</Button>
									<Button
										type='button'
										variant='outline'
										size='icon'
										className='h-8 w-8'
										disabled={index >= anexos.length - 1}
										aria-label={`Mover ${item.arquivo.name} para baixo`}
										onClick={() => mover(1)}>
										<ChevronDown className='h-4 w-4' />
									</Button>
									{ehImagem ? (
										<Button
											type='button'
											variant='outline'
											size='icon'
											className='h-8 w-8'
											onClick={() => setArquivoPrevisualizar(item.arquivo)}
											aria-label={`Visualizar ${item.arquivo.name}`}>
											<Eye className='h-4 w-4' />
										</Button>
									) : null}
									<Button
										type='button'
										variant='outline'
										size='icon'
										className='h-8 w-8 border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive'
										disabled={naoPodeRemoverItem}
										onClick={() => onAnexosChange(anexos.filter((a) => a.id !== item.id))}
										aria-label={`Remover ${item.arquivo.name}`}>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							</li>
						);
					})}
				</ul>
			)}

			<DialogoPrevisualizacaoImagemLocal
				arquivo={arquivoPrevisualizar}
				aberto={arquivoPrevisualizar != null}
				onAbertoChange={(v) => {
					if (!v) setArquivoPrevisualizar(null);
				}}
			/>
		</div>
	);
}
