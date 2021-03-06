import { AfterViewInit, Component, Inject, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import Swal from 'sweetalert2';
import * as moment from 'moment';
// Services
import { FinanceiroService } from "../../../../services/financeiro.service";
import { LocalStorageService } from "../../../../services/local-storage.service";
import { UtilsService } from "../../../../services/utils.service";
// Components
import { ControlesBuscaRapidaComponent } from "../../../../controls/busca-rapida/busca-rapida.component";
import { ControlesLegendaComponent } from "../../../../controls/legenda/legenda.component";
// Interfaces
import { ContasReceberModel, RequisicaoGerarBoletoModel } from "../../../../interfaces/financeiro.interface";
import { Observable } from "rxjs";

export interface EmissaoBoletos_DialogComponent_Data {
    titulosSelecionados?: ContasReceberModel[];
}

@Component({
    selector: 'emissao-boletos-dialog',
    templateUrl: './emissao-boletos-dialog.component.html',
})

export class EmissaoBoletos_DialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    
    constructor(
        public dialogRef: MatDialogRef<EmissaoBoletos_DialogComponent>,
        private _matDialog: MatDialog,
        private _financeiroService: FinanceiroService,
        private _localStorageService: LocalStorageService,
        private _formBuilder: FormBuilder,
        public _utils: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: EmissaoBoletos_DialogComponent_Data) {

        // Obtem Token Loja Logada
        this.tokenLojaLogada = this._utils.lerParam('tokenboleto', this._localStorageService.get('lojaLogada'));

    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em mem??ria
    itensDataSource: ContasReceberModel[];

    @ViewChild('cliente') cliente: ControlesBuscaRapidaComponent;
    @ViewChild('banco') banco: ControlesBuscaRapidaComponent;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    // Per??odos pr?? definidos do componente 
    ranges: any = {
        'Hoje': [moment(), moment()],
        'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        '??ltimos 7 dias': [moment().subtract(6, 'days'), moment()],
        '??ltimos 30 dias': [moment().subtract(29, 'days'), moment()],
        'M??s atual': [moment().startOf('month'), moment().endOf('month')],
        'M??s passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    };

    //Flag que indica se os itens est??o sendo carregados
    exibeItensCarregando = false;
    temItens = false;
    tokenLojaLogada: string;

    //Defini????o do formul??rio de busca
    boletoFormGroup = this._formBuilder.group(
        {
            opcaoTipoData: [],
            periodo: [],
            numTit: [],
            parcela: [],
            statusBoleto: [],
            codBeneficiario: [{ value: '', disabled: true }],
            carteira: [{ value: '', disabled: true }],
            agencia: [{ value: '', disabled: true }],
            digitoAgencia: [{ value: '', disabled: true }],
            contaCorrente: [{ value: '', disabled: true }],
            digitoCc: [{ value: '', disabled: true }],
            diasProtesto: [{ value: '', disabled: true }],
        }
    );

    //Colunas do grid
    colunasItens = ['codlojaid', 'receberid', 'numtit', 'parcela', 'razao', 'dtemissao', 'dtvencto', 'valor', 'ccusto', 'observacao', 'acoes'];

    // -----------------------------------------------------------------------------------------------------
    // M??todos
    // -----------------------------------------------------------------------------------------------------    

    //Filtra os itens 
    buscarItens(): void {

        this.exibeItensCarregando = true;
        this.temItens = false;

        setTimeout(() => {

            if (this.data.titulosSelecionados.length > 0) {

                this.exibeItensCarregando = false;
                this.temItens = this.data.titulosSelecionados.length > 0;
                this.itensDataSource = this.data.titulosSelecionados;
                this.legenda.quantidadeResultados = this.data.titulosSelecionados.length;
            }
            else {

                this.exibeItensCarregando = false;
                this.temItens = false;
            }
        }, 1000);

    }

    imprimirBoleto(item: ContasReceberModel) {

        var tokenLoja = this._utils.lerParam('tokenboleto', item.codLojaId);

        if (this.validarDados(item, tokenLoja)) {

            // Monta requisi????o
            let requisicao: RequisicaoGerarBoletoModel =
            {
                receberId: item.receberId,
                lojaId: Number(item.codLojaId),
                bancoId: String(this.banco.obterCodigoStringSelecionado()).trim(),
                tokenLoja: tokenLoja,
            }

            this._financeiroService.imprimirBoletos(requisicao, "Boletos", true);

            // Atualiza o NumBoleto ao solicitar a impress??o do boleto
            this.itensDataSource.forEach(i => {
                if (i.receberId === item.receberId)
                    i.numBoleto = i.receberId;
            });
        }
    }

    exportarRemessa(): void {

        if (this.validarDados()) {

            Swal.fire({
                title: 'Confirma????o!',
                text: "Deseja gerar a remessa? Imprima todos os boletos antes de solicitar a gera????o.",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim!',
                cancelButtonText: 'N??o!'
            }).then((result) => {
                if (result.isConfirmed) {

                    Swal.fire({
                        title: 'T?? quase...',
                        html: 'Estamos gerando a remessa, aguarde...',
                        allowOutsideClick: false,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                        }
                    });

                    // Monta requisi????o
                    let requisicao: RequisicaoGerarBoletoModel =
                    {
                        bancoId: this.banco.obterCodigoStringSelecionado(),
                        lojaId: Number(this._localStorageService.get('lojaLogada')),
                        tokenLoja: this.tokenLojaLogada,
                    }

                    // Chama a API
                    this._financeiroService.gerarArquivoRemessa(requisicao).subscribe(result => {

                        Swal.close();

                        // Gera o txt
                        var a = document.createElement('a');
                        var blob = new Blob([result.remessa], { 'type': 'txt' });
                        a.href = window.URL.createObjectURL(blob);
                        a.download = 'Remessa_' + this.banco.obterItemSelecionado().titulo + ".rem"; // Nome do arquivo
                        a.click();
                    }, (err) => {

                        Swal.close();
                        Swal.fire('Ops!', err.error.Message, 'error');
                    });
                }
            });
        }
    }

    importarRetorno(): void {

    }

    fecharJanela(reload: boolean): void {
        this.dialogRef.close(reload);
    }

    private validarDados(item?: ContasReceberModel, tokenLoja?: string): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (item != null) {

            if (moment(new Date().getDate(), "DD/MM/YYYY") > moment(item.dtVencto, "DD/MM/YYYY")) {
                mensagemRetorno += "<br/>- A data de vencimento do boleto n??o pode ser menor que a data atual. Edite o t??tulo e altere a data de vencimento.";
                validado = false;
            }
        }

        if (this.banco.obterCodigoStringSelecionado() == null) {

            mensagemRetorno += "<br/>- Informe o banco que deseja imprimir os boletos";
            validado = false;
        }

        if (tokenLoja == null && this.tokenLojaLogada == null) {

            mensagemRetorno += "<br/>- Token n??o encontrado. Parametrize o token da loja";
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "<b>Por favor, verifique os dados e tente novamente:</b> " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    // -----------------------------------------------------------------------------------------------------
    // M??todos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    
    ngAfterViewInit(): void {

        this.buscarItens();

    }

}