import { Component, ViewEncapsulation, ViewChild, AfterViewInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatStepper, MatHorizontalStepper } from "@angular/material/stepper";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import * as moment from 'moment';
import Swal from "sweetalert2";
import { SelectionModel } from "@angular/cdk/collections";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
// Service
import { FuseNavigationService } from "../../../../@fuse/components/navigation/navigation.service";
import { FinanceiroService } from "../../../services/financeiro.service";
import { LocalStorageService } from "../../../services/local-storage.service";
import { UsuarioService } from '../../../services/usuario-service.service';
// Component
import { ControlesComboLojaComponent } from "../../../controls/combo-loja/combo-loja.component";
import { ControlesBuscaRapidaComponent } from "../../../controls/busca-rapida/busca-rapida.component";
import { CadastroContasReceber_DialogComponent } from '../contas-receber/cadastro-contas-receber-dialog/cadastro-contas-receber-dialog.component';
//Interface
import { RequisicaBuscarTitulosClienteModel, TitulosClienteModel } from "../../../interfaces/financeiro.interface";

@Component({
    selector: 'agrupa-titulos',
    templateUrl: './agrupa-titulos.component.html',
    encapsulation: ViewEncapsulation.None
})

export class AgrupaTitulosComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _matDialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _financeiroService: FinanceiroService,
        private _localStorageService: LocalStorageService,
        private _router: Router,
        private _usuario: UsuarioService,
    ) {
        // Define o menu de navegação
        this._fuseNavigationService.setCurrentNavigation('financeiro_navigation');

        // check user permission
        if (!_usuario.checkPermissionControl('157', 'acessar'))
            this._router.navigate(['access-denied']);
    }

    //Propriedades injetadas do grid
    @ViewChild(MatHorizontalStepper) stepper: MatHorizontalStepper;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('comboLoja') comboloja: ControlesComboLojaComponent;
    @ViewChild('cliente') cliente: ControlesBuscaRapidaComponent;
    @ViewChild('vendedor') vendedor: ControlesBuscaRapidaComponent;

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
    itensDataSource: TitulosClienteModel[];
    selection = new SelectionModel<number>(true, []);

    //Flag que indica se os produtos estão sendo carregados
    exibeItensCarregando = false;
    temItens = false;

    valorTotal: number = 0;
    qtdSelecionados: number = 0;

    stepFiltros: MatStepper;
    stepTitulos: MatStepper;

    //Definição do formulário STEP 1
    filtrosFormGroup = this._formBuilder.group(
        {
            tipoData: [],
            periodo: [],
            incTitulosDependentes: [],
        }
    );

    //Colunas do grid
    colunasProdutos = ['select', 'lojaId', 'receberId', 'numTit', 'parcela', 'cliente', 'dtEmissao', 'dtVencto', 'valorJuros', 'valorMulta', 'valor', 'centroDeCusto', 'observacao'];

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
                    this.calculaValorTotal(i.valor, false);
                }
            });

            //Apaga tudo
            //this.itensSelecionados.clear();
        }
        else {
            this.itensDataSource.forEach(row => {
                this.selection.select(row.receberId);
                this.calculaValorTotal(row.valor, true);
            });

        }
    }

    //Ao selecionar lojas, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.vendedor.definirParametros(this.comboloja.obterLojasSelecionadas());
    }

    calculaValorTotal(valor: number, checked): void {
        if (checked) {
            this.valorTotal += valor;
            this.qtdSelecionados++;
        }

        else {
            this.valorTotal -= valor;
            this.qtdSelecionados--;
        }
    }

    definirDadosDefault() {
        this.filtrosFormGroup.patchValue({
            periodo: {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30))
            },
            tipoData: '1',
            incTitulosDependentes: '',
        });

        this.cliente.limpar();
    }

    buscarTitulosCliente(novaBusca: boolean) {

        if (this.validarDados()) {

            if (novaBusca) {
                this.selection.clear();
                this.paginator.pageIndex = 0;
                this.valorTotal = 0;
                this.qtdSelecionados = 0;
            }
            this.exibeItensCarregando = true;
            this.temItens = false;

            if (this.filtrosFormGroup.value.periodo.startDate != null) {
                this.filtrosFormGroup.patchValue({
                    periodo: {
                        startDate: this.filtrosFormGroup.value.periodo.startDate.format('YYYY-MM-DD'),
                        endDate: this.filtrosFormGroup.value.periodo.endDate.format('YYYY-MM-DD'),
                    }
                })
            }

            let requisicao: RequisicaBuscarTitulosClienteModel = {

                paginacao: {
                    paginaAtual: this.paginator.pageIndex,
                    itensPorPagina: this.paginator.pageSize,
                    colunaOrdenacao: this.sort.active,
                    direcaoOrdenacao: this.sort.direction
                },

                lojasId: this.comboloja.obterLojasSelecionadas(),
                clienteId: this.cliente.obterCodigoSelecionado(),
                tipoData: Number(this.filtrosFormGroup.value.tipoData),
                periodo: this.filtrosFormGroup.value.periodo.startDate != null ? this.filtrosFormGroup.value.periodo : null,
                incTitulosDependentes: Number(this.filtrosFormGroup.value.incTitulosDependentes),
                vendedorId: this.vendedor.obterCodigoSelecionado(),
            };

            this._financeiroService.buscarTitulosCliente(requisicao).subscribe((result) => {

                /* Vai para a aba de títulos */
                this.stepper.selectedIndex = 1;

                this.exibeItensCarregando = false;
                this.temItens = result.itens.length > 0;
                this.itensDataSource = result.itens;
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
                        this.buscarTitulosCliente(true);
                    }
                })
            });
        }
    }

    gerarTitulo() {

        const dialog = this._matDialog.open(CadastroContasReceber_DialogComponent, {
            width: '750px',
            data: {
                idTitulo: 0,
                situacao: 'Aberto',
                lojaId: this.comboloja.obterLojasSelecionadas().length > 1 ? this._localStorageService.get('lojaLogada') : this.comboloja.obterLojasSelecionadas()[0],
                clienteId: this.cliente.obterCodigoSelecionado(),
                valorTitulo: this.valorTotal,
                idsTitulosAgrupados: this.selection.selected,
            },
            disableClose: true
        });

        dialog.afterClosed().subscribe(result => {
            this.buscarTitulosCliente(true);
        });
    }

    private validarDados(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.comboloja.obterLojasSelecionadas().length == 0) {
            mensagemRetorno += "<br/>- Loja";
            validado = false;
        }

        if (this.cliente.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Cliente";
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os dados obrigatórios para buscar títulos: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    ngAfterViewInit(): void {
        this.definirDadosDefault();

        this.paginator.page.subscribe(() => {
            this.buscarTitulosCliente(false);
        });
        this.sort.sortChange.subscribe(() => {
            this.paginator.pageIndex = 0;
            this.buscarTitulosCliente(false);
        });
    }
}