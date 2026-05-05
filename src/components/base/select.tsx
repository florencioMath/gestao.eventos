import {
	Select as SelectBase,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

type SelectOption = {
	value: string;
	label: string;
	disabled?: boolean;
};

type SelectGroupOption = {
	label: string;
	options: SelectOption[];
};

export const Select = ({
	options,
	groups,
	placeholder = 'Selecione...',
	triggerId,
	triggerClassName,
	...props
}: React.ComponentProps<typeof SelectBase> & {
	options?: SelectOption[];
	groups?: SelectGroupOption[];
	placeholder?: string;
	/** Repassado ao gatilho visível (ex.: `htmlFor` do `Label`). */
	triggerId?: string;
	triggerClassName?: string;
}) => {
	if (groups && groups.length > 0) {
		return (
			<SelectBase {...props}>
				<SelectTrigger id={triggerId} className={triggerClassName}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{groups.map((group) => (
						<SelectGroup key={group.label}>
							<SelectLabel>{group.label}</SelectLabel>
							{group.options.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
									disabled={option.disabled}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					))}
				</SelectContent>
			</SelectBase>
		);
	}

	if (options && options.length > 0) {
		return (
			<SelectBase {...props}>
				<SelectTrigger id={triggerId} className={triggerClassName}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}
							disabled={option.disabled}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</SelectBase>
		);
	}

	return <SelectBase {...props} />;
};

export { SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue };
