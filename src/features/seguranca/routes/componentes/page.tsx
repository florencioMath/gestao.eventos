import { Button } from '@/components/base/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/base/card';
import {
	ENDERECO_VAZIO_PADRAO,
	FormularioEndereco,
	type ValorFormularioEndereco,
} from '@/components/base/formulario-endereco';
import { DialogoHistorico } from '@/components/base/dialogo-historico';
import { DialogoUploadAnexo } from '@/components/base/dialogo-upload-anexo';
import { ListaAnexos } from '@/components/base/lista-anexos';
import { ModalVisualizadorAnexo } from '@/components/base/modal-visualizador-anexo';
import { StatusBadgeVeiculoRemovido } from '@/components/base/status-badge-veiculo-removido';
import { UploadArquivos, type AnexoEmUpload } from '@/components/base/upload-arquivos';
import type { ArquivoAnexo } from '@/lib/download-anexo';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const CAMINHO_HISTORICO_EXEMPLO = '/seguranca/exemplos/historico';

const CHAVES_STATUS_DEMO = [
	'AGUARDANDO_REVISAO_DEPARTAMENTO',
	'AGUARDANDO_REVISAO_PATIO',
	'NO_PATIO',
	'RETIRADO',
	'RECUSADO_DEPARTAMENTO',
	'DEVOLVIDO_PATIO',
	'PENDENTE',
	'APROVADO',
	'CONCLUIDO',
	'PRAZO_ENCERRADO',
	'REPROVADO',
] as const;

/** PNG 1×1 transparente em base64 (só para demonstração). */
const PNG_MINIMO_BASE64 =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export function ComponentesSegurancaPage() {
	const [endereco, setEndereco] = useState<ValorFormularioEndereco>({ ...ENDERECO_VAZIO_PADRAO });
	const [statusGps, setStatusGps] = useState('');
	const [uploads, setUploads] = useState<AnexoEmUpload[]>([]);
	const [dialogoUploadAberto, setDialogoUploadAberto] = useState(false);
	const [historicoAberto, setHistoricoAberto] = useState(false);

	const [anexoVisualizar, setAnexoVisualizar] = useState<ArquivoAnexo | null>(null);
	const [modalAnexoAberto, setModalAnexoAberto] = useState(false);

	const anexosExemplo = useMemo<ArquivoAnexo[]>(
		() => [
			{
				id: 'ex-img',
				nome: 'pixel-demo.png',
				tipoMime: 'image/png',
				tamanhoBytes: 70,
				conteudoBase64: PNG_MINIMO_BASE64,
			},
			{
				id: 'ex-url',
				nome: 'logo-ici.png',
				tipoMime: 'image/png',
				tamanhoBytes: undefined,
				url: `${typeof window !== 'undefined' ? window.location.origin : ''}/logo-ici.png`,
			},
		],
		[]
	);

	const patchEndereco = (patch: Partial<ValorFormularioEndereco>) => {
		setEndereco((prev) => ({ ...prev, ...patch }));
	};

	return (
		<div className='space-y-8 max-w-4xl'>
			<div>
				<h1 className='text-2xl font-bold'>Componentes base</h1>
				<p className='text-sm text-muted-foreground mt-1'>
					Exemplos dos blocos reutilizáveis. Com <code className='text-xs'>VITE_MOCK_API=true</code>, a
					busca de endereço usa respostas fictícias.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>FormularioEndereco</CardTitle>
					<CardDescription>
						CEP e logradouro com autocomplete (API), modal &quot;Não sei o CEP&quot;, GPS e
						campos de bairro/número/município/UF. Filtro geográfico opcional:{' '}
						<code className='text-xs'>VITE_ENDERECO_CIDADE_FILTRO</code> +{' '}
						<code className='text-xs'>VITE_ENDERECO_UF_FILTRO</code>. Abaixo, contexto da busca por
						logradouro só para o mock (qualquer município serve no backend real).
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<FormularioEndereco
						value={endereco}
						onChange={patchEndereco}
						statusGps={statusGps}
						onStatusGpsChange={setStatusGps}
						cidadeBuscaLogradouro='São Paulo'
						ufBuscaLogradouro='SP'
					/>
					<p className='text-xs text-muted-foreground font-mono break-all'>
						{JSON.stringify(endereco)}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>StatusBadgeVeiculoRemovido</CardTitle>
					<CardDescription>
						Rótulos e cores a partir de <code className='text-xs'>veiculo-removido-status</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='flex flex-wrap gap-2'>
						{CHAVES_STATUS_DEMO.map((chave) => (
							<StatusBadgeVeiculoRemovido key={chave} status={chave} />
						))}
						<StatusBadgeVeiculoRemovido />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>UploadArquivos</CardTitle>
					<CardDescription>Lista local com remoção; arraste arquivos ou use o botão.</CardDescription>
				</CardHeader>
				<CardContent>
					<UploadArquivos anexos={uploads} onAnexosChange={setUploads} multiplo />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>DialogoUploadAnexo</CardTitle>
					<CardDescription>Diálogo pronto com upload e confirmação.</CardDescription>
				</CardHeader>
				<CardContent>
					<Button type='button' onClick={() => setDialogoUploadAberto(true)}>
						Abrir diálogo de upload
					</Button>
					<DialogoUploadAnexo
						aberto={dialogoUploadAberto}
						onAbertoChange={setDialogoUploadAberto}
						titulo='Enviar anexos (demo)'
						descricao='Os arquivos não são enviados a lugar nenhum nesta demonstração.'
						onConfirmar={async (arquivos) => {
							toast.success(`${arquivos.length} arquivo(s) selecionado(s).`);
						}}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>ListaAnexos + ModalVisualizadorAnexo</CardTitle>
					<CardDescription>
						Lista com ações; o ícone de olho abre o modal (imagem PNG em base64 e SVG por
						URL).
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ListaAnexos
						anexos={anexosExemplo}
						onVisualizar={(a) => {
							setAnexoVisualizar(a);
							setModalAnexoAberto(true);
						}}
					/>
					<ModalVisualizadorAnexo
						aberto={modalAnexoAberto}
						onAbertoChange={setModalAnexoAberto}
						anexo={anexoVisualizar}
						titulo='Visualizar anexo (demo)'
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>DialogoHistorico</CardTitle>
					<CardDescription>
						Carrega via <code className='text-xs'>HistoricoService.listar</code> (array no formato
						do backend: usuário, ação, data, visível ao solicitante). Com{' '}
						<code className='text-xs'>VITE_MOCK_API=true</code>,{' '}
						<code className='text-xs'>{CAMINHO_HISTORICO_EXEMPLO}</code> retorna exemplos.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button type='button' variant='outline' onClick={() => setHistoricoAberto(true)}>
						Abrir histórico de exemplo
					</Button>
					<DialogoHistorico
						aberto={historicoAberto}
						onAbertoChange={setHistoricoAberto}
						titulo='Histórico (demo)'
						caminhoApi={CAMINHO_HISTORICO_EXEMPLO}
						referencia='PROT-MOCK-001'
					/>
				</CardContent>
			</Card>
		</div>
	);
}
