import { FuseNavigation } from '@fuse/types';

export const compras_navigation: FuseNavigation[] = [
    {
        id: 'modulo_compras',
        title: 'Módulo Compras',
        //translate: 'NAV.APPLICATIONS',
        type: 'group',
        //icon: 'arrow_forward_ios',
        children: [
            //{
            //    id: 'main-home',
            //    title: 'Página inicial',
            //    //translate: 'NAV.SAMPLE.TITLE',
            //    type: 'item',
            //    //icon: 'home',
            //    url: '/home',
            //    //badge: {
            //    //    title: '25',
            //    //    translate: 'NAV.SAMPLE.BADGE',
            //    //    bg: '#F44336',
            //    //    fg: '#FFFFFF'
            //    //}
            //},    
            {
                id: 'menu',
                title: 'Dashboard',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'dashboard',
                url: '/compras/dashboard',
            }
            //},
            //{
            //    id: 'menu',
            //    title: 'Lista de Produtos',
            //    //translate: 'NAV.SAMPLE.TITLE',
            //    type: 'item',
            //    //icon: 'shopping_basket',
            //    url: '/compras/produtos',
            //}
        ]
    },
    {
        id: 'applications',
        title: 'Sugestão de Compras',
        //translate: 'NAV.APPLICATIONS',
        type: 'group',
        //icon: 'arrow_forward_ios',
        children: [
            {
                id: 'menu',
                title: 'Análise Sug. de Compras',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'thumb_up',
                url: '/compras/analise-para-sugestao-de-compras',
            }
        ]
    },
    {
        id: 'applications',
        title: 'Pedidos de Compras',
        //translate: 'NAV.APPLICATIONS',
        type: 'group',
        //icon: 'arrow_forward_ios',
        children: [
            {
                id: 'menu',
                title: 'Pedidos de Compras',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'shopping_cart',
                url: '/compras/pedidos-de-compras',
            },            
            {
                id: 'menu',
                title: 'Trocas de Compras',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'restore_page',
                url: '/compras/trocas-de-compras',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Cotações',
        //translate: 'NAV.APPLICATIONS',
        type: 'group',
        //icon: 'arrow_forward_ios',
        children: [
            {
                id: 'menu',
                title: 'Cotações de Compras',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'show_chart',
                url: '/compras/cotacoes-de-compras',
            },
            {
                id: 'menu',
                title: 'Liberação de Cotação Web',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'lock_open',
                url: '/compras/liberacoes-cotacao-web',
            },
            {
                id: 'menu',
                title: 'Info. de Preços Cotações',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'info',
                url: '/compras/info-precos-cotacoes',
            },
            {
                id: 'menu',
                title: 'Avaliação das Cotações',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'comment',
                url: '/compras/avaliacao-cotacoes',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Relatórios',
        //translate: 'NAV.APPLICATIONS',
        type: 'group',
        //icon: 'arrow_forward_ios',
        children: [
            {
                id: 'menu',
                title: 'Itens Mais/Menos Comprados',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'bar_chart',
                url: '/compras/relatorio-itens-mais-menos-comprados',
            },
            {
                id: 'menu',
                title: 'Compras/Consumo',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'bar_chart',
                url: '/compras/relatorio-compras-consumo',
            },
            {
                id: 'menu',
                title: 'Compras por Período',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'bar_chart',
                url: '/compras/relatorio-compras-periodo',
            },
            {
                id: 'menu',
                title: 'Prévia de Compras',
                //translate: 'NAV.SAMPLE.TITLE',
                type: 'item',
                icon: 'bar_chart',
                url: '/compras/relatorio-previa-de-compras',
            }
        ]
    }
];