import { Button } from '@/components/base/button';
import { Card, CardContent, CardHeader } from '@/components/base/card';
import { Input } from '@/components/base/input';
import { Label } from '@/components/base/label';
import { Select } from '@/components/base/select';
import { useAuth } from '@/hooks/use-auth';
import axios from 'axios';
import { Eye, EyeOff, Loader2, Save, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UsuarioService } from '../api/usuario-service';

const ADMIN_NAMES = ['ADMIN', 'ADMINISTRADOR'];

function applyCpfMask(value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, 11);
	if (digits.length <= 3) return digits;
	if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
	if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
	return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function applyPhoneMask(value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, 11);
	if (digits.length <= 2) return digits.length ? `(${digits}` : '';
	if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
	return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

type UsuarioFormProps = {
	mode: 'criar' | 'editar';
	initialData?: Partial<UsuarioFormData> & { id?: string };
	onSuccess?: () => void;
};

export function UsuarioForm({ mode, initialData, onSuccess }: UsuarioFormProps) {
	const { user } = useAuth();
	const isAdmin = ADMIN_NAMES.includes(user?.profile.name?.toUpperCase() ?? '');
	const [perfis, setPerfis] = useState<PerfilOption[]>([]);
	const [unidades, setUnidades] = useState<UnidadeOption[]>([]);
	const [submitting, setSubmitting] = useState(false);

	const [status, setStatus] = useState(initialData?.status ?? true);
	const [displayName, setDisplayName] = useState(initialData?.displayName ?? '');
	const [cpf, setCpf] = useState(initialData?.cpf ?? '');
	const [email, setEmail] = useState(initialData?.email ?? '');
	const [telefone, setTelefone] = useState(initialData?.telefone ?? '');
	const [perfilId, setPerfilId] = useState(initialData?.perfilId ?? '');
	const [unidadeId, setUnidadeId] = useState(initialData?.unidadeId ?? '');
	const [senha, setSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [showSenha, setShowSenha] = useState(false);
	const [showConfirmar, setShowConfirmar] = useState(false);

	useEffect(() => {
		Promise.all([UsuarioService.getPerfis(), UsuarioService.getUnidades()]).then(
			([perfis, unidades]) => {
				setPerfis(perfis);
				setUnidades(unidades);
			}
		);
	}, []);

	useEffect(() => {
		if (initialData) {
			setStatus(initialData.status ?? true);
			setDisplayName(initialData.displayName ?? '');
			setCpf(initialData.cpf ?? '');
			setEmail(initialData.email ?? '');
			setTelefone(initialData.telefone ?? '');
			setPerfilId(initialData.perfilId ?? '');
			setUnidadeId(initialData.unidadeId ? String(initialData.unidadeId) : '');
		}
	}, [initialData]);

	const validate = (): string | null => {
		if (!displayName || displayName.length < 3) return 'Nome deve ter pelo menos 3 caracteres';

		const cpfDigits = cpf.replace(/\D/g, '');
		if (cpfDigits.length !== 11) return 'CPF deve ter 11 dígitos';

		if (!email || !email.includes('@')) return 'Email inválido';
		if (!telefone || telefone.replace(/\D/g, '').length < 10) return 'Telefone inválido';
		if (!perfilId) return 'Selecione um perfil de acesso';
		if (!unidadeId) return 'Selecione uma unidade';

		if (mode === 'criar') {
			if (!senha || senha.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
			const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
			if (!strongPassword.test(senha))
				return 'Senha deve conter maiúscula, minúscula, número e caractere especial';
			if (senha !== confirmarSenha) return 'Senhas não conferem';
		}

		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const error = validate();
		if (error) {
			toast.error(error);
			return;
		}

		const formData: UsuarioFormData = {
			status,
			displayName,
			cpf: cpf.replace(/\D/g, ''),
			email,
			emailSecundario: email,
			telefone,
			perfilId,
			unidadeId: Number(unidadeId),
			senha,
			confirmarSenha,
		};

		setSubmitting(true);
		try {
			if (mode === 'criar') {
				await UsuarioService.criarUsuario(formData);
				toast.success('Usuário cadastrado com sucesso!');
			} else {
				await UsuarioService.editarUsuario(initialData?.id ?? '', formData);
				toast.success('Usuário atualizado com sucesso!');
			}
			onSuccess?.();
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				try {
					const rawMessage = error.response?.data?.message;

					const parsed = JSON.parse(rawMessage);

					const mensagens = parsed?.errors?.Mensagens;
					const errorMsg =
						Array.isArray(mensagens) && mensagens.length > 0
							? mensagens[0]
							: (parsed?.title ?? 'Erro ao realizar cadastro');

					toast.error(errorMsg);
				} catch {
					toast.error('Erro ao realizar cadastro');
				}
			} else {
				toast.error('Erro inesperado');
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader>
					<div className='flex items-center gap-3'>
						<UserCircle className='h-5 w-5 text-muted-foreground' />
						<h3 className='text-base font-semibold'>Dados de Acesso</h3>
					</div>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Status */}
					<div className='flex items-center gap-3'>
						<button
							type='button'
							role='switch'
							aria-checked={status}
							onClick={() => setStatus(!status)}
							className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
								status ? 'bg-primary' : 'bg-muted'
							}`}>
							<span
								className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
									status ? 'translate-x-5' : 'translate-x-0'
								}`}
							/>
						</button>
						<Label className='cursor-pointer' onClick={() => setStatus(!status)}>
							{status ? 'Ativo' : 'Inativo'}
						</Label>
					</div>

					{/* Nome + CPF */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label required>Nome</Label>
							<Input
								placeholder='Nome do usuário'
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
							/>
						</div>
						<div className='space-y-2'>
							<Label required>CPF</Label>
							<Input
								placeholder='999.999.999-99'
								value={cpf}
								onChange={(e) => setCpf(applyCpfMask(e.target.value))}
								readOnly={mode === 'editar'}
								className={mode === 'editar' ? 'bg-muted' : ''}
							/>
						</div>
					</div>

					{/* Email + Telefone */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label required>Email</Label>
							<Input
								type='email'
								placeholder='email@exemplo.com'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className='space-y-2'>
							<Label required>Telefone</Label>
							<Input
								placeholder='(99) 99999-9999'
								value={telefone}
								onChange={(e) => setTelefone(applyPhoneMask(e.target.value))}
							/>
						</div>
					</div>

					{/* Perfil */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label required>Perfil de acesso</Label>
							<Select
								value={perfilId}
								onValueChange={setPerfilId}
								options={perfis
									.filter(
										(p) =>
											isAdmin || !ADMIN_NAMES.includes(p.name.toUpperCase())
									)
									.map((p) => ({ value: p.id, label: p.name }))}
								placeholder='Selecione um perfil'
							/>
						</div>
						<div className='space-y-2'>
							<Label required>Unidade</Label>
							<Select
								value={String(unidadeId)}
								onValueChange={setUnidadeId}
								options={unidades.map((p) => ({
									value: String(p.id),
									label: p.descricao,
								}))}
								placeholder='Selecione uma unidade'
							/>
						</div>
					</div>

					{/* Senha (apenas criação) */}
					{mode === 'criar' && (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label required>Senha</Label>
								<div className='relative'>
									<Input
										type={showSenha ? 'text' : 'password'}
										placeholder='********'
										value={senha}
										onChange={(e) => setSenha(e.target.value)}
										className='pr-10'
									/>
									<button
										type='button'
										onClick={() => setShowSenha(!showSenha)}
										className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
										aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}>
										{showSenha ? (
											<EyeOff className='h-4 w-4' />
										) : (
											<Eye className='h-4 w-4' />
										)}
									</button>
								</div>
								<p className='text-xs text-muted-foreground'>
									Mín. 8 caracteres, com maiúscula, minúscula, número e caractere
									especial
								</p>
							</div>
							<div className='space-y-2'>
								<Label required>Confirmar senha</Label>
								<div className='relative'>
									<Input
										type={showConfirmar ? 'text' : 'password'}
										placeholder='********'
										value={confirmarSenha}
										onChange={(e) => setConfirmarSenha(e.target.value)}
										className='pr-10'
									/>
									<button
										type='button'
										onClick={() => setShowConfirmar(!showConfirmar)}
										className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
										aria-label={
											showConfirmar ? 'Ocultar senha' : 'Mostrar senha'
										}>
										{showConfirmar ? (
											<EyeOff className='h-4 w-4' />
										) : (
											<Eye className='h-4 w-4' />
										)}
									</button>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Actions */}
			<div className='flex justify-end gap-3 mt-6'>
				<Button type='submit' disabled={submitting}>
					{submitting ? (
						<Loader2 className='h-4 w-4 mr-2 animate-spin' />
					) : (
						<Save className='h-4 w-4 mr-2' />
					)}
					{submitting ? 'Salvando...' : 'Salvar'}
				</Button>
			</div>
		</form>
	);
}
