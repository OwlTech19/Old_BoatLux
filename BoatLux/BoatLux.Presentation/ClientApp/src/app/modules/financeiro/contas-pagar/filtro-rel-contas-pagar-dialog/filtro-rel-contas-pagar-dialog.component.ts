import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { FormBuilder } from "@angular/forms";
import * as moment from 'moment';
import Swal from "sweetalert2";
// Services
import { FinanceiroService } from "../../../../services/financeiro.service";
// Components
import { ControlesComboLojaComponent } from "../../../../controls/combo-loja/combo-loja.component";
import { ControlesBuscaRapidaComponent } from "../../../../controls/busca-rapida/busca-rapida.component";
// Interfaces
import { RequisicaoRelatorioContasPagarModel, RequisicaoFichaPagamentoModel } from "../../../../interfaces/financeiro.interface";

@Component({
    selector: 'filtro-rel-contas-pagar-dialog',
    templateUrl: './filtro-rel-contas-pagar-dialog.component.html',
})

export class FiltroRelContasPagar_DialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<FiltroRelContasPagar_DialogComponent>,
        private _financeiroService: FinanceiroService,
        private _formBuilder: FormBuilder,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    
    //Propriedades injetadas
    @ViewChild('comboLoja') comboloja: ControlesComboLojaComponent;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('banco') banco: ControlesBuscaRapidaComponent;
    @ViewChild('tipodocumento') tipodocumento: ControlesBuscaRapidaComponent;
    @ViewChild('centrodecusto') centrodecusto: ControlesBuscaRapidaComponent;
    @ViewChild('operacaofinanceira') operacaofinanceira: ControlesBuscaRapidaComponent;
    @ViewChild('conta') conta: ControlesBuscaRapidaComponent;
    @ViewChild('tipofornecedor') tipofornecedor: ControlesBuscaRapidaComponent;

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
            tipoData: [],
            periodo: [],
            numTit: [],
            parcela: [],
            nota: [],
            numCheque: [],
            observacao: [],
            situacao: [],
            quebra: [],
            tipoDados: [],
            impFichaPagto: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Ao selecionar lojas, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.conta.definirParametros(this.comboloja.obterLojasSelecionadas());
    }

    desabilitaCampo(tipo: number) {

        if (this.filtrosFormGroup.value.impFichaPagto) {
            switch (tipo) {
                case 1: // Desabilitar campo
                    return 'none';
                case 2: // alterar opacidade
                    return '0.6';
            }
        }
    }

    definirDadosDefault() {

        this.filtrosFormGroup.patchValue({
            periodo: {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30))
            },
            tipoData: '1',
            numTit: null,
            parcela: null,
            nota: null,
            numCheque: null,
            observacao: null,
            situacao: '',
            quebra: '0',
            tipoDados: '0',
            impFichaPagto: null,
        });

        this.fornecedor.limpar();
        this.banco.limpar();
        this.tipodocumento.limpar();
        this.operacaofinanceira.limpar();
        this.centrodecusto.limpar();
        this.conta.limpar();
        this.tipofornecedor.limpar();
    }

    imprimir(formato: number, visualizar: boolean = false): void {

        if (this.validarDados()) {
            if (this.filtrosFormGroup.value.periodo.startDate != null) {
                this.filtrosFormGroup.patchValue({
                    periodo: {
                        startDate: this.filtrosFormGroup.value.periodo.startDate.format('YYYY-MM-DD'),
                        endDate: this.filtrosFormGroup.value.periodo.endDate.format('YYYY-MM-DD'),
                    }
                });
            }

            if (Number(this.filtrosFormGroup.value.impFichaPagto) == 1) {

                let requisicao: RequisicaoFichaPagamentoModel = {
                    formato: formato,
                    lojaIds: this.comboloja.obterLojasSelecionadas(),
                    tipoData: Number(this.filtrosFormGroup.value.tipoData),
                    periodo: this.filtrosFormGroup.value.periodo.startDate != null ? this.filtrosFormGroup.value.periodo : null,
                    fornecedorId: Number(this.fornecedor.obterCodigoSelecionado()),
                    bancoId: this.banco.obterCodigoStringSelecionado(),
                    tipoDocumentoId: Number(this.tipodocumento.obterCodigoSelecionado()),
                    operacaoFinanceiraId: Number(this.operacaofinanceira.obterCodigoSelecionado()),
                    ccustoId: this.centrodecusto.obterCodigoStringSelecionado(),
                    contaId: Number(this.conta.obterCodigoSelecionado()),
                    tipoFornecedorId: this.tipofornecedor.obterCodigoSelecionado(),
                    numTit: this.filtrosFormGroup.value.numTit,
                    parcela: this.filtrosFormGroup.value.parcela,
                    nota: this.filtrosFormGroup.value.nota,
                    numCheque: this.filtrosFormGroup.value.numCheque,
                    impObs: 1, // default = 1 Imprime a Observação
                    pagarIds: [] // Passa um [] sem nada, só para não enviar null
                }

                this._financeiroService.gerarRelatorioFichaPagamento(requisicao, 'Ficha de Pagamento', visualizar);
            }
            else {

                let requisicao: RequisicaoRelatorioContasPagarModel = {
                    formato: formato,
                    lojaIds: this.comboloja.obterLojasSelecionadas(),
                    tipoData: Number(this.filtrosFormGroup.value.tipoData),
                    periodo: this.filtrosFormGroup.value.periodo.startDate != null ? this.filtrosFormGroup.value.periodo : null,
                    fornecedorId: Number(this.fornecedor.obterCodigoSelecionado()),
                    bancoId: this.banco.obterCodigoStringSelecionado(),
                    tipoDocumentoId: Number(this.tipodocumento.obterCodigoSelecionado()),
                    operacaoFinanceiraId: Number(this.operacaofinanceira.obterCodigoSelecionado()),
                    ccustoId: this.centrodecusto.obterCodigoStringSelecionado(),
                    contaId: Number(this.conta.obterCodigoSelecionado()),
                    tipoFornecedorId: this.tipofornecedor.obterCodigoSelecionado(),
                    numTit: this.filtrosFormGroup.value.numTit,
                    parcela: this.filtrosFormGroup.value.parcela,
                    nota: this.filtrosFormGroup.value.nota,
                    numCheque: this.filtrosFormGroup.value.numCheque,
                    situacao: this.filtrosFormGroup.value.situacao,
                    quebra: Number(this.filtrosFormGroup.value.quebra),
                    tipoDados: Number(this.filtrosFormGroup.value.tipoDados),
                }

                this._financeiroService.gerarRelatorioContasPagar(requisicao, 'Rel. Contas a Pagar', visualizar);
            }
        }
    }

    fecharJanela(): void {
        this.dialogRef.close();
    }

    private validarDados(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.comboloja.obterLojasSelecionadas().length == 0) {
            mensagemRetorno += "<br/>- O campo Loja é obrigatório";
            validado = false;
        }

        if (Number(this.fornecedor.obterCodigoSelecionado()) == 0
            && this.filtrosFormGroup.value.periodo.startDate == null
            && this.banco.obterCodigoStringSelecionado() == null
            && Number(this.tipodocumento.obterCodigoSelecionado()) == 0
            && Number(this.operacaofinanceira.obterCodigoSelecionado()) == 0
            && this.centrodecusto.obterCodigoStringSelecionado() == null) {

            mensagemRetorno += "<br/> É obrigatório informar ao menos um dos campos abaixo:"
                + "<br/> - Fornecedor"
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

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {

        this.definirDadosDefault();
    }
}