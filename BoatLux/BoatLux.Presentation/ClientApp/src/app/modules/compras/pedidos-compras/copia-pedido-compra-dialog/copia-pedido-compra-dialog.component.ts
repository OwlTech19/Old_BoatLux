import { Component, OnInit, Input, Inject, ViewChild, AfterViewInit, AfterContentChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { ComprasService } from '../../../../services/compras.service';
import { ControlesComboLojaComponent } from '../../../../controls/combo-loja/combo-loja.component';
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import * as moment from 'moment';
import { RequisicaoCopiarPedidoModel } from '../../../../interfaces/compras.interface';

export interface ControlesCopiaPedidoCompraComponentData {
    compraId: number;
    lojaId: number;
    compradorId?: number;
    fornecedorId?: number;
}

@Component({
    selector: 'copia-pedido-compra',
    templateUrl: './copia-pedido-compra-dialog.component.html'
})

export class ControlesCopiaPedidoCompraComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<ControlesCopiaPedidoCompraComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ControlesCopiaPedidoCompraComponentData,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService) {

        this.compraId = data.compraId;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Componentes
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;
    @ViewChild('comprador') comprador: ControlesBuscaRapidaComponent;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;

    // Tratamentos para o campo validade da cotação
    locale: any = {
        format: 'YYYY-MM-DD',
        displayFormat: 'DD/MM/YYYY',
        applyLabel: 'OK',
    };

    minDate: moment.Moment = moment();

    compraId: number;

    //Definição do formulário
    copiaPedidoFormGroup = this._formBuilder.group(
        {
            dataPedido: [],
            validadePedido: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // -----------------------------------------------------------------------------------------------------        

    //Ao selecionar uma loja, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.comprador.definirParametros(this.comboLoja.obterLojaSelecionada());
    }

    definirDadosPadraoFormGroup(): void {
        this.copiaPedidoFormGroup.reset({
            dataPedido: {
                startDate: moment(new Date()).format('YYYY-MM-DD'),
                endDate: moment(new Date()).format('YYYY-MM-DD')
            },
            validadePedido: {
                startDate: moment(new Date()).format('YYYY-MM-DD'),
                endDate: moment(new Date()).format('YYYY-MM-DD')
            }
        });
    }

    copiarPedido(): void {

        if (this.validarCampos()) {

            let requisicao: RequisicaoCopiarPedidoModel = {

                compraId: this.data.compraId,
                lojaId: this.comboLoja.obterLojaSelecionada(),
                compradorId: Number(this.comprador.obterCodigoSelecionado()),
                fornecedorId: Number(this.fornecedor.obterCodigoSelecionado()),
                dataPedido: this.copiaPedidoFormGroup.value.dataPedido.endDate.format('YYYY-MM-DD'),
                validadePedido: this.copiaPedidoFormGroup.value.validadePedido.endDate.format('YYYY-MM-DD'),
            }

            this._comprasService.copiarPedidoCompra(requisicao).subscribe((result) => {

                Swal.fire('Pronto!', 'Copiamos o pedido com sucesso.<br> Foi gerado o pedido ' + result, 'success');

                this.dialogRef.close();

            }, (err) => {
                Swal.fire('Ops!', 'Não conseguimos copiar o pedido. Tente novamente!', 'error');
            });
        }
    }

    validarCampos(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.copiaPedidoFormGroup.value.dataPedido == null) {
            mensagemRetorno += "<br/>- Informe a data do pedido";
            validado = false;
        }

        if (this.copiaPedidoFormGroup.value.validadePedido == null) {
            mensagemRetorno += "<br/>- Informe a data de validade do pedido";
            validado = false;
        }

        if (this.comprador.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe o comprador";
            validado = false;
        }

        if (this.fornecedor.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe o fornecedor";
            validado = false;
        }

        if (this.copiaPedidoFormGroup.value.validadePedido != null && this.copiaPedidoFormGroup.value.validadePedido.endDate.format('YYYY-MM-DD') < this.copiaPedidoFormGroup.value.dataPedido.endDate.format('YYYY-MM-DD')) {
            mensagemRetorno += "<br/>- Data de validade não pode ser menor que a data do pedido";
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigatórios e tente novamente: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        // Carregar dados padrão
        this.definirDadosPadraoFormGroup();
        // Carrega dados do pedido copiado
        if (this.data.lojaId != null) { this.comboLoja.definirLojaSelecionada(this.data.lojaId); }
        if (this.data.compradorId != null) { this.comprador.definirCodigoSelecionado(Number(this.data.compradorId)) }
        if (this.data.fornecedorId != null) { this.fornecedor.definirCodigoSelecionado(Number(this.data.fornecedorId)) }
    }
}