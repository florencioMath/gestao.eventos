import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card';

export function PaginaEventos() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Eventos</CardTitle>
			</CardHeader>
			<CardContent>
				<p className='text-muted-foreground text-sm'>Módulo Eventos.</p>
			</CardContent>
		</Card>
	);
}
