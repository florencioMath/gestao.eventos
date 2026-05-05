import { Button as ButtonBase } from '@/components/ui/button';

export const Button = ({ children, ...props }: React.ComponentProps<typeof ButtonBase>) => {
	return (
		<ButtonBase className='cursor-pointer' {...props}>
			{children}
		</ButtonBase>
	);
};
