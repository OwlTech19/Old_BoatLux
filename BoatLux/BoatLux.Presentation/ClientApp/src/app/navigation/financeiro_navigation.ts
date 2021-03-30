import { FuseNavigation } from '@fuse/types';

export const financeiro_navigation: FuseNavigation[] = [
    {
        id: 'modulo_financeiro',
        title: 'Financeiro',
        type: 'group',
        //icon: 'arrow_forward_ios',
        children: [
            {
                id: 'menu',
                title: 'Dashboard',
                type: 'item',
                icon: 'dashboard',
                url: '/financeiro/dashboard',
                badge: {
                    title: 'dev',
                    bg: 'green',
                    fg: '#FFFFFF'
                }
            },
        ]
    },
    {
        id: 'cadastros',
        title: 'Cadastros',
        type: 'group',
        children: [
            {
                id: 'centrodecustos',
                title: 'Centro de Custos',
                type: 'item',
                icon: 'pie_chart',
                url: '/financeiro/cadastros/centro-custos',
            },
            {
                id: 'custos',
                title: 'Custos',
                type: 'item',
                icon: 'account_balance',
                url: '/financeiro/cadastros/custos',
                badge: {
                    title: 'dev',
                    bg: 'green',
                    fg: '#FFFFFF'
                }
            },
        ]
    },
    {
        id: 'contasreceberpai',
        title: 'Contas a Receber',
        type: 'group',
        children: [
            {
                id: 'contasreceber',
                title: 'Contas a Receber',
                type: 'item',
                icon: 'money',
                url: '/financeiro/contas-receber',
            },
            {
                id: 'baixacontasreceber',
                title: 'Baixa Contas a Receber',
                type: 'item',
                icon: 'receipt_long',
                url: '/financeiro/baixa-contas-receber',
            },
            {
                id: 'agrupartitulos',
                title: 'Agrupar Títulos por Cliente',
                type: 'item',
                icon: 'credit_card',
                url: '/financeiro/agrupa-titulos',
            }
        ]
    }
];