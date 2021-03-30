import { ResultadoBuscaPaginadaModel, RequisicaoBuscaPaginadaModel, Parametros } from './uteis.interface';
import { FornecedorImportacaoModel } from './cadastro.interface';

export interface Fornecedor {
    id: number;
    razao: string;
    cnpjCpf: string;
    titulo: string;
}

export interface Representante {
    id: number;
    razao: string;
    cnpjCpf: string;
    titulo: string;
}

export interface Comprador {
    id: number;
    razao: string;
    cnpjCpf: string;
    titulo: string;
}

export interface CondPagto {
    id: number;
    descricao: string;
    titulo: string;
}

export interface ResultadoProdutosAnaliseSugestaoCompraModel {
    tempId?: string;
    prodId: number;
    descricao: string;
    barra?: string;
    oculta?: boolean;
    alterado?: boolean;
    sazonal?: boolean;
    possuiPendenciaFornec?: boolean;
    lojas?: ProdutosAnaliseSugestaoCompraLojaModel[];
}

export interface ProdutosAnaliseSugestaoCompraLojaModel {
    prodId?: number,
    lojaId?: number,
    estoque?: number,
    qtdEmbalagem?: number,
    qtdAberto?: number;
    trocas?: number;
    qtdComprar?: number,
    valorUnitario?: number,
    valorEmbalagem?: number;
    valorVenda?: number;
    cmvAtual?: number;
    precoEntrada?: number;
    consumo?: number,
    minGondola?: number;
    maxGondola?: number;
    minDeposito?: number;
    maxDeposito?: number;
    percDesconto?: number;
    percAcrescimo?: number;
    percMargemBruta?: number;
    percMargemParam?: number;
    ultimaEntrada?: Date;
    ultimaSaida?: Date;
    ultimaCompra?: Date;
}

export interface ProdutoLojaAnaliseCompra {
    qtdComprar: number;
}

export interface RequisicaoConsultaProdutosAnaliseCompra {
    lojas: number[];
    fornecedor?: number;
    representante?: number;
    comprador?: number;
    periodoConsumo?: DateRange;
    margemSeguranca?: number;
    diasOperacionais?: number;
    opcaoPromocao?: number;
    opcaoVendas?: number;
    centroReceitaProduto?: number;
    grupoProduto?: number;
    categoriaProduto?: number;
    familiaProduto?: number;
    corredor?: string;
    descricaoProd?: string;
    somenteProdutosAtivos?: number;
    verificarProdutosEstoqueZerado?: number;
    verificarProdutosEstoqueInferiorOuIgualAoMaximo?: number;
    retirarProdutosPedidosCompra?: number;
    incluirProdutosSazonais?: number;
    naoAvaliarConsumo?: number;
    opcaoProdutosParaSugestao?: number;
}

export interface DateRange {
    startDate?: Date;
    endDate?: Date;
}

export interface RequisicaoGerarPedidoAnaliseSugestaoCompraModel {
    fornecedorId: number;
    compradorId: number;
    condPagtoId: number;
    observacoes: string;
    dataPedido: Date;
    dataValidade: Date;
    filtrosOriginais: RequisicaoConsultaProdutosAnaliseCompra;
    produtos: ResultadoProdutosAnaliseSugestaoCompraModel[];
    ccustoId: string;
    tipoDocumentoId: number;
    bancoId: string;
    operacaoFinanceiraId: number;
    parametros: Parametros[];
}


export interface RequisicaoGerarCotacaoAnaliseSugestaoCompraModel {
    fornecedorId?: number;
    produtos: ResultadoProdutosAnaliseSugestaoCompraModel[];
}

export interface RequisicaoRelatorioAnaliseSugestaoComprasModel {
    formato: number;
    produtos: ResultadoProdutosAnaliseSugestaoCompraModel[];
}

export interface RequisicaoGerarEstoqueMinimoSugestaoComprasModel {
    diasOperacionais?: number,
    margemSeguranca?: number;
    periodo?: DateRange,
    produtos: ResultadoProdutosAnaliseSugestaoCompraModel[];
}


