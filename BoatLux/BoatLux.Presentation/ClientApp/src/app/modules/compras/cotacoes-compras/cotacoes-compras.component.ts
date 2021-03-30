import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { RequisicaoBuscaPedidosComprasModel, ItemBuscaPedidosComprasModel, ResultadoBuscaPedidosComprasModel, RequisicaoBaixaPedidosComprasModel, RequisicaoAberturaPedidosComprasModel, ResultadoBuscaTrocasComprasModel, RequisicaoBuscaTrocasComprasModel, ItemBuscaTrocasComprasModel, RequisicaoBuscaCotacoesComprasModel, ResultadoBuscaCotacoesComprasModel, ItemBuscaCotacoesComprasModel, RequisicaoExclusaoCotacoesComprasModel, ItemCotacaoCompraModel, CotacaoCompraModel } from '../../../interfaces/compras.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2'
import { ComprasService } from '../../../services/compras.service';
import { DialogService } from '../../../services/dialog.service';
import { CadastroCotacaoCompraDialogComponent } from './cadastro-cotacao-compra-dialog/cadastro-cotacao-compra-dialog.component';
import { ControlesBuscaRapidaComponent } from '../../../controls/busca-rapida/busca-rapida.component';
import { ControlesComboLojaComponent } from '../../../controls/combo-loja/combo-loja.component';
import { SelectionModel } from '@angular/cdk/collections';
import { ComponentService, Modulos } from '../../../services/component.service';
import { ControlesLegendaComponent } from '../../../controls/legenda/legenda.component';
import { createWriteStream } from 'fs';
import * as moment from 'moment';
//import { DateAdapter } from '@angular/material/core';

@Component({
    selector: 'cotacoes-compras',
    templateUrl: './cotacoes-compras.component.html',
    encapsulation: ViewEncapsulation.None
})

