import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2'
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import * as moment from 'moment';
import { Router } from "@angular/router";
// Services
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FinanceiroService } from '../../../services/financeiro.service';
import { UtilsService } from '../../../services/utils.service';
import { UsuarioService } from '../../../services/usuario-service.service';
// Componentes
import { ControlesComboLojaComponent } from '../../../controls/combo-loja/combo-loja.component';
import { ControlesLegendaComponent } from '../../../controls/legenda/legenda.component';
import { ControlesBuscaRapidaComponent } from '../../../controls/busca-rapida/busca-rapida.component';
import { CadastroContasPagar_DialogComponent } from '../contas-pagar/cadastro-contas-pagar-dialog/cadastro-contas-pagar-dialog.component';
import { AtribuirInformacoesTitulos_DialogComponent } from '../atribuir-informacoes-titulos-dialog/atribuir-informacoes-titulos-dialog.component';
import { FiltroRelContasPagar_DialogComponent } from '../contas-pagar/filtro-rel-contas-pagar-dialog/filtro-rel-contas-pagar-dialog.component';
// Interfaces
import { ContasPagarModel, RequisicaoBuscaTitulosPagarModel, RequisicaoCancelaContasPagarModel, RequisicaoLiberaBloqueiaPagarModel, RequisicaoEstornoPagarModel } from '../../../interfaces/financeiro.interface';

// Constantes
const MODULO = "pagar";

@Component({
    selector: 'financeiro-contas-pagar',
    templateUrl: './contas-pagar.component.html',
    encapsulation: ViewEncapsulation.None
})

