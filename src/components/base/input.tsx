import { Input as InputBase } from '@/components/ui/input';
import React from 'react';

export const Input = ({ children, ...props }: React.ComponentProps<typeof InputBase>) => {
	return <InputBase {...props}>{children}</InputBase>;
};
