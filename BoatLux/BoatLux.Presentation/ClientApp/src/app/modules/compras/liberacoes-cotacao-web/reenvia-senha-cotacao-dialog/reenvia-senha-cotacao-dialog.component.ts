import { Component, ViewChild, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ComprasService } from '../../../../services/compras.service';
import { CadastroService } from '../../../../services/cadastro.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ControlesBuscaRapidaComponent } from '../../../../controls/busca-rapida/busca-rapida.component';
import Swal from 'sweetalert2'
import { ControlesDetalhesProdutoComponent } from '../../../../controls/detalhes-produto/detalhes-produto.component';
import { RelatorioService } from '../../../../services/relatorio.service';
import { ControlesComboLojaComponent } from '../../../../controls/combo-loja/combo-loja.component';
import { DialogService } from '../../../../services/dialog.service';
import { error } from '@angular/compiler/src/util';
import { MatTabGroup } from '@angular/material/tabs';
import { FornecedorCotacaoModel, RequisicaoBuscaFornecedorCotacaoModel, RequisicaoReenviaSenhaCotacaoModel } from '../../../../interfaces/compras.interface';
import { SelectionModel } from '@angular/cdk/collections';

export interface DialogData {
    idCotacao: number;
    idLoja: number;
}

@Component({
    selector: 'reenvia-senha-cotacao-dialog',
    templateUrl: './reenvia-senha-cotacao-dialog.component.html',
})

export class ReenviaSenhaCotacaoDialogComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        public dialogRef: MatDialogRef<ReenviaSenhaCotacaoDialogComponent>,
        private _formBuilder: FormBuilder,
        private _comprasService: ComprasService,
        private _dialogService: DialogService,
        private _matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private el: ElementRef) {

        this.titulo = "Reenviar senhas da cotação " + data.idCotacao;
        this.cotacaoId = data.idCotacao;
        this.lojaId = data.idLoja;
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em memória
    itensDataSource: FornecedorCotacaoModel[];
    itensSelecionados = new SelectionModel<FornecedorCotacaoModel>(true, []);

    //Flag que indica se os itens estão sendo carregados
    exibeItensCarregando = false;
    temItens = false;

    titulo: string;
    cotacaoId: number;
    lojaId: number;

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


    //Definição dos formulários
    buscaFormGroup = this._formBuilder.group(
        {
            fornecedorId: [],
            cnpjCpf: [],
            razao: []
        }
    );

    //Colunas do grid
    colunasItens = ['select', 'fornecedorId', 'cnpjCpf', 'razao', 'celular', 'email', 'senha'];

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------   



    // Controle de itens selecionados
    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.itensSelecionados.selected.length;
        const numRows = this.itensDataSource.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.itensSelecionados.clear() :
            this.itensDataSource.forEach(row => this.itensSelecionados.select(row));
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: FornecedorCotacaoModel): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.itensSelecionados.isSelected(row) ? 'deselect' : 'select'} row ${row.fornecedorId + 1}`;
    }

    //Limpa os filtros e busca novamente
    limparBusca(): void {
        this.buscaFormGroup.reset();
        this.buscarItens();
    }

    //Busca os fornecedores da cotacao no serviço
    buscarItens(): void {
        this.exibeItensCarregando = true;
        this.temItens = false;

        let requisicao: RequisicaoBuscaFornecedorCotacaoModel =
        {
            paginacao: {
                paginaAtual: this.paginator.pageIndex,
                itensPorPagina: this.paginator.pageSize,
                colunaOrdenacao: this.sort.active,
                direcaoOrdenacao: this.sort.direction
            },

            cotacaoId: this.cotacaoId,
            lojaId: this.lojaId,
            fornecedorId: this.buscaFormGroup.value.fornecedorId,
            cnpjCpf: this.buscaFormGroup.value.cnpjCpf,
            razao: this.buscaFormGroup.value.razao
        };

        this._comprasService.buscarFornecedoresCotacaoWeb(requisicao).subscribe((resultado) => {

            this.exibeItensCarregando = false;
            this.temItens = resultado.itens.length > 0;
            this.itensDataSource = resultado.itens;

            this.paginator.length = resultado.paginacao.totalItens;
            this.paginator.page.subscribe(() => {

                //este trecho vai ser executado quando houver uma mudança de página ou tamanho da página
                this.buscarItens();

            });

        }, (err) => {

            this.exibeItensCarregando = false;

            Swal.fire({
                title: 'Ops!',
                text: "Não conseguimos concluir a busca, deseja tentar novamente??",
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim!',
                cancelButtonText: 'Não!'
            }).then((result) => {
                if (result.value) {
                    this.buscarItens();
                }
            })
        });
    }

    //Reenvia as senhas aos fornecedores da cotacao através do serviço
    reenviarSenha(): void {

        if (this.itensSelecionados.selected.length > 0) {

            let requisicao: RequisicaoReenviaSenhaCotacaoModel =
            {
                cotacaoId: this.cotacaoId,
                lojaId: this.lojaId,
                fornecedorId: this.itensSelecionados.selected.map(i => i.fornecedorId),
            };

            this._comprasService.reenviarSenhaCotacaoWeb(requisicao).subscribe((resultado) => {
                if (resultado.sucesso) {
                    Swal.fire('Pronto!', 'Senhas reenviadas com sucesso!', 'success');
                    this.buscarItens();
                }
                else {
                    Swal.fire('Ops!', 'As senhas não foram reenviadas. Detalhes: ' + resultado.erro, 'error');
                }
            }, (err) => {

                Swal.fire('Ops!', 'As senhas não foram reenviadas.', 'error');
            });
        }
        else {
            Swal.fire('Ops!', 'Selecione fornecedores para reenviar a senha!', 'warning');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    ngAfterViewInit(): void {
        this.buscarItens();
    }
}