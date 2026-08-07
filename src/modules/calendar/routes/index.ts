import type { RouteRecordRaw } from "vue-router";

export const calendarRoutes: RouteRecordRaw = {
  path: "calendar",
  component: () => import("@/modules/calendar/layouts/ListLayout.vue"),
  children: [
    {
      path: "",
      name: "calendar",
      component: () => import("@/modules/calendar/views/RegistercalendarView.vue"),
      meta: {
        requiresAuth: true,
        title: "Calendario",
      },
    },
    
    
  ],
};