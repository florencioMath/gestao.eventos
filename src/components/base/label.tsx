import { Label as LabelBase } from '@/components/ui/label';

export const Label = ({
	children,
	required,
	...props
}: React.ComponentProps<typeof LabelBase> & {
	required?: boolean;
}) => {
	return (
		<LabelBase {...props}>
			{children}
			{required && <span className='text-destructive ml-1'>*</span>}
		</LabelBase>
	);
};
