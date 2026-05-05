import { Separator as SeparatorBase } from '@/components/ui/separator';

export const Separator = ({ className, ...props }: React.ComponentProps<typeof SeparatorBase>) => {
	return <SeparatorBase className={className} {...props} />;
};
