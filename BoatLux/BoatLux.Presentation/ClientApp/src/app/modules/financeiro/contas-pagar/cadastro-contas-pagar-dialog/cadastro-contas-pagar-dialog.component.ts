import { AfterViewInit, Component, ViewChild, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material/dialog";
import * as moment from 'moment';
import Swal from "sweetalert2";
import { isUndefined } from "util";
// Services
import { FinanceiroService } from "../../../../services/financeiro.service";
import { LocalStorageService } from "../../../../services/local-storage.service";
import { UtilsService } from "../../../../services/utils.service";
// Components
import { ControlesComboLojaComponent } from "../../../../controls/combo-loja/combo-loja.component";
import { ControlesBuscaRapidaComponent } from "../../../../controls/busca-rapida/busca-rapida.component";
import { BaixaContasPagarMultiplos_DialogComponent } from "../../baixa-contas-pagar/baixa-contas-pagar-multiplos-dialog/baixa-contas-pagar-multiplos-dialog.component";
// Interfaces
import { Parametros } from "../../../../interfaces/uteis.interface";
import { RequisicaoSalvarContasPagarModel } from "../../../../interfaces/financeiro.interface";

export interface CadastroContasPagar_DialogComponent_Data {
    idTitulo?: number;
    situacao?: string;
    apenasConsulta?: boolean;
}

@Component({
    selector: 'cadastro-contas-pagar-dialog',
    templateUrl: './cadastro-contas-pagar-dialog.component.html',
})

export class CadastroContasPagar_DialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    
    constructor(
        public dialogRef: MatDialogRef<CadastroContasPagar_DialogComponent>,
        private _matDialog: MatDialog,
        private _financeiroService: FinanceiroService,
        private _localStorageService: LocalStorageService,
        private _formBuilder: FormBuilder,
        public _utils: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: CadastroContasPagar_DialogComponent_Data) {

        this.apenasConsulta = !isUndefined(data.apenasConsulta) ? data.apenasConsulta : false;
        this.situacao = data.situacao;
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Propriedades injetadas
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('banco') banco: ControlesBuscaRapidaComponent;
    @ViewChild('tipodocumento') tipodocumento: ControlesBuscaRapidaComponent;
    @ViewChild('operacaofinanceira') operacaofinanceira: ControlesBuscaRapidaComponent;
    @ViewChild('centrodecusto') centrodecusto: ControlesBuscaRapidaComponent;
    @ViewChild('conta') conta: ControlesBuscaRapidaComponent;

    // Tratamentos para o campo validade da cotação
    locale: any = {
        format: 'YYYY-DD-MM',
        displayFormat: 'DD/MM/YYYY',
    };

    minDate: moment.Moment = moment();

    // Chave do cache de parâmetros
    private _keyParams = 'parametros';

    // Parâmetros - Melhoriar isso aqui, usar a interface de Parâmetros
    parametros: Parametros[] = [];

    // Propriedades
    idTitulo: number;
    apenasConsulta: boolean = false;
    situacao: string;
    acao: number;
    titulo: string;
    exibeSalvar: boolean = true;
    exibeJaPago: boolean = true;
    exibeBaixaPrimeiraParcela: boolean = false; // Inicia desabilitado
    pointerEvents: string = 'auto'; // Bloqueia os campos
    opacity: string = '1';

    //Definição do formulário de cadastro
    cadastroFormGroup = this._formBuilder.group(
        {
            numtitulo: [],
            nota: [],
            dtEntrada: [],
            dtEmissao: [],
            diasVencto: [],
            dtVencto: [],
            valor: [],
            parcela: [],
            valTitulosProvisionados: [],
            desconto: [],
            tipoDesconto: [],
            juros: [],
            tipoJuros: [],
            multa: [],
            tipoMulta: [],
            numCheque: [],
            observacao: [],
            chkJaPago: [],
            chkBaixaPrimeiraParcela: [],
            chkEntradaIgualVencimento: [],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Ao selecionar loja, recarregar dados
    aoSelecionarLoja() {
        this.exibeJaPago = this.exibeJaPago = this._utils.lerParam('liberaPagar', this.comboLoja.obterLojaSelecionada()) != 'S' ? true : false;
    }

    verificarExibeBaixaPrimeiraParcela() {
        this.exibeBaixaPrimeiraParcela = this.cadastroFormGroup.value.parcela > 1 && this.exibeJaPago && Number(this.cadastroFormGroup.value.chkJaPago) > 0 ? true : false;
    }

    exibeChkEntradaIgualVencimento(): boolean {
        if (this.cadastroFormGroup.value.parcela > 1 && this.acao == 1) {
            return true;
        }
    }

    desabilitaCampo(tipo: number) {
        if (this.situacao != 'Aberto' || this.apenasConsulta) {
            switch (tipo) {
                case 1: // Desabilitar campo
                    return 'none';
                case 2: // alterar opacidade
                    return '0.6';
            }
        }
    }

    validarValorNegativo(tipo: number) {

        if (this.cadastroFormGroup.value.valor < 0) {
            this.cadastroFormGroup.patchValue({
                desconto: 0,
                juros: 0,
                multa: 0,
            });
        }

        switch (tipo) {
            case 1: // Desabilitar campo
                if (this.cadastroFormGroup.value.valor < 0) // Agrupamento ou consulta
                    return 'none';
                else
                    return 'auto';

            case 2: // alterar opacidade
                if (this.cadastroFormGroup.value.valor < 0) // Agrupamento ou consulta
                    return '0.6';
                else
                    return '1';
            default:
        }
    }

    obterMascara(tipo: number) {
        switch (tipo) {
            case 1:
                return this._utils.maskDesconto(this.cadastroFormGroup.value.tipoDesconto);
            case 2:
                return this._utils.maskDesconto(this.cadastroFormGroup.value.tipoJuros);
            case 3:
                return this._utils.maskDesconto(this.cadastroFormGroup.value.tipoMulta);
        }
    }

    gerarNumTitulo(): void {
        /* Esse cálculo não verifica informação no banco de dados.
         * Confirmar depois como é pra fazer, se mantem o padrão anterior ou cria outro
         */
        var dia = Number(moment(new Date()).format('DD'));
        var mes = Number(moment(new Date()).format('MM'));
        var minuto = new Date().getMinutes() ? new Date().getMinutes() : 1;
        var hora = new Date().getHours() ? new Date().getHours() : 1;
        var miliSegundos = new Date().getMilliseconds() ? new Date().getMilliseconds() : 1;

        var numTitCalculado = dia * mes * minuto * hora * miliSegundos;

        this.cadastroFormGroup.controls['numtitulo'].setValue(numTitCalculado);
    }

    calcularDataVencimento(): void {
        var new_date = moment(this.cadastroFormGroup.value.dtEmissao.startDate.format('YYYY-MM-DD')).add(this.cadastroFormGroup.value.diasVencto, 'days');

        this.cadastroFormGroup.patchValue(
            {
                dtVencto: {
                    startDate: new_date,
                }
            });
    }

    calcularDiasVencto(): void {
        var dtEmissao = moment(this.cadastroFormGroup.value.dtEmissao.startDate.format('YYYY-MM-DD'));
        var dtVencto = moment(this.cadastroFormGroup.value.dtVencto.startDate.format('YYYY-MM-DD'));

        this.cadastroFormGroup.patchValue(
            {
                diasVencto: dtVencto.diff(dtEmissao, 'days')
            });

        // Atualiza o MinDate
        this.minDate = moment(dtEmissao);
    }

    novoItem() {
        this.titulo = "Inclusão de título a pagar";
        this.acao = 1;
        this.idTitulo = 0;

        this.carregarDadosPadrao();
    }

    editarItem(idTitulo: number) {
        this.acao = 2;
        this.idTitulo = idTitulo;
        // Bloqueia campos na edição
        this.pointerEvents = 'none';
        this.opacity = '0.6';

        this.carregarTituloPagar(idTitulo);

        if (this.situacao != 'Aberto' || this.apenasConsulta) {
            this.titulo = "Consulta de título a pagar #" + idTitulo;
            this.exibeSalvar = false;
        }

        else {
            this.titulo = "Alteração de título a pagar #" + idTitulo;
        }
    }

    carregarTituloPagar(id: number) {

        this._financeiroService.obterDadosTituloPagar(id).subscribe(resultado => {

            //Carrega os dados do formulário
            this.cadastroFormGroup.patchValue(
                {
                    dtEntrada: {
                        startDate: resultado.dtEntrada
                    },
                    dtEmissao: {
                        startDate: resultado.dtEmissao
                    },
                    dtVencto: {
                        startDate: resultado.dtVencto
                    },
                    numtitulo: resultado.numTit.trim(),
                    nota: resultado.nota,


                    numCheque: resultado.numCheque,
                    valor: resultado.valor,

                    parcela: 1,
                    desconto: resultado.desconto,
                    juros: resultado.juros,
                    multa: resultado.multa,
                    observacao: resultado.observacao,
                    chkJaPago: 0,
                    tipoDesconto: resultado.tipoDesconto.toString(),
                    tipoJuros: resultado.tipoJuros.toString(),
                    tipoMulta: resultado.tipoMulta.toString(),
                    chkBaixaPrimeiraParcela: 0,
                    chkEntradaIgualVencimento: 0,
                });

            //Carrega o buscarápida
            this.comboLoja.definirLojaSelecionada(resultado.codLojaId);
            this.fornecedor.definirCodigoSelecionado(resultado.codFornecId);
            this.tipodocumento.definirCodigoSelecionado(resultado.codTipoDocId);
            this.operacaofinanceira.definirCodigoSelecionado(resultado.codOperacaoFinanceiraId);
            this.centrodecusto.definirCodigoSelecionado(resultado.codCCustoId);
            this.banco.definirCodigoSelecionado(resultado.codBancoId);
            this.conta.definirCodigoSelecionado(resultado.codContaId);

            this.calcularDiasVencto();
        });
    }

    salvarTitulo() {

        if (this.validarDados()) {

            Swal.fire({
                title: 'Tá quase...',
                html: 'Estamos criando o título a pagar, aguarde...',
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }
            });

            let requisicao: RequisicaoSalvarContasPagarModel =
            {
                parcela: String(this.cadastroFormGroup.value.parcela),
                valTitulosProvisionados: Number(this.cadastroFormGroup.value.valTitulosProvisionados),
                dtEntradaIgualDtVencto: Number(this.cadastroFormGroup.value.chkEntradaIgualVencimento),
                item: {

                    codPagarId: this.idTitulo,
                    codLojaId: Number(this.comboLoja.obterLojaSelecionada()),
                    numTit: String(this.cadastroFormGroup.value.numtitulo),
                    nota: this.cadastroFormGroup.value.nota,
                    codFornecId: Number(this.fornecedor.obterCodigoSelecionado()),
                    codBancoId: this.banco.obterCodigoStringSelecionado().trim(),
                    codTipoDocId: Number(this.tipodocumento.obterCodigoSelecionado()),
                    codOperacaoFinanceiraId: Number(this.operacaofinanceira.obterCodigoSelecionado()),
                    codCCustoId: this.centrodecusto.obterCodigoStringSelecionado().trim(),
                    codContaId: this.conta.obterCodigoSelecionado(),
                    dtEntrada: this.cadastroFormGroup.value.dtEntrada.startDate.format('YYYY-MM-DD'),
                    dtEmissao: this.cadastroFormGroup.value.dtEmissao.startDate.format('YYYY-MM-DD'),
                    dtVencto: this.cadastroFormGroup.value.dtVencto.startDate.format('YYYY-MM-DD'),
                    valor: Number(this.cadastroFormGroup.value.valor),
                    desconto: this.cadastroFormGroup.value.desconto,
                    tipoDesconto: Number(this.cadastroFormGroup.value.tipoDesconto),
                    juros: this.cadastroFormGroup.value.juros,
                    tipoJuros: Number(this.cadastroFormGroup.value.tipoJuros),
                    multa: this.cadastroFormGroup.value.multa,
                    tipoMulta: Number(this.cadastroFormGroup.value.tipoMulta),
                    observacao: this.cadastroFormGroup.value.observacao,
                    numCheque: this.cadastroFormGroup.value.numCheque,
                    situacao: this._utils.lerParam('liberaPagar', this.comboLoja.obterLojaSelecionada()) == 'S' ? 'BL' : 'AB',
                }
            };

            //this._financeiroService.salvarContasPagar(requisicao).subscribe((result) => {
            //    Swal.close();

            //    if (this.idTitulo) {
            //        Swal.fire(
            //            'Pronto!', 'O título ' + result[0] + ' foi alterado com sucesso.', 'success');
            //    }
            //    else {
            //        if (result.length > 1) {
            //            Swal.fire('Pronto!', 'O título ID ' + result[0] + ' foi inserido com sucesso.', 'success')

            //        }
            //        else {
            //            Swal.fire('Pronto!', 'Título(s) gerado(s) com sucesso.', 'success');
            //        }

            //    }

            //    if (Number(this.cadastroFormGroup.value.chkJaPago) == 1) {

            //        const dialog = this._matDialog.open(BaixaContasPagarMultiplos_DialogComponent, {
            //            width: '750px',
            //            height: 'auto',
            //            data: {
            //                pagarIds: Number(this.cadastroFormGroup.value.chkBaixaPrimeiraParcela) == 1 ? [result[0]] : result,
            //                lojaIds: [this.comboLoja.obterLojaSelecionada()],
            //                fornecedorIds: [this.fornecedor.obterCodigoSelecionado()],
            //            },
            //            disableClose: true
            //        });

            //        dialog.afterClosed().subscribe(result => {
            //            this.fecharJanela(true);
            //        });
            //    }
            //    else {
            //        this.fecharJanela(true);
            //    }

            //}, (err) => {
            //    Swal.fire('Ops!', 'Falha ao salvar título a receber. Tente novamente.', 'error');
            //});
        }
    }

    fecharJanela(reload: boolean): void {
        this.dialogRef.close(reload);
    }

    private carregarParametros() {
        let _parametros = this._localStorageService.get(this._keyParams).filter(i => i.id == Number(this.comboLoja.obterLojaSelecionada()));

        this.parametros.push({

            bancoPagar: _parametros[0].bancoPagar,
            tipoDocumentoPagar: _parametros[0].tipoDocumentoPagar,
            operacaoPagar: _parametros[0].operacaoPagar,
            cCustoPagar: _parametros[0].cCustoPagar,
        })
    }


    private carregarDadosPadrao() {

        if (this.parametros[0].cCustoPagar != null)
            this.centrodecusto.definirCodigoSelecionado(this.parametros[0].cCustoPagar);

        if (this.parametros[0].tipoDocumentoPagar != null)
            this.tipodocumento.definirCodigoSelecionado(this.parametros[0].tipoDocumentoPagar);

        if (this.parametros[0].bancoPagar != null)
            this.banco.definirCodigoSelecionado(this.parametros[0].bancoPagar);

        if (this.parametros[0].operacaoPagar != null)
            this.operacaofinanceira.definirCodigoSelecionado(this.parametros[0].operacaoPagar);

        this.cadastroFormGroup.patchValue(
            {
                dtEntrada: {
                    startDate: moment(),
                },
                dtEmissao: {
                    startDate: moment(),
                },
                dtVencto: {
                    startDate: moment(),
                },
                tipoDesconto: "1",
                tipoJuros: "1",
                tipoMulta: "1",
                valTitulosProvisionados: "1",
                parcela: "1",
            });

        this.calcularDiasVencto();
    }

    private validarDados(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (Number(this.comboLoja.obterLojaSelecionada()) === 0) {
            mensagemRetorno += "<br/>- Loja";
            validado = false;
        }

        if (this.cadastroFormGroup.value.numtitulo == null) {
            mensagemRetorno += "<br/>- Número do título";
            validado = false;
        }

        if (Number(this.fornecedor.obterCodigoSelecionado()) === 0) {
            mensagemRetorno += "<br/>- Fornecedor";
            validado = false;
        }

        if (this.banco.obterCodigoStringSelecionado() === null) {
            mensagemRetorno += "<br/>- Banco";
            validado = false;
        }

        if (Number(this.tipodocumento.obterCodigoSelecionado()) === 0) {
            mensagemRetorno += "<br/>- Tipo do Documento";
            validado = false;
        }

        if (Number(this.operacaofinanceira.obterCodigoSelecionado()) === 0) {
            mensagemRetorno += "<br/>- Operação Financeira";
            validado = false;
        }

        if (this.centrodecusto.obterCodigoStringSelecionado() === null) {
            mensagemRetorno += "<br/>- Centro de Custo";
            validado = false;
        }

        if (Number(this.cadastroFormGroup.value.parcela) == 0) {
            mensagemRetorno += "<br/>- Qtd. de parcelas";
            validado = false;
        }

        if (Number(this.cadastroFormGroup.value.valor) == 0) {
            mensagemRetorno += "<br/>- O valor deve ser diferente de R$0,00";
            validado = false;
        }

        if (this.cadastroFormGroup.value.dtVencto.startDate < this.cadastroFormGroup.value.dtEmissao.startDate) {
            mensagemRetorno += "<br/>- A data de vencimento deve ser maior ou igual a data de emissão";
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigatórios para gerar o título: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {

        this.carregarParametros();

        if (this.data.idTitulo > 0)
            this.editarItem(this.data.idTitulo);
        else
            this.novoItem();
    }

}