import { Component, AfterViewInit, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { FormBuilder } from "@angular/forms";
import * as moment from 'moment';
import Swal from "sweetalert2";
// Services
import { FinanceiroService } from "../../../../services/financeiro.service";
import { LocalStorageService } from "../../../../services/local-storage.service";
import { UtilsService } from "../../../../services/utils.service";
// Components
import { ControlesComboLojaComponent } from "../../../../controls/combo-loja/combo-loja.component";
import { ControlesBuscaRapidaComponent } from "../../../../controls/busca-rapida/busca-rapida.component";
import { ControlesImpressaoComprovanteComponent } from "../../../../controls/impressao-comprovante/impressao-comprovante.component";
// Interfaces
import { Parametros } from "../../../../interfaces/uteis.interface";
import { RequisicaoBaixarReceberIndividualModel } from "../../../../interfaces/financeiro.interface"

// Constantes
const MODULO = "receber";

export interface BaixaContasReceberIndividual_DialogComponent_Data {
    receberId: number;
    lojaId: number;
}

@Component({
    selector: 'baixa-contas-receber-individual-dialog',
    templateUrl: './baixa-contas-receber-individual-dialog.component.html'
})

export class BaixaContasReceberIndividual_DialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    
    constructor(
        public dialogRef: MatDialogRef<BaixaContasReceberIndividual_DialogComponent>,
        private _matDialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _financeiroService: FinanceiroService,
        private _localStorageService: LocalStorageService,
        private _utils: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: BaixaContasReceberIndividual_DialogComponent_Data
    ) {

    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Propriedades injetadas
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;
    @ViewChild('cliente') cliente: ControlesBuscaRapidaComponent;
    @ViewChild('tipodocumento') tipodocumento: ControlesBuscaRapidaComponent;
    @ViewChild('operacaofinanceira') operacaofinanceira: ControlesBuscaRapidaComponent;
    @ViewChild('operacaofinanceirabaixa') operacaofinanceirabaixa: ControlesBuscaRapidaComponent;
    @ViewChild('centrodecusto') centrodecusto: ControlesBuscaRapidaComponent;
    @ViewChild('banco') banco: ControlesBuscaRapidaComponent;
    @ViewChild('vendedor') vendedor: ControlesBuscaRapidaComponent;
    @ViewChild('conta') conta: ControlesBuscaRapidaComponent;
    @ViewChild('formapg') formapg: ControlesBuscaRapidaComponent;

    // Tratamentos para o campo data
    locale: any = {
        format: 'YYYY-DD-MM',
        displayFormat: 'DD/MM/YYYY',
    };

    // Data mínima e máxima para Pagto
    minDate;
    maxDate;

    // Chave do cache de parâmetros
    private _keyParams = 'parametros';

    // Parâmetros - Melhoriar isso aqui, usar a interface de Parâmetros
    parametros: Parametros[] = [];

    valorInicial = 0;
    tipoJuros;
    tipoMulta;
    tipoDesconto;

    //Definição do formulário de cadastro
    baixaFormGroup = this._formBuilder.group(
        {
            numTitulo: [],
            parcela: [],
            valor: [],
            dtEmissao: [],
            dtVencto: [],
            valorJuros: [],
            valorMulta: [],
            valorDesconto: [],
            carenciaJuros: [],
            carenciaMulta: [],
            observacao: [],
            dtPagto: [],
            valorPago: [],
            numDocto: [],
            despCartorio: [],
            outrasDesp: [],
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

    carregarTitulo() {

        this._financeiroService.obterTituloBaixaReceber(this.data.receberId).subscribe(result => {

            //Carrega os dados do formulário
            this.baixaFormGroup.patchValue({
                dtEmissao: {
                    startDate: result.dtEmissao
                },
                dtVencto: {
                    startDate: result.dtVencto
                },
                dtPagto: {
                    startDate: moment(new Date())
                },
                numTitulo: result.numTit,
                parcela: result.parcela,
                valor: result.valor,
                valorJuros: result.juros,
                valorMulta: result.multa,
                valorDesconto: result.desconto,
                carenciaJuros: result.carenciaJuros,
                carenciaMulta: result.carencia,
                valorPago: result.valorReceber,
                observacao: result.observacao,
                numDocto: result.notaEcf,
            });

            // Valor base a receber
            this.valorInicial = result.valorReceber;

            // Carregar tipo ($ ou %) de Descto, Juros e Multa
            this.tipoDesconto = result.tipoDesconto;
            this.tipoMulta = result.tipoMulta;
            this.tipoJuros = result.tipoJuros;

            //Carrega o buscarápida
            this.comboLoja.definirLojaSelecionada(result.codLojaId);
            this.cliente.definirCodigoSelecionado(result.codClieId);
            this.banco.definirCodigoSelecionado(result.codBancoId);
            this.tipodocumento.definirCodigoSelecionado(result.codTipoDocumentoId);
            this.operacaofinanceira.definirCodigoSelecionado(result.codOperacaoFinanceiraId);
            this.centrodecusto.definirCodigoSelecionado(result.codCentroCustoId);
            this.vendedor.definirCodigoSelecionado(result.codVendedorId);
        });

        // Define Min e Max Date
        this.minDate = this._utils.obterMinDatePagto(this.data.lojaId);
        this.maxDate = this._utils.obterMaxDatePagto(this.data.lojaId);
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

            let requisicao: RequisicaoBaixarReceberIndividualModel = {
                receberId: this.data.receberId,
                valorPago: Number(this.baixaFormGroup.value.valorPago),
                dataPagto: this.baixaFormGroup.value.dtPagto.startDate.format('YYYY-MM-DD'),
                contaId: Number(this.conta.obterCodigoSelecionado()),
                formaPgId: Number(this.formapg.obterCodigoSelecionado()),
                operacaoFinanceiraId: Number(this.operacaofinanceirabaixa.obterCodigoSelecionado()),
                numDocto: this.baixaFormGroup.value.numDocto,
                observacao: this.baixaFormGroup.value.observacao,
                despCartorio: Number(this.baixaFormGroup.value.despCartorio),
                outrasDesp: Number(this.baixaFormGroup.value.outrasDesp),
            }

            this._financeiroService.baixarReceberIndividual(requisicao).subscribe(result => {
                Swal.close();

                if (result.emDebito) {

                    var clienteId = result.clienteId;

                    Swal.fire({
                        title: 'Atenção',
                        text: "O cliente " + result.clienteId + " está na lista de Clientes em Débito. Deseja retirá-lo?",
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Sim, retirar!',
                        cancelButtonText: 'Não!',
                        reverseButtons: true
                    }).then((result) => {
                        if (result.value) {

                            this._financeiroService.retirarClienteEmDebito(clienteId).subscribe((result) => {

                                Swal.fire('Sucesso!', 'Título ' + this.data.receberId + ' baixado e cliente retirado da lista de débitos com sucesso!', 'success');

                            }, (err) => {
                                Swal.fire('Ops!', 'Não foi possível remover o cliente da lista de Clientes em Débito. ' + err.error.Message, 'error');
                            });
                        }
                        else {
                            Swal.fire('Sucesso!', 'Título ' + this.data.receberId + ' baixado com sucesso!', 'success');
                        }
                    })
                }
                else {
                    Swal.fire('Sucesso!', 'Título ' + this.data.receberId + ' baixado com sucesso!', 'success');
                }

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

                        this._matDialog.open(ControlesImpressaoComprovanteComponent, {
                            width: '339px',
                            height: '100vh',
                            data: {
                                tituloIds: [this.data.receberId],
                                lojaId: this.data.lojaId,
                                clienteIds: [this.cliente.obterCodigoSelecionado()],
                                impObs: result.value,
                                tipoComprovante: MODULO,
                            }
                        });
                    }
                });

                this.fecharJanela(true);

            }, (err) => {
                Swal.fire('Ops!', 'Falha ao baixar títulos. Tente novamente.', 'error');
            });
        }
    }

    fecharJanela(reload: boolean): void {
        this.dialogRef.close(reload);
    }

    obterMaskDesconto() {
        if (this.tipoDesconto == 1)
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    obterMaskJuros() {
        if (this.tipoJuros == 1)
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    obterMaskMulta() {
        if (this.tipoDesconto == 1)
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    calcularValorReceber() {

        var valorAtualizado = Number(this.valorInicial) + Number(this.baixaFormGroup.value.outrasDesp) + Number(this.baixaFormGroup.value.despCartorio);
        console.log(valorAtualizado);
        this.baixaFormGroup.patchValue({
            valorPago: valorAtualizado
        })
    }

    private carregarParametros() {
        let _parametros = this._localStorageService.get(this._keyParams);

        _parametros.forEach(i => {
            // Adiciona os parâmetros da Baixa de Contas a Receber
            this.parametros.push({
                lojaId: i.id,
                baixaRetroReceber: i.baixaRetroReceber,
                operacaoReceber: i.operacaoReceber,
                codContaReceber: i.codContaReceber,
            })
        });

        // Parâmetros do formulário
        let parametrosLoja = this.parametros.filter(i => i.lojaId = this.data.lojaId);

        if (parametrosLoja[0].codContaReceber != null)
            this.conta.definirCodigoSelecionado(parametrosLoja[0].codContaReceber);
        if (parametrosLoja[0].operacaoReceber != null)
            this.operacaofinanceirabaixa.definirCodigoSelecionado(parametrosLoja[0].operacaoReceber);

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

        if (this.operacaofinanceirabaixa.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Operação Financeira";
            validado = false;
        }

        if (Number(this.baixaFormGroup.value.valorPago) == 0.00) {
            mensagemRetorno += "<br/>- Valor a Receber deve ser maior que R$0,00";
            validado = false;
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

        this.carregarParametros();
        this.carregarTitulo();
    }
}