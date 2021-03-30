import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { ComprasService } from '../../../../../services/compras.service';
import { RequisicaoBuscarFornecedoresColunaModel, ResultadoBuscarFornecedoresColunaModel, CotacaoFornecedoresColunaModel } from '../../../../../interfaces/compras.interface';
import { ControlesLegendaComponent } from '../../../../../controls/legenda/legenda.component';

export interface ControlesConsultaFornecedoresColunaComponentData {
    cotacaoId: number;
    lojaId: number;
}

@Component({
    selector: 'consultar-fornecedores-coluna',
    templateUrl: './consultar-fornecedores-coluna.component.html'
})

export class ControlesConsultaFornecedoresColunaComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------

    constructor(
        public dialogRef: MatDialogRef<ControlesConsultaFornecedoresColunaComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ControlesConsultaFornecedoresColunaComponentData,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService) {

        this.titulo = "Visualizar Fornecedores (Coluna) da Cotação " + data.cotacaoId + " - Loja " + data.lojaId;
        this.cotacaoId = data.cotacaoId;
        this.lojaId = data.lojaId;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    //Armazena os produtos em memória
    itensDataSource = new MatTableDataSource<CotacaoFornecedoresColunaModel>();

    listadefornecedores: string[];
    fornecedoresPresentes: string = '|';

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
    colunasProdutos = ['prodId', 'descricao', 'cmv', 'qtdUltCompra'];

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    private carregarFornecedores() {

        this.listadefornecedores.forEach(itemLista => {
            this.fornecedoresPresentes += itemLista + " | "
        });
    }


    buscarItens(): void {

        Swal.fire({
            title: 'Aguarde...',
            html: 'Estamos carregando os dados da cotação...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });

        this.exibeProdutosCarregando = true;
        this.temItens = false;

        let requisicao: RequisicaoBuscarFornecedoresColunaModel =
        {
            paginacao: {
                paginaAtual: this.paginator.pageIndex,
                itensPorPagina: this.paginator.pageSize,
                colunaOrdenacao: this.sort.active,
                direcaoOrdenacao: this.sort.direction
            },
            cotacaoId: this.cotacaoId,
            lojaId: this.lojaId,
        };

        this._comprasService.buscarCotacaoFornecedoresColuna(requisicao).subscribe(resultado => {

            Swal.close();

            //Quando o serviço retornar os dados, atualizar o grid aqui
            this.exibeProdutosCarregando = false;
            this.temItens = resultado.paginacao.totalItens > 0;

            this.listadefornecedores = resultado.listaDeFornecedores;
            this.carregarFornecedores();

            this.legenda.quantidadeResultados = resultado.paginacao.totalItens;
            this.itensDataSource = new MatTableDataSource<CotacaoFornecedoresColunaModel>(resultado.itens);

            //Informa para o paginador o total de itens
            this.paginator.length = resultado.paginacao.totalItens;

            //this.itensDataSource.sort = this.sort;
            //this.itensDataSource.paginator = this.paginator;

        }, error => {
            alert(error);
        });
    }

    expandirProduto(item: CotacaoFornecedoresColunaModel) {
        if (this.tempIdProdutoExpandido == item.prodId)
            this.tempIdProdutoExpandido = 0;
        else
            this.tempIdProdutoExpandido = item.prodId;
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        this.buscarItens();

        //Se inscreve no evento de paginação para disparar o método de busca
        this.paginator.page.subscribe(() => {
            //Busca os itens
            this.buscarItens();
        });

        //Se inscreve no evento de ordenação para disparar o método de busca
        this.sort.sortChange.subscribe(() => {

            //Força exibir a primeira página
            this.paginator.pageIndex = 0

            //Busca os itens
            this.buscarItens();
        });
    }

}