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

      // IMPORTANTE:
      // "/" es el layout/contenedor de las rutas protegidas.
      // No debe exigir un permiso "/".
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

    // Esta ruta está fuera de HomeLayout,
    // por lo tanto se muestra sin sidebar/topbar.
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


// ============================================================
// GUARD DE AUTENTICACIÓN Y PERMISOS
// ============================================================

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  const isInitialPageLoad = from.name === undefined;

  console.log('========== ROUTER GUARD ==========');
  console.log('FROM name:', from.name);
  console.log('FROM path:', from.path);
  console.log('TO name:', to.name);
  console.log('TO path:', to.path);
  console.log('TO fullPath:', to.fullPath);
  console.log('requiresAuth:', to.meta.requiresAuth);
  console.log('alwaysAllowed:', to.meta.alwaysAllowed);
  console.log('isChecking:', authStore.isChecking);
  console.log('isLoggedIn:', authStore.isLoggedIn());
  console.log('isAgent:', authStore.isAgent);
  console.log('isAdmin:', authStore.isAdmin);
  console.log(
    'isValidPermission:',
    authStore.isValidPermission(to.path),
  );
  console.log('==================================');


  // ============================================================
  // RUTA PROTEGIDA
  // ============================================================

  if (to.meta.requiresAuth) {

    // ----------------------------------------------------------
    // Esperar a que termine la verificación inicial
    // ----------------------------------------------------------

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


    // ----------------------------------------------------------
    // Verificar autenticación
    // ----------------------------------------------------------

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


    // ----------------------------------------------------------
    // Verificar permisos
    // ----------------------------------------------------------

    const rutaSiempreLibre =
      !!to.meta.alwaysAllowed;

    const tienePermiso =
      authStore.isAdmin ||
      rutaSiempreLibre ||
      authStore.isValidPermission(to.path);


    console.log('---------- PERMISOS ----------');
    console.log('Ruta:', to.path);
    console.log('Admin:', authStore.isAdmin);
    console.log(
      'Always allowed:',
      rutaSiempreLibre,
    );
    console.log(
      'Permiso ruta:',
      authStore.isValidPermission(to.path),
    );
    console.log(
      'TIENE PERMISO:',
      tienePermiso,
    );
    console.log('------------------------------');


    // ----------------------------------------------------------
    // Sin permiso
    // ----------------------------------------------------------

    if (!tienePermiso) {

      console.warn(
        `Acceso denegado a: ${to.path}`,
      );

      return next({
        name: 'forbidden',
      });
    }


    // ----------------------------------------------------------
    // Guardar última ruta válida
    // ----------------------------------------------------------

    localStorage.setItem(
      'lastPath',
      to.fullPath,
    );

    return next();
  }


  // ============================================================
  // RUTAS PÚBLICAS
  // ============================================================

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