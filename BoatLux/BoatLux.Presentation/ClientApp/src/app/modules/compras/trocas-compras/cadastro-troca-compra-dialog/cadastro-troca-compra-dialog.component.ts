import { Component, ViewChild, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2'
import { MatTabGroup } from '@angular/material/tabs';
import * as moment from 'moment';
// Services
import { ComprasService } from '../../../../services/compras.service';
import { CadastroService } from '../../../../services/cadastro.service';
import { DialogService } from '../../../../services/dialog.service';
// Components
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import { ControlesDetalhesProdutoComponent } from '../../../../controls/detalhes-produto/detalhes-produto.component';
import { ControlesComboLojaComponent } from '../../../../controls/combo-loja/combo-loja.component';
import { ControlesPendenciaFornecedorComponent } from '../../../../controls/pendencia-fornecedor/pendencia-fornecedor.component';
// Interfaces
import { ResultadoProdutosAnaliseSugestaoCompraModel, ItemTrocaCompraModel, TrocaCompraModel } from '../../../../interfaces/compras.interface';
import { ProdutoImportacaoModel } from '../../../../interfaces/cadastro.interface';

export interface DialogData {
    id: number;
}

@Component({
    selector: 'cadastro-troca-compra-dialog',
    templateUrl: './cadastro-troca-compra-dialog.component.html',
    styleUrls: ['./cadastro-troca-compra-dialog.component.scss'],
})
export class CadastroTrocaCompraDialogComponent implements AfterViewInit {

    ngAfterViewInit(): void {
        if (this.data.id > 0)
            this.editarItem(this.data.id);
        else
            this.novoItem();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<CadastroTrocaCompraDialogComponent>,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService,
        private _cadastroService: CadastroService,
        private _dialogService: DialogService,
        private _matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private el: ElementRef) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em memória
    produtosDataSource = new MatTableDataSource<ItemTrocaCompraModel>();

    acao: number;
    id: number;
    titulo: string;
    fornecPossuiPendencia: boolean = false;

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    //Componentes
    @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('detalhesProduto') detalhesProduto: ControlesDetalhesProdutoComponent;
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;

    //Flag que indica se os produtos estão sendo carregados
    exibeProdutosCarregando = false;
    temProdutos = false;
    expandeTodosOsProdutos = false;
    tempIdProdutoExpandido = '';

    //Definição do formulário STEP 1
    cadastroFormGroup = this._formBuilder.group(
        {
            //lojas: [['1']],
            fornecedor: [''],
            //condPagto: [''],
            //comprador: [''],            
            dataLancamento: [, Validators.required],
        }
    );

    locale: any = {
        format: 'YYYY-MM-DD',
        displayFormat: 'DD/MM/YYYY',
        applyLabel: 'OK',
    };

    minDate: moment.Moment = moment();

    //Colunas do grid
    colunasItens = ['barra', 'descricao', 'quantidade', 'precoCusto', 'valorTotal', 'acoes'];

    //Filtro de descrição no grid de produtos
    filtroDescricaoProdutos: string = '';

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // -----------------------------------------------------------------------------------------------------        

    novoItem() {
        //this.cadastroFormGroup.reset();
        this.acao = 1;
        this.titulo = "Cadastro de troca de compra";
        this.id = 0;
        this.cadastroFormGroup.reset({
            dataLancamento: {
                startDate: moment(),
            },
        });
    }

    validarCapaTroca(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.cadastroFormGroup.value.dataLancamento.startDate == null) {
            mensagemRetorno += "<br/>- Informe a data do lançamento";
            validado = false;
        }

        if (this.fornecedor.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe o fornecedor";
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigatórios e tente novamente: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    editarItem(id: number) {
        //this.cadastroFormGroup.reset();
        this.acao = 2;
        this.titulo = "Alteração de troca de compra #" + id.toString();
        this.id = id;
        this.carregarCadastro(id);
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

        this._comprasService.obterTrocaCompra(id).subscribe(resultado => {
            Swal.close();
            //Carrega os dados do formulário
            this.cadastroFormGroup.reset({
                dataLancamento: {
                    startDate: resultado.data,
                }
            });
            //Carrega o buscarápida
            this.comboLoja.definirLojaSelecionada(resultado.lojaId);
            this.fornecedor.definirCodigoSelecionado(resultado.fornecedorId);
            this.produtosDataSource = new MatTableDataSource<ItemTrocaCompraModel>(resultado.itens);
            this.produtosDataSource.sort = this.sort;
            this.produtosDataSource.paginator = this.paginator;

            // Verifica se o fornecedor possui pendência
            this.verificarPendenciaFornecedor(resultado.fornecedorId);

        }, err => {
            Swal.fire('Ops!', err.error.Message, 'error');
        });
    }

    salvarCadastro() {

        if (this.validarCapaTroca()) {

            if (this.produtosDataSource.data.length == 0) {
                this.tabGroup.selectedIndex = 1;
                Swal.fire('Ops!', 'Você precisa adicionar pelo menos um produto antes de salvar.', 'warning');
                return;
            }

            // Verifica somente produtos alterados (novos ou editados)
            var produtosAlterados = this.produtosDataSource.data.filter(function (item) {
                return item.alterado;
            });

            // Verifica se existem produtos inválidos
            var produtosInvalidos: string = '';

            produtosAlterados.filter(function (item) {
                if (item.quantidade == 0) {
                    produtosInvalidos += item.produtoId + ', ';
                    return item.produtoId
                }
            });

            if (produtosInvalidos.length == 0) {

                let dados: TrocaCompraModel = {
                    trocaId: this.id,
                    lojaId: this.comboLoja.obterLojaSelecionada(),
                    fornecedorId: Number(this.fornecedor.obterCodigoSelecionado()),
                    data: this.cadastroFormGroup.value.dataLancamento.startDate,
                    itens: produtosAlterados != null ? produtosAlterados : null,
                };

                Swal.fire({
                    title: 'Aguarde...',
                    html: 'Estamos salvando sua troca...',
                    allowOutsideClick: false,
                    onBeforeOpen: () => {
                        Swal.showLoading();
                    }
                });


                this._comprasService.salvarTrocaCompra(dados).subscribe(resultado => {

                    this.tabGroup.selectedIndex = 1;
                    this.editarItem(resultado);

                    Swal.fire('Pronto!', 'A troca foi salva com sucesso. Você pode continuar editando-a.', 'success').then((result) => {

                    });

                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            } else {
                Swal.fire('Ops!', 'Existem produtos com a quantidade zerada', 'warning');
            }
        }
        else {
            Swal.fire('Ops!', 'Você precisa preencher todos os campos obrigatórios.(Data/Fornecedor)', 'warning');
        }
    }


    //Edita as colunas do grid de produtos por loja
    abrirJanelaEscolhaDeColunas(): void {

        ////Clona os campos do array para evitar alteração por referência
        //let cloned = this.colunasProdutosLojas.map(x => Object.assign({}, x));

        //const dialog = this._matDialog.open(ColunasDialogComponent, {
        //    width: '350px',
        //    data: { colunas: cloned }
        //});

        //dialog.afterClosed().subscribe(result => {

        //    if (result) {

        //        this.colunasProdutosLojas = result;

        //        let cache = {
        //            definido: true,
        //            colunas: result.filter(item => item.visivel).map(item => item.coluna)
        //        };

        //        this._localStorageService.set(cache, this._chaveCacheColunasSelecionadas);
        //    }
        //});
    }

    //Edita as colunas do grid de produtos por loja
    abrirJanelaDetalhesProduto(item: ResultadoProdutosAnaliseSugestaoCompraModel): void {

        this._matDialog.open(ControlesDetalhesProdutoComponent, {
            width: '100%',
            height: '80%',
            data: { prodId: item.prodId, descricao: item.descricao }
        });
    }

    //Abre janela Pendências do Fornecedor
    abrirPendenciasDoFornecedor(): void {
        if (this.fornecedor.obterCodigoSelecionado() != null) {
            this._dialogService.abrirDialogGrande(ControlesPendenciaFornecedorComponent, {
                fornecedorId: this.fornecedor.obterCodigoSelecionado(),
                razao: this.fornecedor.obterItemSelecionado().titulo,
            }).subscribe(result => {
                this.verificarPendenciaFornecedor(this.fornecedor.obterCodigoSelecionado());
            });
        }
        else
            Swal.fire('Atenção!', "Informe o fornecedor da troca para acessar as pendências.", 'warning');
    }

    //Abre janela para gerar pedido
    abrirJanelaGeraPedido(): void {

        ////Clona os campos do array para evitar alteração por referência
        ////let cloned = this.colunasProdutos.map(x => Object.assign({}, x));

        //let requisicao = {
        //    filtrosOriginais: this.obterFiltrosPesquisaProdutos(),
        //    produtos: this.produtosDataSource.data
        //};

        //const dialog = this._matDialog.open(GeraPedidoDialogComponent, {
        //    width: '800px',
        //    disableClose: true,
        //    data: requisicao
        //});

        //dialog.afterClosed().subscribe(result => {

        //});
    }

    // Verifica na API sem o fornecedor possui pendência em aberto
    verificarPendenciaFornecedor(fornecedorId?: number): void {

        let id = fornecedorId > 0 ? fornecedorId : this.fornecedor.obterCodigoSelecionado();

        this._cadastroService.fornecedor_VerificarPendencia(id).subscribe(resultado => {

            this.fornecPossuiPendencia = resultado;
        });
    }

    removerProduto(item: ItemTrocaCompraModel) {

        Swal.fire({
            title: 'Atenção',
            text: "Deseja mesmo remover o produto '" + item.descricao + "' da troca?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, remover!',
            cancelButtonText: 'Não remover!',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {

                if (item.itemTrocaId > 0) {
                    this._comprasService.apagarItemtrocaCompra(item.itemTrocaId).subscribe(() => {
                        Swal.fire('Pronto!', 'O item foi excluído do pedido com sucesso!', 'success');
                    }, (err) => {
                        Swal.fire('Ops!', "Não conseguimos remover o produto do pedido.<br> " + err.error.Message, 'error');
                    });
                }

                let itemExistente = this.produtosDataSource.data.find(i => i.produtoId == item.produtoId);
                if (itemExistente != null) {

                    //Remove
                    this.produtosDataSource.data = this.produtosDataSource.data.filter(function (produto) {
                        return produto.produtoId !== itemExistente.produtoId // Verifica por produto, pois produtos adicionados não tem itemCompraId
                    });
                }
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

                    let novoItem: ItemTrocaCompraModel = {
                        trocaCompraId: this.id,
                        produtoId: produto.prodId,
                        descricao: produto.descricao,
                        barra: produto.barra,
                        quantidade: produto.itens[0].quantidade,
                        precoCusto: produto.itens[0].precoCusto,
                        alterado: true,
                    }

                    this.produtosDataSource.data.push(novoItem);
                    this.produtosDataSource._updateChangeSubscription();
                    this.atualizarGridProdutos();

                });
            }
        });
    };

    //Aplica os filtros de tela do grid de produtos
    aplicarFiltroProdutos() {
        //Remove espaços em branco e deixa em minúsculo
        let filtro = this.filtroDescricaoProdutos.trim().toLowerCase();
        this.produtosDataSource.filter = filtro;
        //Configura o filtro
        this.produtosDataSource.filterPredicate =
            (data: ItemTrocaCompraModel, filter: string) => (!isNaN(Number(filter)) && data.produtoId == Number(filter)) || (isNaN(Number(filter)) && data.descricao.toLowerCase().indexOf(filter) != -1);
    }

    public calcularQuantidadeGeral(): string {
        return Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + Number(b.quantidade), 0).toFixed(3)).toLocaleString();
    }

    public calcularTotal(item: ItemTrocaCompraModel): string {
        return "R$" + Number((item.quantidade * item.precoCusto)).toFixed(2);
    }

    public calcularTotalGeral(): string {
        return "R$" + Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + Number(b.quantidade * b.precoCusto), 0).toFixed(2)).toLocaleString();
    }

    imprimirRelatorio(formato: number, visualizar: boolean = false): void {

        //let requisicao: RequisicaoRelatorioAnaliseSugestaoComprasModel =
        //{
        //    formato: formato,
        //    produtos: this.produtosDataSource.data
        //};

        //this._comprasService.gerarRelatorioAnaliseSugestaoCompras(requisicao, 'Relatório de Operações Financeiras', visualizar);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    
}