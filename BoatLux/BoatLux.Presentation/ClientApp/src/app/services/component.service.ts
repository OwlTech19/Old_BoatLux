import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { EndpointService } from './endpoint.service';
import { FuseNavigationService } from '../../@fuse/components/navigation/navigation.service';

@Injectable({
    providedIn: 'root'
})
export class ComponentService {
    constructor(private _fuseNavigationService: FuseNavigationService) { }

    public DefinirModuloAtual(modulo: Modulos) {

        switch (modulo) {

            case Modulos.Cadastro:

                // Define o menu de navegação
                this._fuseNavigationService.setCurrentNavigation('cadastro_navigation');
                break;

            case Modulos.Financeiro:

                // Define o menu de navegação
                this._fuseNavigationService.setCurrentNavigation('financeiro_navigation');
                break;

            case Modulos.Compras:

                // Define o menu de navegação
                this._fuseNavigationService.setCurrentNavigation('compras_navigation');
                break;
        }        
    }
}

export enum Modulos {
    Compras,
    Financeiro,
    Cadastro
}