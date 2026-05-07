import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/base/sidebar';
import { CONFIG } from '@/config';
import { menuLateralItemAtivo, resolveFeaturePath } from '@/config/feature-routes';
import { FluxoRetiradaQrIngresso } from '@/features/eventos/components/fluxo-retirada-qr-ingresso';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
	Blocks,
	CalendarDays,
	ChevronDown,
	FileSpreadsheet,
	Folder,
	LayoutDashboard,
	ListTodo,
	LogOut,
	MapPin,
	Settings,
	Shield,
	User,
	Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ICONES_POR_GRUPO: Record<string, LucideIcon> = {
	Eventos: CalendarDays,
	Segurança: Shield,
};

const ICONES_POR_FEATURE: Record<string, LucideIcon> = {
	painel: LayoutDashboard,
	eventos: ListTodo,
	'local-troca': MapPin,
	'relatorios-eventos': FileSpreadsheet,
	'cadastro-usuario': Users,
	'perfil-acesso': User,
	funcionalidades: Settings,
	'exemplos-componentes': Blocks,
};

interface NavFeature {
	id: string;
	label: string;
	path: string;
	icon: LucideIcon;
}

interface NavGroup {
	id: string;
	nome: string;
	features: NavFeature[];
}

export function Navbar() {
	const { user, logout } = useAuth();
	const { pathname } = useLocation();

	const grupos: NavGroup[] = useMemo(() => {
		const userClaims = new Set(user?.claims ?? []);
		return (user?.funcionalidades ?? [])
			.map((grupo) => {
				const features: NavFeature[] = [];

				for (const feature of grupo.features) {
					if (feature.key === 'leitor-qr') continue;

					const hasView = feature.claims.some(
						(c) => c.value.endsWith('.view') && userClaims.has(c.value)
					);
					if (!hasView) continue;

					const path = resolveFeaturePath(grupo.nome, feature.key);
					if (!path) continue;

					features.push({
						id: feature.id,
						label: feature.label,
						path,
						icon: ICONES_POR_FEATURE[feature.key] ?? LayoutDashboard,
					});
				}

				return { id: grupo.id, nome: grupo.nome, features };
			})
			.filter((g) => g.features.length > 0);
	}, [user?.funcionalidades, user?.claims]);

	const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
		const firstId = (user?.funcionalidades ?? []).find((g) =>
			g.features.some((f) =>
				f.claims.some(
					(c) => c.value.endsWith('.view') && (user?.claims ?? []).includes(c.value)
				)
			)
		)?.id;
		return firstId ? new Set([firstId]) : new Set();
	});

	const toggleGroup = (groupId: string) => {
		setOpenGroups((prev) => {
			const next = new Set(prev);
			if (next.has(groupId)) next.delete(groupId);
			else next.add(groupId);
			return next;
		});
	};

	return (
		<Sidebar className='border-r-0'>
			<div className='flex items-center gap-3 px-4 py-5 border-b border-sidebar-border'>
				<div className='flex flex-col'>
					<span className='text-sm font-semibold text'>{CONFIG.PROJECT_LABEL}</span>
					<span className='text-xs text/60'>{CONFIG.PROJECT_TAGLINE}</span>
				</div>
			</div>

			<SidebarContent className='pt-2'>
				<SidebarMenu className='space-y-2'>
					{grupos.map((grupo) => {
						const GroupIcon = ICONES_POR_GRUPO[grupo.nome] ?? Folder;
						const isOpen = openGroups.has(grupo.id);

						return (
							<SidebarMenuItem key={grupo.id}>
								<SidebarMenuButton
									onClick={() => toggleGroup(grupo.id)}
									className='flex items-center gap-3 px-4 py-3 text-sm text-sidebar-foreground/80 rounded-lg transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full min-h-[2.75rem]'>
									<GroupIcon className='h-4 w-4 shrink-0' />
									<span className='flex-1 text-left leading-snug'>
										{grupo.nome}
									</span>
									<ChevronDown
										className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
											isOpen ? 'rotate-180' : ''
										}`}
									/>
								</SidebarMenuButton>

								{isOpen && (
									<SidebarMenuSub>
										{grupo.features.map((feature) => {
											const ativo = menuLateralItemAtivo(pathname, feature.path);
											return (
												<SidebarMenuSubItem key={feature.id}>
													<SidebarMenuSubButton asChild isActive={ativo}>
														<Link
															to={feature.path}
															aria-current={ativo ? 'page' : undefined}
															className={cn(
																'flex items-center px-2 py-1.5 text-sm rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
																ativo
																	? 'text-sidebar-accent-foreground font-medium'
																	: 'text-sidebar-foreground/70'
															)}>
															<feature.icon className='h-4 w-4 shrink-0' />
															<span>{feature.label}</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											);
										})}
									</SidebarMenuSub>
								)}
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarContent>

			<SidebarFooter className='border-t border-sidebar-border p-4'>
				<FluxoRetiradaQrIngresso />
				<div className='flex items-center gap-3 mb-3'>
					<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold'>
						{user?.name.charAt(0)}
					</div>
					<div className='flex flex-col min-w-0'>
						<span className='text-xs font-medium text-sidebar-foreground truncate'>
							{user?.name}
						</span>
						<span className='text-[10px] text-sidebar-foreground/50 capitalize'>
							{user?.profile.name}
						</span>
					</div>
				</div>
				<button
					onClick={logout}
					className='flex items-center gap-2 w-full px-3 py-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors'>
					<LogOut className='h-3.5 w-3.5' />
					Sair do sistema
				</button>
			</SidebarFooter>
		</Sidebar>
	);
}
