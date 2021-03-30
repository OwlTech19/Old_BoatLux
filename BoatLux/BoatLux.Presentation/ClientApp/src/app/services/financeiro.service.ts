import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { RelatorioService } from './relatorio.service';
import { RequisicaoBuscaTitulosReceberModel, ResultadoBuscaTitulosReceberModel, RequisicaoAtribuirInformacoesTitulosModel, ResultadoAtribuirInformacoesReceberModel, RequisicaoSalvarContasReceberModel, ResultadoSalvarContasReceberModel, TituloReceberModel, RequisicaoCancelaTituloReceberModel, RequisicaoCupomNfReceberModel, ResultadoCupomNfReceberModel, RequisicaoRelatorioNotasPromissoriasModel, RequisicaoRelatorioCarnesModel, RequisicaoComprovanteReceberModel, ResultadoComprovanteModel, RequisicaoRelatorioContasReceberModel, RequisicaBuscarTitulosClienteModel, ResultadoBuscarTitulosClienteModel, ResultadoBuscaTitulosReceberEmAbertoModel, RequisicaoBaixarReceberMultiplosModel, RequisicaoBaixarReceberIndividualModel, RequisicaoBaixarReceberPorValorModel, RequisicaoBuscaMovimentacaoBancariaModel, ResultadoBuscaMovimentacaoBancariaModel, RequisicaoCadastroOperacaoBancariaModel, ResultadoBaixaContasReceberModel, RequisicaoSalvarContasPagarModel, ContasPagarModel, ResultadoBuscaTitulosPagarEmAbertoModel, RequisicaoBaixarPagarMultiplosModel, RequisicaoBaixarPagarIndividualModel, RequisicaoCancelaContasPagarModel, RequisicaoRelExtratoBancarioModel, RequisicaoRelatorioContasPagarModel, RequisicaoFichaPagamentoModel, RequisicaoComprovantePagarModel, RequisicaoLiberaBloqueiaPagarModel, RequisicaoRelFluxoCaixaModel, RequisicaoEstornoPagarModel, RequisicaoEstornoReceberModel, RequisicaoGerarBoletoModel, ResultadoRemessaBoletoModel, RequestSearchCosts, ResponseSearchCosts, RequestAddCost } from '../interfaces/financeiro.interface';
import { RequisicaoBuscaTitulosPagarModel, ResultadoBuscaTitulosPagarModel } from '../interfaces/financeiro.interface';
import { RequisicaoCancelaTitulosReceberModel, ResultadoCancelaTitulosReceberModel } from '../interfaces/financeiro.interface';
import { EndpointService } from './endpoint.service';

@Injectable({
    providedIn: 'root'
})
export class FinanceiroService {
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

