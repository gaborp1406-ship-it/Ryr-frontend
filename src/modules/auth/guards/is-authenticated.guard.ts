// guards/is-authenticated.guard.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/modules/auth/stores/auth.store';

const isAuthenticatedGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const authStore = useAuthStore();

  localStorage.setItem('lastPath', to.path);

  if (!authStore.isLoggedIn()) {
    return next({ name: 'login' });
  }

  return next();
};

export default isAuthenticatedGuard;