import { AfterViewInit, Component, ViewEncapsulation, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { FormBuilder } from "@angular/forms";
import Swal from "sweetalert2";
import * as moment from 'moment';
// Services
import { LocalStorageService } from "../../../../services/local-storage.service";
import { FinanceiroService } from "../../../../services/financeiro.service";
import { UtilsService } from "../../../../services/utils.service";
// Components
import { ControlesBuscaRapidaComponent } from "../../../../controls/busca-rapida/busca-rapida.component";
import { ControlesImpressaoComprovanteComponent } from "../../../../controls/impressao-comprovante/impressao-comprovante.component";
import { AnexaComprovantePagar_DialogComponent } from "../anexa-comprovante-pagar-dialog/anexa-comprovante-pagar-dialog.component";
// Interfaces
import { RequisicaoBaixarPagarMultiplosModel, RequisicaoFichaPagamentoModel } from "../../../../interfaces/financeiro.interface";

// Constantes
const MODULO = "pagar";

export interface BaixaContasPagarMultiplos_DialogComponent_Data {
    pagarIds: number[];
    lojaIds: number[];
    fornecedorIds?: number[];
}

@Component({
    selector: 'baixa-contas-pagar-multiplos-dialog',
    templateUrl: 'baixa-contas-pagar-multiplos-dialog.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class BaixaContasPagarMultiplos_DialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    
    constructor(
        public dialogRef: MatDialogRef<BaixaContasPagarMultiplos_DialogComponent>,
        private _matDialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _localStorageService: LocalStorageService,
        private _financeiroService: FinanceiroService,
        public _utils: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: BaixaContasPagarMultiplos_DialogComponent_Data) {

        this.lojasSelecionadas = this.data.lojaIds.filter(_utils.filterUnique());
        // Loja refer??ncia
        this.lojaRefId = this.lojasSelecionadas.length > 1 ? Number(this._localStorageService.get('lojaLogada')) : this.lojasSelecionadas[0];
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

    lojasSelecionadas: number[] = [];
    lojaRefId: number;
    permiteBaixaRetro = false;
    imprimeComprovanteA4 = false;

    //Defini????o do formul??rio de baixa
    baixaFormGroup = this._formBuilder.group(
        {
            data: [],
            numDocto: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // M??todos
    // -----------------------------------------------------------------------------------------------------   
    
    baixarTitulos() {

        if (this.validarDados()) {

            Swal.fire({
                title: 'T?? quase...',
                html: 'Estamos baixando os t??tulos selecionados, aguarde...',
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }
            });

            let requisicao: RequisicaoBaixarPagarMultiplosModel = {
                pagarIds: this.data.pagarIds,
                contaId: Number(this.conta.obterCodigoSelecionado()),
                data: this.baixaFormGroup.value.data.startDate.format('YYYY-MM-DD'),
                numDocto: this.baixaFormGroup.value.numDocto,
                operacaoFinanceiraId: Number(this.operacaofinanceira.obterCodigoSelecionado()),
                formaPgId: Number(this.formapg.obterCodigoSelecionado()),
            }

            this._financeiroService.baixarPagarMultiplos(requisicao).subscribe(result => {

                Swal.close();

                Swal.fire('Sucesso!', 'T??tulos a pagar baixados com sucesso!', 'success');

                if (this._utils.lerParam('comprovpagamento', this._utils.lojaLogada) == 'S') {

                    this._matDialog.open(AnexaComprovantePagar_DialogComponent, {
                        width: '750px',
                        disableClose: true,
                        data: {
                            pagarIds: this.data.pagarIds
                        }
                    });
                }
                else {

                    Swal.fire({
                        title: 'Confirma????o!',
                        text: "Deseja imprimir o comprovante?",
                        icon: 'info',
                        input: 'checkbox',
                        inputPlaceholder: 'Imprimir observa????o',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Sim!',
                        cancelButtonText: 'N??o!'
                    }).then((result) => {
                        if (result.isConfirmed) {

                            if (this.imprimeComprovanteA4) {

                                let requisicao: RequisicaoFichaPagamentoModel = {
                                    formato: 1,
                                    lojaIds: this.data.lojaIds,
                                    pagarIds: this.data.pagarIds,
                                    impObs: Number(result.value)
                                }

                                this._financeiroService.gerarRelatorioFichaPagamento(requisicao, 'Comprovante de Pagto.', true);
                            }
                            else {

                                var fornecedoresSelecionados = this.data.fornecedorIds.filter(this._utils.filterUnique);

                                this._matDialog.open(ControlesImpressaoComprovanteComponent, {
                                    width: '339px',
                                    height: '100vh',
                                    data: {
                                        tituloIds: this.data.pagarIds,
                                        fornecedorIds: fornecedoresSelecionados,
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
                Swal.fire('Ops!', 'Falha ao baixar t??tulos. Tente novamente.', 'error');
            });
        }
    }

    fecharJanela(reload: boolean): void {
        this.dialogRef.close(reload);
    }

    // M??todos privados
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
            mensagemRetorno += "<br/>- Opera????o Financeira";
            validado = false;
        }

        if (!this.permiteBaixaRetro) {
            if (moment(new Date().getDate(), "DD/MM/YYYY") > moment(this.baixaFormGroup.value.data.startDate, "DD/MM/YYYY")) {
                mensagemRetorno += "<br/>- Data deve ser maior ou igual a data atual";
                validado = false;
            }
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigat??rios para baixar os t??tulos: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    private definirDadosPadrao() {

        this.permiteBaixaRetro = this._utils.lerParam('baixaRetroPagar', this.lojaRefId) == 'S' ? true : false;
        this.imprimeComprovanteA4 = this._utils.lerParam('impressaocomprovantepagara4', this.lojaRefId) == 'S' ? true : false

        if (this._utils.lerParam('operacaoPagar', this.lojaRefId) != null)
            this.operacaofinanceira.definirCodigoSelecionado(this._utils.lerParam('operacaoPagar', this.lojaRefId));

        this.baixaFormGroup.patchValue({
            data: {
                startDate: new Date(),
            },
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // M??todos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    
    ngAfterViewInit(): void {

        this.definirDadosPadrao();

    }
}