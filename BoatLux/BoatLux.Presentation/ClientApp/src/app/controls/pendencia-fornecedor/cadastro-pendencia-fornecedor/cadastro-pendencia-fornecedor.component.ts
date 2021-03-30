import { Component, OnInit, Input, Inject, ViewChild, AfterViewInit, AfterContentChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { ControlesBuscaRapidaComponent } from '../../busca-rapida/busca-rapida.component';
import { CadastroService } from '../../../services/cadastro.service';
import { PendenciaFornecedorModel } from '../../../interfaces/cadastro.interface';
import * as moment from 'moment';

export interface ControlesCadastroPendenciaFornecedorComponentData {
    fornecedorId: number;
    pendenciaId?: number;
}

@Component({
    selector: 'cadastro-pendencia-fornecedor',
    templateUrl: './cadastro-pendencia-fornecedor.component.html'
})

export class ControlesCadastroPendenciaFornecedorComponent implements AfterViewInit {
    
    // -----------------------------------------------------------------------------------------------------
    // @ Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<ControlesCadastroPendenciaFornecedorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ControlesCadastroPendenciaFornecedorComponentData,
        private _formBuilder: FormBuilder,
        private _cadastroService: CadastroService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Componentes
    @ViewChild('fornecedor') fornecedor: ControlesBuscaRapidaComponent;

    acao: number;
    id: number;
    titulo: string;

    // Tratamentos para o campo validade da cotação
    locale: any = {
        format: 'YYYY-DD-MM',
        displayFormat: 'DD/MM/YYYY',
    };

    //Definição do formulário de busca
    cadastroFormGroup = this._formBuilder.group(
        {
            data: [],
            valor: [],
            descricao: [],
            situacao: []
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos
    // -----------------------------------------------------------------------------------------------------        

    novoItem() {
        this.acao = 1;
        this.titulo = "Cadastro de pendência do fornecedor";
        this.id = 0;
        this.definirDadosPadrao();
    }

    editarItem(id: number) {
        this.acao = 2;
        this.titulo = "Alteração de pendência do fornecedor #" + this.data.fornecedorId.toString();
        this.id = id;
        this.carregarPendencia(id);
        
    }

    carregarPendencia(id: number): void {

        Swal.fire({
            title: 'Aguarde...',
            html: 'Estamos carregando os dados...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });

        this._cadastroService.fornecedor_ObterPendencia(id).subscribe(resultado => {
            Swal.close();
            //Carrega os dados do formulário
            this.cadastroFormGroup.patchValue(
                {
                    data: {
                        startDate: resultado.data,
                    },
                    valor: resultado.valor,
                    descricao: resultado.descricao,
                    situacao: resultado.situacao,
                });

            //Carrega o buscarápida
            this.fornecedor.definirCodigoSelecionado(this.data.fornecedorId);
            

        }, err => {
            Swal.fire('Ops!', err.error.Message, 'error');
        });
    }

    salvarPendencia(): void {

        Swal.fire({
            title: 'Tá quase...',
            html: 'Estamos gravando as informações da pendência, aguarde...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });

        let requisicao: PendenciaFornecedorModel =
        {
            fornecedorId: Number(this.data.fornecedorId),
            pendenciaId: Number(this.id),
            data: this.cadastroFormGroup.value.data.startDate.format('YYYY-MM-DD'),
            valor: Number(this.cadastroFormGroup.value.valor),
            descricao: this.cadastroFormGroup.value.descricao,
            situacao: this.cadastroFormGroup.value.situacao
        };

        this._cadastroService.fornecedor_SalvarPendencia(requisicao).subscribe((id) => {
            Swal.close();

            if (this.id > 0) {
                Swal.fire(
                    'Pronto!',
                    'A pendência foi alterada com sucesso.',
                    'success').then((result) => {

                        this.dialogRef.close();

                    });
            }
            else {
                Swal.fire(
                    'Pronto!',
                    'A pendência ' + id + ' foi inserida com sucesso.',
                    'success').then((result) => {

                        this.dialogRef.close();

                    });
            }
        }, (err) => {
            Swal.fire('Ops!', 'Falha ao salvar pendência do fornecedor. Tente novamente.', 'error');
        });
    }

    definirDadosPadrao() {
        // Inicia componente com data do pedido e validade preenchidos
        this.cadastroFormGroup.reset({
            data: {
                startDate: moment().format('YYYY-MM-DD'),
            },
            situacao: 'AB',
        });

        //Carrega o buscarápida
        this.fornecedor.definirCodigoSelecionado(this.data.fornecedorId);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        if (this.data.pendenciaId > 0)
            this.editarItem(this.data.pendenciaId);
        else
            this.novoItem();

    }
}