import { Component, OnInit, Input, EventEmitter, Output, ViewChild, AfterContentInit, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { startWith, map, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { BuscaRapidaService } from '../../services/busca-rapida.service';
import { ResultadoBuscaRapida, RequisicaoBuscaRapida } from '../../interfaces/busca-rapida.interface';
import { MatSelect } from '@angular/material/select';
import { LocalStorageService } from '../../services/local-storage.service';
import { createWriteStream } from 'fs';

@Component({
    selector: 'controles-combo-loja',
    templateUrl: './combo-loja.component.html'
})

export class ControlesComboLojaComponent implements AfterViewInit {

    constructor(
        private _localStorageService: LocalStorageService,
    ) { }

    lojaFormControl = new FormControl();
    @Input() formControlName: string;
    @Input() multiLoja: boolean;
    @Input() formGroup: FormGroup;
    @Input() titulo: string;
    @Output() alterado = new EventEmitter();
    @Output() aoSelecionarLoja = new EventEmitter();

    label: string;
    placeholder: string;
    marcarTodas: boolean = true;

    dispararEventoAlteracao() {
        this.alterado.emit();
        this.aoSelecionarLoja.emit();
    }

    //Lojas disponíveis
    public lojasDisponiveis = []

    public definirLojaSelecionada(codigo?: number) {
        if (codigo != null) {
            this.lojaFormControl.setValue(codigo.toString());
        }
    }

    public definirLojasSelecionadas(codigos?: number[]) {
        if (codigos != null) {
            this.lojaFormControl.setValue(codigos.map(i => i.toString()));
        }
    }

    public obterLojaSelecionada(): number {
        if (this.lojaFormControl.value)
            return Number(this.lojaFormControl.value);
        else
            return 0;
    }

    public obterLojasSelecionadas(): number[] {
        if (this.lojaFormControl.value)
            return this.lojaFormControl.value.map(Number);
        else
            return [];
    }

    marcarDesmarcarTodas(matSelect: MatSelect) {
        if (this.marcarTodas) {
            this.lojaFormControl.setValue(this.lojasDisponiveis.map(i => i.id.toString()));
            matSelect.close();
        }
        else {
            this.lojaFormControl.setValue(null);
        }

        this.marcarTodas = !this.marcarTodas;
        this.dispararEventoAlteracao();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
        * AfterViewInit
        */
    ngAfterViewInit(): void {

        let loginData = this._localStorageService.get("loginData");
        let lojaLogada = 1; // Caso não encontre loja logada por algum motivo, default é 1

        //Carrega as lojas
        if (loginData && loginData.lojas) {
            this.lojasDisponiveis = loginData.lojas.map(i => ({ id: i.id, name: i.nome }));
            lojaLogada = loginData.codLoja;
        }

        // Set in storage lojaLogada
        this._localStorageService.set(lojaLogada, 'lojaLogada');

        //Informações de tela padrão
        if (this.multiLoja) {
            this.label = this.titulo != null && this.titulo != '' ? this.titulo : 'Lojas';
            this.placeholder = 'Selecione as lojas';
            this.definirLojasSelecionadas([lojaLogada]);
            this.aoSelecionarLoja.emit();
        }
        else {
            this.label = this.titulo != null && this.titulo != '' ? this.titulo : 'Loja';
            this.placeholder = 'Selecione a loja';
            this.definirLojaSelecionada(lojaLogada);
            this.aoSelecionarLoja.emit();
        }
    }
}