export class FinanceiroContasPagarComponent implements OnInit, OnDestroy, AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _financeiroService: FinanceiroService,
        private _router: Router,
        public _utils: UtilsService,
        public _usuario: UsuarioService,

    ) {
        // Define o menu de navega????o
        this._fuseNavigationService.setCurrentNavigation('financeiro_navigation');

        // check user permission
        if (!_usuario.checkPermissionControl('243', 'acessar'))
            this._router.navigate(['access-denied']);

        this.exibeComprovantePagto = this._utils.lerParam('comprovpagamento', this._utils.lojaLogada) == 'S';
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em mem??ria
    itensDataSource: ContasPagarModel[];
    selection = new SelectionModel<number>(true, []);
    selectionModel: ContasPagarModel[] = [];

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('comboloja') comboloja: ControlesComboLojaComponent;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('tipodocumento') tipodocumento: ControlesBuscaRapidaComponent;

    // Per??odos pr?? definidos do componente 
    ranges: any = {
        'Hoje': [moment(), moment()],
        'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        '??ltimos 7 dias': [moment().subtract(6, 'days'), moment()],
        '??ltimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'M??s atual': [moment().startOf('month'), moment().endOf('month')],
        'M??s passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    };

    //Configura????o da tela de novo item / edi????o de item        
    idCadastro = 0;
    processandoCadastro = false;
    novoCadastro = true;
    exibeComprovantePagto: boolean = true;

    //Flag que indica se os itens est??o sendo carregados
    exibeItensCarregando = false;
    temItens = false;

    //Defini????o do formul??rio de busca
    buscaFormGroup = this._formBuilder.group(
        {
            nota: [],
            situacao: [],
            opcaoTipoData: [],
            periodo: [],
            codPagarId: [],
            numTit: [],
            parcela: [],
            valor: [],
            numCheque: [],
        }
    );

    //Colunas do grid
    colunasItens = ['select', 'codLojaId', 'codPagarId', 'tipoDocto', 'numTit', 'parcela', 'nota', 'fornecedor', 'dtEntrada', 'dtEmissao', 'dtVencto', 'dtPagto', 'valor', 'valorPago', 'situacao', 'acoes'];

    // -----------------------------------------------------------------------------------------------------
    // M??todos
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
                }
            });

            //Apaga tudo
            //this.itensSelecionados.clear();
        }
        else {
            this.itensDataSource.forEach(row => {
                this.selection.select(row.codPagarId);
                this.addSelectionModel(row, true);
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

    //Limpa os filtros e busca novamente
    definirDadosPadrao(): void {
        this.buscaFormGroup.reset();
        this.fornecedor.limpar();
        this.tipodocumento.limpar();

        this.buscaFormGroup.patchValue({
            periodo: {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30))
            },
            situacao: "",
            nota: null,
            opcaoTipoData: "1",
            codPagarId: null,
            numTit: null,
            parcela: null,
            valor: null,
            numCheque: null,
        })

        this.buscarItens(true);
    }

    //Busca os itens no servi??o
    buscarItens(novaBusca: boolean): void {

        if (novaBusca) {
            this.selection.clear();
            this.selectionModel = [];
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
            codTipoDocId: this.tipodocumento.obterCodigoSelecionado(),
            nota: this.buscaFormGroup.value.nota,
            situacao: this.buscaFormGroup.value.situacao,
            opcaoTipoData: Number(this.buscaFormGroup.value.opcaoTipoData),
            periodo: this.buscaFormGroup.value.periodo.startDate != null ? this.buscaFormGroup.value.periodo : null,
            codPagarId: Number(this.buscaFormGroup.value.codPagarId),
            numTit: this.buscaFormGroup.value.numTit,
            parcela: this.buscaFormGroup.value.parcela,
            valor: Number(this.buscaFormGroup.value.valor),
            numCheque: this.buscaFormGroup.value.numCheque,
        };

        //this._financeiroService.buscarContasPagar(requisicao).subscribe((resultado) => {


        //    this.exibeItensCarregando = false;
        //    this.temItens = resultado.itens.length > 0;
        //    this.itensDataSource = resultado.itens;

        //    this.legenda.quantidadeResultados = resultado.paginacao.totalItens;
        //    this.paginator.length = resultado.paginacao.totalItens;
        //    this.paginator.page.subscribe(() => {

        //        //este trecho vai ser executado quando houver uma mudan??a de p??gina ou tamanho da p??gina

        //    });

        //    //this.itensDataSource.sort = this.sort;
        //    //this.itensDataSource.paginator = this.paginator;
        //}, (err) => {

        //    this.exibeItensCarregando = false;

        //    Swal.fire({
        //        title: 'Ops!',
        //        text: "N??o conseguimos concluir a busca, deseja tentar novamente??",
        //        icon: 'error',
        //        showCancelButton: true,
        //        confirmButtonColor: '#3085d6',
        //        cancelButtonColor: '#d33',
        //        confirmButtonText: 'Sim!',
        //        cancelButtonText: 'N??o!'
        //    }).then((result) => {
        //        if (result.value) {
        //            this.buscarItens(true);
        //        }
        //    })
        //});
    }


    //Abre janela de cadastro de um novo item
    novoTitulo() {

        const dialog = this._matDialog.open(CadastroContasPagar_DialogComponent, {
            width: '750px',
            data: {
                situacao: 'Aberto'
            },
            disableClose: true
        });

        dialog.afterClosed().subscribe(result => {

            if (result)
                this.buscarItens(false);
        });
    }

    //Carrega o item para edi????o
    editarTitulo(codPagarId: number, situacao: string) {

        var apenasConsulta = false;
        if (!this._usuario.checkPermissionControl('243', 'editar') && this._usuario.checkPermissionControl('243', 'consultar'))
            apenasConsulta = true;

        const dialog = this._matDialog.open(CadastroContasPagar_DialogComponent, {
            width: '750px',
            data: {
                idTitulo: codPagarId,
                situacao: situacao,
                apenasConsulta: apenasConsulta
            },
            disableClose: true
        });

        dialog.afterClosed().subscribe(result => {

            if (result)
                this.buscarItens(false);
        });

    }

    // Cancelar um t??tulo
    cancelarTitulo(codPagarId: number) {

        Swal.fire({
            title: 'Aten????o',
            text: "Deseja cancelar o t??tulo " + codPagarId + "?",
            icon: 'info',
            input: "text",
            inputPlaceholder: "Motivo do cancelamento",
            inputAttributes: {
                maxlength: '100'
            },
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, cancelar!',
            cancelButtonText: 'N??o!',
            reverseButtons: true
        }).then((result) => {

            if (result.isConfirmed) {

                let requisicao: RequisicaoCancelaContasPagarModel = {
                    pagarIds: [codPagarId],
                    motivoCancelamento: String(result.value),
                }

                this._financeiroService.cancelarContasPagar(requisicao).subscribe((result) => {

                    Swal.fire('Pronto!', 'O t??tulo ' + codPagarId + ' foi cancelado com sucesso!', 'success');
                    this.buscarItens(false);

                }, (err) => {
                    Swal.fire('Ops!', err.error.Message, 'error');
                });
            }
        });
    }

    // Cancelar m??ltiplos t??tulos
    cancelarTitulos(): void {
        if (this.selection.selected.length > 0) {

            var selecionadosEmAberto = this.itensDataSource.filter(i => {
                if (this.selection.isSelected(i.codPagarId)) {
                    return i.situacao == 'Aberto';
                }
            });

            if (selecionadosEmAberto.length > 0) {
                Swal.fire({
                    title: 'Confirma????o!',
                    text: "Confirma o cancelamento dos t??tulos selecionados?? Ser??o cancelados apenas os t??tulos com situa????o em aberto.",
                    icon: 'info',
                    input: "text",
                    inputPlaceholder: "Motivo do cancelamento",
                    inputAttributes: {
                        maxlength: '100'
                    },
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sim, cancelar!',
                    cancelButtonText: 'N??o!',
                    reverseButtons: true
                }).then((result) => {

                    if (result.isConfirmed) {

                        let requisicao: RequisicaoCancelaContasPagarModel = {
                            pagarIds: selecionadosEmAberto.map(i => i.codPagarId),
                            motivoCancelamento: String(result.value),
                        }

                        this._financeiroService.cancelarContasPagar(requisicao).subscribe((result) => {

                            Swal.fire('Pronto!', 'T??tulos cancelados com sucesso!', 'success');
                            this.buscarItens(true);

                        }, (err) => {

                            Swal.fire('Ops!', 'N??o foi poss??vel cancelar os t??tulos selecionados.', 'error');
                        });
                    }
                })
            }
            else {
                Swal.fire('Ops!', 'Selecione t??tulos em aberto para cancelar!', 'warning');
            }
        }
        else {
            Swal.fire('Ops!', 'Selecione t??tulos para cancelar!', 'warning');
        }
    }

    // Atribuir informa????es
    atribuirInformacaoTitulos() {

        if (this.selection.selected.length > 0) {

            const dialog = this._matDialog.open(AtribuirInformacoesTitulos_DialogComponent, {
                width: '500px',
                data: {
                    idSelecionados: this.selectionModel.map(i => i.codPagarId),
                    modulo: MODULO,
                    situacao: this.selectionModel.map(i => i.situacao),
                    lojasSelecionadas: this.selectionModel.map(i => i.codLojaId),
                },
                disableClose: true
            });

            dialog.afterClosed().subscribe(result => {
                if (result)
                    this.buscarItens(true);
            });
        }
        else {
            Swal.fire('Ops!', 'Selecione t??tulos para atribuir informa????es!', 'warning');
        }
    }

    //Abre filtros para impress??o de relat??rio
    imprimirRelatorio() {

        this._matDialog.open(FiltroRelContasPagar_DialogComponent, {
            width: '750px',
            disableClose: true
        });
    }

    // Libera????o de Contas a Pagar
    liberarTitulos(): void {

        var selecionadosBloqueados = this.selectionModel.filter(i => {
            return i.situacao == 'Bloqueado';
        });

        if (selecionadosBloqueados.length > 0) {

            Swal.fire({
                title: 'Confirma????o!',
                text: "Confirma o libera????o dos t??tulos selecionados?? Ser??o liberados apenas os t??tulos com situa????o bloqueado.",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, liberar!',
                cancelButtonText: 'N??o!',
                reverseButtons: true
            }).then((result) => {

                if (result.isConfirmed) {

                    let requisicao: RequisicaoLiberaBloqueiaPagarModel = {
                        pagarIds: selecionadosBloqueados.map(i => i.codPagarId),
                        liberaBloqueia: LiberaBloqueia.Libera,
                    }

                    this._financeiroService.liberaBloqueiaPagar(requisicao).subscribe((result) => {

                        Swal.fire('Pronto!', 'T??tulos liberados com sucesso!', 'success');
                        this.buscarItens(true);

                    }, (err) => {

                        Swal.fire('Ops!', 'N??o foi poss??vel liberar os t??tulos selecionados.', 'error');
                    });
                }
            })
        }
        else {

            Swal.fire('Ops!', 'Selecione t??tulos bloqueados para liberar!', 'warning');
        }
    }

    // Bloqueio de Contas a Pagar
    bloquearTitulos(): void {

        var selecionadosEmAberto = this.selectionModel.filter(i => {
            return i.situacao == 'Aberto';
        });

        if (selecionadosEmAberto.length > 0) {

            Swal.fire({
                title: 'Confirma????o!',
                text: "Confirma o bloqueio dos t??tulos selecionados?? Ser??o bloqueados apenas os t??tulos com situa????o em aberto.",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, bloquear!',
                cancelButtonText: 'N??o!',
                reverseButtons: true
            }).then((result) => {

                if (result.isConfirmed) {

                    let requisicao: RequisicaoLiberaBloqueiaPagarModel = {
                        pagarIds: selecionadosEmAberto.map(i => i.codPagarId),
                        liberaBloqueia: LiberaBloqueia.Bloqueia,
                    }

                    this._financeiroService.liberaBloqueiaPagar(requisicao).subscribe((result) => {

                        Swal.fire('Pronto!', 'T??tulos bloqueados com sucesso!', 'success');
                        this.buscarItens(true);

                    }, (err) => {

                        Swal.fire('Ops!', 'N??o foi poss??vel bloquear os t??tulos selecionados.', 'error');
                    });
                }
            })
        }
        else {

            Swal.fire('Ops!', 'Selecione t??tulos em aberto para bloquear!', 'warning');
        }
    }

    // Estorno de Contas a Pagar
    async estornarTitulos(): Promise<void> {

        var selecionadosBaixados = this.selectionModel.filter(i => {
            return i.situacao == 'Baixa Total' || i.situacao == 'Baixa Parcial';
        });

        if (selecionadosBaixados.length > 0) {

            Swal.fire({
                title: 'Confirma????o!',
                html: '<p>Confirma o estorno dos t??tulos selecionados?? Ser??o estornados apenas os t??tulos baixados.</p>' +
                    '<br/><p>Selecione a data de movimenta????o da conta:<p>',
                icon: 'info',
                input: 'select',
                inputOptions: {
                    1: 'Data da baixa',
                    2: 'Data atual'
                },
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, estornar!',
                cancelButtonText: 'N??o!',
                reverseButtons: true
            }).then((result) => {

                if (result.isConfirmed) {

                    Swal.fire({
                        title: 'T?? quase...',
                        html: 'Estamos estornando os t??tulos selecionados, aguarde...',
                        allowOutsideClick: false,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                        }
                    });

                    let requisicao: RequisicaoEstornoPagarModel = {
                        pagarIds: selecionadosBaixados.map(i => i.codPagarId),
                        dataMovConta: Number(result.value)
                    }

                    this._financeiroService.estornarContasPagar(requisicao).subscribe((result) => {

                        Swal.close();

                        Swal.fire('Pronto!', 'Estorno de t??tulos a pagar realizado com sucesso!', 'success');
                        this.buscarItens(true);

                    }, (err) => {

                        Swal.fire('Ops!', 'N??o foi poss??vel estornar os t??tulos selecionados.', 'error');
                        console.log('error:', err.error);
                    });
                }
            })
        }
        else {

            Swal.fire('Ops!', 'Selecione t??tulos baixados para estornar!', 'warning');
        }
    }

    // Download do Comprovante de Contas a Pagar
    downloadComprovante(pagarId: number) {

        this._financeiroService.downloadComprovantePagar(pagarId);
    }

    // -----------------------------------------------------------------------------------------------------
    // M??todos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    /**
        * On init
        */
    ngOnInit(): void {

    }

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

    /**<
     * On destroy
     */
    ngOnDestroy(): void {
    }
}

enum LiberaBloqueia {
    Bloqueia,
    Libera
}