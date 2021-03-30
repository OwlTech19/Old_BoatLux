import { Component, Inject } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    colunas: any;
}

@Component({
    selector: 'compras-analise-sugestao-colunas-dialog',
    templateUrl: './colunas-dialog.component.html',
})
export class ColunasDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<ColunasDialogComponent>
    ,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    onNoClick(): void {
    this.dialogRef.close();
    }
}