export interface RequisicaoBuscaPedidosComprasModel {
    paginacao: RequisicaoBuscaPaginadaModel;
    filtroLojaIds: number[];
    filtroId?: number;
    filtroFornecedorId?: number;
    filtroDataInicio?: Date;
    filtroDataTermino?: Date;
    filtroSituacao?: string;
    filtroPedidosBonificados?: boolean;
}


export interface ResultadoBuscaPedidosComprasModel {
    paginacao: ResultadoBuscaPaginadaModel;
    itens: ItemBuscaPedidosComprasModel[];
    idsDeTodosOsItens: number[];
    lojas: number[];
}

export interface ItemBuscaPedidosComprasModel {
    compraId: number;
    lojaId?: number;
    compradorId?: number;
    fornecedor?: string;
    fornecedorId?: number;
    fornecedorPossuiPendencia?: boolean;
    geradoFinanceiro?: boolean;
    emailFornecedor: string;
}


export interface PedidoCompraModel {
    lojaId?: number;
    compraId: number;
    data?: Date;
    validade?: Date;
    fornecedorId?: number;
    compradorId?: number;
    condPagtoId?: number;
    acrescimo?: number;
    desconto?: number;
    contato?: string;
    obs?: string;
    meioTransporte?: string;
    valorPedido?: number;
    produtos?: ItemPedidoCompraModel[];
    gerarReajustePreco?: boolean;
}

export interface ItemPedidoCompraModel {
    prodId: number;
    descricao?: string;
    barra: string; // Não é exibido, apenas para gravar no banco de dados (compatibilidade Samb@ Forms)
    itemCompraId?: number;
    lojaId?: number;
    qtdComprar?: number;
    qtdEmbalagem?: number;
    valorUnitario?: number;
    valorEmbalagem?: number;
    valorTotal?: number;
    alterado?: boolean;
    valorVenda?: number;
    margemBruta?: number;
    cmv?: number;
}

export interface CotacaoCompraModel {
    cotacaoId: number;
    lojaId: number;
    data: Date;
    fornecedorId?: number;
    situacao?: string;
    itens: ItemCotacaoCompraModel[];
}

export interface RequisicaoObterDadosCotacaoModel {
    cotacaoId: number;
    lojaId: number;
}

export interface ItemCotacaoCompraModel {
    produtoId: number;
    descricao: string;
    barra: string;
    qtdCotacao: number;
    qtdEmbalagem: number;
    qtdComprarUnitaria: number;
    qtdComprarEmbalagem: number;
    alterado?: boolean;
}

export interface TrocaCompraModel {
    trocaId: number;
    lojaId: number;
    data: Date;
    fornecedorId: number;
    itens: ItemTrocaCompraModel[];
}

export interface ItemTrocaCompraModel {
    itemTrocaId?: number;
    trocaCompraId: number;
    produtoId: number;
    descricao: string;
    barra: string;
    quantidade: number;
    precoCusto: number;
    alterado?: boolean;
}

export interface RequisicaoBaixaPedidosComprasModel {
    compraIds: number[];
}

export interface RequisicaoBaixaTrocasComprasModel {
    trocaIds: number[];
}

export interface RequisicaoExclusaoCotacoesComprasModel {
    cotacaoIds: number[];
}

export interface RequisicaoAberturaPedidosComprasModel {
    compraIds: number[];
}

export interface RequisicaoBuscaTrocasComprasModel {
    paginacao: RequisicaoBuscaPaginadaModel;
    filtroLojaIds: number[];
    filtroId?: number;
    filtroFornecedorId?: number;
    filtroPeriodo: DateRange;
    filtroSituacao?: string;
    filtroPedidosBonificados?: boolean;
}

export interface ResultadoBuscaTrocasComprasModel {
    paginacao: ResultadoBuscaPaginadaModel;
    itens: ItemBuscaTrocasComprasModel[];
    idsDeTodosOsItens: number[];
    lojas: number[];
}

