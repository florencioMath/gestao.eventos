import {
	DropdownMenu as DropdownMenuBase,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

type DropdownMenuItemType = {
	label: string;
	icon?: LucideIcon;
	shortcut?: string;
	onClick?: () => void;
	disabled?: boolean;
	variant?: 'default' | 'destructive';
};

type DropdownMenuGroupType = {
	label?: string;
	items: DropdownMenuItemType[];
};

export const DropdownMenu = ({
	trigger,
	items,
	groups,
	align = 'end',
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuBase> & {
	trigger?: React.ReactNode;
	items?: DropdownMenuItemType[];
	groups?: DropdownMenuGroupType[];
	align?: 'start' | 'center' | 'end';
}) => {
	if (children) {
		return <DropdownMenuBase {...props}>{children}</DropdownMenuBase>;
	}

	if (groups && groups.length > 0) {
		return (
			<DropdownMenuBase {...props}>
				<DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
				<DropdownMenuContent align={align}>
					{groups.map((group, groupIndex) => (
						<React.Fragment key={groupIndex}>
							{groupIndex > 0 && <DropdownMenuSeparator />}
							<DropdownMenuGroup>
								{group.label && (
									<DropdownMenuLabel>{group.label}</DropdownMenuLabel>
								)}
								{group.items.map((item, itemIndex) => {
									const Icon = item.icon;
									return (
										<DropdownMenuItem
											key={itemIndex}
											onClick={item.onClick}
											disabled={item.disabled}
											className={
												item.variant === 'destructive'
													? 'text-destructive focus:text-destructive'
													: ''
											}>
											{Icon && <Icon className='h-4 w-4' />}
											<span>{item.label}</span>
											{item.shortcut && (
												<DropdownMenuShortcut>
													{item.shortcut}
												</DropdownMenuShortcut>
											)}
										</DropdownMenuItem>
									);
								})}
							</DropdownMenuGroup>
						</React.Fragment>
					))}
				</DropdownMenuContent>
			</DropdownMenuBase>
		);
	}

	if (items && items.length > 0) {
		return (
			<DropdownMenuBase {...props}>
				<DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
				<DropdownMenuContent align={align}>
					{items.map((item, index) => {
						const Icon = item.icon;
						return (
							<DropdownMenuItem
								key={index}
								onClick={item.onClick}
								disabled={item.disabled}
								className={
									item.variant === 'destructive'
										? 'text-destructive focus:text-destructive'
										: ''
								}>
								{Icon && <Icon className='h-4 w-4' />}
								<span>{item.label}</span>
								{item.shortcut && (
									<DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
								)}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenuBase>
		);
	}

	return <DropdownMenuBase {...props} />;
};

export {
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
};
