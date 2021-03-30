import { Component, OnInit, Input, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
// Services
import { CadastroService } from '../../services/cadastro.service';
// Components
import { ControlesLegendaComponent } from '../legenda/legenda.component';
// Interfaces
import { RequisicaoBuscaProdutosImportacaoModel, ProdutoImportacaoModel } from '../../interfaces/cadastro.interface';

export interface ControlesImportaProdutoComponentData {
    multiplosProdutos: boolean;
    listaDeProdutosAdicionados?: number[];
    lojas?: number[];
    fornecedorId?: number;
}

@Component({
    selector: 'controles-importa-produto',
    templateUrl: './importa-produto.component.html'
})

export class ControlesImportaProdutoComponent implements OnInit, AfterViewInit {

    constructor(
        public dialogRef: MatDialogRef<ControlesImportaProdutoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ControlesImportaProdutoComponentData,
        private _formBuilder: FormBuilder,
        private _cadastroService: CadastroService) {

        this.multiplosProdutos = data.multiplosProdutos;
        this.fornecedorId = Number(data.fornecedorId);

    }

    @ViewChild('itensPaginator', { static: true }) itensPaginator: MatPaginator;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    fornecedorId: number;

    //Datasources    
    itensDataSource = new MatTableDataSource<ProdutoImportacaoModel>();
    produtosAdicionados: ProdutoImportacaoModel[] = [];

    //Indicadores de loading    
    estaCarregandoItens: boolean = false;
    multiplosProdutos: boolean;

    //Definições de colunas    
    colunasDef = ['prodId', 'barra', 'descricao', 'acoes'];

    //Definição do formulário de busca
    buscaFormGroup = this._formBuilder.group(
        {
            filtroId: [],
            filtroDescricao: [],
            filtroBarra: [],
            somenteProdutosFornecedor: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // -----------------------------------------------------------------------------------------------------        

    // Verifica e não deixa inserir o mesmo produto mais de uma vez
    desabilitarProduto(prodId: number): boolean {

        let ret = false;

        if (this.data.listaDeProdutosAdicionados != null) {

            if (this.data.listaDeProdutosAdicionados.length > 0) {

                this.data.listaDeProdutosAdicionados.forEach(itemLista => {

                    if (prodId == itemLista)
                        ret = true;
                });
            }
        }

        return ret;
    }

    // Opções dentro do grid
    aumentarQuantidade(produto: ProdutoImportacaoModel, acrescentaUm: boolean) {

        if (produto.itens[0].quantidade == null) {

            produto.itens.forEach(i => {
                i.quantidade = 0;
            });
        }

        if (acrescentaUm) {

            produto.itens.forEach(i => {
                i.quantidade++;
            });
        }

        if (produto.itens[0].quantidade > 0) {

            let itemExistente = this.produtosAdicionados.find(i => i.barra == produto.barra);

            if (itemExistente != null) {

                itemExistente.itens.forEach(i => {
                    i.quantidade = produto.itens[0].quantidade
                });
            }
            else {
                this.produtosAdicionados.push(produto);
            }
        }
    }

    diminuirQuantidade(produto: ProdutoImportacaoModel) {

        if (produto.itens[0].quantidade == null) {

            produto.itens.forEach(i => {
                i.quantidade = 0;
            });
        }

        if (produto.itens[0].quantidade >= 1) {

            produto.itens.forEach(i => {
                i.quantidade--;
            });

            let itemExistente = this.produtosAdicionados.find(i => i.barra == produto.barra);

            if (itemExistente != null) {

                if (produto.itens[0].quantidade == 0) {

                    //Remove
                    this.produtosAdicionados = this.produtosAdicionados.filter(function (item) {
                        return item.barra !== produto.barra
                    })
                }
                else {

                    itemExistente.itens.forEach(i => {
                        i.quantidade = produto.itens[0].quantidade
                    });
                }

            }
            else {
                if (produto.itens[0].quantidade > 0)
                    this.produtosAdicionados.push(produto);
            }

        }
    }

    zerarQuantidade(produto: ProdutoImportacaoModel) {

        let itemExistente = this.produtosAdicionados.find(i => i.barra == produto.barra);
        if (itemExistente != null) {

            itemExistente.itens.forEach(i => {
                i.quantidade = 0;
            })

            //Remove
            this.produtosAdicionados = this.produtosAdicionados.filter(function (item) {
                return item.barra !== produto.barra
            });
        }
    }

    adicionarProduto(produto: ProdutoImportacaoModel) {
        this.dialogRef.close(produto);
    }

    // Conclui a importação, retornando os produtos adicionados
    concluirImportacao() {
        this.dialogRef.close(this.produtosAdicionados);
    }

    //Limpa os filtros e busca novamente
    limparBusca(): void {

        this.buscaFormGroup.reset();
        this.buscarProdutos();
    }

    // Busca os produtos no serviço
    buscarProdutos(): void {

        //Ativa os flags de carregamento        
        this.estaCarregandoItens = true;

        let requisicao: RequisicaoBuscaProdutosImportacaoModel =
        {
            filtroId: this.buscaFormGroup.value.filtroId,
            filtroDescricao: this.buscaFormGroup.value.filtroDescricao != null ? this.buscaFormGroup.value.filtroDescricao.trim() : null,
            lojas: this.data.lojas,
            filtroBarra: this.buscaFormGroup.value.filtroBarra != null && this.buscaFormGroup.value.filtroBarra != '' ? this.buscaFormGroup.value.filtroBarra.trim() : null,
            somenteProdutosFornecedor: Number(this.buscaFormGroup.value.somenteProdutosFornecedor),
            fornecedorId: Number(this.data.fornecedorId),
        };

        //Resumo de categoria
        this._cadastroService.produtos_BuscarProdutosImportacao(requisicao).subscribe(result => {

            this.legenda.quantidadeResultados = result.length;

            // Verifica se entre os itens retornados na busca, algum já foi adicionado. Caso sim, obtem a quantidade para exibir na tela
            if (this.produtosAdicionados.length > 0) {

                // Itera os produtos do Resultado da busca
                result.forEach(produto => {

                    //Verifica se o item já foi adicionado anteriormente
                    var produtoExistente = this.produtosAdicionados.find(adicionados => adicionados.barra == produto.barra);

                    // Caso sim, adiciona a quantidade no Resultado
                    if (produtoExistente != null) {

                        produto.itens.forEach(itemLoja => {
                            // Aqui precisa ver pra carregar os itens já adicionados
                            itemLoja.quantidade = produtoExistente[0].quantidade;
                        });
                    }
                });
            }

            this.itensDataSource = new MatTableDataSource(result);
            this.itensDataSource.paginator = this.itensPaginator;
            this.estaCarregandoItens = false;
        }, error => {
            Swal.fire("Ops!", "Não conseguimos buscar produtos. Tente novamente!", 'error');
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
        * On init
        */
    ngOnInit(): void {
    }

    ngAfterViewInit(): void {

        // Nada por enquanto
    }
}