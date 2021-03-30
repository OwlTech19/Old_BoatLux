import { Component, AfterViewInit, Inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { RequisicaoGerarReceberTrocasModel } from '../../../../interfaces/compras.interface';
import { Parametros } from '../../../../interfaces/uteis.interface';
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import { ComprasService } from '../../../../services/compras.service';
import { LocalStorageService } from '../../../../services/local-storage.service';


export interface GeraContasReceberTrocaComponentData {
    trocaIds: number[];
    parametros: Parametros[];
}

@Component({
    selector: 'gera-contas-receber-troca',
    templateUrl: './gera-contas-receber-troca.component.html'
})

export class GeraContasReceberTrocaComponent implements AfterViewInit {

    constructor(
        public dialogRef: MatDialogRef<GeraContasReceberTrocaComponent>,
        @Inject(MAT_DIALOG_DATA) public data: GeraContasReceberTrocaComponentData,
        private _formBuilder: FormBuilder,
        private _localStorageService: LocalStorageService,
        private _comprasService: ComprasService,
    ) { }

    //Propriedades injetadas
    @ViewChild('centrodecusto') centrodecusto: ControlesBuscaRapidaComponent;
    @ViewChild('tipodocumento') tipodocumento: ControlesBuscaRapidaComponent;
    @ViewChild('banco') banco: ControlesBuscaRapidaComponent;
    @ViewChild('operacaofinanceira') operacaofinanceira: ControlesBuscaRapidaComponent;
    @ViewChild('condPagto') condPagto: ControlesBuscaRapidaComponent;

    //Chave do cache de parâmetros
    private _parametros = 'parametros';

    //Definição do formulário
    dadosFormGroup = this._formBuilder.group(
        {

        }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // -----------------------------------------------------------------------------------------------------
    gerarReceber() {
        if (this.validarCamposObrigatorios()) {

            Swal.fire({
                title: 'Tá quase...',
                html: 'Estamos gerando os títulos a receber, aguarde...',
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }
            });

            let requisicao: RequisicaoGerarReceberTrocasModel = {
                trocaIds: this.data.trocaIds,
                ccustoId: this.centrodecusto.obterCodigoStringSelecionado().trim(),
                tipoDocumentoId: Number(this.tipodocumento.obterCodigoSelecionado()),
                bancoId: this.banco.obterCodigoStringSelecionado().trim(),
                operacaoFinanceiraId: Number(this.operacaofinanceira.obterCodigoSelecionado()),
                condPagtoId: Number(this.condPagto.obterCodigoSelecionado()),
                parametros: this.data.parametros,
            };

            this._comprasService.gerarContasReceberTrocas(requisicao).subscribe(result => {

                Swal.close();
                Swal.fire('Pronto', 'Contas a receber gerado com sucesso.', 'success')
                this.dialogRef.close();

            }, (err => {
                Swal.fire('Ops!', err.error.Message, 'error');
            })
            );

        }
        else {
            Swal.fire('Ops!', 'Preencha todas as informações para gerar contas a receber.', 'warning');
        }
    }

    /**
        * Private
     **/
    private verificarParametros() {
        let parametros = this._localStorageService.get(this._parametros).filter(i => i.id == this._localStorageService.get('lojaLogada'));

        if (parametros[0].cCustoReceber != null)
            this.centrodecusto.definirCodigoSelecionado(parametros[0].cCustoReceber);

        if (parametros[0].tipoDocumentoReceber != null)
            this.tipodocumento.definirCodigoSelecionado(parametros[0].tipoDocumentoReceber);

        if (parametros[0].bancoReceber != null)
            this.banco.definirCodigoSelecionado(parametros[0].bancoReceber);

        if (parametros[0].operacaoReceber != null)
            this.operacaofinanceira.definirCodigoSelecionado(parametros[0].operacaoReceber);
    }

    private validarCamposObrigatorios(): boolean {

        if (this.centrodecusto.obterCodigoStringSelecionado() === null
            || Number(this.tipodocumento.obterCodigoSelecionado()) === 0
            || this.banco.obterCodigoStringSelecionado() === null
            || Number(this.operacaofinanceira.obterCodigoSelecionado()) === 0
            || Number(this.condPagto.obterCodigoSelecionado()) === 0
        ) {
            return false;
        }
        else {
            return true;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
        * AfterViewInit
     **/
    ngAfterViewInit(): void {

        this.verificarParametros();
    }
}