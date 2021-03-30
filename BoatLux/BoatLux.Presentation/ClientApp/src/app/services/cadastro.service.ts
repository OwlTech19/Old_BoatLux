import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { RequisicaoBuscaOperacaoFinanceiraModel, ResultadoBuscaOperacaoFinanceiraModel, RequisicaoSalvarOperacaoFinanceiraModel, ResultadoSalvarOperacaoFinanceiraModel, RequisicaoApagarOperacaoFinanceiraModel, ResultadoApagarOperacaoFinanceiraModel, RequisicaoBuscaTipoDocumentoModel, ResultadoBuscaTipoDocumentoModel, RequisicaoSalvarTipoDocumentoModel, ResultadoSalvarTipoDocumentoModel, RequisicaoApagarTipoDocumentoModel, ResultadoApagarTipoDocumentoModel, RequisicaoRelatorioFinanceiroOperacoesFinanceirasModel, RequisicaoRelatorioFinanceiroTiposDocumentoModel, ResultadoResumoVendasProdutoModel, ResultadoResumoEntradasNfProdutoModel, ResultadoResumoCategoriaProdutoModel, ResultadoResumoComprasProdutoModel, RequisicaoPadraoResumoProdutoModel, RequisicaoBuscaProdutosImportacaoModel, ResultadoBuscaFornecedoresImportacaoModel, RequisicaoBuscaFornecedoresImportacaoModel, RequisicaoAssociarProdutoFornecedorModel, RequisicaoClassificarEstrutaMercModel, RequisicaoBuscaPendenciasFornecedorModel, ResultadoBuscaPendenciasFornecedorModel, PendenciaFornecedorModel, ResultadoResumoFamiliaPrecosModel, ResultadoResumoAlteracoesPrecosModel, RequisicaoGravarLogSenhaFornecedorModel, ProdutoImportacaoModel, RequisicaoDesassociarProdutosFornecedorModel } from '../interfaces/cadastro.interface';
import { LocalStorageService } from './local-storage.service';
import { RelatorioService } from './relatorio.service';
import { EndpointService } from './endpoint.service';

@Injectable({
    providedIn: 'root'
})
export class CadastroService {
    constructor(
        private _http: HttpClient,
        private _localStorageService: LocalStorageService,
        private _relatorioService: RelatorioService,
        private _endpointService: EndpointService
    ) { }

