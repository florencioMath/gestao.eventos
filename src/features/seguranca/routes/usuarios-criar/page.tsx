import { Button } from '@/components/base/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UsuarioForm } from '../../components/usuario-form';
import { usuariosPath } from '../usuarios/route';

export function CriarUsuarioPage() {
	const navigate = useNavigate();

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Cadastrar Usuário</h1>
					<p className='text-sm text-muted-foreground mt-1'>
						Preencha os dados para criar um novo usuário
					</p>
				</div>
				<Button variant='outline' onClick={() => navigate(usuariosPath)}>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Voltar
				</Button>
			</div>

			<UsuarioForm mode='criar' onSuccess={() => navigate(usuariosPath)} />
		</div>
	);
}
