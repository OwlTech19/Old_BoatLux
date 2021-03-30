import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id: 'modulo_inicio',
        title: 'Menu',
        type: 'group',
        children: [
            {
                id: 'menu',
                title: 'Dashboard',
                type: 'item',
                icon: 'dashboard',
                url: '/inicio/dashboard',
                badge: {
                    title: 'dev',
                    bg: 'green',
                    fg: '#FFFFFF'
                }
            },
            {
                id: 'financeiro',
                title: 'Financeiro',
                type: 'item',
                icon: 'monetization_on',
                url: '/financeiro/dashboard',
                badge: {
                    title: 'dev',
                    bg: 'green',
                    fg: '#FFFFFF'
                }
            }
        ]
    }
];