import type { RouteRecordRaw } from "vue-router";

export const closingRoutes: RouteRecordRaw = {
  path: "closing",
  component: () => import("@/modules/leads/layouts/ListLayout.vue"),
  children: [
    {
      path: "",
      name: "closing",
      component: () => import("@/modules/leads/views/historyLeads.vue"),
      meta: {
        requiresAuth: true,
        title: "Cierres",
      },
    },
  ],
};