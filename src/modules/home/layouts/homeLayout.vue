<template>
  <div class="app-wrapper" :class="{ collapsed }">
    <aside class="app-menu">
      <AppMenu :collapsed="collapsed" />
    </aside>

    <div class="content-wrapper">
      <AppTopBar :title="pageTitle" @toggle-menu="toggleMenu" />

      <main class="content-wrapper__body">
        <router-view />
      </main>
    </div>

 
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRoute } from "vue-router";
import { useNotificationStore } from '@/modules/common/stores/notification.store';
import AppMenu from '@/modules/common/components/AppMenu.vue';
import AppTopBar from '@/modules/common/components/AppTopBar.vue';

const collapsed = ref(false);

const toggleMenu = () => {
  collapsed.value = !collapsed.value;
};
const route = useRoute();

const pageTitle = computed(() => {
  return (route.meta.title as string) || "Automatízate";
});
const notificationStore = useNotificationStore();

const original_title = document.title;

const totalNotifications = computed(
  () => notificationStore.count + notificationStore.count_sale_op,
);

watch(
  totalNotifications,
  (total) => {
    document.title = total > 0 ? `${original_title} (${total})` : original_title;
  },
  { immediate: true },
);

let supervisorAlertaInterval: any = null;

onUnmounted(() => {
  if (supervisorAlertaInterval) {
    clearInterval(supervisorAlertaInterval);
  }
});
</script>

<style scoped>
/*
  Paleta de marca (misma familia del login):
  --purple-900 #1a0f42   fondo del sidebar
  --purple-800 #2b1863   fondo del sidebar (degradado)
  --purple-600 #6d3fd6   acentos / hover
  --purple-500 #7c5cf0   acentos / activo
  --purple-100 #ece7f8   fondo general de la app
  --ink        #2b2b3d   texto principal
  --muted      #8a84a3   texto secundario
*/

.app-wrapper {
  display: grid;
  /* antes: 264px 1fr 88px  -> la tercera columna no tenía ningún
     elemento asociado (.app-profile ya no existe en el template),
     así que el content-wrapper (y por tanto el topbar) se quedaba
     88px corto del borde derecho. */
  grid-template-columns: 264px 1fr;
  min-height: 100vh;
  background: #ffffff;
  transition: grid-template-columns 0.35s cubic-bezier(.4, 0, .2, 1);
}

.app-wrapper.collapsed {
  grid-template-columns: 84px 1fr;
}

.app-menu {
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 50;
  overflow: hidden;
  background: #000;
  box-shadow: none;
}

.content-wrapper {
  min-width: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper__body {
  flex: 1;
  padding: 24px 28px 32px;
}

@media (max-width: 1100px) {

  .app-wrapper,
  .app-wrapper.collapsed {
    grid-template-columns: 84px 1fr;
  }
}

@media (max-width: 720px) {

  .app-wrapper,
  .app-wrapper.collapsed {
    grid-template-columns: 1fr;
  }

  .app-menu {
    position: fixed;
    left: 0;
    width: 264px;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .app-wrapper.collapsed .app-menu {
    transform: translateX(0);
  }
}
</style>