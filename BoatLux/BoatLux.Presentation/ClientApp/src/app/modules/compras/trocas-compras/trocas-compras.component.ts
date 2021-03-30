import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { RequisicaoBuscaPedidosComprasModel, ItemBuscaPedidosComprasModel, ResultadoBuscaPedidosComprasModel, RequisicaoBaixaPedidosComprasModel, RequisicaoAberturaPedidosComprasModel, ResultadoBuscaTrocasComprasModel, RequisicaoBuscaTrocasComprasModel, ItemBuscaTrocasComprasModel, RequisicaoBaixaTrocasComprasModel } from '../../../interfaces/compras.interface';
import { Parametros } from '../../../interfaces/uteis.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2'
import { ComprasService } from '../../../services/compras.service';
import { DialogService } from '../../../services/dialog.service';
import { CadastroTrocaCompraDialogComponent } from './cadastro-troca-compra-dialog/cadastro-troca-compra-dialog.component';
import { ControlesBuscaRapidaComponent } from '../../../controls/busca-rapida/busca-rapida.component';
import { ControlesComboLojaComponent } from '../../../controls/combo-loja/combo-loja.component';
import { SelectionModel } from '@angular/cdk/collections';
import { ComponentService, Modulos } from '../../../services/component.service';
import { LocalStorageService } from '../../../services/local-storage.service';
import { ControlesLegendaComponent } from '../../../controls/legenda/legenda.component';
import * as moment from 'moment';
import { ControlesFiltroRelTrocasComprasComponent } from './filtro-rel-trocas-compras-dialog/filtro-rel-trocas-compras-dialog.component';
import { GeraContasReceberTrocaComponent } from './gera-contas-receber-troca-dialog/gera-contas-receber-troca.component';
import { MatDialog } from '@angular/material/dialog';
//import { DateAdapter } from '@angular/material/core';

@Component({
    selector: 'trocas-compras',
    templateUrl: './trocas-compras.component.html',
    encapsulation: ViewEncapsulation.None
})

