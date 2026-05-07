import { Can } from "@/components/can";
import { EventosApi } from "@/features/eventos/api/eventos-api";
import { IngressosApi } from "@/features/eventos/api/ingressos-api";
import {
	DialogoFluxoRetiradaQrIngresso,
	type ResultadoProcessarLeituraQr,
} from "@/features/eventos/components/dialogo-fluxo-retirada-qr-ingresso";
import type { IngressoQrResolverDto } from "@/features/eventos/types";
import { useAuth } from "@/hooks/use-auth";
import { QrCode } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Fluxo global: leitura do QR → confirmar retirada → sucesso (no mesmo diálogo).
 * Botão pensado para a barra lateral (acesso rápido ao operador).
 */
export function FluxoRetiradaQrIngresso() {
	const { user } = useAuth();
	const [fluxoAberto, setFluxoAberto] = useState(false);

	const processarLeitura = useCallback(async (payloadBruto: string): Promise<ResultadoProcessarLeituraQr> => {
		try {
			const dto = await IngressosApi.validarLeitura(payloadBruto);
			try {
				const evento = await EventosApi.obter(dto.cdEventosCadastro);
				return { ok: true, dto, evento };
			} catch {
				toast.error("Não foi possível carregar o evento.");
				return { ok: false };
			}
		} catch {
			return { ok: false };
		}
	}, []);

	const confirmarRetirada = useCallback(
		async (dto: IngressoQrResolverDto, cdLocal?: string) => {
			if (!dto.podeConfirmarRetirada) return;
			try {
				await IngressosApi.confirmarRetirada(dto.cdIngresso, {
					cdLocalRetirada: cdLocal,
					nomeOperadorRetirada: user?.name,
				});
			} catch {
				toast.error("Não foi possível confirmar a retirada.");
				throw new Error("confirmar");
			}
		},
		[user]
	);

	return (
		<>
			<Can claim='eventos.edit'>
				<button
					type='button'
					onClick={() => setFluxoAberto(true)}
					className='mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'>
					<QrCode className='h-4 w-4 shrink-0' aria-hidden />
					Ler QR Code
				</button>
			</Can>

			<DialogoFluxoRetiradaQrIngresso
				aberto={fluxoAberto}
				onAbertoChange={setFluxoAberto}
				processarLeitura={processarLeitura}
				onConfirmarRetirada={confirmarRetirada}
				tituloLeitura='Ler QR Code do ingresso'
			/>
		</>
	);
}
