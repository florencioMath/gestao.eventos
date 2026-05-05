import { Button } from '@/components/base/button';
import { Card, CardContent } from '@/components/base/card';
import { Input } from '@/components/base/input';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Plus, Search, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PerfilService } from '../../api/perfil-service';

const ADMIN_NAMES = ['ADMIN', 'ADMINISTRADOR'];

export function PerfisPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const isAdmin = ADMIN_NAMES.includes(user?.profile.name?.toUpperCase() ?? '');
	const hasFetched = useRef(false);
	const [perfis, setPerfis] = useState<Perfil[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');

	useEffect(() => {
		if (hasFetched.current) return;
		hasFetched.current = true;
		PerfilService.getPerfis()
			.then(setPerfis)
			.finally(() => setLoading(false));
	}, []);

	const filtered = perfis
		.filter((p) => isAdmin || !ADMIN_NAMES.includes(p.name.toUpperCase()))
		.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Perfis de Acesso</h1>
					<p className='text-sm text-muted-foreground mt-1'>
						Gerencie os perfis e permissões do sistema
					</p>
				</div>
				<Button onClick={() => navigate('/seguranca/perfis/criar')}>
					<Plus className='h-4 w-4 mr-2' />
					Novo Perfil
				</Button>
			</div>

			<div className='flex items-center gap-2 max-w-sm'>
				<Search className='h-4 w-4 text-muted-foreground' />
				<Input
					placeholder='Pesquisar perfil...'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			{loading ? (
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
				</div>
			) : filtered.length === 0 ? (
				<p className='text-sm text-muted-foreground py-8 text-center'>
					Nenhum perfil encontrado
				</p>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{filtered.map((perfil) => (
						<Card
							key={perfil.id}
							className='hover:border-primary/40 transition-colors cursor-pointer'
							onClick={() =>
								navigate(`/seguranca/perfis/editar/${perfil.id}`)
							}>
							<CardContent className='pt-5 pb-4 px-5'>
								<p className='text-xs text-muted-foreground mb-1'>
									Total {perfil.userCount}{' '}
									{perfil.userCount === 1 ? 'usuário' : 'usuários'}
								</p>
								<div className='flex items-center gap-2'>
									<Users className='h-4 w-4 text-muted-foreground shrink-0' />
									<p className='font-semibold text-base'>{perfil.name}</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
