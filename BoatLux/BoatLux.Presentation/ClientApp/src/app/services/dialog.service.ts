import { Injectable } from '@angular/core';
import { ControlesImportaProdutoComponent, ControlesImportaProdutoComponentData } from '../controls/importa-produto/importa-produto.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ProdutoImportacaoModel, FornecedorImportacaoModel } from '../interfaces/cadastro.interface';
import { map, catchError } from 'rxjs/operators';
import { ControlesImportaFornecedorComponent, ControlesImportaFornecedorComponentData } from '../controls/importa-fornecedor/importa-fornecedor.component';

@Injectable()
export class DialogService {

    constructor(
        private _matDialog: MatDialog) { }

    abrirDialogGrande(component: any, data?: any): Observable<any> {
        const dialog = this._matDialog.open(component, {
            maxWidth: '100vw',
            maxHeight: '100vh',
            height: '90%',
            width: '95%',
            disableClose: true,
            data: data ? data : {}
        });

        return dialog.afterClosed().pipe(
            map(result => {

                if (result != null)
                    return result;
            }));
    }

    abrirDialogMedia(component: any, data?: any): Observable<any> {
        const dialog = this._matDialog.open(component, {
            maxWidth: '100vw',
            maxHeight: 'auto',
            height: 'auto',
            width: '80%',
            disableClose: true,
            data: data ? data : {}
        });

        return dialog.afterClosed().pipe(
            map(result => {

                if (result != null)
                    return result;
            }));
    }

    importarProduto(lojaId: number, fornecedorId?: number): Observable<ProdutoImportacaoModel> {

        let dialogData: ControlesImportaProdutoComponentData = {
            multiplosProdutos: false,
            lojas: [lojaId],
        };

        const dialog = this._matDialog.open(ControlesImportaProdutoComponent, {
            width: '100%',
            height: '85%',
            data: dialogData
        });

        return dialog.afterClosed().pipe(
            map(result => {

                if (result != null)
                    return result;
            }));
    }

    importarMultiplosProdutos(lojaIds?: number[], listaDeProdutosAdicionados?: number[], fornecedorId?: number): Observable<ProdutoImportacaoModel[]> {

        let dialogData: ControlesImportaProdutoComponentData = {
            multiplosProdutos: true,
            listaDeProdutosAdicionados: listaDeProdutosAdicionados, // Enviar produtos já adicionados para não permitir selecionar de novo
            lojas: lojaIds,
            fornecedorId: Number(fornecedorId) > 0 ? fornecedorId : 0,
        };

        const dialog = this._matDialog.open(ControlesImportaProdutoComponent, {
            width: '100%',
            height: '85%',
            data: dialogData
        });

        return dialog.afterClosed().pipe(
            map(result => {

                if (result != null)
                    return result;
            }));
    }

    importarMultiplosFornecedores(listaDeFornecedoresAdicionados?: number[], somenteFornecedoresComContato: boolean = false): Observable<FornecedorImportacaoModel[]> {

        let dialogData: ControlesImportaFornecedorComponentData = {
            listaDeFornecedoresAdicionados: listaDeFornecedoresAdicionados,
            somenteFornecedoresComContato: somenteFornecedoresComContato,
        };

        const dialog = this._matDialog.open(ControlesImportaFornecedorComponent, {
            width: '100%',
            height: '85%',
            data: dialogData
        });

        return dialog.afterClosed().pipe(
            map(result => {

                if (result != null)
                    return result;
            }));
    }
}