import { Inject, Component, ViewEncapsulation, Output, EventEmitter } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HttpClient, HttpEventType } from '@angular/common/http';
import Swal from "sweetalert2";
// Services
import { LocalStorageService } from "../../../../services/local-storage.service";
import { EndpointService } from "../../../../services/endpoint.service";

export interface AnexaComprovantePagar_DialogComponent_Data {
    pagarIds: number[];
}

@Component({
    selector: 'anexa-comprovante-pagar-dialog',
    templateUrl: './anexa-comprovante-pagar-dialog.component.html',
    styleUrls: ['./anexa-comprovante-pagar-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class AnexaComprovantePagar_DialogComponent {


    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    
    constructor(
        public dialogRef: MatDialogRef<AnexaComprovantePagar_DialogComponent>,
        private _localStorageService: LocalStorageService,
        private httpClient: HttpClient,
        private _endpointService: EndpointService,
        @Inject(MAT_DIALOG_DATA) public data: AnexaComprovantePagar_DialogComponent_Data
    ) {

    }

    public progress: number;
    public message: string;
    @Output() public onUploadFinished = new EventEmitter();


    files: File[] = [];

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    private _obterHeaders(): any {
        let loginData = this._localStorageService.get("loginData");
        return {
            'Authorization': 'Bearer ' + loginData.token,
            'PagarIds': this.data.pagarIds
        };
    }

    onSelect(event) {
        if (this.files.length > 0)
            this.files = [];

        if (event.addedFiles[0].size > 10485760) {
            Swal.fire('Ops', 'Comprovante inválido. O arquivo deve ter no máximo 10 mb (10.000 kb).', 'warning');
        }
        else {
            this.files.push(...event.addedFiles);
        }
    }

    onRemove(event) {
        this.files.splice(this.files.indexOf(event), 1);
    }

    adicionarComprovante() {

        if (this.files.length === 0) {
            Swal.fire('Ops', 'Insira um comprovante para adicionar.', 'warning');
            return;
        }

        let fileToUpload = <File>this.files[0];

        const formData = new FormData();
        formData.append('file', fileToUpload, fileToUpload.name);

        this.httpClient.post(this._endpointService.obterUrlRestService('financeiro/contasPagar/salvarComprovantePagar')
            , formData
            , {
                reportProgress: true,
                headers: this._obterHeaders(),
                observe: 'events',
            }).subscribe(event => {
                if (event.type === HttpEventType.UploadProgress)
                    this.progress = Math.round(100 * event.loaded / event.total);
                else if (event.type === HttpEventType.Response) {

                    this.message = 'Upload success.';
                    this.onUploadFinished.emit(event.body);

                    Swal.fire('Sucesso!', 'Comprovante gravado com sucesso!', 'success');
                    this.dialogRef.close();
                }
            });
    }
}