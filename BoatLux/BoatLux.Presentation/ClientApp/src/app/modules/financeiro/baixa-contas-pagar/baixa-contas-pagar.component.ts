import { AfterViewInit, ViewEncapsulation, Component, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { SelectionModel } from "@angular/cdk/collections";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import * as moment from 'moment';
import Swal from "sweetalert2";
import { MatDialog } from "@angular/material/dialog";
// Services
import { UtilsService } from "../../../services/utils.service";
import { UsuarioService } from "../../../services/usuario-service.service";
import { FuseNavigationService } from "../../../../@fuse/components/navigation/navigation.service";
import { FinanceiroService } from "../../../services/financeiro.service";
import { CadastroContasPagar_DialogComponent } from "../contas-pagar/cadastro-contas-pagar-dialog/cadastro-contas-pagar-dialog.component";
//Componentes
import { ControlesComboLojaComponent } from "../../../controls/combo-loja/combo-loja.component";
import { ControlesLegendaComponent } from "../../../controls/legenda/legenda.component";
import { ControlesBuscaRapidaComponent } from "../../../controls/busca-rapida/busca-rapida.component";
import { BaixaContasPagarMultiplos_DialogComponent } from "./baixa-contas-pagar-multiplos-dialog/baixa-contas-pagar-multiplos-dialog.component";
import { BaixaContasPagarIndividual_DialogComponent } from "./baixa-contas-pagar-individual-dialog/baixa-contas-pagar-individual-dialog.component";
import { FiltroRelContasPagar_DialogComponent } from "../contas-pagar/filtro-rel-contas-pagar-dialog/filtro-rel-contas-pagar-dialog.component";
// Interfaces
import { ContasPagarModel, RequisicaoBuscaTitulosPagarModel } from "../../../interfaces/financeiro.interface";

@Component({
    selector: 'baixa-contas-pagar',
    templateUrl: './baixa-contas-pagar.component.html',
    encapsulation: ViewEncapsulation.None
})

export class BaixaContasPagarComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------
    constructor(
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _router: Router,
        private _fuseNavigationService: FuseNavigationService,
        private _financeiroService: FinanceiroService,
        public _utils: UtilsService,
        public _usuario: UsuarioService,
    ) {
        // Define o menu de navegação
        this._fuseNavigationService.setCurrentNavigation('financeiro_navigation');

        // check user permission
        if (!_usuario.checkPermissionControl('251', 'acessar'))
            this._router.navigate(['access-denied']);
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    
    //Armazena os produtos em memória
    itensDataSource: ContasPagarModel[];
    selection = new SelectionModel<number>(true, []);
    selectionModel: ContasPagarModel[] = [];

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('comboloja') comboloja: ControlesComboLojaComponent;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;

    // Períodos pré definidos do componente 
    ranges: any = {
        'Hoje': [moment(), moment()],
        'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Últimos 7 dias': [moment().subtract(6, 'days'), moment()],
        'Últimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'Mês atual': [moment().startOf('month'), moment().endOf('month')],
        'Mês passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    };

    //Flag que indica se os itens estão sendo carregados
    exibeItensCarregando = false;
    temItens = false;

    //Propriedades Totais
    valorPagar: number = 0.00;
    //Propriedades Totais Selecionados
    valorPagarSelecionados: number = 0.00;

    //Definição do formulário de busca
    buscaFormGroup = this._formBuilder.group(
        {
            opcaoTipoData: [],
            periodo: [],
            codPagarId: [],
            numTit: [],
            nota: [],
            parcela: [],
            valor: [],
        }
    );

    //Colunas do grid
    colunasItens = ['select', 'codLojaId', 'codPagarId', 'numTit', 'parcela', 'nota', 'fornecedor', 'dtEntrada', 'dtEmissao', 'dtVencto', 'valorpagar', 'valorjuros', 'valormulta', 'valordesconto', 'valor', 'acoes'];

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {

        var allSelected = true;
        this.itensDataSource.forEach(i => {
            if (!this.selection.isSelected(i.codPagarId)) {
                allSelected = false;
            }
        });
        return allSelected;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        if (this.isAllSelected()) {
            this.itensDataSource.forEach(i => {
                if (this.selection.isSelected(i.codPagarId)) {
                    this.selection.toggle(i.codPagarId);
                    this.addSelectionModel(i, false);
                    this.calcularSelecionados();
                }
            });

            //Apaga tudo
            //this.itensSelecionados.clear();
        }
        else {
            this.itensDataSource.forEach(row => {
                this.selection.select(row.codPagarId);
                this.addSelectionModel(row, true);
                this.calcularSelecionados();
            });
        }
    }

    addSelectionModel(item: ContasPagarModel, checked: boolean): void {

        if (checked) {
            if (this.selectionModel.indexOf(item) === -1) {
                this.selectionModel.push(item);
            }
        }
        else
            this.selectionModel.splice(this.selectionModel.indexOf(item), 1);

    }

    calcularSelecionados(): void {

        this.valorPagarSelecionados = this.selectionModel.reduce(function (total, item) {
            return total + Number(item.valorPagar.toString().replace(/[^-0-9,]*/g, '').replace(',', '.'));
        }, 0);
    }

    //Limpa os filtros e busca novamente
    definirDadosPadrao(): void {
        this.buscaFormGroup.reset();
        this.fornecedor.limpar();

        this.buscaFormGroup.patchValue({
            periodo: {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30))
            },
            nota: null,
            opcaoTipoData: "1",
            codPagarId: null,
            numTit: null,
            parcela: null,
            valor: null,
        })

        this.buscarItens(true);
    }

    //Busca os itens no serviço
    buscarItens(novaBusca: boolean): void {

        if (novaBusca) {
            this.selection.clear();
            this.selectionModel = [];
            this.valorPagarSelecionados = 0;
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

        let requisicao: RequisicaoBuscaTitulosPagarModel =
        {
            paginacao: {
                paginaAtual: this.paginator.pageIndex,
                itensPorPagina: this.paginator.pageSize,
                colunaOrdenacao: this.sort.active,
                direcaoOrdenacao: this.sort.direction
            },

            lojas: this.comboloja.obterLojasSelecionadas(),
            codFornecId: this.fornecedor.obterCodigoSelecionado(),
            opcaoTipoData: Number(this.buscaFormGroup.value.opcaoTipoData),
            periodo: this.buscaFormGroup.value.periodo.startDate != null ? this.buscaFormGroup.value.periodo : null,
            codPagarId: Number(this.buscaFormGroup.value.codPagarId),
            numTit: this.buscaFormGroup.value.numTit,
            parcela: this.buscaFormGroup.value.parcela,
            valor: Number(this.buscaFormGroup.value.valor),
            nota: this.buscaFormGroup.value.nota,
        };

        this._financeiroService.buscarContasPagarEmAberto(requisicao).subscribe((result) => {


            this.exibeItensCarregando = false;
            this.temItens = result.itens.length > 0;
            this.itensDataSource = result.itens;

            this.valorPagar = result.totais.totalTitulos;
            this.legenda.quantidadeResultados = result.paginacao.totalItens;
            this.paginator.length = result.paginacao.totalItens;
            this.paginator.page.subscribe(() => {

                //este trecho vai ser executado quando houver uma mudança de página ou tamanho da página

            });

            //this.itensDataSource.sort = this.sort;
            //this.itensDataSource.paginator = this.paginator;
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

    consultarTitulo(pagarId: number): void {

        const dialog = this._matDialog.open(CadastroContasPagar_DialogComponent, {
            width: '750px',
            data: {
                idTitulo: pagarId,
                apenasConsulta: true
            },
            disableClose: true
        });
    }

    baixarIndividual(pagarId: number, lojaId: number): void {

        const dialog = this._matDialog.open(BaixaContasPagarIndividual_DialogComponent, {
            width: '750px',
            height: 'auto',
            data: {
                pagarId: pagarId,
                lojaId: lojaId,
            },
            disableClose: true
        });
        
        dialog.afterClosed().subscribe(result => {
        
            if (result)
                this.buscarItens(true);
        });
    }

    baixarTitulosSelecionados(): void {

        var idsSelecionados = this.selectionModel.map(i => i.codPagarId);
        
        if (idsSelecionados.length > 1)
            this.baixarMultiplos();
        else
            this.baixarIndividual(idsSelecionados[0], this.selectionModel[0].codLojaId);

    }

    baixarMultiplos(): void {

        const dialog = this._matDialog.open(BaixaContasPagarMultiplos_DialogComponent, {
            width: '750px',
            height: 'auto',
            data: {
                pagarIds: this.selectionModel.map(i => i.codPagarId),
                lojaIds: this.selectionModel.map(i => i.codLojaId),
                fornecedorIds: this.selectionModel.map(i => i.codFornecId),
            },
            disableClose: true
        });

        dialog.afterClosed().subscribe(result => {

            if (result)
                this.buscarItens(true);
        });
    }

    //Abre filtros para impressão de relatório
    imprimirRelatorio() {

        this._matDialog.open(FiltroRelContasPagar_DialogComponent, {
            width: '750px',
            disableClose: true
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos do ciclo de vida
    // -----------------------------------------------------------------------------------------------------
    ngAfterViewInit(): void {

        this.definirDadosPadrao();
        this.buscarItens(true);

        this.paginator.page.subscribe(() => {
            this.buscarItens(false);
        });
        this.sort.sortChange.subscribe(() => {
            this.paginator.pageIndex = 0;
            this.buscarItens(false);
        });
    }

}