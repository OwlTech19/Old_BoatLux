import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
// Components
import { CadastroContasReceber_DialogComponent } from './cadastro-contas-receber-dialog/cadastro-contas-receber-dialog.component';
import { ControlesLegendaComponent } from '../../../controls/legenda/legenda.component';
import { FiltroRelContasReceber_DialogComponent } from './filtro-rel-contas-receber-dialog/filtro-rel-contas-receber-dialog.component';
// Services
import { UtilsService } from '../../../services/utils.service';
import { UsuarioService } from '../../../services/usuario-service.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FinanceiroService } from '../../../services/financeiro.service';
import { DialogService } from '../../../services/dialog.service';
// Components
import { AtribuirInformacoesTitulos_DialogComponent, AtribuirInformacoesTitulos_DialogComponent_Data } from '../atribuir-informacoes-titulos-dialog/atribuir-informacoes-titulos-dialog.component';
import { EmissaoBoletos_DialogComponent } from '../contas-receber/emissao-boletos-dialog/emissao-boletos-dialog.component';
import { ControlesComboLojaComponent } from '../../../controls/combo-loja/combo-loja.component';
import { ControlesBuscaRapidaComponent } from '../../../controls/busca-rapida/busca-rapida.component';
import { ControlesConsultaCupomNfComponent } from '../../../controls/consulta-cupom-nf/consulta-cupom-nf.component';
import { ControlesImpressaoComprovanteComponent } from '../../../controls/impressao-comprovante/impressao-comprovante.component';
// Interfaces
import { RequisicaoBuscaTitulosReceberModel, ContasReceberModel, RequisicaoCancelaTitulosReceberModel, TituloBuscaContasReceberModel, RequisicaoCancelaTituloReceberModel, RequisicaoRelatorioNotasPromissoriasModel, RequisicaoRelatorioCarnesModel, RequisicaoEstornoReceberModel } from '../../../interfaces/financeiro.interface';

// Constantes
const MODULO = "receber";

const unique = (value, index, self) => {
    return self.indexOf(value) === index
}

@Component({
    selector: 'financeiro-contas-receber',
    templateUrl: './contas-receber.component.html',
    encapsulation: ViewEncapsulation.None
})

