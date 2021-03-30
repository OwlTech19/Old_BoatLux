import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario-service.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'titulo-pagina',
    templateUrl: './titulo-pagina.component.html'
})

export class ControlesTituloPaginaComponent implements OnInit {

    @Input() titulo: string;
    @Input() subTitulo: string;
    @Input() ocultaFavoritar: boolean;
    _favoritada: boolean = false;

    constructor(private _title: Title,
        private _router: Router,
        private _usuarioService: UsuarioService) {
        this._favoritada = _usuarioService.possuiAcessorRapido(this._router.url);
    }

    private favoritarPagina(): void {
        if (!this._favoritada) {
            this._usuarioService.cadastrarAcessoRapido(this._router.url, this.titulo, this.subTitulo);
            this._favoritada = true;
            Swal.fire('Página adicionada!', 'A página foi adicionada aos favoritos e pode ser acessada através do menu "Favoritos" localizado no topo da página.', 'success');
        }
        else {
            this._usuarioService.excluirAcessoRapido(this._router.url);
            this._favoritada = false;
            Swal.fire('Página removida!', 'A página foi removida dos favoritos.', 'success');
        }
    }
    ngOnInit(): void {
        this._title.setTitle('BoatLux' + (this.titulo != null && this.titulo != '' ? ' - ' + this.titulo : '') + (this.subTitulo != null && this.subTitulo != '' ? ' - ' + this.subTitulo : ''));        
    }
}