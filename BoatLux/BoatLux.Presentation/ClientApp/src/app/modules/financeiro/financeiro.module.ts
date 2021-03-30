//Módulos
import { RouteProtectionService } from '../../services/route-protection.service';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { LocalStorageService } from '././../../services/local-storage.service';
import { NgxCurrencyModule } from "ngx-currency";
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { SharedModule } from '../../shared.module';
import { NgxDropzoneModule } from 'ngx-dropzone';

//Páginas

import { FinanceiroDashboardComponent } from './dashboard/dashboard.component';
import { FinanceiroDashboardService } from './dashboard/dashboard.service';
import { FinanceiroContasPagarComponent } from './contas-pagar/contas-pagar.component';
import { FinanceiroContasReceberComponent } from './contas-receber/contas-receber.component';
import { AgrupaTitulosComponent } from '../financeiro/agrupa-titulos/agrupa-titulos.component';
import { BaixaContasReceberComponent } from '../financeiro/baixa-contas-receber/baixa-contas-receber.component';
import { OperacoesBancariasComponent } from '../financeiro/operacoes-bancarias/operacoes-bancarias.component';
import { BaixaContasPagarComponent } from '../financeiro/baixa-contas-pagar/baixa-contas-pagar.component';
import { RelatorioFluxoCaixaComponent } from '../financeiro/relatorio-fluxo-caixa/relatorio-fluxo-caixa.component';

//Páginas - Boatlux
import { CustosComponent } from '../financeiro/cadastros/custos/custos.component';

//Dialogs
import { AtribuirInformacoesTitulos_DialogComponent } from './atribuir-informacoes-titulos-dialog/atribuir-informacoes-titulos-dialog.component';
import { CadastroContasReceber_DialogComponent } from './contas-receber/cadastro-contas-receber-dialog/cadastro-contas-receber-dialog.component';
import { FiltroRelContasReceber_DialogComponent } from './contas-receber/filtro-rel-contas-receber-dialog/filtro-rel-contas-receber-dialog.component';
import { BaixaContasReceberMultiplos_DialogComponent } from './baixa-contas-receber/baixa-contas-receber-multiplos/baixa-contas-receber-multiplos-dialog.component';
import { BaixaContasReceberIndividual_DialogComponent } from './baixa-contas-receber/baixa-contas-receber-individual/baixa-contas-receber-individual-dialog.component';
import { BaixaContasReceberValor_DialogComponent } from './baixa-contas-receber/baixa-contas-receber-valor/baixa-contas-receber-valor-dialog.component';
import { CadastroOperacaoBancaria_DialogComponent } from './operacoes-bancarias/cadastro-operacao-bancaria-dialog/cadastro-operacao-bancaria-dialog.component';
import { CadastroContasPagar_DialogComponent } from './contas-pagar/cadastro-contas-pagar-dialog/cadastro-contas-pagar-dialog.component';
import { BaixaContasPagarMultiplos_DialogComponent } from './baixa-contas-pagar/baixa-contas-pagar-multiplos-dialog/baixa-contas-pagar-multiplos-dialog.component';
import { BaixaContasPagarIndividual_DialogComponent } from './baixa-contas-pagar/baixa-contas-pagar-individual-dialog/baixa-contas-pagar-individual-dialog.component';
import { FiltroExtratoBancario_DialogComponent } from './operacoes-bancarias/filtro-extrato-bancario-dialog/filtro-extrato-bancario-dialog.component';
import { FiltroRelContasPagar_DialogComponent } from './contas-pagar/filtro-rel-contas-pagar-dialog/filtro-rel-contas-pagar-dialog.component';
import { EmissaoBoletos_DialogComponent } from '../financeiro/contas-receber/emissao-boletos-dialog/emissao-boletos-dialog.component';
import { AnexaComprovantePagar_DialogComponent } from './baixa-contas-pagar/anexa-comprovante-pagar-dialog/anexa-comprovante-pagar-dialog.component';

// Dialogs - Boatlux
import { CadastroCustos_DialogComponent } from './cadastros/custos/cadastro-custos-dialog/cadastro-custos-dialog.component';

const routes = [
    {
        path: 'dashboard',
        component: FinanceiroDashboardComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'contas-pagar',
        component: FinanceiroContasPagarComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'baixa-contas-pagar',
        component: BaixaContasPagarComponent,
        canActivate: [RouteProtectionService]
    }
    ,
    {
        path: 'contas-receber',
        component: FinanceiroContasReceberComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'baixa-contas-receber',
        component: BaixaContasReceberComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'agrupa-titulos',
        component: AgrupaTitulosComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'operacoes-bancarias',
        component: OperacoesBancariasComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'relatorio-fluxo-caixa',
        component: RelatorioFluxoCaixaComponent,
        canActivate: [RouteProtectionService]
    },
    // BoatLux
    {
        path: 'cadastros/custos',
        component: CustosComponent,
        canActivate: [RouteProtectionService]
    }
];

//export let options: Partial<IConfig> | (() => Partial<IConfig>);

@NgModule({
    declarations: [
        FinanceiroDashboardComponent,
        FinanceiroContasPagarComponent,
        FinanceiroContasReceberComponent,
        AtribuirInformacoesTitulos_DialogComponent,
        CadastroContasReceber_DialogComponent,
        FiltroRelContasReceber_DialogComponent,
        AgrupaTitulosComponent,
        BaixaContasReceberComponent,
        BaixaContasReceberMultiplos_DialogComponent,
        BaixaContasReceberIndividual_DialogComponent,
        BaixaContasReceberValor_DialogComponent,
        OperacoesBancariasComponent,
        CadastroOperacaoBancaria_DialogComponent,
        CadastroContasPagar_DialogComponent,
        BaixaContasPagarComponent,
        BaixaContasPagarMultiplos_DialogComponent,
        BaixaContasPagarIndividual_DialogComponent,
        FiltroExtratoBancario_DialogComponent,
        FiltroRelContasPagar_DialogComponent,
        RelatorioFluxoCaixaComponent,
        EmissaoBoletos_DialogComponent,
        AnexaComprovantePagar_DialogComponent,
        //Boatlux
        CustosComponent,
        CadastroCustos_DialogComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        NgxMaskModule.forRoot(),
        NgxCurrencyModule,
        TranslateModule,
        FuseSharedModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatSelectModule,
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatChipsModule,
        MatRippleModule,
        MatSnackBarModule,
        MatSortModule,
        MatInputModule,
        MatStepperModule,
        MatProgressSpinnerModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatExpansionModule,
        HttpClientModule,
        MatCheckboxModule,
        MatRadioModule,
        MatCardModule,
        MatGridListModule,
        MatDialogModule,
        MatTooltipModule,
        SharedModule,
        ChartsModule,
        NgxChartsModule,
        NgxDropzoneModule,
        FuseWidgetModule

    ],
    exports: [
        RouterModule,
        FinanceiroDashboardComponent,
        FinanceiroContasPagarComponent,
        FinanceiroContasReceberComponent,
        AgrupaTitulosComponent,
        BaixaContasReceberComponent,
        OperacoesBancariasComponent,
        BaixaContasPagarComponent,
        RelatorioFluxoCaixaComponent,
        //Boatlux
        CustosComponent
    ],
    providers: [RouteProtectionService, FinanceiroDashboardService, LocalStorageService]
})

export class FinanceiroModule {
    public constructor(private titleService: Title) {
        console.log("Start Financeiro.");
    }
}