import { AfterViewInit, Component, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import * as moment from 'moment';
import Swal from "sweetalert2";
// Services
import { FuseNavigationService } from "../../../../@fuse/components/navigation/navigation.service";
import { FinanceiroService } from "../../../services/financeiro.service";
import { UsuarioService } from "../../../services/usuario-service.service";
// Components
import { ControlesComboLojaComponent } from "../../../controls/combo-loja/combo-loja.component";
import { ControlesBuscaRapidaComponent } from "../../../controls/busca-rapida/busca-rapida.component";
// Interfaces
import { RequisicaoRelFluxoCaixaModel } from "../../../interfaces/financeiro.interface";

@Component({
    selector: 'relatorio-fluxo-caixa',
    templateUrl: './relatorio-fluxo-caixa.component.html',
    encapsulation: ViewEncapsulation.None
})

export class RelatorioFluxoCaixaComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------
    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _formBuilder: FormBuilder,
        private _financeiroService: FinanceiroService,
        public _usuario: UsuarioService,
        private _router: Router,
    ) {
        // Define o menu de navegação
        this._fuseNavigationService.setCurrentNavigation('financeiro_navigation');

        // check user permission
        if (!_usuario.checkPermissionControl('262', 'acessar'))
            this._router.navigate(['access-denied']);
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    @ViewChild('comboloja') comboloja: ControlesComboLojaComponent;
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

    // Controle de exibição e bloqueio dos campos
    desabilitaSaldo = true;
    opacity = '0.6';
    exibeIncTitVencidos = false;
    exibeIncObservacao = false;


    //Definição do formulário de filtros
    filtrosFormGroup = this._formBuilder.group(
        {
            tipoData: [],
            periodo: [],
            saldoInicial: [],
            tipoDados: [],
            incluirVencidos: [],
            incluirObservacao: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Ao selecionar lojas, recarregar o buscador de conta
    aoSelecionarLoja() {

        this.conta.definirParametros(this.comboloja.obterLojasSelecionadas());
        this.verificaSaldoInicial();
    }

    verificaSaldoInicial() {

        // O TimeOut é para carregar a Conta
        setTimeout(() => {

            if (Number(this.conta.obterCodigoSelecionado()) > 0 && this.comboloja.obterLojasSelecionadas().length == 1) {

                this.desabilitaSaldo = false;
                this.opacity = '1';
            }
            else {

                this.desabilitaSaldo = true;
                this.opacity = '0.6';

                this.filtrosFormGroup.patchValue({
                    saldoInicial: 0.00,
                })
            }
        }, 600);
    }

    ocultaIncVencidos(): boolean {
        // Oculta quando diferente de resumido
        if (this.filtrosFormGroup.value.tipoDados == 3) {

            this.filtrosFormGroup.patchValue({
                incluirVencidos: null,
            });

            return true;
        }
        else
            return false;
    }

    ocultaObservacao(): boolean {
        // Oculta quando diferente de aberto
        if (this.filtrosFormGroup.value.tipoDados != 1) {

            this.filtrosFormGroup.patchValue({
                incluirObservacao: null,
            });

            return true;
        }
        else
            return false;
    }

    definirDadosPadrao(): void {

        this.filtrosFormGroup.patchValue({
            periodo: {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30))
            },
            tipoData: '1',
            saldoInicial: 0.00,
            tipoDados: '1',
            incluirVencidos: null,
            incluirObservacao: null,

        });

        this.conta.limpar();
        this.verificaSaldoInicial();
    }

    imprimir(formato: number, visualizar: boolean = false): void {

        if (this.comboloja.obterLojasSelecionadas().length > 0) {

            if (this.filtrosFormGroup.value.periodo.startDate != null) {
                this.filtrosFormGroup.patchValue({
                    periodo: {
                        startDate: this.filtrosFormGroup.value.periodo.startDate.format('YYYY-MM-DD'),
                        endDate: this.filtrosFormGroup.value.periodo.endDate.format('YYYY-MM-DD'),
                    }
                })
            }

            let requisicao: RequisicaoRelFluxoCaixaModel = {
                formato: formato,
                lojaIds: this.comboloja.obterLojasSelecionadas(),
                tipoData: Number(this.filtrosFormGroup.value.tipoData),
                periodo: this.filtrosFormGroup.value.periodo.startDate != null ? this.filtrosFormGroup.value.periodo : null,
                contaId: Number(this.conta.obterCodigoSelecionado()),
                saldoInicial: Number(this.filtrosFormGroup.value.saldoInicial),
                tipoDados: Number(this.filtrosFormGroup.value.tipoDados),
                incluirVencidos: Number(this.filtrosFormGroup.value.incluirVencidos),
                incluirObservacao: Number(this.filtrosFormGroup.value.incluirObservacao),
            }

            this._financeiroService.gerarRelatorioFluxoCaixa(requisicao, 'Fluxo de Caixa', visualizar);
        }
        else {
            Swal.fire('Atenção!', 'Informe uma ou mais lojas para imprimir o relatório.', 'warning');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos do ciclo de vida
    // -----------------------------------------------------------------------------------------------------
    ngAfterViewInit(): void {

        this.definirDadosPadrao();
    }

}