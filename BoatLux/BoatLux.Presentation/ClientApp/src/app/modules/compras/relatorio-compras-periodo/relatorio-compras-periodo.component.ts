import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, RequiredValidator, Validators } from '@angular/forms';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { RequisicaoBuscaPedidosComprasModel, ItemBuscaPedidosComprasModel, ResultadoBuscaPedidosComprasModel, RequisicaoBaixaPedidosComprasModel, RequisicaoAberturaPedidosComprasModel, RequisicaoRelatorioPreviaComprasModel, RequisicaoRelatorioComprasPeriodo } from '../../../interfaces/compras.interface';
import Swal from 'sweetalert2'
import { ComprasService } from '../../../services/compras.service';
import { DialogService } from '../../../services/dialog.service';
import { ControlesBuscaRapidaComponent } from '../../../controls/busca-rapida/busca-rapida.component';
import { ControlesComboLojaComponent } from '../../../controls/combo-loja/combo-loja.component';
import { ComponentService, Modulos } from '../../../services/component.service';
import * as moment from 'moment';

@Component({
    selector: 'relatorio-compras-periodo',
    templateUrl: './relatorio-compras-periodo.component.html',
    encapsulation: ViewEncapsulation.None
})

export class RelatorioComprasPeriodoComponent implements OnInit, OnDestroy, AfterViewInit {


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
    @ViewChild('comprador') comprador: ControlesBuscaRapidaComponent;

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
            periodo: [],
            fornecedor: [],
            produto: [],
            comprador: [],
            centroreceitaproduto: [],
            grupoproduto: [],
            categoriaproduto: [],
            familiaproduto: [],
            tipo: [],
            quebra: []
        }
    );
    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Ao selecionar lojas, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.comprador.definirParametros(this.comboloja.obterLojasSelecionadas());
    }

    imprimirBusca(formato: number, visualizar: boolean = false): void {

        if (this.validarFiltros()) {

            if (this.filtrosFormGroup.value.periodo.startDate != null) {
                this.filtrosFormGroup.patchValue({
                    periodo: {
                        startDate: this.filtrosFormGroup.value.periodo.startDate.format('YYYY-MM-DD'),
                        endDate: this.filtrosFormGroup.value.periodo.endDate.format('YYYY-MM-DD'),
                    }
                })
            }

            let requisicao: RequisicaoRelatorioComprasPeriodo =
            {
                formato: formato,
                lojas: this.comboloja.obterLojasSelecionadas(),
                periodo: this.filtrosFormGroup.value.periodo,
                fornecedor: Number(this.fornecedor.obterCodigoSelecionado()),
                produto: Number(this.produto.obterCodigoSelecionado()),
                comprador: Number(this.comprador.obterCodigoSelecionado()),
                centroReceita: Number(this.centroreceitaproduto.obterCodigoSelecionado()),
                grupo: Number(this.grupoproduto.obterCodigoSelecionado()),
                categoria: Number(this.categoriaproduto.obterCodigoSelecionado()),
                familia: Number(this.familiaproduto.obterCodigoSelecionado()),
                tipo: Number(this.filtrosFormGroup.value.tipo),
                quebra: Number(this.filtrosFormGroup.value.quebra)
            };

            this._comprasService.gerarRelatorioComprasPeriodo(requisicao, 'Relatório Compras/Período', visualizar);
        }
    }

    definirDadosPadraofiltrosFormGroup(): void {
        this.filtrosFormGroup.reset({
            periodo: {
                startDate: moment(new Date()).format('YYYY-MM-DD'),
                endDate: moment(new Date()).format('YYYY-MM-DD')
            },

            tipo: '1',
            quebra: '1'

        });

        this.centroreceitaproduto.limpar();
        this.grupoproduto.limpar();
        this.categoriaproduto.limpar();
        this.familiaproduto.limpar();
        this.fornecedor.limpar();
        this.produto.limpar();
        this.comprador.limpar();
    }

    validarFiltros(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.comboloja.obterLojasSelecionadas().length == 0) {
            mensagemRetorno += "<br/>- Selecione pelo menos uma loja"
            validado = false;
        }


        if (this.filtrosFormGroup.value.periodo.startDate == null || this.filtrosFormGroup.value.periodo.endDate == null) {
            mensagemRetorno += "<br/>- Selecione o período"
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