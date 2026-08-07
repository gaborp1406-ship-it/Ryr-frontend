// guards/is-menu-auth.guard.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const isMenuAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const authStore = useAuthStore();

  if (!authStore.authCheckStatus) {
    await authStore.checkAuthStatus();
  }

  // el dashboard principal siempre pasa, sin importar permisos
  if (to.name === 'homeDashboardAll' || to.fullPath === '/') {
    return next();
  }

  return authStore.isValidPermission(to.fullPath) ? next() : next({ name: 'homeDashboardAll' });
};

export default isMenuAuth;