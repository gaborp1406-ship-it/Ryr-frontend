import { createRouter, createWebHistory } from 'vue-router';
import { authRoutes } from '@/modules/auth/routes';
import HomeLayout from '@/modules/home/layouts/homeLayout.vue';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { leadsRoutes } from '@/modules/leads/routes';
import { clientsRoutes } from '@/modules/clients/routes';
import { calendarRoutes } from '@/modules/calendar/routes';
import { ConexionesRoutes } from '@/modules/estados/routes';
import { closingRoutes } from '@/modules/leads/routes/closing.routes';
import { desistedRoutes } from '@/modules/leads/routes/desisted.routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeLayout,

      meta: {
        requiresAuth: true,
        alwaysAllowed: true,
      },

      children: [
        {
          path: 'homeDashboardAll',
          name: 'homeDashboardAll',
          component: () =>
            import('@/modules/home/views/DashboardAllView.vue'),
          meta: {
            requiresAuth: true,
            title: 'Dashboard',
          },
        },

        leadsRoutes,
        clientsRoutes,
        calendarRoutes,
        ConexionesRoutes,
        closingRoutes,
        desistedRoutes,
      ],
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: () =>
        import('@/modules/error/error-not-permition.vue'),

      meta: {
        requiresAuth: true,
        alwaysAllowed: true,
      },
    },

    authRoutes,
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  const isInitialPageLoad = from.name === undefined;


  if (to.meta.requiresAuth) {

    if (
      isInitialPageLoad &&
      authStore.isChecking
    ) {
      try {
        await new Promise<void>((resolve) => {
          const unsubscribe = authStore.$subscribe(() => {
            if (!authStore.isChecking) {
              unsubscribe();
              resolve();
            }
          });
        });
      } catch (error) {
        console.error(
          'Error al verificar autenticación:',
          error,
        );
      }
    }

    if (!authStore.isLoggedIn()) {

      if (
        isInitialPageLoad &&
        to.name !== 'login'
      ) {
        localStorage.setItem(
          'intendedPath',
          to.fullPath,
        );
      }

      return next({
        name: 'login',
      });
    }


    const rutaSiempreLibre =
      !!to.meta.alwaysAllowed;

    const tienePermiso =
      authStore.isAdmin ||
      rutaSiempreLibre ||
      authStore.isValidPermission(to.path);


    if (!tienePermiso) {

      console.warn(
        `Acceso denegado a: ${to.path}`,
      );

      return next({
        name: 'forbidden',
      });
    }

    localStorage.setItem(
      'lastPath',
      to.fullPath,
    );

    return next();
  }

  if (
    to.name === 'login' &&
    authStore.isLoggedIn()
  ) {

    const intendedPath =
      localStorage.getItem('intendedPath') || '/';

    localStorage.removeItem('intendedPath');

    return next(intendedPath);
  }


  return next();
});

export default router;