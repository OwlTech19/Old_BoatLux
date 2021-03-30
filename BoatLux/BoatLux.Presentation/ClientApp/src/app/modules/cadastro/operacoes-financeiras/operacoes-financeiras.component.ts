import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, Directive, HostListener } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { startWith, map, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CadastroService } from '../../../services/cadastro.service';
import { OperacaoFinanceiraModel, RequisicaoBuscaOperacaoFinanceiraModel, RequisicaoSalvarOperacaoFinanceiraModel, RequisicaoApagarOperacaoFinanceiraModel, RequisicaoRelatorioFinanceiroOperacoesFinanceirasModel } from '../../../interfaces/cadastro.interface';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2'
import { MatDialog } from '@angular/material/dialog';
import { CadastroDialogComponent } from './cadastro-dialog/cadastro-dialog.component';

@Component({
    selector: 'operacoes-financeiras',
    templateUrl: './operacoes-financeiras.component.html',
    encapsulation: ViewEncapsulation.None
})

export class OperacoesFinanceirasComponent implements OnInit, OnDestroy {

    // -----------------------------------------------------------------------------------------------------
    // Construtor
    // -----------------------------------------------------------------------------------------------------    

    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _cadastroService: CadastroService,

    ) {
        // Define o menu de navegação
        this._fuseNavigationService.setCurrentNavigation('cadastro_navigation');
    }

    // -----------------------------------------------------------------------------------------------------
    // Propriedades
    // -----------------------------------------------------------------------------------------------------    

    //Armazena os produtos em memória
    itensDataSource = new MatTableDataSource<OperacaoFinanceiraModel>();

    //Propriedades injetadas do grid de produtos
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    //Configuração da tela de novo item / edição de item        
    idCadastro = 0;
    processandoCadastro = false;
    novoCadastro = true;

    //Flag que indica se os itens estão sendo carregados
    exibeItensCarregando = false;
    temItens = false;

    //Definição do formulário de busca
    buscaFormGroup = this._formBuilder.group(
        {
            filtroId: [],
            filtroDescricao: []
        }
    );

    //Colunas do grid
    colunasItens = ['id', 'descricao', 'acoes'];

    // -----------------------------------------------------------------------------------------------------
    // Métodos
    // -----------------------------------------------------------------------------------------------------    

    //Abre janela de cadastro de um novo item
    novoItem() {

        const dialog = this._matDialog.open(CadastroDialogComponent, {
            width: '500px',
            data: { item: null },
            disableClose: true
        });

        dialog.afterClosed().subscribe(result => {
            if (result && result.sucesso)
                this.buscarItens();
        });
    }

    //Abre janela de alteração do item
    editarItem(item: OperacaoFinanceiraModel) {

        const dialog = this._matDialog.open(CadastroDialogComponent, {
            width: '500px',
            data: { item: item },
            disableClose: true
        });

        dialog.afterClosed().subscribe(result => {
            if (result && result.sucesso)
                this.buscarItens();
        });
    }

    //Remove o item através do serviço
    apagarItem(item: OperacaoFinanceiraModel) {

        Swal.fire({
            title: 'Atenção',
            text: "Deseja mesmo remover o cadastro '" + item.descricao + "'?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, remover!',
            cancelButtonText: 'Não remover!'
        }).then((result) => {
            if (result.value) {
                let requisicao: RequisicaoApagarOperacaoFinanceiraModel =
                {
                    id: item.id
                };
                this._cadastroService.financeiro_ApagarOperacaoFinanceira(requisicao).subscribe((resultado) => {

                    if (resultado.sucesso) {
                        this.buscarItens();
                        Swal.fire('Pronto!', 'O cadastro foi apagado com sucesso!', 'success');
                    }
                    else {

                        Swal.fire('Ops!', 'O cadastro não pode ser apagado, possivelmente existe outro cadastro relacionado a ele. Detalhes: ' + resultado.erro, 'error');
                    }

                }, (err) => {

                    Swal.fire('Ops!', 'Não foi possível apagar o cadastro.', 'error');
                });
            }
        })
    }

    //Limpa os filtros e busca novamente
    limparBusca(): void {

        this.buscaFormGroup.reset();
        this.buscarItens();
    }

    imprimirBusca(formato: number, visualizar: boolean = false): void {

        let requisicao: RequisicaoRelatorioFinanceiroOperacoesFinanceirasModel =
        {
            formato: formato,
            busca:
            {
                filtroId: this.buscaFormGroup.value.filtroId,
                filtroDescricao: this.buscaFormGroup.value.filtroDescricao
            }
        };

        this._cadastroService.financeiro_gerarRelatorioOperacoesFinanceiras(requisicao, 'Relatório de Operações Financeiras', visualizar);        
    }

    //Busca os itens no serviço
    buscarItens(): void {
        this.exibeItensCarregando = true;
        this.temItens = false;

        let requisicao: RequisicaoBuscaOperacaoFinanceiraModel =
        {
            filtroId: this.buscaFormGroup.value.filtroId,
            filtroDescricao: this.buscaFormGroup.value.filtroDescricao
        };

        this._cadastroService.financeiro_BuscarOperacoesFinanceiras(requisicao).subscribe((resultado) => {


            this.exibeItensCarregando = false;
            this.temItens = resultado.itens.length > 0;
            this.itensDataSource = new MatTableDataSource(resultado.itens);

            this.itensDataSource.sort = this.sort;
            this.itensDataSource.paginator = this.paginator;
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

    // -----------------------------------------------------------------------------------------------------
    // Métodos de ciclo de vida
    // -----------------------------------------------------------------------------------------------------    

    /**
        * On init
        */
    ngOnInit(): void {
        this.buscarItens();
    }

    /**<
     * On destroy
     */
    ngOnDestroy(): void {
    }
}