export class CotacoesComprasComponent implements OnInit, OnDestroy, AfterViewInit {


    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        private _formBuilder: FormBuilder,
        private _dialogService: DialogService,
        private _comprasService: ComprasService,
        private _componentService: ComponentService
    ) {
        this._componentService.DefinirModuloAtual(Modulos.Compras);
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em memória
    resultadoBusca: ResultadoBuscaCotacoesComprasModel = {
        paginacao: null,
        itens: [],
        idsDeTodosOsItens: [],
        lojas: []
    }
    selection = new SelectionModel<number>(true, []);
    itensSelecionados = new SelectionModel<CotacaoCompraModel>(true, []);


    //Componentes
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('filtroLojas') filtroLojas: ControlesComboLojaComponent;
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
            filtroData: [],
            periodo: []
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
            this.resultadoBusca.idsDeTodosOsItens.forEach(item => this.selection.select(item));
            Swal.fire('Atenção!', 'Foram selecionados ' + this.selection.selected.length.toString() + ' Cotações. Utilize o menu "operações" para realizar uma ação.', 'info');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    obterDadosDefault(): void {
        this.buscaFormGroup.reset({
            periodo: {
                startDate: new Date(new Date().setDate(new Date().getDate() - 15)),
                endDate: new Date()
            },
            filtroId: ''
        });
    }

    //Abre janela de cadastro de um novo item
    novoItem() {
        this._dialogService.abrirDialogGrande(CadastroCotacaoCompraDialogComponent).subscribe(result => {
            this.buscarItens(true);
        });
    }

    //Carrega o item para edição
    editarItem(item: ItemBuscaCotacoesComprasModel) {

        this._dialogService.abrirDialogGrande(CadastroCotacaoCompraDialogComponent,
            {
                id: item.cotacaoId,
                lojaId: item.lojaId

            }).subscribe(result => {
                this.buscarItens(true);
            });
    }

    //Remove o item através do serviço
    apagarItem(item: ItemBuscaCotacoesComprasModel) {

        var selecionadosEmAberto = this.itensSelecionados.selected.filter(function (item) {
            return item.situacao === 'AB';
        });

        if (selecionadosEmAberto.length === 0) {
            Swal.fire({
                title: 'Atenção',
                text: "Deseja excluir a cotação " + item.cotacaoId + "?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Não!',
                reverseButtons: true
            }).then((result) => {
                if (result.value) {
                    this._comprasService.excluirCotacaoCompra(item.cotacaoId).subscribe((resultado) => {
                        Swal.fire('Pronto!', 'A cotação foi excluída com sucesso!', 'success');
                        this.buscarItens(true);
                    }, (err) => {
                        Swal.fire('Ops!', err.error.Message, 'error');
                    });
                }
            });
        } else {
            Swal.fire('Ops!', 'Não é possivel apagar cotações com situação diferente de Aberto', 'warning');
        }

    }

    //Limpa os filtros e busca novamente
    limparBusca(): void {

        this.buscaFormGroup.reset();
        this.buscarItens(true);
    }

    imprimirBusca(formato: number, visualizar: boolean = false): void {

        //let requisicao: RequisicaoRelatorioFinanceiroOperacoesFinanceirasModel =
        //{
        //    formato: formato,
        //    busca:
        //    {
        //        filtroId: this.buscaFormGroup.value.filtroId,
        //        filtroDescricao: this.buscaFormGroup.value.filtroDescricao
        //    }
        //};

        //this._cadastroService.financeiro_gerarRelatorioOperacoesFinanceiras(requisicao, 'Relatório de Operações Financeiras', visualizar);        
    }

    //Colunas do grid
    colunasItens = ['select', 'cotacaoId', 'loja', 'fornecedor', 'data', 'situacao', 'acoes'];

    //Busca os itens no serviço
    buscarItens(novaBusca: boolean): void {

        if (novaBusca) {
            this.selection.clear();
            this.paginator.pageIndex = 0;
        }

        this.exibeItensCarregando = true;
        //this.temItens = false;

        if (this.buscaFormGroup.value.periodo.startDate != null) {
            this.buscaFormGroup.patchValue({
                periodo: {
                    startDate: this.buscaFormGroup.value.periodo.startDate.format('YYYY-MM-DD'),
                    endDate: this.buscaFormGroup.value.periodo.endDate.format('YYYY-MM-DD'),
                }
            })
        }

        let requisicao: RequisicaoBuscaCotacoesComprasModel =
        {
            paginacao: {
                paginaAtual: this.paginator.pageIndex,
                itensPorPagina: this.paginator.pageSize,
                colunaOrdenacao: this.sort.active,
                direcaoOrdenacao: this.sort.direction
            },
            filtroLojaIds: this.filtroLojas.obterLojasSelecionadas(),
            filtroData: this.buscaFormGroup.value.filtroData,
            filtroId: Number(this.buscaFormGroup.value.filtroId),
            filtroSituacao: this.buscaFormGroup.value.filtroSituacao,
            periodo: this.buscaFormGroup.value.periodo.startDate != null ? this.buscaFormGroup.value.periodo : null,
        };

        this._comprasService.buscarCotacoesCompras(requisicao).subscribe((resultado) => {

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

    excluirSelecionadas() {

        Swal.fire({
            title: 'Exclusão de cotações',
            text: "Deseja excluir as cotações selecionadas?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir todas!',
            cancelButtonText: 'Não!',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {

                let requisicao: RequisicaoExclusaoCotacoesComprasModel = {
                    cotacaoIds: this.selection.selected
                };

                Swal.fire({
                    title: 'Aguarde...',
                    html: 'Estamos excluindo as cotações...',
                    allowOutsideClick: false,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                    }
                });

                this._comprasService.excluirCotacoesCompras(requisicao).subscribe(resultado => {

                    if (resultado == 0) {
                        Swal.fire('Ops!', 'Nenhuma das cotações selecionadas foi excluída devido ao seu status atual.', 'warning');
                    }
                    else {
                        Swal.fire('Pronto!', 'As cotações foram excluídas com sucesso!', 'success');
                        this.buscarItens(true);
                    }
                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        });
    }

    copiarCotacao(id: number) {

        Swal.fire({
            title: 'Aguarde...',
            html: 'Estamos copiando sua cotação...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });

        this._comprasService.copiarCotacao(id).subscribe((result) => {

            Swal.close();
            Swal.fire('Pronto!', 'Cotação copiada com sucesso!<br />O ID da sua nova cotação é ' + result + '.', 'success');
            this.buscarItens(true);

        }, (err) => {

            Swal.close();
                Swal.fire('Ops!', 'Não conseguimos copiar a cotação. Por favor, tente novamente.<br />' + err.error.Message, 'error');
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
        this.obterDadosDefault();
        this.buscarItens(true);
        this.paginator.page.subscribe(() => {
            this.buscarItens(false);
        });
        this.sort.sortChange.subscribe(() => {
            this.paginator.pageIndex = 0
            this.buscarItens(false);
        });

        //this.editarItem({ cotacaoId: 176 });
    }

    ngOnDestroy(): void {
    }
}