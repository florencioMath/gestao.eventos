import { Button } from '@/components/base/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/base/dialog';
import { UploadArquivos, type AnexoEmUpload } from '@/components/base/upload-arquivos';
import { useState } from 'react';
import { toast } from 'sonner';

type DialogoUploadAnexoProps = {
	aberto: boolean;
	onAbertoChange: (aberto: boolean) => void;
	titulo?: string;
	descricao?: string;
	aceitar?: string;
	multiplo?: boolean;
	/** Chamado ao confirmar; em caso de sucesso o diálogo é fechado. */
	onConfirmar: (arquivos: File[]) => void | Promise<void>;
};

export function DialogoUploadAnexo({
	aberto,
	onAbertoChange,
	titulo = 'Enviar anexos',
	descricao,
	aceitar,
	multiplo = true,
	onConfirmar,
}: DialogoUploadAnexoProps) {
	const [anexos, setAnexos] = useState<AnexoEmUpload[]>([]);
	const [enviando, setEnviando] = useState(false);

	const fechar = () => {
		setAnexos([]);
		onAbertoChange(false);
	};

	const confirmar = async () => {
		setEnviando(true);
		try {
			await onConfirmar(anexos.map((a) => a.arquivo));
			setAnexos([]);
			onAbertoChange(false);
		} catch {
			toast.error('Não foi possível concluir o envio.');
		} finally {
			setEnviando(false);
		}
	};

	return (
		<Dialog
			open={aberto}
			onOpenChange={(open) => {
				if (!open) fechar();
			}}>
			<DialogContent className='max-w-lg'>
				<DialogHeader>
					<DialogTitle>{titulo}</DialogTitle>
					{descricao && (
						<p className='text-sm text-muted-foreground font-normal'>{descricao}</p>
					)}
				</DialogHeader>
				<UploadArquivos
					anexos={anexos}
					onAnexosChange={setAnexos}
					aceitar={aceitar}
					multiplo={multiplo}
				/>
				<DialogFooter className='gap-2 sm:gap-2'>
					<Button type='button' variant='outline' onClick={fechar} disabled={enviando}>
						Cancelar
					</Button>
					<Button
						type='button'
						onClick={() => void confirmar()}
						disabled={enviando || anexos.length === 0}>
						{enviando ? 'Enviando…' : 'Confirmar'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