export interface ItemBuscaTrocasComprasModel {
    trocaId: number;
    lojaId: number;
    situacao: string;
    geradoFinanceiro?: number;
}

export interface RequisicaoBuscaCotacoesComprasModel {
    paginacao: RequisicaoBuscaPaginadaModel;
    filtroLojaIds: number[];
    filtroId?: number;
    filtroFornecedorId?: number;
    filtroData?: Date;
    filtroSituacao?: string;
    periodo?: DateRange; // Utilizado na Liberação de cotação Web e Avaliação de cotações
}

export interface ResultadoBuscaCotacoesComprasModel {
    paginacao: ResultadoBuscaPaginadaModel;
    itens: ItemBuscaCotacoesComprasModel[];
    idsDeTodosOsItens: number[];
    lojas: number[];
}

export interface ItemBuscaCotacoesComprasModel {
    cotacaoId: number;
    lojaId?: number;
}

export interface RequisicaoRelatorioPreviaComprasModel {
    formato: number;
    lojas: number[];
    centroReceita?: number;
    grupo?: number;
    categoria?: number;
    familia?: number;
    fornecedor?: number;
    produto?: number;
    primeiroPeriodo?: DateRange;
    segundoPeriodo?: DateRange;
    terceiroPeriodo?: DateRange;
    produtoNaoVendido?: number;
}

export interface RequisicaoRelatorioItensMaisMenosComprados {
    formato: number;
    lojas: number[];
    periodo?: DateRange;
    fornecedor?: number;
    centroReceita?: number;
    grupo?: number;
    categoria?: number;
    familia?: number;
    quantidade?: number;
    pedidoCompra?: number;
    tipoRelatorio?: number;
}

export interface RequisicaoRelatorioComprasConsumo {
    formato: number;
    lojas: number[];
    primeiroPeriodo?: DateRange;
    segundoPeriodo?: DateRange;
    terceiroPeriodo?: DateRange;
    centroReceita?: number;
    grupo?: number;
    categoria?: number;
    familia?: number;
    fornecedor?: number;
    produto?: number;
    verZerado: number;
    verMin: number;
    ordenacao: number;
}

export interface RequisicaoRelatorioComprasPeriodo {
    formato: number;
    lojas: number[];
    periodo: DateRange;
    fornecedor?: number;
    produto?: number;
    comprador?: number;
    centroReceita?: number;
    grupo?: number;
    categoria?: number;
    familia?: number;
    tipo: number;
    quebra: number;
}

export interface ResultadoBuscaLiberacoesCotacaoWebModel {
    paginacao: ResultadoBuscaPaginadaModel;
    itens: ItemBuscaLiberacoesCotacaoWebModel[];
}

export interface ItemBuscaLiberacoesCotacaoWebModel {
    cotacaoId: number;
    lojaId: number;
    razaoLoja?: string;
    data: number;
    situacao: string;
    dataValidade?: Date;
    horaValidade?: string;
    existeFornecedor?: number;
    exportadoWeb?: number;
    pedidoGerado?: number;
    recebida?: number;
}

export interface RequisicaoRelatorioItensCotacaoModel {
    formato: number;
    cotacaoId: number;
    lojaId: number;
}

export interface ItensCotacaoModel {
    cotacaoId: number;
    lojaId: number;
    data: Date;
    existeFornecedor?: number;
    situacao?: string;
    pedidoGerado?: number;
}

export interface FornecedorCotacaoModel {
    fornecedorId: number;
    cnpjCpf: string;
    razao: string;
    celular?: string;
    email?: string;
    senha?: string;
}

export interface RequisicaoBuscaFornecedorCotacaoModel {
    paginacao: RequisicaoBuscaPaginadaModel;
    cotacaoId: number; // Obrigatório
    lojaId: number; // Obrigatório
    fornecedorId?: number;
    cnpjCpf?: string;
    razao?: string;
}