export class TrocasComprasComponent implements OnInit, OnDestroy, AfterViewInit {


    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        private _formBuilder: FormBuilder,
        private _dialogService: DialogService,
        private _comprasService: ComprasService,
        private _componentService: ComponentService,
        private _localStorageService: LocalStorageService,
        private _matDialog: MatDialog,
    ) {
        this._componentService.DefinirModuloAtual(Modulos.Compras);
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    // Períodos pré definidos do componente 
    ranges: any = {
        'Hoje': [moment(), moment()],
        'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Últimos 7 dias': [moment().subtract(6, 'days'), moment()],
        'Últimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'Mês atual': [moment().startOf('month'), moment().endOf('month')],
        'Mês passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    };

    //Armazena os produtos em memória
    resultadoBusca: ResultadoBuscaTrocasComprasModel = {
        paginacao: null,
        itens: [],
        idsDeTodosOsItens: [],
        lojas: []
    }
    selection = new SelectionModel<ItemBuscaTrocasComprasModel>(true, []);

    //Componentes
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('filtroLojas') filtroLojas: ControlesComboLojaComponent;
    @ViewChild('filtroFornecedor') filtroFornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    //Chave do cache de parâmetros
    private _keyParams = 'parametros';

    // Propriedades de parâmetros
    exibeGerarReceberTroca: boolean = false;

    //Configuração da tela de novo item / edição de item        
    idCadastro = 0;
    processandoCadastro = false;
    novoCadastro = true;
    parametros: Parametros[] = [];

    //Flag que indica se os itens estão sendo carregados
    exibeItensCarregando = false;
    temItens = false;

    //Definição do formulário de busca
    buscaFormGroup = this._formBuilder.group(
        {
            filtroId: [],
            filtroSituacao: [''],
            filtroPeriodo: [],
        }
    );

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.resultadoBusca.itens.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        if (this.isAllSelected()) {
            this.selection.clear()
        }
        else {
            this.resultadoBusca.itens.forEach(row => this.selection.select(row));
            Swal.fire('Atenção!', 'Foram selecionados ' + this.selection.selected.length.toString() + ' trocas. Utilize o menu "operações" para realizar uma ação.', 'info');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Abre janela de cadastro de um novo item
    novoItem() {
        this._dialogService.abrirDialogGrande(CadastroTrocaCompraDialogComponent).subscribe(result => {
            this.buscarItens(true);
        });
    }

    //Carrega o item para edição
    editarItem(item: ItemBuscaTrocasComprasModel) {
        this._dialogService.abrirDialogGrande(CadastroTrocaCompraDialogComponent, { id: item.trocaId }).subscribe(result => {
            this.buscarItens(true);
        });
    }

    //Remove o item através do serviço
    apagarItem(item: ItemBuscaTrocasComprasModel) {

        Swal.fire({
            title: 'Atenção',
            text: "Deseja excluir a troca " + item.trocaId + "?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Não!',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
                this._comprasService.apagarTrocaCompra(item.trocaId).subscribe((resultado) => {
                    Swal.fire('Pronto!', 'A troca foi excluída com sucesso!', 'success');
                    this.buscarItens(true);
                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        })
    }

    //Limpa os filtros e busca novamente
    limparBusca(): void {

        this.buscaFormGroup.reset();
        this.buscarItens(true);
    }

    //Imprimir relatório de pedidos
    imprimir(): void {
        const dialog = this._matDialog.open(ControlesFiltroRelTrocasComprasComponent, {
            width: '70%',
            data: {
                //compraId: item.compraId,

            }
        });
    }

    //Colunas do grid
    colunasItens = ['select', 'id', 'loja', 'fornecedor', 'lancamento', 'situacao', 'valorTroca', 'acoes'];

    obterDadosDefault(): void {
        this.buscaFormGroup.reset({
            filtroPeriodo: {
                startDate: new Date(new Date().setDate(new Date().getDate() - 15)),
                endDate: new Date()
            },
            filtroId: ''
        });
    }

    //Busca os itens no serviço
    buscarItens(novaBusca: boolean): void {

        if (novaBusca) {
            this.selection.clear();
            this.paginator.pageIndex = 0;
        }

        this.exibeItensCarregando = true;
        //this.temItens = false;

        if (this.buscaFormGroup.value.filtroPeriodo.startDate != null) {
            this.buscaFormGroup.patchValue({
                filtroPeriodo: {
                    startDate: this.buscaFormGroup.value.filtroPeriodo.startDate.format('YYYY-MM-DD'),
                    endDate: this.buscaFormGroup.value.filtroPeriodo.endDate.format('YYYY-MM-DD'),
                }
            })
        }

        let requisicao: RequisicaoBuscaTrocasComprasModel =
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
            filtroPeriodo: this.buscaFormGroup.value.filtroPeriodo.startDate != null ? this.buscaFormGroup.value.filtroPeriodo : null,
            filtroId: Number(this.buscaFormGroup.value.filtroId),
            filtroSituacao: this.buscaFormGroup.value.filtroSituacao
        };

        this._comprasService.buscarTrocasCompras(requisicao).subscribe((resultado) => {

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

    baixarTrocasSelecionadas() {

        Swal.fire({
            title: 'Baixa de trocas',
            text: "Deseja baixar as trocas que estão selecionadas e que ainda não foram baixadas?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, baixar!',
            cancelButtonText: 'Não!'
        }).then((result) => {
            if (result.value) {

                let requisicao: RequisicaoBaixaTrocasComprasModel = {
                    trocaIds: this.selection.selected.map(i => i.trocaId)
                };

                Swal.fire({
                    title: 'Aguarde...',
                    html: 'Estamos baixando as trocas...',
                    allowOutsideClick: false,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                    }
                });

                this._comprasService.baixarTrocasCompra(requisicao).subscribe(resultado => {

                    if (resultado === 0) {
                        Swal.fire('Ops!', 'Nenhuma das trocas selecionadas foi baixada devido ao seu status atual.', 'warning');
                    }
                    else {
                        Swal.fire('Pronto!', 'As trocas foram baixadas com sucesso!', 'success');
                        this.buscarItens(true);
                    }
                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        });
    }

    gerarContasReceber() {

        var selecionadosValidos = this.selection.selected.filter(i => {
            return i.situacao != 'AB' && Number(i.geradoFinanceiro) === 0
        });

        if (selecionadosValidos.length > 0) {
            if (this.selection.selected.length === selecionadosValidos.length) {
                this.abrirJanelaGeraContasReceberTroca(selecionadosValidos.map(i => i.trocaId), selecionadosValidos.map(i => i.lojaId));
            }
            else {
                let timerInterval
                Swal.fire({
                    title: 'Atenção',
                    icon: 'warning',
                    html: 'Foram selecionadas trocas em aberto ou com financeiro gerado. Os títulos serão gerados apenas para as trocas selecionadas baixadas e com financeiro pendente.',
                    timer: 5000,
                    timerProgressBar: true,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                    },
                    onClose: () => {
                        clearInterval(timerInterval);
                        this.abrirJanelaGeraContasReceberTroca(selecionadosValidos.map(i => i.trocaId), selecionadosValidos.map(i => i.lojaId));
                    }
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                        /* Read more about handling dismissals below */
                    }
                })
            }
        }
        else {
            Swal.fire('Ops!', 'É permitido gerar contas a receber apenas de trocas em que o contas a receber não foi gerado e com situação baixada. Por favor, verifique as trocas selecionadas.', 'warning');
        }
    }

    private abrirJanelaGeraContasReceberTroca(trocaIds: number[], lojaIds: number[]) {

        const dialog = this._matDialog.open(GeraContasReceberTrocaComponent, {
            width: '50%',
            data: {
                trocaIds: trocaIds,
                parametros: this.parametros,
            }
        });

        dialog.afterClosed().subscribe(result => {
            this.buscarItens(true);
        });

    }

    /**
       * Private
    **/

    private verificarParametros() {
        let _parametros = this._localStorageService.get(this._keyParams);

        _parametros.forEach(item => {
            this.parametros.push({ lojaId: item.id, gerarReceberTroca: item.gerarReceberTroca })
        });

        _parametros.forEach(i => {
            // Exibe opção de gerar receber da troca
            if (i.gerarReceberTroca === "S")
                this.exibeGerarReceberTroca = true;
        });

    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
        // Traz um período padrão para a busca
        this.obterDadosDefault();

        // Obtem informações dos parâmetros
        this.verificarParametros();

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