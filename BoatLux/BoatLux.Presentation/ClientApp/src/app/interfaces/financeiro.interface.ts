import { RequestSearchPaginatedModel, RequisicaoBuscaPaginadaModel, ResponseSearchPagetedModel, ResultadoBuscaPaginadaModel } from './uteis.interface';
import { DateRange } from './compras.interface';

/*
 * Cadastros
 */
export interface Costs {
    costId: number;
    description: string;
    type: number;
    typeDescription: string;
    status: number;
}

export interface RequestSearchCosts {
    pagination: RequestSearchPaginatedModel,
    costId: number,
    description: string,
    costType: number,
}

export interface ResponseSearchCosts {
    paginacao: ResponseSearchPagetedModel,
    items: Costs[]
}

export interface RequestAddCost {
    costDescription: string;
    costType: number;
}

/*
 CONTAS PAGAR
 */

export interface ContasPagarModel {
    codPagarId: number;
    numTit: string;
    numCheque: string;
    nota: string;
    codCCustoId: number;
    codBancoId: number;
    codContaId: number;
    codLojaId?: number;
    razao?: string;
    fantasia?: string;
    dtEmissao?: Date;
    dtVencto?: Date;
    dtPagto?: Date;
    dtEntrada?: Date;
    dtCancela?: Date;
    valor?: number;
    codTipoDocId?: number;
    descrTipoDocto?: string;
    observacao: string;
    valorPago?: number;
    parcela?: string;
    situacao?: string;
    codFornecId?: number;
    codOperacaoFinanceiraId?: number;
    desconto?: number;
    tipoDesconto?: number;
    juros?: number;
    tipoJuros?: number;
    multa?: number;
    tipoMulta?: number;
    valorPagar?: number;
}

export interface RequisicaoBuscaTitulosPagarModel {
    paginacao: RequisicaoBuscaPaginadaModel;
    lojas?: number[];
    codFornecId: number;
    codTipoDocId?: number;
    nota?: string;
    situacao?: string;
    opcaoTipoData: number;
    periodo?: DateRange;
    codPagarId?: number;
    numTit?: string;
    parcela?: string;
    valor?: number;
    numCheque?: string;
}

export interface ResultadoBuscaTitulosPagarModel {
    paginacao: ResultadoBuscaPaginadaModel,
    itens: ContasPagarModel[];
}

export interface RequisicaoSalvarContasPagarModel {
    parcela: string;
    valTitulosProvisionados?: number; // Títulos parcelas com valor integral (1) ou parcial (2)
    dtEntradaIgualDtVencto?: number;
    item: ContasPagarModel;
}

export interface ResultadoBuscaTitulosPagarEmAbertoModel {
    paginacao: ResultadoBuscaPaginadaModel,
    itens: ContasPagarModel[];
    totais: {
        totalTitulos: number;
    };
}

export interface RequisicaoBaixarPagarMultiplosModel {
    pagarIds: number[];
    contaId: number;
    data: Date;
    numDocto?: string;
    operacaoFinanceiraId?: number;
    formaPgId?: number;
}

export interface RequisicaoBaixarPagarIndividualModel {
    pagarId: number;
    valorPago: number;
    dataPagto: Date;
    contaId: number;
    formaPgId?: number;
    operacaoFinanceiraId?: number;
    nota?: string;
    observacao?: string;
}

export interface RequisicaoCancelaContasPagarModel {
    pagarIds: number[];
    motivoCancelamento?: string;
}

export interface RequisicaoRelatorioContasPagarModel {
    formato: number;
    lojaIds: number[];
    tipoData: number;
    periodo: DateRange;
    fornecedorId: number;
    bancoId: string;
    tipoDocumentoId: number;
    operacaoFinanceiraId: number;
    ccustoId: string;
    contaId: number;
    tipoFornecedorId?: number;
    numTit?: string;
    parcela: string;
    nota: string;
    numCheque: string;
    situacao: string;
    quebra: number;
    tipoDados: number;
}

