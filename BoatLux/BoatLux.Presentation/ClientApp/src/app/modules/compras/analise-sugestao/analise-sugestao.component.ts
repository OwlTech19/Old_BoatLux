import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, HostListener, AfterViewInit } from '@angular/core';
import { FormBuilder, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2'
import { MatStepper, MatHorizontalStepper } from '@angular/material/stepper';
import * as moment from 'moment';
import { SelectionModel } from '@angular/cdk/collections';
//Services
import { RelatorioService } from '../../../services/relatorio.service';
import { DialogService } from '../../../services/dialog.service';
import { LocalStorageService } from '../../../services/local-storage.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { ComprasService } from '../../../services/compras.service';
import { CadastroService } from '../../../services/cadastro.service';
//Components
import { ControlesAssociarProdutoFornecedorComponent } from '../../../controls/associa-produto-fornecedor/associa-produto-fornecedor.component';
import { ControlesClassificarEstruturaMercadologicaComponent } from '../../../controls/classifica-estrutura-mercadologica/classifica-estrutura-mercadologica.component';
import { ControlesPendenciaFornecedorComponent } from '../../../controls/pendencia-fornecedor/pendencia-fornecedor.component';
import { ControlesComboLojaComponent } from '../../../controls/combo-loja/combo-loja.component';
import { ControlesBuscaRapidaComponent } from '../../../controls/busca-rapida/busca-rapida.component';
import { ControlesDetalhesProdutoComponent } from '../../../controls/detalhes-produto/detalhes-produto.component';
import { ColunasDialogComponent } from './colunas-dialog/colunas-dialog.component';
import { GeraPedidoDialogComponent } from './gera-pedido-dialog/gera-pedido-dialog.component';
//Interfaces
import { ResultadoProdutosAnaliseSugestaoCompraModel, RequisicaoConsultaProdutosAnaliseCompra, RequisicaoGerarCotacaoAnaliseSugestaoCompraModel, RequisicaoRelatorioAnaliseSugestaoComprasModel, RequisicaoDesativarProdutosVendaModel, RequisicaoGerarEstoqueMinimoSugestaoComprasModel, ProdutosAnaliseSugestaoCompraLojaModel } from '../../../interfaces/compras.interface';
import { ProdutoImportacaoModel, RequisicaoDesassociarProdutosFornecedorModel } from '../../../interfaces/cadastro.interface';
import { Parametros } from '../../../interfaces/uteis.interface';

@Component({
    selector: 'analise-sugestao',
    templateUrl: './analise-sugestao.component.html',
    styleUrls: ['./analise-sugestao.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class AnaliseSugestaoComponent implements OnInit, AfterViewInit, OnDestroy {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService,
        private _cadastroService: CadastroService,
        private _relatorioService: RelatorioService,
        private _dialogService: DialogService,
        private _matDialog: MatDialog,
        private _localStorageService: LocalStorageService

    ) {
        // Define o menu de navegação
        this._fuseNavigationService.setCurrentNavigation('compras_navigation');
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------  

    readonly formControl: AbstractControl;

    //Armazena os produtos em memória
    produtosDataSource = new MatTableDataSource<ResultadoProdutosAnaliseSugestaoCompraModel>();
    itensSelecionados = new SelectionModel<ResultadoProdutosAnaliseSugestaoCompraModel>(true, []);

    //Chave do cache de produtos da analisa
    private _chaveCacheProdutosAnalise = 'cache_prods_analise';
    private _chaveCacheColunasSelecionadas = 'cache_prods_analise_colunas_selecionadas';

    step1: MatStepper;
    step2: MatStepper;
    step3: MatStepper;

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


    //Componentes
    @ViewChild(MatHorizontalStepper) stepper: MatHorizontalStepper;
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('representante') representante: ControlesBuscaRapidaComponent;
    @ViewChild('comprador') comprador: ControlesBuscaRapidaComponent;
    @ViewChild('detalhesProduto') detalhesProduto: ControlesDetalhesProdutoComponent;

    @ViewChild('centroReceitaProduto') centroReceitaProduto: ControlesBuscaRapidaComponent;
    @ViewChild('grupoProduto') grupoProduto: ControlesBuscaRapidaComponent;
    @ViewChild('categoriaProduto') categoriaProduto: ControlesBuscaRapidaComponent;
    @ViewChild('familiaProduto') familiaProduto: ControlesBuscaRapidaComponent;
    @ViewChild('corredor') corredor: ControlesBuscaRapidaComponent;

    // Chave do cache de parâmetros
    private _keyParams = 'parametros';

    // Parâmetros
    parametros: Parametros[] = [];

    //Flag que indica se os produtos estão sendo carregados
    exibeProdutosCarregando = false;
    temProdutos = false;

    expandeTodosOsProdutos = false;
    tempIdProdutoExpandido = '';
    tooltipFiltros: string;
    temFornecedor: boolean = false;
    exibeColunaSazonal: boolean = false;
    fornecedorId: number = 0;
    possuiPendenciaFornec: boolean = false;
    pointerEvents: string = 'auto'; // Bloqueia os campos
    opacity: string = '1';

    //Definição do formulário STEP 1
    step1FormGroup = this._formBuilder.group(
        {
            periodo: [],
            margemSeguranca: [],
            diasOperacionais: [],
            opcaoPromocao: [],
            opcaoProdutosParaSugestao: [],
            opcaoVendas: [],
            somenteProdutosAtivos: [],
            verificarProdutosEstoqueZerado: [],
            verificarProdutosEstoqueInferiorOuIgualAoMaximo: [],
            retirarProdutosPedidosCompra: [],
            incluirProdutosSazonais: [],
            descricaoProd: [],
            opcaoQtdSugerida: [],
            naoAvaliarConsumo: []
        }
    );

    ranges: any = {
        'Hoje': [moment(), moment()],
        'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Últimos 7 dias': [moment().subtract(6, 'days'), moment()],
        'Últimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'Mês atual': [moment().startOf('month'), moment().endOf('month')],
        'Mês passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    };

    //Definição do formulário STEP 2
    //step2FormGroup = this._formBuilder.group(
    //    {

    //    }
    //);

    //Definição do formulário STEP 3
    step3FormGroup = this._formBuilder.group(
        {
        }
    );

    definirDadosPadraoStep1FormGroup(): void {
        this.step1FormGroup.reset({
            periodo: {
                startDate: moment().subtract(1, 'months').format(),
                endDate: moment().format(),
            },
            margemSeguranca: '',
            diasOperacionais: '',
            opcaoPromocao: '1',
            opcaoProdutosParaSugestao: '1',
            opcaoVendas: '1',
            somenteProdutosAtivos: true,
            verificarProdutosEstoqueZerado: '',
            verificarProdutosEstoqueInferiorOuIgualAoMaximo: '',
            retirarProdutosPedidosCompra: '',
            incluirProdutosSazonais: '',
            descricaoProd: '',
            opcaoQtdSugerida: '1',
            naoAvaliarConsumo: ''
        });

        //this.comboLoja.();
        this.fornecedor.limpar();
        this.representante.limpar();
        this.comprador.limpar();
        this.centroReceitaProduto.limpar();
        this.grupoProduto.limpar();
        this.categoriaProduto.limpar();
        this.familiaProduto.limpar();
    }

    //Colunas do grid
    colunasProdutosCapa = ['select', 'prodId', 'barra', 'descricao', 'estoqueAtualTotal', 'qtdTotalComprar', 'valorTotalComprar', 'sazonal', 'acoes'];

    //Colunas do grid de lojas            
    colunasProdutosLojas = [
        { nome: 'Loja', coluna: 'lojaId', visivel: true, editavel: false },
        { nome: 'Estoque', coluna: 'estoque', visivel: true, editavel: false },
        { nome: 'Consumo', coluna: 'consumo', visivel: true, editavel: true },
        { nome: 'Qtd. Unit', coluna: 'qtdComprar', visivel: true, editavel: false },
        { nome: 'Qtd. Emb.', coluna: 'qtdEmbalagem', visivel: true, editavel: false },
        { nome: 'Qtd. Aberto', coluna: 'qtdAberto', visivel: true, editavel: true },
        { nome: 'Trocas', coluna: 'trocas', visivel: true, editavel: true },
        { nome: 'R$ Unit.', coluna: 'valorUnitario', visivel: true, editavel: false },
        { nome: 'CMV Atual', coluna: 'cmvAtual', visivel: false, editavel: true },
        { nome: 'R$ Entrada', coluna: 'precoEntrada', visivel: false, editavel: true },
        { nome: 'R$ Venda.', coluna: 'valorVenda', visivel: true, editavel: true },
        { nome: 'Mín. Gônd.', coluna: 'minGondola', visivel: true, editavel: true },
        { nome: 'Máx. Gônd.', coluna: 'maxGondola', visivel: true, editavel: true },
        { nome: 'Mín. Dep.', coluna: 'minDeposito', visivel: true, editavel: true },
        { nome: 'Máx. Dep.', coluna: 'maxDeposito', visivel: true, editavel: true },
        { nome: '% Desc.', coluna: 'percDesconto', visivel: false, editavel: true },
        { nome: '% Acrésc.', coluna: 'percAcrescimo', visivel: false, editavel: true },
        { nome: 'R$ Emb.', coluna: 'valorEmbalagem', visivel: true, editavel: true },
        { nome: '% Marg. Bruta', coluna: 'percMargemBruta', visivel: false, editavel: true },
        { nome: '% Marg. Param.', coluna: 'percMargemParam', visivel: false, editavel: true },
        { nome: 'Últ. Ent.', coluna: 'ultimaEntrada', visivel: false, editavel: true },
        { nome: 'Últ. Saí.', coluna: 'ultimaSaida', visivel: false, editavel: true },
        { nome: 'Últ. Comp.', coluna: 'ultimaCompra', visivel: false, editavel: true },
        { nome: 'R$ Total', coluna: 'valorTotal', visivel: true, editavel: false },

    ];

    //Filtro de descrição no grid de produtos
    filtroDescricaoProdutos: string = '';
    filtroExibirQuantidade: string = '1';

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // -----------------------------------------------------------------------------------------------------        

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.itensSelecionados.selected.length;
        const numRows = this.produtosDataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.itensSelecionados.clear() :
            this.produtosDataSource.data.forEach(row => this.itensSelecionados.select(row));
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: ResultadoProdutosAnaliseSugestaoCompraModel): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.itensSelecionados.isSelected(row) ? 'deselect' : 'select'} row ${row.prodId + 1}`;
    }

    //Ao selecionar loja, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.comprador.definirParametros(this.comboLoja.obterLojaSelecionada());

        // Bloqueia comprador quando seleciona mais de uma loja
        if (this.comboLoja.obterLojasSelecionadas().length > 1) {
            this.pointerEvents = 'none';
            this.opacity = '0.6';
        }
        else {
            this.pointerEvents = 'auto';
            this.opacity = '1';
        }
    }

    //Métodos de validação
    naoAvaliaConsumo(): boolean {

        let naoAvaliaConsumo; // Variável de controle do retorno

        if (Number(this.step1FormGroup.value.naoAvaliarConsumo) == 1) {
            naoAvaliaConsumo = true;
        }
        else {
            naoAvaliaConsumo = false;
        }

        if (naoAvaliaConsumo) {
            this.step1FormGroup.controls['opcaoPromocao'].setValue('1');
            this.step1FormGroup.controls['opcaoVendas'].setValue('1');
        }

        return naoAvaliaConsumo;
    }

    // Tratamento da coluna Sazonal
    verificarSazonal(item: ResultadoProdutosAnaliseSugestaoCompraModel): string {
        if (item.sazonal)
            return "Sim";
        else
            return "Não"
    }

    //Métodos do menu operações
    desativarProdVenda(): void {

        if (this.itensSelecionados.selected.length > 0) {

            Swal.fire({
                title: 'Confirmação',
                text: "Deseja desativar para venda os produtos selecionados?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, desativar!',
                cancelButtonText: 'Não!'
            }).then((result) => {
                if (result.value) {

                    let requisicao: RequisicaoDesativarProdutosVendaModel = {
                        produtoIds: this.itensSelecionados.selected.map(i => i.prodId),
                        lojaIds: this.comboLoja.obterLojasSelecionadas()
                    };

                    Swal.fire({
                        title: 'Aguarde...',
                        html: 'Estamos desativando os produtos para venda...',
                        allowOutsideClick: false,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                        }
                    });

                    this._comprasService.desativarProdutosVenda(requisicao).subscribe(resultado => {

                        this.itensSelecionados.clear();
                        Swal.fire('Pronto!', 'Os produtos foram desativados para venda com sucesso!', 'success');

                    }, (err) => {
                        Swal.fire('Ops!', 'Não foi possível desativar os produtos para venda. ' + err.error.Message, 'error');
                    });
                }
            });
        }
        else {
            Swal.fire('ops!', 'Selecione um ou mais produtos para desativar!', 'warning');
        }
    }

    recategorizar(): void {

        if (this.itensSelecionados.selected.length > 0) {

            this._matDialog.open(ControlesClassificarEstruturaMercadologicaComponent, {
                width: '50%',
                height: '70%',
                data: { produtoIds: this.itensSelecionados.selected.map(i => i.prodId) }
            });
        }
        else {
            Swal.fire('ops!', 'Selecione um ou mais produtos para reclassificar!', 'warning');
        }
    }

    //Edita as colunas do grid de produtos por loja
    abrirJanelaEscolhaDeColunas(): void {

        //Clona os campos do array para evitar alteração por referência
        let cloned = this.colunasProdutosLojas.map(x => Object.assign({}, x));

        const dialog = this._matDialog.open(ColunasDialogComponent, {
            width: '350px',
            data: { colunas: cloned }
        });

        dialog.afterClosed().subscribe(result => {

            if (result) {

                this.colunasProdutosLojas = result;

                let cache = {
                    definido: true,
                    colunas: result.filter(item => item.visivel).map(item => item.coluna)
                };

                this._localStorageService.set(cache, this._chaveCacheColunasSelecionadas);
            }
        });
    }

    abrirPendenciasDoFornecedor(): void {

        this._dialogService.abrirDialogGrande(ControlesPendenciaFornecedorComponent, {
            fornecedorId: this.fornecedorId,
            razao: this.fornecedor.obterItemSelecionado().titulo,

        }).subscribe(result => {
            this.verificarPendenciaFornecedor(this.fornecedorId);
        });
    }

    // Verifica na API sem o fornecedor possui pendência em aberto
    verificarPendenciaFornecedor(fornecedorId?: number): void {

        let id = fornecedorId > 0 ? fornecedorId : this.fornecedor.obterCodigoSelecionado();

        this._cadastroService.fornecedor_VerificarPendencia(id).subscribe(resultado => {

            this.possuiPendenciaFornec = resultado;
        });
    }

    // Abre visualização de informações do produto
    abrirJanelaDetalhesProduto(item: ResultadoProdutosAnaliseSugestaoCompraModel): void {

        this._matDialog.open(ControlesDetalhesProdutoComponent, {
            width: '100%',
            height: '80%',
            data: { prodId: item.prodId, descricao: item.descricao }
        });
    }

    // Abre janela para associar produto a fornecedor
    abrirJanelaAssociarFornecedor(item: ResultadoProdutosAnaliseSugestaoCompraModel): void {
        this._matDialog.open(ControlesAssociarProdutoFornecedorComponent, {
            width: '50%',
            data: { prodId: item.prodId, descricao: item.descricao, fornecedorId: this.fornecedor.obterCodigoSelecionado() }
        });
    }

    //Abre janela para gerar pedido
    abrirJanelaGeraPedido(): void {

        //Clona os campos do array para evitar alteração por referência
        //let cloned = this.colunasProdutos.map(x => Object.assign({}, x));

        let requisicao = {
            filtrosOriginais: this.obterFiltrosPesquisaProdutos(),
            produtos: this.produtosDataSource.data,
            parametros: this.parametros,
        };

        const dialog = this._matDialog.open(GeraPedidoDialogComponent, {
            width: '800px',
            disableClose: true,
            data: requisicao
        });

        dialog.afterClosed().subscribe(result => {

        });
    }

    expandirProduto(item: ResultadoProdutosAnaliseSugestaoCompraModel) {
        if (this.tempIdProdutoExpandido == item.tempId)
            this.tempIdProdutoExpandido = '';
        else
            this.tempIdProdutoExpandido = item.tempId;
    }

    removerProduto(item: ResultadoProdutosAnaliseSugestaoCompraModel) {

        Swal.fire({
            title: 'Atenção',
            text: "Deseja mesmo remover o produto '" + item.descricao + "' da lista de sugestões?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, remover!',
            cancelButtonText: 'Não remover!'
        }).then((result) => {
            if (result.value) {

                this.produtosDataSource.data = this.produtosDataSource.data.filter((value, key) => {
                    return value.tempId != item.tempId;
                });

                this.atualizarGridProdutos();
            }
        })
    }

    private atualizarGridProdutos() {
        // Refreshing table using paginator        
        this.paginator._changePageSize(this.paginator.pageSize);
    }

    private preencherTooltipFiltros() {

        this.tooltipFiltros = '';

        if (this.step1FormGroup.value.periodo != null)
            this.tooltipFiltros += "\n Período avaliado: " + moment(this.step1FormGroup.value.periodo.startDate).format("DD/MM/YYYY") + " à " + moment(this.step1FormGroup.value.periodo.endDate).format("DD/MM/YYYY");

        if (this.step1FormGroup.value.opcaoQtdSugerida == 1)
            this.tooltipFiltros += "\n Quantidade sugerida em unidade";
        else
            this.tooltipFiltros += "\n Quantidade sugerida em embalagem";
    }

    adicionarProduto() {
        this._dialogService.importarMultiplosProdutos(this.comboLoja.obterLojasSelecionadas(), this.produtosDataSource.data.map(i => i.prodId), this.fornecedor.obterCodigoSelecionado()).subscribe(resultado => {
            if (resultado != null) {

                resultado.forEach((produto: ProdutoImportacaoModel) => {

                    if (this.produtosDataSource.data.find(value => value.prodId == produto.prodId) != null) {

                        Swal.fire('Ops!', 'O produto ' + produto.descricao + ' já existe na lista de sugestão.', 'warning');
                    }
                    else {

                        // Criar um array de itens por loja
                        var itensLoja: ProdutosAnaliseSugestaoCompraLojaModel[] = [];

                        // Itera os itens e adiciona ao array por loja
                        produto.itens.forEach(i => {

                            var item: ProdutosAnaliseSugestaoCompraLojaModel = {
                                prodId: i.prodId,
                                lojaId: i.lojaId,
                                estoque: i.estoque,
                                qtdComprar: this.step1FormGroup.value.opcaoQtdSugerida == 2 ? Math.ceil(i.quantidade / i.qtdEmbalagem) : i.quantidade,
                                qtdEmbalagem: i.qtdEmbalagem,
                                qtdAberto: i.qtdAberto,
                                trocas: i.trocas,
                                valorUnitario: i.precoVenda,
                                valorEmbalagem: i.qtdEmbalagem * i.precoVenda,
                                valorVenda: i.precoVenda,
                                cmvAtual: i.precoCusto,
                                precoEntrada: i.precoEntrada,
                                consumo: i.consumo,
                                minGondola: i.minGondola,
                                maxGondola: i.maxGondola,
                                minDeposito: i.minDeposito,
                                maxDeposito: i.maxDeposito,
                                percMargemBruta: i.percMargemBruta,
                                percMargemParam: i.percMargemParam,
                                ultimaEntrada: i.ultimaEntrada,
                                ultimaSaida: i.ultimaSaida,
                                ultimaCompra: i.ultimaCompra,
                                percDesconto: 0,
                                percAcrescimo: 0,
                            };

                            itensLoja.push(item);
                        });

                        // Cria o novo item importando o mesmo produto para mais de uma loja
                        let novoItem: ResultadoProdutosAnaliseSugestaoCompraModel = {
                            prodId: produto.prodId,
                            descricao: produto.descricao,
                            barra: produto.barra,
                            tempId: 'novoProduto_' + produto.prodId.toString(),
                            lojas: itensLoja,
                        }

                        // Adiciona os itens ao grid
                        this.produtosDataSource.data.push(novoItem);
                        this.produtosDataSource._updateChangeSubscription();
                    }
                });

                Swal.fire('Pronto!', 'Os produtos foram adicionados ao pedido.', 'success');
            }
        });
    };

    obterFiltrosPesquisaProdutos(): RequisicaoConsultaProdutosAnaliseCompra {

        if (this.step1FormGroup.value.periodo.startDate != null) {
            this.step1FormGroup.patchValue({
                periodo: {
                    startDate: this.step1FormGroup.value.periodo.startDate.format('YYYY-MM-DD'),
                    endDate: this.step1FormGroup.value.periodo.endDate.format('YYYY-MM-DD'),
                }
            })
        }

        let filtros: RequisicaoConsultaProdutosAnaliseCompra =
        {
            lojas: this.comboLoja.obterLojasSelecionadas(),
            fornecedor: Number(this.fornecedor.obterCodigoSelecionado()),
            periodoConsumo: this.step1FormGroup.value.periodo.startDate != null ? this.step1FormGroup.value.periodo : null,
            representante: Number(this.representante.obterCodigoSelecionado()),
            comprador: Number(this.comprador.obterCodigoSelecionado()),
            margemSeguranca: Number(this.step1FormGroup.value.margemSeguranca),
            diasOperacionais: Number(this.step1FormGroup.value.diasOperacionais),
            opcaoPromocao: Number(this.step1FormGroup.value.opcaoPromocao),
            opcaoVendas: Number(this.step1FormGroup.value.opcaoVendas),
            centroReceitaProduto: Number(this.centroReceitaProduto.obterCodigoSelecionado()),
            grupoProduto: Number(this.grupoProduto.obterCodigoSelecionado()),
            categoriaProduto: Number(this.categoriaProduto.obterCodigoSelecionado()),
            familiaProduto: Number(this.familiaProduto.obterCodigoSelecionado()),
            corredor: this.corredor.obterCodigoStringSelecionado(),
            descricaoProd: this.step1FormGroup.value.descricaoProd,
            somenteProdutosAtivos: Number(this.step1FormGroup.value.somenteProdutosAtivos),
            verificarProdutosEstoqueZerado: Number(this.step1FormGroup.value.verificarProdutosEstoqueZerado),
            verificarProdutosEstoqueInferiorOuIgualAoMaximo: Number(this.step1FormGroup.value.verificarProdutosEstoqueInferiorOuIgualAoMaximo),
            retirarProdutosPedidosCompra: Number(this.step1FormGroup.value.retirarProdutosPedidosCompra),
            incluirProdutosSazonais: Number(this.step1FormGroup.value.incluirProdutosSazonais),
            naoAvaliarConsumo: Number(this.step1FormGroup.value.naoAvaliarConsumo),
            opcaoProdutosParaSugestao: Number(this.step1FormGroup.value.opcaoProdutosParaSugestao),
        };

        return filtros;

    }

    salvarCacheProdutos() {

        let novoProdutosAnaliseCache = {
            formulario: this.step1FormGroup.value,
            fornecedor: this.fornecedor.obterCodigoSelecionado(),
            //representante: this.representante.obterCodigoSelecionado(),
            //comprador: this.comprador.obterCodigoSelecionado(),
            produtos: this.produtosDataSource.data
        };

        try {
            this._localStorageService.set(novoProdutosAnaliseCache, this._chaveCacheProdutosAnalise);
        }
        catch (e) {
        }

    }

    //Carregar produtos do banco de dados
    carregarProdutosNoGrid(): void {
        this.exibeProdutosCarregando = true;
        this.temProdutos = false;

        // Sempre que gera itens, traz todos os filtros por default
        this.filtroExibirQuantidade = '1';
        // Verifica se exibe coluna sazonal
        this.exibeColunaSazonal = this.step1FormGroup.value.incluirProdutosSazonais == 1;

        // Preenche tooltip de filtros
        this.preencherTooltipFiltros();
        // Verifica se tem fornecedor no filtro, para habilitar ou não campo de pendências
        this.temFornecedor = Number(this.fornecedor.obterCodigoSelecionado()) > 0;
        this.fornecedorId = Number(this.fornecedor.obterCodigoSelecionado());

        this._comprasService.obterProdutosAnaliseCompras(this.obterFiltrosPesquisaProdutos()).subscribe((result) => {

            // Recalcula a quantidade a comprar quando marcado para exibir em embalagens
            if (this.step1FormGroup.value.opcaoQtdSugerida == 2) { // Opção 2 -  exibe quantidade em embalagens

                result.forEach(item => {

                    item.lojas.forEach(i => {

                        // Obtem QtdComprar e QtdEmbal
                        let qtdComprar = i.qtdComprar;
                        let qtdEmbalagem = i.qtdEmbalagem;
                        // Calcula sugestão a comprar em Embalagem
                        qtdComprar = qtdComprar / qtdEmbalagem;
                        // Arredonda sugestão a comprar para valor inteiro
                        i.qtdComprar = Math.ceil(qtdComprar);
                    });
                });
            }

            this.exibeProdutosCarregando = false;
            this.temProdutos = result.length > 0;
            this.produtosDataSource = new MatTableDataSource(result);
            this.salvarCacheProdutos();
            this.produtosDataSource.sort = this.sort;
            this.produtosDataSource.paginator = this.paginator;
            // Verifica se o fornecedor possui pendências
            this.possuiPendenciaFornec = result.length > 0 ? result[0].possuiPendenciaFornec : false;
            // Se possui, abre a tela automaticamente
            if (this.possuiPendenciaFornec)
                this.abrirPendenciasDoFornecedor();

        }, (err) => {

            this.exibeProdutosCarregando = false;

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
                    this.carregarProdutosNoGrid();
                }
                else {
                    this.stepper.selectedIndex = 0;
                }
            })
        });
    }

    public calcularEstoqueAtualTotal(item: ResultadoProdutosAnaliseSugestaoCompraModel): string {
        return Number(item.lojas.reduce((a, b) => Number(a) + Number(b.estoque), 0).toFixed(3)).toLocaleString();
    }

    public calcularQtdTotalComprarNumerico(item: ResultadoProdutosAnaliseSugestaoCompraModel): number {
        return Number(item.lojas.reduce((a, b) => Number(a) + Number(b.qtdComprar), 0).toFixed(3));
    }

    public calcularQtdTotalComprar(item: ResultadoProdutosAnaliseSugestaoCompraModel): string {
        return Number(item.lojas.reduce((a, b) => Number(a) + Number(b.qtdComprar), 0).toFixed(3)).toLocaleString();
    }

    public calcularValorTotalComprar(item: ResultadoProdutosAnaliseSugestaoCompraModel): string {
        return 'R$ ' + Number(item.lojas.reduce((a, b) => Number(a) + (Number(b.qtdComprar * b.qtdEmbalagem) * Number(b.valorUnitario) - (Number(b.qtdComprar * b.qtdEmbalagem) * b.valorUnitario * b.percDesconto / 100) + (Number(b.qtdComprar * b.qtdEmbalagem) * b.valorUnitario * b.percAcrescimo / 100)), 0)).toFixed(2).toLocaleString();
    }

    public calcularValorTotalLoja(item: any): string {
        let valorTotal = ((Number(item.qtdComprar) * Number(item.qtdEmbalagem)) * Number(item.valorUnitario));
        let percDesconto = Number(item.percDesconto);
        let percAcrescimo = Number(item.percAcrescimo);

        if (percDesconto > 0)
            valorTotal = valorTotal - (valorTotal * percDesconto) / 100;

        if (percAcrescimo > 0)
            valorTotal = valorTotal + (valorTotal * percAcrescimo) / 100;

        return 'R$ ' + valorTotal.toFixed(2).toLocaleString();
    }

    public calcularEstoqueAtualTotalGeral(): string {
        return Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + (Number(b.lojas.reduce((a2, b2) => Number(a2) + (Number(b2.estoque)), 0))), 0)).toFixed(2).toLocaleString();
    }

    public calcularQtdTotalComprarGeral(): string {
        return Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + (Number(b.lojas.reduce((a2, b2) => Number(a2) + (Number(b2.qtdComprar)), 0))), 0)).toFixed(2).toLocaleString();
    }

    public calcularValorTotalComprarGeral(): string {
        return 'R$ ' + Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + (Number(b.lojas.reduce((a2, b2) => Number(a2) + ((Number(b2.qtdComprar) * Number(b2.qtdEmbalagem)) * Number(b2.valorUnitario) - (Number(b2.qtdComprar * b2.qtdEmbalagem) * b2.valorUnitario * b2.percDesconto / 100) + (Number(b2.qtdComprar * b2.qtdEmbalagem) * b2.valorUnitario * b2.percAcrescimo / 100)), 0))), 0)).toFixed(2).toLocaleString();
    }

    public calcularValorUnitario(item: ResultadoProdutosAnaliseSugestaoCompraModel): number {

        if (Number(item.lojas[0].valorEmbalagem) > 0 && Number(item.lojas[0].qtdEmbalagem) > 0)
            return Number((item.lojas[0].valorEmbalagem / item.lojas[0].qtdEmbalagem).toFixed(3));

        else
            return 0;
    }

    imprimirRelatorio(formato: number, visualizar: boolean = false): void {

        /* Filtra a impressão conforme a Grid */

        // Filtro Quantidade a Comprar
        var itensFiltrados = this.produtosDataSource.data.filter(i => {

            if (this.filtroExibirQuantidade == '1') {
                return this.produtosDataSource.data;
            } else if (this.filtroExibirQuantidade == '2') {
                return this.calcularQtdTotalComprarNumerico(i) > 0;
            } else {
                return this.calcularQtdTotalComprarNumerico(i) > 0;
            }
        });

        // Filtro descrição e ID
        let filtro = this.filtroDescricaoProdutos.trim().toLowerCase();

        if (filtro.length > 0) {

            itensFiltrados = itensFiltrados.filter(i => {

                return (!isNaN(Number(filtro)) && i.prodId == Number(filtro)) || (isNaN(Number(filtro)) && i.descricao.toLowerCase().indexOf(filtro) != -1);;
            });
        }

        /* Imprime o relatório */
        if (itensFiltrados.length > 0) {

            let requisicao: RequisicaoRelatorioAnaliseSugestaoComprasModel =
            {
                formato: formato,
                produtos: itensFiltrados
            };

            this._comprasService.gerarRelatorioAnaliseSugestaoCompras(requisicao, 'Relatório de Operações Financeiras', visualizar);
        }
        else {

            Swal.fire("Ops!", "Não há itens para imprimir. Altere os filtros utilizados para imprimir a Sugestão de Compras.", "warning");
        }

    }

    //Gera uma cotação de compra através da análise
    gerarCotacaoCompra() {

        Swal.fire({
            title: 'Cotação de compra',
            text: "Deseja mesmo gerar uma cotação a partir desta análise?",
            icon: 'info',
            input: 'checkbox',
            inputPlaceholder: 'Incluir somente itens editados',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, gerar cotação!',
            cancelButtonText: 'Não!',
            allowOutsideClick: false,

        }).then((result) => {
            if (result.isConfirmed) {

                Swal.fire({
                    title: 'Tá quase...',
                    html: 'Estamos gerando sua cotação, aguarde...',
                    allowOutsideClick: false,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                    }
                });

                // Se marcado somente editados, filtra os itens do DataSource
                if (result.value) {

                    var produtosEditados = this.produtosDataSource.data.filter(item => {
                        return item.alterado
                    });

                    // Verifica se existem produtos editados. Se não tiver, já retorna ao usuário
                    if (produtosEditados.length == 0) {
                        Swal.close();
                        Swal.fire("Ops!", "Não encontramos nenhum produto editado. Por favor, edite os produtos que deseja inserir na cotação e tente novamente", "warning");
                        return;
                    }
                }

                let requisicao: RequisicaoGerarCotacaoAnaliseSugestaoCompraModel = {
                    fornecedorId: this.fornecedor.obterCodigoSelecionado(),
                    produtos: result.value ? produtosEditados : this.produtosDataSource.data,
                }

                this._comprasService.gerarCotacaoCompraAnaliseSugestao(requisicao).subscribe((result) => {
                    Swal.close();
                    Swal.fire(
                        'Pronto!',
                        'Geramos a cotação de ID ' + result + '.',
                        'success').then((result) => {
                        });
                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        });
    }

    //Gera uma cotação de compra através da análise
    gerarEstoqueMinimo() {
        Swal.fire({
            title: 'Estoque mínimo',
            text: "Deseja mesmo gerar um estoque mínimo a partir desta análise?",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, gerar estoque!',
            cancelButtonText: 'Não!',
            allowOutsideClick: false,

        }).then((result) => {
            if (result.value) {

                Swal.fire({
                    title: 'Tá quase...',
                    html: 'Estamos gerando o estoque, aguarde...',
                    allowOutsideClick: false,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                    }
                });

                if (this.step1FormGroup.value.periodo.startDate != null) {
                    this.step1FormGroup.patchValue({
                        periodo: {
                            startDate: this.step1FormGroup.value.periodo.startDate.format('YYYY-MM-DD'),
                            endDate: this.step1FormGroup.value.periodo.endDate.format('YYYY-MM-DD'),
                        }
                    })
                }

                let requisicao: RequisicaoGerarEstoqueMinimoSugestaoComprasModel = {

                    diasOperacionais: Number(this.step1FormGroup.value.diasOperacionais),
                    margemSeguranca: Number(this.step1FormGroup.value.margemSeguranca),
                    periodo: this.step1FormGroup.value.periodo.startDate != null ? this.step1FormGroup.value.periodo : null,
                    produtos: this.produtosDataSource.data
                }

                this._comprasService.gerarEstoqueMinimoAnaliseSugestao(requisicao).subscribe((result) => {
                    Swal.close();
                    Swal.fire(
                        'Pronto!',
                        'Os produtos tiveram o estoque mínimo atualizado com base na sugestão de compra.',
                        'success').then((result) => {
                        });
                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        });
    }

    tentarCarregarProdutosCache() {

        let produtosAnaliseCache = this._localStorageService.get(this._chaveCacheProdutosAnalise);

        if (produtosAnaliseCache != null && produtosAnaliseCache != '' && produtosAnaliseCache.produtos != null && produtosAnaliseCache.produtos != '') {

            Swal.fire({
                title: 'Análise pendente!',
                text: "Há uma análise não finalizada. Quer continuá-la?",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, continuar a análise!',
                cancelButtonText: 'Não!',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: true
            }).then((result) => {
                if (result.value) {

                    this.stepper.selectedIndex = 1;
                    this.exibeProdutosCarregando = false;
                    this.temProdutos = produtosAnaliseCache.produtos.length > 0;
                    this.step1FormGroup.patchValue(produtosAnaliseCache.formulario);
                    this.fornecedor.definirCodigoSelecionado(Number(produtosAnaliseCache.fornecedor));
                    //this.comprador.definirCodigoSelecionado(Number(produtosAnaliseCache.comprador));
                    //this.representante.definirCodigoSelecionado(Number(produtosAnaliseCache.representante));

                    this.produtosDataSource = new MatTableDataSource(produtosAnaliseCache.produtos);
                    this.produtosDataSource.sort = this.sort;
                    this.produtosDataSource.paginator = this.paginator;
                    // Verifica se tem fornecedor no filtro, para habilitar ou não campo de pendências
                    this.temFornecedor = Number(produtosAnaliseCache.fornecedor) > 0;
                    this.fornecedorId = Number(produtosAnaliseCache.fornecedor);
                    // Verifica se exibe coluna sazonal
                    this.exibeColunaSazonal = this.step1FormGroup.value.incluirProdutosSazonais == 1;
                    // Verifica se o fornecedor possui pendências
                    this.possuiPendenciaFornec = produtosAnaliseCache.produtos[0].possuiPendenciaFornec;
                    // Preenche a tooltip filtros
                    this.preencherTooltipFiltros();

                    Swal.fire(
                        'Pronto!',
                        'A sua análise foi carregada e você pode continuá-la.',
                        'success'
                    )
                }
                else {
                    this._localStorageService.remove(this._chaveCacheProdutosAnalise);
                }
            })
        }
    }

    tentarCarregarColunasCache() {
        let colunasSelecionadasCache = this._localStorageService.get(this._chaveCacheColunasSelecionadas);
        if (colunasSelecionadasCache != null && colunasSelecionadasCache.definido) {
            this.colunasProdutosLojas.forEach(function (valor, chave) {
                if (valor.editavel) {
                    valor.visivel = colunasSelecionadasCache.colunas.indexOf(valor.coluna) != -1;
                }
            });
        }
    }

    private carregarParametros() {
        // Limpa os parâmetros
        this.parametros = [];
        // Obtem os parãmetros do localStorage
        let _parametros = this._localStorageService.get(this._keyParams); //.filter(i => i.id == this._localStorageService.get('lojaLogada'));

        _parametros.forEach(item => {
            this.parametros.push({ lojaId: item.id, reajustePrecoCompras: item.reajustePrecoCompras, compraGeraPagar: item.compraGeraPagar })
        });
    }

    public gerarReajustePreco(item: any): boolean {
        let filtroParamPorLoja = this.parametros.filter(i => {
            return i.lojaId == item.lojaId
        });

        return filtroParamPorLoja[0].reajustePrecoCompras === "S" ? true : false;
    }

    //Aplica os filtros de tela do grid de produtos
    public aplicarFiltroProdutos() {

        //Configura o filtro
        this.produtosDataSource.filterPredicate =
            (data: ResultadoProdutosAnaliseSugestaoCompraModel, filter: string): boolean => {

                //Transforma de json pra objeto
                let filters = JSON.parse(filter);

                //console.log(filters);
                return (
                    //Filtro descrição
                    (filters.filtroDescricao == "" || ((!isNaN(Number(filters.filtroDescricao)) && data.prodId == Number(filters.filtroDescricao)) || (isNaN(Number(filters.filtroDescricao)) && data.descricao.toLowerCase().indexOf(filters.filtroDescricao) != -1)))
                    &&
                    //Filtro quantidade
                    (filters.filtroExibirQuantidade == 1 || (filters.filtroExibirQuantidade == 2 && this.calcularQtdTotalComprarNumerico(data) > 0) || (filters.filtroExibirQuantidade == 3 && this.calcularQtdTotalComprarNumerico(data) == 0)));
            };

        //Define os filtros (e transforma de objeto pra json)
        this.produtosDataSource.filter = JSON.stringify(
            {
                filtroDescricao: this.filtroDescricaoProdutos.trim().toLowerCase(),
                filtroExibirQuantidade: Number(this.filtroExibirQuantidade)
            }
        );
    }

    desassociarFornecedor(): void {

        if (this.itensSelecionados.selected.length > 0) {

            Swal.fire({
                title: 'Confirmação',
                text: "Deseja desassociar os produtos selecionados do fornecedor " + this.fornecedor.obterItemSelecionado().titulo + "?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, desassociar!',
                cancelButtonText: 'Não!'
            }).then((result) => {
                if (result.value) {

                    Swal.fire({
                        title: 'Aguarde...',
                        html: 'Estamos desassociando os produtos do fornecedor...',
                        allowOutsideClick: false,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                        }
                    });

                    let requisicao: RequisicaoDesassociarProdutosFornecedorModel = {
                        prodIds: this.itensSelecionados.selected.map(i => i.prodId),
                        fornecedorId: Number(this.fornecedor.obterCodigoSelecionado()),
                    };

                    this._cadastroService.produtos_DesassociarFornecedor(requisicao).subscribe(resultado => {

                        this.itensSelecionados.clear();
                        Swal.fire('Pronto!', 'Os produtos foram desassociados do fornecedor com sucesso!', 'success');

                    }, (err) => {
                        Swal.fire('Ops!', 'Não foi possível desassociar os produtos do fornecedor. ' + err.error.Message, 'error');
                    });
                }
            });
        }
        else {
            Swal.fire('ops!', 'Selecione um ou mais produtos para desassociar do fornecedor!', 'warning');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    /**
        * On init
        */
    ngOnInit(): void {

    }

    ngAfterViewInit(): void {

        // Valor padrão para iniciar
        this.filtroExibirQuantidade = '1';

        //Define os dados do form1
        this.definirDadosPadraoStep1FormGroup();

        //Realiza buscas no cache
        this.tentarCarregarProdutosCache();
        this.tentarCarregarColunasCache();

        this.carregarParametros();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this.salvarCacheProdutos();
    }

    @HostListener('window:unload', ['$event'])
    unloadHandler(event) {
        this.salvarCacheProdutos();
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHandler(event) {
        this.salvarCacheProdutos();
    }
}