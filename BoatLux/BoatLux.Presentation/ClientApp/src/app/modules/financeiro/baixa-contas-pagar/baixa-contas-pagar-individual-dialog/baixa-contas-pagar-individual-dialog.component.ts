import { Component, AfterViewInit, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { FormBuilder } from "@angular/forms";
import * as moment from 'moment';
import Swal from "sweetalert2";
// Services
import { FinanceiroService } from "../../../../services/financeiro.service";
import { UtilsService } from "../../../../services/utils.service";
// Components
import { ControlesComboLojaComponent } from "../../../../controls/combo-loja/combo-loja.component";
import { ControlesBuscaRapidaComponent } from "../../../../controls/busca-rapida/busca-rapida.component";
import { ControlesImpressaoComprovanteComponent } from "../../../../controls/impressao-comprovante/impressao-comprovante.component";
import { AnexaComprovantePagar_DialogComponent } from "../anexa-comprovante-pagar-dialog/anexa-comprovante-pagar-dialog.component";
// Interface
import { RequisicaoBaixarPagarIndividualModel, RequisicaoFichaPagamentoModel } from "../../../../interfaces/financeiro.interface";

// Constantes
const MODULO = "pagar";

export interface BaixaContasPagarIndividual_DialogComponent_Data {
    pagarId: number;
    lojaId: number;
}

@Component({
    selector: 'baixa-contas-pagar-individual-dialog',
    templateUrl: './baixa-contas-pagar-individual-dialog.component.html'
})

export class BaixaContasPagarIndividual_DialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    
    constructor(
        public dialogRef: MatDialogRef<BaixaContasPagarIndividual_DialogComponent>,
        private _matDialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _financeiroService: FinanceiroService,
        private _utils: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: BaixaContasPagarIndividual_DialogComponent_Data
    ) {

    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Propriedades injetadas
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('banco') banco: ControlesBuscaRapidaComponent;
    @ViewChild('tipodocumento') tipodocumento: ControlesBuscaRapidaComponent;
    @ViewChild('operacaofinanceira') operacaofinanceira: ControlesBuscaRapidaComponent;
    @ViewChild('centrodecusto') centrodecusto: ControlesBuscaRapidaComponent;
    @ViewChild('conta') conta: ControlesBuscaRapidaComponent;
    @ViewChild('formapg') formapg: ControlesBuscaRapidaComponent;

    // Tratamentos para o campo validade da cotação
    locale: any = {
        format: 'YYYY-DD-MM',
        displayFormat: 'DD/MM/YYYY',
    };

    minDate: moment.Moment = moment();

    tipoJuros;
    tipoMulta;
    tipoDesconto;
    permiteBaixaRetro = false;

    //Definição do formulário de cadastro
    baixaFormGroup = this._formBuilder.group(
        {
            valor: [],
            dtEmissao: [],
            dtVencto: [],
            desconto: [],
            juros: [],
            multa: [],
            numTitulo: [],
            parcela: [],
            dtEntrada: [],
            numCheque: [],
            dtPagto: [],
            valorPago: [],
            nota: [],
            observacao: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Ao selecionar loja, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.conta.definirParametros(this.data.lojaId);
    }

    desabilitaCampo(tipo: number) {
        switch (tipo) {
            case 1: // Desabilitar campo
                return 'none';
            case 2: // alterar opacidade
                return '0.6';
        }
    }

    obterMascara(tipo: number) {
        switch (tipo) {
            case 1:
                return this._utils.maskDesconto(this.tipoDesconto);
            case 2:
                return this._utils.maskDesconto(this.tipoJuros);
            case 3:
                return this._utils.maskDesconto(this.tipoMulta);
        }
    }

    carregarTitulo() {

        this._financeiroService.obterTituloBaixaPagar(this.data.pagarId).subscribe(result => {

            //Carrega os dados do formulário
            this.baixaFormGroup.patchValue({
                dtEmissao: {
                    startDate: result.dtEmissao
                },
                dtVencto: {
                    startDate: result.dtVencto
                },
                dtEntrada: {
                    startDate: result.dtEmissao
                },
                dtPagto: {
                    startDate: moment(new Date())
                },
                valor: result.valor,
                desconto: result.desconto,
                juros: result.juros,
                multa: result.multa,
                numTitulo: result.numTit,
                parcela: result.parcela != null ? result.parcela.trim() : null,
                numCheque: result.numCheque,
                valorPago: result.valorPagar,
                nota: result.nota,
                observacao: result.observacao,
            });

            // Carregar tipo ($ ou %) de Descto, Juros e Multa
            this.tipoDesconto = result.tipoJuros;
            this.tipoMulta = result.tipoMulta;
            this.tipoJuros = result.tipoJuros;

            //Carrega o buscarápida
            this.comboLoja.definirLojaSelecionada(result.codLojaId);
            this.fornecedor.definirCodigoSelecionado(result.codFornecId);
            this.banco.definirCodigoSelecionado(result.codBancoId);
            this.tipodocumento.definirCodigoSelecionado(result.codTipoDocId);
            this.operacaofinanceira.definirCodigoSelecionado(result.codOperacaoFinanceiraId);
            this.centrodecusto.definirCodigoSelecionado(result.codCCustoId);
        });

        // Carrega parâmetros
        this.permiteBaixaRetro = this._utils.lerParam('baixaRetroPagar', this.data.lojaId) == 'S' ? true : false;
    }

    baixarTitulo() {

        if (this.validarDados()) {

            Swal.fire({
                title: 'Tá quase...',
                html: 'Estamos baixando o título, aguarde...',
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }
            });

            let requisicao: RequisicaoBaixarPagarIndividualModel = {
                pagarId: this.data.pagarId,
                valorPago: Number(this.baixaFormGroup.value.valorPago),
                dataPagto: this.baixaFormGroup.value.dtPagto.startDate.format('YYYY-MM-DD'),
                contaId: Number(this.conta.obterCodigoSelecionado()),
                formaPgId: Number(this.formapg.obterCodigoSelecionado()),
                operacaoFinanceiraId: Number(this.operacaofinanceira.obterCodigoSelecionado()),
                nota: this.baixaFormGroup.value.nota,
                observacao: this.baixaFormGroup.value.observacao,
            }

            this._financeiroService.baixarPagarIndividual(requisicao).subscribe(result => {
                Swal.close();

                Swal.fire('Sucesso!', 'Título ' + this.data.pagarId + ' baixado com sucesso!', 'success');

                if (this._utils.lerParam('comprovpagamento', this._utils.lojaLogada) == 'S') {

                    this._matDialog.open(AnexaComprovantePagar_DialogComponent, {
                        width: '750px',
                        disableClose: true,
                        data: {
                            pagarIds: [this.data.pagarId]
                        }
                    });
                }
                else {

                    Swal.fire({
                        title: 'Confirmação!',
                        text: "Deseja imprimir o comprovante?",
                        icon: 'info',
                        input: 'checkbox',
                        inputPlaceholder: 'Imprimir observação',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Sim!',
                        cancelButtonText: 'Não!'
                    }).then((result) => {
                        if (result.isConfirmed) {

                            if (this._utils.lerParam('impressaocomprovantepagara4', this.data.lojaId) == 'S') {

                                let requisicao: RequisicaoFichaPagamentoModel = {
                                    formato: 1,
                                    lojaIds: [this.data.lojaId],
                                    fornecedorId: Number(this.fornecedor.obterCodigoSelecionado()),
                                    pagarIds: [this.data.pagarId],
                                    impObs: Number(result.value)
                                }

                                this._financeiroService.gerarRelatorioFichaPagamento(requisicao, 'Comprovante de Pagto.', true);
                            }
                            else {
                                this._matDialog.open(ControlesImpressaoComprovanteComponent, {
                                    width: '339px',
                                    height: '100vh',
                                    data: {
                                        tituloIds: [this.data.pagarId],
                                        lojaId: this.data.lojaId,
                                        fornecedorIds: [this.fornecedor.obterCodigoSelecionado()],
                                        impObs: Number(result.value),
                                        tipoComprovante: MODULO,
                                    }
                                });
                            }
                        }
                    });
                }

                this.fecharJanela(true);

            }, (err) => {
                Swal.fire('Ops!', 'Falha ao baixar títulos. Tente novamente.', 'error');
            });
        }

    }

    fecharJanela(reload: boolean): void {
        this.dialogRef.close(reload);
    }

    private validarDados(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.conta.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Conta";
            validado = false;
        }

        if (this.formapg.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Forma de Pagamento";
            validado = false;
        }

        if (this.operacaofinanceira.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Operação Financeira";
            validado = false;
        }

        if ((this.baixaFormGroup.value.valorPago) == 0.00) {
            mensagemRetorno += "<br/>- Valor a pagar deve ser maior que R$0,00";
            validado = false;
        }

        if (!this.permiteBaixaRetro) {
            if (moment(new Date().getDate(), "DD/MM/YYYY") > moment(this.baixaFormGroup.value.dtPagto.startDate, "DD/MM/YYYY")) {
                mensagemRetorno += "<br/>- Data deve ser maior ou igual a data atual";
                validado = false;
            }
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigatórios para baixar o título: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    
    ngAfterViewInit(): void {

        this.carregarTitulo();

    }
}