export interface RequisicaoFichaPagamentoModel {
    formato: number;
    lojaIds: number[];
    tipoData?: number;
    periodo?: DateRange;
    fornecedorId?: number;
    bancoId?: string;
    tipoDocumentoId?: number;
    operacaoFinanceiraId?: number;
    ccustoId?: string;
    contaId?: number;
    tipoFornecedorId?: number;
    numTit?: string;
    parcela?: string;
    nota?: string;
    numCheque?: string;
    pagarIds?: number[];
    impObs?: number;
}

export interface RequisicaoComprovantePagarModel {
    pagarIds: number[];
    lojaId?: number;
    fornecedorIds: number[];
}

export interface RequisicaoLiberaBloqueiaPagarModel {
    pagarIds: number[];
    liberaBloqueia: number; // 0 - Bloqueia / 1 - Libera 
}

export interface RequisicaoEstornoPagarModel {
    pagarIds: number[];
    dataMovConta: number; // 1 - Data da Baixa / 2 - Data atual
}

/*
 CONTAS RECEBER
 */

export interface ContasReceberModel {
    receberId: number;
    numTit: string;
    notaEcf: string;
    razao: string;
    fantasia: string;
    codLojaId?: number;
    dtEmissao?: Date;
    dtVencto?: Date;
    dtPagto?: Date;
    dtVenctoOriginal?: Date;
    codLanctoPdv: string;
    parcela: string;
    situacao: string;
    codClieId?: number;
    perJuros?: number;
    carencia?: number;
    carenciaJuros?: number;
    codTipoDocumentoId?: number;
    venceHoje: boolean;
    codNf?: number;
    valorJuros?: number;
    valorMulta?: number;
    valorDesconto?: number;
    valor?: number;
    valorReceber?: number;
    // Campos usados no grid da baixa por valor
    baixaIntegral?: boolean;
    baixaParcial?: boolean;
    valorBaixa?: number;
    dataDeVencimento?: string; // Formatada em YYYY-MM-DD
    cCustoId?: string;
    descrCCusto?: string;
    observacao?: string;
    numBoleto?: number;
}

export interface TituloReceberModel {
    codReceberId: number;
    codLojaId: number;
    numTit: string;
    notaEcf?: string;
    codClieId?: number;
    codTipoDocumentoId?: number;
    codOperacaoFinanceiraId?: number;
    codBancoId?: any;
    codCentroCustoId?: any;
    codVendedorId?: number;
    agencia?: string;
    contaCorrente?: string;
    numCheque?: string;
    dtEmissao?: Date;
    dtVencto?: Date;
    valor: number;
    situacaoDocto?: number;
    carenciaJuros?: number;
    carencia?: number; // Carencia multa
    desconto?: number;
    tipoDesconto?: number;
    juros?: number;
    tipoJuros?: number;
    multa?: number;
    tipoMulta?: number;
    observacao?: string;
    valorReceber?: number;
    parcela?: string;
    situacao?: string;
}


export interface RequisicaoBuscaTitulosReceberModel {
    paginacao: RequisicaoBuscaPaginadaModel;
    receberId?: number;
    lojas?: number[];
    numTit: string;
    parcela: string;
    notaEcf: string;
    opcaoTipoData?: number;
    periodo?: DateRange;
    valor?: number;
    cheque: string;
    codClieId?: number;
    tipoClienteId?: number;
    tipoDocumentoId?: number;
    situacao?: string;
    situacaoPromissoria?: number;
    situacaoCarnes?: number;
    situacaoBoletos?: number;
    vendedorId?: number;
}

export interface ResultadoBuscaTitulosReceberModel {
    paginacao: ResultadoBuscaPaginadaModel,
    itens: ContasReceberModel[];
}

export interface RequisicaoCancelaTitulosReceberModel {
    receberId: number[];
}

export interface RequisicaoCancelaTituloReceberModel {
    receberId: number;
    situacao?: string;
}

export interface ResultadoCancelaTitulosReceberModel {
    sucesso: boolean;
    erro: string;
}

export interface RequisicaoAtribuirInformacoesTitulosModel {
    receberId: number[];
    dtVencto?: Date;
    codCCustoId?: string;
    codTipoDocumentoId?: number;
    codVendedorId?: number;
    situacao: string[];
    juros?: number;
    atribJuros?: number;
}

export interface ResultadoAtribuirInformacoesReceberModel {
    sucesso: boolean;
    erro: string;
}

