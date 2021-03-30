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

//Páginas
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardService } from './dashboard/dashboard.service';
import { OperacoesFinanceirasComponent } from './operacoes-financeiras/operacoes-financeiras.component';
import { TiposDocumentosComponent } from './tipos-documentos/tipos-documentos.component';

//Dialogs
import { CadastroDialogComponent } from './operacoes-financeiras/cadastro-dialog/cadastro-dialog.component';
import { TiposDocumento_CadastroDialogComponent } from './tipos-documentos/cadastro-dialog/cadastro-dialog.component';


const routes = [
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'financeiro/operacoes-financeiras',
        component: OperacoesFinanceirasComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'financeiro/tipos-de-documento',
        component: TiposDocumentosComponent,
        canActivate: [RouteProtectionService]
    },
];

//export let options: Partial<IConfig> | (() => Partial<IConfig>);

@NgModule({
    declarations: [
        DashboardComponent,
        OperacoesFinanceirasComponent,
        TiposDocumentosComponent,
        CadastroDialogComponent,
        TiposDocumento_CadastroDialogComponent

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

        FuseWidgetModule

    ],
    exports: [
        DashboardComponent,
        OperacoesFinanceirasComponent,
        RouterModule
    ],
    providers: [RouteProtectionService, DashboardService, LocalStorageService]
})

export class CadastroModulo {
    public constructor(private titleService: Title) {
        console.log("Módulo Cadastro inicializado.");        
    }
}