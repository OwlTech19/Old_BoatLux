import { Component, ViewEncapsulation, AfterViewInit, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { FormBuilder } from "@angular/forms";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import * as moment from 'moment';
import Swal from "sweetalert2";
// Services
import { FinanceiroService } from "../../../../services/financeiro.service";
import { LocalStorageService } from "../../../../services/local-storage.service";
import { UtilsService } from "../../../../services/utils.service";
// Components
import { ControlesBuscaRapidaComponent } from "../../../../controls/busca-rapida/busca-rapida.component";
import { ControlesLegendaComponent } from "../../../../controls/legenda/legenda.component";
import { ControlesImpressaoComprovanteComponent } from "../../../../controls/impressao-comprovante/impressao-comprovante.component";
// Interaces
import { ContasReceberModel, RequisicaoBaixarReceberPorValorModel, TitulosBaixaPorValorModel } from "../../../../interfaces/financeiro.interface";
import { Parametros } from "../../../../interfaces/uteis.interface";

// Constantes
const MODULO = "receber";

export interface BaixaContasReceberValor_DialogComponent_Data {
    titulos: ContasReceberModel[];
}

@Component({
    selector: 'baixa-contas-receber-valor-dialog',
    templateUrl: 'baixa-contas-receber-valor-dialog.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class BaixaContasReceberValor_DialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    
    constructor(
        public dialogRef: MatDialogRef<BaixaContasReceberValor_DialogComponent>,
        private _matDialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _localStorageService: LocalStorageService,
        private _financeiroService: FinanceiroService,
        private _utils: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: BaixaContasReceberValor_DialogComponent_Data) {

        const unique = (value, index, self) => {
            return self.indexOf(value) === index
        }

        this.lojasSelecionadas = this.data.titulos.map(i => Number(i.codLojaId)).filter(unique);

        data.titulos.forEach(i => {
            this.totalReceber += Number(i.valorReceber.toString().replace(/[^0-9,]*/g, '').replace(',', '.'));
        });

    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Propriedades injetadas
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('cliente') cliente: ControlesBuscaRapidaComponent;
    @ViewChild('conta') conta: ControlesBuscaRapidaComponent;
    @ViewChild('operacaofinanceira') operacaofinanceira: ControlesBuscaRapidaComponent;
    @ViewChild('formapg') formapg: ControlesBuscaRapidaComponent;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    // Tratamentos para o campo data
    locale: any = {
        format: 'YYYY-DD-MM',
        displayFormat: 'DD/MM/YYYY',
    };

    // Data mínima e máxima para Pagto
    minDate;
    maxDate;

    //Armazena os produtos em memória
    itensDataSource: MatTableDataSource<ContasReceberModel>;

    // Chave do cache de parâmetros
    private _keyParams = 'parametros';

    // Parâmetros - Melhoriar isso aqui, usar a interface de Parâmetros
    parametros: Parametros[] = [];
    configBaixa: string;
    totalReceber: number = 0;

    lojasSelecionadas: number[] = [];

    //Definição do formulário de baixa
    baixaFormGroup = this._formBuilder.group(
        {
            dtPagto: [],
            valorRecebido: [],
            numDocto: [],
            rbFormaVencto: [],
            desconto: [],
            tipoDesconto: [],
            acrescimo: [],
            tipoAcrescimo: [],
        }
    );

    //Colunas do grid
    colunasItens = ['codlojaid', 'receberid', 'numtit', 'parcela', 'dtemissao', 'dtvencto', 'valor', 'valorjuros', 'valormulta', 'valordesconto', 'valorreceber'];

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    obterMaskDesconto() {

        if (this.baixaFormGroup.value.tipoDesconto == 1)
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', min: 0, max: 100, allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    obterMaskAcrescimo() {
        if (this.baixaFormGroup.value.tipoAcrescimo == 1)
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', min: 0, max: 999, allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    exibeDesctoAcrescimo() {

        if (this.baixaFormGroup.value.valorRecebido == null)
            return false;

        if (this.baixaFormGroup.value.valorRecebido >= this.totalReceber) {
            return true;
        }
        else {
            this.baixaFormGroup.patchValue({
                desconto: '0',
                acrescimo: '0',
            });
            return false;
        }
    }

    desabilitaCampo(tipo: number) {
        switch (tipo) {
            case 1: // Desabilitar campo
                return 'none';
            case 2: // alterar opacidade
                return '0.6';
        }
    }

    pintarGrid() {

        var acumulador: number = 0;
        const valorRecebido: number = Number(this.baixaFormGroup.value.valorRecebido);

        this.itensDataSource.data.forEach(i => {

            i.baixaIntegral = false;
            i.baixaParcial = false;

            var valorTitulo = Number(i.valorReceber.toString().replace(/[^0-9,]*/g, '').replace(',', '.'));

            //if (valorTitulo > 0) {
            if (acumulador < valorRecebido && valorRecebido > 0) {

                acumulador += valorTitulo;
                var auxAcumulador = Number(acumulador.toFixed(2));

                if (auxAcumulador > valorRecebido) {
                    i.baixaParcial = true;
                    i.valorBaixa = valorTitulo - (auxAcumulador - valorRecebido);
                }
                else {
                    i.baixaIntegral = true;
                    i.valorBaixa = valorTitulo;
                }
            }
            //}
        });
    }

    baixarTitulos() {

        var titulosBaixar: TitulosBaixaPorValorModel[] = [];

        if (this.validarDados()) {

            Swal.fire({
                title: 'Tá quase...',
                html: 'Estamos baixando os títulos, aguarde...',
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }
            });

            this.itensDataSource.data.map(i => {
                if (i.baixaIntegral || i.baixaParcial) {
                    titulosBaixar.push({
                        receberId: i.receberId,
                        baixaIntegral: i.baixaIntegral,
                        baixaParcial: i.baixaParcial,
                        valorBaixa: i.valorBaixa,
                        valorReceber: Number(i.valorReceber.toString().replace(/[^0-9,]*/g, '').replace(',', '.')),
                    })
                }
            });

            if (titulosBaixar.length > 0) {

                let requisicao: RequisicaoBaixarReceberPorValorModel = {
                    dataPagto: this.baixaFormGroup.value.dtPagto.startDate.format('YYYY-MM-DD'),
                    valorRecebido: Number(this.baixaFormGroup.value.valorRecebido),
                    contaId: Number(this.conta.obterCodigoSelecionado()),
                    formaPgId: Number(this.formapg.obterCodigoSelecionado()),
                    operacaoFinanceiraId: Number(this.operacaofinanceira.obterCodigoSelecionado()),
                    numDocto: this.baixaFormGroup.value.numDocto,
                    formaVencto: Number(this.baixaFormGroup.value.rbFormaVencto),
                    desconto: Number(this.baixaFormGroup.value.desconto),
                    acrescimo: Number(this.baixaFormGroup.value.acrescimo),
                    tipoDesconto: Number(this.baixaFormGroup.value.tipoDesconto),
                    tipoAcrescimo: Number(this.baixaFormGroup.value.tipoAcrescimo),
                    titulos: titulosBaixar
                }

                this._financeiroService.baixarReceberPorValor(requisicao).subscribe(result => {

                    Swal.close();

                    if (result.emDebito) {

                        var clienteId = result.clienteId;

                        Swal.fire({
                            title: 'Atenção',
                            text: "O cliente " + result.clienteId + " está na lista de Clientes em Débito. Deseja retirá-lo?",
                            icon: 'info',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Sim, retirar!',
                            cancelButtonText: 'Não!',
                            reverseButtons: true
                        }).then((result) => {
                            if (result.value) {

                                this._financeiroService.retirarClienteEmDebito(clienteId).subscribe((result) => {

                                    Swal.fire('Sucesso!', 'Títulos baixados e cliente retirado da lista de débitos com sucesso!', 'success');

                                }, (err) => {
                                    Swal.fire('Ops!', 'Não foi possível remover o cliente da lista de Clientes em Débito. ' + err.error.Message, 'error');
                                });
                            }
                            else {

                                Swal.fire('Sucesso!', 'Títulos baixados com sucesso!', 'success');
                            }
                        })
                    }
                    else {

                        Swal.fire('Sucesso!', 'Títulos baixados com sucesso!', 'success');
                    }

                    Swal.fire({
                        title: 'Confirmação!',
                        text: "Deseja imprimir o comprovante?",
                        icon: 'info',
                        input: 'checkbox',
                        inputPlaceholder: 'Imprimir observação',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Sim!',
                        cancelButtonText: 'Não!'
                    }).then((result) => {
                        if (result.isConfirmed) {

                            this._matDialog.open(ControlesImpressaoComprovanteComponent, {
                                width: '339px',
                                height: '100vh',
                                data: {
                                    tituloIds: titulosBaixar.map(i => i.receberId),
                                    clienteIds: [this.cliente.obterCodigoSelecionado()],
                                    impObs: result.value,
                                    tipoComprovante: MODULO,
                                }
                            });
                        }
                    });

                    this.fecharJanela(true);

                }, (err) => {
                    Swal.fire('Ops!', 'Falha ao baixar títulos. Tente novamente.', 'error');
                });
            }
            else {
                Swal.fire('Ops!', 'Não encontramos título para realizar a baixa.', 'error');
            }
        }
    }

    fecharJanela(reload: boolean): void {
        this.dialogRef.close(reload);
    }

    private carregarDados() {

        // Carrega Grid
        this.itensDataSource = new MatTableDataSource<ContasReceberModel>(this.data.titulos);

        // Inicia o DataSource com Baixa Integral e Baixa Parcial = false, atualiza a data de vencimento no formato YYYY-MM-DD para ordenação
        this.itensDataSource.data.forEach(i => {
            i.dataDeVencimento = moment(i.dtVencto, 'DD-MM-YYYY').format('YYYY-MM-DD');
            i.baixaIntegral = false;
            i.baixaParcial = false;
        });

        // Ordena o Model baseado na data de vencimento
        this.itensDataSource.data.sort(function (a, b) {
            return a.dataDeVencimento < b.dataDeVencimento ? -1 : a.dataDeVencimento > b.dataDeVencimento ? 1 : 0;
        });

        // Atualiza a legenda
        this.legenda.quantidadeResultados = this.data.titulos.length;

        // Preenche dados do formulário automaticamente
        this.baixaFormGroup.patchValue({
            dtPagto: {
                startDate: new Date(),
            },
            valorRecebido: this.totalReceber,
            rbFormaVencto: this.configBaixa,
            tipoDesconto: "1",
            tipoAcrescimo: "1",

        });

        this.cliente.definirCodigoSelecionado(this.itensDataSource.data[0].codClieId);
        this.pintarGrid();
    }

    private carregarParametros() {
        let _parametros = this._localStorageService.get(this._keyParams);

        _parametros.forEach(i => {
            // Adiciona os parâmetros da Baixa de Contas a Receber
            this.parametros.push({
                lojaId: i.id,
                baixaRetroReceber: i.baixaRetroReceber,
                operacaoReceber: i.operacaoReceber,
                codContaReceber: i.codContaReceber,
                configBaixa: i.configBaixa,
            })
        });

        // Obtem parâmetros para o Baixa Contas a Receber por valor

        if (this.lojasSelecionadas.length > 1) {
            let parametrosLojaLogada = this.parametros.filter(i => i.lojaId = this._localStorageService.get('lojaLogada'));

            if (parametrosLojaLogada[0].operacaoReceber != null)
                this.operacaofinanceira.definirCodigoSelecionado(parametrosLojaLogada[0].operacaoReceber);
            if (parametrosLojaLogada[0].codContaReceber != null)
                this.conta.definirCodigoSelecionado(parametrosLojaLogada[0].codContaReceber);

            this.configBaixa = parametrosLojaLogada[0].configBaixa === 'A' ? '2' : '1';

            // Define Min e Max Date
            this.minDate = this._utils.obterMinDatePagto(this._localStorageService.get('lojaLogada'));
            this.maxDate = this._utils.obterMaxDatePagto(this._localStorageService.get('lojaLogada'));

        }
        else {

            this.configBaixa = this.parametros[0].configBaixa === 'A' ? '2' : '1';

            if (this.parametros[0].operacaoReceber != null)
                this.operacaofinanceira.definirCodigoSelecionado(this.parametros[0].operacaoReceber);
            if (this.parametros[0].codContaReceber != null)
                this.conta.definirCodigoSelecionado(this.parametros[0].codContaReceber);

            // Define Min e Max Date
            this.minDate = this._utils.obterMinDatePagto(this.lojasSelecionadas[0]);
            this.maxDate = this._utils.obterMaxDatePagto(this.lojasSelecionadas[0]);
        }
    }

    private validarDados(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.conta.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Conta";
            validado = false;
        }

        if (this.formapg.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Forma de Pagamento";
            validado = false;
        }

        if (this.operacaofinanceira.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Operações Financeiras";
            validado = false;
        }

        if (Number(this.baixaFormGroup.value.valorRecebido) <= 0) {
            mensagemRetorno += "<br/>- Valor a Receber deve ser maior que R$0,00";
            validado = false;
        }

        // Desconto por percentual, verifica se é menor que 100%
        if (Number(this.baixaFormGroup.value.tipoDesconto) == 1 && Number(this.baixaFormGroup.value.desconto > 100)) {
            mensagemRetorno += "<br/>- Desconto inválido. O percentual máximo é 100%";
            validado = false;
        }

        // Desconto por valor, verifica se é menor que o valor recebido
        if (Number(this.baixaFormGroup.value.tipoDesconto) == 2 && Number(this.baixaFormGroup.value.desconto) > this.totalReceber) {
            mensagemRetorno += "<br/>- Desconto inválido. O valor de desconto deve ser menor que R$" + this.totalReceber;
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigatórios para baixa o título: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {

        this.carregarParametros();
        this.carregarDados();

        this.itensDataSource.sort = this.sort;

    }
}