import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Fornecedor, ResultadoProdutosAnaliseSugestaoCompraModel, Comprador, Representante, RequisicaoConsultaProdutosAnaliseCompra, CondPagto, RequisicaoGerarCotacaoAnaliseSugestaoCompraModel, RequisicaoRelatorioAnaliseSugestaoComprasModel, RequisicaoBuscaPedidosComprasModel, ResultadoBuscaPedidosComprasModel, RequisicaoGerarPedidoAnaliseSugestaoCompraModel, PedidoCompraModel, RequisicaoBaixaPedidosComprasModel, RequisicaoAberturaPedidosComprasModel, ResultadoBuscaTrocasComprasModel, RequisicaoBuscaTrocasComprasModel, ResultadoBuscaCotacoesComprasModel, RequisicaoBuscaCotacoesComprasModel, CotacaoCompraModel, RequisicaoExclusaoCotacoesComprasModel, TrocaCompraModel, RequisicaoRelatorioPreviaComprasModel, RequisicaoRelatorioItensMaisMenosComprados, RequisicaoRelatorioComprasConsumo, RequisicaoRelatorioComprasPeriodo, ResultadoBuscaLiberacoesCotacaoWebModel, RequisicaoRelatorioItensCotacaoModel, RequisicaoBuscaFornecedorCotacaoModel, ResultadoBuscaFornecedorCotacaoModel, RequisicaoReenviaSenhaCotacaoModel, ResultadoReenviaSenhaCotacaoModel, RequisicaoLiberarCotacaoWebModel, ResultadoLiberarCotacaoModel, ResultadoBuscaCotacoesAvaliaveisModel, RequisicaoConsultaProdutosCotacaoModel, ResultadoConsultaProdutosCotacaoModel, RequisicaoCotacaoGerarPedidoModel, ResultadoCotacaoGerarPedidoModel, RequisicaoRelatorioAvaliaCotacaoModel, RequisicaoImportarCotacaoModel, ResultadoImportarCotacaoModel, RequisicaoEditarCotacaoModel, ResultadoEditarCotacaoModel, RequisicaoDesativarProdutosVendaModel, RequisicaoGerarEstoqueMinimoSugestaoComprasModel, RequisicaoCopiarPedidoModel, RequisicaoRelatorioPedidoCompra, ResultadoAdicionarFornecedorCotacaoWebModel, RequisicaoOperacaoFornecedorCotacaoWebModel, RequisicaoBaixaTrocasComprasModel, RequisicaoBuscarFornecedoresColunaModel, ResultadoBuscarFornecedoresColunaModel, RequisicaoRelatorioTrocasComprasModel, RequisicaoObterInformacaoPrecosCotacoesModel, ResultadoObterInformacaoPrecosCotacoesModel, RequisicaoSalvarInformacaoPrecosCotacoesModel, ResultadoSalvarInformacaoPrecosCotacoesModel, RequisicaoGerarReceberTrocasModel, RequisicaoGerarPagarPedidosModel, RequisicaoEnviarEmailModel, RequisicaoObterDadosCotacaoModel } from '../interfaces/compras.interface';
import { LocalStorageService } from './local-storage.service';
import { RelatorioService } from './relatorio.service';
import { EndpointService } from './endpoint.service';

@Injectable({
    providedIn: 'root'
})
export class ComprasService {
    constructor(
        private _http: HttpClient,
        private _localStorageService: LocalStorageService,
        private _relatorioService: RelatorioService,
        private _endpointService: EndpointService) { }

