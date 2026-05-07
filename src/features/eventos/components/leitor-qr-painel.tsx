import { Button } from "@/components/base/button";
import { Label } from "@/components/base/label";
import { Textarea } from "@/components/base/textarea";
import { mensagemErroCameraParaUtilizador } from "@/features/eventos/lib/erro-camera-pt";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { AlertCircle, Camera, Keyboard } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function pararMidiaVideo(video: HTMLVideoElement | null) {
	const stream = video?.srcObject as MediaStream | null;
	stream?.getTracks().forEach((t) => t.stop());
	if (video) video.srcObject = null;
}

type ModoLeitor = "camera" | "manual";

type Props = {
	/** Quando falso, para a câmera e limpa estado local. */
	ativo: boolean;
	/** Incrementar para repor o painel ao voltar a «Ler outro». */
	resetKey: number;
	onPayload: (payloadBruto: string) => void;
	onCancelar: () => void;
};

export function LeitorQrPainel({ ativo, resetKey, onPayload, onCancelar }: Props) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const readerRef = useRef<BrowserMultiFormatReader | null>(null);
	const onPayloadRef = useRef(onPayload);

	useEffect(() => {
		onPayloadRef.current = onPayload;
	});

	const [modo, setModo] = useState<ModoLeitor>("camera");
	const [textoManual, setTextoManual] = useState("");
	const [estado, setEstado] = useState<"idle" | "pedindo" | "erro">("idle");
	const [mensagemErro, setMensagemErro] = useState<string | null>(null);

	const encerrarLeitura = useCallback(() => {
		pararMidiaVideo(videoRef.current);
		readerRef.current = null;
	}, []);

	const iniciarLeitura = useCallback(async () => {
		const video = videoRef.current;
		if (!video) return;
		setEstado("pedindo");
		setMensagemErro(null);
		encerrarLeitura();
		const reader = new BrowserMultiFormatReader();
		readerRef.current = reader;
		try {
			const resultado = await reader.decodeOnceFromVideoDevice(undefined, video);
			const texto = resultado.getText();
			encerrarLeitura();
			setEstado("idle");
			onPayloadRef.current(texto);
		} catch (e) {
			encerrarLeitura();
			setMensagemErro(mensagemErroCameraParaUtilizador(e));
			setEstado("erro");
		}
	}, [encerrarLeitura]);

	const validarManual = useCallback(() => {
		const t = textoManual.trim();
		if (!t) {
			toast.error("Cole ou digite o código ou link antes de validar.");
			return;
		}
		onPayloadRef.current(t);
		setTextoManual("");
	}, [textoManual]);

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		encerrarLeitura();
		setModo("camera");
		setTextoManual("");
		setEstado("idle");
		setMensagemErro(null);
	}, [resetKey, encerrarLeitura]);

	useEffect(() => {
		if (!ativo) {
			encerrarLeitura();
			setEstado("idle");
			setMensagemErro(null);
			setTextoManual("");
			setModo("camera");
		}
	}, [ativo, encerrarLeitura]);

	useEffect(() => {
		if (!ativo || modo !== "camera") {
			if (modo !== "camera") encerrarLeitura();
			return;
		}
		void iniciarLeitura();
		return () => {
			encerrarLeitura();
		};
	}, [ativo, modo, encerrarLeitura, iniciarLeitura]);
	/* eslint-enable react-hooks/set-state-in-effect */

	return (
		<>
			<div className='grid grid-cols-2 gap-1 rounded-lg border bg-muted/30 p-1 mb-4'>
				<button
					type='button'
					onClick={() => setModo("camera")}
					className={cn(
						"flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
						modo === "camera"
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground"
					)}>
					<Camera className='h-4 w-4 shrink-0' aria-hidden />
					Câmera
				</button>
				<button
					type='button'
					onClick={() => setModo("manual")}
					className={cn(
						"flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
						modo === "manual"
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground"
					)}>
					<Keyboard className='h-4 w-4 shrink-0' aria-hidden />
					Código manual
				</button>
			</div>

			{modo === "camera" ? (
				<div className='space-y-3'>
					<div className='relative aspect-video w-full overflow-hidden rounded-md bg-black'>
						<video ref={videoRef} className='h-full w-full object-cover' muted playsInline />
						{estado === "pedindo" ? (
							<p className='absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white'>
								A aguardar código…
							</p>
						) : null}
					</div>
					{estado === "erro" && mensagemErro ? (
						<div className='flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
							<AlertCircle className='h-4 w-4 shrink-0' aria-hidden />
							<span>{mensagemErro}</span>
						</div>
					) : null}
				</div>
			) : (
				<div className='grid gap-2'>
					<Label htmlFor='qr-manual-fluxo'>Código ou link</Label>
					<Textarea
						id='qr-manual-fluxo'
						value={textoManual}
						onChange={(e) => setTextoManual(e.target.value)}
						placeholder='Cole aqui o texto partilhado (token ou URL completa)…'
						rows={4}
						className='resize-y min-h-[6rem] font-mono text-sm'
						autoComplete='off'
					/>
					<p className='text-xs text-muted-foreground'>
						O mesmo conteúdo que apareceria ao ler o QR Code em imagem.
					</p>
				</div>
			)}

			<div className='flex flex-col gap-2 sm:flex-row sm:justify-end mt-4'>
				{modo === "camera" && estado === "erro" ? (
					<Button type='button' className='w-full sm:w-auto' onClick={() => void iniciarLeitura()}>
						Tentar câmera novamente
					</Button>
				) : null}
				{modo === "manual" ? (
					<Button type='button' className='w-full sm:w-auto' onClick={() => void validarManual()}>
						Validar código
					</Button>
				) : null}
				<Button type='button' variant='outline' className='w-full sm:w-auto' onClick={onCancelar}>
					Cancelar
				</Button>
			</div>
		</>
	);
}
