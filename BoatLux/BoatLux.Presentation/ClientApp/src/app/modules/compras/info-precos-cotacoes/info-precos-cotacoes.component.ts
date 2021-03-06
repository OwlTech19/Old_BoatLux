import { Component, ViewEncapsulation, ViewChild, AfterViewInit, APP_BOOTSTRAP_LISTENER } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { RequisicaoObterInformacaoPrecosCotacoesModel, ItemInformacaoPrecoCotacaoModel, RequisicaoSalvarInformacaoPrecosCotacoesModel } from '../../../interfaces/compras.interface';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2'
import { ComprasService } from '../../../services/compras.service';
import * as moment from 'moment';
import { MatStepper, MatHorizontalStepper } from '@angular/material/stepper';
import { ControlesComboLojaComponent } from '../../../controls/combo-loja/combo-loja.component';
import { ControlesBuscaRapidaComponent } from '../../../controls/busca-rapida/busca-rapida.component';
import { MatTableDataSource } from '@angular/material/table';
import { ControlesLegendaComponent } from '../../../controls/legenda/legenda.component';
import * as XLSX from 'xlsx';
import { empty } from 'rxjs';
import { CadastroService } from '../../../services/cadastro.service';
import { RequisicaoGravarLogSenhaFornecedorModel } from '../../../interfaces/cadastro.interface';
import { LocalStorageService } from '../../../services/local-storage.service';

type AOA = any[][];

@Component({
    selector: 'info-precos-cotacoes',
    templateUrl: './info-precos-cotacoes.component.html',
    encapsulation: ViewEncapsulation.None
})

export class InfoPrecosCotacoesComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService,
        private _cadastroService: CadastroService,
        private _localStorageService: LocalStorageService,
    ) {
        // Define o menu de navega????o
        this._fuseNavigationService.setCurrentNavigation('compras_navigation');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em mem??ria
    itensDataSource = new MatTableDataSource<ItemInformacaoPrecoCotacaoModel>();

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
    @ViewChild('condpagto') condpagto: ControlesBuscaRapidaComponent;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    // Tratamentos para o campo validade da cota????o
    locale: any = {
        format: 'YYYY-DD-MM',
        displayFormat: 'DD/MM/YYYY',
    };

    //Chave do cache de par??metros
    private _parametros = 'parametros';

    // Propriedades de par??metros
    exibeValorUltimaCompra: boolean = false;

    //Filtro no grid
    filtroDescricaoProdutos: string = '';
    somenteProdutosAssociados: boolean = false;

    //Flag que indica se os produtos est??o sendo carregados
    exibeProdutosCarregando = false;
    temItens = false;

    // Importa????o da planilha
    data: AOA = [[1, 2], [3, 4]];
    wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

    //Defini????o do formul??rio STEP 1
    step1FormGroup = this._formBuilder.group(
        {
            dataCotacao: [],
            numeroCotacao: [],
        }
    );

    //Defini????o do formul??rio STEP 2
    step2FormGroup = this._formBuilder.group(
        {

        }
    );

    step3FormGroup = this._formBuilder.group(
        {
            prazoEntrega: [],
        }
    );

    //Colunas do grid
    colunasProdutos = ['prodId', 'descricao', 'associadoFornecedor', 'precoEntrada', 'qtdCotacao', 'qtdEmbal', 'qtdTotal', 'valorUnitario', 'valorEmbal', 'valorTotal'];

    // -----------------------------------------------------------------------------------------------------
    // M??todos
    // -----------------------------------------------------------------------------------------------------    

    private carregarGrid(itens: any) {

        /* Vai para a aba de itens */
        this.stepper.selectedIndex = 1;

        this.exibeProdutosCarregando = false;
        this.temItens = itens.length > 0;
        this.itensDataSource = new MatTableDataSource(itens);
        this.itensDataSource.sort = this.sort;
        this.itensDataSource.paginator = this.paginator;
    }

    private verificarParametros() {
        let parametros = this._localStorageService.get(this._parametros).filter(i => i.id == this._localStorageService.get('lojaLogada'));

        // Verifica se exibe R$ Ult. Compra
        this.exibeValorUltimaCompra = parametros[0].cotaValorUltCompra === "S" ? true : false; 
    }

    gerarPlanilha(): void {

        const indexPrimItem: number = 10; // Numero base onde come??am os itens
        let indexUltItem: number = 0; // Atribu??do depois de obter os itens
        let countItens: number = 0; // Auxiliar para obter o index do ??ltimo item
        let itens = [];
        let fileName = 'Cota????o de Compra - N??mero ' + Number(this.step1FormGroup.value.numeroCotacao) + '.xlsx';

        // Obtem campos necess??rios para a planilha
        this.itensDataSource.data.forEach(item => {

            let novoItem: ItemInformacaoPrecoCotacaoModel = {

                itemCotacaoId: item.itemCotacaoId,
                prodId: item.prodId,
                descricao: item.descricao,
                qtdCotacao: item.qtdCotacao,
                qtdEmbal: item.qtdEmbal,
                qtdTotal: item.qtdCotacao * item.qtdEmbal,
                valorUnitario: item.valorUnitario,
                valorTotal: item.valorUnitario * (item.qtdCotacao * item.qtdEmbal),
                precoCusto: item.precoCusto,
            }

            itens.push(novoItem);
            countItens++;

        });

        // Informa????es iniciais
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([
            { A: "Gerado pela Boatlux - OwlTech" },
            { A: "N??mero da cota????o:", B: this.step1FormGroup.value.numeroCotacao },
            { A: "Data da cota????o:", B: this.step1FormGroup.value.dataCotacao.startDate.format('DD/MM/YYYY') },
            { A: empty, B: empty },
            { A: "OBS: Por favor n??o altere as linhas e colunas desta planilha." },
            { A: "Informe os valores unit??rios das mercadorias na coluna G (Valor Unit.)." },
            { A: empty, B: empty },
        ]);

        // Itens
        // Index do ??ltimo item
        indexUltItem = indexPrimItem + countItens - 1;

        // Header dos itens
        XLSX.utils.sheet_add_json(ws, [
            { A: "ID", B: "Prod. ID", C: "Descri????o", D: "Qtd. Unit.", E: "Qtd. Embal.", F: "QTD. Total", G: "Valor Unit.", H: "Valor Total", I: "Valor Refer??ncia" },
        ],
            {
                skipHeader: true,
                origin: "A" + (indexPrimItem - 1), // C??lula inicial 
            }
        );

        // F??rmulas da planilha
        ws['H' + indexPrimItem] = { t: 'n', F: "H" + indexPrimItem + ":H" + indexUltItem, f: "F" + indexPrimItem + ":F" + indexUltItem + "*G" + indexPrimItem + ":G" + indexUltItem };

        // Adiciona o JSON a planilha
        XLSX.utils.sheet_add_json(ws, itens,
            {
                skipHeader: true,
                origin: "A" + indexPrimItem,
            });

        // Gera a pasta da planilha
        const wb: XLSX.WorkBook = XLSX.utils.book_new();

        // Adiciona 
        XLSX.utils.book_append_sheet(wb, ws, 'Cota????o' + Number(this.step1FormGroup.value.numeroCotacao));

        /* save to file */
        XLSX.writeFile(wb, fileName);

    }

    importarPlanilha(evt: any) {
        /* wire up file reader */
        const target: DataTransfer = <DataTransfer>(evt.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            /* read workbook */
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

            /* grab first sheet */
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];

            /* save data */
            this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));

            // Manipula os dados da table
            if (this.data != null) {
                this.data.forEach(itemExcel => {

                    this.itensDataSource.data.forEach(itemTable => {

                        if (itemExcel[1] == itemTable.prodId) {

                            itemTable.valorUnitario = itemExcel[6];
                            itemTable.valorEmbal = itemExcel[6] * itemTable.qtdEmbal;
                            itemTable.alterado = true;
                            return;
                        }

                    });
                });
            }
        };
        reader.readAsBinaryString(target.files[0]);
    }

    definirDadosPadraoStep1FormGroup(): void {
        this.step1FormGroup.reset({
            dataCotacao: {
                startDate: moment().format('YYYY-MM-DD'),
            },
            numeroCotacao: null,

        });

        this.fornecedor.limpar();
    }

    //Aplica os filtros de tela do grid de produtos
    aplicarFiltroProdutos() {
        //Remove espa??os em branco e deixa em min??sculo
        let filtro = this.filtroDescricaoProdutos.trim().toLowerCase();
        this.itensDataSource.filter = filtro;
        //Configura o filtro
        this.itensDataSource.filterPredicate =
            (data: ItemInformacaoPrecoCotacaoModel, filter: string) => (!isNaN(Number(filter)) && data.prodId == Number(filter)) || (isNaN(Number(filter)) && data.descricao.toLowerCase().indexOf(filter) != -1);

    }

    aplicarFiltroProdutosFornecedor() {

        let filtro = "0";

        if (this.somenteProdutosAssociados) {
            this.itensDataSource.filterPredicate =
                (data: ItemInformacaoPrecoCotacaoModel) => data.associadoFornecedor;
            this.itensDataSource.filter = filtro;
        }
        else {
            this.itensDataSource.filter = '';

        }
    }

    carregarProdutosCotacao(): void {

        Swal.fire({
            title: 'T?? quase...',
            html: 'Estamos obtendo dados da cota????o e do fornecedor, aguarde...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });

        if (this.validarCampos()) {

            this.exibeProdutosCarregando = true;
            this.temItens = false;

            let requisicao: RequisicaoObterInformacaoPrecosCotacoesModel = {
                numeroCotacao: this.step1FormGroup.value.numeroCotacao,
                dataCotacao: this.step1FormGroup.value.dataCotacao.startDate.format('YYYY-MM-DD'),
                lojaId: this.comboLoja.obterLojaSelecionada(),
                fornecedorId: this.fornecedor.obterCodigoSelecionado(),
            };

            this._comprasService.obterInformacaoPrecosCotacoes(requisicao).subscribe(result => {

                Swal.close();

                if (result.fornecInformouValores) {

                    Swal.fire({
                        title: 'Aten????o!',
                        text: "Esse fornecedor j?? informou valores nessa cota????o. Para editar valores, por favor informe a senha do fornecedor.",
                        input: 'text',
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK!',
                    }).then((resultSwal) => {

                        Swal.close();

                        // Monta a requisi????o para gravar log da senha
                        if (resultSwal.value === result.senhaFornecedor) {

                            let requisicao: RequisicaoGravarLogSenhaFornecedorModel = {

                                lojaId: this.comboLoja.obterLojaSelecionada(),
                                fornecedorId: this.fornecedor.obterCodigoSelecionado(),
                                senha: resultSwal.value, // Senha do fornecedor digitada pelo usu??rio
                            };

                            //Grava log da senha
                            this._cadastroService.fornecedor_GravarLogSenhaFornecedor(requisicao).subscribe(result => { });

                            // Carrega as informa????es e os itens da cota????o
                            this.carregarGrid(result.itensPagina);
                        }
                        else {
                            Swal.fire('Ops!', 'Senha inv??lida. Verifique a senha e tente novamente.', 'error');
                        }
                    })
                }
                else {
                    this.carregarGrid(result.itensPagina);
                }

                this.step3FormGroup.value.prazoEntrega = result.prazoEntrega;
                this.condpagto.definirCodigoSelecionado(result.condPagtoId);

            }, (err) => {

                this.exibeProdutosCarregando = false;

                Swal.fire({
                    title: 'Ops!',
                    text: "N??o conseguimos concluir a busca, deseja tentar novamente??",
                    icon: 'error',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sim!',
                    cancelButtonText: 'N??o!'
                }).then((result) => {
                    if (result.value) {
                        this.carregarProdutosCotacao();
                    }
                    else {
                        this.stepper.selectedIndex = 0;
                    }
                })
            });
        }
    }

    salvarPrecos(): void {

        // Filtra somente produtos alterados para enviar na requisi????o
        var produtosSalvar = this.itensDataSource.data.filter(function (item) {
            return item.alterado;
        });

        if (this.condpagto.obterCodigoSelecionado() != null && this.validarProdutos(produtosSalvar)) {

            let requisicao: RequisicaoSalvarInformacaoPrecosCotacoesModel = {

                numeroCotacao: this.step1FormGroup.value.numeroCotacao,
                dataCotacao: this.step1FormGroup.value.dataCotacao.startDate.format('YYYY-MM-DD'),
                lojaId: this.comboLoja.obterLojaSelecionada(),
                fornecedorId: Number(this.fornecedor.obterCodigoSelecionado()),
                condPagtoId: Number(this.condpagto.obterCodigoSelecionado()),
                prazoEntrega: Number(this.step3FormGroup.value.prazoEntrega),
                itens: produtosSalvar != null ? produtosSalvar : null,
            };

            Swal.fire({
                title: 'Aguarde...',
                html: 'Estamos salvando os valores na cota????o...',
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }
            });

            this._comprasService.salvarInformacaoPrecosCotacoes(requisicao).subscribe(resultado => {

                if (resultado.sucesso) {
                    Swal.fire('Pronto!', 'Os valores foram salvos na cota????o!', 'success');
                    this.stepper.selectedIndex = 0;
                }

                else
                    Swal.fire('Ops!', 'N??o conseguimos salvar os valores na cota????o. <br/>' + resultado.erro, 'error');

            }, (err) => {
                Swal.fire('Ops!', err.error.Message, 'error');
            });
        }
        else {
            Swal.fire("Ops!", "Por favor, informe a Condi????o de Pagamento para salvar as informa????es", "warning");
        }
    }

    validarCampos() {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.step1FormGroup.value.numeroCotacao == null || this.step1FormGroup.value.numeroCotacao == 0) {
            mensagemRetorno += "<br/>- N??mero da cota????o";
            validado = false;
        }

        if (this.comboLoja.obterLojaSelecionada() == null) {
            mensagemRetorno += "<br/>- Loja da cota????o";
            validado = false;
        }

        if (this.fornecedor.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Fornecedor";
            validado = false;
        }

        //if (this.condpagto.obterCodigoSelecionado() == null) {
        //    mensagemRetorno += "<br/>- Condi????o de pagamento";
        //    validado = false;
        //}

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigat??rios e tente novamente: " + mensagemRetorno, "warning");
            this.stepper.selectedIndex = 0;
            return;
        }

        return validado;
    }

    validarProdutos(itens: ItemInformacaoPrecoCotacaoModel[]): boolean {
        let validado: boolean = true;
        let itensInvalidos: string = "";

        itens.filter(function (item) {
            if (Number(item.qtdCotacao) == 0 || Number(item.qtdEmbal == 0)) {
                itensInvalidos += item.prodId + ', ';
                return item.prodId
            }
        });

        if (itensInvalidos.length > 0) {
            Swal.fire("Ops!", "Encontramos produtos com informa????es inv??lidas.<br/>Por favor, verifique e informe os campos <strong>Qtd. Unit. e Qtd. Embal. </strong>dos seguintes produtos:<br/>" + itensInvalidos.substring(0, itensInvalidos.length - 2), "warning");
            return validado = false;
        }

        return validado;
    }

    //C??lculos do grid - Retornam strings para o grid!!!
    public calcularQtdTotalComprar(item: ItemInformacaoPrecoCotacaoModel): string {
        if (item != null)
            return Number((item.qtdCotacao * item.qtdEmbal)).toFixed(3).toLocaleString();
    }

    public calcularValorTotalComprar(item: ItemInformacaoPrecoCotacaoModel): string {
        if (item != null)
            return 'R$ ' + Number((item.valorUnitario * (item.qtdCotacao * item.qtdEmbal))).toFixed(2).toLocaleString();
    }

    public calcularValorUnitario(item: ItemInformacaoPrecoCotacaoModel): number {

        if (Number(item.valorEmbal) > 0 && Number(item.qtdEmbal) > 0)
            return Number((item.valorEmbal / item.qtdEmbal).toFixed(3));

        else
            return 0;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ M??todos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        this.definirDadosPadraoStep1FormGroup();

        this.verificarParametros();
    }

}