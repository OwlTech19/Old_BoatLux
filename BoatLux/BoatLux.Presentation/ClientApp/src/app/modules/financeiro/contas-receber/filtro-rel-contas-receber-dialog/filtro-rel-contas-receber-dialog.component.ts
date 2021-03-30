import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { FormBuilder, Validators } from '@angular/forms';
import { FinanceiroService } from '../../../../services/financeiro.service';
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import { ControlesComboLojaComponent } from '../../../../controls/combo-loja/combo-loja.component';
import { RequisicaoRelatorioContasReceberModel } from '../../../../interfaces/financeiro.interface';

export interface FiltroRelContasReceber_DialogComponent_Data {

}

@Component({
    selector: 'filtro-rel-contas-receber-dialog',
    templateUrl: './filtro-rel-contas-receber-dialog.component.html',
})

export class FiltroRelContasReceber_DialogComponent implements AfterViewInit {

    constructor(
        public dialogRef: MatDialogRef<FiltroRelContasReceber_DialogComponent>,
        private _financeiroService: FinanceiroService,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: FiltroRelContasReceber_DialogComponent) {
    }

    //Propriedades injetadas
    @ViewChild('comboLoja') comboloja: ControlesComboLojaComponent;
    @ViewChild('cliente') cliente: ControlesBuscaRapidaComponent;
    @ViewChild('tipodocumento') tipodocumento: ControlesBuscaRapidaComponent;
    @ViewChild('operacaofinanceira') operacaofinanceira: ControlesBuscaRapidaComponent;
    @ViewChild('centrodecusto') centrodecusto: ControlesBuscaRapidaComponent;
    @ViewChild('banco') banco: ControlesBuscaRapidaComponent;
    @ViewChild('conta') conta: ControlesBuscaRapidaComponent;
    @ViewChild('tipocliente') tipocliente: ControlesBuscaRapidaComponent;
    @ViewChild('vendedor') vendedor: ControlesBuscaRapidaComponent;

    // Períodos pré definidos do componente 
    ranges: any = {
        'Hoje': [moment(), moment()],
        'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Últimos 7 dias': [moment().subtract(6, 'days'), moment()],
        'Últimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'Mês atual': [moment().startOf('month'), moment().endOf('month')],
        'Mês passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    };

    //Definição do formulário de filtros
    filtrosFormGroup = this._formBuilder.group(
        {
            tipoData: ['1'],
            periodo: [],
            numtitulo: [],
            parcela: [],
            situacao: [''],
            quebra: [],
            tipoDados: ['0'],
            ordenacaoClientes: ['0'],
            impPorPagina: []
        }
    );

    //Ao selecionar lojas, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.conta.definirParametros(this.comboloja.obterLojasSelecionadas());
        this.vendedor.definirParametros(this.comboloja.obterLojasSelecionadas());
    }

    desabilitaConta(tipo: number) {

        if (this.filtrosFormGroup.value.situacao == 'AB' && this.conta.obterCodigoSelecionado() != null)
            this.conta.limpar();

        switch (tipo) {
            case 1: // Desabilita e limpa o campo
                if (this.filtrosFormGroup.value.situacao == 'AB') {
                    return 'none';
                }
                else
                    return 'auto';

            case 2: // alterar opacidade
                if (this.filtrosFormGroup.value.situacao == 'AB')
                    return '0.6';
                else
                    return '1';
            default:
        }
    }

    desabilitaCampo(campo: string): boolean {

        switch (campo) {
            case 'formapg':
                if (this.filtrosFormGroup.value.situacao == 'AB' || this.filtrosFormGroup.value.situacao == 'CA' || this.filtrosFormGroup.value.situacao == '') {
                    // Se situacao não for uma baixa e estiver selecionado quebra por Forma Pagto, altera quebra pra Cliente
                    if (this.filtrosFormGroup.value.quebra === '4') {
                        this.filtrosFormGroup.patchValue({
                            quebra: '0',
                        });
                    }
                    return true;
                }
                else {
                    return false;
                }
            case 'ordenacaoCliente':
                if (this.filtrosFormGroup.value.quebra != '0') { // Se a quebra não é por cliente, desabilita o campo
                    return true;
                }
                else {
                    return false;
                }
        }

    }

