import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, RequiredValidator, Validators } from '@angular/forms';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { RequisicaoBuscaPedidosComprasModel, ItemBuscaPedidosComprasModel, ResultadoBuscaPedidosComprasModel, RequisicaoBaixaPedidosComprasModel, RequisicaoAberturaPedidosComprasModel, RequisicaoRelatorioPreviaComprasModel, RequisicaoRelatorioItensMaisMenosComprados, RequisicaoRelatorioComprasConsumo } from '../../../interfaces/compras.interface';
import Swal from 'sweetalert2'
import { ComprasService } from '../../../services/compras.service';
import { DialogService } from '../../../services/dialog.service';
import { ControlesBuscaRapidaComponent } from '../../../controls/busca-rapida/busca-rapida.component';
import { ControlesComboLojaComponent } from '../../../controls/combo-loja/combo-loja.component';
import { ComponentService, Modulos } from '../../../services/component.service';
import * as moment from 'moment';

@Component({
    selector: 'relatorio-compras-consumo',
    templateUrl: './relatorio-compras-consumo.component.html',
    encapsulation: ViewEncapsulation.None
})

export class RelatorioComprasConsumoComponent implements OnInit, OnDestroy, AfterViewInit {


    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        private _formBuilder: FormBuilder,
        private _dialogService: DialogService,
        private _comprasService: ComprasService,
        private _componentService: ComponentService
    ) {
        _componentService.DefinirModuloAtual(Modulos.Compras);
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Componentes
    @ViewChild('comboloja') comboloja: ControlesComboLojaComponent;
    @ViewChild('centroreceitaproduto') centroreceitaproduto: ControlesBuscaRapidaComponent;
    @ViewChild('grupoproduto') grupoproduto: ControlesBuscaRapidaComponent;
    @ViewChild('categoriaproduto') categoriaproduto: ControlesBuscaRapidaComponent;
    @ViewChild('familiaproduto') familiaproduto: ControlesBuscaRapidaComponent;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('produto') produto: ControlesBuscaRapidaComponent;

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
            comboloja: [],
            primeiroPeriodo: [],
            segundoPeriodo: [],
            terceiroPeriodo: [],
            fornecedor: [],
            centroreceitaproduto: [],
            grupoproduto: [],
            categoriaproduto: [],
            familiaproduto: [],
            chkVerZerado: [],
            chkVerMin: [],
            rbOrdenacao: []
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    
    imprimirBusca(formato: number, visualizar: boolean = false): void {

        if (this.validarFiltros()) {

            if (this.filtrosFormGroup.value.primeiroPeriodo.startDate != null) {
                this.filtrosFormGroup.patchValue({
                    primeiroPeriodo: {
                        startDate: this.filtrosFormGroup.value.primeiroPeriodo.startDate.format('YYYY-MM-DD'),
                        endDate: this.filtrosFormGroup.value.primeiroPeriodo.endDate.format('YYYY-MM-DD'),
                    }
                })
            }

            if (this.filtrosFormGroup.value.segundoPeriodo.startDate != null) {
                this.filtrosFormGroup.patchValue({
                    segundoPeriodo: {
                        startDate: this.filtrosFormGroup.value.segundoPeriodo.startDate.format('YYYY-MM-DD'),
                        endDate: this.filtrosFormGroup.value.segundoPeriodo.endDate.format('YYYY-MM-DD'),
                    }
                })
            }

            if (this.filtrosFormGroup.value.terceiroPeriodo.startDate != null) {
                this.filtrosFormGroup.patchValue({
                    terceiroPeriodo: {
                        startDate: this.filtrosFormGroup.value.terceiroPeriodo.startDate.format('YYYY-MM-DD'),
                        endDate: this.filtrosFormGroup.value.terceiroPeriodo.endDate.format('YYYY-MM-DD'),
                    }
                })
            }

            let requisicao: RequisicaoRelatorioComprasConsumo =
            {
                formato: formato,
                lojas: this.comboloja.obterLojasSelecionadas(),
                primeiroPeriodo: this.filtrosFormGroup.value.primeiroPeriodo,
                segundoPeriodo: this.filtrosFormGroup.value.segundoPeriodo.startDate != null ? this.filtrosFormGroup.value.segundoPeriodo : null,
                terceiroPeriodo: this.filtrosFormGroup.value.terceiroPeriodo.startDate != null ? this.filtrosFormGroup.value.terceiroPeriodo : null,
                centroReceita: Number(this.centroreceitaproduto.obterCodigoSelecionado()),
                grupo: Number(this.grupoproduto.obterCodigoSelecionado()),
                categoria: Number(this.categoriaproduto.obterCodigoSelecionado()),
                familia: Number(this.familiaproduto.obterCodigoSelecionado()),
                fornecedor: Number(this.fornecedor.obterCodigoSelecionado()),
                produto: Number(this.produto.obterCodigoSelecionado()),
                verMin: Number(this.filtrosFormGroup.value.chkVerMin),
                verZerado: Number(this.filtrosFormGroup.value.chkVerZerado),
                ordenacao: Number(this.filtrosFormGroup.value.rbOrdenacao),
            };

            this._comprasService.gerarRelatorioComprasConsumo(requisicao, 'Relatório Compras/Consumo', visualizar);
        }
    }

    definirDadosPadraofiltrosFormGroup(): void {
        this.filtrosFormGroup.reset({
            primeiroPeriodo: {
                startDate: moment(new Date(new Date().setDate(new Date().getDate() - 30))).format('YYYY-MM-DD'),
                endDate: moment(new Date(new Date().setDate(new Date().getDate() - 20))).format('YYYY-MM-DD')
            },
            segundoPeriodo: {
                startDate: moment(new Date(new Date().setDate(new Date().getDate() - 19))).format('YYYY-MM-DD'),
                endDate: moment(new Date(new Date().setDate(new Date().getDate() - 10))).format('YYYY-MM-DD')
            },
            terceiroPeriodo: {
                startDate: moment(new Date(new Date().setDate(new Date().getDate() - 9))).format('YYYY-MM-DD'),
                endDate: moment(new Date()).format('YYYY-MM-DD')
            },

            chkVerZerado: '',
            chkVerMin: '',
            rbOrdenacao: '1'
        });

        this.centroreceitaproduto.limpar();
        this.grupoproduto.limpar();
        this.categoriaproduto.limpar();
        this.familiaproduto.limpar();
        this.fornecedor.limpar();
        this.produto.limpar();
    }

    validarFiltros(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.comboloja.obterLojasSelecionadas().length == 0) {
            mensagemRetorno += "<br/>- Selecione pelo menos uma loja"
            validado = false;
        }

        if (this.filtrosFormGroup.value.primeiroPeriodo.startDate == null || this.filtrosFormGroup.value.primeiroPeriodo.endDate == null) {
            mensagemRetorno += "<br/>- Selecione o primeiro período"
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os filtros obrigatórios e tente novamente: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.definirDadosPadraofiltrosFormGroup();
    }

    ngOnDestroy(): void {
    }
}