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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { AngularEditorModule } from '@kolkov/angular-editor';
//import { NgxCurrencyModule } from "ngx-currency";
//import { NgxMaskModule } from 'ngx-mask'
import { SharedModule } from '../../shared.module';

//Páginas
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardService } from './dashboard/dashboard.service';
import { AnaliseSugestaoComponent } from './analise-sugestao/analise-sugestao.component';
import { PedidosComprasComponent } from './pedidos-compras/pedidos-compras.component';
import { TrocasComprasComponent } from './trocas-compras/trocas-compras.component';
import { CotacoesComprasComponent } from './cotacoes-compras/cotacoes-compras.component';
import { RelatorioPreviaComprasComponent } from './relatorio-previa-compras/relatorio-previa-compras.component';
import { RelatorioItensMaisMenosCompradosComponent } from './relatorio-itens-mais-menos-comprados/relatorio-itens-mais-menos-comprados.component';
import { RelatorioComprasConsumoComponent } from './relatorio-compras-consumo/relatorio-compras-consumo-component';
import { RelatorioComprasPeriodoComponent } from './relatorio-compras-periodo/relatorio-compras-periodo.component';
import { LiberacoesCotacaoWebComponent } from './liberacoes-cotacao-web/liberacoes-cotacao-web.component';
import { AvaliacaoCotacoesComponent } from './avaliacao-cotacoes/avaliacao-cotacoes.component';
import { InfoPrecosCotacoesComponent } from './info-precos-cotacoes/info-precos-cotacoes.component';

//Dialogs
import { ColunasDialogComponent } from './analise-sugestao/colunas-dialog/colunas-dialog.component';
import { GeraPedidoDialogComponent } from './analise-sugestao/gera-pedido-dialog/gera-pedido-dialog.component';
import { CadastroPedidoCompraDialogComponent } from './pedidos-compras/cadastro-pedido-compra-dialog/cadastro-pedido-compra-dialog.component';
import { CadastroTrocaCompraDialogComponent } from './trocas-compras/cadastro-troca-compra-dialog/cadastro-troca-compra-dialog.component';
import { CadastroCotacaoCompraDialogComponent } from './cotacoes-compras/cadastro-cotacao-compra-dialog/cadastro-cotacao-compra-dialog.component';
import { LiberaCotacaoWebDialogComponent } from './liberacoes-cotacao-web/libera-cotacao-web-dialog/libera-cotacao-web-dialog.component';
import { ReenviaSenhaCotacaoDialogComponent } from './liberacoes-cotacao-web/reenvia-senha-cotacao-dialog/reenvia-senha-cotacao-dialog.component';
import { AvaliaCotacaoDialogComponent } from './avaliacao-cotacoes/avalia-cotacao-dialog/avalia-cotacao-dialog.component';
import { ControlesCopiaPedidoCompraComponent } from './pedidos-compras/copia-pedido-compra-dialog/copia-pedido-compra-dialog.component';
import { ControlesFiltroRelPedidoCompraComponent } from './pedidos-compras/filtro-rel-pedido-compra-dialog/filtro-rel-pedido-compra-dialog.component';
import { ControlesConsultaFornecedoresColunaComponent } from './avaliacao-cotacoes/avalia-cotacao-dialog/consultar-fornecedores-colunas/consultar-fornecedores-coluna.component';
import { ControlesFiltroRelTrocasComprasComponent } from './trocas-compras/filtro-rel-trocas-compras-dialog/filtro-rel-trocas-compras-dialog.component';
import { GeraContasReceberTrocaComponent } from './trocas-compras/gera-contas-receber-troca-dialog/gera-contas-receber-troca.component';
import { EnvioEmailPedidoDialogComponent } from './pedidos-compras/envio-email-pedido-dialog/envio-email-pedido-dialog.component';

const routes = [
    {
        path: '',        
        component: DashboardComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [RouteProtectionService]
    },    
    {
        path: 'analise-para-sugestao-de-compras',
        component: AnaliseSugestaoComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'pedidos-de-compras',
        component: PedidosComprasComponent,
        canActivate: [RouteProtectionService]
    },  
    {
        path: 'trocas-de-compras',
        component: TrocasComprasComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'cotacoes-de-compras',
        component: CotacoesComprasComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'relatorio-previa-de-compras',
        component: RelatorioPreviaComprasComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'relatorio-itens-mais-menos-comprados',
        component: RelatorioItensMaisMenosCompradosComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'relatorio-compras-consumo',
        component: RelatorioComprasConsumoComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'relatorio-compras-periodo',
        component: RelatorioComprasPeriodoComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'liberacoes-cotacao-web',
        component: LiberacoesCotacaoWebComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'avaliacao-cotacoes',
        component: AvaliacaoCotacoesComponent,
        canActivate: [RouteProtectionService]
    },
    {
        path: 'info-precos-cotacoes',
        component: InfoPrecosCotacoesComponent,
        canActivate: [RouteProtectionService]
    } 
];

@NgModule({
    declarations: [
        DashboardComponent,
        AnaliseSugestaoComponent,
        PedidosComprasComponent,
        TrocasComprasComponent,
        CotacoesComprasComponent,
        ColunasDialogComponent,
        GeraPedidoDialogComponent,        
        CadastroPedidoCompraDialogComponent,
        CadastroTrocaCompraDialogComponent,
        CadastroCotacaoCompraDialogComponent,
        RelatorioPreviaComprasComponent,
        RelatorioItensMaisMenosCompradosComponent,
        RelatorioComprasConsumoComponent,
        RelatorioComprasPeriodoComponent,
        LiberacoesCotacaoWebComponent,
        LiberaCotacaoWebDialogComponent,
        ReenviaSenhaCotacaoDialogComponent,
        AvaliacaoCotacoesComponent,
        AvaliaCotacaoDialogComponent,
        InfoPrecosCotacoesComponent,
        ControlesCopiaPedidoCompraComponent,
        ControlesFiltroRelPedidoCompraComponent,
        ControlesConsultaFornecedoresColunaComponent,
        ControlesFiltroRelTrocasComprasComponent,
        GeraContasReceberTrocaComponent,
        EnvioEmailPedidoDialogComponent,
    ],
    imports: [
        RouterModule.forChild(routes),
        //NgxMaskModule.forRoot(),
        //NgxCurrencyModule,
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
        MatTooltipModule,
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
        SharedModule,        
        ChartsModule,
        NgxChartsModule,
        AngularEditorModule,
        FuseWidgetModule

    ],
    exports: [
        DashboardComponent,
        AnaliseSugestaoComponent,
        RouterModule
    ],
    providers: [RouteProtectionService, DashboardService, LocalStorageService]
})

export class ComprasModule {
    public constructor() {
        console.log("Módulo Compras inicializado.");
    }
}