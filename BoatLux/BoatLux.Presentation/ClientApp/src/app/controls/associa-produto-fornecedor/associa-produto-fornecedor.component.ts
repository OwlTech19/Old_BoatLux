import { Component, OnInit, Input, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CadastroService } from '../../services/cadastro.service';
import { FormBuilder } from '@angular/forms';
import { ControlesBuscaRapidaComponent } from '../busca-rapida/busca-rapida.component';
import Swal from 'sweetalert2';
import { RequisicaoAssociarProdutoFornecedorModel } from '../../interfaces/cadastro.interface';

export interface ControlesAssociarProdutoFornecedorComponentData {
    prodId: number;
    descricao?: string;
    fornecedorId?: number;
}

@Component({
    selector: 'associa-produto-fornecedor',
    templateUrl: './associa-produto-fornecedor.component.html'
})

export class ControlesAssociarProdutoFornecedorComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<ControlesAssociarProdutoFornecedorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ControlesAssociarProdutoFornecedorComponentData,
        private _formBuilder: FormBuilder,
        private _cadastroService: CadastroService) {

        this.produto = "Produto: " + data.prodId + " - " + data.descricao;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------   

    //Componentes
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;

    //Propriedades
    produto: string;

    //Definição do formulário
    associaFormGroup = this._formBuilder.group(
        {
            fabricante: [],
            enviarDadosBalanca: [],
            codRef: []
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // -----------------------------------------------------------------------------------------------------        

    associarProdutoFornecedor(): void {

        if (this.fornecedor.obterCodigoSelecionado() != null) {

            let requisicao: RequisicaoAssociarProdutoFornecedorModel = {

                prodId: this.data.prodId,
                fornecedorId: this.fornecedor.obterCodigoSelecionado(),
                enviarDadosBalanca: Number(this.associaFormGroup.value.enviarDadosBalanca),
                fabricante: Number(this.associaFormGroup.value.fabricante),
                codRef: this.associaFormGroup.value.codRef
            }

            this._cadastroService.produtos_AssociarFornecedor(requisicao).subscribe((result) => {

                this.dialogRef.close();

            }, (err) => {
                Swal.fire('Ops!', 'Não conseguimos associar o produto ao fornecedor. Tente novamente!', 'error');
            });
        }
        else {
            Swal.fire('Atenção', 'Um fornecedor válido é requerido', 'info');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {

        // Quando informado na Análise, carrega o fornecedor
        if (Number(this.data.fornecedorId) > 0)
            this.fornecedor.definirCodigoSelecionado(this.data.fornecedorId);
    }
}