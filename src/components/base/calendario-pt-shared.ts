/** Constantes partilhadas pelos seletores de data/hora em português. */

export const DIAS_SEMANA_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const MESES_PT = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];

export const ITEM_ALTURA_ROLO = 36;

export function obterDiasDoMes(ano: number, mes: number): (number | null)[] {
	const primeiroDia = new Date(ano, mes, 1).getDay();
	const totalDias = new Date(ano, mes + 1, 0).getDate();
	const dias: (number | null)[] = Array(primeiroDia).fill(null);
	for (let i = 1; i <= totalDias; i++) dias.push(i);
	return dias;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** `YYYY-MM-DD` válido ou string vazia. */
export function paraYmdLocal(d: Date): string {
	const y = d.getFullYear();
	const m = pad2(d.getMonth() + 1);
	const day = pad2(d.getDate());
	return `${y}-${m}-${day}`;
}

export function parseYmdParaDate(ymd: string): Date | null {
	if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd.trim())) return null;
	const [y, m, d] = ymd.split("-").map(Number);
	const dt = new Date(y, m - 1, d);
	if (Number.isNaN(dt.getTime())) return null;
	return dt;
}

/** Compara `HH:mm` ou `H:mm` (24h). */
export function compararHm(a: string, b: string): number {
	const paraMinutos = (s: string) => {
		const m = (s ?? "").trim().match(/^(\d{1,2}):(\d{2})/);
		if (!m) return 0;
		return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
	};
	const ma = paraMinutos(a);
	const mb = paraMinutos(b);
	if (ma < mb) return -1;
	if (ma > mb) return 1;
	return 0;
}

/** Hora local atual arredondada ao minuto (`HH:mm`). */
export function horaMinimaLocalAgora(): string {
	const n = new Date();
	return `${pad2(n.getHours())}:${pad2(n.getMinutes())}`;
}

/** Se `inicio` ≥ 18:00, devolve `inicio` + 1 h; caso contrário 18:00 (nunca antes de `inicio`). */
export function horaFimPadraoAposInicio(inicio: string): string {
	if (compararHm(inicio, "18:00") < 0) return "18:00";
	const m = (inicio ?? "").trim().match(/^(\d{1,2}):(\d{2})/);
	if (!m) return "18:00";
	let total = parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + 60;
	if (total >= 24 * 60) return "23:59";
	return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}
