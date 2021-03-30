import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { ResultadoBuscaRapida, RequisicaoBuscaRapida } from '../interfaces/busca-rapida.interface';
import { EndpointService } from './endpoint.service';

@Injectable({
    providedIn: 'root'
})
export class BuscaRapidaService {
    constructor(
        private _http: HttpClient,
        private _localStorageService: LocalStorageService,
        private _endpointService: EndpointService) { }    

    private _obterHeaders(): any {
        let loginData = this._localStorageService.get("loginData");
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + loginData.token
        };
    }

    buscar(requisicao: RequisicaoBuscaRapida): Observable<ResultadoBuscaRapida> {
        let url = this._endpointService.obterUrlRestService('buscaRapida/buscar');
        let data = JSON.stringify(requisicao)

        return this._http
            .post<ResultadoBuscaRapida>(url, data, {
                observe: 'response',                
                headers: this._obterHeaders()
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }
}