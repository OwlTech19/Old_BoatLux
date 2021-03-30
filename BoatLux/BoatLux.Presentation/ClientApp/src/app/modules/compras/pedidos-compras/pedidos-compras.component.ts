import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { RequisicaoBuscaPedidosComprasModel, ItemBuscaPedidosComprasModel, ResultadoBuscaPedidosComprasModel, RequisicaoBaixaPedidosComprasModel, RequisicaoAberturaPedidosComprasModel, RequisicaoGerarPagarPedidosModel } from '../../../interfaces/compras.interface';
import { Parametros } from '../../../interfaces/uteis.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2'
import { ComprasService } from '../../../services/compras.service';
import { DialogService } from '../../../services/dialog.service';
import { LocalStorageService } from '../../../services/local-storage.service';
import { CadastroPedidoCompraDialogComponent } from './cadastro-pedido-compra-dialog/cadastro-pedido-compra-dialog.component';
import { ControlesBuscaRapidaComponent } from '../../../controls/busca-rapida/busca-rapida.component';
import { ControlesComboLojaComponent } from '../../../controls/combo-loja/combo-loja.component';
import { SelectionModel } from '@angular/cdk/collections';
import { ComponentService, Modulos } from '../../../services/component.service';
import { ControlesLegendaComponent } from '../../../controls/legenda/legenda.component';
import * as moment from 'moment';
import { ControlesCopiaPedidoCompraComponent } from './copia-pedido-compra-dialog/copia-pedido-compra-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ControlesFiltroRelPedidoCompraComponent } from './filtro-rel-pedido-compra-dialog/filtro-rel-pedido-compra-dialog.component';
import { EnvioEmailPedidoDialogComponent } from './envio-email-pedido-dialog/envio-email-pedido-dialog.component';
//import { DateAdapter } from '@angular/material/core';

@Component({
    selector: 'pedidos-compras',
    templateUrl: './pedidos-compras.component.html',
    encapsulation: ViewEncapsulation.None
})

