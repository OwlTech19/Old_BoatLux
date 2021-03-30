import { Component, ViewChild, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ComprasService } from '../../../../services/compras.service';
import { CadastroService } from '../../../../services/cadastro.service';
import { ResultadoProdutosAnaliseSugestaoCompraModel, RequisicaoConsultaProdutosAnaliseCompra, RequisicaoGerarCotacaoAnaliseSugestaoCompraModel, RequisicaoRelatorioAnaliseSugestaoComprasModel, PedidoCompraModel, CotacaoCompraModel, ItemCotacaoCompraModel, RequisicaoObterDadosCotacaoModel } from '../../../../interfaces/compras.interface';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import Swal from 'sweetalert2'
import { ControlesDetalhesProdutoComponent } from '../../../../controls/detalhes-produto/detalhes-produto.component';
import { RelatorioService } from '../../../../services/relatorio.service';
import { ControlesComboLojaComponent } from '../../../../controls/combo-loja/combo-loja.component';
import { DialogService } from '../../../../services/dialog.service';
import { error } from '@angular/compiler/src/util';
import { MatTabGroup } from '@angular/material/tabs';
import * as moment from 'moment';
import { ProdutoImportacaoModel } from '../../../../interfaces/cadastro.interface';

export interface DialogData {
    id: number;
    lojaId: number;
}