    private _obterHeaders(): any {
        let loginData = this._localStorageService.get("loginData");
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + loginData.token
        };
    }

    obterProdutosAnaliseCompras(requisicao: RequisicaoConsultaProdutosAnaliseCompra): Observable<ResultadoProdutosAnaliseSugestaoCompraModel[]> {
        let url = this._endpointService.obterUrlRestService('compras/analiseSugestaoCompra/obterProdutos');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoProdutosAnaliseSugestaoCompraModel[]>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    gerarPedidoCompraAnaliseSugestao(requisicao: RequisicaoGerarPedidoAnaliseSugestaoCompraModel): Observable<void> {
        let url = this._endpointService.obterUrlRestService('compras/analiseSugestaoCompra/gerarPedido');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<void>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    gerarCotacaoCompraAnaliseSugestao(requisicao: RequisicaoGerarCotacaoAnaliseSugestaoCompraModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('compras/analiseSugestaoCompra/gerarCotacao');
        let data = JSON.stringify(requisicao);
        return this._http
            .post<number>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    gerarEstoqueMinimoAnaliseSugestao(requisicao: RequisicaoGerarEstoqueMinimoSugestaoComprasModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('compras/analiseSugestaoCompra/gerarEstoqueMinimo');
        let data = JSON.stringify(requisicao);
        return this._http
            .post<number>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    obterDadosDashboard(): Observable<any> {

        let url = this._endpointService.obterUrlRestService('compras/dashboard/obterDados');
        return this._http
            .post<any>(url, '', {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    gerarRelatorioAnaliseSugestaoCompras(requisicao: RequisicaoRelatorioAnaliseSugestaoComprasModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'compras/analiseSugestaoCompra/relatorio', nome, visualizar);
    }

    gerarRelatorioPreviaCompras(requisicao: RequisicaoRelatorioPreviaComprasModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'compras/previacompras/relatorio', nome, visualizar);
    }

    gerarRelatorioItensMaisMenosComprados(requisicao: RequisicaoRelatorioItensMaisMenosComprados, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'compras/relatorios/itensmaismenoscomprados', nome, visualizar);
    }

    gerarRelatorioComprasConsumo(requisicao: RequisicaoRelatorioComprasConsumo, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'compras/relatorios/comprasconsumo', nome, visualizar);
    }

    gerarRelatorioComprasPeriodo(requisicao: RequisicaoRelatorioComprasPeriodo, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'compras/relatorios/comprasperiodo', nome, visualizar);
    }

    gerarRelatorioItensCotacao(requisicao: RequisicaoRelatorioItensCotacaoModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'compras/liberacoesCotacaoWeb/itenscotacao', nome, visualizar);
    }

    gerarRelatorioAvaliaCotacao(requisicao: RequisicaoRelatorioAvaliaCotacaoModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'compras/avaliacaoCotacoes/relatorioavaliacotacao', nome, visualizar);
    }

    buscarPedidosCompras(requisicao: RequisicaoBuscaPedidosComprasModel): Observable<ResultadoBuscaPedidosComprasModel> {
        let url = this._endpointService.obterUrlRestService('compras/pedidosCompras/buscar');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoBuscaPedidosComprasModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    apagarPedidoCompra(id: number, codUsuario: number): Observable<void> {
        let url = this._endpointService.obterUrlRestService('compras/pedidosCompras/excluir/' + id + "/" + codUsuario);
        return this._http
            .delete<void>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    apagarItemPedidoCompra(id: number): Observable<void> {
        let url = this._endpointService.obterUrlRestService('compras/pedidosCompras/excluirItemPedido/' + id);
        return this._http
            .delete<void>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    apagarItemtrocaCompra(id: number): Observable<void> {
        let url = this._endpointService.obterUrlRestService('compras/trocasCompras/excluirItemTroca/' + id);
        return this._http
            .delete<void>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    apagarTrocaCompra(id: number): Observable<void> {
        let url = this._endpointService.obterUrlRestService('compras/trocasCompras/excluir/' + id);
        return this._http
            .delete<void>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    excluirCotacaoCompra(id: number): Observable<void> {
        let url = this._endpointService.obterUrlRestService('compras/cotacoesCompras/excluir/' + id);
        return this._http
            .delete<void>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    obterDadosPedidoCompra(id: number): Observable<PedidoCompraModel> {
        let url = this._endpointService.obterUrlRestService('compras/pedidosCompras/obterDados?id=' + id);
        return this._http
            .get<PedidoCompraModel>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    obterDadosCotacaoCompra(requisicao: RequisicaoObterDadosCotacaoModel): Observable<CotacaoCompraModel> {
        let url = this._endpointService.obterUrlRestService('compras/cotacoesCompras/obterDados');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<CotacaoCompraModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
        );
    }

    obterTrocaCompra(id: number): Observable<TrocaCompraModel> {
        let url = this._endpointService.obterUrlRestService('compras/trocasCompras/obterDados?id=' + id);
        return this._http
            .get<TrocaCompraModel>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    salvarDadosPedidoCompra(requisicao: PedidoCompraModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('compras/pedidosCompras/salvarDados');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<number>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    salvarDadosCotacaoCompra(requisicao: CotacaoCompraModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('compras/cotacoesCompras/salvarDados');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<number>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    salvarTrocaCompra(requisicao: TrocaCompraModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('compras/trocasCompras/salvarDados');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<number>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    baixarTrocasCompra(requisicao: RequisicaoBaixaTrocasComprasModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('compras/trocasCompras/baixarTrocas');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<number>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }


    baixarPedidosCompra(requisicao: RequisicaoBaixaPedidosComprasModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('compras/pedidosCompras/baixarPedidos');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<number>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    excluirCotacoesCompras(requisicao: RequisicaoExclusaoCotacoesComprasModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('compras/cotacoesCompras/excluirCotacoes');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<number>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    abrirPedidosCompra(requisicao: RequisicaoAberturaPedidosComprasModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('compras/pedidosCompras/abrirPedidos');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<number>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    buscarTrocasCompras(requisicao: RequisicaoBuscaTrocasComprasModel): Observable<ResultadoBuscaTrocasComprasModel> {
        let url = this._endpointService.obterUrlRestService('compras/trocasCompras/buscar');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoBuscaTrocasComprasModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    buscarCotacoesCompras(requisicao: RequisicaoBuscaCotacoesComprasModel): Observable<ResultadoBuscaCotacoesComprasModel> {
        let url = this._endpointService.obterUrlRestService('compras/cotacoesCompras/buscar');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoBuscaCotacoesComprasModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    buscarLiberacoesCotacaoWeb(requisicao: RequisicaoBuscaCotacoesComprasModel): Observable<ResultadoBuscaLiberacoesCotacaoWebModel> {
        let url = this._endpointService.obterUrlRestService('compras/liberacoesCotacaoWeb/buscar');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoBuscaLiberacoesCotacaoWebModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    buscarFornecedoresCotacaoWeb(requisicao: RequisicaoBuscaFornecedorCotacaoModel): Observable<ResultadoBuscaFornecedorCotacaoModel> {
        let url = this._endpointService.obterUrlRestService('compras/liberacoesCotacaoWeb/buscarfornecedorescotacaoweb');
        return this._http
            .post<ResultadoBuscaFornecedorCotacaoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    reenviarSenhaCotacaoWeb(requisicao: RequisicaoReenviaSenhaCotacaoModel): Observable<ResultadoReenviaSenhaCotacaoModel> {
        let url = this._endpointService.obterUrlRestService('compras/liberacoesCotacaoWeb/reenviarsenhacotacaoweb');
        return this._http
            .post<ResultadoReenviaSenhaCotacaoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    adicionarFornecedorCotacaoWeb(requisicao: RequisicaoOperacaoFornecedorCotacaoWebModel): Observable<ResultadoAdicionarFornecedorCotacaoWebModel> {
        let url = this._endpointService.obterUrlRestService('compras/liberacoesCotacaoWeb/adicionarfornecedorcotacaoweb');
        return this._http
            .post<ResultadoAdicionarFornecedorCotacaoWebModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    removerFornecedorCotacaoWeb(requisicao: RequisicaoOperacaoFornecedorCotacaoWebModel): Observable<any> {
        let url = this._endpointService.obterUrlRestService('compras/liberacoesCotacaoWeb/removerfornecedorcotacaoweb');
        return this._http
            .post<any>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    liberarCotacaoWeb(requisicao: RequisicaoLiberarCotacaoWebModel): Observable<ResultadoLiberarCotacaoModel> {
        let url = this._endpointService.obterUrlRestService('compras/liberacoesCotacaoWeb/liberarcotacaoweb');
        return this._http
            .post<ResultadoLiberarCotacaoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    buscarCotacoesAvaliaveis(requisicao: RequisicaoBuscaCotacoesComprasModel): Observable<ResultadoBuscaCotacoesAvaliaveisModel> {
        let url = this._endpointService.obterUrlRestService('compras/avaliacaoCotacoes/buscarcotacoesavaliaveis');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoBuscaCotacoesAvaliaveisModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    consultaProdutosCotacao(requisicao: RequisicaoConsultaProdutosCotacaoModel): Observable<ResultadoConsultaProdutosCotacaoModel> {
        let url = this._endpointService.obterUrlRestService('compras/avaliacaoCotacoes/consultaprodutoscotacao');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoConsultaProdutosCotacaoModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    cotacaoGerarPedidos(requisicao: RequisicaoCotacaoGerarPedidoModel): Observable<ResultadoCotacaoGerarPedidoModel> {
        let url = this._endpointService.obterUrlRestService('compras/avaliacaoCotacoes/cotacaogerarpedidos');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoCotacaoGerarPedidoModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    importarCotacao(requisicao: RequisicaoImportarCotacaoModel): Observable<ResultadoImportarCotacaoModel> {
        let url = this._endpointService.obterUrlRestService('compras/avaliacaoCotacoes/importarcotacao');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoImportarCotacaoModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    editarCotacao(requisicao: RequisicaoEditarCotacaoModel): Observable<ResultadoEditarCotacaoModel> {
        let url = this._endpointService.obterUrlRestService('compras/avaliacaoCotacoes/editarcotacao');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoEditarCotacaoModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    desativarProdutosVenda(requisicao: RequisicaoDesativarProdutosVendaModel): Observable<any> {
        let url = this._endpointService.obterUrlRestService('compras/analiseSugestaoCompra/desativarProdutosVenda');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<number>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    copiarPedidoCompra(requisicao: RequisicaoCopiarPedidoModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('compras/pedidosCompras/copiarPedidoCompra');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<number>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    gerarRelatorioPedidoCompra(requisicao: RequisicaoRelatorioPedidoCompra, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'compras/pedidosCompras/relatorio', nome, visualizar);
    }

    buscarCotacaoFornecedoresColuna(requisicao: RequisicaoBuscarFornecedoresColunaModel): Observable<ResultadoBuscarFornecedoresColunaModel> {
        let url = this._endpointService.obterUrlRestService('compras/avaliacaoCotacoes/buscarCotacaoFornecedoresColunas');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoBuscarFornecedoresColunaModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    gerarRelatorioTrocasCompras(requisicao: RequisicaoRelatorioTrocasComprasModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'compras/trocasCompras/relatorio', nome, visualizar);
    }

    obterInformacaoPrecosCotacoes(requisicao: RequisicaoObterInformacaoPrecosCotacoesModel): Observable<ResultadoObterInformacaoPrecosCotacoesModel> {
        let url = this._endpointService.obterUrlRestService('compras/informacaoPrecoCotacao/obterInformacaoPrecosCotacoes');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoObterInformacaoPrecosCotacoesModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    salvarInformacaoPrecosCotacoes(requisicao: RequisicaoSalvarInformacaoPrecosCotacoesModel): Observable<ResultadoSalvarInformacaoPrecosCotacoesModel> {
        let url = this._endpointService.obterUrlRestService('compras/informacaoPrecoCotacao/salvarInformacaoPrecosCotacoes');
        let data = JSON.stringify(requisicao)
        return this._http
            .post<ResultadoSalvarInformacaoPrecosCotacoesModel>(url, data, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    gerarContasReceberTrocas(requisicao: RequisicaoGerarReceberTrocasModel): Observable<any> {
        let url = this._endpointService.obterUrlRestService('compras/trocasCompras/gerarContasReceberTrocas');
        return this._http
            .post<any>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    gerarContasPagarPedidos(requisicao: RequisicaoGerarPagarPedidosModel): Observable<any> {
        let url = this._endpointService.obterUrlRestService('compras/pedidosCompras/gerarContasPagarPedidos');
        return this._http
            .post<any>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    enviarEmailPedido(requisicao: RequisicaoEnviarEmailModel): Observable<any> {
        let url = this._endpointService.obterUrlRestService('compras/pedidosCompras/enviarEmailPedido');
        return this._http
            .post<any>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    copiarCotacao(id: number): Observable<number> {
        let url = this._endpointService.obterUrlRestService('compras/cotacoesCompras/copiarCotacao?id=' + id);
        return this._http
            .get<number>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }
}