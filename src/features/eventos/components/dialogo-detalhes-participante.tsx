import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/base/dialog";
import { ParticipantesApi } from "@/features/eventos/api/eventos-api";
import { formatarDataHoraPortugues24 } from "@/features/eventos/lib/datas-evento";
import type { ParticipanteHistoricoEventoDto } from "@/features/eventos/types";
import { maskCPF, maskPhone, onlyDigits } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
	aberto: boolean;
	onAbertoChange: (aberto: boolean) => void;
	/** CPF com ou sem máscara (apenas dígitos são enviados à API). */
	documentoParticipante: string;
	nomeParticipante?: string;
	emailParticipante?: string;
	telefoneParticipante?: string;
};

function rotuloStatusLinha(h: ParticipanteHistoricoEventoDto): string {
	if (h.statusReserva === "CANCELADA") return "Cancelada";
	if (h.presencaConfirmada) return "Retirado";
	return "Pendente retirada";
}

export function DialogoDetalhesParticipante({
	aberto,
	onAbertoChange,
	documentoParticipante,
	nomeParticipante,
	emailParticipante,
	telefoneParticipante,
}: Props) {
	const [historico, setHistorico] = useState<ParticipanteHistoricoEventoDto[]>([]);
	const [carregando, setCarregando] = useState(false);

	useEffect(() => {
		if (!aberto || !documentoParticipante.trim()) {
			setHistorico([]);
			return;
		}
		let cancelado = false;
		setCarregando(true);
		void ParticipantesApi.listarPorDocumento(onlyDigits(documentoParticipante))
			.then((rows) => {
				if (!cancelado) setHistorico(rows);
			})
			.catch(() => {
				if (!cancelado) {
					toast.error("Não foi possível carregar o histórico do participante.");
					setHistorico([]);
				}
			})
			.finally(() => {
				if (!cancelado) setCarregando(false);
			});
		return () => {
			cancelado = true;
		};
	}, [aberto, documentoParticipante]);

	const docFmt = documentoParticipante ? maskCPF(onlyDigits(documentoParticipante).slice(0, 11)) : "";
	const telFmt = telefoneParticipante ? maskPhone(onlyDigits(telefoneParticipante).slice(0, 11)) : "";

	return (
		<Dialog open={aberto} onOpenChange={onAbertoChange}>
			<DialogContent className='flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0'>
				<DialogHeader className='shrink-0 border-b px-6 pb-4 pt-6 text-left'>
					<DialogTitle>Participante</DialogTitle>
					{nomeParticipante ? (
						<p className='text-sm font-normal text-muted-foreground'>{nomeParticipante}</p>
					) : null}
				</DialogHeader>
				<div className='min-h-0 flex-1 overflow-y-auto px-6 py-4'>
					<dl className='mb-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
						<div>
							<dt className='text-muted-foreground'>CPF</dt>
							<dd className='font-medium'>{docFmt || "—"}</dd>
						</div>
						<div>
							<dt className='text-muted-foreground'>Telefone</dt>
							<dd className='font-medium'>{telFmt || "—"}</dd>
						</div>
						<div className='sm:col-span-2'>
							<dt className='text-muted-foreground'>E-mail</dt>
							<dd className='font-medium'>{emailParticipante?.trim() || "—"}</dd>
						</div>
					</dl>
					<p className='mb-2 text-sm font-medium'>Inscrições em eventos</p>
					{carregando ? (
						<p className='text-sm text-muted-foreground'>Carregando…</p>
					) : historico.length === 0 ? (
						<p className='text-sm text-muted-foreground'>Nenhuma inscrição encontrada.</p>
					) : (
						<div className='overflow-x-auto rounded-md border'>
							<table className='w-full text-sm'>
								<thead>
									<tr className='border-b bg-muted/40 text-left text-muted-foreground'>
										<th className='px-3 py-2.5 font-medium'>Data do evento</th>
										<th className='px-3 py-2.5 font-medium'>Evento</th>
										<th className='px-3 py-2.5 font-medium'>Ingressos</th>
										<th className='px-3 py-2.5 font-medium'>Estado</th>
										<th className='px-3 py-2.5 font-medium'>Retirada</th>
									</tr>
								</thead>
								<tbody>
									{historico.map((h) => (
										<tr key={`${h.cdEventosCadastro}-${h.dataEvento}`} className='border-b border-border/60 last:border-0'>
											<td className='px-3 py-2.5 whitespace-nowrap'>{h.dataEvento}</td>
											<td className='px-3 py-2.5 font-medium'>{h.nomeEvento}</td>
											<td className='px-3 py-2.5 tabular-nums'>{h.quantidadeIngressos}</td>
											<td className='px-3 py-2.5'>{rotuloStatusLinha(h)}</td>
											<td className='px-3 py-2.5 text-muted-foreground text-xs'>
												{h.presencaConfirmada && h.dataRetirada ? (
													<span>
														{h.nomeLocalRetirada ? `${h.nomeLocalRetirada} · ` : ""}
														{formatarDataHoraPortugues24(h.dataRetirada)}
													</span>
												) : (
													"—"
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
