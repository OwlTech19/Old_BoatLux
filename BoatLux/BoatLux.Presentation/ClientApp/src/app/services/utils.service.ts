import { Injectable } from "@angular/core";
import * as moment from 'moment';
// Services
import { LocalStorageService } from "./local-storage.service";
// Interfaces
import { Parametros } from "../interfaces/uteis.interface";

@Injectable({
    providedIn: 'root'
})

export class UtilsService {

    constructor(
        private _localStorageService: LocalStorageService
    ) { }

    // Chave do cache de parâmetros
    private _keyParams = 'parametros';

    public lojaLogada = this._localStorageService.get('lojaLogada');

    // Commom
    filterUnique() {
        return (value, index, self) => {
            return self.indexOf(value) === index
        }
    }

    strToNumber(value: string) {
        return Number(value.toString().replace(/[^-0-9,]*/g, '').replace(',', '.'))
    }

    // Métodos que verificam qtd dias vencidos
    verificarVencidosTrinta(dtVencto: Date): boolean {

        if (moment(new Date().getDate(), "DD/MM/YYYY") > moment(dtVencto, "DD/MM/YYYY") && moment(new Date().getDate(), "DD/MM/YYYY").add(-30, 'days') <= moment(dtVencto, "DD/MM/YYYY"))
            return true;
        else
            return false;
    }

    verificarVencidosTrintaSessenta(dtVencto: Date): boolean {

        if (moment(new Date().getDate(), "DD/MM/YYYY").add(-31, 'days') >= moment(dtVencto, "DD/MM/YYYY") && moment(new Date().getDate(), "DD/MM/YYYY").add(-60, 'days') <= moment(dtVencto, "DD/MM/YYYY"))
            return true;
        else
            return false;
    }

    verificarVencidosSessenta(dtVencto: Date): boolean {

        if (moment(new Date().getDate(), "DD/MM/YYYY").add(-61, 'days') >= moment(dtVencto, "DD/MM/YYYY"))
            return true;
        else
            return false;
    }

    // Máscaras
    maskDesconto(tipoDesconto: number) {
        if (tipoDesconto == 1) // %
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else // R$
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    maskJuros(tipoJuros: number) {
        if (tipoJuros == 1) // %
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else // R$
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    maskMulta(tipoMulta: number) {
        if (tipoMulta == 1) // %
            return { prefix: '', suffix: '% ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 2, inputMode: 1 };
        else // R$
            return { prefix: 'R$ ', thousands: '.', decimal: ',', allowNegative: true, allowZero: true, nullable: false, align: 'right', precision: 3, inputMode: 1 };
    }

    // Parâmetros
    lerParam(parametro: string, lojaId: number): any {
        var _parametros: Parametros[] = this._localStorageService.get(this._keyParams).filter(i => i.id == Number(lojaId));

        switch (parametro.toLowerCase()) {
            case 'cnpj':
                return _parametros[0].cnpj;
            case 'liberapagar':
                return _parametros[0].liberaPagar;
            case 'baixaretropagar':
                return _parametros[0].baixaRetroPagar;
            case 'operacaopagar':
                return _parametros[0].operacaoPagar;
            case 'baixaretroreceber':
                return _parametros[0].baixaRetroReceber;
            case 'diaspermitebaixa':
                return _parametros[0].diasPermiteBaixa;
            case 'baixafutura':
                return _parametros[0].baixaFutura;
            case 'diaspermitebaixafutura':
                return _parametros[0].diasPermiteBaixaFutura;
            case 'impressaocomprovantepagara4':
                return _parametros[0].impressaoComprovantePagarA4;
            case 'tokenboleto':
                return _parametros[0].tokenBoleto;
            case 'comprovpagamento':
                return _parametros[0].comprovPagamento;
        }
    }

    // Datas
    obterMinDatePagto(lojaId: number): any {

        var diasPermiteBaixa = Number(this.lerParam('diaspermitebaixa', lojaId));

        if (this.lerParam('baixaretroreceber', lojaId) == 'S')
            return moment(new Date().getDate(), "DD/MM/YYYY");
        else if (this.lerParam('baixaretroreceber', lojaId) == 'N' && diasPermiteBaixa > 0)
            return moment(new Date().getDate(), "DD/MM/YYYY").add(-diasPermiteBaixa, 'days');
        else
            return moment(new Date().getDate(), "DD/MM/YYYY").add(-2000, 'days');
    }

    obterMaxDatePagto(lojaId: number): any {

        var diasPermiteBaixaFutura = Number(this.lerParam('diaspermitebaixafutura', lojaId));

        if (this.lerParam('baixafutura', lojaId) == 'S')
            return moment(new Date().getDate(), "DD/MM/YYYY");
        else if (this.lerParam('baixafutura', lojaId) == 'N' && diasPermiteBaixaFutura > 0)
            return moment(new Date().getDate(), "DD/MM/YYYY").add(diasPermiteBaixaFutura, 'days');
        else
            return moment(new Date().getDate(), "DD/MM/YYYY").add(2000, 'days');
    }
}