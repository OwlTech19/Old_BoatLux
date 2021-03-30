import { Component, ViewChild, Inject, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ComprasService } from '../../../../services/compras.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import Swal from 'sweetalert2'
import { DialogService } from '../../../../services/dialog.service';
import { error } from '@angular/compiler/src/util';
import { MatTabGroup } from '@angular/material/tabs';
import { FornecedorImportacaoModel } from '../../../../interfaces/cadastro.interface';
import { RequisicaoLiberarCotacaoWebModel, RequisicaoBuscaFornecedorCotacaoModel, FornecedorCotacaoModel, RequisicaoOperacaoFornecedorCotacaoWebModel } from '../../../../interfaces/compras.interface';
import * as moment from 'moment';

export interface DialogData {
    idCotacao: number;
    idLoja: number;
    dataCotacao: string;
    existeFornecedor: number;
}

@Component({
    selector: 'libera-cotacao-web-dialog',
    templateUrl: './libera-cotacao-web-dialog.component.html',
})

export class LiberaCotacaoWebDialogComponent implements OnInit, AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<LiberaCotacaoWebDialogComponent>,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService,
        private _dialogService: DialogService,
        private _matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private el: ElementRef) {

        this.titulo = "Liberar cotação #" + data.idCotacao + " para web";
        this.idLoja = data.idLoja;
        this.idCotacao = data.idCotacao;
        this.dataCotacao = data.dataCotacao.split("/").reverse().join("-");
        this.existeFornecedor = data.existeFornecedor >= 1;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em memória
    fornecedoresDataSource = new MatTableDataSource<FornecedorImportacaoModel>();
    //Armazena os produtos em memória


    //Flag que indica se os itens estão sendo carregados
    temItens = false;

    titulo: string;
    idLoja: number;
    dataCotacao: string;
    idCotacao: number;
    existeFornecedor: boolean;
    step1: FormGroup;
    step2: FormGroup;

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    // Tratamentos para o campo validade da cotação
    locale: any = {
        format: 'YYYY-MM-DDTHH:mm:ss.SSSSZ',
        displayFormat: 'DD/MM/YYYY HH:mm',
        applyLabel: 'OK',
    };

    minDate: moment.Moment = moment();

    //Filtro de descrição no grid de fornecedores
    filtroDescricaoFornecedores: string = '';

    //Definição dos formulários
    prazoFormGroup = this._formBuilder.group(
        {
            validadeCotacao: [],
            verCustoRef: []
        }
    );

    //Colunas do grid
    colunasItens = ['fornecedorId', 'razao', 'email', 'celular', 'acoes'];

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // -----------------------------------------------------------------------------------------------------    

    adicionarFornecedores() {

        this._dialogService.importarMultiplosFornecedores(this.fornecedoresDataSource.data.map(i => i.fornecedorId), true).subscribe(resultado => {
            if (resultado != null) {
                resultado.forEach(fornecedor => {
                    var fornecedorExistente = this.fornecedoresDataSource.data.find(value => value.fornecedorId === fornecedor.fornecedorId);
                    if (fornecedorExistente != null) {
                        //produtoExistente. = produto.quantidade;
                    }
                    else {

                        let novoItem: FornecedorImportacaoModel = {
                            fornecedorId: fornecedor.fornecedorId,
                            razao: fornecedor.razao,
                            celular: fornecedor.celular,
                            email: fornecedor.email,
                            contatoId: fornecedor.contatoId
                        }

                        this.fornecedoresDataSource.data.push(novoItem);
                        this.fornecedoresDataSource._updateChangeSubscription();
                        this.temItens = true;
                    }
                });
                this.adicionarFornecedor();
                //Swal.fire('Pronto!', 'Os fornecedores foram adicionados a cotação.', 'success');
            }
        });
    }

    //Aplica os filtros de tela do grid de produtos
    aplicarFiltroFornecedores() {
        //Remove espaços em branco e deixa em minúsculo
        let filtro = this.filtroDescricaoFornecedores.trim().toLowerCase();
        this.fornecedoresDataSource.filter = filtro;
        //Configura o filtro
        this.fornecedoresDataSource.filterPredicate =
            (data: FornecedorImportacaoModel, filter: string) => (!isNaN(Number(filter)) && data.fornecedorId == Number(filter)) || (isNaN(Number(filter)) && data.razao.toLowerCase().indexOf(filter) != -1);
    }

    carregarFornecedores(): void {

        this.temItens = false;

        let requisicao: RequisicaoBuscaFornecedorCotacaoModel =
        {
            paginacao: {
                paginaAtual: this.paginator.pageIndex,
                itensPorPagina: this.paginator.pageSize,
                colunaOrdenacao: this.sort.active,
                direcaoOrdenacao: this.sort.direction
            },

            cotacaoId: this.idCotacao,
            lojaId: this.idLoja,
        };

        this._comprasService.buscarFornecedoresCotacaoWeb(requisicao).subscribe((resultado) => {

            this.temItens = resultado.itens.length > 0;
            this.fornecedoresDataSource = new MatTableDataSource<FornecedorCotacaoModel>(resultado.itens);

            this.paginator.length = resultado.paginacao.totalItens;
            this.paginator.page.subscribe(() => {

                //este trecho vai ser executado quando houver uma mudança de página ou tamanho da página
                this.carregarFornecedores();

            });

        }, (err) => {

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
                    this.carregarFornecedores();
                }
            });
        });
    }

    removerFornecedor(item: FornecedorImportacaoModel) {

        Swal.fire({
            title: 'Atenção',
            text: "Deseja mesmo remover o fornecedor '" + item.razao + "' da cotação?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, remover!',
            cancelButtonText: 'Não remover!',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {

                let requisicao: RequisicaoOperacaoFornecedorCotacaoWebModel =
                {
                    cotacaoId: this.idCotacao,
                    lojaId: this.idLoja,
                    dataCotacao: this.dataCotacao,
                    fornecedor: item.fornecedorId,
                    fornecedores: this.fornecedoresDataSource.data
                };

                this._comprasService.removerFornecedorCotacaoWeb(requisicao).subscribe((resultado) => {
                    Swal.close();

                }, (err) => {
                    Swal.fire('Ops!', 'Não foi possível remover o fornecedor. Tente novamente.', 'error');
                });

                this.fornecedoresDataSource.data = this.fornecedoresDataSource.data.filter((value, key) => {
                    return value.fornecedorId !== item.fornecedorId;
                });

            }
        });
    }

    private adicionarFornecedor() {
        // Refreshing table using paginator        
        let requisicao: RequisicaoOperacaoFornecedorCotacaoWebModel =
        {
            cotacaoId: this.idCotacao,
            lojaId: this.idLoja,
            dataCotacao: this.dataCotacao,
            fornecedores: this.fornecedoresDataSource.data,
            fornecedor: null
        };

        this._comprasService.adicionarFornecedorCotacaoWeb(requisicao).subscribe((resultado) => {
            Swal.close();

        }, (err) => {
            Swal.fire('Ops!', 'Não foi possível adicionar os fornecedores. Tente novamente.', 'error');
        });
        //this.paginator._changePageSize(this.paginator.pageSize);
    }

    liberarCotacao(): void {

        Swal.fire({
            title: 'Tá quase...',
            html: 'Estamos enviando sua cotação para os fornecedores, aguarde...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });

        if ((this.fornecedoresDataSource.data != null && this.fornecedoresDataSource.data.length > 0) || this.existeFornecedor) {
            if (this.prazoFormGroup.value.validadeCotacao != null) {

                // Formatar data e hora do componente
                let horaFormatada = moment(this.prazoFormGroup.value.validadeCotacao.startDate).format("HH:mm");

                let requisicao: RequisicaoLiberarCotacaoWebModel =
                {
                    cotacaoId: this.idCotacao,
                    lojaId: this.idLoja,
                    dataValidade: this.prazoFormGroup.value.validadeCotacao.startDate,
                    hora: horaFormatada,
                    dataCotacao: this.dataCotacao,
                    enviaCusto: Number(this.prazoFormGroup.value.verCustoRef),
                    fornecedores: this.fornecedoresDataSource.data,
                }

                this._comprasService.liberarCotacaoWeb(requisicao).subscribe((resultado) => {
                    Swal.close();

                    if (resultado.sucesso) {
                        Swal.fire(
                            'Pronto!',
                            'A cotação está disponível para os fornecedores!',
                            'success').then((result) => {

                                this.dialogRef.close();

                            });
                    }
                }, (err) => {
                    Swal.fire('Ops!', 'Não foi possível disponibilizar a cotação aos fornecedores. Tente novamente.', 'error');
                });
            }
            else {
                this.tabGroup.selectedIndex = 1;
                Swal.fire('Ops!', 'Para liberar a cotação para web, é necessário informar data de validade e hora.', 'warning');
            }
        }
        else {
            this.tabGroup.selectedIndex = 0;
            Swal.fire('Ops!', 'Para liberar a cotação para web, é necessário adicionar ao menos um fornecedor.', 'warning');
        }
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Métodos ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        this.carregarFornecedores();
    }

    ngOnInit(): void {
        // this.firstFormGroup = this._formBuilder.group({
        //     firstCtrl: ['', Validators.required]
        // });
        // this.secondFormGroup = this._formBuilder.group({
        //     secondCtrl: ['', Validators.required]
        // });
    }
}