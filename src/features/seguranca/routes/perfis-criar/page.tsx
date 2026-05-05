import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { Label } from '@/components/base/label';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FuncionalidadeService } from '../../api/funcionalidade-service';
import { PerfilService } from '../../api/perfil-service';
import { ClaimsAccordion } from '../../components/claims-accordion';
import { buildSelectedGrupos } from '../../utils/perfil-utils';

export function CriarPerfilPage() {
	const navigate = useNavigate();
	const hasFetched = useRef(false);
	const [saving, setSaving] = useState(false);
	const [loadingGrupos, setLoadingGrupos] = useState(true);
	const [grupos, setGrupos] = useState<GrupoFuncionalidade[]>([]);
	const [profileName, setProfileName] = useState('');
	const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (hasFetched.current) return;
		hasFetched.current = true;
		FuncionalidadeService.listarGrupos()
			.then(setGrupos)
			.finally(() => setLoadingGrupos(false));
	}, []);

	const toggleClaim = (claim: string) => {
		setSelectedClaims((prev) => {
			const next = new Set(prev);
			if (next.has(claim)) next.delete(claim);
			else next.add(claim);
			return next;
		});
	};

	const checkAllInGroup = (group: GrupoFuncionalidade) => {
		setSelectedClaims((prev) => {
			const next = new Set(prev);
			const allClaims = group.features.flatMap((f) => f.claims.map((c) => c.value));
			const allChecked = allClaims.every((c) => next.has(c));
			if (allChecked) {
				allClaims.forEach((c) => next.delete(c));
			} else {
				allClaims.forEach((c) => next.add(c));
			}
			return next;
		});
	};

	const isGroupAllChecked = (group: GrupoFuncionalidade) => {
		const allClaims = group.features.flatMap((f) => f.claims.map((c) => c.value));
		return allClaims.length > 0 && allClaims.every((c) => selectedClaims.has(c));
	};

	const handleSave = async () => {
		if (!profileName.trim()) {
			toast.error('O nome do perfil é obrigatório');
			return;
		}

		const funcionalidades = buildSelectedGrupos(grupos, selectedClaims);
		setSaving(true);
		try {
			await PerfilService.criarPerfil(profileName.trim(), funcionalidades);
			toast.success('Perfil criado com sucesso!');
			navigate('/seguranca/perfis');
		} catch {
			toast.error('Erro ao criar perfil');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Cadastrar Perfil</h1>
					<p className='text-sm text-muted-foreground mt-1'>
						Crie um novo perfil e defina suas permissões
					</p>
				</div>
				<Button variant='outline' onClick={() => navigate('/seguranca/perfis')}>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Voltar
				</Button>
			</div>

			<div className='space-y-2 max-w-md'>
				<Label required>Nome</Label>
				<Input
					value={profileName}
					onChange={(e) => setProfileName(e.target.value)}
					placeholder='Nome do perfil'
				/>
			</div>

			{loadingGrupos ? (
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
				</div>
			) : (
				<ClaimsAccordion
					grupos={grupos}
					selectedClaims={selectedClaims}
					onToggle={toggleClaim}
					onCheckAllGroup={checkAllInGroup}
					isGroupAllChecked={isGroupAllChecked}
				/>
			)}

			<div className='flex justify-end pt-2'>
				<Button onClick={handleSave} disabled={saving}>
					{saving ? (
						<Loader2 className='h-4 w-4 mr-2 animate-spin' />
					) : (
						<Save className='h-4 w-4 mr-2' />
					)}
					{saving ? 'Salvando...' : 'Salvar'}
				</Button>
			</div>
		</div>
	);
}
