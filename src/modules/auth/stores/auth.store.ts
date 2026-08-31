// stores/auth.store.ts
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { AuthRole, AuthStatus, type AuthCheckStatus } from '../interfaces';
import { loginAction, checkAuthAction } from '../actions';
import { useLocalStorage } from '@vueuse/core';
import { jwtDecode } from 'jwt-decode';

export interface resp {
  status: boolean;
  message: string;
}

export const useAuthStore = defineStore('auth', () => {
  const authStatus = ref<AuthStatus>(AuthStatus.Checking);
  const authCheckStatus = ref<AuthCheckStatus | undefined>();
  const token = ref(useLocalStorage('token', ''));

  const login = async (usuario: string, contrasenia: string): Promise<resp> => {
    try {
      const loginResp = await loginAction(usuario, contrasenia);
      if (!loginResp.status) {
        logout();
        return {
          status: loginResp.status,
          message: loginResp.message ?? 'Error de autenticación',
        };
      }

      token.value = loginResp.data?.token ?? '';

      const checkOk = await checkAuthStatus();
      if (!checkOk) {
        return {
          status: false,
          message: 'No se pudo obtener la información del usuario',
        };
      }

      return {
        status: true,
        message: 'Login exitoso',
      };
    } catch (error) {
      console.error('Login error:', error);
      logout();
      return {
        status: false,
        message: 'No se pudo realizar la petición',
      };
    }
  };

  const logout = () => {
    authStatus.value = AuthStatus.UnAuthenticated;
    authCheckStatus.value = undefined;
    token.value = '';
  };

  // stores/auth.store.ts
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      if (!token.value || token.value.length < 10) {
        logout();
        return false;
      }

      const statusResp = await checkAuthAction(token.value); // 👈 le pasás el token en memoria

      if (!statusResp.status || !statusResp.data) {
        logout();
        return false;
      }

      authCheckStatus.value = statusResp.data;
      token.value = statusResp.data.token ?? token.value;
      authStatus.value = AuthStatus.Authenticated;

      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
      return false;
    }
  };
  const getPermission = (url: string) => {
    if (!authCheckStatus.value?.permisos) return null;
    for (const menu of authCheckStatus.value.permisos) {
      for (const submenu of menu.subMenu) {
        if (submenu.url === url) return submenu;
      }
    }
    return null;
  };

  const isValidPermission = (url: string): boolean => {
    if (!authCheckStatus.value?.permisos) return false;

    for (const menu of authCheckStatus.value.permisos) {
      for (const submenu of menu.subMenu) {
        if (url.split('/').includes(submenu.url.replace('/', ''))) {
          return true;
        }
      }
    }
    return false;
  };

  const isTokenExpired = (): boolean => {
    if (!token.value || token.value.length < 10) return true;

    try {
      const decoded = jwtDecode(token.value);
      if (!decoded.exp) return true;
      const CLOCK_SKEW_SECONDS = 30;
      const isExpired = Date.now() >= (decoded.exp - CLOCK_SKEW_SECONDS) * 1000;
      if (isExpired) logout();
      return isExpired;
    } catch {
      logout();
      return true;
    }
  };

  const isLoggedIn = (): boolean => {
    if (!token.value || token.value.length < 10) return false;
    return !isTokenExpired();
  };

  return {
    authStatus,
    authCheckStatus,
    token,

    // Getters
    isChecking: computed(() => authStatus.value === AuthStatus.Checking),
    isAuthenticated: computed(() => authStatus.value === AuthStatus.Authenticated),
    username: computed(() => authCheckStatus.value?.nombre_trabajador),
    usernamecomplete: computed(
      () => `${authCheckStatus.value?.nombre_trabajador ?? ''} ${authCheckStatus.value?.apellido_trabajador ?? ''}`.trim(),
    ),
    permissions: computed(() => authCheckStatus.value?.permisos),
    idUser: computed(() => authCheckStatus.value?.idusuario),
    idEmploye: computed(() => authCheckStatus.value?.id_trabajador),
    url_foto: computed(() => authCheckStatus.value?.foto),
    nameEmploye: computed(
      () => `${authCheckStatus.value?.nombre_trabajador ?? ''} ${authCheckStatus.value?.apellido_trabajador ?? ''}`.trim(),
    ),
    isAdmin: computed(() =>
      authCheckStatus.value?.roles.some((role) => role.idrol === AuthRole.Administrador),
    ),
    isAgent: computed(() =>
      authCheckStatus.value?.roles.some((role) => role.idrol === AuthRole.Agente),
    ),


    login,
    checkAuthStatus,
    logout,
    getPermission,
    isValidPermission,
    isLoggedIn,
    isTokenExpired,
  };
});