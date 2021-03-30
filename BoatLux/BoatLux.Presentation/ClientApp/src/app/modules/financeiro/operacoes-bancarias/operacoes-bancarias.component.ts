import { Component, ViewEncapsulation, AfterViewInit, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import * as moment from 'moment';
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import Swal from "sweetalert2";
// Services
import { FuseNavigationService } from "../../../../@fuse/components/navigation/navigation.service";
import { FinanceiroService } from "../../../services/financeiro.service";
import { UsuarioService } from "../../../services/usuario-service.service";
// Components
import { ControlesComboLojaComponent } from "../../../controls/combo-loja/combo-loja.component";
import { ControlesBuscaRapidaComponent } from "../../../controls/busca-rapida/busca-rapida.component";
import { ControlesLegendaComponent } from "../../../controls/legenda/legenda.component";
import { CadastroOperacaoBancaria_DialogComponent } from "./cadastro-operacao-bancaria-dialog/cadastro-operacao-bancaria-dialog.component";
import { FiltroExtratoBancario_DialogComponent } from "./filtro-extrato-bancario-dialog/filtro-extrato-bancario-dialog.component";
// Interfaces
import { RequisicaoBuscaMovimentacaoBancariaModel, OperacaoBancariaModel } from "../../../interfaces/financeiro.interface";


@Component({
    selector: 'operacoes-bancarias',
    templateUrl: './operacoes-bancarias.component.html',
    encapsulation: ViewEncapsulation.None
})

export class OperacoesBancariasComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------
    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _financeiroService: FinanceiroService,
        public _usuario: UsuarioService,
        private _router: Router,
    ) {
        // Define o menu de navegação
        this._fuseNavigationService.setCurrentNavigation('financeiro_navigation');

        // check user permission
        if (!_usuario.checkPermissionControl('259', 'acessar'))
            this._router.navigate(['access-denied']);
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Propriedades injetadas do grid
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('comboLoja') comboloja: ControlesComboLojaComponent;
    @ViewChild('contaDebito') contaDebito: ControlesBuscaRapidaComponent;
    @ViewChild('contaCredito') contaCredito: ControlesBuscaRapidaComponent;
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
    itensDataSource: OperacaoBancariaModel[];

    //Flag que indica se os itens estão sendo carregados
    exibeItensCarregando = false;
    temItens = false;

    //Definição do formulário de busca
    buscaFormGroup = this._formBuilder.group(
        {
            periodo: [],
            id: [],
            tipoLancto: [],
        }
    );

    //Colunas do grid
    colunasItens = ['lojaid', 'id', 'dc', 'conta', 'numconta', 'contatransf', 'data', 'valor', 'historico', 'acoes'];

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Ao selecionar uma loja, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.contaCredito.definirParametros(this.comboloja.obterLojasSelecionadas());
        this.contaDebito.definirParametros(this.comboloja.obterLojasSelecionadas());
    }

    formatarContaTransf(item: OperacaoBancariaModel): string {
        if (item.contaTransfId != null)
            return item.contaTransfId + ' - ' + item.descrContaTransf;
        else
            return 'N/D';
    }

    buscarItens(novaBusca: boolean): void {

        if (novaBusca) {
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
            });
        }

        let requisicao: RequisicaoBuscaMovimentacaoBancariaModel = {
            paginacao: {
                paginaAtual: this.paginator.pageIndex,
                itensPorPagina: this.paginator.pageSize,
                colunaOrdenacao: this.sort.active,
                direcaoOrdenacao: this.sort.direction
            },

            lojaIds: this.comboloja.obterLojasSelecionadas(),
            periodo: this.buscaFormGroup.value.periodo.startDate != null ? this.buscaFormGroup.value.periodo : null,
            id: Number(this.buscaFormGroup.value.id),
            contaCreditoId: this.contaCredito.obterCodigoSelecionado(),
            contaDebitoId: this.contaDebito.obterCodigoSelecionado(),
            tipoLancto: Number(this.buscaFormGroup.value.tipoLancto),
        }

        this._financeiroService.buscarOperacoesBancarias(requisicao).subscribe((result) => {

            this.exibeItensCarregando = false;
            this.temItens = result.itens.length > 0;
            this.itensDataSource = result.itens;

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

    imprimirRelatorio() {

        this._matDialog.open(FiltroExtratoBancario_DialogComponent, {
            width: '750px',
            disableClose: true
        });
    }

    definirDadosPadrao() {

        this.buscaFormGroup.reset();
        this.contaCredito.limpar();
        this.contaDebito.limpar();

        this.buscaFormGroup.patchValue({
            periodo: {
                startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
                endDate: new Date()
            },
            id: null,
            tipoLancto: "",
        })

        this.buscarItens(true);
    }

    excluirOperacaoBancaria(item: OperacaoBancariaModel) {

        Swal.fire({
            title: 'Atenção',
            text: "Deseja excluir a operação bancária " + item.id + "?",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Não!',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {

                this._financeiroService.excluirOperacaoBancaria(item.id).subscribe((resultado) => {

                    this.buscarItens(false);
                    Swal.fire('Pronto!', 'A operação bancária ' + item.id + ' foi excluída com sucesso!', 'success');

                }, (err) => {
                    Swal.fire('Ops!', 'Não conseguimos excluir a operação bancária.' + err.error.Message, 'error');
                });
            }
        })
    }

    novaOperacao() {
        const dialog = this._matDialog.open(CadastroOperacaoBancaria_DialogComponent, {
            width: '750px',
            disableClose: true
        });

        dialog.afterClosed().subscribe(result => {
            this.buscarItens(false);
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos do ciclo de vida
    // -----------------------------------------------------------------------------------------------------

    ngAfterViewInit(): void {

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