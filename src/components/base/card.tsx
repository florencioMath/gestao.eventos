import {
	Card as CardBase,
	CardContent as CardContentBase,
	CardDescription as CardDescriptionBase,
	CardFooter as CardFooterBase,
	CardHeader as CardHeaderBase,
	CardTitle as CardTitleBase,
} from '@/components/ui/card';

export const Card = ({ children, className, ...props }: React.ComponentProps<typeof CardBase>) => {
	return (
		<CardBase className={`transition-shadow hover:shadow-md ${className || ''}`} {...props}>
			{children}
		</CardBase>
	);
};

export const CardHeader = ({ children, ...props }: React.ComponentProps<typeof CardHeaderBase>) => {
	return <CardHeaderBase {...props}>{children}</CardHeaderBase>;
};

export const CardTitle = ({
	children,
	icon,
	...props
}: React.ComponentProps<typeof CardTitleBase> & {
	icon?: React.ReactNode;
}) => {
	return (
		<CardTitleBase {...props}>
			{icon && <span className='mr-2 inline-flex'>{icon}</span>}
			{children}
		</CardTitleBase>
	);
};

export const CardDescription = ({
	children,
	...props
}: React.ComponentProps<typeof CardDescriptionBase>) => {
	return (
		<CardDescriptionBase className='text-muted-foreground/90' {...props}>
			{children}
		</CardDescriptionBase>
	);
};

export const CardContent = ({
	children,
	...props
}: React.ComponentProps<typeof CardContentBase>) => {
	return <CardContentBase {...props}>{children}</CardContentBase>;
};

export const CardFooter = ({ children, ...props }: React.ComponentProps<typeof CardFooterBase>) => {
	return (
		<CardFooterBase className='gap-2' {...props}>
			{children}
		</CardFooterBase>
	);
};
