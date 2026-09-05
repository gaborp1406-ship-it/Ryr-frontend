import type { RouteRecordRaw } from "vue-router";

export const desistedRoutes: RouteRecordRaw = {
  path: "desisted",
  component: () => import("@/modules/leads/layouts/ListLayout.vue"),
  children: [
    {
      path: "",
      name: "desisted",
      component: () => import("@/modules/leads/views/desistidoleads.vue"),
      meta: {
        requiresAuth: true,
        title: "Leads Desistidos",
      },
    },
  ],
};