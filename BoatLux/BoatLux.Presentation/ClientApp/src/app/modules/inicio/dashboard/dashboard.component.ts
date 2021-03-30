import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { LocalStorageService } from '../../../services/local-storage.service';
import { DashboardService } from './dashboard.service';
import { UsuarioService } from '../../../services/usuario-service.service';
import Swal from 'sweetalert2';

const PermissaoAcessar = 'acessar';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class DashboardComponent implements OnInit {

    projects: any[];
    selectedProject: any;

    graficoVendas: any;
    graficoQtdClientes: any;
    graficoTicketMedio: any;

    dateNow = Date.now();

    /**
     * Constructor
     *
     * @param {FuseSidebarService} _fuseSidebarService
     */
    constructor(
        private _fuseSidebarService: FuseSidebarService,
        private _dashboardService: DashboardService,
        private _fuseNavigationService: FuseNavigationService,
        private _localStorageService: LocalStorageService,
        private _usuario: UsuarioService,
    ) {
        // Set the main navigation as our current navigation
        this._fuseNavigationService.setCurrentNavigation('inicio_navigation');

        this.projects = [
            {
                'name': 'ACME Corp. Backend App'
            },
            {
                'name': 'ACME Corp. Frontend App'
            },
            {
                'name': 'Creapond'
            },
            {
                'name': 'withinpixels'
            }
        ];

        // TimeOut para carregar os gráficos. Se alterar, verifique se não vai causar erros
        setInterval(() => {
            this.dateNow = Date.now();
        }, 1000);
    }

    loginData() {
        return this._localStorageService.get("loginData");
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        /*
        this._dashboardService.obterTicketMedio().subscribe(result => {

            this.graficoTicketMedio = {
                ticketMedio: result.graficoTicketMedio.total.toFixed(2), // Usa o campo total porque o gráfico é default na API
                chartType: result.graficoTicketMedio.chartType,
                datasets: result.graficoTicketMedio.datasets.Dados,
                labels: result.graficoTicketMedio.labels,
                colors: [
                    {
                        borderColor: '#5c84f1',
                        pointBorderColor: '#000000',
                    }
                ],
                options: {
                    spanGaps: false,
                    legend: {
                        display: false
                    },
                    maintainAspectRatio: false,
                    elements: {
                        point: {
                            radius: 2,
                            borderWidth: 1,
                            hoverRadius: 2,
                            hoverBorderWidth: 1
                        },
                        line: {
                            tension: 0
                        }
                    },
                    layout: {
                        padding: {
                            top: 24,
                            left: 16,
                            right: 16,
                            bottom: 16
                        }
                    },
                    scales: {
                        xAxes: [
                            {
                                display: false
                            }
                        ],
                        yAxes: [
                            {
                                display: false,
                                ticks: {
                                    // min: 100,
                                    // max: 500
                                }
                            }
                        ]
                    }
                }
            };

        });
        this._dashboardService.obterQtdClientes().subscribe(result => {

            this.graficoQtdClientes = {
                total: result.graficoQtdClientes.total,
                chartType: result.graficoQtdClientes.chartType,
                datasets: result.graficoQtdClientes.datasets.Dados,
                labels: result.graficoQtdClientes.labels,
                chartReady: true,
                colors: [
                    {
                        borderColor: '#bbdefb',
                        backgroundColor: '#bbdefb'
                    }
                ],
                options: {
                    spanGaps: false,
                    legend: {
                        display: false
                    },
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 24,
                            left: 16,
                            right: 16,
                            bottom: 16
                        }
                    },
                    scales: {
                        xAxes: [
                            {
                                display: false
                            }
                        ],
                        yAxes: [
                            {
                                display: false,
                                ticks: {
                                    //min: 1,
                                    //max: 2000
                                }
                            }
                        ]
                    }
                }
            };
        });
        
        this._dashboardService.obterDadosVendas().subscribe(result => {

            this.graficoVendas = {
                selected: result.graficoVendas.selected,
                ranges: result.graficoVendas.ranges,
                chartType: result.graficoVendas.chartType,
                datasets: result.graficoVendas.datasets,
                labels: result.graficoVendas.labels,
                colors: [
                    {
                        borderColor: '#f57c00',
                        backgroundColor: '#f3974c',
                        pointBackgroundColor: '#ffad42',
                        pointHoverBackgroundColor: '#ffad42',
                        pointBorderColor: '#000000',
                        pointHoverBorderColor: '#FFFFFF'
                    }
                ],
                options: {
                    spanGaps: false,
                    legend: {
                        display: false
                    },
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 32,
                            left: 32,
                            right: 32
                        }
                    },
                    elements: {
                        point: {
                            radius: 4,
                            borderWidth: 2,
                            hoverRadius: 4,
                            hoverBorderWidth: 2
                        },
                        line: {
                            tension: 0
                        }
                    },
                    scales: {
                        xAxes: [
                            {
                                gridLines: {
                                    display: false,
                                    drawBorder: false,
                                    tickMarkLength: 18
                                },
                                ticks: {
                                    fontColor: '#000000'
                                }
                            }
                        ],
                        yAxes: [
                            {
                                display: true,
                                ticks: {
                                    //min: 1.5,
                                    //max: 10000000,
                                    //stepSize: 10000000
                                }
                            }
                        ]
                    },
                    plugins: {
                        filler: {
                            propagate: false
                        },
                        xLabelsOnTop: {
                            active: true
                        }
                    }
                }
            };

        });
        */


        // Get system parameters 
        //this._dashboardService.obterParametros().subscribe(response => {
        //    // Set parameters in local storage
        //    this._localStorageService.set(response, 'parametros');
        //}, err => {
        //    Swal.fire('Ops!', err.error.Message ?? 'Não foi possível obter os parâmetros da loja. Contate a central de atendimento.', 'error');
        //});

        // Get user permissons
        //this._dashboardService.getPermissonsByUser(this._localStorageService.get("loginData").usuarioLogado).subscribe(response => {

            // Set permission in local storage
          //  this._localStorageService.set(response, 'permissoes');

        //}, err => {
        //    Swal.fire('Ops!', err.error.Message ?? 'Não foi possível obter os parâmetros da loja. Contate a central de atendimento.', 'error');
        //});
        //
        //this.selectedProject = this.projects[0];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle the sidebar
     *
     * @param name
     */
    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }
}