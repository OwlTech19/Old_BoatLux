import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { ComprasService } from '../../../../services/compras.service';
import { ControlesComboLojaComponent } from '../../../../controls/combo-loja/combo-loja.component';
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import * as moment from 'moment';
import { RequisicaoRelatorioTrocasComprasModel } from '../../../../interfaces/compras.interface';

export interface ControlesFiltroRelTrocasComprasComponentData {

}

@Component({
    selector: 'filtro-rel-trocas-compras',
    templateUrl: './filtro-rel-trocas-compras-dialog.component.html'
})

export class ControlesFiltroRelTrocasComprasComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<ControlesFiltroRelTrocasComprasComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ControlesFiltroRelTrocasComprasComponentData,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService) {

    }
    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Componentes
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('centroreceitaproduto') centroreceitaproduto: ControlesBuscaRapidaComponent;
    @ViewChild('grupoproduto') grupoproduto: ControlesBuscaRapidaComponent;
    @ViewChild('categoriaproduto') categoriaproduto: ControlesBuscaRapidaComponent;
    @ViewChild('familiaproduto') familiaproduto: ControlesBuscaRapidaComponent;

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
    filtrosFormGroup = this._formBuilder.group(
        {
            trocaIni: [],
            trocaFim: [],
            opcaoTipoData: [],
            periodoTroca: [],
            tipoRelatorio: [],
            situacao: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    imprimirBusca(formato: number, visualizar: boolean = false): void {

        if (this.validarFiltros()) {

            if (this.filtrosFormGroup.value.periodoTroca.startDate != null) {
                this.filtrosFormGroup.patchValue({
                    periodoTroca: {
                        startDate: this.filtrosFormGroup.value.periodoTroca.startDate.format('YYYY-MM-DD'),
                        endDate: this.filtrosFormGroup.value.periodoTroca.endDate.format('YYYY-MM-DD'),
                    }
                })
        
            }
        
            let requisicao: RequisicaoRelatorioTrocasComprasModel =
            {
                formato: formato,
                lojas: this.comboLoja.obterLojasSelecionadas(),
                trocaIni: Number(this.filtrosFormGroup.value.trocaIni),
                trocaFim: Number(this.filtrosFormGroup.value.trocaFim),
                fornecedor: this.fornecedor.obterCodigoSelecionado(),
                centroReceita: this.centroreceitaproduto.obterCodigoSelecionado(),
                grupo: this.grupoproduto.obterCodigoSelecionado(),
                categoria: this.categoriaproduto.obterCodigoSelecionado(),
                familia: this.familiaproduto.obterCodigoSelecionado(),
                periodoTroca: this.filtrosFormGroup.value.periodoTroca.startDate != null ? this.filtrosFormGroup.value.periodoTroca : null,
                opcaoTipoData: Number(this.filtrosFormGroup.value.opcaoTipoData),
                tipoRelatorio: Number(this.filtrosFormGroup.value.tipoRelatorio),
                situacao: Number(this.filtrosFormGroup.value.situacao),
            };
        
            this._comprasService.gerarRelatorioTrocasCompras(requisicao, 'Relatório Trocas de Compras', visualizar);
        }
    }

    definirDadosPadrao(): void {
        this.filtrosFormGroup.reset({
            periodoTroca: {
               startDate: moment().format('YYYY-MM-DD'),
               endDate: moment().format('YYYY-MM-DD')
           },
            trocaIni: '',
            trocaFim: '',
            opcaoTipoData: '1',
            tipoRelatorio: '1',
            situacao: '1',
       });

        this.fornecedor.limpar();
        this.centroreceitaproduto.limpar();
        this.grupoproduto.limpar();
        this.categoriaproduto.limpar();
        this.familiaproduto.limpar();
    }

    validarFiltros(): boolean {
       let validado: boolean = true;
       let mensagemRetorno: string = "";
    
       if (this.comboLoja.obterLojasSelecionadas().length == 0) {
           mensagemRetorno += "<br/>- Selecione pelo menos uma loja"
           validado = false;
       }

        if (Number(this.filtrosFormGroup.value.trocaIni) > Number(this.filtrosFormGroup.value.trocaFim)) {
           mensagemRetorno += "<br/>- Filtro de trocas inválido. O ID troca inicial deve ser maior ou igual ao ID troca final";
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
