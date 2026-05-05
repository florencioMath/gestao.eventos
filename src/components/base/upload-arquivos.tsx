import { Button } from '@/components/base/button';
import { cn } from '@/lib/utils';
import { FileIcon, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState } from 'react';

export type AnexoEmUpload = {
	id: string;
	arquivo: File;
};

type UploadArquivosProps = {
	anexos: AnexoEmUpload[];
	onAnexosChange: (lista: AnexoEmUpload[]) => void;
	aceitar?: string;
	multiplo?: boolean;
	textoBotao?: string;
	className?: string;
};

export function UploadArquivos({
	anexos,
	onAnexosChange,
	aceitar,
	multiplo = true,
	textoBotao = 'Selecionar arquivos',
	className,
}: UploadArquivosProps) {
	const inputId = useId();
	const refInput = useRef<HTMLInputElement>(null);
	const [arrastando, setArrastando] = useState(false);

	const adicionarArquivos = (lista: FileList | File[]) => {
		const arquivos = Array.from(lista);
		const novos: AnexoEmUpload[] = arquivos.map((arquivo) => ({
			id: `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}-${Math.random().toString(36).slice(2)}`,
			arquivo,
		}));
		onAnexosChange(multiplo ? [...anexos, ...novos] : novos);
	};

	return (
		<div className={cn('space-y-3', className)}>
			<input
				ref={refInput}
				id={inputId}
				type='file'
				className='sr-only'
				accept={aceitar}
				multiple={multiplo}
				onChange={(e) => {
					if (e.target.files?.length) adicionarArquivos(e.target.files);
					e.target.value = '';
				}}
			/>

			<div
				className={cn(
					'rounded-lg border border-dashed p-6 text-center transition-colors',
					arrastando ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
				)}
				onDragOver={(e) => {
					e.preventDefault();
					setArrastando(true);
				}}
				onDragLeave={() => setArrastando(false)}
				onDrop={(e) => {
					e.preventDefault();
					setArrastando(false);
					if (e.dataTransfer.files?.length) adicionarArquivos(e.dataTransfer.files);
				}}>
				<Upload className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
				<p className='text-sm text-muted-foreground mb-3'>
					Arraste arquivos aqui ou use o botão abaixo.
				</p>
				<Button type='button' variant='outline' onClick={() => refInput.current?.click()}>
					{textoBotao}
				</Button>
			</div>

			{anexos.length > 0 && (
				<ul className='space-y-2'>
					{anexos.map((item) => (
						<li
							key={item.id}
							className='flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm'>
							<span className='flex items-center gap-2 min-w-0'>
								<FileIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
								<span className='truncate'>{item.arquivo.name}</span>
								<span className='text-muted-foreground shrink-0'>
									({(item.arquivo.size / 1024).toFixed(1)} KB)
								</span>
							</span>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='shrink-0'
								onClick={() =>
									onAnexosChange(anexos.filter((a) => a.id !== item.id))
								}
								aria-label={`Remover ${item.arquivo.name}`}>
								<Trash2 className='h-4 w-4' />
							</Button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
