
<template>
  <IconFullScreenLoader v-if="authStore.isChecking" />

  <div v-else class="app-container">
    <RouterView />
  </div>

  <VueQueryDevtools />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { AuthStatus } from './modules/auth/interfaces';
import { useRoute, useRouter } from 'vue-router';
import IconFullScreenLoader from '@/modules/common/components/IconFullScreenLoader.vue';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

authStore.$subscribe(
  async (_, state) => {
    if (state.authStatus == AuthStatus.Checking) {
      await authStore.checkAuthStatus();
      return;
    }

    console.log(
      'Estado de autenticación actualizado:',
      state.authStatus,
      'Ruta actual:',
      route.path
    );

    // Si el usuario se autenticó y está en una ruta de login
    if (state.authStatus === AuthStatus.Authenticated) {
      const intendedPath = localStorage.getItem('intendedPath');
      localStorage.removeItem('intendedPath');

      if (route.path.includes('/auth')) {
        router.replace(intendedPath || '/');
      }
    }

    // Si el usuario ha cerrado sesión y no está en una página pública
    if (
      state.authStatus === AuthStatus.UnAuthenticated &&
      !route.path.includes('/auth') &&
      route.meta.requiresAuth
    ) {
      router.replace({ name: 'login' });
    }
  },
  {
    immediate: true,
  }
);

// Helper para obtener la ruta absoluta
const getAbsolutePath = (relativePath: string) => {
  return new URL(relativePath, import.meta.url).href;
};
</script>

<style>
.app-container {
  zoom: 0.8;
}
</style>
