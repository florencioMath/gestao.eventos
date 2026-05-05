import { Button } from '@/components/base/button';
import { Card, CardContent, CardHeader } from '@/components/base/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/base/dialog';
import { Input } from '@/components/base/input';
import {
	ChevronLeft,
	ChevronRight,
	Edit,
	Eye,
	Loader2,
	Plus,
	Search,
	UserCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsuarioService } from '../../api/usuario-service';
import { criarUsuarioPath } from '../usuarios-criar/route';

const PAGE_SIZE = 10;

function StatusBadge({ active }: { active: boolean }) {
	return (
		<span
			className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
				active ? 'bg-emerald-600/10 text-emerald-700' : 'bg-gray-200/60 text-gray-500'
			}`}>
			{active ? 'Ativo' : 'Inativo'}
		</span>
	);
}

export function UsuariosPage() {
	const navigate = useNavigate();
	const hasFetched = useRef(false);
	const [usuarios, setUsuarios] = useState<Usuario[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const [viewDialog, setViewDialog] = useState<Usuario | null>(null);

	const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const handleSearchChange = useCallback((value: string) => {
		setSearch(value);
		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			setDebouncedSearch(value);
			setPage(0);
		}, 500);
	}, []);

	useEffect(() => {
		return () => clearTimeout(debounceRef.current);
	}, []);

	const loadUsuarios = useCallback(async (targetPage: number, term: string) => {
		setLoading(true);
		try {
			const data = await UsuarioService.getUsuariosPaginado(
				targetPage,
				PAGE_SIZE,
				term || undefined
			);
			setUsuarios(data.content);
			setTotalPages(data.totalPages);
			setTotalElements(data.totalElements);
			setPage(targetPage);
		} catch {
			setUsuarios([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (hasFetched.current) return;
		hasFetched.current = true;
		loadUsuarios(0, '');
	}, [loadUsuarios]);

	useEffect(() => {
		if (!hasFetched.current) return;
		loadUsuarios(page, debouncedSearch);
	}, [page, debouncedSearch, loadUsuarios]);

	const handlePageChange = (newPage: number) => {
		if (newPage < 0 || newPage >= totalPages) return;
		setPage(newPage);
	};

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Cadastro de Usuários</h1>
					<p className='text-sm text-muted-foreground mt-1'>
						Gerencie os usuários do sistema
					</p>
				</div>
				<Button onClick={() => navigate(criarUsuarioPath)}>
					<Plus className='h-4 w-4 mr-2' />
					Novo Usuário
				</Button>
			</div>

			<Card>
				<CardHeader className='pb-3'>
					<div className='flex items-center gap-2'>
						<Search className='h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Buscar por nome, e-mail ou CPF...'
							value={search}
							onChange={(e) => handleSearchChange(e.target.value)}
							className='max-w-sm'
						/>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className='flex items-center justify-center py-12'>
							<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
						</div>
					) : (
						<>
							<div className='overflow-x-auto'>
								<table className='w-full text-sm'>
									<thead>
										<tr className='border-b text-left'>
											<th className='pb-3 font-medium text-muted-foreground'>
												Nome do Usuário
											</th>
											<th className='pb-3 font-medium text-muted-foreground'>
												Email
											</th>
											<th className='pb-3 font-medium text-muted-foreground'>
												Perfil
											</th>
											<th className='pb-3 font-medium text-muted-foreground'>
												Status
											</th>
											<th className='pb-3 font-medium text-muted-foreground text-right'>
												Ações
											</th>
										</tr>
									</thead>
									<tbody>
										{usuarios.map((usuario) => (
											<tr
												key={usuario.id}
												className='border-b last:border-0 hover:bg-muted/30 transition-colors'>
												<td className='py-3'>
													<div className='flex items-center gap-3'>
														<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted'>
															<UserCircle className='h-5 w-5 text-muted-foreground' />
														</div>
														<div className='min-w-0'>
															<p className='font-medium truncate'>
																{usuario.displayName}
															</p>
															<p className='text-xs text-muted-foreground'>
																{usuario.cpf}
															</p>
														</div>
													</div>
												</td>
												<td className='py-3 text-muted-foreground'>
													{usuario.email}
												</td>
												<td className='py-3'>
													<div className='flex flex-wrap gap-1'>
														{usuario.perfis.map((p) => (
															<span
																key={p.id}
																className='inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary'>
																{p.name}
															</span>
														))}
													</div>
												</td>
												<td className='py-3'>
													<StatusBadge active={usuario.status} />
												</td>
												<td className='py-3 text-right'>
													<div className='flex items-center justify-end gap-1'>
														<Button
															variant='ghost'
															size='icon-sm'
															title='Editar'
															onClick={() =>
																navigate(
																	`/seguranca/usuarios/editar/${usuario.id}`
																)
															}>
															<Edit className='h-4 w-4' />
														</Button>
														<Button
															variant='outline'
															size='icon-sm'
															title='Visualizar'
															onClick={() => setViewDialog(usuario)}>
															<Eye className='h-4 w-4' />
														</Button>
													</div>
												</td>
											</tr>
										))}
										{usuarios.length === 0 && (
											<tr>
												<td
													colSpan={5}
													className='py-8 text-center text-muted-foreground'>
													Nenhum usuário encontrado
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>

							{totalPages > 1 && (
								<div className='flex items-center justify-between mt-4 pt-4 border-t'>
									<p className='text-sm text-muted-foreground'>
										Mostrando {page * PAGE_SIZE + 1}–
										{Math.min((page + 1) * PAGE_SIZE, totalElements)} de{' '}
										{totalElements} registros
									</p>
									<div className='flex items-center gap-1'>
										<Button
											variant='outline'
											size='icon-sm'
											onClick={() => handlePageChange(page - 1)}
											disabled={page === 0}>
											<ChevronLeft className='h-4 w-4' />
										</Button>

										{[...Array(totalPages)].map((_, i) => {
											const showPage =
												i === 0 ||
												i === totalPages - 1 ||
												Math.abs(i - page) <= 1;
											const showEllipsis = Math.abs(i - page) === 2;

											if (showEllipsis) {
												return (
													<span
														key={i}
														className='px-1 text-muted-foreground'>
														...
													</span>
												);
											}
											if (!showPage) return null;

											return (
												<Button
													key={i}
													variant={page === i ? 'default' : 'outline'}
													size='icon-sm'
													onClick={() => handlePageChange(i)}>
													{i + 1}
												</Button>
											);
										})}

										<Button
											variant='outline'
											size='icon-sm'
											onClick={() => handlePageChange(page + 1)}
											disabled={page === totalPages - 1}>
											<ChevronRight className='h-4 w-4' />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			<Dialog open={!!viewDialog} onOpenChange={() => setViewDialog(null)}>
				<DialogContent className='max-w-lg'>
					<DialogHeader>
						<DialogTitle>Detalhes do Usuário</DialogTitle>
						<DialogDescription>
							Informações cadastrais do usuário selecionado
						</DialogDescription>
					</DialogHeader>
					{viewDialog && (
						<div className='space-y-5'>
							<div className='flex items-center gap-4'>
								<div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted'>
									<UserCircle className='h-8 w-8 text-muted-foreground' />
								</div>
								<div>
									<p className='text-lg font-semibold'>
										{viewDialog.displayName}
									</p>
									<p className='text-sm text-muted-foreground'>
										{viewDialog.email}
									</p>
								</div>
							</div>

							<div className='border-t' />

							<div className='grid grid-cols-2 gap-4'>
								<div>
									<p className='text-xs text-muted-foreground mb-0.5'>CPF</p>
									<p className='font-medium'>{viewDialog.cpf}</p>
								</div>
								<div>
									<p className='text-xs text-muted-foreground mb-0.5'>Status</p>
									<StatusBadge active={viewDialog.status} />
								</div>
								<div>
									<p className='text-xs text-muted-foreground mb-0.5'>
										Cadastrado em
									</p>
									<p className='font-medium'>
										{new Date(viewDialog.criadoEm).toLocaleDateString('pt-BR')}
									</p>
								</div>
								<div>
									<p className='text-xs text-muted-foreground mb-0.5'>
										Atualizado em
									</p>
									<p className='font-medium'>
										{viewDialog.atualizadoEm
											? new Date(viewDialog.atualizadoEm).toLocaleDateString(
													'pt-BR'
												)
											: '—'}
									</p>
								</div>
							</div>

							<div className='border-t' />

							<div>
								<p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2'>
									Perfis de Acesso
								</p>
								<div className='flex flex-wrap gap-2'>
									{viewDialog.perfis.map((perfil) => (
										<span
											key={perfil.id}
											className='inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary'>
											{perfil.name}
										</span>
									))}
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
