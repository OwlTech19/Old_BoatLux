import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import Swal from 'sweetalert2';
import { EndpointService } from './endpoint.service';

@Injectable({
    providedIn: 'root'
})
export class RelatorioService {
    constructor(
        private _http: HttpClient,
        private _localStorageService: LocalStorageService,
        private _endpointService: EndpointService
    ) { }

    private _obterHeaders(): any {
        let loginData = this._localStorageService.get("loginData");
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + loginData.token
        };
    }

    public gerarRelatorio(requisicao: any, servico: string, nome: string, visualizar: boolean = false) {

        Swal.fire({
            title: 'Gerando relatório...',            
            text: 'Aguarde enquanto o relatório é gerado...',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            }
        });

        this._http.post<any>(this._endpointService.obterUrlRestService(servico), requisicao,
            {
                observe: 'response',
                headers: this._obterHeaders(),
                responseType: 'arraybuffer' as 'json'
            }).subscribe(res => {

                Swal.close();

                let file = new Blob([res.body], { type: res.headers.get('Content-Type') });                                

                if (visualizar) {
                    var fileURL = URL.createObjectURL(file);
                    window.open(fileURL);
                }
                else {
                    const element = document.createElement('a');
                    element.href = URL.createObjectURL(file);

                    switch (Number(requisicao.formato)) {

                        case 1: //PDF
                            element.download = nome + '.pdf';
                            break;
                        case 2: //XLS
                            element.download = nome + '.xlsx';
                            break;
                    }
                    
                    document.body.appendChild(element);
                    element.click();
                }
            }, (err) => {        

                    try {
                        let jsonString = String.fromCharCode.apply(null, new Int8Array(err.error));
                        let jsonObject = JSON.parse(jsonString);
                        Swal.fire('Ops!', jsonObject.Message, 'warning');
                    }
                    catch
                    {
                        Swal.fire('Ops!', 'Ocorreu um problema ao gerar o relatório.', 'error');
                    }
            });

    }
}