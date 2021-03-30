import { Injectable, Inject } from '@angular/core';
import { WINDOW } from '../providers/window.provider';

@Injectable()
export class EndpointService {
    constructor(
        @Inject(WINDOW) private window: Window
    ) { }

    /*Remover o método abaixo quando remover as referencias*/
    public obterUrlRestService(servico: string): string {
        let hostName = this.window.location.hostname.toLowerCase();
        switch (hostName) {
            case 'boatlux-homologacao.com.br':
                return 'https://boatlux-homologacao.com.br/rest/api/' + servico;
            default:
                return 'http://localhost:8000/api/' + servico;
        }
    }

    public GetUrlRestService(servico: string): string {
        let hostName = this.window.location.hostname.toLowerCase();
        switch (hostName) {
            case 'boatlux-homologacao.com.br':
                return 'https://boatlux-homologacao.com.br/rest/api/' + servico;
            default:
                return 'http://localhost:44366/api/' + servico;
        }
    }
}