    /*
     * Boatlux
     * /

    /*
     * Cadastros
     */
    CostsSearchItems(request: RequestSearchCosts): Observable<ResponseSearchCosts> {
        let url = this._endpointService.obterUrlRestService('financeiro/cadastros/searchItems');
        return this._http
            .post<ResponseSearchCosts>(url, request, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    // Aqui é um PUT, ver como fazer
    //CostsChangeStatus(requisicao: RequestSearchCosts): Observable<ResponseSearchCosts> {
    //    let url = this._endpointService.obterUrlRestService('financeiro/cadastros/changeStatus');
    //    return this._http
    //        .post<ResponseSearchCosts>(url, requisicao, {
    //            observe: 'response',
    //            headers: this._obterHeaders()
    //        })
    //        .pipe(
    //            map(res => {
    //                return res.body;
    //            })
    //        );
    //}

    AddCost(request: RequestAddCost): Observable<number> {
        let url = this._endpointService.obterUrlRestService('financeiro/cadastros/addCost');
        return this._http
            .post<number>(url, request, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    cancelarContasPagar(requisicao: RequisicaoCancelaContasPagarModel): Observable<void> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasPagar/cancelarcontaspagar');
        return this._http
            .post<void>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    //salvarContasPagar(requisicao: RequisicaoSalvarContasPagarModel): Observable<number[]> {
    //    let url = this._endpointService.obterUrlRestService('financeiro/contasPagar/salvarContasPagar');
    //    return this._http
    //        .post<number[]>(url, requisicao, {
    //            observe: 'response',
    //            headers: this._obterHeaders()
    //        })
    //        .pipe(
    //            map(res => {
    //                return res.body;
    //            })
    //        );
    //}

    obterDadosTituloPagar(id: number): Observable<ContasPagarModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasPagar/obterDadosTituloPagar?id=' + id);
        return this._http
            .get<ContasPagarModel>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    atribuirInformacoesPagar(requisicao: RequisicaoAtribuirInformacoesTitulosModel): Observable<void> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasPagar/atribuirInformacoesPagar');
        return this._http
            .post<void>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    buscarContasPagarEmAberto(requisicao: RequisicaoBuscaTitulosPagarModel): Observable<ResultadoBuscaTitulosPagarEmAbertoModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/contaspagar/buscarContasPagarEmAberto');
        return this._http
            .post<ResultadoBuscaTitulosPagarEmAbertoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    baixarPagarMultiplos(requisicao: RequisicaoBaixarPagarMultiplosModel): Observable<void> {
        let url = this._endpointService.obterUrlRestService('financeiro/contaspagar/baixarPagarMultiplos');
        return this._http
            .post<void>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    obterTituloBaixaPagar(id: number): Observable<ContasPagarModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasPagar/obterTituloBaixaPagar?id=' + id);
        return this._http
            .get<ContasPagarModel>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    baixarPagarIndividual(requisicao: RequisicaoBaixarPagarIndividualModel): Observable<void> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasPagar/baixarPagarIndividual');
        return this._http
            .post<void>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    gerarRelatorioContasPagar(requisicao: RequisicaoRelatorioContasPagarModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'financeiro/contasPagar/relContasPagar', nome, visualizar);
    }

    gerarRelatorioFichaPagamento(requisicao: RequisicaoFichaPagamentoModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'financeiro/contasPagar/relFichaPagamento', nome, visualizar);
    }

    obterComprovantePagar(requisicao: RequisicaoComprovantePagarModel): Observable<ResultadoComprovanteModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasPagar/obterComprovantePagar');
        return this._http
            .post<ResultadoComprovanteModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    liberaBloqueiaPagar(requisicao: RequisicaoLiberaBloqueiaPagarModel): Observable<void> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasPagar/liberaBloqueiaPagar');
        return this._http
            .post<void>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    estornarContasPagar(requisicao: RequisicaoEstornoPagarModel): Observable<void> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasPagar/estornarContasPagar');
        return this._http
            .post<void>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    downloadComprovantePagar(id: number) {

        let url = this._endpointService.obterUrlRestService('financeiro/contasPagar/downloadComprovantePagar?id=' + id);
        return this._http
            .get<any>(url, {
                observe: 'response',
                headers: this._obterHeaders(),
                responseType: 'arraybuffer' as 'json'
            }).subscribe(res => {

                let file = new Blob([res.body], { type: res.headers.get('Content-Type') });
                let extension = res.headers.get('Content-Type').split(".").pop();

                const element = document.createElement('a');
                element.href = URL.createObjectURL(file);

                // Trata as extensões que o JS não detecta automaticamente
                if (extension == 'document')
                    element.download = 'ComprovantePagar_id' + id + '.docx';
                else if (extension == 'sheet')
                    element.download = 'ComprovantePagar_id' + id + '.xlsx';
                else
                    element.download = 'ComprovantePagar_id' + id;

                document.body.appendChild(element);
                element.click();
            }, (err) => {

                try {
                    let jsonString = String.fromCharCode.apply(null, new Int8Array(err.error));
                    let jsonObject = JSON.parse(jsonString);
                    console.log('Ops!', jsonObject.Message, 'warning');
                }
                catch
                {
                    console.log('Ops!', 'Ocorreu um problema ao obter o comprovante de pagamento.', 'error');
                }
            });
    }

    /*
     * Contas a Receber
     */
    buscarContasReceber(requisicao: RequisicaoBuscaTitulosReceberModel): Observable<ResultadoBuscaTitulosReceberModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasreceber/buscarContasReceber');
        return this._http
            .post<ResultadoBuscaTitulosReceberModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    cancelarContasReceber(requisicao: RequisicaoCancelaTitulosReceberModel): Observable<ResultadoCancelaTitulosReceberModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasreceber/cancelarContasReceber');
        return this._http
            .post<ResultadoCancelaTitulosReceberModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    cancelarContaReceber(requisicao: RequisicaoCancelaTituloReceberModel): Observable<ResultadoCancelaTitulosReceberModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasreceber/cancelarContaReceber');
        return this._http
            .post<ResultadoCancelaTitulosReceberModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    atribuirInformacoesTitulos(requisicao: RequisicaoAtribuirInformacoesTitulosModel): Observable<ResultadoAtribuirInformacoesReceberModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/atribuirInformacoesTitulos');
        return this._http
            .post<ResultadoAtribuirInformacoesReceberModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    salvarContasReceber(requisicao: RequisicaoSalvarContasReceberModel): Observable<ResultadoSalvarContasReceberModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/salvarContasReceber');
        return this._http
            .post<ResultadoSalvarContasReceberModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    obterDadosTituloReceber(id: number): Observable<TituloReceberModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasreceber/obterDados?id=' + id);
        return this._http
            .get<TituloReceberModel>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    excluirTitulo(id: number): Observable<void> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasreceber/excluirTitulo?id=' + id);
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

    obterCupomNfReceber(requisicao: RequisicaoCupomNfReceberModel): Observable<ResultadoCupomNfReceberModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/obterCupomNfReceber');
        return this._http
            .post<ResultadoCupomNfReceberModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    gerarRelatorioNotasPromissorias(requisicao: RequisicaoRelatorioNotasPromissoriasModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'financeiro/contasreceber/impNotasPromissorias', nome, visualizar);
    }

    gerarRelatorioCarnes(requisicao: RequisicaoRelatorioCarnesModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'financeiro/contasreceber/impCarnes', nome, visualizar);
    }

    obterComprovanteReceber(requisicao: RequisicaoComprovanteReceberModel): Observable<ResultadoComprovanteModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasreceber/obterComprovanteReceber');
        return this._http
            .post<ResultadoComprovanteModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    gerarRelatorioContasReceber(requisicao: RequisicaoRelatorioContasReceberModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'financeiro/contasreceber/relContasReceber', nome, visualizar);
    }

