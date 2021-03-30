import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { ResultadoListaAcessosRapidosUsuarioModel, ItemListaAcessosRapidosUsuarioModel } from '../interfaces/uteis.interface';

const ChavePermissoes = 'permissoes';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    constructor(private _localStorageService: LocalStorageService) { }

    private chaveLista = "LISTA_ACESSOS_RAPIDOS_USUARIO";

    cadastrarAcessoRapido(url: string, modulo: string, titulo: string) {

        var listaExistente = this._localStorageService.get(this.chaveLista);

        if (listaExistente != undefined && listaExistente != null && listaExistente != [] && listaExistente != '' && listaExistente.itens != undefined && listaExistente.itens != null) {

            listaExistente.itens.push(
                {
                    modulo: modulo,
                    titulo: titulo,
                    url: url
                }
            );

            this._localStorageService.set(listaExistente, this.chaveLista);
        }
        else {

            let novaLista: ResultadoListaAcessosRapidosUsuarioModel =
            {
                itens: [
                    {
                        modulo: modulo,
                        titulo: titulo,
                        url: url
                    }
                ]
            };

            this._localStorageService.set(novaLista, this.chaveLista);
        }

    }

    excluirAcessoRapido(url: string) {

        var listaExistente = this._localStorageService.get(this.chaveLista);

        if (listaExistente != undefined && listaExistente != null && listaExistente != [] && listaExistente != '' && listaExistente.itens != undefined && listaExistente.itens != null) {
       
            listaExistente.itens = listaExistente.itens.filter(function (value, index, arr) { return value.url != url; });

            this._localStorageService.set(listaExistente, this.chaveLista);
        }
    }

    possuiAcessorRapido(url: string) : boolean {

        var listaExistente = this._localStorageService.get(this.chaveLista);

        if (listaExistente != undefined && listaExistente != null && listaExistente != [] && listaExistente != '' && listaExistente.itens != undefined && listaExistente.itens != null) {
            return listaExistente.itens.filter(function (value, index, arr) { return value.url == url; }).length > 0;            
        }
        else {
            return false
        }
    }

    obterAcessosRapidos(): ItemListaAcessosRapidosUsuarioModel[] {

        var listaExistente = this._localStorageService.get(this.chaveLista);

        if (listaExistente != undefined && listaExistente != null && listaExistente != [] && listaExistente != '' && listaExistente.itens != undefined && listaExistente.itens != null) {
            return listaExistente.itens;
        }
        else {
            return null;
        }

    }

    // Verificações de Permissão de Usuário
    checkPermissionControl(menu: string, permissao: string): boolean {

        var permissoesUsuario = this._localStorageService.get(ChavePermissoes);

        var permissaoFiltrada = permissoesUsuario.find(i => i.codMenu == menu && i.permissao != null);

        if (permissaoFiltrada) {

            switch (permissao) {
                case 'acessar':
                    if (permissaoFiltrada.permissao.includes(Permissao.Acessar))
                        return true;
                    else
                        return false;
                case 'incluir':
                    if (permissaoFiltrada.permissao.includes(Permissao.Incluir))
                        return true;
                    else
                        return false;
                case 'editar':
                    if (permissaoFiltrada.permissao.includes(Permissao.Editar))
                        return true;
                    else
                        return false;
                case 'excluir':
                    if (permissaoFiltrada.permissao.includes(Permissao.Excluir))
                        return true;
                    else
                        return false;
                case 'consultar':
                    if (permissaoFiltrada.permissao.includes(Permissao.Consultar))
                        return true;
                    else
                        return false;
                case 'pesquisar':
                    if (permissaoFiltrada.permissao.includes(Permissao.Pesquisar))
                        return true;
                    else
                        return false;
                case 'imprimir':
                    if (permissaoFiltrada.permissao.includes(Permissao.Imprimir))
                        return true;
                    else
                        return false;
                case 'visualizarSenhaGerencia':
                    if (permissaoFiltrada.permissao.includes(Permissao.VisualizarSenhaGerencia))
                        return true;
                    else
                        return false;

                default:
                    return false;
            }
        }
        else
            return false;

    }
}

export enum Permissao {
    Acessar,
    Incluir,
    Editar,
    Excluir,
    Consultar,
    Pesquisar,
    Imprimir,
    VisualizarSenhaGerencia
}