import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { RequestLogin, ResponseLogin } from '../interfaces/login.interface';
import { EndpointService } from './endpoint.service';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    constructor(
        private _http: HttpClient,
        private _endpointService: EndpointService) { }

    login(requisicao: RequestLogin): Observable<ResponseLogin> {
        let url = this._endpointService.GetUrlRestService('login/token');
        return this._http
            .post<ResponseLogin>(url, requisicao, {
                observe: 'response',
                headers: { 'content-type': 'application/json' }
            })
            .pipe(
                map(res => {
                    return res.body;
                })
            );
    }
}