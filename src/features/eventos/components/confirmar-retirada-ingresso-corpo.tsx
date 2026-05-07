import { Button } from "@/components/base/button";
import { Label } from "@/components/base/label";
import { Select } from "@/components/base/select";
import type { EventoCadastroDto, IngressoQrResolverDto } from "@/features/eventos/types";
import { maskCPF } from "@/lib/utils";
import { useEffect, useId, useMemo, useState } from "react";

type Props = {
	evento: EventoCadastroDto | null;
	dados: IngressoQrResolverDto | null;
	onVoltar: () => void;
	onConfirmar: (cdLocalRetirada?: string) => void;
	gravando?: boolean;
};

export function ConfirmarRetiradaIngressoCorpo({
	evento,
	dados,
	onVoltar,
	onConfirmar,
	gravando = false,
}: Props) {
	const idBase = useId();
	const triggerId = `${idBase}-ponto-retirada`;

	const pontos = useMemo(
		() => (evento?.semPontoDeTroca ? [] : (evento?.pontosDeTrocaCodigos ?? [])),
		[evento?.semPontoDeTroca, evento?.pontosDeTrocaCodigos]
	);
	const [cdLocal, setCdLocal] = useState("");

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (!dados) {
			setCdLocal("");
			return;
		}
		if (pontos.length === 1) setCdLocal(pontos[0]!.id);
		else setCdLocal("");
	}, [dados?.cdIngresso, pontos, dados]);
	/* eslint-enable react-hooks/set-state-in-effect */

	const podeConfirmar = useMemo(() => {
		if (!dados?.podeConfirmarRetirada) return false;
		if (!evento) return false;
		if (evento.semPontoDeTroca || pontos.length === 0) return true;
		return Boolean(cdLocal.trim());
	}, [dados, evento, pontos.length, cdLocal]);

	const docFmt = dados?.documentoParticipante
		? maskCPF(String(dados.documentoParticipante).replace(/\D/g, "").slice(0, 11))
		: "";

	return (
		<>
			<p className='text-sm font-normal text-muted-foreground'>
				Confira os dados lidos do QR Code antes de validar a retirada no ponto de troca.
			</p>
			{dados ? (
				<div className='space-y-3 text-sm my-4'>
					<p>
						<span className='text-muted-foreground'>Evento: </span>
						<span className='font-medium'>{dados.nomeEvento}</span>
					</p>
					<p>
						<span className='text-muted-foreground'>Participante: </span>
						<span className='font-medium'>{dados.nomeParticipante}</span>
					</p>
					<p>
						<span className='text-muted-foreground'>CPF: </span>
						{docFmt}
					</p>
					<p>
						<span className='text-muted-foreground'>Ingresso: </span>
						<span className='tabular-nums font-medium'>
							{dados.ordemIngresso} de {dados.quantidadeIngressosReserva}
						</span>
					</p>
					{!dados.podeConfirmarRetirada ? (
						<p className='rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-xs'>
							{dados.motivoBloqueio ?? "Não é possível confirmar esta retirada."}
						</p>
					) : null}
					{pontos.length > 1 ? (
						<div className='grid gap-2'>
							<Label htmlFor={triggerId}>Ponto de troca</Label>
							<Select
								triggerId={triggerId}
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
							Este evento não tem ponto de troca cadastrado; a retirada será confirmada sem local específico.
						</p>
					)}
				</div>
			) : null}
			<div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
				<Button type='button' variant='outline' onClick={onVoltar} disabled={gravando}>
					Voltar
				</Button>
				<Button
					type='button'
					onClick={() => onConfirmar(pontos.length <= 1 ? pontos[0]?.id : cdLocal || undefined)}
					disabled={gravando || !podeConfirmar}>
					{gravando ? "Gravando…" : "Confirmar retirada"}
				</Button>
			</div>
		</>
	);
}
