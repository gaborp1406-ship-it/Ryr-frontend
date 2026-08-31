<template>
  <div class="sidebar" data-simplebar>
    <div class="sidebar__brand" :class="{ hide: collapsed }">
      <img class="sidebar__brand-logo"
        src="https://automatizate-supabase.nggeby.easypanel.host/storage/v1/object/public/bloques/119/a.png"
        alt="Automatízate" />
    </div>

    <ul class="menu ">
      <li class="menu-title" :class="{ hide: collapsed }">Menú</li>

      <li class="menu-item" v-for="menu in filteredPermissions" :key="menu.id">
        <div v-if="menu.subMenu.length > 1">
          <button type="button" class="menu-link" @click="toggleSubmenu(menu.id)"
            :aria-expanded="!!openSubmenus[menu.id]">
            <span class="menu-icon" :class="{ hide: collapsed }">
              <i :class="menu.icono || 'uil uil-apps'"></i>
            </span>
            <span class="menu-text" :class="{ hide: collapsed }">
              {{ menu.nombre }}
            </span>
            <span class="menu-arrow" :class="{ hide: collapsed }">
              <i class="uil uil-angle-down"></i>
            </span>
          </button>

          <ul class="sub-menu" v-show="openSubmenus[menu.id]">
            <li class="menu-item" v-for="submenu in menu.subMenu" :key="submenu.id">
              <RouterLink :to="submenu.url" class="menu-link menu-link--sub" @click="
                (submenu.id === 21 && resetCountNotifySubmenu()) ||
                (submenu.id === 31 && resetCountNotifySaleOp())
                ">
                <span class="submenu-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 8L12 15L19 8" stroke="white" stroke-width="3.8" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="menu-text">{{ submenu.nombre }}</span>
                <span v-if="submenu.id === 21 && count > 0" class="badge badge--danger" :class="{ hide: collapsed }">
                  {{ count }}
                </span>
                <span v-if="submenu.id === 31 && count_sale_op > 0" class="badge badge--primary"
                  :class="{ hide: collapsed }">
                  {{ count_sale_op }}
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>
        <div v-else>
          <RouterLink :to="menu.subMenu[0].url" class="menu-link">
            <span class="menu-icon">
              <i :class="menu.icono || 'uil uil-apps'"></i>
            </span>
            <span class="menu-text"> {{ menu.subMenu[0].nombre }} </span>
          </RouterLink>
        </div>
      </li>
    </ul>

    <div class="sidebar__footer">
      <button @click="
        () => {
          authStore.logout();
          router.push('/auth/login');
        }
      " class="menu-link menu-link--logout">
        <span class="menu-icon" :class="{ hide: collapsed }">
          <i class="uil uil-sign-in-alt"></i>
        </span>
        <span class="menu-text" :class="{ hide: collapsed }"> Cerrar Sesión </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { useNotificationStore } from '../stores/notification.store';

const authStore = useAuthStore();
const router = useRouter();

const { count, count_sale_op } = storeToRefs(useNotificationStore());
const notifyStore = useNotificationStore();

const openSubmenus = reactive<Record<number, boolean>>({});
const toggleSubmenu = (id: number) => {
  openSubmenus[id] = !openSubmenus[id];
};

defineProps<{
  collapsed: boolean;
}>();

const filteredPermissions = computed(() => authStore.permissions || []);

const resetCountNotifySubmenu = () => {
  notifyStore.resetGestionBack();
};

const resetCountNotifySaleOp = () => {
  notifyStore.resetGestionSaleOp();
};
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px 14px 18px;
  background: #000;
  color: #fff;
  box-sizing: border-box;
}

.sidebar__brand {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0 28px;
}

.sidebar__brand-logo {
  width: 170px;
  height: auto;
  object-fit: contain;
}



.menu {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.menu-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffffff;
  padding: 6px 12px 10px;
}

.menu-item {
  margin-bottom: 2px;
}

.menu-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 30px;
  width: 100%;
  padding: 15px 13px 11px 16px;
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.98rem;
  font-weight: 500;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left; /* 👈 fix: resetea el centrado por defecto del <button> */
  transition: background 0.15s ease, color 0.15s ease;
}

.menu-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

/* activo: barra de acento verde + ícono en verde, sin fondo sólido */
.menu-link.router-link-active {
  background: rgba(45, 140, 74, 0.16);
  color: #ffffff;
  box-shadow: none;
  font-weight: 600;
}

.menu-link.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  border-radius: 0 4px 4px 0;
  background: #3fb567;
}

.menu-link.router-link-active .menu-icon {
  color: #3fb567;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 1.15rem;
  flex-shrink: 0;
  color: inherit;
}

.menu-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-arrow {
  display: flex;
  font-size: 0.8rem;
  color: #ffffff;
  transition: transform 0.2s ease;
}

.menu-link[aria-expanded='true'] .menu-arrow {
  transform: rotate(180deg);
}

.sub-menu {
  list-style: none;
  margin: 2px 0 6px;
  padding: 0 0 0 18px;
  border-left: 1.5px solid rgba(255, 255, 255, 0.08);
}

.menu-link--sub {
  padding: 9px 12px 9px 16px;
  font-size: 0.92rem;
}

.menu-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ffffff;
  flex-shrink: 0;
}

.menu-link--sub.router-link-active {
  background: rgba(45, 140, 74, 0.16);
  color: #fff;
  border-radius: 10px;
}

.menu-link--sub.router-link-active .menu-dot {
  background: #3fb567;
}

.badge {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  line-height: 1.4;
}

.badge--danger {
  background: #ef4444;
  color: #fff;
}

.badge--primary {
  background: #9c85f5;
  color: #1a0f42;
}

.sidebar__footer {
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, .12);
}

.menu-link--logout {
  color: #ffffff;
}

.menu-link--logout:hover {
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5;
}

.menu-text,
.sidebar__brand-name,
.menu-arrow,
.badge {
  transition: all .25s ease;
}

.hide {
  opacity: 0;
  width: 0;
  margin: 0;
  overflow: hidden;
}

.submenu-arrow {
  width: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.submenu-arrow svg {
  transform: rotate(-90deg);
  opacity: .9;
  transition: .2s;
}

.menu-link--sub:hover .submenu-arrow svg {
  transform: rotate(-90deg) translateX(2px);
}

.menu-link--sub.router-link-active .submenu-arrow svg {
  opacity: 1;
}
</style>