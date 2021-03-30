import { AfterViewInit, Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
// Services
import { FinanceiroService } from "../../services/financeiro.service";
// Interfaces
import { RequisicaoComprovanteReceberModel, RequisicaoComprovantePagarModel, ComprovanteModel } from "../../interfaces/financeiro.interface";

export interface ControlesImpressaoComprovanteComponentData {
    tituloIds: number[];
    lojaId?: number;
    clienteIds?: number[];
    fornecedorIds?: number[];
    impObs?: boolean;
    tipoComprovante?: string;
}

@Component({
    selector: 'impressao-comprovante',
    templateUrl: './impressao-comprovante.component.html',
    styleUrls: ['./impressao-comprovante.component.scss']
})

export class ControlesImpressaoComprovanteComponent implements AfterViewInit, OnInit {

    constructor(
        public dialogRef: MatDialogRef<ControlesImpressaoComprovanteComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ControlesImpressaoComprovanteComponentData,
        private _financeiroService: FinanceiroService) {

    }

    isExtendedRow = (index, item) => true;

    //Armazena dados em memória
    comprovantes: ComprovanteModel[];

    descrTitulo: string;
    razao: string;
    endereco: string;
    cidade: string;
    estado: string;
    fone: string;
    dataHora: string;
    usuario: string;
    clienteFornecedor: string;
    formaPagto: string;
    totalTitulos: number;
    encargos: number;
    totalPago: number;
    totalPagar: number;
    imprimeObservacao: boolean;

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // -----------------------------------------------------------------------------------------------------     

    obterComprovanteReceber() {

        let requisicao: RequisicaoComprovanteReceberModel = {
            receberIds: this.data.tituloIds,
            lojaId: Number(this.data.lojaId),
            clienteIds: this.data.clienteIds
        }

        this._financeiroService.obterComprovanteReceber(requisicao).subscribe(result => {

            this.comprovantes = result.comprovantes;

            setTimeout(() => {
                window.print();
            }, 1000);

        })
    }

    obterComprovantePagar() {

        let requisicao: RequisicaoComprovantePagarModel = {
            pagarIds: this.data.tituloIds,
            lojaId: Number(this.data.lojaId),
            fornecedorIds: this.data.fornecedorIds
        }

        this._financeiroService.obterComprovantePagar(requisicao).subscribe(result => {

            this.comprovantes = result.comprovantes;

            setTimeout(() => {
                window.print();
            }, 1000);

        })
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngAfterViewInit(): void {


    }

    ngOnInit(): void {

        if (this.data.tipoComprovante == "receber") {
            this.descrTitulo = "Contas a Receber";
            this.imprimeObservacao = this.data.impObs;

            this.obterComprovanteReceber();
        }
        else {
            this.descrTitulo = "Contas a Pagar";
            this.imprimeObservacao = this.data.impObs;

            this.obterComprovantePagar();
        }
    }
}