import { RequisicaoBuscaPaginadaModel, ResultadoBuscaPaginadaModel } from "./uteis.interface";
import { DateRange } from './compras.interface';

export interface OperacaoFinanceiraModel {
    id?: number;
    descricao: string;
}

export interface RequisicaoPadraoResumoProdutoModel {
    produtoId: number,
    lojas?: number[]
}

export interface RequisicaoBuscaProdutosImportacaoModel {
    filtroId?: number;
    filtroDescricao?: string;
    lojas?: number[];
    filtroBarra: string;
    somenteProdutosFornecedor?: number;
    fornecedorId?: number;
}

export interface ResultadoResumoCategoriaProdutoModel {
    produtos: ResumoCategoriaProdutoModel[],
    categoria: CategoriaModel,
}

export interface ResumoCategoriaProdutoModel {
    produtoId: string;
    descricao: string;
    estoque: string;
    precoCusto: string;
}

export interface ResultadoResumoComprasProdutoModel {
    compras: ResumoCompraProdutoModel[],
}

export interface ResumoCompraProdutoModel {
    fornecedorId: string;
    razaoFornecedor: string;
    data: string;
    quantidade: string;
    qtdEmbalagem: string;
    precoUnitario: string;
    lucroLiquido: string;
    custoProduto: string;
    custoPmz: string;
    desconto: string;
}


export interface CategoriaModel {
    id: number;
    descricao: string;
}

export interface ResultadoResumoVendasProdutoModel {
    diarias: ResumoVendaDiariaProdutoModel[],
    semanais: ResumoVendaSemanalProdutoModel[],
    mensais: ResumoVendaMensalProdutoModel[]
}

export interface ResumoVendaDiariaProdutoModel {
    data: string;
    qtdTotal: string;
    valorTotal: string;
    percVariacao: string;
}

export interface ResumoVendaSemanalProdutoModel {
    inicio: string;
    termino: string;
    qtdTotal: string;
    valorTotal: string;
    percVariacao: string;
}

export interface ResumoVendaMensalProdutoModel {
    mesAno: string;
    qtdTotal: string;
    valorTotal: string;
    percVariacao: string;
}

export interface ResultadoResumoEntradasNfProdutoModel {
    entradas: ResumoEntradaNfProdutoModel[],
}

export interface ResumoEntradaNfProdutoModel {
    lojaId: string;
    fornecId: string;
    numNota: string;
    dataEntrada: string;
    chaveAcesso: string;
    qtdEmbalagem: string;
    precoUnitario: string;
    custoPmz: string;
    qtdNota: string;
    desconto: string;
    lucroLiquido: string;
    custoProd: string;
}

export interface ResultadoResumoFamiliaPrecosModel {
    id: number;
    descricao: string;
    itens: ResumoItensFamiliaPrecosModel[],
}

export interface ResumoItensFamiliaPrecosModel {
    produtoId: number;
    barra: string;
    descricaoPdv: string;
    estoque: number;
    precoCusto: number;
    precoVenda: number;
}

export interface ResultadoResumoAlteracoesPrecosModel {
    reajustes: ResumoAlteracoesPrecosModel[],
}

export interface ResumoAlteracoesPrecosModel {
    formaVendaId: number;
    descricao: string;
    data: Date;
    precoAnterior: number;
    precoNovo: number;
    custoAnterior: number;
    custoNovo: number;
    usuario: string;
}

export interface RequisicaoBuscaOperacaoFinanceiraModel {
    filtroId?: number;
    filtroDescricao?: string;
}

export interface ResultadoBuscaOperacaoFinanceiraModel {
    itens: OperacaoFinanceiraModel[];
}

export interface RequisicaoSalvarOperacaoFinanceiraModel {
    item: OperacaoFinanceiraModel;
}

export interface ResultadoSalvarOperacaoFinanceiraModel {
    id: number;
}

export interface RequisicaoApagarOperacaoFinanceiraModel {
    id: number;
}

