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
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FuncionalidadeService } from '../../api/funcionalidade-service';
import { PerfilService } from '../../api/perfil-service';
import { ClaimsAccordion } from '../../components/claims-accordion';
import { buildSelectedGrupos, extractClaimValues } from '../../utils/perfil-utils';

const ADMIN_NAMES = ['ADMIN', 'ADMINISTRADOR'];

export function EditarPerfilPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user } = useAuth();
	const isAdmin = ADMIN_NAMES.includes(user?.profile.name?.toUpperCase() ?? '');
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [perfilName, setPerfilName] = useState<string | null>(null);
	const [grupos, setGrupos] = useState<GrupoFuncionalidade[]>([]);
	const [profileName, setProfileName] = useState('');
	const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (!id) return;
		Promise.all([
			PerfilService.getPerfilById(id),
			FuncionalidadeService.listarGrupos(),
			PerfilService.getPermissoes(id),
		])
			.then(([perfilData, gruposData, permissoes]) => {
				if (!perfilData) {
					toast.error('Perfil não encontrado');
					navigate('/seguranca/perfis');
					return;
				}
				setPerfilName(perfilData.name);
				setProfileName(perfilData.name);
				setSelectedClaims(new Set(extractClaimValues(permissoes)));
				setGrupos(gruposData);
			})
			.finally(() => setLoading(false));
	}, [id, navigate]);

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

	const handleDelete = async () => {
		if (!id) return;
		setDeleting(true);
		try {
			await PerfilService.excluirPerfil(id);
			toast.success('Perfil excluído com sucesso!');
			navigate('/seguranca/perfis');
		} catch {
			toast.error('Erro ao excluir perfil');
		} finally {
			setDeleting(false);
		}
	};

	const handleSave = async () => {
		if (!id) return;
		if (!profileName.trim()) {
			toast.error('O nome do perfil é obrigatório');
			return;
		}

		const funcionalidades = buildSelectedGrupos(grupos, selectedClaims);

		setSaving(true);
		try {
			await PerfilService.atualizarPerfil(id, profileName.trim(), funcionalidades);
			toast.success('Perfil atualizado com sucesso!');
			navigate('/seguranca/perfis');
		} catch {
			toast.error('Erro ao salvar perfil');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center py-24'>
				<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
			</div>
		);
	}

	if (!perfilName) return null;

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Editar Perfil</h1>
					<p className='text-sm text-muted-foreground mt-1'>
						Configure as permissões do perfil
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

			<ClaimsAccordion
				grupos={grupos}
				selectedClaims={selectedClaims}
				onToggle={toggleClaim}
				onCheckAllGroup={checkAllInGroup}
				isGroupAllChecked={isGroupAllChecked}
			/>

			<div className={`flex pt-2 ${isAdmin ? 'justify-between' : 'justify-end'}`}>
				{isAdmin && (
					<Button
						variant='destructive'
						onClick={() => setShowDeleteDialog(true)}
						disabled={saving}>
						<Trash2 className='h-4 w-4 mr-2' />
						Excluir Perfil
					</Button>
				)}
				<Button onClick={handleSave} disabled={saving}>
					{saving ? (
						<Loader2 className='h-4 w-4 mr-2 animate-spin' />
					) : (
						<Save className='h-4 w-4 mr-2' />
					)}
					{saving ? 'Salvando...' : 'Salvar'}
				</Button>
			</div>

			{isAdmin && (
				<Dialog
					open={showDeleteDialog}
					onOpenChange={() => !deleting && setShowDeleteDialog(false)}>
					<DialogContent className='max-w-sm'>
						<DialogHeader>
							<DialogTitle>Excluir perfil</DialogTitle>
							<DialogDescription>
								Deseja excluir o perfil <strong>{profileName}</strong>? Essa ação
								não pode ser desfeita.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant='outline'
								onClick={() => setShowDeleteDialog(false)}
								disabled={deleting}>
								Cancelar
							</Button>
							<Button
								variant='destructive'
								onClick={handleDelete}
								disabled={deleting}>
								{deleting ? (
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
								) : (
									<Trash2 className='h-4 w-4 mr-2' />
								)}
								{deleting ? 'Excluindo...' : 'Excluir'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
