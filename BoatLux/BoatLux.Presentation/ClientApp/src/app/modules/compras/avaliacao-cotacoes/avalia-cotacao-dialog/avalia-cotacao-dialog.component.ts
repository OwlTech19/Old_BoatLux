import { Component, ViewChild, Inject, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ComprasService } from '../../../../services/compras.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import Swal from 'sweetalert2'
import { DialogService } from '../../../../services/dialog.service';
import { error } from '@angular/compiler/src/util';
import { MatTabGroup } from '@angular/material/tabs';
import { ControlesEditaCotacaoComponent } from '../../../../controls/edita-cotacao/edita-cotacao.component';
import { RequisicaoCotacaoGerarPedidoModel, RequisicaoRelatorioAvaliaCotacaoModel } from '../../../../interfaces/compras.interface';
import { ControlesConsultaFornecedoresColunaComponent } from './consultar-fornecedores-colunas/consultar-fornecedores-coluna.component';

export interface DialogData {
    idCotacao: number;
    idLoja: number;
    dataCotacao: string;
}

@Component({
    selector: 'avalia-cotacao-dialog',
    templateUrl: './avalia-cotacao-dialog.component.html',
})

export class AvaliaCotacaoDialogComponent implements AfterViewInit {


    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<AvaliaCotacaoDialogComponent>,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService,
        private _dialogService: DialogService,
        private _matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private el: ElementRef) {

        this.titulo = "Avaliação da cotação " + data.idCotacao + " - Data da cotação: " + data.dataCotacao;
        this.idLoja = data.idLoja;
        this.idCotacao = data.idCotacao;
        this.dataCotacao = data.dataCotacao.split("/").reverse().join("-");
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Componentes
    @ViewChild('comprador') comprador: ControlesBuscaRapidaComponent;

    titulo: string;
    idLoja: number;
    idCotacao: number;
    dataCotacao: string;

    //Definição dos formulários
    buscaFormGroup = this._formBuilder.group(
        {
            criterioAvaliacao: ['1'],
            formaImpressao: ['1'],
            observacaoPedido: [],
            chkPedidoDataCotacao: []
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    // Limpa o formulário (campos obrigatório com dados default)
    limparBusca(): void {
        this.buscaFormGroup.reset({
            criterioAvaliacao: '1',
            formaImpressao: '1',
            observacaoPedido: ''
        });

        this.comprador.limpar();
    }

    // Fecha o formulário
    Voltar(): void {
        this.dialogRef.close();
    }

    // Imprime relatórios para avaliações
    imprimirBusca(formato: number, visualizar: boolean = false): void {

        // Exibe Fornecedores (Coluna)
        if (formato == 3) { 
            this._dialogService.abrirDialogGrande(ControlesConsultaFornecedoresColunaComponent,
                {
                    cotacaoId: this.idCotacao,
                    lojaId: this.idLoja,
                });
        }
        else {
            let requisicao: RequisicaoRelatorioAvaliaCotacaoModel =
            {
                formato: formato,
                cotacaoId: this.idCotacao,
                lojaId: this.idLoja,
                criterioAvaliacao: Number(this.buscaFormGroup.value.criterioAvaliacao),
                formaImpressao: Number(this.buscaFormGroup.value.formaImpressao),
                dataCotacao: this.dataCotacao
            };

            this._comprasService.gerarRelatorioAvaliaCotacao(requisicao, 'Relatório Avaliação da cotação', visualizar);
        }
    }

    // Abre janela de edição da cotação
    editarCotacao(): void {

        this._dialogService.abrirDialogGrande(ControlesEditaCotacaoComponent,
            {
                cotacaoId: this.idCotacao,
                lojaId: this.idLoja,
                dataCotacao: this.data
            });
    }

    // Gera os pedidos da cotação
    gerarPedidos(): void {

        if (this.comprador.obterCodigoSelecionado() != null) {
            Swal.fire({
                title: 'Atenção',
                text: "Confirma a geração dos pedidos?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, gerar pedidos!',
                cancelButtonText: 'Não!',
                reverseButtons: true
            }).then((result) => {
                if (result.value) {

                    Swal.fire({
                        title: 'Tá quase...',
                        html: 'Estamos gerando os pedidos!, aguarde...',
                        allowOutsideClick: false,
                        onBeforeOpen: () => {
                            Swal.showLoading()
                        }
                    });

                    let requisicao: RequisicaoCotacaoGerarPedidoModel =
                    {
                        cotacaoId: this.idCotacao,
                        lojaId: this.idLoja,
                        compradorId: Number(this.comprador.obterCodigoSelecionado()),
                        criterio: Number(this.buscaFormGroup.value.criterioAvaliacao),
                        dataCotacao: this.dataCotacao,
                        observacao: this.buscaFormGroup.value.observacaoPedido,
                        gerarPedDataCotacao: Number(this.buscaFormGroup.value.chkPedidoDataCotacao)
                    };
                    this._comprasService.cotacaoGerarPedidos(requisicao).subscribe((resultado) => {

                        Swal.close();

                        if (resultado.sucesso) {
                            Swal.fire('Pronto!', 'Pedidos gerados com sucesso!', 'success');
                        }
                        else {
                            Swal.fire('Ops!', 'Não foi possível gerar os pedidos. Retorno: ' + resultado.erro, 'error');
                        }

                    }, (err) => {
                        Swal.fire('Ops!', err.error.Message, 'error');
                    });
                }
            })
        }
        else {
            Swal.fire('Ops!', 'Informe o Comprador para gerar os pedidos!', 'warning');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {

        // Carrega somente os compradores da loja da cotação
        this.comprador.definirParametros(this.idLoja);       
    }
}