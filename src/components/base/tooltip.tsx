import {
	Tooltip as TooltipBase,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import * as React from 'react';

export const Tooltip = ({
	children,
	content,
	side = 'top',
	delayDuration = 200,
	...props
}: React.ComponentProps<typeof TooltipBase> & {
	children: React.ReactNode;
	content: React.ReactNode;
	side?: 'top' | 'bottom' | 'left' | 'right';
	delayDuration?: number;
}) => {
	return (
		<TooltipProvider delayDuration={delayDuration}>
			<TooltipBase {...props}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent side={side}>
					<p>{content}</p>
				</TooltipContent>
			</TooltipBase>
		</TooltipProvider>
	);
};

// Re-exporta componentes para uso avançado
export { TooltipContent, TooltipProvider, TooltipTrigger };
