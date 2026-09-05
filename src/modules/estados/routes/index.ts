import type { RouteRecordRaw } from "vue-router";

export const ConexionesRoutes: RouteRecordRaw = {
  path: "history-connections",

  component: () => import("@/modules/estados/layouts/ListLayout.vue"),

  children: [
    {
      path: "",
      name: "history-connections",
      component: () =>
        import("@/modules/estados/views/historialconexiones.vue"),

      meta: {
        requiresAuth: true,
        title: "Historial de conexiones",
       
      },
    },
  ],
};