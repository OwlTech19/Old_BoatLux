import { Component, OnInit, Input, Inject, ViewChild, AfterViewInit, AfterContentChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder } from '@angular/forms';
import { ControlesBuscaRapidaComponent } from '../busca-rapida/busca-rapida.component';
import { MatSort } from '@angular/material/sort';
import { RequisicaoConsultaProdutosCotacaoModel, ItemEditarCotacaoModel, RequisicaoEditarCotacaoModel } from '../../interfaces/compras.interface';
import { ComprasService } from '../../services/compras.service';
import { ControlesLegendaComponent } from '../legenda/legenda.component';
import Swal from 'sweetalert2';

export interface ControlesEditaCotacaoComponentData {
    cotacaoId: number;
    lojaId: number;
    dataCotacao: Date;
}

@Component({
    selector: 'controles-edita-cotacao',
    templateUrl: './edita-cotacao.component.html'
})

export class ControlesEditaCotacaoComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------

    constructor(
        public dialogRef: MatDialogRef<ControlesEditaCotacaoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ControlesEditaCotacaoComponentData,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService) {

        this.titulo = "Editar cotação " + data.cotacaoId;
        this.cotacaoId = data.cotacaoId;
        this.lojaId = data.lojaId;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('produto') produto: ControlesBuscaRapidaComponent;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    //Armazena os produtos em memória
    itensDataSource: ItemEditarCotacaoModel[];

    //Flag que indica se os produtos estão sendo carregados
    exibeProdutosCarregando = false;
    temItens = false;

    tempIdProdutoExpandido = 0;
    titulo: string;
    cotacaoId: number;
    lojaId: number;

    //Definição do formulário de busca
    filtrosFormGroup = this._formBuilder.group(
        {

        }
    );

    //Colunas do grid
    colunasProdutos = ['prodId', 'barra', 'descricao'];

    //Colunas do grid de fornecedores 
    colunasProdutosFornecedor = [
        { nome: 'Classific', coluna: 'classificacao', visivel: true, editavel: false },
        { nome: 'Cód. Fornec', coluna: 'fornecedorId', visivel: false, editavel: false },
        { nome: 'Fornecedor', coluna: 'razaoSocial', visivel: true, editavel: false },
        { nome: 'Prazo de entrega', coluna: 'prazoEntrega', visivel: true, editavel: false },
        { nome: 'CMV atual', coluna: 'precoCusto', visivel: true, editavel: false },
        { nome: 'Qtd. Unit', coluna: 'qtdComprar', visivel: true, editavel: true },
        { nome: 'Qtd. Emb.', coluna: 'qtdEmbal', visivel: true, editavel: true },
        { nome: 'Total a comprar', coluna: 'qtdTotal', visivel: true, editavel: false },
        { nome: 'R$ Unit.', coluna: 'precoUnit', visivel: true, editavel: true },
        { nome: 'R$ Emb.', coluna: 'precoEmbal', visivel: true, editavel: true },
        { nome: 'R$ Total', coluna: 'valorTotal', visivel: true, editavel: false },
        { nome: 'Variação', coluna: 'variacao', visivel: true, editavel: false },
    ];

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Limpa os filtros e busca novamente
    limparBusca(): void {

        this.filtrosFormGroup.reset();
        this.produto.limpar();
        this.buscarDados();
    }

    buscarDados(): void {

        this.exibeProdutosCarregando = true;
        this.temItens = false;

        let requisicao: RequisicaoConsultaProdutosCotacaoModel =
        {
            paginacao: {
                paginaAtual: this.paginator.pageIndex,
                itensPorPagina: this.paginator.pageSize,
                colunaOrdenacao: this.sort.active,
                direcaoOrdenacao: this.sort.direction
            },
            cotacaoId: this.cotacaoId,
            lojaId: this.lojaId,
            produtoId: this.produto.obterCodigoSelecionado()
        };

        this._comprasService.consultaProdutosCotacao(requisicao).subscribe(resultado => {

            this.exibeProdutosCarregando = false;
            this.temItens = resultado.itens.length > 0;
            this.itensDataSource = resultado.itens;
            this.legenda.quantidadeResultados = resultado.paginacao.totalItens;
            this.paginator.length = resultado.paginacao.totalItens;
            this.paginator.page.subscribe(() => {

                //este trecho vai ser executado quando houver uma mudança de página ou tamanho da página
                //this.buscarItens();

            });

        }, error => {
            alert(error);
        });
    }

    expandirProduto(item: ItemEditarCotacaoModel) {
        if (this.tempIdProdutoExpandido == item.prodId)
            this.tempIdProdutoExpandido = 0;
        else
            this.tempIdProdutoExpandido = item.prodId;
    }

    concluirEdicao(): void {

        // Filtra apenas os produtos que foram alterados
        var produtosAlterados = this.itensDataSource.filter(function (item) {
            return item.alterado;
        });

        if (produtosAlterados != null && produtosAlterados.length > 0) {
            Swal.fire({
                title: 'Edição de cotação de compra',
                text: "Confirma a edição dos preços da cotação?",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, editar valores!',
                cancelButtonText: 'Não!',
                allowOutsideClick: false,

            }).then((result) => {
                if (result.value) {

                    Swal.fire({
                        title: 'Tá quase...',
                        html: 'Estamos atualizando os dados da sua cotação, aguarde...',
                        allowOutsideClick: false,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                        }
                    });

                    let requisicao: RequisicaoEditarCotacaoModel = {

                        itens: produtosAlterados
                    }

                    this._comprasService.editarCotacao(requisicao).subscribe((result) => {
                        Swal.close();
                        if (result.sucesso) {
                            Swal.fire(
                                'Pronto!',
                                'Dados da cotação atualizados.',
                                'success'
                            )
                        }
                    }, (err) => {
                        Swal.fire('Ops!', err.error.Message, 'error');
                    });
                }
            });
        }
        else {
            Swal.fire('Atenção!', 'Nenhum produto foi alterado. Para concluir, altere algum item ou clique em Fechar!', 'warning')
        }
    }

    fecharEdicao(): void {
        Swal.fire({
            title: 'Edição de cotação de compra',
            text: "Deseja realmente sair da edição de cotação de compra?",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, já terminei!',
            cancelButtonText: 'Não!',
            allowOutsideClick: false,

        }).then((result) => {
            if (result.value) {

                this.dialogRef.close()
            }
        });
    }

    // Cálculos
    public calcularPrecoUnitario(precoEmbal: number, qtdEmbal: number): number {
        if (precoEmbal > 0 && qtdEmbal > 0)
            return Number((precoEmbal / qtdEmbal).toFixed(3));
        else
            return 0;
    }

    public calcularQtdTotalComprar(qtdComprar: number, qtdEmbal: number): number {
        return Number((qtdComprar * qtdEmbal).toFixed(3));
    }

    public calcularValorTotalComprar(precoUnit: number, qtdComprar: number, qtdEmbal: number): string {
        return 'R$ ' + (Number(precoUnit) * (Number(qtdComprar) * Number(qtdEmbal))).toFixed(2).toLocaleString();
    }

    public CalcularVariacao(precoUnit: number, precoCusto: number): string {
        return Number((((precoUnit - precoCusto) / precoCusto) * 100).toFixed(2)).toLocaleString() + "%";
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        this.buscarDados();
    }

}