export interface ResultadoBuscaFornecedorCotacaoModel {
    paginacao: ResultadoBuscaPaginadaModel;
    itens: FornecedorCotacaoModel[];
}

export interface RequisicaoReenviaSenhaCotacaoModel {
    cotacaoId: number;
    lojaId: number;
    fornecedorId?: number[];
}

export interface ResultadoReenviaSenhaCotacaoModel {
    sucesso: boolean;
    erro: string;
}

export interface RequisicaoOperacaoFornecedorCotacaoWebModel {
    cotacaoId: number;
    lojaId: number;
    dataCotacao: string;
    fornecedor?: number;
    fornecedores: FornecedorImportacaoModel[];
}

export interface ResultadoAdicionarFornecedorCotacaoWebModel {
    sucesso: boolean;
    erro: string;
}

export interface RequisicaoLiberarCotacaoWebModel {
    cotacaoId: number;
    lojaId: number;
    dataValidade: Date;
    dataCotacao: string;
    hora: string;
    enviaCusto: number;
    fornecedores: FornecedorImportacaoModel[];
}

export interface ResultadoLiberarCotacaoModel {
    sucesso: boolean;
    erro: string;
}

export interface ResultadoBuscaCotacoesAvaliaveisModel {
    paginacao: ResultadoBuscaPaginadaModel;
    itens: ItemBuscaCotacoesAvaliaveisModel[];
}

export interface ItemBuscaCotacoesAvaliaveisModel {
    cotacaoId: number;
    lojaId: number;
    razaoLoja?: string;
    data: number;
    situacao: string;
    pedidoGerado?: number;
    recebida?: number;
}

export interface RequisicaoConsultaProdutosCotacaoModel {
    paginacao: RequisicaoBuscaPaginadaModel;
    cotacaoId: number;
    lojaId: number;
    produtoId?: number;
}

export interface ResultadoConsultaProdutosCotacaoModel {
    paginacao: ResultadoBuscaPaginadaModel;
    itens: ItemEditarCotacaoModel[];
}

export interface ItemEditarCotacaoModel {
    prodId: number;
    barra?: string;
    descricao?: string;
    alterado?: boolean;
    fornecedores?: [{
        classificacao?: number;
        fornecedorId: number;
        prazoEntrega?: number;
        precoCusto?: number;
        precoEmbal?: number;
        precoUnit?: number;
        prodId: number;
        qtdComprar?: number;
        qtdEmbal?: number;
        razaoSocial?: string;
        valorTotal?: number;
        variacao?: number;
        cotaValoresId: number;
    }];
}

export interface RequisicaoCotacaoGerarPedidoModel {
    cotacaoId: number;
    lojaId: number;
    criterio: number;
    observacao?: string;
    compradorId: number;
    dataCotacao: string;
    gerarPedDataCotacao?: number;
}

export interface ResultadoCotacaoGerarPedidoModel {
    sucesso: boolean;
    erro: string;
}

export interface RequisicaoRelatorioAvaliaCotacaoModel {
    formato: number;
    cotacaoId: number;
    lojaId: number;
    taxaAplicacao?: number;
    diasIcms?: number;
    criterioAvaliacao: number;
    formaImpressao: number;
    dataCotacao?: string;
}

export interface RequisicaoImportarCotacaoModel {
    cotacaoId: number;
    lojaId: number;
    dataCotacao: string;
}

export interface ResultadoImportarCotacaoModel {
    sucesso: boolean;
    erro: string;
}

export interface RequisicaoEditarCotacaoModel {
    itens: ItemEditarCotacaoModel[];
}

export interface ResultadoEditarCotacaoModel {
    sucesso: boolean;
    erro: string;
}

export interface RequisicaoDesativarProdutosVendaModel {
    produtoIds: number[];
    lojaIds: number[];
}

export interface RequisicaoCopiarPedidoModel {
    compraId: number;
    lojaId: number;
    compradorId: number;
    fornecedorId: number;
    dataPedido: Date;
    validadePedido: Date;
}

