import { Label } from "@/components/base/label";
import { Select } from "@/components/base/select";
import { EventosApi } from "@/features/eventos/api/eventos-api";
import { LocaisTrocaApi } from "@/features/eventos/api/locais-troca-api";
import { localTrocaDtoParaPontoTrocaEvento } from "@/features/eventos/lib/pontos-troca-evento";
import type { EventoDominioOpcaoDto, EventoFormValores, LocalTrocaDto } from "@/features/eventos/types";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";

type Props = {
	disabled?: boolean;
};

function paraOpcoesSelect(itens: EventoDominioOpcaoDto[]) {
	return itens.map((i) => ({ value: i.nome, label: i.nome }));
}

function rotuloLocalDeTrocaNoSelect(l: LocalTrocaDto): string {
	const end = l.endereco.replace(/\s+/g, " ").trim();
	const max = 56;
	const endCurto = end.length <= max ? end : `${end.slice(0, max)}…`;
	return `${l.nome} — ${endCurto}`;
}

export function CategoriaELocalFormulario({ disabled }: Props) {
	const { control, setValue, getValues } = useFormContext<EventoFormValores>();
	const categoriaVal = useWatch({ control, name: "categoria" });
	const semPonto = useWatch({ control, name: "semPontoDeTroca" });
	const [categorias, setCategorias] = useState<EventoDominioOpcaoDto[]>([]);
	const [locaisDeTroca, setLocaisDeTroca] = useState<LocalTrocaDto[]>([]);
	const [carregando, setCarregando] = useState(true);

	useEffect(() => {
		let ativo = true;
		(async () => {
			setCarregando(true);
			let c: EventoDominioOpcaoDto[] = [];
			let locais: LocalTrocaDto[] = [];
			try {
				c = await EventosApi.listarDominioCategorias();
			} catch {
				toast.error("Não foi possível carregar as categorias.");
			}
			try {
				locais = await LocaisTrocaApi.listar();
			} catch {
				toast.error("Não foi possível carregar os locais de troca.");
			}
			if (!ativo) return;
			setCategorias(c);
			setLocaisDeTroca(locais);
			setCarregando(false);
		})();
		return () => {
			ativo = false;
		};
	}, []);

	const opcoesCategoria = useMemo(() => {
		const base = paraOpcoesSelect(categorias);
		const v = (categoriaVal ?? "").trim();
		if (v && !base.some((o) => o.value === v)) {
			base.unshift({ value: v, label: `${v} (fora da lista)` });
		}
		return base;
	}, [categorias, categoriaVal]);

	const locaisAtivos = useMemo(() => locaisDeTroca.filter((l) => l.ativo), [locaisDeTroca]);

	const bloqueado = Boolean(disabled || carregando);

	const optsCategoria =
		opcoesCategoria.length > 0
			? opcoesCategoria
			: [{ value: "_sem-opcoes", label: "Sem categorias disponíveis", disabled: true }];

	return (
		<div className='grid gap-4'>
			<div className='grid min-w-0 gap-2 sm:max-w-md'>
				<Label htmlFor='evento-categoria' required>
					Categoria
				</Label>
				{carregando ? (
					<div className='h-10 animate-pulse rounded-md bg-muted' aria-hidden />
				) : (
					<Controller
						name='categoria'
						control={control}
						rules={{
							required: "Selecione a categoria",
							validate: (v) => (v && String(v).trim() && v !== "_sem-opcoes") || "Selecione a categoria",
						}}
						render={({ field }) => (
							<Select
								triggerId='evento-categoria'
								disabled={bloqueado}
								value={field.value?.trim() ? field.value : undefined}
								onValueChange={field.onChange}
								placeholder='Selecione a categoria'
								options={optsCategoria}
							/>
						)}
					/>
				)}
			</div>
			<div className='grid min-w-0 gap-3'>
				<Label className='text-foreground'>Ponto de troca</Label>
				<Controller
					name='semPontoDeTroca'
					control={control}
					render={({ field }) => (
						<label className='flex cursor-pointer items-start gap-2 text-sm'>
							<input
								type='checkbox'
								className='mt-0.5 size-4 shrink-0 rounded border border-input accent-primary'
								checked={Boolean(field.value)}
								disabled={bloqueado}
								onChange={(e) => {
									const checked = e.target.checked;
									field.onChange(checked);
									if (checked) setValue("pontosDeTrocaCodigos", [], { shouldValidate: true });
								}}
							/>
							<span>Sem ponto de troca</span>
						</label>
					)}
				/>
				{carregando ? (
					<div className='h-24 animate-pulse rounded-md bg-muted' aria-hidden />
				) : (
					<Controller
						name='pontosDeTrocaCodigos'
						control={control}
						rules={{
							validate: (arr) => {
								if (getValues("semPontoDeTroca")) return true;
								const a = Array.isArray(arr) ? arr.filter((p) => p && String(p.id ?? "").trim()) : [];
								return a.length > 0 || "Selecione pelo menos um ponto de troca";
							},
						}}
						render={({ field, fieldState }) => (
							<div
								className={cn(
									"max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-3",
									semPonto && "pointer-events-none opacity-50"
								)}>
								{locaisAtivos.length === 0 ? (
									<p className='text-sm text-muted-foreground'>Sem pontos de troca disponíveis.</p>
								) : (
									locaisAtivos.map((l) => {
										const sel = (field.value ?? []).some((p) => p.id === l.cdLocalTroca);
										return (
											<label key={l.cdLocalTroca} className='flex cursor-pointer items-start gap-2 text-sm'>
												<input
													type='checkbox'
													className='mt-0.5 size-4 shrink-0 rounded border border-input accent-primary'
													checked={sel}
													disabled={bloqueado || semPonto}
													onChange={() => {
														const cur = [...(field.value ?? [])];
														const idx = cur.findIndex((p) => p.id === l.cdLocalTroca);
														if (idx >= 0) cur.splice(idx, 1);
														else cur.push(localTrocaDtoParaPontoTrocaEvento(l));
														field.onChange(cur);
													}}
												/>
												<span className='min-w-0'>{rotuloLocalDeTrocaNoSelect(l)}</span>
											</label>
										);
									})
								)}
								{fieldState.error?.message ? (
									<p className='text-xs text-destructive' role='alert'>
										{fieldState.error.message}
									</p>
								) : null}
							</div>
						)}
					/>
				)}
			</div>
		</div>
	);
}