export class FinanceiroContasReceberComponent implements OnInit, OnDestroy, AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _financeiroService: FinanceiroService,
        private _dialogService: DialogService,
        private _router: Router,
        public _utils: UtilsService,
        public _usuario: UsuarioService
    ) {
        // Define o menu de navegação
        this._fuseNavigationService.setCurrentNavigation('financeiro_navigation');

        // check user permission
        if (!_usuario.checkPermissionControl('267', 'acessar'))
            this._router.navigate(['access-denied']);
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em memória
    itensDataSource: ContasReceberModel[];
    selection = new SelectionModel<number>(true, []);
    selectionModel: ContasReceberModel[] = [];

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('comboLoja') comboloja: ControlesComboLojaComponent;
    @ViewChild('cliente') cliente: ControlesBuscaRapidaComponent;
    @ViewChild('tipocliente') tipocliente: ControlesBuscaRapidaComponent;
    @ViewChild('tipodocumento') tipodocumento: ControlesBuscaRapidaComponent;
    @ViewChild('vendedor') vendedor: ControlesBuscaRapidaComponent;
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

    //Configuração da tela de novo item / edição de item        
    idCadastro = 0;
    processandoCadastro = false;
    novoCadastro = true;

    //Flag que indica se os itens estão sendo carregados
    exibeItensCarregando = false;
    temItens = false;

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
            situacao: [''],
            situacaoPromissoria: [],
            situacaoCarnes: [],
            situacaoBoletos: [],
        }
    );

    //Colunas do grid
    colunasItens = ['select', 'codlojaid', 'receberid', 'numtit', 'parcela', 'notaecf', 'razao', 'dtemissao', 'dtvencto', 'dtpagto', 'valor', 'valorpago', 'valorjuros', 'situacao', 'acoes'];

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
                }
            });

            //Apaga tudo
            //this.itensSelecionados.clear();
        }
        else {
            this.itensDataSource.forEach(row => {
                this.selection.select(row.receberId);
                this.addSelectionModel(row, true);
            });
        }
    }

    addSelectionModel(item: ContasReceberModel, checked: boolean): void {
        if (checked)
            this.selectionModel.push(item);
        else
            this.selectionModel.splice(this.selectionModel.indexOf(item), 1);

    }

    //Ao selecionar lojas, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.vendedor.definirParametros(this.comboloja.obterLojasSelecionadas());
    }

    //Limpa os filtros e busca novamente
    definirDadosPadrao(): void {
        this.buscaFormGroup.reset();
        this.cliente.limpar();
        this.tipocliente.limpar();
        this.tipodocumento.limpar();
        this.vendedor.limpar();

        this.buscaFormGroup.patchValue({
            periodo: {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30))
            },
            situacao: "",
            opcaoTipoData: "1",
            situacaoPromissoria: "",
            situacaoCarnes: "",
            situacaoBoletos: "",
        })

        this.buscarItens(true);
    }

    //Busca os itens no serviço
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
            notaEcf: this.buscaFormGroup.value.notaEcf,
            opcaoTipoData: Number(this.buscaFormGroup.value.opcaoTipoData),
            periodo: this.buscaFormGroup.value.periodo.startDate != null ? this.buscaFormGroup.value.periodo : null,
            valor: Number(this.buscaFormGroup.value.valor),
            cheque: this.buscaFormGroup.value.cheque,
            codClieId: this.cliente.obterCodigoSelecionado(),
            tipoDocumentoId: Number(this.tipodocumento.obterCodigoSelecionado()),
            tipoClienteId: Number(this.tipocliente.obterCodigoSelecionado()),
            situacao: this.buscaFormGroup.value.situacao,
            situacaoPromissoria: Number(this.buscaFormGroup.value.situacaoPromissoria),
            situacaoCarnes: Number(this.buscaFormGroup.value.situacaoCarnes),
            situacaoBoletos: Number(this.buscaFormGroup.value.situacaoBoletos),
            vendedorId: Number(this.vendedor.obterCodigoSelecionado()),
        };

        this._financeiroService.buscarContasReceber(requisicao).subscribe((resultado) => {

            this.exibeItensCarregando = false;
            this.temItens = resultado.itens.length > 0;
            this.itensDataSource = resultado.itens;

            this.legenda.quantidadeResultados = resultado.paginacao.totalItens;
            this.paginator.length = resultado.paginacao.totalItens;
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

    // Cancelar múltiplos títulos
    cancelarTitulos(): void {
        if (this.selection.selected.length > 0) {

            var selecionadosEmAberto = this.itensDataSource.filter(i => {
                if (this.selection.isSelected(i.receberId)) {
                    return i.situacao == 'Aberto';
                }
            });

            if (selecionadosEmAberto.length > 0) {
                Swal.fire({
                    title: 'Confirmação!',
                    text: "Confirma o cancelamento dos títulos selecionados?? Serão cancelados apenas os títulos com situação em aberto.",
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sim, cancelar!',
                    cancelButtonText: 'Não!',
                    reverseButtons: true
                }).then((result) => {
                    if (result.value) {
                        let requisicao: RequisicaoCancelaTitulosReceberModel =
                        {
                            receberId: selecionadosEmAberto.map(i => i.receberId)
                        };

                        this._financeiroService.cancelarContasReceber(requisicao).subscribe((resultado) => {
                            if (resultado.sucesso) {

                                this.buscarItens(true);
                                Swal.fire('Pronto!', 'Títulos cancelados com sucesso!', 'success');
                            }
                            else {
                                Swal.fire('Ops!', 'Os títulos não podem ser cancelados. Detalhes: ' + resultado.erro, 'error');
                            }
                        }, (err) => {

                            Swal.fire('Ops!', 'Não foi possível cancelar os títulos selecionados.', 'error');
                        });
                    }
                })
            }
            else {
                Swal.fire('Ops!', 'Selecione títulos em aberto para cancelar!', 'warning');
            }
        }
        else {
            Swal.fire('Ops!', 'Selecione títulos para cancelar!', 'warning');
        }
    }

    // Cancelar um título
    cancelarTitulo(item: RequisicaoCancelaTituloReceberModel) {
        if (item.situacao == 'Aberto') {
            Swal.fire({
                title: 'Atenção',
                text: "Deseja cancelar o título " + item.receberId + "?",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sim, cancelar!',
                cancelButtonText: 'Não!',
                reverseButtons: true
            }).then((result) => {
                if (result.value) {
                    let requisicao: RequisicaoCancelaTituloReceberModel =
                    {
                        receberId: item.receberId
                    };
                    this._financeiroService.cancelarContaReceber(requisicao).subscribe((resultado) => {

                        this.buscarItens(false);
                        Swal.fire('Pronto!', 'O título foi cancelado com sucesso!', 'success');

                    }, (err) => {
                        Swal.fire('Ops!', err.error.Message, 'error');
                    });
                }
            })
        }
        else {
            Swal.fire('Ops!', 'Título com situação diferente de aberto. Não é permitido cancelar!', 'warning');
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

    //Abre janela de cadastro de um novo item
    novoTitulo() {

        const dialog = this._matDialog.open(CadastroContasReceber_DialogComponent, {
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

    //Carrega o item para edição
    editarTitulo(item: TituloBuscaContasReceberModel) {

        var apenasConsulta = false;
        if (!this._usuario.checkPermissionControl('267', 'editar') && this._usuario.checkPermissionControl('267', 'consultar'))
            apenasConsulta = true;


        const dialog = this._matDialog.open(CadastroContasReceber_DialogComponent, {
            width: '750px',
            data: {
                idTitulo: item.receberId,
                situacao: item.situacao,
                apenasConsulta: apenasConsulta
            },
            disableClose: true
        });

        dialog.afterClosed().subscribe(result => {

            if (result)
                this.buscarItens(false);
        });
    }

    //Abre filtros para impressão de relatório
    imprimirRelatorio() {

        const dialog = this._matDialog.open(FiltroRelContasReceber_DialogComponent, {
            width: '750px',
            disableClose: true
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

    imprimirComprovante(item: ContasReceberModel) {

        Swal.fire({
            title: 'Confirmação!',
            text: "Deseja imprimir o comprovante?",
            icon: 'info',
            input: 'checkbox',
            inputPlaceholder: 'Imprimir observação',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Imprimir!',
            reverseButtons: true
        }).then((result) => {

            this._matDialog.open(ControlesImpressaoComprovanteComponent, {
                width: '339px',
                height: '100vh',
                data: {
                    tituloIds: [item.receberId],
                    lojaId: item.codLojaId,
                    clienteIds: [item.codClieId],
                    impObs: result.value,
                    tipoComprovante: MODULO,
                }
            });
        })
    }

    imprimirNotasPromissorias() {

        var lojasSelecionadas = this.selectionModel.map(i => Number(i.codLojaId)).filter(unique);

        if (lojasSelecionadas.length == 1) {

            let requisicao: RequisicaoRelatorioNotasPromissoriasModel = {
                formato: 1,
                lojaId: Number(this.selectionModel[0].codLojaId), //Só permite selecionar uma loja, então pega a loja do primeiro item do grid
                receberIds: this.selection.selected,
            }

            /* Este relatório imprime sem permitir ao usuário selecionar opções
             * Formato 1 - PDF
             * Visualizar na tela - true
             */
            this._financeiroService.gerarRelatorioNotasPromissorias(requisicao, 'Notas Promissórias', true)

            setTimeout(() => {
                this.buscarItens(true);
            }, 1000);
        }
        else {
            Swal.fire('Atenção', 'Selecione títulos de apenas uma loja para imprimir notas promissórias', 'warning');
        }
    }

    imprimirCarnesSelecionados() {

        if (this.validarDadosCarne()) {

            var itensVencidos = this.selectionModel.filter(i => {
                return moment(new Date().getDate(), "DD/MM/YYYY") > moment(i.dtVencto, "DD/MM/YYYY");
            });

            if (itensVencidos.length > 0) {
                Swal.fire({
                    title: 'Atenção',
                    text: "Há título(s) vencido(s) na seleção. Confirma a impressão dos carnês?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sim!',
                    cancelButtonText: 'Não, quero revisar!'
                }).then((result) => {
                    if (result.value) {
                        this.imprimirCarnes();
                    }
                })
            }
            else {
                this.imprimirCarnes();
            }
        }
    }

    imprimirCarnes() {

        let requisicao: RequisicaoRelatorioCarnesModel = {
            formato: 1,
            lojaId: Number(this.selectionModel[0].codLojaId), //Só permite selecionar uma loja, pega a loja do primeiro item
            receberIds: this.selection.selected,
        }

        /* Este relatório imprime sem permitir ao usuário selecionar opções
         * Formato 1 - PDF
         * Visualizar na tela - true
         */
        this._financeiroService.gerarRelatorioCarnes(requisicao, 'Carnês', true);

        setTimeout(() => {
            this.buscarItens(true);
        }, 1000);
    }

    validarDadosCarne() {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        var lojasSelecionadas = this.selectionModel.map(i => Number(i.codLojaId)).filter(unique);

        var itensDifAberto = this.selectionModel.filter(i => {
            return i.situacao != 'Aberto';
        });

        if (lojasSelecionadas.length > 1) {
            mensagemRetorno += "<br/>- Selecione títulos de apenas uma loja.";
            validado = false;
        }

        if (itensDifAberto.length > 0) {
            mensagemRetorno += "<br/>- Selecione apenas títulos com a situação Aberto.";
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, revise os itens selecionados para imprimir carnês: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    // Estorno de Contas a Receber
    estornarTitulos(): void {

        var selecionadosBaixados = this.selectionModel.filter(i => {
            return i.situacao == 'Baixa Total' || i.situacao == 'Baixa Parcial';
        });

        if (selecionadosBaixados.length > 0) {

            Swal.fire({
                title: 'Confirmação!',
                html: '<p>Confirma o estorno dos títulos selecionados?? Serão estornados apenas os títulos baixados.</p>' +
                    '<br/><p>Selecione a data de movimentação da conta:<p>',
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
                cancelButtonText: 'Não!',
                reverseButtons: true
            }).then((result) => {

                if (result.isConfirmed) {

                    Swal.fire({
                        title: 'Tá quase...',
                        html: 'Estamos estornando os títulos selecionados, aguarde...',
                        allowOutsideClick: false,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                        }
                    });

                    let requisicao: RequisicaoEstornoReceberModel = {
                        receberIds: selecionadosBaixados.map(i => i.receberId),
                        dataMovConta: Number(result.value)
                    }

                    this._financeiroService.estornarContasReceber(requisicao).subscribe(result => {

                        Swal.close();

                        Swal.fire('Pronto!', 'Estorno de títulos a receber realizado com sucesso!', 'success');
                        this.buscarItens(true);
                    }, (err) => {

                        Swal.fire('Ops!', 'Não foi possível estornar os títulos selecionados.', 'error');
                        console.log('error:', err.error);
                    });
                }
            })
        }
        else {

            Swal.fire('Ops!', 'Selecione títulos baixados para estornar!', 'warning');
        }
    }

    abrirEmissaoBoletos() {

        var titulosValidos: ContasReceberModel[] = [];
        var titulosInvalidos: boolean = false;

        this.selectionModel.forEach(titulo => {

            if (titulo.situacao == "Aberto" && this._utils.strToNumber(titulo.valor.toString()) > 0)
                titulosValidos.push(titulo)
            else
                titulosInvalidos = true;
        });

        if (titulosInvalidos)
            Swal.fire("Atenção!", "Foram selecionados títulos inválidos. Somente títulos em aberto e com valor maior que R$0,00 podem gerar boletos!", "warning");

        this._dialogService.abrirDialogGrande(EmissaoBoletos_DialogComponent, {

            //parâmetros do componente
            titulosSelecionados: titulosValidos,
        }).subscribe(result => {

            if (result)
                this.buscarItens(true);
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    /**
        * On init
        */
    ngOnInit(): void {
    }

    /**<
     * On destroy
     */
    ngOnDestroy(): void {
    }

    /**<
     * After View Init
     */
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