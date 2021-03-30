import { Component, OnInit, Input, Inject, ViewChild, AfterViewInit, AfterContentChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { ComprasService } from '../../../../services/compras.service';
import { ControlesComboLojaComponent } from '../../../../controls/combo-loja/combo-loja.component';
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import * as moment from 'moment';
import { RequisicaoRelatorioPedidoCompra } from '../../../../interfaces/compras.interface';

export interface ControlesFiltroRelPedidoCompraComponentData {

}

@Component({
    selector: 'filtro-rel-pedido-compra',
    templateUrl: './filtro-rel-pedido-compra-dialog.component.html'
})

export class ControlesFiltroRelPedidoCompraComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<ControlesFiltroRelPedidoCompraComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ControlesFiltroRelPedidoCompraComponentData,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService) {

    }
    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Componentes
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;
    @ViewChild('comprador') comprador: ControlesBuscaRapidaComponent;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;

    // Períodos pré definidos do componente 
    ranges: any = {
        'Hoje': [moment(), moment()],
        'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Últimos 7 dias': [moment().subtract(6, 'days'), moment()],
        'Últimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'Mês atual': [moment().startOf('month'), moment().endOf('month')],
        'Mês passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    };

    //Definição do formulário de busca
    filtroRelPedidoFormGroup = this._formBuilder.group(
        {
            pedidoIni: [],
            pedidoFim: [],
            periodoPedido: [],
            periodoValidadePedido: [],
            quebraLojaPorRelatorio: [],
            mostrarUltPrecoUnit: ['1'],
            mostrarPrecoCusto: [],
            imprimirRecebimentoCego: [],
            imprimirTrocas: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Ao selecionar lojas, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.comprador.definirParametros(this.comboLoja.obterLojasSelecionadas());
    }

    imprimirRecebimentoChecked(checked) {
        if (checked) {
            this.filtroRelPedidoFormGroup.controls.mostrarUltPrecoUnit.disable();
            this.filtroRelPedidoFormGroup.controls.mostrarPrecoCusto.disable();
            this.filtroRelPedidoFormGroup.controls.mostrarUltPrecoUnit.setValue(0);
            this.filtroRelPedidoFormGroup.controls.mostrarPrecoCusto.setValue(0);
        } else {
            this.filtroRelPedidoFormGroup.controls.mostrarUltPrecoUnit.enable();
            this.filtroRelPedidoFormGroup.controls.mostrarPrecoCusto.enable();
        }
    }

    imprimirBusca(formato: number, visualizar: boolean = false): void {

        if (this.validarFiltros()) {

            if (this.filtroRelPedidoFormGroup.value.periodoPedido.startDate != null) {
                this.filtroRelPedidoFormGroup.patchValue({
                    periodoPedido: {
                        startDate: this.filtroRelPedidoFormGroup.value.periodoPedido.startDate.format('YYYY-MM-DD'),
                        endDate: this.filtroRelPedidoFormGroup.value.periodoPedido.endDate.format('YYYY-MM-DD'),
                    }
                })

            }

            if (this.filtroRelPedidoFormGroup.value.periodoValidadePedido != null) {
                this.filtroRelPedidoFormGroup.patchValue({
                    periodoValidadePedido: {
                        startDate: this.filtroRelPedidoFormGroup.value.periodoValidadePedido.startDate.format('YYYY-MM-DD'),
                        endDate: this.filtroRelPedidoFormGroup.value.periodoValidadePedido.endDate.format('YYYY-MM-DD'),
                    }
                })

            }

            let requisicao: RequisicaoRelatorioPedidoCompra =
            {
                formato: formato,
                lojas: this.comboLoja.obterLojasSelecionadas(),
                pedidoIni: Number(this.filtroRelPedidoFormGroup.value.pedidoIni),
                pedidoFim: Number(this.filtroRelPedidoFormGroup.value.pedidoFim),
                comprador: Number(this.comprador.obterCodigoSelecionado()),
                fornecedor: Number(this.fornecedor.obterCodigoSelecionado()),
                periodoPedido: this.filtroRelPedidoFormGroup.value.periodoPedido.startDate != null ? this.filtroRelPedidoFormGroup.value.periodoPedido : null,
                periodoValidadePedido: this.filtroRelPedidoFormGroup.value.periodoValidadePedido,
                quebraLojaPorRelatorio: Number(this.filtroRelPedidoFormGroup.value.quebraLojaPorRelatorio),
                imprimirTrocas: Number(this.filtroRelPedidoFormGroup.value.imprimirTrocas),
                mostrarPrecoCusto: Number(this.filtroRelPedidoFormGroup.value.mostrarPrecoCusto),
                mostrarUltPrecoUnit: Number(this.filtroRelPedidoFormGroup.value.mostrarUltPrecoUnit),
                imprimirRecebimentoCego: Number(this.filtroRelPedidoFormGroup.value.imprimirRecebimentoCego),
            };

            this._comprasService.gerarRelatorioPedidoCompra(requisicao, 'Relatório Pedido de Compras', visualizar);
        }
    }

    definirDadosPadrao(): void {
        this.filtroRelPedidoFormGroup.reset({
            periodoPedido: {
                startDate: moment().format('YYYY-MM-DD'),
                endDate: moment().format('YYYY-MM-DD')
            },
            periodoValidadePedido: null,
            pedidoIni: '',
            pedidoFim: '',
            quebraLojaPorRelatorio: '',
            mostrarUltPrecoUnit: '1',
            mostrarPrecoCusto: '',
            imprimirRecebimentoCego: '',
        });

        this.fornecedor.limpar();
        this.comprador.limpar();
    }

    validarFiltros(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        /* Set NULL in periodoValidadePedido. Verificando aqui pois precisa checar se o componente é diferente de null e se as propriedades são nulas
           Essa verificação não retorna mensagem e nem bloqueia impressão, é apenas um tratamento
         */
        if (this.filtroRelPedidoFormGroup.value.periodoValidadePedido != null) {
            if (this.filtroRelPedidoFormGroup.value.periodoValidadePedido.startDate == null || this.filtroRelPedidoFormGroup.value.periodoValidadePedido.endDate == null)
                this.filtroRelPedidoFormGroup.value.periodoValidadePedido = null;
        }

        if (this.comboLoja.obterLojasSelecionadas().length == 0) {
            mensagemRetorno += "<br/>- Selecione pelo menos uma loja"
            validado = false;
        }

        if ((this.filtroRelPedidoFormGroup.value.periodoPedido.startDate == null || this.filtroRelPedidoFormGroup.value.periodoPedido.endDate == null)
            && (Number(this.filtroRelPedidoFormGroup.value.pedidoIni) == 0 || Number(this.filtroRelPedidoFormGroup.value.pedidoFim) == 0)
            && Number(this.fornecedor.obterCodigoSelecionado()) == 0
            && Number(this.comprador.obterCodigoSelecionado()) == 0) {
            mensagemRetorno += "<br/>- Um dos filtros a seguir deve ser informado para imprimir o relatório: pedido inicial e final, comprador, fornecedor ou período do pedido."
            validado = false;
        }

        if (Number(this.filtroRelPedidoFormGroup.value.pedidoIni) > Number(this.filtroRelPedidoFormGroup.value.pedidoFim)) {
            mensagemRetorno += "<br/>- Filtro de pedidos inválido. O pedido inicial deve ser maior ou igual ao pedido final";
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        this.definirDadosPadrao();
    }
}
