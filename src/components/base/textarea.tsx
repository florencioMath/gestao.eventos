import { Textarea as TextareaBase } from '@/components/ui/textarea';
import React from 'react';

export const Textarea = ({
	children,
	maxLength,
	showCount = false,
	...props
}: React.ComponentProps<typeof TextareaBase> & {
	showCount?: boolean;
}) => {
	const [count, setCount] = React.useState(0);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setCount(e.target.value.length);
		props.onChange?.(e);
	};

	return (
		<div className='relative w-full'>
			<TextareaBase {...props} maxLength={maxLength} onChange={handleChange}>
				{children}
			</TextareaBase>
			{showCount && maxLength && (
				<span className='absolute bottom-2 right-2 text-xs text-muted-foreground'>
					{count}/{maxLength}
				</span>
			)}
		</div>
	);
};
