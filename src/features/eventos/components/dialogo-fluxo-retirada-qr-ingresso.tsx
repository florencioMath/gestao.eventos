import { Button } from "@/components/base/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/base/dialog";
import { ConfirmarRetiradaIngressoCorpo } from "@/features/eventos/components/confirmar-retirada-ingresso-corpo";
import { LeitorQrPainel } from "@/features/eventos/components/leitor-qr-painel";
import type { EventoCadastroDto, IngressoQrResolverDto } from "@/features/eventos/types";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type ResultadoProcessarLeituraQr =
	| { ok: true; dto: IngressoQrResolverDto; evento: EventoCadastroDto }
	| { ok: false };

type Etapa = "leitura" | "confirmacao" | "sucesso";

type Props = {
	aberto: boolean;
	onAbertoChange: (aberto: boolean) => void;
	/** Valida o texto do QR e resolve o evento (lista de participantes ou fetch global). */
	processarLeitura: (payloadBruto: string) => Promise<ResultadoProcessarLeituraQr>;
	/** Grava a retirada; deve rejeitar a promise em caso de erro na API. */
	onConfirmarRetirada: (dto: IngressoQrResolverDto, cdLocalRetirada?: string) => Promise<void>;
	/** Ex.: recarregar lista de participantes antes do passo «sucesso». */
	aposConfirmarSucesso?: () => Promise<void>;
	tituloLeitura?: string;
};

export function DialogoFluxoRetiradaQrIngresso({
	aberto,
	onAbertoChange,
	processarLeitura,
	onConfirmarRetirada,
	aposConfirmarSucesso,
	tituloLeitura = "Ler QR Code do ingresso",
}: Props) {
	const [etapa, setEtapa] = useState<Etapa>("leitura");
	const [leituraKey, setLeituraKey] = useState(0);
	const [dadosQr, setDadosQr] = useState<IngressoQrResolverDto | null>(null);
	const [evento, setEvento] = useState<EventoCadastroDto | null>(null);
	const [carregandoLeitura, setCarregandoLeitura] = useState(false);
	const [gravando, setGravando] = useState(false);

	const reporLeitura = useCallback(() => {
		setEtapa("leitura");
		setDadosQr(null);
		setEvento(null);
		setLeituraKey((k) => k + 1);
	}, []);

	const fecharTudo = useCallback(() => {
		onAbertoChange(false);
	}, [onAbertoChange]);

	useEffect(() => {
		if (!aberto) {
			setEtapa("leitura");
			setDadosQr(null);
			setEvento(null);
			setCarregandoLeitura(false);
			setGravando(false);
			setLeituraKey((k) => k + 1);
		}
	}, [aberto]);

	const handlePayload = useCallback(
		async (raw: string) => {
			setCarregandoLeitura(true);
			try {
				const r = await processarLeitura(raw);
				if (r.ok) {
					setDadosQr(r.dto);
					setEvento(r.evento);
					setEtapa("confirmacao");
				}
			} finally {
				setCarregandoLeitura(false);
			}
		},
		[processarLeitura]
	);

	const handleConfirmar = useCallback(
		async (cdLocal?: string) => {
			if (!dadosQr) return;
			setGravando(true);
			try {
				await onConfirmarRetirada(dadosQr, cdLocal);
				if (aposConfirmarSucesso) await aposConfirmarSucesso();
				setEtapa("sucesso");
			} catch {
				/* erro já tratado no pai (toast) */
			} finally {
				setGravando(false);
			}
		},
		[dadosQr, onConfirmarRetirada, aposConfirmarSucesso]
	);

	const titulo =
		etapa === "leitura"
			? tituloLeitura
			: etapa === "confirmacao"
				? "Confirmar retirada do ingresso"
				: "Retirada confirmada";

	return (
		<Dialog
			open={aberto}
			onOpenChange={(v) => {
				if (!v) fecharTudo();
			}}>
			<DialogContent className='max-w-lg'>
				<DialogHeader>
					<DialogTitle>{titulo}</DialogTitle>
					{etapa === "leitura" ? (
						<DialogDescription>
							Use a câmera ou cole o código ou link partilhado (ex.: WhatsApp). O mesmo valor pode estar num
							PNG de QR.
						</DialogDescription>
					) : null}
				</DialogHeader>

				<div className='relative min-h-[120px]'>
					{carregandoLeitura ? (
						<div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-md bg-background/80'>
							<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' aria-hidden />
							<p className='text-sm text-muted-foreground'>A processar leitura…</p>
						</div>
					) : null}

					{etapa === "leitura" ? (
						<LeitorQrPainel
							ativo={aberto && etapa === "leitura" && !carregandoLeitura}
							resetKey={leituraKey}
							onPayload={(t) => void handlePayload(t)}
							onCancelar={fecharTudo}
						/>
					) : null}

					{etapa === "confirmacao" ? (
						<ConfirmarRetiradaIngressoCorpo
							evento={evento}
							dados={dadosQr}
							onVoltar={reporLeitura}
							onConfirmar={(cd) => void handleConfirmar(cd)}
							gravando={gravando}
						/>
					) : null}

					{etapa === "sucesso" ? (
						<div className='grid gap-4 pt-1'>
							<div className='flex gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm'>
								<CheckCircle2 className='h-5 w-5 shrink-0 text-emerald-600' aria-hidden />
								<p className='text-foreground'>
									A retirada do ingresso foi confirmada com sucesso. Deseja ler outro código ou terminar?
								</p>
							</div>
							<DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-end'>
								<Button
									type='button'
									className='w-full sm:w-auto'
									onClick={() => {
										reporLeitura();
									}}>
									Ler outro QR
								</Button>
								<Button type='button' variant='outline' className='w-full sm:w-auto' onClick={fecharTudo}>
									Finalizar
								</Button>
							</DialogFooter>
						</div>
					) : null}
				</div>
			</DialogContent>
		</Dialog>
	);
}