    private _obterHeaders(): any {
        let loginData = this._localStorageService.get("loginData");
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + loginData.token
        };
    }

    /**
     * PRODUTOS     
     */

    produtos_ObterResumoVendas(requisicao: RequisicaoPadraoResumoProdutoModel): Observable<ResultadoResumoVendasProdutoModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/obterResumoVendas');
        return this._http
            .post<ResultadoResumoVendasProdutoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    produtos_ObterResumoEntradasNf(requisicao: RequisicaoPadraoResumoProdutoModel): Observable<ResultadoResumoEntradasNfProdutoModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/obterResumoEntradasNf');
        return this._http
            .post<ResultadoResumoEntradasNfProdutoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    produtos_ObterResumoCategoria(requisicao: RequisicaoPadraoResumoProdutoModel): Observable<ResultadoResumoCategoriaProdutoModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/obterResumoCategoria');
        return this._http
            .post<ResultadoResumoCategoriaProdutoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    produtos_ObterResumoCompras(requisicao: RequisicaoPadraoResumoProdutoModel): Observable<ResultadoResumoComprasProdutoModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/obterResumoCompras');
        return this._http
            .post<ResultadoResumoComprasProdutoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders(),
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    produtos_ObterResumoEstoquePreco(requisicao: RequisicaoPadraoResumoProdutoModel): Observable<any> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/obterResumoEstoquePreco');
        return this._http
            .post<any>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders(),
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    produtos_ObterResumoFamiliaPrecos(requisicao: RequisicaoPadraoResumoProdutoModel): Observable<ResultadoResumoFamiliaPrecosModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/obterResumoFamiliaPrecos');
        return this._http
            .post<ResultadoResumoFamiliaPrecosModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    produtos_ObterResumoAlteracoesPrecos(requisicao: RequisicaoPadraoResumoProdutoModel): Observable<ResultadoResumoAlteracoesPrecosModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/obterResumoAlteracoesPrecos');
        return this._http
            .post<ResultadoResumoAlteracoesPrecosModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    produtos_BuscarProdutosImportacao(requisicao: RequisicaoBuscaProdutosImportacaoModel): Observable<ProdutoImportacaoModel[]> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/buscarProdutosImportacao');
        return this._http
            .post<ProdutoImportacaoModel[]>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    produtos_AssociarFornecedor(requisicao: RequisicaoAssociarProdutoFornecedorModel): Observable<any> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/associarFornecedor');
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

    produtos_ClassificarEstruturaMerc(requisicao: RequisicaoClassificarEstrutaMercModel): Observable<any> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/classificarEstruturaMerc');
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

    produtos_DesassociarFornecedor(requisicao: RequisicaoDesassociarProdutosFornecedorModel): Observable<void> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/desassociarFornecedor');
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

    /*
    * FINANCEIRO
    */

    financeiro_BuscarOperacoesFinanceiras(requisicao: RequisicaoBuscaOperacaoFinanceiraModel): Observable<ResultadoBuscaOperacaoFinanceiraModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/financeiro/buscarOperacoesFinanceiras');
        return this._http
            .post<ResultadoBuscaOperacaoFinanceiraModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    financeiro_SalvarOperacaoFinanceira(requisicao: RequisicaoSalvarOperacaoFinanceiraModel): Observable<ResultadoSalvarOperacaoFinanceiraModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/financeiro/salvarOperacaoFinanceira');
        return this._http
            .post<ResultadoSalvarOperacaoFinanceiraModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    financeiro_ApagarOperacaoFinanceira(requisicao: RequisicaoApagarOperacaoFinanceiraModel): Observable<ResultadoApagarOperacaoFinanceiraModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/financeiro/apagarOperacaoFinanceira');
        return this._http
            .post<ResultadoApagarOperacaoFinanceiraModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    financeiro_BuscarTiposDocumentos(requisicao: RequisicaoBuscaTipoDocumentoModel): Observable<ResultadoBuscaTipoDocumentoModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/financeiro/buscarTiposDocumentos');
        return this._http
            .post<ResultadoBuscaTipoDocumentoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    financeiro_SalvarTiposDocumentos(requisicao: RequisicaoSalvarTipoDocumentoModel): Observable<ResultadoSalvarTipoDocumentoModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/financeiro/salvarTipoDocumento');
        return this._http
            .post<ResultadoSalvarTipoDocumentoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    financeiro_ApagarTiposDocumentos(requisicao: RequisicaoApagarTipoDocumentoModel): Observable<ResultadoApagarTipoDocumentoModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/financeiro/apagarTipoDocumento');
        return this._http
            .post<ResultadoApagarTipoDocumentoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    financeiro_gerarRelatorioOperacoesFinanceiras(requisicao: RequisicaoRelatorioFinanceiroOperacoesFinanceirasModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'cadastro/financeiro/relatorioOperacoesFinanceiras', nome, visualizar);
    }

    financeiro_gerarRelatorioTiposDocumento(requisicao: RequisicaoRelatorioFinanceiroTiposDocumentoModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'cadastro/financeiro/relatorioTiposDocumento', nome, visualizar);
    }

    /*
    * FORNECEDORES
    */
    fornecedores_BuscarFornecedoresImportacao(requisicao: RequisicaoBuscaFornecedoresImportacaoModel): Observable<ResultadoBuscaFornecedoresImportacaoModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/produtos/buscarFornecedoresImportacao');
        return this._http
            .post<ResultadoBuscaFornecedoresImportacaoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    fornecedor_BuscarPendencias(requisicao: RequisicaoBuscaPendenciasFornecedorModel): Observable<ResultadoBuscaPendenciasFornecedorModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/fornecedor/buscarPendencias');
        return this._http
            .post<ResultadoBuscaPendenciasFornecedorModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    fornecedor_ObterPendencia(pendenciaId: number): Observable<PendenciaFornecedorModel> {
        let url = this._endpointService.obterUrlRestService('cadastro/fornecedor/obterPendencias?pendenciaId=' + pendenciaId);
        return this._http
            .get<PendenciaFornecedorModel>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    fornecedor_SalvarPendencia(requisicao: PendenciaFornecedorModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('cadastro/fornecedor/salvarPendencia');
        return this._http
            .post<number>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    fornecedor_ExcluirPendencia(pendenciaId: number): Observable<any> {
        let url = this._endpointService.obterUrlRestService('cadastro/fornecedor/excluirPendencia/' + pendenciaId);
        return this._http
            .delete<any>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    fornecedor_VerificarPendencia(fornecedorId: number): Observable<boolean> {
        let url = this._endpointService.obterUrlRestService('cadastro/fornecedor/verificarPendencia?fornecedorId=' + fornecedorId);
        return this._http
            .get<boolean>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    fornecedor_GravarLogSenhaFornecedor(requisicao: RequisicaoGravarLogSenhaFornecedorModel): Observable<any> {
        let url = this._endpointService.obterUrlRestService('cadastro/fornecedor/gravarLogSenhaFornecedor');
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
}