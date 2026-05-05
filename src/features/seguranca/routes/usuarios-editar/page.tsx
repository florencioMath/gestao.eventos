import { Button } from '@/components/base/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { UsuarioService } from '../../api/usuario-service';
import { UsuarioForm } from '../../components/usuario-form';
import { usuariosPath } from '../usuarios/route';

export function EditarUsuarioPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [initialData, setInitialData] = useState<
		(Partial<UsuarioFormData> & { id: string }) | null
	>(null);

	useEffect(() => {
		if (!id) return;
		UsuarioService.getUsuario(id)
			.then((usuario) => {
				if (!usuario) {
					toast.error('Usuário não encontrado');
					navigate(usuariosPath);
					return;
				}
				setInitialData({
					id: usuario.id,
					status: usuario.status,
					displayName: usuario.displayName,
					cpf: usuario.cpf,
					email: usuario.email,
					emailSecundario: usuario.emailSecundario ?? '',
					telefone: usuario.telefone ?? '',
					perfilId: usuario.perfis[0]?.id ?? '',
					unidadeId: Number(usuario.unidadeId),
				});
			})
			.catch(() => {
				toast.error('Erro ao carregar dados do usuário');
				navigate(usuariosPath);
			})
			.finally(() => setLoading(false));
	}, [id, navigate]);

	if (loading) {
		return (
			<div className='flex items-center justify-center py-24'>
				<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
			</div>
		);
	}

	if (!initialData) return null;

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Editar Usuário</h1>
					<p className='text-sm text-muted-foreground mt-1'>
						Atualize os dados do usuário
					</p>
				</div>
				<Button variant='outline' onClick={() => navigate(usuariosPath)}>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Voltar
				</Button>
			</div>

			<UsuarioForm
				mode='editar'
				initialData={initialData}
				onSuccess={() => navigate(usuariosPath)}
			/>
		</div>
	);
}