export interface RequisicaoSalvarContasReceberModel {
    parcela: string;
    valTitulosProvisionados?: number; // Títulos parcelas com valor integral (1) ou parcial (2)
    dtEmissaoIgualDtVencto?: number;
    item: TituloReceberModel;
    idsTitulosAgrupados?: number[];
}

export interface ResultadoSalvarContasReceberModel {
    idsReceber: number[];
}

export interface TituloBuscaContasReceberModel {
    receberId: number;
    situacao?: string;
}

export interface RequisicaoCupomNfReceberModel {
    receberId: number;
    lojaId: number;
    tipoConsulta: number;
    codNf: number;
}

export interface ResultadoCupomNfReceberModel {
    cupomNf: string;
    lojaId: number;
    clienteId: string;
    data: Date;
    caixaId: number;
    sequencial?: number;
    operador?: string;
    condPagto: string;
    valorTotal: number;
    troco?: number;
    hora: string;
    itens: ItemCupomNfReceberModel[];
    formaPagamento: FormaPagamentoModel[];
}

export interface ItemCupomNfReceberModel {
    produtoId: number;
    barra: string;
    descricao: string;
    qtd: number;
    valorUnit: number;
    valorTotal: number;
    baseIcms: number;
    valorIcms: number;
}

export interface FormaPagamentoModel {
    condPagto: string;
}

export interface RequisicaoRelatorioNotasPromissoriasModel {
    formato: number;
    lojaId: number;
    receberIds: number[];
}

export interface RequisicaoRelatorioCarnesModel {
    formato: number;
    lojaId: number;
    receberIds: number[];
}

export interface RequisicaoComprovanteReceberModel {
    receberIds: number[];
    lojaId: number;
    clienteIds: number[];
}

export interface ResultadoComprovanteModel {
    comprovantes: ComprovanteModel[];
}

export interface ComprovanteModel {
    razao: string;
    endereco: string;
    cidade: string;
    estado: string;
    fone: string;
    dataHora: string;
    usuario: string;
    cliente: string;
    fornecedor: string;
    formaPagto: string;
    totalTitulos: number;
    encargos: number;
    totalPago: number;
    totalPagar: number;
    titulo: TitulosComprovanteModel[];
    titulosAbertos: TitulosAbertosComprovanteModel[];
}

export interface TitulosComprovanteModel {
    numTit: string;
    dtEmissao: Date;
    valor: number;
    observacao: string;
}

export interface TitulosAbertosComprovanteModel {
    numtit: string;
    dtVencto: Date;
    valor: number;
}

export interface RequisicaoRelatorioContasReceberModel {
    formato: number;
    lojasId: number[];
    tipoData: number;
    periodo: DateRange;
    clienteId: number;
    bancoId: string;
    tipoDocumentoId: number;
    operacaoFinanceiraId: number;
    ccustoId: string;
    contaId: number;
    vendedorId?: number;
    vendedor: string;
    situacao?: string;
    numtitulo?: string;
    parcela: string;
    quebra: number;
    tipoDados: number;
    ordenacaoClientes: number;
    impPorPagina?: number;
    tipoClienteId?: number;
}

export interface RequisicaBuscarTitulosClienteModel {
    paginacao: RequisicaoBuscaPaginadaModel;
    lojasId: number[],
    clienteId: number;
    tipoData: number;
    periodo?: DateRange;
    incTitulosDependentes?: number;
    vendedorId?: number;
}

export interface ResultadoBuscarTitulosClienteModel {
    paginacao: ResultadoBuscaPaginadaModel;
    itens: TitulosClienteModel[];
    idsDeTodosOsItens: number[];
}

export interface TitulosClienteModel {
    receberId: number;
    lojaId: number;
    parcela: number;
    clienteId: number;
    razao: string;
    dtEmissao: Date;
    dtVencto: Date;
    valor: number;
    valorJuros?: number;
    valorMulta?: number;
    ccustoId?: string;
    descrCCusto?: string;
    observacao: string;
}

export interface ResultadoBuscaTitulosReceberEmAbertoModel {
    paginacao: ResultadoBuscaPaginadaModel,
    itens: ContasReceberModel[];
    totais: TotaisReceberModel;
}