export class PedidosComprasComponent implements OnInit, OnDestroy, AfterViewInit {


    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        private _formBuilder: FormBuilder,
        private _dialogService: DialogService,
        private _comprasService: ComprasService,
        private _matDialog: MatDialog,
        private _componentService: ComponentService,
        private _localStorageService: LocalStorageService,
        //private _dataAdapter: DateAdapter<any>
    ) {
        _componentService.DefinirModuloAtual(Modulos.Compras);
        //_dataAdapter.setLocale('pt-BR');
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em memória
    resultadoBusca: ResultadoBuscaPedidosComprasModel = {
        paginacao: null,
        itens: [],
        idsDeTodosOsItens: [],
        lojas: []
    }
    selection = new SelectionModel<ItemBuscaPedidosComprasModel>(true, []);

    //Componentes
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('filtroLojas') filtroLojas: ControlesComboLojaComponent;
    @ViewChild('filtroFornecedor') filtroFornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    // Períodos pré definidos do componente 
    ranges: any = {
        'Hoje': [moment(), moment()],
        'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Últimos 7 dias': [moment().subtract(6, 'days'), moment()],
        'Últimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'Mês atual': [moment().startOf('month'), moment().endOf('month')],
        'Mês passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    };

    // Chave do cache de parâmetros
    private _keyParams = 'parametros';

    // Usuarios
    usuarioLogado: number;

    // Propriedades de parâmetros
    parametros: Parametros[] = [];
    lojaLogada: number;
    exibeGerarContasPagar: boolean = false;
    ccustoPagar: string;
    tipoDocumentoPagar: number;
    bancoPagar: string;
    operacaoPagar: number;

    //Configuração da tela de novo item / edição de item        
    idCadastro = 0;
    processandoCadastro = false;
    novoCadastro = true;

    //Flag que indica se os itens estão sendo carregados
    exibeItensCarregando = false;
    temItens = false;

    //Definição do formulário de busca
    buscaFormGroup = this._formBuilder.group(
        {
            filtroId: [],
            filtroSituacao: [''],
            periodo: [],
        }
    );

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.resultadoBusca.idsDeTodosOsItens.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        if (this.isAllSelected()) {
            this.selection.clear()
        }
        else {
            this.resultadoBusca.itens.forEach(item => this.selection.select(item));
            Swal.fire('Atenção!', 'Foram selecionados ' + this.selection.selected.length.toString() + ' pedidos. Utilize o menu "operações" para realizar uma ação.', 'info');
        }

    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Abre janela de cadastro de um novo item
    novoItem() {
        this._dialogService.abrirDialogGrande(CadastroPedidoCompraDialogComponent, {
            lojaId: this.lojaLogada,
        }).subscribe(result => {
            this.buscarItens(true);
        });
    }

    //Imprimir relatório de pedidos
    imprimir(): void {
        const dialog = this._matDialog.open(ControlesFiltroRelPedidoCompraComponent, {
            width: '70%',
            data: {
                //compraId: item.compraId,

            }
        });
    }

    //Carrega o item para edição
    editarItem(item: ItemBuscaPedidosComprasModel) {
        this._dialogService.abrirDialogGrande(CadastroPedidoCompraDialogComponent,
            {
                id: item.compraId,
                lojaId: item.lojaId,
                fornecedorPossuiPendencia: item.fornecedorPossuiPendencia
            }
        ).subscribe(result => {
            this.buscarItens(true);
        });
    }

    copiarPedido(item: ItemBuscaPedidosComprasModel) {
        const dialog = this._matDialog.open(ControlesCopiaPedidoCompraComponent, {
            width: '70%',
            height: '60%',
            data: {
                compraId: item.compraId,
                lojaId: item.lojaId,
                compradorId: item.compradorId,
                fornecedorId: item.fornecedorId,
            }
        });

        dialog.afterClosed().subscribe(result => {
            this.buscarItens(true);
        });
    }

    //Remove o item através do serviço
    apagarItem(item: ItemBuscaPedidosComprasModel) {

        Swal.fire({
            title: 'Atenção',
            text: "Deseja excluir o pedido " + item.compraId + "?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Não!',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
                this._comprasService.apagarPedidoCompra(item.compraId, this.usuarioLogado).subscribe((resultado) => {
                    Swal.fire('Pronto!', 'O pedido foi excluído com sucesso!', 'success');
                    this.buscarItens(true);
                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        })
    }

    //Obtem os dados default e busca novamente
    obterDadosDefault(): void {
        this.buscaFormGroup.reset({
            periodo: {
                startDate: moment(new Date().setDate(new Date().getDate() - 15)).format('YYYY-MM-DD'),
                endDate: moment().format('YYYY-MM-DD')
            },
            filtroId: '',
            filtroSituacao: '',
            filtroDataInicio: '',
            filtroDataTermino: ''
        });

        this.filtroFornecedor.limpar();

        this.buscarItens(true);
    }

    //Colunas do grid
    colunasItens = ['select', 'compraId', 'lojaId', 'razaoFornecedor', 'data', 'valorTotal', 'volumeTotal', /*'valorTotalLojas',*/ 'situacao', 'acoes'];

    //Busca os itens no serviço
    buscarItens(novaBusca: boolean): void {

        if (novaBusca) {
            this.selection.clear();
            this.paginator.pageIndex = 0;
        }

        this.exibeItensCarregando = true;
        //this.temItens = false;

        let requisicao: RequisicaoBuscaPedidosComprasModel =
        {
            paginacao: {
                paginaAtual: this.paginator.pageIndex,
                itensPorPagina: this.paginator.pageSize,
                colunaOrdenacao: this.sort.active,
                direcaoOrdenacao: this.sort.direction
            },
            filtroLojaIds: this.filtroLojas.obterLojasSelecionadas(),
            filtroFornecedorId: this.filtroFornecedor.obterCodigoSelecionado(),
            filtroPedidosBonificados: false,
            filtroDataInicio: this.buscaFormGroup.value.periodo.startDate.format('YYYY-MM-DD'),
            filtroDataTermino: this.buscaFormGroup.value.periodo.endDate.format('YYYY-MM-DD'),
            filtroId: Number(this.buscaFormGroup.value.filtroId),
            filtroSituacao: this.buscaFormGroup.value.filtroSituacao
        };

        this._comprasService.buscarPedidosCompras(requisicao).subscribe((resultado) => {

            this.exibeItensCarregando = false;
            this.temItens = resultado.itens.length > 0;
            this.resultadoBusca = resultado;
            this.paginator.length = resultado.paginacao.totalItens;
            this.legenda.quantidadeResultados = resultado.paginacao.totalItens;
        }, (err) => {

            this.exibeItensCarregando = false;

            Swal.fire({
                title: 'Ops!',
                text: "Não conseguimos concluir a busca, deseja tentar novamente??",
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim!',
                cancelButtonText: 'Não!'
            }).then((result) => {
                if (result.value) {
                    this.buscarItens(novaBusca);
                }
            })
        });
    }

    baixarPedidosSelecionados() {

        Swal.fire({
            title: 'Baixa de pedidos',
            text: "Deseja baixar os pedidos que estão selecionados e que ainda não foram baixados?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, baixar!',
            cancelButtonText: 'Não!'
        }).then((result) => {
            if (result.value) {

                let requisicao: RequisicaoBaixaPedidosComprasModel = {
                    compraIds: this.selection.selected.map(i => i.compraId)
                };

                Swal.fire({
                    title: 'Aguarde...',
                    html: 'Estamos baixando os pedidos...',
                    allowOutsideClick: false,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                    }
                });

                this._comprasService.baixarPedidosCompra(requisicao).subscribe(resultado => {

                    if (resultado == 0) {
                        Swal.fire('Ops!', 'Nenhum dos pedidos selecionados foi baixado devido ao seu status atual.', 'warning');
                    }
                    else {
                        Swal.fire('Pronto!', 'Os pedidos foram baixados com sucesso!', 'success');
                        this.buscarItens(true);
                    }
                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        });
    }

    alterarSituacaoParaAbertoPedidosSelecionados() {
        Swal.fire({
            title: 'Alteração de situação',
            text: "Deseja alterar para aberto a situação dos pedidos que estão selecionados e que estão fechados?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, alterar!',
            cancelButtonText: 'Não!'
        }).then((result) => {
            if (result.value) {

                let requisicao: RequisicaoAberturaPedidosComprasModel = {
                    compraIds: this.selection.selected.map(i => i.compraId)
                };

                Swal.fire({
                    title: 'Aguarde...',
                    html: 'Estamos abrindo os pedidos...',
                    allowOutsideClick: false,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                    }
                });

                this._comprasService.abrirPedidosCompra(requisicao).subscribe(resultado => {
                    if (resultado == 0) {
                        Swal.fire('Ops!', 'Nenhum dos pedidos selecionados foi aberto devido ao seu status atual.', 'warning');
                    }
                    else {
                        Swal.fire('Pronto!', 'Os pedidos foram abertos com sucesso!', 'success');
                        this.buscarItens(true);
                    }
                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        });
    }

    gerarContasPagar() {

        if (this.ccustoPagar != null || this.tipoDocumentoPagar > 0 || this.bancoPagar != null || this.operacaoPagar > 0) {

            var selecionadosValidos = this.selection.selected.filter(i => {
                return i.geradoFinanceiro == false
            });

            if (selecionadosValidos.length > 0) {

                Swal.fire({
                    title: 'Gerar Contas a Pagar',
                    text: "Deseja gerar contas a pagar dos pedidos selecionados? Será gerado contas a pagar apenas dos pedidos em que o financeiro não foi gerado.",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sim, gerar!',
                    cancelButtonText: 'Não!'
                }).then((result) => {
                    if (result.value) {

                        let requisicao: RequisicaoGerarPagarPedidosModel = {
                            compraIds: selecionadosValidos.map(i => i.compraId),
                            ccustoId: this.ccustoPagar.trim(),
                            tipoDocumentoId: this.tipoDocumentoPagar,
                            bancoId: this.bancoPagar.trim(),
                            operacaoFinanceiraId: this.operacaoPagar,
                            parametros: this.parametros,
                        };

                        Swal.fire({
                            title: 'Aguarde...',
                            html: 'Estamos gerando os títulos a pagar...',
                            allowOutsideClick: false,
                            onBeforeOpen: () => {
                                Swal.showLoading()
                            }
                        });

                        this._comprasService.gerarContasPagarPedidos(requisicao).subscribe(result => {

                            Swal.fire('Pronto!', 'Os títulos foram gerados com sucesso!', 'success');
                            this.buscarItens(true);

                        }, (err) => {
                            Swal.fire('Ops!', 'Não conseguimos gerar os títulos a pagar' + err.error.Message, 'error');
                        });
                    }
                });
            }
            else {
                Swal.fire('Ops!', 'Os pedidos selecionados já possuem contas a pagar gerado. Para modificá-los, acesso o módulo Financeiro!', 'warning');
            }
        }
        else {
            Swal.fire('Ops!', 'Para prosseguir, é necessário informar os dados padrão para gerar contas a pagar. Por favor, acesse Parâmetros > Financeiro e informe os campos Centro de Custo, Tipo do Documento, Código da Operação e Banco. Em seguida, tente gerar novamente!', 'warning');
        }
    }

    abrirJanelaEnvioEmail() {
        if (this.ValidarFornecedor()) {
            let fornecedorEmail: ItemBuscaPedidosComprasModel;

            this.resultadoBusca.itens.map(item => {
                if (item.compraId == this.selection.selected[0].compraId)
                    fornecedorEmail = item;
            });

            this._matDialog.open(EnvioEmailPedidoDialogComponent, {
                width: '50%',
                data: {
                    pedidoIds: this.selection.selected.map(i => i.compraId),
                    emailFornecedor: fornecedorEmail.emailFornecedor,
                    fornecedor: fornecedorEmail.fornecedor,
                    fornecedorId: fornecedorEmail.fornecedorId,
                    lojaIds: [...new Set(this.selection.selected.map(item => Number(item.lojaId)))],
                }
            });
        }
        else {
            Swal.fire('Atenção!', 'Selecione pedidos de apenas um fornecedor para enviar e-mail.', 'warning');
        }

    }

    /**
       * Private
    **/

    private verificarParametros() {
        let _parametrosLojaLogada = this._localStorageService.get(this._keyParams).filter(i => i.id == this._localStorageService.get('lojaLogada'));
        let _parametros = this._localStorageService.get(this._keyParams);

        _parametros.forEach(i => {
            // Adiciona os parâmetros do Pedido de Compra
            this.parametros.push({ lojaId: i.id, compraGeraPagar: i.compraGeraPagar })

            // Exibe/Oculta opção Gerar Contas a Receber
            if (i.compraGeraPagar === "S")
                this.exibeGerarContasPagar = true;
        });

        // Obtem parâmetros para o Contas a Pagar
        this.ccustoPagar = _parametrosLojaLogada[0].cCustoPagar;
        this.tipoDocumentoPagar = Number(_parametrosLojaLogada[0].tipoDocumentoPagar);
        this.bancoPagar = _parametrosLojaLogada[0].bancoPagar;
        this.operacaoPagar = Number(_parametrosLojaLogada[0].operacaoPagar);
        this.lojaLogada = Number(_parametros[0].id);
    }

    private ValidarFornecedor(): boolean {

        let fornecedorSelecionado: number = 0;
        let ret = true;

        // Obtem o fornecedor selecionado
        this.resultadoBusca.itens.filter(i => {
            if (fornecedorSelecionado == 0 && i.compraId == this.selection.selected[0].compraId) {
                fornecedorSelecionado = i.fornecedorId;
            }
        });

        // Verifica se tem mais de 1 fornecedor selecionado
        this.selection.selected.forEach(i => {
            this.resultadoBusca.itens.map(function (item) {
                if (item.compraId == i.compraId) {
                    if (fornecedorSelecionado != item.fornecedorId) {
                        ret = false;
                        return ret;
                    }
                }
            })
        });
        return ret;
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngOnInit(): void {

        this.usuarioLogado = this._localStorageService.get("loginData").usuarioLogado;
        
        this.verificarParametros();
    }

    ngAfterViewInit(): void {

        this.obterDadosDefault()
        this.buscarItens(true);
        this.paginator.page.subscribe(() => {
            this.buscarItens(false);
        });
        this.sort.sortChange.subscribe(() => {
            this.paginator.pageIndex = 0
            this.buscarItens(false);
        });

        //this.editarItem({ compraId: 16579 });
    }

    ngOnDestroy(): void {
    }
}