    buscarTitulosCliente(requisicao: RequisicaBuscarTitulosClienteModel): Observable<ResultadoBuscarTitulosClienteModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/agrupatitulos/buscarTitulosCliente');
        return this._http
            .post<ResultadoBuscarTitulosClienteModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    buscarTitulosEmAberto(requisicao: RequisicaoBuscaTitulosReceberModel): Observable<ResultadoBuscaTitulosReceberEmAbertoModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasreceber/buscarTitulosEmAberto');
        return this._http
            .post<ResultadoBuscaTitulosReceberEmAbertoModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    baixarReceberMultiplos(requisicao: RequisicaoBaixarReceberMultiplosModel): Observable<ResultadoBaixaContasReceberModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/baixarReceberMultiplos');
        return this._http
            .post<ResultadoBaixaContasReceberModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    obterTituloBaixaReceber(id: number): Observable<TituloReceberModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/obterTituloBaixaReceber?id=' + id);
        return this._http
            .get<TituloReceberModel>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    baixarReceberIndividual(requisicao: RequisicaoBaixarReceberIndividualModel): Observable<ResultadoBaixaContasReceberModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/baixarReceberIndividual');
        return this._http
            .post<ResultadoBaixaContasReceberModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    baixarReceberPorValor(requisicao: RequisicaoBaixarReceberPorValorModel): Observable<ResultadoBaixaContasReceberModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/baixarReceberPorValor');
        return this._http
            .post<ResultadoBaixaContasReceberModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    retirarClienteEmDebito(clienteId: number): Observable<void> {
        let url = this._endpointService.obterUrlRestService('financeiro/retirarClienteEmDebito?id=' + clienteId);
        return this._http
            .get<void>(url, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    estornarContasReceber(requisicao: RequisicaoEstornoReceberModel): Observable<void> {
        let url = this._endpointService.obterUrlRestService('financeiro/contasReceber/estornarContasReceber');
        return this._http
            .post<void>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    imprimirBoletos(requisicao: RequisicaoGerarBoletoModel, nome: string, visualizar: boolean = false): Observable<any> {
        this._relatorioService.gerarRelatorio(requisicao, 'financeiro/boletos/imprimirBoletos', nome, visualizar);
        return;
    }

    gerarArquivoRemessa(requisicao: RequisicaoGerarBoletoModel): Observable<ResultadoRemessaBoletoModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/boletos/gerarArquivoRemessa');
        return this._http
            .post<ResultadoRemessaBoletoModel>(url, requisicao, {
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
     * Operações Bancárias
     */
    buscarOperacoesBancarias(requisicao: RequisicaoBuscaMovimentacaoBancariaModel): Observable<ResultadoBuscaMovimentacaoBancariaModel> {
        let url = this._endpointService.obterUrlRestService('financeiro/operacoesBancarias/buscarOperacoesBancarias');
        return this._http
            .post<ResultadoBuscaMovimentacaoBancariaModel>(url, requisicao, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }

    excluirOperacaoBancaria(id: number): Observable<void> {
        let url = this._endpointService.obterUrlRestService('financeiro/operacoesBancarias/excluirOperacaoBancaria/' + id);
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

    salvarOperacaoBancaria(requisicao: RequisicaoCadastroOperacaoBancariaModel): Observable<number> {
        let url = this._endpointService.obterUrlRestService('financeiro/operacoesBancarias/salvarOperacaoBancaria');
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

    gerarRelatorioExtratoBancario(requisicao: RequisicaoRelExtratoBancarioModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'financeiro/operacoesBancarias/relExtratoBancario', nome, visualizar);
    }

    /*
     * Relatórios
     */

    gerarRelatorioFluxoCaixa(requisicao: RequisicaoRelFluxoCaixaModel, nome: string, visualizar: boolean = false) {
        this._relatorioService.gerarRelatorio(requisicao, 'financeiro/relatorios/relFluxoCaixa', nome, visualizar);
    }
}