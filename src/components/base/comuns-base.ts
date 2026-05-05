/**
 * Reexportações dos blocos base (endereço/CEP, anexos, histórico, status) para import único.
 *
 * @example
 * import { FormularioEndereco, ListaAnexos, DialogoHistorico } from '@/components/base/comuns-base';
 */

export { DialogoHistorico } from './dialogo-historico';
export { DialogoUploadAnexo } from './dialogo-upload-anexo';
export {
	ENDERECO_VAZIO_PADRAO,
	FormularioEndereco,
	type ValorFormularioEndereco,
} from './formulario-endereco';
export { ListaAnexos } from './lista-anexos';
export { ModalVisualizadorAnexo } from './modal-visualizador-anexo';
export { StatusBadgeVeiculoRemovido } from './status-badge-veiculo-removido';
export { UploadArquivos, type AnexoEmUpload } from './upload-arquivos';