@Component({
    selector: 'cadastro-cotacao-compra-dialog',
    templateUrl: './cadastro-cotacao-compra-dialog.component.html',
    styleUrls: ['./cadastro-cotacao-compra-dialog.component.scss'],
})
export class CadastroCotacaoCompraDialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<CadastroCotacaoCompraDialogComponent>,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService,
        private _dialogService: DialogService,
        private _matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private el: ElementRef) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em memória
    produtosDataSource = new MatTableDataSource<ItemCotacaoCompraModel>();

    situacao: string;
    acao: number;
    id: number;
    titulo: string;

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    //Componentes
    @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('detalhesProduto') detalhesProduto: ControlesDetalhesProdutoComponent;
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;

    // Tratamentos para o campo validade da cotação
    locale: any = {
        format: 'YYYY-DD-MM',
        displayFormat: 'DD/MM/YYYY',
    };

    //Flag que indica se os produtos estão sendo carregados
    exibeProdutosCarregando = false;
    temProdutos = false;
    expandeTodosOsProdutos = false;
    tempIdProdutoExpandido = '';

    //Definição do formulário STEP 1
    cadastroFormGroup = this._formBuilder.group(
        {
            dataCotacao: [, Validators.required]
        }
    );

    //Colunas do grid
    colunasItens = ['barra', 'descricao', 'qtdCotacao', 'qtdEmbalagem', 'qtdTotal', 'acoes'];

    //Filtro de descrição no grid de produtos
    filtroDescricaoProdutos: string = '';

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // ----------------------------------------------------------------------------------------------------- 

    desabilitaCampo(tipo: number) {

        switch (tipo) {
            case 1: // Desabilitar campo
                if (this.situacao == "WW")
                    return 'none';
                else
                    return 'auto';

            case 2: // alterar opacidade
                if (this.situacao == "WW")
                    return '0.6';
                else
                    return '1';
            default:
        }
    }

    desabilitaLoja(tipo: number) {

        switch (tipo) {
            case 1: // Desabilitar campo
                if (this.id > 0)
                    return 'none';
                else
                    return 'auto';

            case 2: // alterar opacidade
                if (this.id > 0)
                    return '0.6';
                else
                    return '1';
            default:
        }
    }

    novoItem() {
        //this.cadastroFormGroup.reset();
        this.acao = 1;
        this.titulo = "Cadastro de cotação de compra";
        this.id = 0;
        this.situacao = "AB";
    }

    editarItem(id: number) {
        //this.cadastroFormGroup.reset();
        this.acao = 2;
        this.titulo = "Alteração de cotação de compra #" + id.toString();
        this.id = id;
        this.carregarCadastro(id);
        //this.adicionarProduto();
    }

    carregarCadastro(id: number) {

        Swal.fire({
            title: 'Aguarde...',
            html: 'Estamos carregando os dados...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });

        let requisicao: RequisicaoObterDadosCotacaoModel = {

            cotacaoId: id,
            lojaId: Number(this.data.lojaId) > 0 ? Number(this.data.lojaId) : this.comboLoja.obterLojaSelecionada(),
        }

        this._comprasService.obterDadosCotacaoCompra(requisicao).subscribe(resultado => {
            Swal.close();
            //Carrega os dados do formulário
            this.cadastroFormGroup.patchValue(
                {
                    dataCotacao: {
                        startDate: resultado.data,
                    },
                });

            //Carrega o buscarápida
            this.comboLoja.definirLojaSelecionada(resultado.lojaId);
            this.fornecedor.definirCodigoSelecionado(resultado.fornecedorId);
            this.produtosDataSource = new MatTableDataSource<ItemCotacaoCompraModel>(resultado.itens);
            this.produtosDataSource.sort = this.sort;
            this.produtosDataSource.paginator = this.paginator;
            this.situacao = resultado.situacao;

        }, err => {
            Swal.fire('Ops!', err.error.Message, 'error');
        });
    }

    salvarCadastro() {

        if (this.cadastroFormGroup.valid) {

            //Validações adicionais
            if (this.produtosDataSource.data.length == 0) {
                this.tabGroup.selectedIndex = 1;
                Swal.fire('Ops!', 'Você precisa adicionar pelo menos um produto antes de salvar.', 'warning');
                return;
            }

            let dados: CotacaoCompraModel = {
                cotacaoId: this.id,
                lojaId: this.comboLoja.obterLojaSelecionada(),
                fornecedorId: Number(this.fornecedor.obterCodigoSelecionado()),
                data: this.cadastroFormGroup.value.dataCotacao.startDate.format('YYYY-MM-DD'),
                situacao: this.situacao,
                itens: this.produtosDataSource.data
            };

            Swal.fire({
                title: 'Aguarde...',
                html: 'Estamos salvando sua cotação...',
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }
            });

            this._comprasService.salvarDadosCotacaoCompra(dados).subscribe(resultado => {

                Swal.fire('Pronto!', 'A cotação foi salva com sucesso. Você pode continuar editando-a.', 'success').then((result) => {
                    if (this.id == 0) {
                        this.tabGroup.selectedIndex = 1;
                        this.editarItem(resultado);
                    }
                });

            }, (err) => {
                Swal.fire('Ops!', err.error.Message, 'error');
            });
        }
        else {
            Swal.fire('Ops!', 'Você precisa preencher todos os campos obrigatórios.', 'warning');
        }
    }

    //Edita as colunas do grid de produtos por loja
    abrirJanelaDetalhesProduto(item: ItemCotacaoCompraModel): void {

        this._matDialog.open(ControlesDetalhesProdutoComponent, {
            width: '100%',
            height: '80%',
            data: { prodId: item.produtoId, descricao: item.descricao }
        });
    }

    removerProduto(item: ItemCotacaoCompraModel) {

        Swal.fire({
            title: 'Atenção',
            text: "Deseja mesmo remover o produto '" + item.descricao + "' da cotação?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, remover!',
            cancelButtonText: 'Não remover!',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {

                this.produtosDataSource.data = this.produtosDataSource.data.filter((value, key) => {
                    return value.produtoId != item.produtoId;
                });

                this.atualizarGridProdutos();
            }
        })
    }

    private atualizarGridProdutos() {
        // Refreshing table using paginator        
        this.paginator._changePageSize(this.paginator.pageSize);
    }

    adicionarProduto() {
        this._dialogService.importarMultiplosProdutos([this.comboLoja.obterLojaSelecionada()], this.produtosDataSource.data.map(i => i.produtoId), this.fornecedor.obterCodigoSelecionado()).subscribe(resultado => {
            if (resultado != null) {

                resultado.forEach((produto: ProdutoImportacaoModel) => {

                    // Pega o item 0 do array, importa o item para apenas uma loja
                    let novoItem: ItemCotacaoCompraModel = {
                        produtoId: produto.prodId,
                        descricao: produto.descricao,
                        barra: produto.barra,
                        qtdCotacao: produto.itens[0].quantidade,
                        qtdEmbalagem: produto.itens[0].qtdEmbalagem,
                        qtdComprarUnitaria: 0,
                        qtdComprarEmbalagem: 1,
                        alterado: true
                    }

                    this.produtosDataSource.data.push(novoItem);
                    this.produtosDataSource._updateChangeSubscription();
                    this.atualizarGridProdutos();

                });

                //Swal.fire('Pronto!', 'Os produtos foram adicionados à cotação.', 'success');
            }
        });
    }

    //Aplica os filtros de tela do grid de produtos
    aplicarFiltroProdutos() {
        //Remove espaços em branco e deixa em minúsculo
        let filtro = this.filtroDescricaoProdutos.trim().toLowerCase();
        this.produtosDataSource.filter = filtro;
        //Configura o filtro
        this.produtosDataSource.filterPredicate =
            (data: ItemCotacaoCompraModel, filter: string) => (!isNaN(Number(filter)) && data.barra == String(filter)) || (isNaN(Number(filter)) && data.descricao.toLowerCase().indexOf(filter) != -1);
    }

    public calcularQtdCotacaoGeral(): string {
        return Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + Number(b.qtdCotacao), 0).toFixed(3)).toLocaleString();
    }

    public calcularQtdEmbalagemGeral(): string {
        return Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + Number(b.qtdEmbalagem), 0).toFixed(3)).toLocaleString();
    }

    public calcularQtdTotal(item: ItemCotacaoCompraModel): string {
        return (Number(Number(item.qtdCotacao).toFixed(3)) * Number(Number(item.qtdEmbalagem).toFixed(3))).toLocaleString();
    }

    public calcularQtdTotalGeral(): string {
        return (Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + Number(b.qtdCotacao), 0))
            * Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + Number(b.qtdEmbalagem), 0).toFixed(3))).toLocaleString();
    }

    public calcularQtdComprarEmbalagem(): string {
        return Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + Number(b.qtdComprarEmbalagem), 0).toFixed(3)).toLocaleString();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        if (this.data.id > 0)
            this.editarItem(this.data.id);
        else {
            this.cadastroFormGroup.reset({
                dataCotacao: {
                    startDate: moment().format('YYYY-MM-DD'),
                },
            });
            this.novoItem();
        }
    }
}