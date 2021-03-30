import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CadastroService } from '../../../../services/cadastro.service';
import Swal from 'sweetalert2'
import { FormBuilder, Validators } from '@angular/forms';
import { TipoDocumentoModel, RequisicaoSalvarTipoDocumentoModel } from '../../../../interfaces/cadastro.interface';

export interface DialogData {
    item: TipoDocumentoModel;
    sucesso: boolean;
}

@Component({
    selector: 'cadastro-dialog',
    templateUrl: './cadastro-dialog.component.html',
})
export class TiposDocumento_CadastroDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<TiposDocumento_CadastroDialogComponent>,
        private _cadastroService: CadastroService,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {


        if (data.item == null) {
            this.titulo = 'Novo Cadastro';
        }
        else {
            this.titulo = 'Alteração de Cadastro';
            this.cadastroFormGroup.patchValue(data.item);
            this.idCadastro = data.item.id;
        }
    }

    //Definição do formulário de cadastro
    cadastroFormGroup = this._formBuilder.group(
        {
            id: [{ value: '', disabled: true }],
            descricao: ['', [Validators.required]]
        }
    );

    //Título da janela
    titulo = '';
    idCadastro?: number;

    //Salva o cadastro
    salvarCadastro() {

        Swal.fire({
            title: 'Tá quase...',
            html: 'Estamos salvando o cadastro, aguarde...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });

        let requisicao: RequisicaoSalvarTipoDocumentoModel =
        {
            item: {
                id: this.idCadastro,
                descricao: this.cadastroFormGroup.value.descricao
            }
        };

        this._cadastroService.financeiro_SalvarTiposDocumentos(requisicao).subscribe((resultado) => {
            Swal.close();
            this.data.sucesso = true;

            if (this.idCadastro) {
                Swal.fire(
                    'Pronto!',
                    'O cadastro foi alterado com sucesso.',
                    'success').then((result) => {

                        this.dialogRef.close();

                    });
            }
            else {
                Swal.fire(
                    'Pronto!',
                    'O cadastro ID ' + resultado.id + ' foi realizado com sucesso.',
                    'success').then((result) => {

                        this.dialogRef.close();

                    });
            }
        }, (err) => {
            Swal.fire('Ops!', 'Falha ao salvar cadastro. Tente novamente.', 'error');
        });
    };

    //Fecha a janela
    cancelarCadastro(): void {
        this.dialogRef.close();
    }
}



////Salva item no serviço
//salvarItem() {

//    let requisicao: RequisicaoSalvarOperacaoFinanceiraModel =
//    {
//        item: {
//            id: this.cadastroFormGroup.value.id,
//            descricao: this.cadastroFormGroup.value.descricao
//        }
//    };

//    this.processandoCadastro = true;

//    //Chama o serviço
//    this._cadastroService.financeiro_SalvarOperacaoFinanceira(requisicao).subscribe((resultado) => {

//        this.processandoCadastro = false;
//        this.buscarItens();

//        if (this.novoCadastro) {
//            Swal.fire({
//                title: 'Pronto!',
//                text: "O item foi cadastrado com sucesso! Deseja cadastrar outro item?",
//                icon: 'success',
//                showCancelButton: true,
//                confirmButtonColor: '#3085d6',
//                cancelButtonColor: '#d33',
//                confirmButtonText: 'Sim!',
//                cancelButtonText: 'Não!'
//            }).then((result) => {
//                if (result.value) {
//                    this.novoItem();
//                }
//                else {
//                    this.tabIndex = 0;
//                }
//            })
//        }
//        else {
//            Swal.fire('Pronto!', 'O item foi alterado com sucesso!', 'success');
//        }
//    }, (err) => {
//        Swal.fire({
//            title: 'Ops!',
//            text: "Não conseguimos salvar o item, deseja tentar novamente??",
//            icon: 'error',
//            showCancelButton: true,
//            confirmButtonColor: '#3085d6',
//            cancelButtonColor: '#d33',
//            confirmButtonText: 'Sim!',
//            cancelButtonText: 'Não!'
//        }).then((result) => {
//            if (result.value) {
//                this.salvarItem();
//            }
//            else {
//                this.tabIndex = 0;
//            }
//        })
//    });
//}
