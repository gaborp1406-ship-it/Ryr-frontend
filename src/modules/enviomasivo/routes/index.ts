import type { RouteRecordRaw } from "vue-router";

export const MasiveRoutes: RouteRecordRaw = {
  path: "mass-mailing",

  component: () => import("@/modules/enviomasivo/layouts/ListLayout.vue"),

  children: [
    {
      path: "",
      name: "mass-mailing",
      component: () =>
        import("@/modules/enviomasivo/views/enviomasivo.vue"),

      meta: {
        requiresAuth: true,
        title: "Envio Masivo Campañas",
       
      },
    },
  ],
};