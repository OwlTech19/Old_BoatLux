import { Component, OnInit, Input, Inject, ViewChild, AfterViewInit, AfterContentChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResultadoResumoEntradasNfProdutoModel, ResultadoResumoVendasProdutoModel, ResultadoResumoCategoriaProdutoModel, ResumoCategoriaProdutoModel, ResumoCompraProdutoModel, RequisicaoPadraoResumoProdutoModel, ResultadoResumoFamiliaPrecosModel, ResultadoResumoAlteracoesPrecosModel } from '../../interfaces/cadastro.interface';
import { CadastroService } from '../../services/cadastro.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ControlesComboLojaComponent } from '../combo-loja/combo-loja.component';

export interface DialogData {
    prodId: number;
    descricao: string;
}

@Component({
    selector: 'controles-detalhes-produto',
    templateUrl: './detalhes-produto.component.html',
    styles: ['./detalhes-produto.component.scss']
})

export class ControlesDetalhesProdutoComponent implements OnInit, AfterViewInit {

    constructor(
        public dialogRef: MatDialogRef<ControlesDetalhesProdutoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private _cadastroService: CadastroService) {
    }

    @ViewChild('categoriasPaginator', { static: true }) categoriasPaginator: MatPaginator;
    @ViewChild('comprasPaginator', { static: true }) comprasPaginator: MatPaginator;
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;

    //Variáveis
    infoCategoria: string;
    infoFamiliaPrecos: string;

    //Datasources
    resumoVendasProduto: ResultadoResumoVendasProdutoModel;
    resumoEntradasNfProduto: ResultadoResumoEntradasNfProdutoModel;
    resumoCategoriaProduto: ResultadoResumoCategoriaProdutoModel;
    resumoFamiliaPrecos: ResultadoResumoFamiliaPrecosModel;
    resumoAlteracoesPrecos: ResultadoResumoAlteracoesPrecosModel;
    categoriasDataSource = new MatTableDataSource<ResumoCategoriaProdutoModel>();
    comprasDataSource = new MatTableDataSource<ResumoCompraProdutoModel>();
    estoquePrecoDataSource = new MatTableDataSource<any>();

    //Indicadores de loading
    estaCarregandoResumoVendasProduto: boolean;
    estaCarregandoResumoEntradasNfProduto: boolean;
    estaCarregandoResumoCategoriaProduto: boolean;
    estaCarregandoResumoComprasProduto: boolean;
    estaCarregandoResumoEstoquePrecoProduto: boolean;
    estaCarregandoResumoFamiliaPrecos: boolean;
    estaCarregandoResumoAlteracoesPrecos: boolean;

    //Definições de colunas
    colunasCategoria = [
        { columnDef: 'produtoId', header: 'ID' },
        { columnDef: 'descricao', header: 'Produto' },
        { columnDef: 'estoque', header: 'Estoque' },
        { columnDef: 'precoCusto', header: 'R$ custo' },
    ];
    colunasCategoriaDef = this.colunasCategoria.map(c => c.columnDef);

    colunasCompras = [
        { columnDef: 'razaoFornecedor', header: 'Fornecedor' },
        { columnDef: 'data', header: 'Data' },
        { columnDef: 'quantidade', header: 'Quantidade' },
        { columnDef: 'qtdEmbalagem', header: 'Qtd. emb.' },
        { columnDef: 'precoUnitario', header: 'R$ unit.' },
        { columnDef: 'custoPmz', header: 'R$ Markdown' },
        { columnDef: 'desconto', header: 'Desconto' },
        { columnDef: 'lucroLiquido', header: 'Mg. Líq.' },
        { columnDef: 'custoProduto', header: 'R$ Custo NF' },
    ];
    colunasComprasDef = this.colunasCompras.map(c => c.columnDef);

    colunasEstoquePreco = [
        { columnDef: 'produtoId', header: 'ID' },
        { columnDef: 'barra', header: 'Barra' },
        { columnDef: 'descricaoPdv', header: 'Descrição' }        
    ];
    colunasEstoquePrecoDef = this.colunasEstoquePreco.map(c => c.columnDef);

