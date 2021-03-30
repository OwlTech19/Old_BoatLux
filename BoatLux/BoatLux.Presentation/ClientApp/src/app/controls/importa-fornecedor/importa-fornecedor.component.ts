import { Component, OnInit, Input, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';
// Services
import { CadastroService } from '../../services/cadastro.service';
// Components
import { ControlesLegendaComponent } from '../legenda/legenda.component';
import { ControlesBuscaRapidaComponent } from '../busca-rapida/busca-rapida.component';
// Interfaces
import { FornecedorCotacaoModel } from 'app/interfaces/compras.interface';
import { FornecedorImportacaoModel, RequisicaoBuscaFornecedoresImportacaoModel } from '../../interfaces/cadastro.interface';

export interface ControlesImportaFornecedorComponentData {
    listaDeFornecedoresAdicionados?: number[];
    somenteFornecedoresComContato?: boolean;
}

@Component({
    selector: 'controles-importa-fornecedor',
    templateUrl: './importa-fornecedor.component.html'
})

export class ControlesImportaFornecedorComponent implements OnInit, AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------

    constructor(
        public dialogRef: MatDialogRef<ControlesImportaFornecedorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ControlesImportaFornecedorComponentData,
        private _formBuilder: FormBuilder,
        private _cadastroService: CadastroService) {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('tipofornecedor') tipofornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    //Datasources    
    itensDataSource = new MatTableDataSource<FornecedorImportacaoModel>();
    fornecedoresAdicionados: FornecedorImportacaoModel[] = [];

    //Indicadores de loading    
    estaCarregandoItens: boolean;

    //Definições de colunas    
    colunasDef = ['fornecedorId', 'razao', 'contato', 'celular', 'email', 'contatoId', 'acoes'];

    //Definição do formulário de busca
    buscaFormGroup = this._formBuilder.group(
        {
            filtroRazao: [],
            filtroId: [],
            filtroCnpjCpf: []
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    desabilitarFornecedor(fornecedor: FornecedorCotacaoModel): boolean {

        let ret = false;
        if (this.data.listaDeFornecedoresAdicionados != null) {
            if (this.data.listaDeFornecedoresAdicionados.length > 0) {
                this.data.listaDeFornecedoresAdicionados.forEach(itemLista => {
                    if (fornecedor.fornecedorId === itemLista) {
                        ret = true;
                    }
                });
            }
        }

        return ret;
    }

    buscarFornecedores(novaBusca: boolean): void {

        //Ativa os flags de carregamento        
        this.estaCarregandoItens = true;

        if (novaBusca) {
            this.paginator.pageIndex = 0;
        }

        let requisicao: RequisicaoBuscaFornecedoresImportacaoModel =
        {
            paginacao: {
                paginaAtual: this.paginator.pageIndex,
                itensPorPagina: this.paginator.pageSize,
                colunaOrdenacao: this.sort.active,
                direcaoOrdenacao: this.sort.direction
            },

            fornecedorId: Number(this.buscaFormGroup.value.filtroId),
            razao: this.buscaFormGroup.value.filtroRazao,
            cnpjCpf: this.buscaFormGroup.value.filtroCnpjCpf,
            tipoFornecedor: Number(this.tipofornecedor.obterCodigoSelecionado())
        };

        //Resumo de categoria
        this._cadastroService.fornecedores_BuscarFornecedoresImportacao(requisicao).subscribe(result => {
            let resultados = result.itens;

            if (this.fornecedoresAdicionados.length > 0) {
                // Itera os produtos do Resultado da busca
                resultados.forEach(resultado => {
                    //Verifica se o item já foi adicionado anteriormente
                    var fornecedorExistente = this.fornecedoresAdicionados.find(adicionados => adicionados.fornecedorId === resultado.fornecedorId);
                    // Caso sim, adiciona a quantidade no Resultado
                    if (fornecedorExistente != null) {
                        this.fornecedorAdicionado(fornecedorExistente);
                    }
                });
            }

            this.estaCarregandoItens = false;
            this.itensDataSource = new MatTableDataSource(resultados);
            this.paginator.length = result.paginacao.totalItens;
            this.paginator.page.subscribe(() => {

                //este trecho vai ser executado quando houver uma mudança de página ou tamanho da página
                //this.buscarFornecedores();

            });

        }, error => {
            alert(error);
        });
    }

    //Limpa os filtros e busca novamente
    limparBusca(): void {

        this.buscaFormGroup.reset();
        this.buscarFornecedores(true);
    }

    adicionarFornecedor(fornecedor: FornecedorImportacaoModel) {

        this.fornecedoresAdicionados.push(fornecedor);

        this.fornecedorAdicionado(fornecedor);
    }

    removerFornecedor(fornecedor: FornecedorImportacaoModel): void {

        //this.fornecedoresAdicionados.splice(fornecedor.fornecedorId, 1);

        this.fornecedoresAdicionados = this.fornecedoresAdicionados.filter(function (item) {
            return item.fornecedorId != fornecedor.fornecedorId;
        });
    }

    concluirImportacao(): void {

        if (this.data.somenteFornecedoresComContato) {

            let fornecedoresInvalidos = this.fornecedoresAdicionados.filter(fornecedor => {
                return fornecedor.celular == null && fornecedor.email == null
            });

            if (fornecedoresInvalidos != null && fornecedoresInvalidos.length > 0) {
                Swal.fire({
                    title: 'Atenção',
                    text: "Foram selecionados fornecedores sem e-mail ou celular, eles não serão inclusos na cotação. Confirma a importação apenas dos fornecedores válidos?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sim!',
                    cancelButtonText: 'Não, quero revisar!'
                }).then((result) => {
                    if (result.value) {

                        let fornecedoresValidos = this.fornecedoresAdicionados.filter(fornecedor => {
                            return fornecedor.celular != null || fornecedor.email != null
                        });

                        this.dialogRef.close(fornecedoresValidos);
                    }
                })
            }
            else {
                this.dialogRef.close(this.fornecedoresAdicionados);
            }
        }
        else {
            this.dialogRef.close(this.fornecedoresAdicionados);
        }
    }

    fornecedorAdicionado(fornecedor: FornecedorImportacaoModel): boolean {

        if (this.fornecedoresAdicionados.find(i => i.fornecedorId == fornecedor.fornecedorId))
            return true;
        else
            return false;
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        this.buscarFornecedores(true);
        this.paginator.page.subscribe(() => {
            this.buscarFornecedores(false);
        });
        this.sort.sortChange.subscribe(() => {
            this.paginator.pageIndex = 0
            this.buscarFornecedores(false);
        });
    }
    ngOnInit(): void {
    }
}