export interface ResultadoApagarOperacaoFinanceiraModel {
    sucesso: boolean;
    erro: string;
}

export interface TipoDocumentoModel {
    id?: number;
    descricao: string;
}

export interface RequisicaoBuscaTipoDocumentoModel {
    filtroId?: number;
    filtroDescricao?: string;
}

export interface ResultadoBuscaTipoDocumentoModel {
    itens: TipoDocumentoModel[];
}

export interface RequisicaoSalvarTipoDocumentoModel {
    item: TipoDocumentoModel;
}

export interface ResultadoSalvarTipoDocumentoModel {
    id: number;
}

export interface RequisicaoApagarTipoDocumentoModel {
    id: number;
}

export interface ResultadoBuscaProdutosImportacaoModel {
    itens: ProdutoImportacaoModel[];
}

export interface ProdutoImportacaoModel {
    prodId: number;
    descricao: string;
    barra: string;
    itens?: [{
        prodId: number,
        lojaId: number;
        quantidade: number;
        qtdEmbalagem?: number;
        precoCusto?: number;
        precoVenda?: number;
        precoEntrada?: number;
        unidade?: string
        ultimaEntrada?: Date;
        ultimaSaida?: Date;
        ultimaCompra?: Date;
        consumo?: number;
        qtdEntrada?: number;
        estoque?: number;
        minDeposito?: number;
        maxDeposito?: number;
        minGondola?: number;
        maxGondola?: number;
        percMargemBruta?: number;
        percMargemParam?: number;
        trocas?: number;
        qtdAberto?: number;
    }];
}

export interface ResultadoApagarTipoDocumentoModel {
    sucesso: boolean;
    erro: string;
}

export interface RequisicaoRelatorioFinanceiroOperacoesFinanceirasModel {
    formato: number,
    busca: RequisicaoBuscaOperacaoFinanceiraModel
}

export interface RequisicaoRelatorioFinanceiroTiposDocumentoModel {
    formato: number,
    busca: RequisicaoBuscaTipoDocumentoModel
}

export interface FornecedorImportacaoModel {
    fornecedorId: number;
    razao: string;
    email?: string;
    celular?: string;
    contatoId?: number;
    contato?: string;
}

export interface RequisicaoBuscaFornecedoresImportacaoModel {
    paginacao: RequisicaoBuscaPaginadaModel;
    fornecedorId?: number;
    razao?: string;
    cnpjCpf?: string;
    tipoFornecedor?: number;
}

export interface ResultadoBuscaFornecedoresImportacaoModel {
    paginacao: ResultadoBuscaPaginadaModel;
    itens: FornecedorImportacaoModel[];
}

export interface RequisicaoAssociarProdutoFornecedorModel {
    prodId: number;
    fornecedorId: number;
    fabricante?: number;
    enviarDadosBalanca?: number;
    codRef?: string;
}

export interface RequisicaoDesassociarProdutosFornecedorModel {
    prodIds: number[];
    fornecedorId: number;
}

export interface RequisicaoClassificarEstrutaMercModel {
    produtoIds: number[];
    centroReceitaProduto: number;
    grupoProduto: number;
    categoriaProduto: number;
    familiaProduto: number;
}

export interface PendenciaFornecedorModel {
    pendenciaId: number;
    fornecedorId: number;
    data: Date;
    descricao: string;
    valor?: number;
    situacao: string;
}

export interface RequisicaoBuscaPendenciasFornecedorModel {
    paginacao: RequisicaoBuscaPaginadaModel;
    fornecedorId: number;
    pendenciaId?: number;
    periodo?: DateRange;
    situacao: string;
}

export interface ResultadoBuscaPendenciasFornecedorModel {
    paginacao: ResultadoBuscaPaginadaModel;
    itens: PendenciaFornecedorModel[];
}

export interface RequisicaoGravarLogSenhaFornecedorModel {
    lojaId: number;
    fornecedorId: number;
    senha: string;
}