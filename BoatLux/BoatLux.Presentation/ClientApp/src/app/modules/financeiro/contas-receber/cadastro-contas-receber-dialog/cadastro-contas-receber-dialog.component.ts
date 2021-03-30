import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { isUndefined } from 'util';
// Services
import { FinanceiroService } from '../../../../services/financeiro.service';
import { LocalStorageService } from '../../../../services/local-storage.service';
// Components
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import { ControlesComboLojaComponent } from '../../../../controls/combo-loja/combo-loja.component';
import { BaixaContasReceberMultiplos_DialogComponent } from '../../baixa-contas-receber/baixa-contas-receber-multiplos/baixa-contas-receber-multiplos-dialog.component';
// Interfaces
import { RequisicaoSalvarContasReceberModel } from '../../../../interfaces/financeiro.interface';
import { Parametros } from '../../../../interfaces/uteis.interface';

export interface CadastroContasReceber_DialogComponent_Data {
    idTitulo?: number;
    situacao?: string;
    lojaId?: number;
    clienteId?: number;
    valorTitulo?: number;
    idsTitulosAgrupados?: number[]; // Usado no agrupamento de títulos
    apenasConsulta?: boolean;
}

@Component({
    selector: 'cadastro-contas-receber-dialog',
    templateUrl: './cadastro-contas-receber-dialog.component.html',
    styleUrls: ['./cadastro-contas-receber-dialog.component.css'],
})
export class CadastroContasReceber_DialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    
    constructor(
        public dialogRef: MatDialogRef<CadastroContasReceber_DialogComponent>,
        private _matDialog: MatDialog,
        private _financeiroService: FinanceiroService,
        private _localStorageService: LocalStorageService,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: CadastroContasReceber_DialogComponent_Data) {

        this.apenasConsulta = !isUndefined(data.apenasConsulta) ? data.apenasConsulta : false;
        this.situacao = data.situacao;
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Propriedades injetadas
    @ViewChild('comboLoja') comboLoja: ControlesComboLojaComponent;
    @ViewChild('cliente') cliente: ControlesBuscaRapidaComponent;
    @ViewChild('tipodocumento') tipodocumento: ControlesBuscaRapidaComponent;
    @ViewChild('operacaofinanceira') operacaofinanceira: ControlesBuscaRapidaComponent;
    @ViewChild('centrodecusto') centrodecusto: ControlesBuscaRapidaComponent;
    @ViewChild('banco') banco: ControlesBuscaRapidaComponent;
    @ViewChild('vendedor') vendedor: ControlesBuscaRapidaComponent;

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
    permiteEditar: boolean;
    titulo: string;
    exibeBaixaPrimeiraParcela: boolean = false; // Inicia desabilitado
    pointerEvents: string = 'auto'; // Bloqueia os campos
    opacity: string = '1';
    exibeSalvar: boolean = true;

    //Definição do formulário de cadastro
    cadastroFormGroup = this._formBuilder.group(
        {
            numtitulo: [""],
            notaEcf: [],
            agencia: [],
            contaCorrente: [],
            numCheque: [],
            dtEmissao: [],
            diasVencto: [],
            dtVencto: [],
            valor: [],
            situacaoDocto: [""],
            parcela: [],
            desconto: [],
            juros: [],
            carenciaJuros: [],
            multa: [],
            carenciaMulta: [],
            observacao: [],
            chkJaRecebido: [],
            chkBaixaPrimeiraParcela: [],
            tipoDesconto: ["1"],
            tipoJuros: ["1"],
            tipoMulta: ["1"],
            valTitulosProvisionados: ["1"],
            chkEmissaoIgualVencimento: []
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Ao selecionar loja, recarregar o buscador de conta
    aoSelecionarLoja() {
        this.vendedor.definirParametros(this.comboLoja.obterLojaSelecionada());
    }

    verificarExibeBaixaPrimeiraParcela() {
        this.exibeBaixaPrimeiraParcela = this.cadastroFormGroup.value.parcela > 1 && Number(this.cadastroFormGroup.value.chkJaRecebido) > 0 ? true : false;
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

    obterMaskDesconto() {
        if (this.cadastroFormGroup.value.tipoDesconto == 1)
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    obterMaskJuros() {
        if (this.cadastroFormGroup.value.tipoJuros == 1)
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    obterMaskMulta() {
        if (this.cadastroFormGroup.value.tipoMulta == 1)
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    exibeChkEmissaoIgualVencimento(): boolean {
        if (this.cadastroFormGroup.value.parcela > 1 && this.acao == 1) {
            return true;
        }
    }

    novoItem() {
        this.titulo = "Inclusão de título a receber";
        this.acao = 1;
        this.idTitulo = 0;
        this.permiteEditar = true;

        this.carregarDadosPadrao();

        if (this.data.idsTitulosAgrupados != null) {

            this.comboLoja.definirLojaSelecionada(Number(this.data.lojaId));
            this.cliente.definirCodigoSelecionado(Number(this.data.clienteId));
            this.cadastroFormGroup.patchValue({
                valor: this.data.valorTitulo,
            });
        }
    }

    editarItem(idTitulo: number) {
        this.acao = 2;
        this.idTitulo = idTitulo;

        this.carregarDadosTituloReceber(idTitulo);

        if (this.situacao != "Aberto" || this.apenasConsulta) {
            this.permiteEditar = false;
            this.titulo = "Consulta de título a receber";
            this.pointerEvents = 'none';
            this.opacity = '0.6';
            this.exibeSalvar = false;
        }

        else {
            this.permiteEditar = true;
            this.titulo = "Alteração de título a receber";
        }
    }

    carregarDadosTituloReceber(id: number) {

        this._financeiroService.obterDadosTituloReceber(id).subscribe(resultado => {

            //Carrega os dados do formulário
            this.cadastroFormGroup.patchValue(
                {
                    dtEmissao: {
                        startDate: resultado.dtEmissao
                    },
                    dtVencto: {
                        startDate: resultado.dtVencto
                    },
                    numtitulo: resultado.numTit.trim(),
                    notaEcf: resultado.notaEcf,
                    agencia: resultado.agencia,
                    contaCorrente: resultado.contaCorrente,
                    numCheque: resultado.numCheque,
                    valor: resultado.valor,
                    situacaoDocto: resultado.situacaoDocto != null ? String(resultado.situacaoDocto) : '',
                    parcela: 1,
                    desconto: resultado.desconto,
                    juros: resultado.juros,
                    carenciaJuros: resultado.carenciaJuros,
                    multa: resultado.multa,
                    carenciaMulta: resultado.carencia,
                    observacao: resultado.observacao,
                    chkJaRecebido: 0,
                    chkBaixaPrimeiraParcela: 0,
                    tipoDesconto: resultado.tipoDesconto.toString(),
                    tipoJuros: resultado.tipoJuros.toString(),
                    tipoMulta: resultado.tipoMulta.toString()
                });

            //Carrega o buscarápida
            this.comboLoja.definirLojaSelecionada(resultado.codLojaId);
            this.cliente.definirCodigoSelecionado(resultado.codClieId);
            this.tipodocumento.definirCodigoSelecionado(resultado.codTipoDocumentoId);
            this.operacaofinanceira.definirCodigoSelecionado(resultado.codOperacaoFinanceiraId);
            this.centrodecusto.definirCodigoSelecionado(resultado.codCentroCustoId);
            this.banco.definirCodigoSelecionado(resultado.codBancoId);
            this.vendedor.definirCodigoSelecionado(resultado.codVendedorId);

            this.calcularDiasVencto();
        });
    }

    salvarTitulo(): void {

        if (this.validarDados()) {

            Swal.fire({
                title: 'Tá quase...',
                html: 'Estamos criando o título a receber, aguarde...',
                allowOutsideClick: false,
                onBeforeOpen: () => {
                    Swal.showLoading()
                }
            });

            let requisicao: RequisicaoSalvarContasReceberModel =
            {
                parcela: String(this.cadastroFormGroup.value.parcela),
                valTitulosProvisionados: Number(this.cadastroFormGroup.value.valTitulosProvisionados),
                dtEmissaoIgualDtVencto: Number(this.cadastroFormGroup.value.chkEmissaoIgualVencimento),
                idsTitulosAgrupados: this.data.idsTitulosAgrupados,
                item: {
                    codReceberId: this.idTitulo,
                    codLojaId: Number(this.comboLoja.obterLojaSelecionada()),
                    numTit: String(this.cadastroFormGroup.value.numtitulo),
                    notaEcf: this.cadastroFormGroup.value.notaEcf,
                    codClieId: Number(this.cliente.obterCodigoSelecionado()),
                    codTipoDocumentoId: Number(this.tipodocumento.obterCodigoSelecionado()),
                    codOperacaoFinanceiraId: Number(this.operacaofinanceira.obterCodigoSelecionado()),
                    codBancoId: this.banco.obterCodigoStringSelecionado().trim(),
                    codCentroCustoId: this.centrodecusto.obterCodigoStringSelecionado().trim(),
                    codVendedorId: this.vendedor.obterCodigoSelecionado(),
                    agencia: this.cadastroFormGroup.value.agencia,
                    contaCorrente: this.cadastroFormGroup.value.contaCorrente,
                    numCheque: this.cadastroFormGroup.value.numCheque,
                    dtEmissao: this.cadastroFormGroup.value.dtEmissao.startDate.format('YYYY-MM-DD'),
                    dtVencto: this.cadastroFormGroup.value.dtVencto.startDate.format('YYYY-MM-DD'),
                    valor: Number(this.cadastroFormGroup.value.valor),
                    situacaoDocto: this.cadastroFormGroup.value.situacaoDocto != '' ? Number(this.cadastroFormGroup.value.situacaoDocto) : null,
                    carenciaJuros: this.cadastroFormGroup.value.carenciaJuros,
                    carencia: this.cadastroFormGroup.value.carenciaMulta,
                    desconto: this.cadastroFormGroup.value.desconto,
                    tipoDesconto: Number(this.cadastroFormGroup.value.tipoDesconto),
                    juros: this.cadastroFormGroup.value.juros,
                    tipoJuros: Number(this.cadastroFormGroup.value.tipoJuros),
                    multa: this.cadastroFormGroup.value.multa,
                    tipoMulta: Number(this.cadastroFormGroup.value.tipoMulta),
                    observacao: this.cadastroFormGroup.value.observacao,
                }
            };

            this._financeiroService.salvarContasReceber(requisicao).subscribe((result) => {
                Swal.close();

                if (this.idTitulo) {
                    Swal.fire('Pronto!', 'O título ' + this.idTitulo + ' foi alterado com sucesso.', 'success');
                }
                else {
                    if (result.idsReceber.length == 1) {
                        Swal.fire('Pronto!', 'O título ID ' + result.idsReceber[0] + ' foi inserido com sucesso.', 'success');
                    }
                    else {
                        Swal.fire('Pronto!', 'Título(s) gerado(s) com sucesso.', 'success');
                    }
                }

                if (Number(this.cadastroFormGroup.value.chkJaRecebido) == 1) {

                    const dialog = this._matDialog.open(BaixaContasReceberMultiplos_DialogComponent, {
                        width: '750px',
                        height: 'auto',
                        data: {
                            receberIds: Number(this.cadastroFormGroup.value.chkBaixaPrimeiraParcela) == 1 ? [result.idsReceber[0]] : result.idsReceber,
                            lojaIds: [this.comboLoja.obterLojaSelecionada()],
                            clienteIds: [this.cliente.obterCodigoSelecionado()],
                        },
                        disableClose: true
                    });

                    dialog.afterClosed().subscribe(result => {
                        this.fecharJanela(true);
                    });
                }
                else {
                    this.fecharJanela(true);
                }

            }, (err) => {
                Swal.fire('Ops!', 'Falha ao salvar título a receber. Tente novamente.', 'error');
            });
        }
    }

    validarDados(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (Number(this.comboLoja.obterLojaSelecionada()) === 0) {
            mensagemRetorno += "<br/>- Loja";
            validado = false;
        }

        if (this.cadastroFormGroup.value.numtitulo.length === 0) {
            mensagemRetorno += "<br/>- Número do título";
            validado = false;
        }

        if (Number(this.cliente.obterCodigoSelecionado()) === 0) {
            mensagemRetorno += "<br/>- Cliente";
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

        if (Number(this.cadastroFormGroup.value.valor) === 0.00) {
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

    private carregarParametros() {
        let _parametros = this._localStorageService.get(this._keyParams).filter(i => i.id == Number(this.comboLoja.obterLojaSelecionada()));

        this.parametros.push({

            bancoReceber: _parametros[0].bancoReceber,
            tipoDocumentoReceber: _parametros[0].tipoDocumentoReceber,
            operacaoReceber: _parametros[0].operacaoReceber,
            cCustoReceber: _parametros[0].cCustoReceber,
        })
    }

    private carregarDadosPadrao() {

        if (this.parametros[0].cCustoReceber != null)
            this.centrodecusto.definirCodigoSelecionado(this.parametros[0].cCustoReceber);

        if (this.parametros[0].tipoDocumentoReceber != null)
            this.tipodocumento.definirCodigoSelecionado(this.parametros[0].tipoDocumentoReceber);

        if (this.parametros[0].bancoReceber != null)
            this.banco.definirCodigoSelecionado(this.parametros[0].bancoReceber);

        if (this.parametros[0].operacaoReceber != null)
            this.operacaofinanceira.definirCodigoSelecionado(this.parametros[0].operacaoReceber);

        this.cadastroFormGroup.patchValue(
            {
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
                situacaoDocto: "",
                parcela: "1",
            });

        this.calcularDiasVencto();
    }

    desabilitaCampo(tipo: number) {
        switch (tipo) {
            case 1: // Desabilitar campo
                if (this.acao == 2) // Edição
                    return 'none';
                else
                    return 'auto';

            case 2: // alterar opacidade
                if (this.acao == 2) // Edição
                    return '0.6';
                else
                    return '1';
            default:
        }
    }

    desabilitarCamposAgrupaTitulos(tipo: number) {
        switch (tipo) {
            case 1: // Desabilitar campo
                if (this.data.valorTitulo > 0 || this.situacao != 'Aberto') // Agrupamento ou consulta
                    return 'none';
                else
                    return 'auto';

            case 2: // alterar opacidade
                if (this.data.valorTitulo > 0 || this.situacao != 'Aberto') // Agrupamento ou consulta
                    return '0.6';
                else
                    return '1';
            default:
        }
    }

    validarValorNegativo(tipo: number) {

        if (this.cadastroFormGroup.value.valor < 0) {
            this.cadastroFormGroup.patchValue({
                desconto: 0,
                juros: 0,
                carenciaJuros: 0,
                multa: 0,
                carenciaMulta: 0,
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

    //Fecha a janela
    fecharJanela(reload: boolean): void {
        this.dialogRef.close(reload);
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