import { Button } from "@/components/base/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/base/dialog";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { Select } from "@/components/base/select";
import { Textarea } from "@/components/base/textarea";
import type { LocalTrocaDto, LocalTrocaSalvarPayload } from "@/features/eventos/types";
import { useEffect, useState } from "react";

type Modo = "novo" | "editar";

type DialogoLocalTrocaProps = {
	aberto: boolean;
	onOpenChange: (aberto: boolean) => void;
	modo: Modo;
	registro: LocalTrocaDto | null;
	onSalvar: (payload: LocalTrocaSalvarPayload) => void | Promise<void>;
	salvando?: boolean;
};

const estadoInicial: LocalTrocaSalvarPayload = {
	nome: "",
	endereco: "",
	ativo: true,
};

export function DialogoLocalTroca({
	aberto,
	onOpenChange,
	modo,
	registro,
	onSalvar,
	salvando = false,
}: DialogoLocalTrocaProps) {
	const [valores, setValores] = useState<LocalTrocaSalvarPayload>(estadoInicial);

	useEffect(() => {
		if (!aberto) return;
		if (modo === "editar" && registro) {
			setValores({
				nome: registro.nome,
				endereco: registro.endereco,
				ativo: registro.ativo,
			});
		} else {
			setValores(estadoInicial);
		}
	}, [aberto, modo, registro]);

	const titulo = modo === "novo" ? "Novo local de troca" : "Editar local de troca";

	const submeter = (e: React.FormEvent) => {
		e.preventDefault();
		const nome = valores.nome.trim();
		const endereco = valores.endereco.trim();
		if (!nome || !endereco) return;
		void onSalvar({ ...valores, nome, endereco });
	};

	return (
		<Dialog open={aberto} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<form onSubmit={submeter}>
					<DialogHeader>
						<DialogTitle>{titulo}</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="local-troca-nome">Nome</Label>
							<Input
								id="local-troca-nome"
								value={valores.nome}
								onChange={(ev) => setValores((v) => ({ ...v, nome: ev.target.value }))}
								placeholder="Nome do local"
								autoComplete="off"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="local-troca-endereco">Endereço</Label>
							<Textarea
								id="local-troca-endereco"
								value={valores.endereco}
								onChange={(ev) => setValores((v) => ({ ...v, endereco: ev.target.value }))}
								placeholder="Endereço completo"
								rows={3}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="local-troca-ativo">Ativo</Label>
							<Select
								triggerId="local-troca-ativo"
								value={valores.ativo ? "sim" : "nao"}
								onValueChange={(v) => setValores((prev) => ({ ...prev, ativo: v === "sim" }))}
								options={[
									{ value: "sim", label: "Sim" },
									{ value: "nao", label: "Não" },
								]}
							/>
						</div>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={salvando}>
							Cancelar
						</Button>
						<Button type="submit" disabled={salvando || !valores.nome.trim() || !valores.endereco.trim()}>
							{salvando ? "Salvando…" : "Salvar"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
