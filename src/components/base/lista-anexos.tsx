import { Button } from '@/components/base/button';
import { baixarAnexo, criarUrlParaVisualizacao, type ArquivoAnexo } from '@/lib/download-anexo';
import { Download, Eye, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type ListaAnexosProps = {
	anexos: ArquivoAnexo[];
	/** Se omitido, usa baixarAnexo diretamente. */
	onVisualizar?: (anexo: ArquivoAnexo) => void;
	onBaixar?: (anexo: ArquivoAnexo) => void;
	/** Ex.: edição de lista onde o item pode ser removido. */
	onExcluir?: (anexo: ArquivoAnexo) => void;
	idsCarregando?: Set<string>;
	className?: string;
	tituloSecao?: string;
};

export function ListaAnexos({
	anexos,
	onVisualizar,
	onBaixar,
	onExcluir,
	idsCarregando,
	className,
	tituloSecao = 'Anexos',
}: ListaAnexosProps) {
	const handleBaixar = async (anexo: ArquivoAnexo) => {
		if (onBaixar) {
			onBaixar(anexo);
			return;
		}
		try {
			await baixarAnexo(anexo);
		} catch {
			toast.error('Não foi possível baixar o arquivo.');
		}
	};

	if (anexos.length === 0) {
		return (
			<div className={className}>
				<p className='text-sm text-muted-foreground'>Nenhum anexo.</p>
			</div>
		);
	}

	return (
		<div className={className}>
			<h3 className='text-sm font-medium mb-2'>{tituloSecao}</h3>
			<ul className='divide-y rounded-md border'>
				{anexos.map((anexo) => {
					const carregando = idsCarregando?.has(anexo.id);
					const urlVis = criarUrlParaVisualizacao(anexo);
					const miniaturaImagem =
						urlVis != null &&
						(Boolean(anexo.tipoMime?.startsWith('image/')) || urlVis.startsWith('data:image'));
					return (
						<li
							key={anexo.id}
							className='flex items-center justify-between gap-3 rounded-none bg-card px-3 py-2.5 text-sm first:rounded-t-md last:rounded-b-md hover:bg-muted/40'>
							<span className='flex min-w-0 items-center gap-3'>
								{miniaturaImagem ? (
									<img
										src={urlVis}
										alt=''
										className='h-12 w-12 shrink-0 rounded-md border object-cover'
									/>
								) : (
									<FileText className='h-4 w-4 shrink-0 text-muted-foreground' />
								)}
								<span className='truncate font-medium'>{anexo.nome}</span>
								{anexo.tamanhoBytes != null && (
									<span className='text-muted-foreground shrink-0 text-xs'>
										{(anexo.tamanhoBytes / 1024).toFixed(1)} KB
									</span>
								)}
							</span>
							<div className='flex shrink-0 items-center gap-1'>
								{onVisualizar && (
									<Button
										type='button'
										variant='outline'
										size='icon'
										className='h-8 w-8'
										disabled={carregando}
										onClick={() => onVisualizar(anexo)}
										aria-label={`Visualizar ${anexo.nome}`}>
										<Eye className='h-4 w-4' />
									</Button>
								)}
								<Button
									type='button'
									variant='outline'
									size='icon'
									className='h-8 w-8'
									disabled={carregando}
									onClick={() => void handleBaixar(anexo)}
									aria-label={`Baixar ${anexo.nome}`}>
									<Download className='h-4 w-4' />
								</Button>
								{onExcluir ? (
									<Button
										type='button'
										variant='outline'
										size='icon'
										className='h-8 w-8 border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive'
										disabled={carregando}
										onClick={() => onExcluir(anexo)}
										aria-label={`Excluir ${anexo.nome}`}>
										<Trash2 className='h-4 w-4' />
									</Button>
								) : null}
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
