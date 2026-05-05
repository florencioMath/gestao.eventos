import type { EventoFormValores } from "@/features/eventos/types";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
	disabled?: boolean;
	className?: string;
};

/** Controlo compacto para cabeçalhos (diálogo de edição, topo da página Novo evento). */
export function EventoEmDestaqueBarraFormulario({ disabled, className }: Props) {
	const { control } = useFormContext<EventoFormValores>();
	return (
		<Controller
			name='eventoEmDestaque'
			control={control}
			render={({ field }) => (
				<button
					type='button'
					disabled={disabled}
					role='switch'
					aria-checked={field.value}
					title={
						field.value
							? "Em destaque no portal. Clique para remover antes de guardar."
							: "Marcar como destaque no portal (evidência no catálogo público). Clique para ativar."
					}
					onClick={() => field.onChange(!field.value)}
					className={cn(
						"inline-flex min-h-9 max-w-full shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
						"hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						field.value
							? "border-amber-400/90 bg-amber-50 text-amber-950 shadow-sm dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-100"
							: "border-border bg-muted/30 text-muted-foreground hover:text-foreground",
						className
					)}>
					<Star
						className={cn(
							"h-4 w-4 shrink-0",
							field.value ? "fill-amber-400 text-amber-600 dark:fill-amber-400 dark:text-amber-300" : ""
						)}
						aria-hidden
					/>
					<span className='whitespace-nowrap'>{field.value ? "Em destaque" : "Destaque portal"}</span>
				</button>
			)}
		/>
	);
}
