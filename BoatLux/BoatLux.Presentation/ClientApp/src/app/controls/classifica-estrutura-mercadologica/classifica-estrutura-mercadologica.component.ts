import { Component, OnInit, Input, Inject, ViewChild, AfterViewInit, AfterContentChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CadastroService } from '../../services/cadastro.service';
import { FormBuilder } from '@angular/forms';
import { ControlesBuscaRapidaComponent } from '../busca-rapida/busca-rapida.component';
import Swal from 'sweetalert2';
import { RequisicaoClassificarEstrutaMercModel } from '../../interfaces/cadastro.interface';
import { error } from 'protractor';

export interface ControlesClassificarEstruturaMercadologicaComponentData {
    produtoIds: number[];
}

@Component({
    selector: 'classifica-estrutura-mercadologica',
    templateUrl: './classifica-estrutura-mercadologica.component.html'
})

export class ControlesClassificarEstruturaMercadologicaComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<ControlesClassificarEstruturaMercadologicaComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ControlesClassificarEstruturaMercadologicaComponentData,
        private _formBuilder: FormBuilder,
        private _cadastroService: CadastroService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Componentes
    @ViewChild('centroReceitaProduto') centroReceitaProduto: ControlesBuscaRapidaComponent;
    @ViewChild('grupoProduto') grupoProduto: ControlesBuscaRapidaComponent;
    @ViewChild('categoriaProduto') categoriaProduto: ControlesBuscaRapidaComponent;
    @ViewChild('familiaProduto') familiaProduto: ControlesBuscaRapidaComponent;

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // -----------------------------------------------------------------------------------------------------        

    classificarProdutos(): void {

        if (this.validarCampos()) {

            let requisicao: RequisicaoClassificarEstrutaMercModel = {

                produtoIds: this.data.produtoIds,
                centroReceitaProduto: this.centroReceitaProduto.obterCodigoSelecionado(),
                grupoProduto: this.grupoProduto.obterCodigoSelecionado(),
                categoriaProduto: this.categoriaProduto.obterCodigoSelecionado(),
                familiaProduto: this.familiaProduto.obterCodigoSelecionado(),
            }

            this._cadastroService.produtos_ClassificarEstruturaMerc(requisicao).subscribe((result) => {

                Swal.fire('Pronto!', 'Os Produtos foram classificados com sucesso.', 'success');
                this.dialogRef.close();

            }, (err) => {
                Swal.fire('Ops!', 'Não conseguimos classificar os produtos. Tente novamente!', 'error');
            });
        }
    }

    validarCampos(): boolean {
        let validado: boolean = true;
        let mensagemRetorno: string = "";

        if (this.centroReceitaProduto.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe o centro de receita";
            validado = false;
        }

        if (this.grupoProduto.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe o grupo";
            validado = false;
        }

        if (this.categoriaProduto.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe a categoria";
            validado = false;
        }

        if (this.familiaProduto.obterCodigoSelecionado() == null) {
            mensagemRetorno += "<br/>- Informe a família";
            validado = false;
        }

        if (!validado) {
            Swal.fire("Ops!", "Por favor, informe os campos obrigatórios e tente novamente: " + mensagemRetorno, "warning");
            return;
        }

        return validado;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        // Nada por enquanto
    }
}