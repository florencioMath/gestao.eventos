/** Usuário associado a um evento de histórico. */
interface HistoricoUsuario {
	nome: string;
	email: string;
	perfil: string;
}

/** Ação registrada no histórico (alinhado ao retorno típico do backend). */
interface HistoricoAcao {
	status: string;
	descricao: string;
}

/**
 * Item retornado pelo GET de histórico (ex.: auditoria de protocolo / solicitação).
 */
interface HistoricoItem {
	visivelAoSolicitante: boolean;
	usuario: HistoricoUsuario;
	acao: HistoricoAcao;
	data: string;
}
