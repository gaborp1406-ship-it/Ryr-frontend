import type { RouteRecordRaw } from 'vue-router';

export const LuneRoutes: RouteRecordRaw[] = [
  {
    // Vista 1: ventas, cuentas por cobrar y clientes
    path: '/lune',
    name: 'lune',
    component: () => import('@/modules/lune/views/luneview.vue'),
    meta: {
      requiresAuth: true,
      title: 'Lune · Ventas',
    },
  },
  {
    // Vista 2: egresos
    path: '/lune/egresos',
    name: 'lune-egresos',
    component: () => import('@/modules/lune/views/egresosview.vue'),
    meta: {
      requiresAuth: true,
      title: 'Lune · Egresos',
    },
  },
  {
    // Vista 3: reportes
    path: '/lune/reportes',
    name: 'lune-reportes',
    component: () => import('@/modules/lune/views/reportesview.vue'),
    meta: {
      requiresAuth: true,
      title: 'Lune · Reportes',
    },
  },
];