import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FinanceiroService } from '../../../services/financeiro.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { FormBuilder, Validators } from '@angular/forms';
import { RequisicaoAtribuirInformacoesTitulosModel } from '../../../interfaces/financeiro.interface';
import { ControlesBuscaRapidaComponent } from '../../../controls/busca-rapida/busca-rapida.component';


export interface AtribuirInformacoesTitulos_DialogComponent_Data {
    idSelecionados: number[],
    modulo: string, // Módulo que será usado no título da página
    situacao: string[],
    sucesso?: boolean;
    lojasSelecionadas: number[],
}

@Component({
    selector: 'atribuir-informacoes-titulos-dialog',
    templateUrl: './atribuir-informacoes-titulos-dialog.component.html',
})
export class AtribuirInformacoesTitulos_DialogComponent {

    constructor(
        public dialogRef: MatDialogRef<AtribuirInformacoesTitulos_DialogComponent>,
        private _financeiroService: FinanceiroService,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: AtribuirInformacoesTitulos_DialogComponent_Data) {

        this.idSelecionados = data.idSelecionados;
        this.modulo = data.modulo;

        //Verifica qual o módulo para o cabeçalho: pagar ou receber
        this.titulo = 'Atribuir informações - Títulos a ' + data.modulo;

        // distinct array lojasSelecionadas
        var flags = [], lojas = [], l = data.lojasSelecionadas.length, i;
        for (i = 0; i < l; i++) {
            if (flags[data.lojasSelecionadas[i]]) continue;
            flags[data.lojasSelecionadas[i]] = true;
            lojas.push(data.lojasSelecionadas[i]);
        }

        //Manipula campo vendedor
        if (data.modulo === "pagar") {
            // Esconde o campo
            this.exibeVendedor = false;
        }
        else if (lojas.length == 1 && data.modulo === "receber") {

            // Desabilita o campo
            this.exibeVendedor = true;
        }
    }

    //Propriedades injetadas do grid de produtos
    @ViewChild('tipodocumento') tipodocumento: ControlesBuscaRapidaComponent;
    @ViewChild('centrodecusto') centrodecusto: ControlesBuscaRapidaComponent;
    @ViewChild('vendedor') vendedor: ControlesBuscaRapidaComponent;

    // Tratamentos para o campo validade da cotação
    locale: any = {
        format: 'YYYY-DD-MM',
        displayFormat: 'DD/MM/YYYY',
    };

    modulo: string;
    idSelecionados: number[];
    titulo: string;
    situacao: string[];
    multiLoja: boolean;
    exibeVendedor: boolean;

    //Definição do formulário de cadastro
    atribuirFormGroup = this._formBuilder.group(
        {
            dtVencto: [],
            juros: [],
            atribJuros: []
        }
    );

    //Atribuir informações aos cadastros
    atribuirInformacoes() {

        if (this.validarDados()) {

            if (this.data.modulo == 'receber')
                this.atribuirReceber();
            else // pagar
                this.atribuirPagar();
        }
    }

    atribuirReceber() {

        Swal.fire({
            title: 'Tá quase...',
            html: 'Estamos atribuindo as informações aos títulos a receber, aguarde...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });
        let requisicao: RequisicaoAtribuirInformacoesTitulosModel =
        {
            receberId: this.idSelecionados,
            dtVencto: this.atribuirFormGroup.value.dtVencto != null ? this.atribuirFormGroup.value.dtVencto.startDate.format('YYYY-MM-DD') : null,
            codCCustoId: this.centrodecusto.obterCodigoStringSelecionado(),
            codTipoDocumentoId: this.tipodocumento.obterCodigoSelecionado(),
            codVendedorId: this.vendedor.obterCodigoSelecionado(),
            situacao: this.situacao,
            juros: Number(this.atribuirFormGroup.value.juros),
            atribJuros: Number(this.atribuirFormGroup.value.atribJuros),
        };

        this._financeiroService.atribuirInformacoesTitulos(requisicao).subscribe((resultado) => {
            if (resultado.sucesso) {

                Swal.fire(
                    'Pronto!',
                    'Informações atribuídas aos títulos a receber com sucesso.',
                    'success').then((result) => {

                        this.fecharJanela(true);

                    });
            }
            else {
                Swal.fire('Ops!', 'Não foi possível atribuir informações aos títulos a receber. Tente novamente.', 'error');
            }
        }, (err) => {
            Swal.fire('Ops!', 'Não foi possível atribuir informações aos títulos a receber.' + err, 'error');
        });
    }

    atribuirPagar() {
        Swal.fire({
            title: 'Tá quase...',
            html: 'Estamos atribuindo as informações aos títulos a pagar, aguarde...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });
        let requisicao: RequisicaoAtribuirInformacoesTitulosModel =
        {
            receberId: this.idSelecionados,
            dtVencto: this.atribuirFormGroup.value.dtVencto != null ? this.atribuirFormGroup.value.dtVencto.startDate.format('YYYY-MM-DD') : null,
            codCCustoId: this.centrodecusto.obterCodigoStringSelecionado(),
            codTipoDocumentoId: this.tipodocumento.obterCodigoSelecionado(),
            situacao: this.situacao
        };

        this._financeiroService.atribuirInformacoesPagar(requisicao).subscribe((resultado) => {

            Swal.fire(
                'Pronto!',
                'Informações atribuídas aos títulos a pagar com sucesso.',
                'success').then((result) => {

                    this.fecharJanela(true);

                });

        }, (err) => {
            Swal.fire('Ops!', 'Não foi possível atribuir informações aos títulos a pagar.' + err, 'error');
        });

    }

    //Fecha a janela
    fecharJanela(reload: boolean): void {
        this.dialogRef.close(reload);
    }

    private validarDados(): boolean {

        if (this.atribuirFormGroup.value.dtVencto == null &&
            this.centrodecusto.obterCodigoStringSelecionado() == null &&
            this.tipodocumento.obterCodigoSelecionado() == null &&
            this.vendedor.obterCodigoSelecionado() == null &&
            Number(this.atribuirFormGroup.value.atribJuros) == 0
        ) {
            Swal.fire('Atenção!', 'Não foi informado nenhum campo para atribuir informações. Por favor, informe um ou mais campos para atribuir.', 'warning');
            return false;
        }
        else
            return true;
    }
}