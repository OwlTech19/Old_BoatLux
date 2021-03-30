import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'controles-legenda',
    templateUrl: './legenda.component.html',    
    encapsulation: ViewEncapsulation.None
})

export class ControlesLegendaComponent {

    @Input() itens: ItemLegenda[] = [];
    @Input() quantidadeResultados?: number = null;

    constructor() {
    }
}

export interface ItemLegenda {
    titulo: string;
    cor: string;    
}