    colunasEstoquePrecoLoja = [
        { columnDef: 'lojaId', header: 'Loja' },
        { columnDef: 'precoCusto', header: 'R$ C.M.V.' },
        { columnDef: 'custoMarkdown', header: 'R$ Últ. markDown' },                        
        { columnDef: 'margemParam', header: 'Margem param' },
        { columnDef: 'margemBruta', header: 'Margem bruta' },
        { columnDef: 'precoVenda', header: 'R$ venda' },
        { columnDef: 'estoque', header: 'Estoque' },
        { columnDef: 'corredor', header: 'Corredor' },
    ];    

    carregarDetalhesProduto() {

        //Ativa os flags de carregamento
        this.estaCarregandoResumoVendasProduto = true;
        this.estaCarregandoResumoEntradasNfProduto = true;
        this.estaCarregandoResumoCategoriaProduto = true;
        this.estaCarregandoResumoComprasProduto = true;
        this.estaCarregandoResumoEstoquePrecoProduto = true;
        this.estaCarregandoResumoFamiliaPrecos = true;
        this.estaCarregandoResumoAlteracoesPrecos = true;

        let requisicaoPadrao: RequisicaoPadraoResumoProdutoModel =
        {
            produtoId: this.data.prodId,
            lojas: this.comboLoja.obterLojasSelecionadas()
        };

        // Últimas vendas
        this._cadastroService.produtos_ObterResumoVendas(requisicaoPadrao).subscribe(result => {
            this.resumoVendasProduto = result;
            this.estaCarregandoResumoVendasProduto = false;
        });

        //Últimas entradas NF
        this._cadastroService.produtos_ObterResumoEntradasNf(requisicaoPadrao).subscribe(result => {
            this.resumoEntradasNfProduto = result;
            this.estaCarregandoResumoEntradasNfProduto = false;
        }, (error) => {            
        });

        // Estoque/Preços
        this._cadastroService.produtos_ObterResumoEstoquePreco(requisicaoPadrao).subscribe(result => {
            this.estoquePrecoDataSource = new MatTableDataSource(result.produtos);
            //this.comprasDataSource.paginator = this.comprasPaginator;
            this.estaCarregandoResumoEstoquePrecoProduto = false;
        });        

        // Últimas compras
        this._cadastroService.produtos_ObterResumoCompras(requisicaoPadrao).subscribe(result => {            
            this.comprasDataSource = new MatTableDataSource(result.compras);
            this.comprasDataSource.paginator = this.comprasPaginator;
            this.estaCarregandoResumoComprasProduto = false;
        });

        // Família de Preços
        this._cadastroService.produtos_ObterResumoFamiliaPrecos(requisicaoPadrao).subscribe(result => {
            this.resumoFamiliaPrecos = result;
            this.estaCarregandoResumoFamiliaPrecos = false;
            this.infoFamiliaPrecos = "Família de preços: " + result.id + " - " + result.descricao;
        }, (error) => {
        });

        // Alteração de Preços
        this._cadastroService.produtos_ObterResumoAlteracoesPrecos(requisicaoPadrao).subscribe(result => {
            this.resumoAlteracoesPrecos = result;
            this.estaCarregandoResumoAlteracoesPrecos= false;
        }, (error) => {
        });

        // Categoria
        this._cadastroService.produtos_ObterResumoCategoria(requisicaoPadrao).subscribe(result => {
            this.categoriasDataSource = new MatTableDataSource(result.produtos);
            this.categoriasDataSource.paginator = this.categoriasPaginator;
            this.estaCarregandoResumoCategoriaProduto = false;
            this.infoCategoria = "Categoria: " + result.categoria.id + " - " + result.categoria.descricao;

        });
    }

    lojasAlteradas() {
        this.carregarDetalhesProduto();
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
        this.carregarDetalhesProduto();
    }
}