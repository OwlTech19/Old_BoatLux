import { Component, ViewEncapsulation, AfterViewInit, Inject, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material/dialog";
import { FormBuilder } from "@angular/forms";
import Swal from "sweetalert2";
import * as moment from 'moment';
// Services
import { LocalStorageService } from "../../../../services/local-storage.service";
import { FinanceiroService } from "../../../../services/financeiro.service";
import { UtilsService } from "../../../../services/utils.service";
// Componentes
import { ControlesBuscaRapidaComponent } from "../../../../controls/busca-rapida/busca-rapida.component";
import { ControlesImpressaoComprovanteComponent } from "../../../../controls/impressao-comprovante/impressao-comprovante.component";
// Interfaces
import { Parametros } from "../../../../interfaces/uteis.interface";
import { RequisicaoBaixarReceberMultiplosModel } from "../../../../interfaces/financeiro.interface";

// Constantes
const MODULO = "receber";

export interface BaixaContasReceberMultiplos_DialogComponent_Data {
    receberIds: number[];
    lojaIds: number[];
    clienteIds?: number[];
    totalReceber?: number;
}

@Component({
    selector: 'baixa-contas-receber-multiplos-dialog',
    templateUrl: 'baixa-contas-receber-multiplos-dialog.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class BaixaContasReceberMultiplos_DialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    
    constructor(
        public dialogRef: MatDialogRef<BaixaContasReceberMultiplos_DialogComponent>,
        private _matDialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _localStorageService: LocalStorageService,
        private _financeiroService: FinanceiroService,
        private _utils: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: BaixaContasReceberMultiplos_DialogComponent_Data) {

        this.lojasSelecionadas = this.data.lojaIds.filter(_utils.filterUnique());
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Propriedades injetadas
    @ViewChild('conta') conta: ControlesBuscaRapidaComponent;
    @ViewChild('operacaofinanceira') operacaofinanceira: ControlesBuscaRapidaComponent;
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
    lojasSelecionadas: number[] = [];

    //Definição do formulário de baixa
    baixaFormGroup = this._formBuilder.group(
        {
            data: [],
            numDocto: [],
            desconto: [],
            tipoDesconto: [],
            acrescimo: [],
            tipoAcrescimo: [],
            valorRecebido: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    obterMaskDesconto() {
        if (this.baixaFormGroup.value.tipoDesconto == 1)
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', min: 0, max: 100, allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    obterMaskAcrescimo() {
        if (this.baixaFormGroup.value.tipoAcrescimo == 1)
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', min: 0, max: 999, allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    baixarTitulos() {

        if (this.validarDados()) {

            Swal.fire({
                title: 'Tá quase...',
                html: 'Estamos baixando os títulos selecionados, aguarde...',
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }
            });

            let requisicao: RequisicaoBaixarReceberMultiplosModel = {
                receberIds: this.data.receberIds,
                contaId: Number(this.conta.obterCodigoSelecionado()),
                data: this.baixaFormGroup.value.data.startDate.format('YYYY-MM-DD'),
                numDocto: this.baixaFormGroup.value.numDocto,
                operacaoFinanceiraId: Number(this.operacaofinanceira.obterCodigoSelecionado()),
                formaPgId: Number(this.formapg.obterCodigoSelecionado()),
                desconto: Number(this.baixaFormGroup.value.desconto),
                acrescimo: Number(this.baixaFormGroup.value.acrescimo),
                tipoDesconto: Number(this.baixaFormGroup.value.tipoDesconto),
                tipoAcrescimo: Number(this.baixaFormGroup.value.tipoAcrescimo),
            }

            this._financeiroService.baixarReceberMultiplos(requisicao).subscribe(result => {

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

                                Swal.fire('Sucesso!', 'Títulos baixados e cliente retirado da lista de débitos com sucesso!', 'success');
                                

                            }, (err) => {
                                Swal.fire('Ops!', 'Não foi possível remover o cliente da lista de Clientes em Débito. ' + err.error.Message, 'error');
                            });
                        }
                        else {
                            Swal.fire('Sucesso!', 'Títulos baixados com sucesso!', 'success');
                            this.fecharJanela(true);
                        }
                    })
                }
                else {
                    Swal.fire('Sucesso!', 'Títulos baixados com sucesso!', 'success');
                    this.fecharJanela(true);
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

                        var clientesSelecionados = this.data.clienteIds.filter(this._utils.filterUnique);

                        this._matDialog.open(ControlesImpressaoComprovanteComponent, {
                            width: '339px',
                            height: '100vh',
                            data: {
                                tituloIds: this.data.receberIds,
                                lojaId: this.data.lojaIds,
                                clienteIds: clientesSelecionados,
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

    // Métodos privados
    private carregarDados() {
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

        // Obtem parâmetros para o Baixa Contas a Receber Multiplos
        if (this.lojasSelecionadas.length > 1) {

            let parametrosLojaLogada = this.parametros.filter(i => i.lojaId = this._localStorageService.get('lojaLogada'));

            if (parametrosLojaLogada[0].operacaoReceber != null)
                this.operacaofinanceira.definirCodigoSelecionado(parametrosLojaLogada[0].operacaoReceber);
            if (parametrosLojaLogada[0].codContaReceber != null)
                this.conta.definirCodigoSelecionado(parametrosLojaLogada[0].codContaReceber);

            // Define Min e Max Date
            this.minDate = this._utils.obterMinDatePagto(this._localStorageService.get('lojaLogada'));
            this.maxDate = this._utils.obterMaxDatePagto(this._localStorageService.get('lojaLogada'));
        }
        else {

            if (this.parametros[0].operacaoReceber != null)
                this.operacaofinanceira.definirCodigoSelecionado(this.parametros[0].operacaoReceber);
            if (this.parametros[0].codContaReceber != null)
                this.conta.definirCodigoSelecionado(this.parametros[0].codContaReceber);

            // Define Min e Max Date
            this.minDate = this._utils.obterMinDatePagto(this.lojasSelecionadas[0]);
            this.maxDate = this._utils.obterMaxDatePagto(this.lojasSelecionadas[0]);
        }

        // Dados padrão do formulário
        this.baixaFormGroup.patchValue({
            data: {
                startDate: new Date(),
            },
            valorRecebido: this.data.totalReceber,
            tipoDesconto: "1",
            tipoAcrescimo: "1",

        });
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

        // Desconto por percentual, verifica se é menor que 100%
        if (Number(this.baixaFormGroup.value.tipoDesconto) == 1 && Number(this.baixaFormGroup.value.desconto > 100)) {
            mensagemRetorno += "<br/>- Desconto inválido. O percentual máximo é 100%";
            validado = false;
        }

        // Desconto por valor, verifica se é menor que o valor recebido
        if (Number(this.baixaFormGroup.value.tipoDesconto) == 2 && Number(this.baixaFormGroup.value.desconto) > this.data.totalReceber) {
            mensagemRetorno += "<br/>- Desconto inválido. O valor de desconto deve ser menor que R$" + this.data.totalReceber;
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigatórios para baixar os títulos: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }
    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    
    ngAfterViewInit(): void {

        this.carregarDados();

    }
}