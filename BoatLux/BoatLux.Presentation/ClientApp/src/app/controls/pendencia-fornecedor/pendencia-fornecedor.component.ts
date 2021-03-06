import { Component, OnInit, Input, Inject, ViewChild, AfterViewInit, AfterContentChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CadastroService } from '../../services/cadastro.service';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { PendenciaFornecedorModel, RequisicaoBuscaPendenciasFornecedorModel } from '../../interfaces/cadastro.interface';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ControlesCadastroPendenciaFornecedorComponent } from './cadastro-pendencia-fornecedor/cadastro-pendencia-fornecedor.component';

export interface ControlesPendenciaFornecedorComponentData {
    fornecedorId: number;
    razao?: string;
}

@Component({
    selector: 'pendencia-fornecedor',
    templateUrl: './pendencia-fornecedor.component.html'
})

export class ControlesPendenciaFornecedorComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<ControlesPendenciaFornecedorComponent>,
        private _matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: ControlesPendenciaFornecedorComponentData,
        private _formBuilder: FormBuilder,
        private _cadastroService: CadastroService) {

        this.razao = data.razao;
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    ranges: any = {
        'Hoje': [moment(), moment()],
        'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        '??ltimos 7 dias': [moment().subtract(6, 'days'), moment()],
        '??ltimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'M??s atual': [moment().startOf('month'), moment().endOf('month')],
        'M??s passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    };

    //Datasources    
    itensDataSource = new MatTableDataSource<PendenciaFornecedorModel>();

    //Indicadores de loading    
    estaCarregandoItens = false;
    temItens = false;

    razao: string;

    //Defini????o do formul??rio de busca
    buscaFormGroup = this._formBuilder.group(
        {
            periodo: [],
            situacao: ['AB']
        }
    );

    //Defini????es de colunas    
    colunasDef = ['pendenciaId', 'data', 'descricao', 'descricaosituacao', 'valor', 'acoes'];

    // -----------------------------------------------------------------------------------------------------
    // @ M??todos
    // -----------------------------------------------------------------------------------------------------    

    buscarPendencias(): void {

        //Ativa os flags de carregamento        
        this.estaCarregandoItens = true;

        if (this.buscaFormGroup.value.periodo != null) {
            if (this.buscaFormGroup.value.periodo.startDate != null) {
                this.buscaFormGroup.patchValue({
                    periodo: {
                        startDate: this.buscaFormGroup.value.periodo.startDate.format('YYYY-MM-DD'),
                        endDate: this.buscaFormGroup.value.periodo.endDate.format('YYYY-MM-DD'),
                    }
                })
            }
            else {
                this.buscaFormGroup.value.periodo = null;
            }
        }

        let requisicao: RequisicaoBuscaPendenciasFornecedorModel =
        {
            paginacao: {
                paginaAtual: this.paginator.pageIndex,
                itensPorPagina: this.paginator.pageSize,
                colunaOrdenacao: this.sort.active,
                direcaoOrdenacao: this.sort.direction
            },

            fornecedorId: this.data.fornecedorId,
            periodo: this.buscaFormGroup.value.periodo != null ? this.buscaFormGroup.value.periodo : null,
            situacao: this.buscaFormGroup.value.situacao,
        };

        this._cadastroService.fornecedor_BuscarPendencias(requisicao).subscribe(result => {

            this.itensDataSource = new MatTableDataSource(result.itens);
            this.estaCarregandoItens = false;
            this.temItens = result.itens.length > 0;
            this.paginator.length = result.paginacao.totalItens;


        }, err => {
            Swal.fire('Ops!', 'N??o foi poss??vel buscar pend??ncias do fornecedor. ' + err.error.Message, 'error');
        });
    }

    novaPendencia(): void {

        const dialog = this._matDialog.open(ControlesCadastroPendenciaFornecedorComponent, {
            width: '65%',
            height: '75%',
            data: {
                fornecedorId: this.data.fornecedorId,
            }
        });

        dialog.afterClosed().subscribe(result => {
            this.buscarPendencias();
        });
    }

    editarPendencia(item: PendenciaFornecedorModel): void {

        const dialog = this._matDialog.open(ControlesCadastroPendenciaFornecedorComponent, {
            width: '65%',
            height: '75%',
            data: {
                fornecedorId: this.data.fornecedorId,
                pendenciaId: item.pendenciaId
            }
        });

        dialog.afterClosed().subscribe(result => {
            this.buscarPendencias();
        });
    }

    excluirPendencia(item: PendenciaFornecedorModel): void {

        Swal.fire({
            title: 'Aten????o',
            text: "Deseja excluir a pend??ncia " + item.pendenciaId + "?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'N??o!',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
                this._cadastroService.fornecedor_ExcluirPendencia(item.pendenciaId).subscribe(() => {
                    Swal.fire('Pronto!', 'A pend??ncia foi exclu??da com sucesso!', 'success');
                    this.buscarPendencias();
                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        })
    }

    obterSituacaoTratada(item: PendenciaFornecedorModel) {
        switch (item.situacao) {
            case 'AB':
                return 'Aberta';
            case 'CA':
                return 'Cancelada'
            case 'F':
                return 'Finalizada'

            default: return 'Aberta'
        }
    }

    obterDescricaoReduzida(item: PendenciaFornecedorModel): string {
        return item.descricao != null && item.descricao.length > 130 ? item.descricao.substring(0, 130) : item.descricao;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ M??todos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        this.buscarPendencias();

        //Se inscreve no evento de pagina????o para disparar o m??todo de busca
        this.paginator.page.subscribe(() => {
            //Busca os itens
            this.buscarPendencias();
        });

        //Se inscreve no evento de ordena????o para disparar o m??todo de busca
        this.sort.sortChange.subscribe(() => {

            //For??a exibir a primeira p??gina
            this.paginator.pageIndex = 0

            //Busca os itens
            this.buscarPendencias();
        });
    }
}