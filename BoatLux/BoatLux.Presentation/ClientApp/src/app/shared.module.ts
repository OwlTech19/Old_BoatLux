import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule, getLocaleMonthNames } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { NgxCurrencyModule } from "ngx-currency";
import { NgxMaskModule } from 'ngx-mask'
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import * as moment from 'moment';
import { ConstantsService } from '../app/services/constants.service';
import { AutoInputFocusDirective } from './directives/auto-input-focus.directive';

//Set moment locale
moment.locale('pt-BR');

//Serviços
import { DialogService } from 'app/services/dialog.service';

//Controles
import { ControlesTituloPaginaComponent } from 'app/controls/titulo-pagina/titulo-pagina.component';
import { ControlesBuscaRapidaComponent } from 'app/controls/busca-rapida/busca-rapida.component';
import { ControlesDetalhesProdutoComponent } from 'app/controls/detalhes-produto/detalhes-produto.component';
import { ControlesComboLojaComponent } from 'app/controls/combo-loja/combo-loja.component';
import { ControlesImportaProdutoComponent } from 'app/controls/importa-produto/importa-produto.component';
import { ControlesLegendaComponent } from 'app/controls/legenda/legenda.component';
import { ControlesImportaFornecedorComponent } from 'app/controls/importa-fornecedor/importa-fornecedor.component';
import { ControlesEditaCotacaoComponent } from 'app/controls/edita-cotacao/edita-cotacao.component';
import { ControlesAssociarProdutoFornecedorComponent } from 'app/controls/associa-produto-fornecedor/associa-produto-fornecedor.component';
import { ControlesClassificarEstruturaMercadologicaComponent } from 'app/controls/classifica-estrutura-mercadologica/classifica-estrutura-mercadologica.component';
import { ControlesPendenciaFornecedorComponent } from 'app/controls/pendencia-fornecedor/pendencia-fornecedor.component';
import { ControlesCadastroPendenciaFornecedorComponent } from 'app/controls/pendencia-fornecedor/cadastro-pendencia-fornecedor/cadastro-pendencia-fornecedor.component';
import { ControlesConsultaCupomNfComponent } from 'app/controls/consulta-cupom-nf/consulta-cupom-nf.component';
import { ControlesImpressaoComprovanteComponent } from 'app/controls/impressao-comprovante/impressao-comprovante.component';

//export const currencyMaskConfig = {
//    align: "left",
//    allowNegative: true,
//    allowZero: true,
//    thousands: ".",
//    decimal: ",",    
//    precision: 2,
//    prefix: "R$ ",
//    suffix: "",    
//    nullable: false,
//    //min: null,
//    //max: null,
//    inputMode: CurrencyMaskInputMode.NATURAL
//};

export const datePickerConfig = {
    separator: ' à ',
    applyLabel: 'OK',
    daysOfWeek: moment.weekdaysMin(),
    monthNames: moment.monthsShort(),
    firstDay: moment.localeData().firstDayOfWeek(),
    //format: 'YYYY-MM-DD', // could be 'YYYY-MM-DDTHH:mm:ss.SSSSZ'
    displayFormat: 'DD/MM/YYYY', // default is format value
    direction: 'ltr', // could be rtl
    weekLabel: 'Semana',
    cancelLabel: 'Cancelar', // detault is 'Cancel'            
    clearLabel: 'Limpar', // detault is 'Clear'
    customRangeLabel: 'Períodos',
};

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,        
        MatInputModule,        
        MatProgressSpinnerModule,
        MatAutocompleteModule,        
        HttpClientModule,
        MatDialogModule,
        MatCardModule,
        MatStepperModule,
        MatTabsModule,
        MatTableModule,
        FuseSharedModule,
        MatButtonModule,
        MatChipsModule,
        MatRippleModule,
        MatExpansionModule,
        MatTooltipModule,
        MatMenuModule,
        MatSelectModule,
        MatCheckboxModule,
        MatRadioModule,
        MatGridListModule,
        MatPaginatorModule,
        MatSnackBarModule,
        MatSortModule,        
        MatDatepickerModule,        
        ChartsModule,
        NgxChartsModule,
        FuseWidgetModule,
        NgxDaterangepickerMd.forRoot(datePickerConfig),
        NgxMaskModule.forRoot(),
        NgxCurrencyModule
    ],
    declarations: [
        ControlesTituloPaginaComponent,
        ControlesBuscaRapidaComponent,
        ControlesDetalhesProdutoComponent,
        ControlesComboLojaComponent,
        ControlesImportaProdutoComponent,
        ControlesLegendaComponent,
        ControlesImportaFornecedorComponent,
        ControlesEditaCotacaoComponent,
        ControlesAssociarProdutoFornecedorComponent,
        ControlesClassificarEstruturaMercadologicaComponent,
        ControlesPendenciaFornecedorComponent,
        ControlesCadastroPendenciaFornecedorComponent,
        AutoInputFocusDirective,
        ControlesConsultaCupomNfComponent,
        ControlesImpressaoComprovanteComponent,
    ],
    exports: [
        CommonModule,
        ControlesTituloPaginaComponent,
        ControlesBuscaRapidaComponent,
        ControlesDetalhesProdutoComponent,
        ControlesComboLojaComponent,
        ControlesImportaProdutoComponent,
        ControlesLegendaComponent,
        MatDatepickerModule,
        NgxMaskModule,
        NgxCurrencyModule,
        NgxDaterangepickerMd,
        ControlesImportaFornecedorComponent,
        ControlesEditaCotacaoComponent,
        ControlesAssociarProdutoFornecedorComponent,
        ControlesClassificarEstruturaMercadologicaComponent,
        ControlesPendenciaFornecedorComponent,
        ControlesCadastroPendenciaFornecedorComponent,
        AutoInputFocusDirective,
        ControlesConsultaCupomNfComponent,
        ControlesImpressaoComprovanteComponent,
    ],
    providers: [DialogService, ConstantsService]
})

export class SharedModule {   
}