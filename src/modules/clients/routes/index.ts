import type { RouteRecordRaw } from "vue-router";

export const clientsRoutes: RouteRecordRaw = {
  path: "clients",
  component: () => import("@/modules/clients/layouts/ListLayout.vue"),
  children: [
    {
      path: "",
      name: "clients",
      component: () => import("@/modules/clients/views/ClientsView.vue"),
      meta: {
        requiresAuth: true,
        title: "Clientes Potenciales",
      },
    },
    {
      path: "details/:id",
      name: "client-details",
      component: () => import("@/modules/clients/views/ClientsDetails.vue"),
      meta: {
        requiresAuth: true,
        title: "Detalle del Cliente",
      },
      props: true,
    },
  ],
};