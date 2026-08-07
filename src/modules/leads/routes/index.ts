import type { RouteRecordRaw } from "vue-router";

export const leadsRoutes: RouteRecordRaw = {
  path: "leads",
  component: () => import("@/modules/leads/layouts/ListLayout.vue"),
  children: [
    {
      path: "",
      name: "leads",
      component: () => import("@/modules/leads/views/RegisterleadView.vue"),
      meta: {
        requiresAuth: true,
        title: "Registrar Lead",
      },
    },
    
    
  ],
};