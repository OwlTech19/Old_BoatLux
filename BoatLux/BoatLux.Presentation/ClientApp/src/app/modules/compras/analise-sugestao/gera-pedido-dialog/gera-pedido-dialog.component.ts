import { Component, Inject, ViewChild, AfterContentInit, AfterViewInit, AfterContentChecked, AfterViewChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComprasService } from '../../../../services/compras.service';
import { LocalStorageService } from '../../../../services/local-storage.service';
import Swal from 'sweetalert2'
import { FormGroup, FormBuilder } from '@angular/forms';
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import { RequisicaoGerarPedidoAnaliseSugestaoCompraModel, ResultadoProdutosAnaliseSugestaoCompraModel } from '../../../../interfaces/compras.interface';
import { Parametros } from '../../../../interfaces/uteis.interface';
import * as moment from 'moment';


export interface DialogData {
    filtrosOriginais: any;
    produtos: any;
    parametros?: Parametros[];

}

@Component({
    selector: 'gera-pedido-dialog',
    templateUrl: './gera-pedido-dialog.component.html',
})
export class GeraPedidoDialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<GeraPedidoDialogComponent>,
        private _comprasService: ComprasService,
        private _localStorageService: LocalStorageService,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    }
    //Definição do formulário
    geraPedidoFormGroup = this._formBuilder.group(
        {
            dataCompra: [],
            dataValidade: [],
            observacoes: [],
            incluirSomenteEditados: []
        }
    );


    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------    

    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;
    @ViewChild('condPagto') condPagto: ControlesBuscaRapidaComponent;
    @ViewChild('comprador') comprador: ControlesBuscaRapidaComponent;

    // Tratamentos para o campo validade da cotação
    locale: any = {
        format: 'YYYY-MM-DD',
        displayFormat: 'DD/MM/YYYY',
        applyLabel: 'OK',
    };

    minDate: moment.Moment = moment();

    //Chave do cache de parâmetros
    private _parametros = 'parametros';

    // Propriedades de parâmetros
    ccustoPagar: string;
    tipoDocumentoPagar: number;
    bancoPagar: string;
    operacaoPagar: number;

    concluirGeracaoPedido() {

        if (this.validarCampos()) {

            Swal.fire({
                title: 'Confirmação',
                text: "Deseja mesmo gerar um pedido de compra a partir desta análise?",
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, gerar pedido!',
                cancelButtonText: 'Não!',
                allowOutsideClick: false,

            }).then((result) => {
                if (result.value) {

                    Swal.fire({
                        title: 'Tá quase...',
                        html: 'Estamos gerando seu pedido, aguarde...',
                        allowOutsideClick: false,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                        }
                    });

                    // Filtra apenas os produtos que foram alterados
                    if (this.geraPedidoFormGroup.value.incluirSomenteEditados) {

                        var produtosAlterados = this.data.produtos.filter(function (item) {
                            return item.alterado
                        });

                        // Verifica se existem produtos editados. Se não tiver, já retorna ao usuário
                        if (produtosAlterados.length == 0) {
                            Swal.close();
                            Swal.fire("Ops!", "Não encontramos nenhum produto editado. Por favor, edite os produtos que deseja inserir no pedido e tente novamente", "warning");
                            return;
                        }
                    }

                    // Validar se existem produtos com quantidade e sem preço
                    var produtosInvalidos: string = '';
                    // Valida apenas produtos editados
                    if (this.geraPedidoFormGroup.value.incluirSomenteEditados) {
                        produtosAlterados.filter(function (item) {
                            if ((Number(item.lojas.map(i => i.qtdComprar)) > 0 && (Number(item.lojas.map(i => i.qtdEmbalagem)) == 0 || Number(item.lojas.map(i => i.valorUnitario)) == 0))
                                || (Number(item.lojas.map(i => i.qtdEmbalagem)) > 0 && (Number(item.lojas.map(i => i.qtdComprar)) == 0 || Number(item.lojas.map(i => i.valorUnitario)) == 0))
                                || (Number(item.lojas.map(i => i.valorUnitario)) > 0 && (Number(item.lojas.map(i => i.qtdEmbalagem)) == 0 || Number(item.lojas.map(i => i.qtdComprar)) == 0))) {

                                produtosInvalidos += item.prodId + ' ,';
                                return item.prodId
                            }
                        });
                    }
                    else { // Valida todos os produtos
                        this.data.produtos.filter(function (item) {
                            if ((Number(item.lojas.map(i => i.qtdComprar)) > 0 && (Number(item.lojas.map(i => i.qtdEmbalagem)) == 0 || Number(item.lojas.map(i => i.valorUnitario)) == 0))
                                || (Number(item.lojas.map(i => i.qtdEmbalagem)) > 0 && (Number(item.lojas.map(i => i.qtdComprar)) == 0 || Number(item.lojas.map(i => i.valorUnitario)) == 0))
                                || (Number(item.lojas.map(i => i.valorUnitario)) > 0 && (Number(item.lojas.map(i => i.qtdEmbalagem)) == 0 || Number(item.lojas.map(i => i.qtdComprar)) == 0))) {
                                produtosInvalidos += item.prodId + ' ,';
                                return item.prodId
                            }
                        });
                    }

                    if (produtosInvalidos.length == 0) {

                        let requisicao: RequisicaoGerarPedidoAnaliseSugestaoCompraModel =
                        {
                            fornecedorId: this.fornecedor.obterCodigoSelecionado(),
                            compradorId: this.comprador.obterCodigoSelecionado(),
                            condPagtoId: this.condPagto.obterCodigoSelecionado(),
                            observacoes: this.geraPedidoFormGroup.value.observacoes,
                            dataPedido: this.geraPedidoFormGroup.value.dataCompra.startDate.format('YYYY-MM-DD'),
                            dataValidade: this.geraPedidoFormGroup.value.dataValidade.startDate.format('YYYY-MM-DD'),
                            filtrosOriginais: this.data.filtrosOriginais,
                            produtos: this.geraPedidoFormGroup.value.incluirSomenteEditados ? produtosAlterados : this.data.produtos,
                            ccustoId: this.ccustoPagar,
                            tipoDocumentoId: this.tipoDocumentoPagar,
                            bancoId: this.bancoPagar,
                            operacaoFinanceiraId: this.operacaoPagar,
                            parametros: this.data.parametros,
                        };

                        this._comprasService.gerarPedidoCompraAnaliseSugestao(requisicao).subscribe((result) => {
                            Swal.close();
                            Swal.fire(
                                'Pronto!',
                                'O Pedido de compra foi gerado!',
                                'success').then((result) => {
                        
                                    this.dialogRef.close();
                        
                                });
                        }, (err) => {
                            Swal.fire('Ops!', 'Não foi possível gerar o pedido. Tente novamente.', 'error');
                        });
                    }
                    else {
                        Swal.fire('Ops!', 'Há produtos com informações inválidas.<br/>Por favor, verifique e informe os campos <strong> Qtd.Unit., Qtd.Embal. e R$ Unit. </strong>dos seguintes produtos:<br/>' + produtosInvalidos.substring(0, produtosInvalidos.length - 1), 'warning');
                    }
                }
                else {
                    this.dialogRef.close();
                }
            })
        };
    }

    validarCampos(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.comprador.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe o comprador";
            validado = false;
        }

        if (this.fornecedor.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe o fornecedor";
            validado = false;
        }

        if (this.condPagto.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe a condição de pagamento";
            validado = false;
        }

        if (this.geraPedidoFormGroup.value.dataValidade < this.geraPedidoFormGroup.value.dataCompra) {
            mensagemRetorno += "<br/>- Data de validade não pode ser menor que a data do pedido";
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigatórios e tente novamente: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    private carregarParametros() {
        let parametros = this._localStorageService.get(this._parametros).filter(i => i.id == this._localStorageService.get('lojaLogada'));

        // Obtem parâmetros para o Contas a Pagar
        this.ccustoPagar = parametros[0].cCustoPagar;
        this.tipoDocumentoPagar = Number(parametros[0].tipoDocumentoPagar);
        this.bancoPagar = parametros[0].bancoPagar;
        this.operacaoPagar = Number(parametros[0].operacaoPagar);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {

        this.geraPedidoFormGroup.reset({

            dataCompra: {
                startDate: moment().format('YYYY-MM-DD')
            },
            dataValidade: {
                startDate: moment().format('YYYY-MM-DD')
            },
        });

        if (this.data.filtrosOriginais.fornecedor)
            this.fornecedor.definirCodigoSelecionado(this.data.filtrosOriginais.fornecedor);

        this.carregarParametros();

        // Carrega somente os compradores da loja logada
        this.comprador.definirParametros(Number(this._localStorageService.get('lojaLogada')));
        
    }
}