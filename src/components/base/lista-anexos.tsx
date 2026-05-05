import { Button } from '@/components/base/button';
import { baixarAnexo, type ArquivoAnexo } from '@/lib/download-anexo';
import { Download, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';

type ListaAnexosProps = {
	anexos: ArquivoAnexo[];
	/** Se omitido, usa baixarAnexo diretamente. */
	onVisualizar?: (anexo: ArquivoAnexo) => void;
	onBaixar?: (anexo: ArquivoAnexo) => void;
	idsCarregando?: Set<string>;
	className?: string;
	tituloSecao?: string;
};

export function ListaAnexos({
	anexos,
	onVisualizar,
	onBaixar,
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
					return (
						<li
							key={anexo.id}
							className='flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-muted/40'>
							<span className='flex items-center gap-2 min-w-0'>
								<FileText className='h-4 w-4 shrink-0 text-muted-foreground' />
								<span className='truncate font-medium'>{anexo.nome}</span>
								{anexo.tamanhoBytes != null && (
									<span className='text-muted-foreground shrink-0 text-xs'>
										{(anexo.tamanhoBytes / 1024).toFixed(1)} KB
									</span>
								)}
							</span>
							<div className='flex items-center gap-1 shrink-0'>
								{onVisualizar && (
									<Button
										type='button'
										variant='ghost'
										size='icon'
										disabled={carregando}
										onClick={() => onVisualizar(anexo)}
										aria-label={`Visualizar ${anexo.nome}`}>
										<Eye className='h-4 w-4' />
									</Button>
								)}
								<Button
									type='button'
									variant='ghost'
									size='icon'
									disabled={carregando}
									onClick={() => void handleBaixar(anexo)}
									aria-label={`Baixar ${anexo.nome}`}>
									<Download className='h-4 w-4' />
								</Button>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
