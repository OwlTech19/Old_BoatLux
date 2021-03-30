import { AfterViewInit, Component, ViewEncapsulation, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormBuilder } from "@angular/forms";
import * as moment from 'moment';
// Services
import { FinanceiroService } from "../../../../services/financeiro.service";
// Components
import { ControlesComboLojaComponent } from "../../../../controls/combo-loja/combo-loja.component";
import { ControlesBuscaRapidaComponent } from "../../../../controls/busca-rapida/busca-rapida.component";
// Interfaces
import { RequisicaoCadastroOperacaoBancariaModel } from "../../../../interfaces/financeiro.interface";
import Swal from "sweetalert2";


export interface CadastroOperacaoBancaria_DialogComponent_Data {
    // Parâmetros do formulário
}

@Component({
    selector: 'cadastro-operacao-bancaria-dialog',
    templateUrl: 'cadastro-operacao-bancaria-dialog.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class CadastroOperacaoBancaria_DialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    
    constructor(
        public dialogRef: MatDialogRef<CadastroOperacaoBancaria_DialogComponent>,
        private _formBuilder: FormBuilder,
        private _financeiroService: FinanceiroService,
        @Inject(MAT_DIALOG_DATA) public data: CadastroOperacaoBancaria_DialogComponent_Data) {

    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Propriedades injetadas do grid
    @ViewChild('comboLoja') comboloja: ControlesComboLojaComponent;
    @ViewChild('conta') conta: ControlesBuscaRapidaComponent;
    @ViewChild('contadebito') contadebito: ControlesBuscaRapidaComponent;
    @ViewChild('contacredito') contacredito: ControlesBuscaRapidaComponent;
    @ViewChild('centrodecusto') centrodecusto: ControlesBuscaRapidaComponent;

    // Tratamentos para o campo data
    locale: any = {
        format: 'YYYY-DD-MM',
        displayFormat: 'DD/MM/YYYY',
    };

    exibeTransferencia: boolean = false;
    exibeMovimentacao: boolean = false;

    //Definição do formulário de baixa
    cadastroFormGroup = this._formBuilder.group(
        {
            rbTipoOperacao: [],
            data: [],
            valor: [],
            tipoLancto: [],
            chkRefEmprestimo: [],
            historico: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    tipoOperacaoChanged() {
        if (this.cadastroFormGroup.value.rbTipoOperacao === '1') {
            this.exibeMovimentacao = true;
            this.exibeTransferencia = false;
        }
        else {
            this.exibeMovimentacao = false;
            this.exibeTransferencia = true;
        }
    }

    //Ao selecionar uma loja, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.conta.definirParametros(this.comboloja.obterLojaSelecionada());       
        this.contacredito.definirParametros(this.comboloja.obterLojaSelecionada());
        this.contadebito.definirParametros(this.comboloja.obterLojaSelecionada());
    }

    salvarOperacao() {

        if (this.validarDados()) {

            var operacao = Number(this.cadastroFormGroup.value.rbTipoOperacao) == 1 ? 'Movimentação' : 'Transferência';

            Swal.fire({
                title: 'Tá quase...',
                html: 'Estamos cadastrando a ' + operacao + ' bancária , aguarde...',
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }
            });

            let requisicao: RequisicaoCadastroOperacaoBancariaModel = {
                tipoOperacao: Number(this.cadastroFormGroup.value.rbTipoOperacao),
                lojaId: this.comboloja.obterLojaSelecionada(),
                data: this.cadastroFormGroup.value.data.startDate.format('YYYY-MM-DD'),
                valor: Number(this.cadastroFormGroup.value.valor),
                contaCreditoId: this.contacredito.obterCodigoSelecionado(),
                contaDebitoId: this.contadebito.obterCodigoSelecionado(),
                contaId: this.conta.obterCodigoSelecionado(),
                cCustoId: this.centrodecusto.obterCodigoStringSelecionado(),
                tipoLancto: Number(this.cadastroFormGroup.value.tipoLancto),
                refEmprestimo: Number(this.cadastroFormGroup.value.chkRefEmprestimo),
                historico: this.cadastroFormGroup.value.historico,
            }

            this._financeiroService.salvarOperacaoBancaria(requisicao).subscribe(result => {

                Swal.close();

                if (result > 0) {

                    Swal.fire('Sucesso!', operacao + ' bancária ' + result + ' cadastrada com sucesso.', "success");
                    this.dialogRef.close();
                }

            }, (err) => {
                Swal.fire('Ops!', 'Falha ao cadastrar operação bancária. Tente novamente.', 'error');
            });
        }
    }

    fecharJanela() {
        this.dialogRef.close();
    }

    private validarDados(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (Number(this.cadastroFormGroup.value.valor) == 0) {
            mensagemRetorno += "<br/>- Valor da operação deve ser maior que R$0,00";
            validado = false;
        }

        if (this.cadastroFormGroup.value.rbTipoOperacao === '1') {
            // Validações da Movimentação Bancária
            if (this.conta.obterCodigoSelecionado() == null) {
                mensagemRetorno += "<br/>- Informe a Conta";
                validado = false;
            }
        }
        else {
            // Validações da Transferência Bancária
            if (this.contacredito.obterCodigoSelecionado() == null) {
                mensagemRetorno += "<br/>- Informe a conta de crédito";
                validado = false;
            }
            if (this.contadebito.obterCodigoSelecionado() == null) {
                mensagemRetorno += "<br/>- Informe a conta de débito";
                validado = false;
            }
            if (this.contacredito.obterCodigoSelecionado() != null && this.contadebito.obterCodigoSelecionado() != null && this.contacredito.obterCodigoSelecionado() == this.contadebito.obterCodigoSelecionado()) {
                mensagemRetorno += "<br/>- Conta de crédito deve ser diferente da conta de débito";
                validado = false;
            }
        }

        if (this.cadastroFormGroup.value.historico == null) {
            mensagemRetorno += "<br/>- Digite o histórico da operação";
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigatórios para cadastrar operação bancária: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {

        this.cadastroFormGroup.patchValue({
            data: {
                startDate: moment(new Date()),
            },
            rbTipoOperacao: '1',
            tipoLancto: '1',
        })

        this.tipoOperacaoChanged();
    }

}