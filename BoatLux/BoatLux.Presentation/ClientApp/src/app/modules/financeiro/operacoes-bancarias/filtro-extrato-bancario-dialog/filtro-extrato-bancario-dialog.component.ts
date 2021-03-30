import { Component, AfterViewInit, Inject, ViewChild } from "@angular/core";
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
import { RequisicaoRelExtratoBancarioModel } from "../../../../interfaces/financeiro.interface";


@Component({
    selector: 'filtro-extrato-bancario-dialog',
    templateUrl: './filtro-extrato-bancario-dialog.component.html',
})

export class FiltroExtratoBancario_DialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<FiltroExtratoBancario_DialogComponent>,
        private _financeiroService: FinanceiroService,
        private _formBuilder: FormBuilder,
        ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    @ViewChild('comboLoja') comboloja: ControlesComboLojaComponent;
    @ViewChild('conta') conta: ControlesBuscaRapidaComponent;

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
            saldoInicial: [],
            tipoDados: [],
            lancamentos: [],
            ordemImpressao: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Ao selecionar loja, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.conta.definirParametros(this.comboloja.obterLojasSelecionadas());
    }

    definirDadosDefault(): void {

        this.filtrosFormGroup.patchValue({
            periodo: {
                startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
                endDate: new Date()
            },
            tipoData: '1',
            saldoInicial: null,
            tipoDados: '1',
            lancamentos: '1',
            ordemImpressao: '1',
            
        });

        this.conta.limpar();
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

            let requisicao: RequisicaoRelExtratoBancarioModel = {
                formato: formato,
                lojaIds: this.comboloja.obterLojasSelecionadas(),
                tipoData: Number(this.filtrosFormGroup.value.tipoData),
                periodo: this.filtrosFormGroup.value.periodo.startDate != null ? this.filtrosFormGroup.value.periodo : null,
                contaId: Number(this.conta.obterCodigoSelecionado()),
                saldoInicial: Number(this.filtrosFormGroup.value.saldoInicial),
                tipoDados: Number(this.filtrosFormGroup.value.tipoDados),
                lancamentos: Number(this.filtrosFormGroup.value.lancamentos),
                ordemImpressao: Number(this.filtrosFormGroup.value.ordemImpressao),
            }

            this._financeiroService.gerarRelatorioExtratoBancario(requisicao, 'Extrato Bancário', visualizar);
        }
        
    }

    fecharJanela(): void {
        this.dialogRef.close();
    }

    private validarDados(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.comboloja.obterLojasSelecionadas().length == 0) {
            mensagemRetorno += "<br/>- Informe ao menos uma Loja";
            validado = false;
        }

        if (this.conta.obterCodigoSelecionado() == null) {

            mensagemRetorno += "<br/>- Informe a conta";
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