import { SortDirection } from '@angular/material/sort';

/*
* Boatlux
*/

export interface RequestSearchPaginatedModel {
    currentPage: number;
    itemsPerPage: number;
    columnOrdering: string;
    directionOrdering: SortDirection
}

export interface ResponseSearchPagetedModel {
    currentPage: number;
    totalItems: number;
}

export interface RequisicaoBuscaPaginadaModel {
    paginaAtual: number;
    itensPorPagina: number;
    colunaOrdenacao: string;
    direcaoOrdenacao: SortDirection
}

export interface ResultadoBuscaPaginadaModel {
    paginaAtual: number;
    totalItens: number;
}

export interface ResultadoListaAcessosRapidosUsuarioModel {
    itens: ItemListaAcessosRapidosUsuarioModel[];
}

export interface ItemListaAcessosRapidosUsuarioModel {
    modulo: string;
    titulo: string;
    url: string;
}

export interface Parametros {
    cnpj?: string;
    lojaId?: number;
    cCustoReceber?: string;
    tipoDocumentoReceber?: number;
    operacaoReceber?: number;
    bancoReceber?: string;
    gerarReceberTroca?: string;
    compraGeraPagar?: string;
    reajustePrecoCompras?: string;
    tipoDescMaxFatura?: string;
    descMaxFat?: number;
    mostrarDtVenctoOriginal?: string;
    codContaReceber?: number;
    configBaixa?: string;
    bancoPagar?: string;
    tipoDocumentoPagar?: number;
    operacaoPagar?: number;
    cCustoPagar?: string;
    liberaPagar?: string;
    baixaRetroReceber?: string;
    diasPermiteBaixa?: number;
    baixaFutura?: string;
    diasPermiteBaixaFutura?: number;
    baixaRetroPagar?: string;
    impressaoComprovantePagarA4?: string;
    tokenBoleto?: string;
    comprovPagamento?: string;
}