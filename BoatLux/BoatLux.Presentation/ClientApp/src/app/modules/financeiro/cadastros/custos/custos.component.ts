import { AfterViewInit, ViewEncapsulation, Component, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import Swal from "sweetalert2";
// Services
import { FuseNavigationService } from "../../../../../@fuse/components/navigation/navigation.service";
import { FinanceiroService } from "../../../../services/financeiro.service";
// Interface
import { Costs, RequestSearchCosts, ResponseSearchCosts } from "../../../../interfaces/financeiro.interface";
// Components
import { ControlesLegendaComponent } from "../../../../controls/legenda/legenda.component";
import { MatDialog } from "@angular/material/dialog";
import { CadastroCustos_DialogComponent } from "./cadastro-custos-dialog/cadastro-custos-dialog.component";

@Component({
    selector: 'custos',
    templateUrl: './custos.component.html',
    encapsulation: ViewEncapsulation.None
})

export class CustosComponent implements AfterViewInit {

    // -----------------------------------------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------------------------------------
    constructor(
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _fuseNavigationService: FuseNavigationService,
        private _financeiroService: FinanceiroService,
    ) {
        // Navigation
        this._fuseNavigationService.setCurrentNavigation('financeiro_navigation');
    }

    // -----------------------------------------------------------------------------------------------------
    // Properties
    // -----------------------------------------------------------------------------------------------------    
    // Injected Properties
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('legenda') legenda: ControlesLegendaComponent;

    // List of costs
    costsDataSource: Costs[];

    //Flag loading
    displayLoading = false;
    hasItems = false;

    // Search Form definition
    searchFormGroup = this._formBuilder.group(
        {
            costId: [],
            description: [],
            costType: [],
        }
    );

    // Grid columns
    gridColumns = ['costId', 'description', 'costType', 'actions'];

    // -----------------------------------------------------------------------------------------------------
    // Methods
    // -----------------------------------------------------------------------------------------------------
    reset(): void {
        this.searchFormGroup.reset();
        this.searchItems(true);
    }

    searchItems(newSearch: boolean): void {
        console.log('buscou');

        if (newSearch)
            this.paginator.pageIndex = 0;

        this.displayLoading = true;
        this.hasItems = false;

        let request: RequestSearchCosts =
        {
            pagination: {
                currentPage: this.paginator.pageIndex,
                itemsPerPage: this.paginator.pageSize,
                columnOrdering: this.sort.active,
                directionOrdering: this.sort.direction
            },

            costId: Number(this.searchFormGroup.value.costId),
            description: this.searchFormGroup.value.description,
            costType: Number(this.searchFormGroup.value.costType),

        };

        this._financeiroService.CostsSearchItems(request).subscribe((response: ResponseSearchCosts) => {


            this.displayLoading = false;
            this.hasItems = response.items.length > 0;
            this.costsDataSource = response.items;

            this.legenda.quantidadeResultados = response.paginacao.totalItems;
            this.paginator.length = response.paginacao.totalItems;
            this.paginator.page.subscribe(() => {
                //este trecho vai ser executado quando houver uma mudança de página ou tamanho da página

            });

        }, (err) => {

            this.displayLoading = false;

            Swal.fire({
                title: 'Desculpe!',
                text: "Não foi possível concluir a busca de custos. Deseja tentar novamente?",
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim!',
                cancelButtonText: 'Não!'
            }).then((result) => {
                if (result.value) {
                    this.searchItems(true);
                }
            })
        });
    }

    changeStatus(status: number): void {

        console.log('alterou status');
    }

    newCost(): void {

        console.log('modal novo custo');

        const dialog = this._matDialog.open(CadastroCustos_DialogComponent, {
            width: '70%'
        });

        dialog.afterClosed().subscribe(reload => {

            if (reload)
                this.searchItems(false);
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // Lifecycle Hooks
    // -----------------------------------------------------------------------------------------------------
    ngAfterViewInit(): void {

    }
}