export interface RequisicaoRelatorioPedidoCompra {
    formato: number;
    lojas: number[];
    pedidoIni?: number;
    pedidoFim?: number;
    comprador?: number;
    fornecedor?: number;
    periodoPedido: DateRange;
    periodoValidadePedido?: DateRange;
    quebraLojaPorRelatorio?: number;
    mostrarUltPrecoUnit?: number;
    mostrarPrecoCusto?: number;
    imprimirTrocas?: number;
    imprimirRecebimentoCego?: number;
}

export interface RequisicaoBuscarFornecedoresColunaModel {
    paginacao: RequisicaoBuscaPaginadaModel;
    cotacaoId: number;
    lojaId: number;
}

export interface ResultadoBuscarFornecedoresColunaModel {
    paginacao: ResultadoBuscaPaginadaModel;
    itens: CotacaoFornecedoresColunaModel[];
    listaDeFornecedores: string[];
}

export interface CotacaoFornecedoresColunaModel {
    prodId: number;
    descricao: string;
    cmv: number;
    qtdUltCompra: number;
    fornecedores?: [{
        fornecedorId: number;
        precoUnit: number;
    }];
}

export interface RequisicaoRelatorioTrocasComprasModel {
    formato: number;
    lojas: number[];
    fornecedor?: number;
    trocaIni: number,
    trocaFim: number,
    centroReceita?: number;
    grupo?: number;
    categoria?: number;
    familia?: number;
    periodoTroca: DateRange,
    opcaoTipoData: number, // 1-Data de lançamento / 2-Data da baixa
    tipoRelatorio: number, // 1-Analítico / 2-Sintético / 3-Resumido
    situacao: number, // 1-Todos / 2-Baixados / 3-Abertos
    
}

export interface RequisicaoObterInformacaoPrecosCotacoesModel {
    numeroCotacao: number;
    dataCotacao: Date;
    lojaId: number;
    fornecedorId: number;
}

export interface ResultadoObterInformacaoPrecosCotacoesModel {
    fornecInformouValores: boolean;
    senhaFornecedor: string;
    condPagtoId: number;
    prazoEntrega?: number;
    itensPagina?: ItemInformacaoPrecoCotacaoModel[];
}

export interface ItemInformacaoPrecoCotacaoModel {
    prodId: number;
    descricao?: string;
    qtdCotacao: number;
    qtdEmbal: number;
    valorUnitario: number;
    valorEmbal?: number;
    associadoFornecedor?: boolean;
    alterado?: boolean;
    itemCotacaoId: number;
    qtdTotal?: number;
    valorTotal?: number;
    precoCusto?: number;
    precoEntrada?: number;
}

export interface RequisicaoSalvarInformacaoPrecosCotacoesModel {
    numeroCotacao: number;
    dataCotacao: Date;
    lojaId: number;
    fornecedorId: number;
    condPagtoId: number;
    prazoEntrega?: number;
    itens: ItemInformacaoPrecoCotacaoModel[];
}

export interface ResultadoSalvarInformacaoPrecosCotacoesModel {
    sucesso: boolean;
    erro: string;
}

export interface RequisicaoGerarReceberTrocasModel {
    trocaIds: number[];
    ccustoId: string;
    tipoDocumentoId: number;
    bancoId: string;
    operacaoFinanceiraId: number;
    condPagtoId: number;
    parametros: Parametros[];
}

export interface RequisicaoGerarPagarPedidosModel {
    compraIds: number[];
    ccustoId: string;
    tipoDocumentoId: number;
    bancoId: string;
    operacaoFinanceiraId: number;
    parametros: Parametros[];
}

export interface RequisicaoEnviarEmailModel {
    compraIds: number[];
    lojaIds: number[];
    fornecedorId?: number;
    emails: Emails[];
    assunto: string;
    mensagem: string;
    impPrecoUnitCompra?: number;
    impCustoAtualCadastro?: number;
}

export interface Emails {
    email: string;
}