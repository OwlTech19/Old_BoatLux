import { Component, ViewChild, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ComprasService } from '../../../../services/compras.service';
import { CadastroService } from '../../../../services/cadastro.service';
import { ResultadoProdutosAnaliseSugestaoCompraModel, RequisicaoConsultaProdutosAnaliseCompra, RequisicaoGerarCotacaoAnaliseSugestaoCompraModel, RequisicaoRelatorioAnaliseSugestaoComprasModel, PedidoCompraModel, ItemPedidoCompraModel } from '../../../../interfaces/compras.interface';
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
import { LocalStorageService } from '../../../../services/local-storage.service';
import { error } from '@angular/compiler/src/util';
import { MatTabGroup } from '@angular/material/tabs';
import * as moment from 'moment';
import { ConstantsService } from '../../../../services/constants.service';
import { ControlesPendenciaFornecedorComponent } from '../../../../controls/pendencia-fornecedor/pendencia-fornecedor.component';
import { Parametros } from '../../../../interfaces/uteis.interface';
import { ProdutoImportacaoModel } from '../../../../interfaces/cadastro.interface';

export interface DialogData {
    id: number;
    lojaId?: number;
    fornecedorPossuiPendencia?: boolean;
}

@Component({
    selector: 'cadastro-pedido-compra',
    templateUrl: './cadastro-pedido-compra-dialog.component.html',
    styleUrls: ['./cadastro-pedido-compra-dialog.component.scss']
})
export class CadastroPedidoCompraDialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<CadastroPedidoCompraDialogComponent>,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService,
        private _cadastroService: CadastroService,
        private _relatorioService: RelatorioService,
        private _dialogService: DialogService,
        private _localStorageService: LocalStorageService,
        private _matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private el: ElementRef) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em memória
    produtosDataSource = new MatTableDataSource<ItemPedidoCompraModel>();

    acao: number;
    id: number;
    titulo: string;

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    //Componentes
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('condPagto') condPagto: ControlesBuscaRapidaComponent;
    @ViewChild('comprador') comprador: ControlesBuscaRapidaComponent;
    @ViewChild('detalhesProduto') detalhesProduto: ControlesDetalhesProdutoComponent;
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;
    @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

    // Tratamentos para o campo validade da cotação
    locale: any = {
        format: 'YYYY-DD-MM',
        displayFormat: 'DD/MM/YYYY',
    };
    // Chave do cache de parâmetros
    private _keyParams = 'parametros';

    // Parâmetros
    parametros: Parametros[] = [];
    geraReajustePreco: boolean = false;

    //Flag que indica se os produtos estão sendo carregados
    exibeProdutosCarregando = false;
    temProdutos = false;
    expandeTodosOsProdutos = false;
    tempIdProdutoExpandido = '';
    temFornecedor: boolean = false;
    fornecPossuiPendencia: boolean = false;

    //Definição do formulário STEP 1
    cadastroFormGroup = this._formBuilder.group(
        {
            dataPedido: [moment(), Validators.required],
            validadePedido: [moment(), Validators.required],
            desconto: ['0'],
            acrescimo: ['0'],
            contato: [''],
            observacoes: [''],
            meioTransporte: ['1'],
        }
    );

    //Colunas do grid
    colunasProdutosCapa = ['prodId', 'descricao', 'qtdComprar', 'qtdEmbalagem', 'qtdTotalComprar', 'valorUnitario', 'valorEmbalagem', 'cmv', 'valorVenda', 'margemBruta', 'valorTotal', 'acoes'];

    //Filtro de descrição no grid de produtos
    filtroDescricaoProdutos: string = '';

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // -----------------------------------------------------------------------------------------------------        

    //Ao selecionar uma loja, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.comprador.definirParametros(this.comboLoja.obterLojaSelecionada());
    }

    desabilitaCampo(tipo: number) {

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

    // Verifica e zero campos de acréscimo e desconto, alternadamente
    zerarAcrescimo(): void {

        if (this.cadastroFormGroup.value.desconto > 0) {

            this.cadastroFormGroup.controls['acrescimo'].setValue(0);
        }
    }

    zerarDesconto(): void {
        if (this.cadastroFormGroup.value.acrescimo > 0) {

            this.cadastroFormGroup.controls['desconto'].setValue(0);
        }
    }

    novoItem() {
        //this.cadastroFormGroup.reset();
        this.acao = 1;
        this.titulo = "Cadastro de pedido de compra";
        this.id = 0;
    }

    editarItem(id: number) {
        //this.cadastroFormGroup.reset();
        this.acao = 2;
        this.titulo = "Alteração de pedido de compra #" + id.toString();
        this.id = id;
        this.fornecPossuiPendencia = this.data.fornecedorPossuiPendencia;
        this.carregarDadosPedidoCompra(id);
    }

    //Carregar informações e produtos do pedido no banco de dados
    carregarDadosPedidoCompra(id: number) {

        this._comprasService.obterDadosPedidoCompra(id).subscribe(resultado => {

            //Carrega os dados do formulário
            this.cadastroFormGroup.patchValue(
                {
                    dataPedido: {
                        startDate: resultado.data != null ? resultado.data : moment(),
                    },
                    validadePedido: {
                        startDate: resultado.validade != null ? resultado.validade : moment(),
                    },
                    acrescimo: resultado.acrescimo,
                    desconto: resultado.desconto,
                    contato: resultado.contato,
                    observacoes: resultado.obs,
                    meioTransporte: resultado.meioTransporte != null ? resultado.meioTransporte.trim() : null
                });

            //Carrega o buscarápida
            this.comboLoja.definirLojaSelecionada(resultado.lojaId);
            this.fornecedor.definirCodigoSelecionado(resultado.fornecedorId);
            this.comprador.definirCodigoSelecionado(resultado.compradorId);
            this.condPagto.definirCodigoSelecionado(resultado.condPagtoId);

            //Quando o serviço retornar os dados, atualiza o grid aqui
            this.produtosDataSource = new MatTableDataSource<ItemPedidoCompraModel>(resultado.produtos);
            this.produtosDataSource.sort = this.sort;
            this.produtosDataSource.paginator = this.paginator;
            //this.produtosDataSource._updateChangeSubscription();
            //this.atualizarGridProdutos();
        });
    }

    salvarCadastro() {

        if (this.validarCapa()) {

            // Obtem somente itens novos e editados para salvar
            var produtosSalvar = this.produtosDataSource.data.filter(function (item) {
                return item.alterado;
            });

            if (this.validarProdutos(produtosSalvar)) {

                let pedidoCompra: PedidoCompraModel = {
                    compraId: this.id,
                    lojaId: this.comboLoja.obterLojaSelecionada(),
                    fornecedorId: Number(this.fornecedor.obterCodigoSelecionado()),
                    compradorId: Number(this.comprador.obterCodigoSelecionado()),
                    condPagtoId: Number(this.condPagto.obterCodigoSelecionado()),
                    data: this.cadastroFormGroup.value.dataPedido.startDate.format('YYYY-MM-DD'),
                    validade: this.cadastroFormGroup.value.validadePedido.startDate.format('YYYY-MM-DD'),
                    acrescimo: Number(this.cadastroFormGroup.value.acrescimo),
                    desconto: Number(this.cadastroFormGroup.value.desconto),
                    contato: this.cadastroFormGroup.value.contato != null ? this.cadastroFormGroup.value.contato.toUpperCase() : null,
                    obs: this.cadastroFormGroup.value.observacoes,
                    meioTransporte: this.cadastroFormGroup.value.meioTransporte != null ? this.cadastroFormGroup.value.meioTransporte.trim() : null,
                    valorPedido: this.CalcularTotalPedido(),
                    produtos: produtosSalvar != null ? produtosSalvar : null, // Lista de produtos    
                    gerarReajustePreco: this.geraReajustePreco,
                };

                Swal.fire({
                    title: 'Aguarde...',
                    html: 'Estamos salvando seu pedido...',
                    allowOutsideClick: false,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                    }
                });

                this._comprasService.salvarDadosPedidoCompra(pedidoCompra).subscribe(resultado => {

                    //console.log(resultado);
                    this.carregarDadosPedidoCompra(resultado);

                    Swal.fire('Pronto!', 'O pedido foi salvo com sucesso. Você pode continuar editando-o.', 'success');

                    if (this.id == 0) {
                        this.tabGroup.selectedIndex = 1;
                        this.editarItem(resultado);
                    }

                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        }
    }

    validarCapa(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        // Verifica se tem desconto e acréscimo informado. Caso sim, zera acréscimo e desconto prevalece
        if (this.cadastroFormGroup.value.acrescimo > 0 && this.cadastroFormGroup.value.desconto > 0)
            this.zerarAcrescimo();

        if (this.cadastroFormGroup.value.dataPedido.startDate == null) {
            mensagemRetorno += "<br/>- Informe a data do pedido";
            validado = false;
        }

        if (this.cadastroFormGroup.value.validadePedido.startDate == null) {
            mensagemRetorno += "<br/>- Informe a data de validade do pedido";
            validado = false;
        }

        if (this.comprador.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe o comprador";
            validado = false;
        }

        if (this.fornecedor.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe o fornecedor";
            validado = false;
        }

        if (this.condPagto.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe a condição de pagamento";
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigatórios e tente novamente: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    validarProdutos(itens: ItemPedidoCompraModel[]): boolean {
        let validado: boolean = true;
        let itensInvalidos: string = "";

        itens.filter(function (item) {
            if (Number(item.qtdComprar) == 0 || Number(item.qtdEmbalagem == 0) || Number(item.valorUnitario == 0)) {
                itensInvalidos += item.prodId + ', ';
                return item.prodId
            }
        });

        if (itensInvalidos.length > 0) {
            Swal.fire("Ops!", "Encontramos produtos com informações inválidas.<br>Por favor, verifique e informe os campos <strong>Qtd. Unit., Qtd. Embal. e R$ Unit. </strong>dos seguintes produtos: " + itensInvalidos.substring(0, itensInvalidos.length - 2), "warning");
            return validado = false;
        }

        return validado;
    }

    //Edita as colunas do grid de produtos por loja
    abrirJanelaDetalhesProduto(item: ResultadoProdutosAnaliseSugestaoCompraModel): void {

        this._matDialog.open(ControlesDetalhesProdutoComponent, {
            width: '100%',
            height: '80%',
            data: { prodId: item.prodId, descricao: item.descricao }
        });
    }

    abrirPendenciasDoFornecedor(): void {
        if (this.fornecedor.obterCodigoSelecionado() != null)
            this._dialogService.abrirDialogGrande(ControlesPendenciaFornecedorComponent, {
                fornecedorId: this.fornecedor.obterCodigoSelecionado(),
                razao: this.fornecedor.obterItemSelecionado().titulo,
            }).subscribe(result => {
                this.verificarPendenciaFornecedor(this.fornecedor.obterCodigoSelecionado());
            });
        else
            Swal.fire('Atenção!', "Informe o fornecedor do pedido para acessar as pendências.", 'warning');
    }

    removerProduto(item: ItemPedidoCompraModel) {

        Swal.fire({
            title: 'Atenção',
            text: "Deseja mesmo remover o produto '" + item.descricao + "' do pedido?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, remover!',
            cancelButtonText: 'Não!'
        }).then((result) => {
            if (result.value) {

                if (item.itemCompraId > 0) {
                    this._comprasService.apagarItemPedidoCompra(item.itemCompraId).subscribe(() => {
                        Swal.fire('Pronto!', 'O item foi excluído do pedido com sucesso!', 'success');
                    }, (err) => {
                        Swal.fire('Ops!', "Não conseguimos remover o produto do pedido.<br> " + err.error.Message, 'error');
                    });
                }

                let itemExistente = this.produtosDataSource.data.find(i => i.prodId == item.prodId);
                if (itemExistente != null) {

                    //Remove
                    this.produtosDataSource.data = this.produtosDataSource.data.filter(function (produto) {
                        return produto.prodId !== itemExistente.prodId // Verifica por produto, pois produtos adicionados não tem itemCompraId
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
        this._dialogService.importarMultiplosProdutos([this.comboLoja.obterLojaSelecionada()], this.produtosDataSource.data.map(i => i.prodId), this.fornecedor.obterCodigoSelecionado()).subscribe(resultado => {

            if (resultado != null) {
                resultado.forEach((produto: ProdutoImportacaoModel) => {

                    let novoItem: ItemPedidoCompraModel = {
                        prodId: produto.prodId,
                        descricao: produto.descricao,
                        barra: produto.barra,
                        lojaId: this.comboLoja.obterLojaSelecionada(),
                        qtdComprar: produto.itens[0].quantidade,
                        qtdEmbalagem: produto.itens[0].qtdEmbalagem,
                        valorUnitario: produto.itens[0].precoCusto,
                        valorEmbalagem: produto.itens[0].precoCusto,
                        cmv: produto.itens[0].precoCusto,
                        valorVenda: produto.itens[0].precoVenda,
                        margemBruta: 100 - (produto.itens[0].precoCusto / produto.itens[0].precoVenda) * 100,
                        alterado: true
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
            (data: ItemPedidoCompraModel, filter: string) => (!isNaN(Number(filter)) && data.prodId == Number(filter)) || (isNaN(Number(filter)) && data.descricao.toLowerCase().indexOf(filter) != -1);
    }

    // Cálculos do Pedido
    CalcularTotalPedido(): number {
        let totalPedido = 0;

        this.produtosDataSource.data.forEach(item => {
            totalPedido += (item.valorUnitario * (item.qtdComprar * item.qtdEmbalagem));
        });

        // Calcula desconto
        totalPedido = totalPedido - (totalPedido * Number(this.cadastroFormGroup.value.desconto)) / 100;

        // Calcula acréscimo
        totalPedido = totalPedido + (totalPedido * Number(this.cadastroFormGroup.value.acrescimo)) / 100;

        return totalPedido;
    }

    // Verifica na API sem o fornecedor possui pendência em aberto
    verificarPendenciaFornecedor(fornecedorId?: number): void {

        let id = fornecedorId > 0 ? fornecedorId : this.fornecedor.obterCodigoSelecionado();

        if (id) {
            this._cadastroService.fornecedor_VerificarPendencia(id).subscribe(resultado => {

                this.fornecPossuiPendencia = resultado;
            });
        }
    }

    //Cálculos do grid - Retornam strings para o grid!!!
    public calcularQtdTotalComprar(item: ItemPedidoCompraModel): string {
        if (item != null)
            return Number((item.qtdComprar * item.qtdEmbalagem).toFixed(3)).toLocaleString();
    }

    public calcularValorTotalComprar(item: ItemPedidoCompraModel): string {
        if (item != null)
            return 'R$ ' + Number((item.valorUnitario * (item.qtdComprar * item.qtdEmbalagem))).toFixed(2).toLocaleString();
    }

    public calcularQtdComprarGeral(): string {
        return Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + Number(b.qtdComprar), 0).toFixed(3)).toLocaleString();
    }

    public calcularQtdTotalComprarGeral(): string {
        return Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + Number(b.qtdComprar * b.qtdEmbalagem), 0).toFixed(3)).toLocaleString();
    }

    public calcularValorCompraGeral(): string {
        return 'R$' + Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + Number(b.valorUnitario), 0)).toFixed(3).toLocaleString();
    }

    public calcularValorTotalComprarGeral(): string {
        return 'R$' + Number(this.produtosDataSource.data.reduce((a, b) => Number(a) + Number(b.valorUnitario * (b.qtdComprar * b.qtdEmbalagem)), 0)).toFixed(3).toLocaleString();
    }

    public calcularValorUnitario(item: ItemPedidoCompraModel): number {

        if (Number(item.valorEmbalagem) > 0 && Number(item.qtdEmbalagem) > 0)
            return Number((item.valorEmbalagem / item.qtdEmbalagem).toFixed(3));

        else
            return 0;
    }

    carregarParametros() {
        // Obtem a loja do pedido
        let lojaId = Number(this.comboLoja.obterLojaSelecionada()) > 0 ? Number(this.comboLoja.obterLojaSelecionada()) : this.data.lojaId;
        // Limpa os parâmetros
        this.parametros = [];
        // Obtem os parâmetros da loja
        let _parametros = this._localStorageService.get(this._keyParams).filter(i => i.id == lojaId);

        //Adiciona os parâmetros da loja do pedido ao model
        _parametros.forEach(i => {
            // Adiciona os parâmetros do Pedido de Compra
            this.parametros.push({ lojaId: i.id, reajustePrecoCompras: i.reajustePrecoCompras })
        });
        // Verifica se gera contas a pagar dos pedidos gerados
        this.geraReajustePreco = this.parametros[0].reajustePrecoCompras === "S" ? true : false;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        if (this.data.id > 0)
            this.editarItem(this.data.id);
        else
            this.novoItem();

        // Inicia componente com data do pedido e validade preenchidos
        this.cadastroFormGroup.reset({
            dataPedido: {
                startDate: moment().format('YYYY-MM-DD'),
            },
            validadePedido: {
                startDate: moment().format('YYYY-MM-DD'),
            }
        });

        this.carregarParametros();
    }
}