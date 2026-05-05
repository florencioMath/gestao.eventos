import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/base/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { useAuth } from '@/hooks/use-auth';
import { Outlet } from 'react-router-dom';

function LayoutContent() {
	const { user } = useAuth();

	return (
		<>
			<Navbar />
			<SidebarInset>
				<header className='h-14 flex items-center gap-4 border-b bg-primary px-4 shrink-0'>
					<SidebarTrigger className='text-white' />
					<div className='flex-1' />
					<span className='text-xs text-white'>
						{user?.name} — <span className='capitalize'>{user?.profile.name}</span>
					</span>
				</header>
				<div className='flex-1 p-6 overflow-auto'>
					<Outlet />
				</div>
			</SidebarInset>
		</>
	);
}

export const PrivateLayout = () => {
	return (
		<SidebarProvider>
			<LayoutContent />
		</SidebarProvider>
	);
};
