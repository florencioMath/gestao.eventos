import { Button } from "@/components/base/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/base/dialog";
import type { EventoCadastroDto } from "@/features/eventos/types";

export type DialogoEventoEmDestaqueIntent = {
	evento: EventoCadastroDto;
	/** Valor desejado após confirmar (`true` = definir destaque, `false` = remover). */
	valorDesejado: boolean;
};

type Props = {
	aberto: boolean;
	intent: DialogoEventoEmDestaqueIntent | null;
	onAbertoChange: (aberto: boolean) => void;
	carregando?: boolean;
	onConfirmar: () => void | Promise<void>;
};

export function DialogoEventoEmDestaque({ aberto, intent, onAbertoChange, carregando, onConfirmar }: Props) {
	const nome = intent?.evento.nomeEvento ?? "";
	const definir = intent?.valorDesejado === true;

	return (
		<Dialog open={aberto} onOpenChange={onAbertoChange}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>{definir ? "Destacar evento no portal?" : "Remover destaque?"}</DialogTitle>
					<DialogDescription className='text-left'>
						{definir ? (
							<>
								O evento <span className='font-medium text-foreground'>{nome}</span> passará a constar como destaque
								no portal. Os restantes eventos que já estiverem em destaque mantêm-se.
							</>
						) : (
							<>
								O evento <span className='font-medium text-foreground'>{nome}</span> deixará de aparecer como
								destaque no portal.
							</>
						)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className='gap-2 sm:gap-0'>
					<Button type='button' variant='outline' onClick={() => onAbertoChange(false)} disabled={carregando}>
						Cancelar
					</Button>
					<Button type='button' onClick={() => void onConfirmar()} disabled={carregando || !intent}>
						{carregando ? "A guardar…" : "Confirmar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
