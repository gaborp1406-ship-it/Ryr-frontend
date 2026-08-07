<template>
  <header class="app-header">
    <button class="menu-toggle" @click="emit('toggle-menu')" aria-label="Alternar menú">
      ☰
    </button>

    <div class="app-header__divider"></div>

    <h4 class="app-header__title">{{ props.title }}</h4>

    <div class="profile-menu">
      <a href="#" type="button" class="profile-menu__link">
        <span class="profile-menu__avatar-ring">
          <img src="/assets/images/users/TIGRE-CUADRADO-02.jpg" alt="user-image" class="profile-menu__avatar" />
        </span>
        <span class="profile-menu__name">{{ authStore.username }}</span>
      </a>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';

interface Parametros {
  title: string;
}

const props = defineProps<Parametros>();

const emit = defineEmits<{
  (e: 'toggle-menu'): void;
}>();


import { useAuthStore } from '@/modules/auth/stores/auth.store';

const authStore = useAuthStore();

</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 30;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgb(74, 73, 73);
}

.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid #ffffff;
  background: #ffffff;
  color: #000000;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all .2s ease;
  flex-shrink: 0;
}

.menu-toggle:hover {
  background: #f3f4f6;
  border-color: #2d8c4a;
  color: #2d8c4a;
}

.app-header__divider {
  width: 1px;
  height: 28px;
  background: #000000;
  flex-shrink: 0;
}

.app-header__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #000000;
  letter-spacing: -.02em;
  line-height: 1;
  white-space: nowrap;
}

/* ---- lo que faltaba: el bloque de perfil no tenía ningún estilo,
   por eso rompía la línea (la img se renderiza a su tamaño real
   con display:inline por defecto) ---- */

.profile-menu {
  display: flex;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
}

.profile-menu__link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  padding: 6px 10px 6px 6px;
  border-radius: 999px;
  transition: background .2s ease;
}

.profile-menu__link:hover {
  background: #f3f4f6;
}

.profile-menu__avatar-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 2px;
  background: #2d8c4a;
  flex-shrink: 0;
}

.profile-menu__avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 2px solid #ffffff;
}

.profile-menu__name {
  font-size: .9rem;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
}
</style>