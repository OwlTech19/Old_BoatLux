import { Component, Inject } from "@angular/core";
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from "@angular/forms";
import Swal from "sweetalert2";
// Services
import { FinanceiroService } from "../../../../../services/financeiro.service";
// Interfaces
import { RequestAddCost } from "../../../../../interfaces/financeiro.interface";

@Component({
    selector: 'cadastro-custos-dialog',
    templateUrl: './cadastro-custos-dialog.component.html',
})

export class CadastroCustos_DialogComponent {
    // -----------------------------------------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------------------------------------
    constructor(
        public dialogRef: MatDialogRef<CadastroCustos_DialogComponent>,
        private _financeiroService: FinanceiroService,
        private _formBuilder: FormBuilder,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // Properties
    // -----------------------------------------------------------------------------------------------------  
    //Definição do formulário de cadastro
    registerFormGroup = this._formBuilder.group(
        {
            costDescription: [],
            costType: ['1'],
        }
    );

    // -----------------------------------------------------------------------------------------------------
    // Methods
    // -----------------------------------------------------------------------------------------------------
    closeWindow(reload: boolean): void {
        this.dialogRef.close(reload);
    }

    addCost(): void {

        // Essa validação tá ruim. Precisa melhorar ela, validar no front-end via bootstrap
        if (this.registerFormGroup.value.costDescription == null) {
            Swal.fire('Atenção', 'Informe a descrição do custo!', 'warning');
            return;
        }

        Swal.fire({
            title: 'Salvando',
            html: 'Estamos adicionando o novo custo, aguarde...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });

        let request: RequestAddCost = {
            costDescription: this.registerFormGroup.value.costDescription,
            costType: Number(this.registerFormGroup.value.costType)
        }

        this._financeiroService.AddCost(request).subscribe(costId => {

            Swal.fire(
                'Sucesso!',
                'Custo ' + costId + ' adicionado!',
                'success').then(costId => {

                    this.closeWindow(true);
                });

        }, (err) => {
            Swal.fire('Desculpe!', 'Não foi possível adicionar novo custo.' + err, 'error');
        });

    }
}