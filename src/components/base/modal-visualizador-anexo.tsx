import { Button } from '@/components/base/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/base/dialog';
import { baixarAnexo, criarUrlParaVisualizacao, type ArquivoAnexo } from '@/lib/download-anexo';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type ModalVisualizadorAnexoProps = {
	aberto: boolean;
	onAbertoChange: (aberto: boolean) => void;
	anexo: ArquivoAnexo | null;
	titulo?: string;
};

export function ModalVisualizadorAnexo({
	aberto,
	onAbertoChange,
	anexo,
	titulo = 'Visualizar anexo',
}: ModalVisualizadorAnexoProps) {
	const [urlObjeto, setUrlObjeto] = useState<string | null>(null);

	useEffect(() => {
		if (!aberto || !anexo) {
			setUrlObjeto(null);
			return;
		}
		const url = criarUrlParaVisualizacao(anexo);
		setUrlObjeto(url);
		return () => {
			if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
		};
	}, [aberto, anexo]);

	const handleBaixar = async () => {
		if (!anexo) return;
		try {
			await baixarAnexo(anexo);
		} catch {
			toast.error('Não foi possível baixar o arquivo.');
		}
	};

	const mime = anexo?.tipoMime ?? '';
	const ehImagem = mime.startsWith('image/');
	const ehPdf = mime === 'application/pdf' || anexo?.nome.toLowerCase().endsWith('.pdf');

	return (
		<Dialog open={aberto} onOpenChange={onAbertoChange}>
			<DialogContent className='max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0'>
				<DialogHeader className='px-4 py-3 border-b shrink-0'>
					<DialogTitle className='text-base pr-8'>{titulo}</DialogTitle>
					{anexo && (
						<p className='text-xs text-muted-foreground font-normal truncate'>
							{anexo.nome}
						</p>
					)}
				</DialogHeader>

				<div className='flex-1 min-h-[50vh] max-h-[70vh] overflow-auto bg-muted/30 p-4'>
					{!anexo && <p className='text-sm text-muted-foreground'>Nenhum arquivo.</p>}
					{anexo && !urlObjeto && (
						<p className='text-sm text-muted-foreground'>
							Visualização indisponível para este tipo de arquivo.
						</p>
					)}
					{urlObjeto && ehImagem && (
						<img
							src={urlObjeto}
							alt={anexo?.nome ?? ''}
							className='max-w-full max-h-[65vh] mx-auto object-contain'
						/>
					)}
					{urlObjeto && ehPdf && !ehImagem && (
						<iframe
							title={anexo?.nome ?? 'PDF'}
							src={urlObjeto}
							className='w-full h-[65vh] rounded border bg-background'
						/>
					)}
					{urlObjeto && !ehImagem && !ehPdf && (
						<div className='flex flex-col items-center justify-center gap-4 py-12'>
							<p className='text-sm text-muted-foreground text-center'>
								Pré-visualização não suportada. Use o download.
							</p>
							<Button type='button' onClick={() => void handleBaixar()}>
								<Download className='h-4 w-4 mr-2' />
								Baixar
							</Button>
						</div>
					)}
				</div>

				<DialogFooter className='shrink-0 border-t px-4 py-3'>
					{anexo && urlObjeto && (ehImagem || ehPdf) && (
						<Button type='button' variant='outline' onClick={() => void handleBaixar()}>
							<Download className='h-4 w-4 mr-2' />
							Baixar
						</Button>
					)}
					<Button type='button' variant='secondary' onClick={() => onAbertoChange(false)}>
						Fechar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
