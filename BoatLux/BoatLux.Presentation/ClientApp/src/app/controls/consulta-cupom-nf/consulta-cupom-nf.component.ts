import { AfterViewInit, Component, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import * as moment from 'moment';
import Swal from "sweetalert2";
import { FinanceiroService } from '../../services/financeiro.service';
import { RequisicaoCupomNfReceberModel, ItemCupomNfReceberModel, FormaPagamentoModel } from "../../interfaces/financeiro.interface";

export interface DialogData {
    lojaId: number;
    receberId: number;
    tipoConsulta: number;
    codNf: number;
}

@Component({
    selector: 'controles-consulta-cupom-nf',
    templateUrl: './consulta-cupom-nf.component.html',
    styles: ['./consulta-cupom-nf.component.css']
})

export class ControlesConsultaCupomNfComponent implements AfterViewInit {

    constructor(
        public dialogRef: MatDialogRef<ControlesConsultaCupomNfComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private _financeiroService: FinanceiroService,
    ) {

        if (data.tipoConsulta === 1)
            this.exibeNf = true;
        else
            this.exibeCupom = true;

    }

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    //Armazena os produtos em memória
    //itensCupomNf: ItemCupomNfReceberModel[];
    itensCupomNf = new MatTableDataSource<ItemCupomNfReceberModel>();
    itensFormaPagto: FormaPagamentoModel[];

    tipoConsulta: string;
    titulo: string;

    dataEmissao: string;
    loja: number;
    caixa: number;
    sequencial: number;
    operador: string;
    cliente: string;
    condPagto: string;
    valorTotal: number
    troco: number;
    qtdItens: number;
    hora: string;


    // Flag que indica se exibe informações da NF ou do Cupom
    exibeNf: boolean = false;
    exibeCupom: boolean = false;

    //Flag que indica se tem itens para exibir o grid
    temItens = false;

    //Colunas do grid
    colunasItens = ['produtoId', 'barra', 'descricao', 'qtd', 'valorUnit', 'valorTotal', 'baseIcms', 'valorIcms'];


    obterCupomNfReceber() {

        Swal.fire({
            title: 'Tá quase...',
            html: 'Estamos obtendo as informações da consulta, aguarde...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });

        this.temItens = false;

        let requisicao: RequisicaoCupomNfReceberModel = {
            lojaId: Number(this.data.lojaId),
            receberId: this.data.receberId,
            tipoConsulta: this.data.tipoConsulta,
            codNf: Number(this.data.codNf),
        }
        this._financeiroService.obterCupomNfReceber(requisicao).subscribe(result => {

            Swal.close();

            if (result.itens != null) {
                this.itensCupomNf = new MatTableDataSource<ItemCupomNfReceberModel>(result.itens);
                this.itensCupomNf.sort = this.sort;
                this.temItens = result.itens.length > 0;
                this.qtdItens = result.itens.length;
                this.hora = result.hora;
                this.itensFormaPagto = result.formaPagamento;
            }
            
            this.dataEmissao = moment(result.data).format("DD/MM/YYYY");
            this.loja = result.lojaId;
            this.caixa = result.caixaId;
            this.sequencial = result.sequencial;
            this.operador = result.operador;
            this.cliente = result.clienteId;
            this.condPagto = result.condPagto;
            this.troco = result.troco;
            this.valorTotal = result.valorTotal;
            this.titulo = this.data.tipoConsulta === 1 ? "NF-e " + result.cupomNf : "Cupom " + result.cupomNf;
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngAfterViewInit(): void {
        this.obterCupomNfReceber();
    }

}