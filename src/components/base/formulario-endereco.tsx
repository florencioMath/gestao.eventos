/**
 * Formulário de endereço: CEP (API), logradouro (API), bairro, número,
 * GPS, município/UF e modal “Não sei o CEP”.
 *
 * Filtro geográfico **opcional** (`VITE_ENDERECO_CIDADE_FILTRO` + `VITE_ENDERECO_UF_FILTRO`).
 * Sem essas variáveis, qualquer município retornado pela API ou pelo GPS é aceito.
 *
 * Contexto da busca por logradouro: props, depois `VITE_ENDERECO_CIDADE_BUSCA` / `VITE_ENDERECO_UF_BUSCA`,
 * depois `VITE_ENDERECO_CIDADE_PADRAO_FORM` / `VITE_ENDERECO_UF_PADRAO_FORM`, e por último município/UF já
 * preenchidos no formulário. Sem cidade e UF para o contexto, a busca por logradouro não é disparada.
 */
import { Button } from '@/components/base/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/base/dialog';
import { Input } from '@/components/base/input';
import { Label } from '@/components/base/label';
import {
	EnderecoService,
	enderecoDentroDoFiltroGeografico,
	formatarLinhaOpcaoEndereco,
	obterFiltroGeograficoAtivo,
	type EnderecoApiDto,
} from '@/lib/endereco-service';
import { Loader2, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const ITENS_POR_PAGINA = 5;
const DEBOUNCE_CEP_MS = 400;
const DEBOUNCE_LOG_MS = 350;

function textoForaDaAreaPermitida(): string {
	const f = obterFiltroGeograficoAtivo();
	return f ? `Endereço não é de ${f.cidade}/${f.uf}.` : 'Endereço fora da área permitida.';
}

function applyCepMask(value: string): string {
	return value
		.replace(/\D/g, '')
		.slice(0, 8)
		.replace(/(\d{5})(\d)/, '$1-$2');
}

function dtoParaPatch(d: EnderecoApiDto): Partial<ValorFormularioEndereco> {
	const digits = (d.zipcode || '').replace(/\D/g, '');
	return {
		cep: digits.length === 8 ? applyCepMask(digits) : '',
		logradouro: (d.street || '').toUpperCase(),
		bairro: (d.neighborhood || '').toUpperCase(),
		cidade: d.city || '',
		uf: d.state || '',
		latitude: d.lat || '',
		longitude: d.longitude || '',
	};
}

export type ValorFormularioEndereco = {
	cep: string;
	logradouro: string;
	numero: string;
	bairro: string;
	cidade: string;
	uf: string;
	latitude: string;
	longitude: string;
};

/** Valores iniciais vazios (sem município/UF imposto). */
export const ENDERECO_VAZIO_PADRAO: ValorFormularioEndereco = {
	cep: '',
	logradouro: '',
	numero: '',
	bairro: '',
	cidade: '',
	uf: '',
	latitude: '',
	longitude: '',
};

type FormularioEnderecoProps = {
	value: ValorFormularioEndereco;
	onChange: (patch: Partial<ValorFormularioEndereco>) => void;
	statusGps: string;
	onStatusGpsChange: (v: string) => void;
	/** Cidade usada na API de busca por logradouro (não altera o valor do formulário). */
	cidadeBuscaLogradouro?: string;
	/** UF usada na API de busca por logradouro. */
	ufBuscaLogradouro?: string;
	/** Título do bloco (padrão: "Endereço"). */
	tituloBloco?: string;
	/** Rótulo do campo principal de logradouro (padrão: "Logradouro"). */
	labelLogradouro?: string;
};

export function FormularioEndereco({
	value,
	onChange,
	statusGps,
	onStatusGpsChange,
	cidadeBuscaLogradouro,
	ufBuscaLogradouro,
	tituloBloco = 'Endereço',
	labelLogradouro = 'Logradouro',
}: FormularioEnderecoProps) {
	const cidadeBuscaLogradouroEfetiva =
		cidadeBuscaLogradouro?.trim() ||
		import.meta.env.VITE_ENDERECO_CIDADE_BUSCA?.trim() ||
		import.meta.env.VITE_ENDERECO_CIDADE_PADRAO_FORM?.trim() ||
		value.cidade.trim();
	const ufBuscaLogradouroEfetiva =
		ufBuscaLogradouro?.trim() ||
		import.meta.env.VITE_ENDERECO_UF_BUSCA?.trim() ||
		import.meta.env.VITE_ENDERECO_UF_PADRAO_FORM?.trim() ||
		value.uf.trim();
	const cepBoxRef = useRef<HTMLDivElement>(null);
	const logBoxRef = useRef<HTMLDivElement>(null);

	const suppressCepListaRef = useRef(false);
	const suppressLogradouroListaRef = useRef(false);

	const ultimoCepBuscadoOk = useRef<string>('');
	const buscaCepSeq = useRef(0);
	const buscaLogradouroSeq = useRef(0);
	/** Só busca/mostra sugestões de CEP após o usuário digitar no campo (não ao hidratar do back). */
	const cepBuscaPorDigitacaoAtivaRef = useRef(false);
	/** Idem para o campo de logradouro. */
	const logBuscaPorDigitacaoAtivaRef = useRef(false);

	const [cepOpcoes, setCepOpcoes] = useState<EnderecoApiDto[]>([]);
	const [cepBuscando, setCepBuscando] = useState(false);
	const [cepListaAberta, setCepListaAberta] = useState(false);

	const [logradouroOpcoes, setLogradouroOpcoes] = useState<EnderecoApiDto[]>([]);
	const [logradouroBuscando, setLogradouroBuscando] = useState(false);
	const [logradouroListaAberta, setLogradouroListaAberta] = useState(false);

	const [dialogCepAberto, setDialogCepAberto] = useState(false);
	const [dialogEndereco, setDialogEndereco] = useState('');
	const [buscandoEndereco, setBuscandoEndereco] = useState(false);
	const [resultadosDialog, setResultadosDialog] = useState<EnderecoApiDto[]>([]);
	const [paginaEndereco, setPaginaEndereco] = useState(0);
	const [dialogSemResultados, setDialogSemResultados] = useState(false);

	const [buscandoGps, setBuscandoGps] = useState(false);

	const fecharListas = useCallback(() => {
		setCepListaAberta(false);
		setLogradouroListaAberta(false);
	}, []);

	const resetarEstadoBusca = useCallback(() => {
		buscaCepSeq.current += 1;
		buscaLogradouroSeq.current += 1;
		ultimoCepBuscadoOk.current = '';
		suppressCepListaRef.current = false;
		suppressLogradouroListaRef.current = false;
		cepBuscaPorDigitacaoAtivaRef.current = false;
		logBuscaPorDigitacaoAtivaRef.current = false;
		setCepOpcoes([]);
		setLogradouroOpcoes([]);
		setCepListaAberta(false);
		setLogradouroListaAberta(false);
		setCepBuscando(false);
		setLogradouroBuscando(false);
	}, []);

	const limparEnderecoCompleto = useCallback(() => {
		resetarEstadoBusca();
		onStatusGpsChange('');
		onChange({ ...ENDERECO_VAZIO_PADRAO });
	}, [onChange, onStatusGpsChange, resetarEstadoBusca]);

	useEffect(() => {
		const onDocMouseDown = (e: MouseEvent) => {
			const t = e.target as Node;
			if (cepBoxRef.current?.contains(t) || logBoxRef.current?.contains(t)) return;
			fecharListas();
		};
		document.addEventListener('mousedown', onDocMouseDown);
		return () => document.removeEventListener('mousedown', onDocMouseDown);
	}, [fecharListas]);

	const cepDigits = value.cep.replace(/\D/g, '');

	useEffect(() => {
		if (cepDigits.length !== 8) {
			setCepOpcoes([]);
			setCepListaAberta(false);
			ultimoCepBuscadoOk.current = '';
			return;
		}

		if (!cepBuscaPorDigitacaoAtivaRef.current) {
			setCepOpcoes([]);
			setCepListaAberta(false);
			return;
		}

		if (cepDigits === ultimoCepBuscadoOk.current) {
			suppressCepListaRef.current = false;
			return;
		}

		let cancelled = false;
		const seq = ++buscaCepSeq.current;
		const t = window.setTimeout(async () => {
			setCepBuscando(true);
			try {
				const data = await EnderecoService.buscarPorCepDetalhado(cepDigits);
				if (cancelled || seq !== buscaCepSeq.current) return;
				ultimoCepBuscadoOk.current = cepDigits;
				setCepOpcoes([data]);
				if (suppressCepListaRef.current) {
					suppressCepListaRef.current = false;
					setCepListaAberta(false);
				} else {
					setCepListaAberta(true);
				}
			} catch (err) {
				if (cancelled || seq !== buscaCepSeq.current) return;
				ultimoCepBuscadoOk.current = '';
				setCepOpcoes([]);
				setCepListaAberta(false);
				if (suppressCepListaRef.current) suppressCepListaRef.current = false;
				const msg = err instanceof Error ? err.message : 'CEP não encontrado';
				toast.error(msg);
				onChange({ cep: '' });
			} finally {
				if (!cancelled && seq === buscaCepSeq.current) setCepBuscando(false);
			}
		}, DEBOUNCE_CEP_MS);

		return () => {
			cancelled = true;
			clearTimeout(t);
		};
	}, [cepDigits, onChange]);

	const textoLogradouro = value.logradouro.trim();

	useEffect(() => {
		if (textoLogradouro.length < 3) {
			setLogradouroOpcoes([]);
			setLogradouroListaAberta(false);
			return;
		}

		if (!cidadeBuscaLogradouroEfetiva || !ufBuscaLogradouroEfetiva) {
			setLogradouroOpcoes([]);
			setLogradouroListaAberta(false);
			return;
		}

		if (!logBuscaPorDigitacaoAtivaRef.current) {
			setLogradouroOpcoes([]);
			setLogradouroListaAberta(false);
			return;
		}

		let cancelled = false;
		const seq = ++buscaLogradouroSeq.current;
		const t = window.setTimeout(async () => {
			setLogradouroBuscando(true);
			if (!suppressLogradouroListaRef.current) setLogradouroListaAberta(true);
			try {
				const list = await EnderecoService.buscarPorLogradouro(
					textoLogradouro,
					cidadeBuscaLogradouroEfetiva,
					ufBuscaLogradouroEfetiva
				);
				if (cancelled || seq !== buscaLogradouroSeq.current) return;
				setLogradouroOpcoes(list);
				if (suppressLogradouroListaRef.current) {
					suppressLogradouroListaRef.current = false;
					setLogradouroListaAberta(false);
				} else {
					setLogradouroListaAberta(true);
				}
			} catch {
				if (!cancelled && seq === buscaLogradouroSeq.current) {
					setLogradouroOpcoes([]);
					setLogradouroListaAberta(false);
					if (suppressLogradouroListaRef.current) suppressLogradouroListaRef.current = false;
					toast.error('Erro ao buscar endereço');
				}
			} finally {
				if (!cancelled && seq === buscaLogradouroSeq.current) setLogradouroBuscando(false);
			}
		}, DEBOUNCE_LOG_MS);

		return () => {
			cancelled = true;
			clearTimeout(t);
		};
	}, [textoLogradouro, cidadeBuscaLogradouroEfetiva, ufBuscaLogradouroEfetiva]);

	const aplicarPorCep = (d: EnderecoApiDto) => {
		if (!enderecoDentroDoFiltroGeografico(d.city, d.state)) {
			toast.error(textoForaDaAreaPermitida());
			return;
		}
		cepBuscaPorDigitacaoAtivaRef.current = false;
		logBuscaPorDigitacaoAtivaRef.current = false;
		suppressLogradouroListaRef.current = true;
		setLogradouroOpcoes([]);
		fecharListas();
		onChange({ ...dtoParaPatch(d), numero: value.numero });
		setCepListaAberta(false);
	};

	const aplicarPorLogradouro = (d: EnderecoApiDto) => {
		if (!enderecoDentroDoFiltroGeografico(d.city, d.state)) {
			toast.error(textoForaDaAreaPermitida());
			return;
		}
		cepBuscaPorDigitacaoAtivaRef.current = false;
		logBuscaPorDigitacaoAtivaRef.current = false;
		suppressCepListaRef.current = true;
		setCepOpcoes([]);
		fecharListas();
		const digits = (d.zipcode || '').replace(/\D/g, '');
		if (digits.length === 8) ultimoCepBuscadoOk.current = digits;
		onChange({ ...dtoParaPatch(d), numero: value.numero });
		setLogradouroListaAberta(false);
	};

	const handleLocalizar = () => {
		if (!navigator.geolocation) {
			toast.error('GPS não suportado neste dispositivo.');
			return;
		}
		setBuscandoGps(true);
		onStatusGpsChange('Localizando...');
		suppressCepListaRef.current = true;
		suppressLogradouroListaRef.current = true;
		cepBuscaPorDigitacaoAtivaRef.current = false;
		logBuscaPorDigitacaoAtivaRef.current = false;
		fecharListas();
		setCepOpcoes([]);
		setLogradouroOpcoes([]);

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude: lat, longitude: lon } = position.coords;
				try {
					const res = await fetch(
						`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
					);
					const data = (await res.json()) as {
						address?: Record<string, string>;
					};
					const a = data.address || {};
					const cidadeRev = (
						a.city ||
						a.town ||
						a.village ||
						''
					).trim();
					const ufRev = (a['ISO3166-2-lvl4'] || '').replace('BR-', '').trim();

					const filtro = obterFiltroGeograficoAtivo();
					if (filtro && !enderecoDentroDoFiltroGeografico(cidadeRev, ufRev)) {
						onChange({ latitude: String(lat), longitude: String(lon) });
						ultimoCepBuscadoOk.current = '';
						onStatusGpsChange(`Localização fora de ${filtro.cidade}/${filtro.uf}.`);
						toast.error(textoForaDaAreaPermitida());
					} else {
						let cepMascara = '';
						const rawCep = (a.postcode || '').replace(/\D/g, '');
						if (rawCep.length === 8) {
							try {
								await EnderecoService.buscarPorCepDetalhado(rawCep);
								cepMascara = applyCepMask(rawCep);
							} catch {
								toast.error('CEP não encontrado ou fora da área permitida.');
							}
						}
						onChange({
							latitude: String(lat),
							longitude: String(lon),
							cep: cepMascara,
							logradouro: (a.road || '').toUpperCase(),
							numero: String(a.house_number ?? ''),
							bairro: (a.suburb || a.neighbourhood || '').toUpperCase(),
							cidade: cidadeRev,
							uf: ufRev,
						});
						const okDigits = cepMascara.replace(/\D/g, '');
						ultimoCepBuscadoOk.current = okDigits.length === 8 ? okDigits : '';
						onStatusGpsChange('✓ Endereço atualizado!');
					}
				} catch {
					onChange({ latitude: String(lat), longitude: String(lon) });
					onStatusGpsChange('GPS localizado, mas não foi possível obter o endereço.');
				} finally {
					setBuscandoGps(false);
					suppressCepListaRef.current = false;
					suppressLogradouroListaRef.current = false;
				}
			},
			() => {
				toast.error('Erro ao obter GPS. Verifique se a localização está ativa.');
				setBuscandoGps(false);
				onStatusGpsChange('');
				suppressCepListaRef.current = false;
				suppressLogradouroListaRef.current = false;
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	};

	const buscarEnderecoDialog = async () => {
		if (dialogEndereco.trim().length < 3) {
			toast.error('Informe ao menos 3 caracteres do endereço');
			return;
		}
		if (!cidadeBuscaLogradouroEfetiva || !ufBuscaLogradouroEfetiva) {
			toast.error(
				'Preencha município e UF no formulário ou defina VITE_ENDERECO_CIDADE_BUSCA e VITE_ENDERECO_UF_BUSCA.'
			);
			return;
		}
		setBuscandoEndereco(true);
		setDialogSemResultados(false);
		setResultadosDialog([]);
		setPaginaEndereco(0);
		try {
			const results = await EnderecoService.buscarPorLogradouro(
				dialogEndereco.trim(),
				cidadeBuscaLogradouroEfetiva,
				ufBuscaLogradouroEfetiva
			);
			setResultadosDialog(results);
			setDialogSemResultados(results.length === 0);
		} catch {
			setDialogSemResultados(false);
			toast.error('Erro ao buscar endereço');
		} finally {
			setBuscandoEndereco(false);
		}
	};

	const selecionarEnderecoDialog = (d: EnderecoApiDto) => {
		if (!enderecoDentroDoFiltroGeografico(d.city, d.state)) {
			toast.error(textoForaDaAreaPermitida());
			return;
		}
		cepBuscaPorDigitacaoAtivaRef.current = false;
		logBuscaPorDigitacaoAtivaRef.current = false;
		suppressCepListaRef.current = true;
		suppressLogradouroListaRef.current = true;
		setCepOpcoes([]);
		setLogradouroOpcoes([]);
		const digits = (d.zipcode || '').replace(/\D/g, '');
		if (digits.length === 8) ultimoCepBuscadoOk.current = digits;
		onChange({ ...dtoParaPatch(d), numero: value.numero });
		fecharDialogCep();
	};

	const fecharDialogCep = () => {
		setDialogCepAberto(false);
		setResultadosDialog([]);
		setPaginaEndereco(0);
		setDialogEndereco('');
		setDialogSemResultados(false);
	};

	const totalPaginas = Math.ceil(resultadosDialog.length / ITENS_POR_PAGINA);
	const resultadosPaginados = resultadosDialog.slice(
		paginaEndereco * ITENS_POR_PAGINA,
		(paginaEndereco + 1) * ITENS_POR_PAGINA
	);

	return (
		<div className='space-y-1.5'>
			<div className='flex items-center justify-between'>
				<Label required>{tituloBloco}</Label>
				<button
					type='button'
					onClick={() => {
						setDialogSemResultados(false);
						setDialogCepAberto(true);
					}}
					className='flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer'>
					<Search className='h-3.5 w-3.5' />
					Não sei o CEP
				</button>
			</div>

			<input type='hidden' name='latitude' value={value.latitude} readOnly />
			<input type='hidden' name='longitude' value={value.longitude} readOnly />

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<div className='space-y-1.5 relative' ref={cepBoxRef}>
					<Label>CEP</Label>
					<div className='relative'>
						<Input
							value={value.cep}
							onChange={(e) => {
								const masked = applyCepMask(e.target.value);
								const digits = masked.replace(/\D/g, '');
								if (digits.length === 0) {
									limparEnderecoCompleto();
									return;
								}
								cepBuscaPorDigitacaoAtivaRef.current = true;
								onChange({ cep: masked });
								ultimoCepBuscadoOk.current = '';
								setCepOpcoes([]);
								setCepListaAberta(false);
							}}
							onFocus={() => {
								if (cepOpcoes.length > 0 && cepDigits.length === 8)
									setCepListaAberta(true);
							}}
							onKeyDown={(e) => {
								if (e.key === 'Escape') fecharListas();
							}}
							placeholder='00000-000'
							inputMode='numeric'
							autoComplete='postal-code'
						/>
						{cepBuscando && (
							<Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground' />
						)}
					</div>
					{cepListaAberta && cepOpcoes.length > 0 && (
						<div className='absolute z-20 left-0 right-0 mt-1 border rounded-md bg-popover shadow-md max-h-48 overflow-y-auto'>
							{cepOpcoes.map((d) => (
								<button
									key={d.id}
									type='button'
									onClick={() => aplicarPorCep(d)}
									className='w-full text-left px-3 py-2.5 hover:bg-muted/80 text-sm cursor-pointer'>
									{formatarLinhaOpcaoEndereco(d)}
								</button>
							))}
						</div>
					)}
				</div>

				<div className='space-y-1.5 md:col-span-2 relative' ref={logBoxRef}>
					<Label required>{labelLogradouro}</Label>
					<div className='relative'>
						<Input
							value={value.logradouro}
							onChange={(e) => {
								const u = e.target.value.toUpperCase();
								if (u.trim() === '') {
									limparEnderecoCompleto();
									return;
								}
								logBuscaPorDigitacaoAtivaRef.current = true;
								onChange({ logradouro: u });
							}}
							onFocus={() => {
								if (textoLogradouro.length >= 3) setLogradouroListaAberta(true);
							}}
							onKeyDown={(e) => {
								if (e.key === 'Escape') fecharListas();
							}}
							placeholder='Rua/Avenida — busca ao digitar'
							className='flex-1'
						/>
						{logradouroBuscando && (
							<Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground' />
						)}
					</div>
					{logradouroListaAberta && logradouroOpcoes.length > 0 && (
						<div className='absolute z-20 left-0 right-0 mt-1 border rounded-md bg-popover shadow-md max-h-56 overflow-y-auto'>
							{logradouroOpcoes.map((d, i) => (
								<button
									key={`${d.id}-${i}`}
									type='button'
									onClick={() => aplicarPorLogradouro(d)}
									className='w-full text-left px-3 py-2.5 hover:bg-muted/80 text-sm cursor-pointer border-b border-border/50 last:border-0'>
									{formatarLinhaOpcaoEndereco(d)}
								</button>
							))}
						</div>
					)}
					{statusGps && (
						<p className='text-xs text-primary font-semibold'>{statusGps}</p>
					)}
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<div className='space-y-1.5'>
					<Label>Bairro</Label>
					<Input
						value={value.bairro}
						onChange={(e) => onChange({ bairro: e.target.value.toUpperCase() })}
						placeholder='Bairro'
					/>
				</div>
				<div className='space-y-1.5'>
					<Label>Número</Label>
					<Input
						value={value.numero}
						onChange={(e) => onChange({ numero: e.target.value })}
						placeholder='Nº'
					/>
				</div>

				<div className='space-y-1.5 md:mt-6'>
					<Button
						type='button'
						variant='outline'
						onClick={handleLocalizar}
						disabled={buscandoGps}>
						{buscandoGps ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<MapPin className='h-4 w-4' />
						)}
						Localizar
					</Button>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div className='space-y-1.5'>
					<Label>Município</Label>
					<Input value={value.cidade} readOnly className='bg-muted' />
				</div>

				<div className='space-y-1.5'>
					<Label>UF</Label>
					<Input value={value.uf} readOnly className='bg-muted' />
				</div>
			</div>

			<Dialog
				open={dialogCepAberto}
				onOpenChange={(open) => {
					if (!open) fecharDialogCep();
					else setDialogCepAberto(true);
				}}>
				<DialogContent className='sm:max-w-lg'>
					<DialogHeader>
						<DialogTitle>Buscar CEP por Endereço</DialogTitle>
						<DialogDescription>
							Digite o endereço que deseja localizar para encontrar o CEP.
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4'>
						<div className='flex items-end gap-2'>
							<div className='flex-1 space-y-1.5'>
								<Label>Endereço</Label>
								<Input
									value={dialogEndereco}
									onChange={(e) => {
										setDialogEndereco(e.target.value);
										setDialogSemResultados(false);
									}}
									placeholder='Ex: Avenida Paulista'
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											void buscarEnderecoDialog();
										}
									}}
								/>
							</div>
							<Button
								type='button'
								onClick={() => void buscarEnderecoDialog()}
								disabled={buscandoEndereco}
								className='shrink-0'>
								{buscandoEndereco ? (
									<Loader2 className='h-4 w-4 animate-spin' />
								) : (
									<Search className='h-4 w-4' />
								)}
							</Button>
						</div>

						{resultadosDialog.length > 0 && (
							<div className='space-y-2'>
								<p className='text-xs text-muted-foreground'>
									{resultadosDialog.length} resultado(s) encontrado(s)
								</p>
								<div className='border rounded-md divide-y max-h-64 overflow-y-auto'>
									{resultadosPaginados.map((d, i) => (
										<button
											key={`${d.id}-${paginaEndereco}-${i}`}
											type='button'
											onClick={() => selecionarEnderecoDialog(d)}
											className='w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors text-sm cursor-pointer'>
											{formatarLinhaOpcaoEndereco(d)}
										</button>
									))}
								</div>

								{totalPaginas > 1 && (
									<div className='flex items-center justify-between pt-1'>
										<Button
											type='button'
											variant='outline'
											size='sm'
											disabled={paginaEndereco === 0}
											onClick={() => setPaginaEndereco((p) => p - 1)}>
											Anterior
										</Button>
										<span className='text-xs text-muted-foreground'>
											Página {paginaEndereco + 1} de {totalPaginas}
										</span>
										<Button
											type='button'
											variant='outline'
											size='sm'
											disabled={paginaEndereco >= totalPaginas - 1}
											onClick={() => setPaginaEndereco((p) => p + 1)}>
											Próximo
										</Button>
									</div>
								)}
							</div>
						)}

						{dialogSemResultados && resultadosDialog.length === 0 && !buscandoEndereco && (
							<p className='text-sm text-muted-foreground text-center py-4'>
								Nenhum endereço encontrado para a busca.
							</p>
						)}
					</div>

					<DialogFooter>
						<Button type='button' variant='outline' onClick={fecharDialogCep}>
							Fechar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
