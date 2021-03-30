import { Component, ViewEncapsulation, AfterViewInit, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from "@angular/cdk/collections";
import { MatDialog } from "@angular/material/dialog";
import Swal from "sweetalert2";
import * as moment from "moment";
// Services
import { FuseNavigationService } from "../../../../@fuse/components/navigation/navigation.service";
import { FinanceiroService } from "../../../services/financeiro.service";
import { UtilsService } from "../../../services/utils.service";
import { UsuarioService } from "../../../services/usuario-service.service";
import { LocalStorageService } from "../../../services/local-storage.service";
import { DialogService } from "../../../services/dialog.service";
// Component
import { ControlesComboLojaComponent } from "../../../controls/combo-loja/combo-loja.component";
import { ControlesBuscaRapidaComponent } from "../../../controls/busca-rapida/busca-rapida.component";
import { ControlesLegendaComponent } from "../../../controls/legenda/legenda.component";
import { FiltroRelContasReceber_DialogComponent } from '../contas-receber/filtro-rel-contas-receber-dialog/filtro-rel-contas-receber-dialog.component';
import { CadastroContasReceber_DialogComponent } from "../contas-receber/cadastro-contas-receber-dialog/cadastro-contas-receber-dialog.component";
import { ControlesConsultaCupomNfComponent } from "../../../controls/consulta-cupom-nf/consulta-cupom-nf.component";
import { BaixaContasReceberMultiplos_DialogComponent } from "./baixa-contas-receber-multiplos/baixa-contas-receber-multiplos-dialog.component";
import { BaixaContasReceberIndividual_DialogComponent } from "./baixa-contas-receber-individual/baixa-contas-receber-individual-dialog.component";
import { BaixaContasReceberValor_DialogComponent } from "./baixa-contas-receber-valor/baixa-contas-receber-valor-dialog.component";
import { AtribuirInformacoesTitulos_DialogComponent, AtribuirInformacoesTitulos_DialogComponent_Data } from '../atribuir-informacoes-titulos-dialog/atribuir-informacoes-titulos-dialog.component';
// Interface
import { ContasReceberModel, RequisicaoBuscaTitulosReceberModel } from "../../../interfaces/financeiro.interface";
import { Parametros } from "../../../interfaces/uteis.interface";

// Constantes
const MODULO = "receber";

@Component({
    selector: 'baixa-contas-receber',
    templateUrl: './baixa-contas-receber.component.html',
    styleUrls: ['./baixa-contas-receber.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class BaixaContasReceberComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------
    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _financeiroService: FinanceiroService,
        private _localStorageService: LocalStorageService,
        public _usuario: UsuarioService,
        public _utils: UtilsService,
        private _router: Router,
        private _dialogService: DialogService
    ) {
        // Define o menu de navegação
        this._fuseNavigationService.setCurrentNavigation('financeiro_navigation');

        // check user permission
        if (!_usuario.checkPermissionControl('269', 'acessar'))
            this._router.navigate(['access-denied']);
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('comboLoja') comboloja: ControlesComboLojaComponent;
    @ViewChild('cliente') cliente: ControlesBuscaRapidaComponent;
    @ViewChild('tipocliente') tipocliente: ControlesBuscaRapidaComponent;
    @ViewChild('tipodocumento') tipodocumento: ControlesBuscaRapidaComponent;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    // Períodos pré definidos do componente 
    ranges: any = {
        'Hoje': [moment(), moment()],
        'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Últimos 7 dias': [moment().subtract(6, 'days'), moment()],
        'Últimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'Mês atual': [moment().startOf('month'), moment().endOf('month')],
        'Mês passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    };

    //Armazena os produtos em memória
    itensDataSource: ContasReceberModel[];
    selection = new SelectionModel<number>(true, []);
    selectionModel: ContasReceberModel[] = [];

    //Flag que indica se os itens estão sendo carregados
    exibeItensCarregando = false;
    temItens = false;

    //Propriedades Totais
    exibeInfoClie: boolean = false;
    totalTitulos: number = 0.00;
    totalJuros: number = 0.00;
    totalMulta: number = 0.00;
    totalDesconto: number = 0.00;
    valorReceber: number = 0.00;
    limiteCred: number = 0.00;
    saldoClie: number = 0.00;
    //Propriedades Totais Selecionados
    totalSelecionados: number = 0.00;
    jurosSelecionados: number = 0.00;
    multaSelecionados: number = 0.00;
    descontoSelecionados: number = 0.00;
    valorReceberSelecionados: number = 0.00;

    // Propriedades de parâmetros
    parametros: Parametros[] = [];
    exibeDtVenctoOriginal: boolean = false;

    // Chave do cache de parâmetros
    private _keyParams = 'parametros';

    //Definição do formulário de busca
    buscaFormGroup = this._formBuilder.group(
        {
            lojas: [],
            receberId: [],
            numTit: [],
            parcela: [],
            notaEcf: [],
            opcaoTipoData: ['1'],
            periodo: [],
            valor: [],
            cheque: [],
            codclieId: [],
            tipodocumentoId: [],
            tipoClienteId: [],
        }
    );

    //Colunas do grid
    colunasItens = ['select', 'codlojaid', 'receberid', 'numtit', 'parcela', 'notaecf', 'razao', 'dtemissao', 'dtvencto', 'dtvenctooriginal', 'valorreceber', 'valorjuros', 'valormulta', 'valordesconto', 'valor', 'acoes'];

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {

        var allSelected = true;
        this.itensDataSource.forEach(i => {
            if (!this.selection.isSelected(i.receberId)) {
                allSelected = false;
            }
        });

        return allSelected;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        if (this.isAllSelected()) {

            this.itensDataSource.forEach(i => {
                if (this.selection.isSelected(i.receberId)) {
                    this.selection.toggle(i.receberId);
                    this.addSelectionModel(i, false);
                    this.calcularSelecionados();
                }
            });
        }
        else {
            this.itensDataSource.forEach(row => {
                this.selection.select(row.receberId)
                this.addSelectionModel(row, true);
                this.calcularSelecionados();
            });
        }
    }

    addSelectionModel(item: ContasReceberModel, checked: boolean): void {

        if (checked) {
            if (this.selectionModel.indexOf(item) === -1) {
                this.selectionModel.push(item);
            }
        }
        else
            this.selectionModel.splice(this.selectionModel.indexOf(item), 1);

    }

    calcularSelecionados(): void {

        this.totalSelecionados = this.selectionModel.reduce(function (total, item) {
            return total + Number(item.valor.toString().replace(/[^-0-9,]*/g, '').replace(',', '.'));
        }, 0);

        this.jurosSelecionados = this.selectionModel.reduce(function (total, item) {
            return total + Number(item.valorJuros.toString().replace(/[^-0-9,]*/g, '').replace(',', '.'));
        }, 0);

        this.multaSelecionados = this.selectionModel.reduce(function (total, item) {
            return total + Number(item.valorMulta.toString().replace(/[^-0-9,]*/g, '').replace(',', '.'));
        }, 0);

        this.descontoSelecionados = this.selectionModel.reduce(function (total, item) {
            return total + Number(item.valorDesconto.toString().replace(/[^-0-9,]*/g, '').replace(',', '.'));
        }, 0);

        this.valorReceberSelecionados = this.selectionModel.reduce(function (total, item) {
            return total + Number(item.valorReceber.toString().replace(/[^-0-9,]*/g, '').replace(',', '.'));
        }, 0);
    }

    //Limpa os filtros e busca novamente
    definirDadosPadrao(): void {
        this.buscaFormGroup.reset();
        this.cliente.limpar();
        this.tipocliente.limpar();
        this.tipodocumento.limpar();

        this.buscaFormGroup.patchValue({
            periodo: {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30))
            },
            situacao: "",
            opcaoTipoData: "1",
        })

        this.buscarItens(true);
    }

    //Busca os itens no serviço
    buscarItens(novaBusca: boolean): void {

        if (novaBusca) {
            this.selection.clear();
            this.selectionModelClear();
            this.paginator.pageIndex = 0;
        }

        this.exibeItensCarregando = true;
        this.temItens = false;

        if (this.buscaFormGroup.value.periodo.startDate != null) {
            this.buscaFormGroup.patchValue({
                periodo: {
                    startDate: this.buscaFormGroup.value.periodo.startDate.format('YYYY-MM-DD'),
                    endDate: this.buscaFormGroup.value.periodo.endDate.format('YYYY-MM-DD'),
                }
            })
        }

        let requisicao: RequisicaoBuscaTitulosReceberModel =
        {
            paginacao: {
                paginaAtual: this.paginator.pageIndex,
                itensPorPagina: this.paginator.pageSize,
                colunaOrdenacao: this.sort.active,
                direcaoOrdenacao: this.sort.direction
            },

            lojas: this.comboloja.obterLojasSelecionadas(),
            receberId: Number(this.buscaFormGroup.value.receberId),
            numTit: this.buscaFormGroup.value.numTit,
            parcela: this.buscaFormGroup.value.parcela != null ? String(this.buscaFormGroup.value.parcela) : null,
            notaEcf: this.buscaFormGroup.value.notaEcf != null ? this.buscaFormGroup.value.notaEcf.trim() : null,
            opcaoTipoData: Number(this.buscaFormGroup.value.opcaoTipoData),
            periodo: this.buscaFormGroup.value.periodo.startDate != null ? this.buscaFormGroup.value.periodo : null,
            valor: Number(this.buscaFormGroup.value.valor),
            cheque: this.buscaFormGroup.value.cheque != null ? this.buscaFormGroup.value.cheque : null,
            codClieId: this.cliente.obterCodigoSelecionado(),
            tipoDocumentoId: Number(this.tipodocumento.obterCodigoSelecionado()),
            tipoClienteId: Number(this.tipocliente.obterCodigoSelecionado()),
        };

        this._financeiroService.buscarTitulosEmAberto(requisicao).subscribe((result) => {

            this.exibeItensCarregando = false;
            this.temItens = result.itens.length > 0;
            this.itensDataSource = result.itens;

            this.exibeInfoClie = this.cliente.obterCodigoSelecionado() != null;
            this.totalTitulos = result.totais.totalTitulos;
            this.totalJuros = result.totais.totalJuros;
            this.totalMulta = result.totais.totalMulta;
            this.totalDesconto = result.totais.totalDesconto;
            this.valorReceber = result.totais.valorReceber;
            this.limiteCred = result.totais.limiteCred;
            this.saldoClie = result.totais.saldoClie;

            this.legenda.quantidadeResultados = result.paginacao.totalItens;
            this.paginator.length = result.paginacao.totalItens;
            this.paginator.page.subscribe(() => {

                //este trecho vai ser executado quando houver uma mudança de página ou tamanho da página
                //this.buscarItens();

            });

        }, (err) => {

            this.exibeItensCarregando = false;

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
                    this.buscarItens(true);
                }
            })
        });

    }

    // Abre tela de filtros para relatório
    imprimirRelatorio(): void {

        this._matDialog.open(FiltroRelContasReceber_DialogComponent, {
            width: '750px',
            disableClose: true
        });
    }

    // Operações
    baixarTitulosSelecionados(): void {

        var idsSelecionados = this.selectionModel.map(i => i.receberId);

        if (idsSelecionados.length > 1)
            this.baixarMultiplos();
        else
            this.baixarIndividual(idsSelecionados[0], this.selectionModel[0].codLojaId);
    }

    baixarTitulosPorValor(): void {

        const unique = (value, index, self) => {
            return self.indexOf(value) === index
        }

        const clientes = this.selectionModel.map(i => i.codClieId);
        const distinctClientes = clientes.filter(unique);

        if (distinctClientes.length == 1) {
            this._dialogService.abrirDialogMedia(BaixaContasReceberValor_DialogComponent, {
                titulos: this.selectionModel
            }).subscribe(result => {

                if (result)
                    this.buscarItens(true);
            });
        }
        else {
            Swal.fire('Atenção!', 'Para realizar a baixa por valor, selecione títulos de apenas um cliente.', 'warning');
        }

    }

    consultarTitulo(item: ContasReceberModel): void {

        const dialog = this._matDialog.open(CadastroContasReceber_DialogComponent, {
            width: '750px',
            data: {
                idTitulo: item.receberId,
                situacao: item.situacao,
                apenasConsulta: true
            },
            disableClose: true
        });
    }

    baixarIndividual(id: number, lojaId: number): void {

        const dialog = this._matDialog.open(BaixaContasReceberIndividual_DialogComponent, {
            width: '750px',
            height: 'auto',
            data: {
                receberId: id,
                lojaId: lojaId,
            },
            disableClose: true
        });

        dialog.afterClosed().subscribe(result => {

            if (result)
                this.buscarItens(true);
        });
    }

    baixarMultiplos() {

        let totalReceber = this.selectionModel.reduce(function (total, item) {
            return total + Number(item.valorReceber.toString().replace(/[^-0-9,]*/g, '').replace(',', '.'));
        }, 0);

        const dialog = this._matDialog.open(BaixaContasReceberMultiplos_DialogComponent, {
            width: '750px',
            height: 'auto',
            data: {
                receberIds: this.selectionModel.map(i => i.receberId),
                lojaIds: this.selectionModel.map(i => i.codLojaId),
                clienteIds: this.selectionModel.map(i => i.codClieId),
                totalReceber: totalReceber
            },
            disableClose: true
        });

        dialog.afterClosed().subscribe(result => {

            if (result)
                this.buscarItens(true);
        });
    }

    consultarCupomNf(item: ContasReceberModel) {

        if (item.codNf > 0 || item.codLanctoPdv != null) {

            this._dialogService.abrirDialogMedia(ControlesConsultaCupomNfComponent, {
                lojaId: item.codLojaId,
                receberId: item.receberId,
                tipoConsulta: item.codNf > 0 ? 1 : 2, //1- NF-e / 2- Coo
                codNf: item.codNf,
            }).subscribe(result => {
                // Não faz nada quando fecha a tela
            });
        }
        else {
            Swal.fire('Atenção', 'O título selecionado não foi gerado a partir de uma NF-e ou de um cupom, portanto não há consulta.', 'warning');
        }
    }

    atribuirInformacaoTitulos() {
        if (this.selection.selected.length > 0) {

            var selectedItems = this.itensDataSource.filter(i => {
                if (this.selection.isSelected(i.receberId)) {
                    return i;
                }
            });

            let data: AtribuirInformacoesTitulos_DialogComponent_Data = {
                idSelecionados: selectedItems.map(i => i.receberId),
                modulo: MODULO,
                situacao: selectedItems.map(i => i.situacao),
                lojasSelecionadas: selectedItems.map(i => i.codLojaId),
            };

            const dialog = this._matDialog.open(AtribuirInformacoesTitulos_DialogComponent, {
                width: '500px',
                data: data,
                disableClose: true
            });

            dialog.afterClosed().subscribe(result => {
                if (result)
                    this.buscarItens(true);
            });
        }
        else {
            Swal.fire('Ops!', 'Selecione títulos para atribuir informações!', 'warning');
        }
    }

    private verificarParametros() {
        let _parametrosLojaLogada = this._localStorageService.get(this._keyParams).filter(i => i.id == this._localStorageService.get('lojaLogada'));

        // Obtem parâmetros para o Baixa Contas a Receber
        this.exibeDtVenctoOriginal = _parametrosLojaLogada[0].mostrarDtVenctoOriginal === 'S' ? true : false;
    }

    private selectionModelClear() {
        
        this.selectionModel = [];

        this.totalSelecionados = 0;
        this.jurosSelecionados = 0;
        this.multaSelecionados = 0;
        this.descontoSelecionados = 0;
        this.valorReceberSelecionados = 0;
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos do ciclo de vida
    // -----------------------------------------------------------------------------------------------------

    ngAfterViewInit(): void {

        this.verificarParametros();
        this.definirDadosPadrao();

        this.paginator.page.subscribe(() => {
            this.buscarItens(false);
        });
        this.sort.sortChange.subscribe(() => {
            this.paginator.pageIndex = 0;
            this.buscarItens(false);
        });
    }
}