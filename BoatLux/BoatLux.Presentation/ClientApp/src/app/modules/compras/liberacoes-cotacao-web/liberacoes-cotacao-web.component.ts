import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { RequisicaoBuscaCotacoesComprasModel, ItemBuscaLiberacoesCotacaoWebModel, RequisicaoRelatorioItensCotacaoModel, ItensCotacaoModel } from '../../../interfaces/compras.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2'
import { ComprasService } from '../../../services/compras.service';
import { DialogService } from '../../../services/dialog.service';
import { ControlesBuscaRapidaComponent } from '../../../controls/busca-rapida/busca-rapida.component';
import { ControlesComboLojaComponent } from '../../../controls/combo-loja/combo-loja.component';
import { SelectionModel } from '@angular/cdk/collections';
import { ComponentService, Modulos } from '../../../services/component.service';
import { ControlesLegendaComponent } from '../../../controls/legenda/legenda.component';
import { LiberaCotacaoWebDialogComponent } from './libera-cotacao-web-dialog/libera-cotacao-web-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ReenviaSenhaCotacaoDialogComponent } from './reenvia-senha-cotacao-dialog/reenvia-senha-cotacao-dialog.component';
import * as moment from 'moment';

@Component({
    selector: 'liberacoes-cotacao-web',
    templateUrl: './liberacoes-cotacao-web.component.html',
    encapsulation: ViewEncapsulation.None
})

export class LiberacoesCotacaoWebComponent implements OnInit, OnDestroy, AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _dialogService: DialogService,
        private _comprasService: ComprasService,
        private _componentService: ComponentService
    ) {
        this._componentService.DefinirModuloAtual(Modulos.Compras);
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    
    //Componentes
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('filtroLojas') filtroLojas: ControlesComboLojaComponent;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    // Per??odos pr?? definidos do componente 
    ranges: any = {
        'Hoje': [moment(), moment()],
        'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        '??ltimos 7 dias': [moment().subtract(6, 'days'), moment()],
        '??ltimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'M??s atual': [moment().startOf('month'), moment().endOf('month')],
        'M??s passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    };

    //Armazena os produtos em mem??ria
    itensDataSource: ItemBuscaLiberacoesCotacaoWebModel[];

    //Flag que indica se os itens est??o sendo carregados
    exibeItensCarregando = false;
    temItens = false;

    //Defini????o do formul??rio de busca
    buscaFormGroup = this._formBuilder.group(
        {
            periodo: [],
            filtroId: []
        }
    );


    //Colunas do grid
    colunasItens = ['cotacaoId', 'lojaId', 'razaoLoja', 'data', 'situacao', 'dataValidade', 'horaValidade', 'existeFornecedor', 'exportadoWeb', 'pedidoGerado', 'acoes'];
    // -----------------------------------------------------------------------------------------------------
    // M??todos
    // -----------------------------------------------------------------------------------------------------    

    liberarCotacao(item: ItemBuscaLiberacoesCotacaoWebModel): void {

        this._dialogService.abrirDialogGrande(LiberaCotacaoWebDialogComponent,
            {
                idCotacao: item.cotacaoId,
                idLoja: item.lojaId,
                dataCotacao: item.data,
                existeFornecedor: item.existeFornecedor,
                exportadoWeb: item.exportadoWeb,
            }
        ).subscribe(result => {
            this.buscarItens(true);
        });
    }

    imprimirBusca(item: ItensCotacaoModel, formato: number, visualizar: boolean = false): void {

        let requisicao: RequisicaoRelatorioItensCotacaoModel =
        {
            formato: formato,
            cotacaoId: item.cotacaoId,
            lojaId: item.lojaId
        };

        this._comprasService.gerarRelatorioItensCotacao(requisicao, 'Itens da cota????o', visualizar);
    }

    reenviarSenha(item: ItensCotacaoModel): void {

        const dialog = this._matDialog.open(ReenviaSenhaCotacaoDialogComponent, {
            width: '80%',
            data: {
                idCotacao: item.cotacaoId,
                lojaId: item.lojaId
            },
            disableClose: true
        });

        dialog.afterClosed().subscribe(result => {
            if (result && result.sucesso)
                this.buscarItens(true);
        });
    }

    excluirCotacao(item: ItensCotacaoModel): void {

        // Falta validar se a situa????o ?? Aberto
        Swal.fire({
            title: 'Aten????o',
            text: "Deseja excluir a cota????o " + item.cotacaoId + "?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'N??o!',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
                this._comprasService.excluirCotacaoCompra(item.cotacaoId).subscribe((resultado) => {

                    Swal.fire('Pronto!', 'A cota????o foi exclu??da com sucesso!', 'success');
                    this.buscarItens(false);

                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        })
    }

    obterDadosDefault(): void {
        this.buscaFormGroup.reset({
            periodo: {
                startDate: new Date(new Date().setDate(new Date().getDate() - 15)),
                endDate: new Date()
            },
            filtroId: ''
        });
    }

    buscarItens(novaBusca: boolean): void {

        this.exibeItensCarregando = true;

        if (novaBusca) {
            this.paginator.pageIndex = 0;
        }

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
            periodo: this.buscaFormGroup.value.periodo.startDate != null ? this.buscaFormGroup.value.periodo : null,
            filtroId: Number(this.buscaFormGroup.value.filtroId),
        };

        this._comprasService.buscarLiberacoesCotacaoWeb(requisicao).subscribe((resultado) => {

            this.exibeItensCarregando = false;
            this.temItens = resultado.itens.length > 0;
            this.itensDataSource = resultado.itens;

            this.legenda.quantidadeResultados = resultado.paginacao.totalItens;
            this.paginator.length = resultado.paginacao.totalItens;

        }, (err) => {

            this.exibeItensCarregando = false;

            Swal.fire({
                title: 'Ops!',
                text: "N??o conseguimos concluir a busca, deseja tentar novamente??",
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim!',
                cancelButtonText: 'N??o!'
            }).then((result) => {
                if (result.value) {
                    this.buscarItens(novaBusca);
                }
            })
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // M??todos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        // Traz um per??odo padr??o para a busca
        this.obterDadosDefault();

        this.buscarItens(true);
        this.paginator.page.subscribe(() => {
            this.buscarItens(false);
        });
        this.sort.sortChange.subscribe(() => {
            this.paginator.pageIndex = 0
            this.buscarItens(false);
        });
    }
    ngOnDestroy(): void {
    }
    ngOnInit(): void {
    }

}