import {
	Sheet as SheetBase,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import * as React from 'react';

export const Sheet = ({
	trigger,
	title,
	description,
	children,
	footer,
	side = 'right',
	...props
}: React.ComponentProps<typeof SheetBase> & {
	trigger?: React.ReactNode;
	title?: string;
	description?: string;
	footer?: React.ReactNode;
	side?: 'top' | 'bottom' | 'left' | 'right';
}) => {
	if (!trigger) {
		return <SheetBase {...props}>{children}</SheetBase>;
	}

	return (
		<SheetBase {...props}>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent side={side}>
				{(title || description) && (
					<SheetHeader>
						{title && <SheetTitle>{title}</SheetTitle>}
						{description && <SheetDescription>{description}</SheetDescription>}
					</SheetHeader>
				)}
				<div className='flex-1 overflow-y-auto py-4'>{children}</div>
				{footer && <SheetFooter>{footer}</SheetFooter>}
			</SheetContent>
		</SheetBase>
	);
};

export {
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
};
