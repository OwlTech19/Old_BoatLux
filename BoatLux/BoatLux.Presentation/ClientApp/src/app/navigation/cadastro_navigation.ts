import { FuseNavigation } from '@fuse/types';

export const cadastro_navigation: FuseNavigation[] = [
    {
        id: 'modulo_cadastro',
        title: 'Módulo Cadastro',
        //translate: 'NAV.APPLICATIONS',
        type: 'group',
        //icon: 'arrow_forward_ios',
        children: [
            {
                id: 'menu',
                title: 'Dashboard',
                type: 'item',
                icon: 'dashboard',
                url: '/cadastro/dashboard',
                badge: {
                    title: 'dev',
                    bg: 'green',
                    fg: '#FFFFFF'
                }
            }
        ]
    },
    {
        id: 'applications',
        title: 'Produtos',
        type: 'collapsable',
        icon: 'bubble_chart',
        children: [
            {
                id: 'menu',
                title: 'Categorização',
                type: 'collapsable',
                //icon: 'category',
                children: [
                    {
                        id: 'menu',
                        title: 'Centros de Receita',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/categorizacao/centros-de-receita',
                    },
                    {
                        id: 'menu',
                        title: 'Grupos',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/categorizacao/grupos',
                    },
                    {
                        id: 'menu',
                        title: 'Categorias',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/categorizacao/categorias',
                    },
                    {
                        id: 'menu',
                        title: 'Famílias',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/categorizacao/familias',
                    },
                ]
            },
            {
                id: 'menu',
                title: 'Tributação',
                type: 'collapsable',
                //icon: 'attach_money',
                children: [
                    {
                        id: 'menu',
                        title: 'Alíquotas Estaduais',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/tributacao/aliquotas-estaduais',
                    },
                    {
                        id: 'menu',
                        title: 'Alíquotas Imp. Fiscal',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/tributacao/aliquotas-imp-fiscal',
                    },
                    {
                        id: 'menu',
                        title: 'Tributações',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/tributacao/tributacoes',
                    },
                    {
                        id: 'menu',
                        title: 'Tributações Interestaduais',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/tributacao/tributacoes-interestaduais',
                    },
                ]
            },
            {
                id: 'menu',
                title: 'Promoções',
                type: 'collapsable',
                //icon: 'money_off',
                children: [
                    {
                        id: 'menu',
                        title: 'Promoções',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/promocoes',
                    },
                    {
                        id: 'menu',
                        title: 'Promoções Efetuadas',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/promocoes/promocoes-efetuadas',
                    },
                ]
            },
            {
                id: 'menu',
                title: 'Reajuste de Preços',
                type: 'collapsable',
                //icon: 'edit',
                children: [
                    {
                        id: 'menu',
                        title: 'Reajuste de Preços',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/reajuste-de-precos',
                    },
                    {
                        id: 'menu',
                        title: 'Reajustes Efetuados',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/reajuste-de-precos/reajustes-efetuados',
                    },
                    {
                        id: 'menu',
                        title: 'Reajuste Tab. de Preços',
                        type: 'item',
                        //icon: 'chevron_right',
                        url: '/cadastro/produtos/reajuste-de-precos/reajuste-tabela-de-precos',
                    },
                ]
            },
            {
                id: 'menu',
                title: 'Classificações',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/produtos/',
            },
            {
                id: 'menu',
                title: 'Entrada para Açougue',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/produtos/',
            },
            {
                id: 'menu',
                title: 'Tabela de Preços',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/produtos/',
            },
            {
                id: 'menu',
                title: 'Famílias de Preços',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/produtos/',
            },
            {
                id: 'menu',
                title: 'Produtos',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/produtos/',
            },
            {
                id: 'menu',
                title: 'Preços de Concorrentes',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/produtos/',
            },
            {
                id: 'menu',
                title: 'Vasilhames',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/produtos/',
            },
            {
                id: 'menu',
                title: 'Corredores',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/produtos/',
            },
            {
                id: 'menu',
                title: 'Exporta TXT',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/produtos/',
            },
            {
                id: 'menu',
                title: 'Unidades de Medida',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/produtos/',
            },
            {
                id: 'menu',
                title: 'Log de Produtos',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/produtos/',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Clientes',
        type: 'collapsable',
        icon: 'group',
        children: [
            {
                id: 'menu',
                title: 'Clientes',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/clientes',
            },
            {
                id: 'menu',
                title: 'Tipos de Clientes',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/clientes/tipos-de-clientes',
            },
            {
                id: 'menu',
                title: 'Clientes em Débito',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/clientes/clientes-em-debito',
            },
            {
                id: 'menu',
                title: 'Trocas e Devoluções',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/clientes/trocas-e-devolucoes',
            },
            {
                id: 'menu',
                title: 'Segmentos',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/clientes/segmentos',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Fornecedores',
        type: 'collapsable',
        icon: 'group',
        children: [
            {
                id: 'menu',
                title: 'Fornecedores',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/fornecedores',
            },
            {
                id: 'menu',
                title: 'Tipos de Fornecedores',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/fornecedores/tipos-de-fornecedores',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Vendedores',
        type: 'collapsable',
        icon: 'group',
        children: [
            {
                id: 'menu',
                title: 'Vendedores',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/vendedores',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Fiscal',
        type: 'collapsable',
        icon: 'remove_red_eye',
        children: [
            {
                id: 'menu',
                title: 'Natureza de Operação (CFOP)',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/fiscal/natureza-de-operacao-cfop',
            },
            {
                id: 'menu',
                title: 'Observações de NF',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/fiscal/observacoes-de-nf',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Centro de Custo',
        type: 'collapsable',
        icon: 'chrome_reader_mode',
        children: [
            {
                id: 'menu',
                title: 'Centro de Custo',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/centro-de-custo',
            },
            {
                id: 'menu',
                title: 'Classificação Centro de Custo',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/centro-de-custo/classificacao-centro-de-custo',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Financeiro',
        type: 'collapsable',
        icon: 'monetization_on',
        badge: {
            title: '2',
            bg: 'green',
            fg: '#FFFFFF'
        },
        children: [
            {
                id: 'menu',
                title: 'Bancos',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/financeiro/bancos',
            },
            {
                id: 'menu',
                title: 'Contas Bancárias',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/financeiro/contas-bancarias',
            },
            {
                id: 'menu',
                title: 'Operações Financeiras',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/financeiro/operacoes-financeiras',
                badge: {
                    title: 'ok',                    
                    bg: 'green',
                    fg: '#FFFFFF'
                }
            },
            {
                id: 'menu',
                title: 'Tipos de Documento',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/financeiro/tipos-de-documento',
                badge: {
                    title: 'ok',
                    bg: 'green',
                    fg: '#FFFFFF'
                }
            },
            {
                id: 'menu',
                title: 'Planos de Contas',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/financeiro/planos-de-contas',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Balança',
        type: 'collapsable',
        icon: 'featured_video',
        children: [
            {
                id: 'menu',
                title: 'Exportar Dados p/ Balança',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/balanca/exportar-dados-para-balanca',
            },
            {
                id: 'menu',
                title: 'Relatório Produtos Balança',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/balanca/relatorio-produtos-balanca',
            },
            {
                id: 'menu',
                title: 'Setores',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/balanca/setores',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Pagamento',
        type: 'collapsable',
        icon: 'money',
        children: [
            {
                id: 'menu',
                title: 'Condições de Pagamento',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/pagamento/condicoes-de-pagamento',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Consulta de Preços',
        type: 'collapsable',
        icon: 'search',
        children: [
            {
                id: 'menu',
                title: 'Consulta de Preços',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/consulta-de-precos',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Administradoras',
        type: 'collapsable',
        icon: 'domain',
        children: [
            {
                id: 'menu',
                title: 'Adm. Cartões',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/administradoras/adm-cartoes',
            },
            {
                id: 'menu',
                title: 'Adm. Tickets',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/administradoras/adm-tickets',
            },
        ]
    },
    {
        id: 'applications',
        title: 'PDV',
        type: 'collapsable',
        icon: 'developer_board',
        children: [
            {
                id: 'menu',
                title: 'Formas de Pagamento',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/pdv/formas-de-pagamento',
            },
            {
                id: 'menu',
                title: 'Relatórios Gerenciais',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/pdv/relatorios-gerenciais',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Transportadoras',
        type: 'collapsable',
        icon: 'local_shipping',
        children: [
            {
                id: 'menu',
                title: 'Transportadoras',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/transportadoras',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Fichas',
        type: 'collapsable',
        icon: 'credit_card',
        children: [
            {
                id: 'menu',
                title: 'Fichas',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/fichas',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Compradores',
        type: 'collapsable',
        icon: 'shopping_basket',
        children: [
            {
                id: 'menu',
                title: 'Compradores',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/compradores',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Entregadores',
        type: 'collapsable',
        icon: 'person',
        children: [
            {
                id: 'menu',
                title: 'Entregadores',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/entregadores',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Serviços',
        type: 'collapsable',
        icon: 'public',
        children: [
            {
                id: 'menu',
                title: 'Serviços',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/servicos',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Concorrentes',
        type: 'item',
        children: [
            {
                id: 'menu',
                title: 'Concorrentes',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/concorrentes',
            },
        ]
    },
    {
        id: 'applications',
        title: 'Repositores',
        type: 'collapsable',
        icon: 'person',
        children: [
            {
                id: 'menu',
                title: 'Repositores',
                type: 'item',
                //icon: 'thumb_up',
                url: '/cadastro/repositores',
            },
        ]
    },
];