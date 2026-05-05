import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card';

export function PaginaPainel() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Painel</CardTitle>
			</CardHeader>
			<CardContent>
				<p className='text-muted-foreground text-sm'>Módulo Painel da funcionalidade Eventos.</p>
			</CardContent>
		</Card>
	);
}