    imprimir(formato: number, visualizar: boolean = false): void {

        if (this.validarDados()) {
            if (this.filtrosFormGroup.value.periodo.startDate != null) {
                this.filtrosFormGroup.patchValue({
                    periodo: {
                        startDate: this.filtrosFormGroup.value.periodo.startDate.format('YYYY-MM-DD'),
                        endDate: this.filtrosFormGroup.value.periodo.endDate.format('YYYY-MM-DD'),
                    }
                })
            }

            let requisicao: RequisicaoRelatorioContasReceberModel = {
                formato: formato,
                lojasId: this.comboloja.obterLojasSelecionadas(),
                tipoData: Number(this.filtrosFormGroup.value.tipoData),
                periodo: this.filtrosFormGroup.value.periodo.startDate != null ? this.filtrosFormGroup.value.periodo : null,
                clienteId: Number(this.cliente.obterCodigoSelecionado()),
                bancoId: this.banco.obterCodigoStringSelecionado(),
                tipoDocumentoId: Number(this.tipodocumento.obterCodigoSelecionado()),
                operacaoFinanceiraId: Number(this.operacaofinanceira.obterCodigoSelecionado()),
                ccustoId: this.centrodecusto.obterCodigoStringSelecionado(),
                contaId: Number(this.conta.obterCodigoSelecionado()),
                vendedorId: Number(this.vendedor.obterCodigoSelecionado()),
                vendedor: Number(this.vendedor.obterCodigoSelecionado()) > 0 ? this.vendedor.obterItemSelecionado().titulo : null,
                situacao: this.filtrosFormGroup.value.situacao,
                numtitulo: this.filtrosFormGroup.value.numtitulo,
                parcela: this.filtrosFormGroup.value.parcela,
                quebra: Number(this.filtrosFormGroup.value.quebra),
                tipoDados: Number(this.filtrosFormGroup.value.tipoDados),
                ordenacaoClientes: Number(this.filtrosFormGroup.value.ordenacaoClientes),
                impPorPagina: Number(this.filtrosFormGroup.value.impPorPagina),
                tipoClienteId: this.tipocliente.obterCodigoSelecionado(),
            }

            this._financeiroService.gerarRelatorioContasReceber(requisicao, 'Rel. Contas a Receber', visualizar);
        }
    }

    fecharJanela(): void {
        this.dialogRef.close();
    }

    definirDadosDefault(): void {
        this.filtrosFormGroup.patchValue({
            periodo: {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30))
            },
            tipoData: '1',
            numtitulo: null,
            parcela: '',
            situacao: '',
            quebra: '0',
            tipoDados: '0',
            ordenacaoClientes: '0',
            impPorPagina: '',
        });

        this.cliente.limpar();
        this.banco.limpar();
        this.tipodocumento.limpar();
        this.operacaofinanceira.limpar();
        this.centrodecusto.limpar();
        this.conta.limpar();
        this.tipocliente.limpar();
        this.vendedor.limpar();
    }

    private validarDados(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.comboloja.obterLojasSelecionadas().length == 0) {
            mensagemRetorno += "<br/>- O campo Loja é obrigatório";
            validado = false;
        }

        if (Number(this.cliente.obterCodigoSelecionado()) == 0
            && this.filtrosFormGroup.value.periodo.startDate == null
            && this.banco.obterCodigoStringSelecionado() == null
            && Number(this.tipodocumento.obterCodigoSelecionado()) == 0
            && Number(this.operacaofinanceira.obterCodigoSelecionado()) == 0
            && this.centrodecusto.obterCodigoStringSelecionado() == null) {

            mensagemRetorno += "<br/> É obrigatório informar ao menos um dos campos abaixo:"
                + "<br/> - Cliente"
                + "<br/> - Período"
                + "<br/> - Banco"
                + "<br/> - Tipo do Documento"
                + "<br/> - Operação Financeira"
                + "<br/> - Centro de Custo"
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "<strong>Por favor, verifique os filtros para gerar o relatório: </strong>" + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    ngAfterViewInit(): void {

        this.definirDadosDefault();
    }
}