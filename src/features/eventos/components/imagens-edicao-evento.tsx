import { Button } from "@/components/base/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/base/card";
import { ModalVisualizadorAnexo } from "@/components/base/modal-visualizador-anexo";
import {
	formatarTamanhoArquivo,
	UploadArquivos,
	type AnexoEmUpload,
} from "@/components/base/upload-arquivos";
import {
	MAX_IMAGENS_EVENTO,
	MIN_IMAGENS_EVENTO,
	TAMANHO_MAX_IMAGEM_EVENTO_BYTES,
} from "@/features/eventos/constants/imagens-evento";
import { imagemDtoParaDataUrl, tipoMimeImagemPorNome } from "@/features/eventos/lib/imagem-evento";
import { moverImagemExistenteNaLista } from "@/features/eventos/lib/reordenar-lista-imagens";
import type { EventoImagemDto } from "@/features/eventos/types";
import type { ArquivoAnexo } from "@/lib/download-anexo";
import { ChevronDown, ChevronUp, Eye, ImageOff, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

function mapImagemParaAnexoVisual(im: EventoImagemDto): ArquivoAnexo {
	const b64 = im.conteudoBase64Preview ?? im.conteudoBase64;
	return {
		id: im.cdEventosImagens,
		nome: im.nomeArquivo,
		tipoMime: tipoMimeImagemPorNome(im.nomeArquivo),
		conteudoBase64: b64,
	};
}

type Props = {
	existentes: EventoImagemDto[];
	idsMarcadosRemocao: Set<string>;
	onAlternarRemocao: (cdEventosImagens: string) => void;
	onReordenarExistentes: (lista: EventoImagemDto[]) => void;
	novos: AnexoEmUpload[];
	onNovosChange: (lista: AnexoEmUpload[]) => void;
};

export function ImagensEdicaoEvento({
	existentes,
	idsMarcadosRemocao,
	onAlternarRemocao,
	onReordenarExistentes,
	novos,
	onNovosChange,
}: Props) {
	const [anexoVisual, setAnexoVisual] = useState<ArquivoAnexo | null>(null);
	const [modalVisual, setModalVisual] = useState(false);

	const visiveis = useMemo(
		() => existentes.filter((im) => !idsMarcadosRemocao.has(im.cdEventosImagens)),
		[existentes, idsMarcadosRemocao]
	);
	const totalAposAlteracoes = visiveis.length + novos.length;
	const maxNovosPermitidos = Math.max(0, MAX_IMAGENS_EVENTO - visiveis.length);

	/** O mínimo de imagens é validado ao salvar; aqui permite substituir tudo (remover e depois anexar novos). */
	const podeMarcarRemocao = (_cd: string) => true;

	const ativosOrdenados = useMemo(
		() => existentes.filter((im) => !idsMarcadosRemocao.has(im.cdEventosImagens)),
		[existentes, idsMarcadosRemocao]
	);

	const moverExistente = (cd: string, delta: -1 | 1) => {
		onReordenarExistentes(moverImagemExistenteNaLista(existentes, idsMarcadosRemocao, cd, delta));
	};

	return (
		<Card className='w-full'>
			<CardHeader>
				<CardTitle>Imagens do evento</CardTitle>
				<CardDescription>
					Mínimo {MIN_IMAGENS_EVENTO} e máximo {MAX_IMAGENS_EVENTO} imagens ({formatarTamanhoArquivo(TAMANHO_MAX_IMAGEM_EVENTO_BYTES)} cada). Remova
					com o ícone. As novas imagens ficam só no navegador até clicar em <span className='font-medium text-foreground'>Salvar alterações</span> — aí o
					evento é atualizado e os arquivos são enviados ao servidor.
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-6'>
				{existentes.length > 0 ? (
					<div className='space-y-2'>
						<p className='text-sm font-medium'>Imagens cadastradas</p>
						<ul className='space-y-2'>
							{existentes.map((im) => {
								const removida = idsMarcadosRemocao.has(im.cdEventosImagens);
								const url = imagemDtoParaDataUrl(im);
								const podeRemover = podeMarcarRemocao(im.cdEventosImagens);
								const idxAtivo = ativosOrdenados.findIndex((x) => x.cdEventosImagens === im.cdEventosImagens);
								const podeSubir = !removida && idxAtivo > 0;
								const podeDescer = !removida && idxAtivo >= 0 && idxAtivo < ativosOrdenados.length - 1;
								const podeVer = Boolean(url) && !removida;
								return (
									<li
										key={im.cdEventosImagens}
										className='flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 text-sm'>
										<span className='flex min-w-0 flex-1 items-center gap-3'>
											{url && !removida ? (
												<img
													src={url}
													alt=''
													className='h-12 w-12 shrink-0 rounded-md border object-cover'
												/>
											) : removida ? (
												<span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted'>
													<ImageOff className='h-5 w-5 text-muted-foreground' aria-hidden />
												</span>
											) : null}
											<span className={`min-w-0 truncate ${removida ? "text-muted-foreground line-through" : "font-medium"}`}>
												{im.nomeArquivo}
												{im.imagemPrincipal ? " · principal" : ""}
											</span>
										</span>
										<div className='flex shrink-0 items-center gap-1'>
											<Button
												type='button'
												variant='outline'
												size='icon'
												className='h-8 w-8'
												disabled={!podeSubir}
												aria-label={`Mover ${im.nomeArquivo} para cima`}
												onClick={() => moverExistente(im.cdEventosImagens, -1)}>
												<ChevronUp className='h-4 w-4' />
											</Button>
											<Button
												type='button'
												variant='outline'
												size='icon'
												className='h-8 w-8'
												disabled={!podeDescer}
												aria-label={`Mover ${im.nomeArquivo} para baixo`}
												onClick={() => moverExistente(im.cdEventosImagens, 1)}>
												<ChevronDown className='h-4 w-4' />
											</Button>
											<Button
												type='button'
												variant='outline'
												size='icon'
												className='h-8 w-8'
												disabled={!podeVer}
												aria-label={`Visualizar ${im.nomeArquivo}`}
												onClick={() => {
													setAnexoVisual(mapImagemParaAnexoVisual(im));
													setModalVisual(true);
												}}>
												<Eye className='h-4 w-4' />
											</Button>
											<Button
												type='button'
												variant='outline'
												size='icon'
												className='h-8 w-8 border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive'
												disabled={!removida && !podeRemover}
												aria-label={removida ? `Restaurar ${im.nomeArquivo}` : `Marcar remoção de ${im.nomeArquivo}`}
												onClick={() => onAlternarRemocao(im.cdEventosImagens)}>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</li>
								);
							})}
						</ul>
						<p className='text-xs text-muted-foreground'>
							Ativas após salvar: {totalAposAlteracoes} de no máximo {MAX_IMAGENS_EVENTO}
						</p>
					</div>
				) : null}

				<div className='space-y-2'>
					<p className='text-sm font-medium'>Adicionar imagens</p>
					<UploadArquivos
						anexos={novos}
						onAnexosChange={onNovosChange}
						multiplo
						apenasImagens
						maxArquivos={maxNovosPermitidos}
						tamanhoMaximoBytes={TAMANHO_MAX_IMAGEM_EVENTO_BYTES}
						tituloDestaque='Novas imagens'
						descricaoArraste='Arraste arquivos ou clique para selecionar'
						textoAuxiliar={`Até ${maxNovosPermitidos} nova(s) neste momento · máx. ${formatarTamanhoArquivo(TAMANHO_MAX_IMAGEM_EVENTO_BYTES)} cada`}
						textoBotao='Selecionar arquivos'
					/>
				</div>
			</CardContent>

			<ModalVisualizadorAnexo
				aberto={modalVisual}
				onAbertoChange={setModalVisual}
				anexo={anexoVisual}
				titulo='Visualizar imagem'
			/>
		</Card>
	);
}
