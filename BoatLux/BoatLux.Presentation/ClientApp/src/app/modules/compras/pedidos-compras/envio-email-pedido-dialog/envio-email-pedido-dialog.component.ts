import { Component, AfterViewInit, Inject, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComprasService } from '../../../../services/compras.service';
import { empty } from 'rxjs';
import { RequisicaoEnviarEmailModel } from '../../../../interfaces/compras.interface';

export interface EnvioEmailPedidoComponentData {
    pedidoIds: number[];
    lojaIds: number[];
    emailFornecedor?: string;
    fornecedorId?: number;
    fornecedor: string;
}

export interface Emails {
    email: string;
}

@Component({
    selector: 'envio-email-pedido-dialog',
    templateUrl: './envio-email-pedido-dialog.component.html',
    styleUrls: ['envio-email-pedido-dialog.component.css']

})

export class EnvioEmailPedidoDialogComponent implements AfterViewInit {

    constructor(
        public dialogRef: MatDialogRef<EnvioEmailPedidoDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EnvioEmailPedidoComponentData,
        private _comprasService: ComprasService,
        private _formBuilder: FormBuilder

    ) {
        if (this.data.emailFornecedor != null)
            this.emails.push({ email: this.data.emailFornecedor });
    }

    editorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: '15rem',
        minHeight: '5rem',
        width: 'auto',
        minWidth: '15rem',
        translate: 'yes',
        enableToolbar: false,
        showToolbar: false,
        defaultParagraphSeparator: 'p',
        defaultFontName: 'Arial',
        toolbarPosition: 'top',
        toolbarHiddenButtons: [
            [
                'undo',
                'redo',
                'bold',
                'italic',
                'underline',
                'strikeThrough',
                'subscript',
                'superscript',
                'justifyLeft',
                'justifyCenter',
                'justifyRight',
                'justifyFull',
                'indent',
                'outdent',
                'insertUnorderedList',
                'insertOrderedList',
                'heading',
                'fontName'
            ],
            [
                'fontSize',
                'textColor',
                'backgroundColor',
                'customClasses',
                'link',
                'unlink',
                'insertImage',
                'insertVideo',
                'insertHorizontalRule',
                'removeFormat',
                'toggleEditorMode'
            ]
        ]
    };

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    emails: Emails[] = [];

    //Definição do formulário de busca
    dadosFormGroup = this._formBuilder.group(
        {
            assunto: ['Pedido(s) ' + this.data.pedidoIds],
            mensagem: ['Prezado(a) ' + this.data.fornecedor + ' <br/><br/>' +
                'Segue anexo pedido(s) de compra(s) nº: ' + this.data.pedidoIds + ' <br/><br/>' +
                'Atenciosamente, '],
            impPrecoUnitCompra: [],
            impCustoAtualCadastro: [],
        }
    );

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add email
        if ((value || '').trim()) {
            this.emails.push({ email: value.trim() });
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    remove(emails: Emails): void {
        const index = this.emails.indexOf(emails);

        if (index >= 0) {
            this.emails.splice(index, 1);
        }
    }

    enviarEmail() {
        if (this.validarCamposObrigatorios()) {

            let requisicao: RequisicaoEnviarEmailModel = {
                compraIds: this.data.pedidoIds,
                lojaIds: this.data.lojaIds, 
                fornecedorId: this.data.fornecedorId,
                emails: this.emails,
                assunto: this.dadosFormGroup.value.assunto,
                mensagem: this.dadosFormGroup.value.mensagem,
                impCustoAtualCadastro: Number(this.dadosFormGroup.value.impCustoAtualCadastro),
                impPrecoUnitCompra: Number(this.dadosFormGroup.value.impPrecoUnitCompra),
            }

            this._comprasService.enviarEmailPedido(requisicao).subscribe(result => {
                Swal.fire('Pronto', 'E-mail enviado com sucesso!', 'success');

            }, (err) => {
                Swal.fire('Ops!', 'Não conseguimos enviar o E-mail. Verifique as informações e tente novamente.', 'error');
            });
        }
    }

    validarCamposObrigatorios(): boolean {
        let mensagemErro: string = '';
        let ret: boolean = true;

        if (this.emails.length === 0)
            mensagemErro += "<br /> -Informe pelo menos um e-mail.";

        if (this.dadosFormGroup.value.assunto === null || this.dadosFormGroup.value.assunto === 0)
            mensagemErro += "<br /> -Informe o assunto.";

        if (this.dadosFormGroup.value.assunto === null || this.dadosFormGroup.value.mensagem.length === 0)
            mensagemErro += "<br /> -Informe o conteúdo do e-mail.";

        if (mensagemErro.length > 0) {
            Swal.fire('Atenção', 'Para enviar e-mail, por favor informe os campos obrigatórios.' + mensagemErro, 'warning');
            ret = false;
        }

        return ret;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
        * AfterViewInit
     **/
    ngAfterViewInit(): void {

    }
}