export interface TotaisReceberModel {
    totalTitulos?: number;
    totalJuros?: number;
    totalMulta?: number;
    totalDesconto?: number;
    valorReceber?: number;
    limiteCred?: number;
    saldoClie?: number;
}

export interface RequisicaoBaixarReceberMultiplosModel {
    receberIds: number[];
    contaId: number;
    data: Date;
    numDocto?: string;
    operacaoFinanceiraId?: number;
    formaPgId?: number;
    desconto?: number;
    acrescimo?: number;
    tipoDesconto?: number;
    tipoAcrescimo?: number;
}

export interface RequisicaoBaixarReceberIndividualModel {
    receberId: number;
    valorPago: number;
    dataPagto: Date;
    contaId: number;
    formaPgId?: number;
    operacaoFinanceiraId?: number;
    numDocto?: string;
    observacao?: string;
    despCartorio?: number;
    outrasDesp?: number;
}

export interface RequisicaoBaixarReceberPorValorModel {
    valorRecebido: number;
    dataPagto: Date;
    contaId: number;
    formaPgId?: number;
    operacaoFinanceiraId?: number;
    numDocto?: string;
    formaVencto?: number; // 1-Data Vencto Título Baixado / 2- Data Atual da Baixa
    desconto?: number;
    acrescimo?: number;
    tipoDesconto?: number;
    tipoAcrescimo?: number;
    titulos: TitulosBaixaPorValorModel[];
}

export interface TitulosBaixaPorValorModel {
    receberId: number;
    baixaIntegral: boolean;
    baixaParcial: boolean;
    valorBaixa: number;
    valorReceber: number;
}

export interface ResultadoBaixaContasReceberModel {
    clienteId?: number;
    emDebito?: boolean;
}

export interface RequisicaoEstornoReceberModel {
    receberIds: number[];
    dataMovConta: number; // 1 - Data da Baixa / 2 - Data atual
}

export interface RequisicaoGerarBoletoModel {
    receberId?: number;
    lojaId?: number;
    bancoId?: string;
    tokenLoja?: string;
}
export interface ResultadoRemessaBoletoModel {
    remessa: string;
}
/*
 * Operações Bancárias 
 */
export interface RequisicaoBuscaMovimentacaoBancariaModel {
    paginacao: RequisicaoBuscaPaginadaModel,
    lojaIds: number[];
    periodo?: DateRange;
    id?: number;
    contaCreditoId?: number;
    contaDebitoId?: number;
    tipoLancto?: number; // 1 - Crédito / 2 - Débito
}

export interface ResultadoBuscaMovimentacaoBancariaModel {
    paginacao: ResultadoBuscaPaginadaModel,
    itens: OperacaoBancariaModel[];
}

export interface OperacaoBancariaModel {
    lojaId: number;
    id: number;
    contaId: number;
    descrConta: string;
    numConta?: string;
    contaTransfId?: number;
    descrContaTransf?: number;
    data: Date;
    valor?: number;
    dc?: string;
    historico?: string;
}

export interface RequisicaoCadastroOperacaoBancariaModel {
    tipoOperacao: number; //1 - Movimentação / 2 - Transferência
    lojaId: number;
    data: Date;
    valor: number;
    cCustoId?: string;
    contaCreditoId?: number;
    contaDebitoId?: number;
    contaId?: number;
    tipoLancto?: number; // 1 - Crédito / 2 - Débito
    refEmprestimo?: number;
    historico: string;
}

export interface RequisicaoRelExtratoBancarioModel {
    formato: number;
    lojaIds: number[];
    tipoData: number;
    periodo: DateRange;
    contaId: number;
    saldoInicial: number;
    tipoDados: number; // 1 - Analítico / 2 - Sintético / 3 - Resumido /4 - Apenas Receber
    lancamentos: number; // 1 - Não Conciliados / 2 - Conciliados 
    ordemImpressao: number; // 1 - Histórico / 2 - Documento
}

/*
 * Operações Bancárias
 */
export interface RequisicaoRelFluxoCaixaModel {
    formato: number;
    lojaIds: number[];
    tipoData: number;
    periodo: DateRange;
    contaId: number;
    saldoInicial: number;
    tipoDados: number; // 1 - Analítico / 2 - Sintético / 3 - Resumido
    incluirVencidos: number;
    incluirObservacao: number;
}