import { Button } from "@/components/base/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/base/dialog";
import { Label } from "@/components/base/label";
import { Select } from "@/components/base/select";
import type { EventoCadastroDto, ParticipanteDto } from "@/features/eventos/types";
import { maskCPF } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

type Props = {
	aberto: boolean;
	onAbertoChange: (aberto: boolean) => void;
	evento: EventoCadastroDto | null;
	participante: ParticipanteDto | null;
	onConfirmar: (cdLocalRetirada?: string) => Promise<void>;
	gravando?: boolean;
};

export function DialogoConfirmarRetirada({
	aberto,
	onAbertoChange,
	evento,
	participante,
	onConfirmar,
	gravando = false,
}: Props) {
	const pontos = evento?.semPontoDeTroca ? [] : (evento?.pontosDeTrocaCodigos ?? []);
	const [cdLocal, setCdLocal] = useState("");

	useEffect(() => {
		if (!aberto) {
			setCdLocal("");
			return;
		}
		if (pontos.length === 1) setCdLocal(pontos[0]!.id);
		else setCdLocal("");
	}, [aberto, pontos]);

	const podeConfirmar = useMemo(() => {
		if (!participante || !evento) return false;
		if (evento.semPontoDeTroca || pontos.length === 0) return true;
		return Boolean(cdLocal.trim());
	}, [participante, evento, pontos.length, cdLocal]);

	const docFmt = participante?.documentoParticipante
		? maskCPF(participante.documentoParticipante.replace(/\D/g, "").slice(0, 11))
		: "";

	return (
		<Dialog open={aberto} onOpenChange={onAbertoChange}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>Confirmar retirada de ingressos</DialogTitle>
					<p className='text-sm font-normal text-muted-foreground'>
						Regista a retirada no ponto de troca e confirma a presença para esta reserva.
					</p>
				</DialogHeader>
				{participante ? (
					<div className='space-y-3 text-sm'>
						<p>
							<span className='text-muted-foreground'>Participante: </span>
							<span className='font-medium'>{participante.nomeParticipante}</span>
						</p>
						<p>
							<span className='text-muted-foreground'>CPF: </span>
							{docFmt}
						</p>
						<p>
							<span className='text-muted-foreground'>Ingressos: </span>
							<span className='tabular-nums font-medium'>{participante.quantidadeIngressos}</span>
						</p>
						{pontos.length > 1 ? (
							<div className='grid gap-2'>
								<Label htmlFor='ponto-retirada'>Ponto de troca</Label>
								<Select
									triggerId='ponto-retirada'
									value={cdLocal}
									onValueChange={setCdLocal}
									placeholder='Selecione…'
									options={pontos.map((p) => ({
										value: p.id,
										label: `${p.nome}${p.endereco ? ` — ${p.endereco}` : ""}`,
									}))}
								/>
							</div>
						) : pontos.length === 1 ? (
							<p className='text-muted-foreground'>
								Local: <span className='font-medium text-foreground'>{pontos[0]!.nome}</span>
								{pontos[0]!.endereco ? (
									<span className='mt-0.5 block text-xs'>{pontos[0]!.endereco}</span>
								) : null}
							</p>
						) : (
							<p className='text-sm text-muted-foreground'>
								Este evento não tem ponto de troca cadastrado; a retirada será confirmada sem local
								específico.
							</p>
						)}
					</div>
				) : null}
				<DialogFooter className='gap-2 sm:justify-end'>
					<Button type='button' variant='outline' onClick={() => onAbertoChange(false)} disabled={gravando}>
						Voltar
					</Button>
					<Button
						type='button'
						onClick={() => void onConfirmar(pontos.length <= 1 ? pontos[0]?.id : cdLocal || undefined)}
						disabled={gravando || !podeConfirmar}>
						{gravando ? "Gravando…" : "Confirmar retirada"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
