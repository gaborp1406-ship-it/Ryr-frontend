<template>
  <header class="app-header">
    <button class="menu-toggle" @click="emit('toggle-menu')" aria-label="Alternar menú">
      ☰
    </button>

    <div class="app-header__divider"></div>

    <h4 class="app-header__title">{{ props.title }}</h4>

    <div class="profile-menu">
      <!-- Selector de estado (solo agentes) -->
      <div v-if="authStore.isAgent" class="status-selector" ref="statusRef">
        <button type="button" class="status-selector__trigger" :class="`is-${currentStatusSlug}`"
          :disabled="isLoadingStatus || isUpdatingStatus" @click="isStatusOpen = !isStatusOpen">
          <span class="status-dot" :class="`is-${currentStatusSlug}`"></span>
          <span class="status-selector__label">
            {{ isLoadingStatus ? 'Cargando...' : currentStatus?.estado_conexion ?? 'Sin estado' }}
          </span>
          <svg class="status-selector__chevron" :class="{ 'is-open': isStatusOpen }" width="12" height="12"
            viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>

        <transition name="status-fade">
          <ul v-if="isStatusOpen" class="status-selector__menu">
            <li v-for="opt in estadosDisponibles" :key="opt.id" class="status-selector__item"
              :class="{ 'is-selected': opt.id === currentStatus?.id_estado }" @click="selectStatus(opt)">
              <span class="status-dot" :class="`is-${slugify(opt.nombre)}`"></span>
              <span>{{ opt.nombre }}</span>
            </li>
          </ul>
        </transition>
      </div>

      <div class="profile-menu__divider" v-if="authStore.isAgent"></div>

      <a href="#" type="button" class="profile-menu__link">
        <span class="profile-menu__avatar-ring">
          <img :src="authStore.url_foto || '/assets/images/users/TIGRE-CUADRADO-02.jpg'" alt="user-image"
            class="profile-menu__avatar" />
        </span>
        <span class="profile-menu__name">{{ authStore.username }}</span>
      </a>

      <div class="notif-bell" ref="notifRef "v-if="authStore.isAgent">
        <button type="button" class="notif-bell__trigger" @click="toggleNotificaciones"
          aria-label="Notificaciones de leads">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span v-if="contadorNoLeidas > 0" class="notif-bell__badge">{{ contadorNoLeidas }}</span>
        </button>

        <transition name="status-fade">
          <div v-if="isNotifOpen" class="notif-bell__panel">
            <div class="notif-bell__header">
              <span>Notificaciones</span>
              <button v-if="notificaciones.some(n => n.leida)" type="button" class="notif-bell__clear"
                @click="limpiarLeidas" :disabled="isLimpiarLoading">
                {{ isLimpiarLoading ? 'Limpiando...' : 'Limpiar leídas' }}
              </button>
            </div>

            <div v-if="notificaciones.length === 0" class="notif-bell__empty">
              No tienes notificaciones aún
            </div>

            <ul v-else class="notif-bell__list">
              <li v-for="notif in notificaciones" :key="notif.id" class="notif-bell__item"
                :class="{ 'is-unread': !notif.leida }" @click="abrirNotificacion(notif)">
                <span class="notif-bell__dot"></span>
                <div class="notif-bell__content">
                  <p class="notif-bell__title">{{ notif.titulo }}</p>
                  <p class="notif-bell__msg">{{ notif.mensaje }}</p>
                </div>

                <button type="button" class="notif-bell__delete" @click="borrarNotificacion(notif, $event)"
                  aria-label="Eliminar notificación" :disabled="isDeletingNotif">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import {
  listarEstadosConexion,
  obtenerEstadoActual,
  cambiarEstadoAsesor,
} from '@/modules/estados/actions/estados.actions';
import type {
  IEstadoConexion,
  IEstadoActualTrabajador,
} from '@/modules/estados/interfaces/estados.interface';
import { useRouter } from 'vue-router';
import { conectarSocket, desconectarSocket } from '@/modules/leads/actions/socket.service';
import { eventBus } from '../utils/eventBus';
import {
  eliminarNotificacion,
  eliminarTodasNotificacion,
  listarNotificaciones,
  marcarNotificacionLeida,
  
} from '@/modules/leads/actions/notificaciones.action';

interface Parametros {
  title: string;
}

interface INotificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  id_lead: number;
  fecha_creacion: string;
  leida: boolean;
}

const props = defineProps<Parametros>();
const router = useRouter();
const authStore = useAuthStore();

// ========== NOTIFICACIONES ==========
const notificaciones = ref<INotificacion[]>([]);
const contadorNoLeidas = ref(0);
const isNotifOpen = ref(false);
const isLimpiarLoading = ref(false);
const isDeletingNotif = ref(false);
const notifRef = ref<HTMLElement | null>(null);

// ========== ESTADO ==========
const isStatusOpen = ref(false);
const statusRef = ref<HTMLElement | null>(null);
const estadosDisponibles = ref<IEstadoConexion[]>([]);
const currentStatus = ref<IEstadoActualTrabajador | null>(null);
const isLoadingStatus = ref(false);
const isUpdatingStatus = ref(false);

const emit = defineEmits<{
  (e: 'toggle-menu'): void;
  (e: 'status-change', status: IEstadoActualTrabajador): void;
}>();

// ========== UTILIDADES ==========

/**
 * Convierte "En break" -> "en-break" para usarlo en las clases CSS is-xxx
 */
function slugify(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Reproduce sonido de notificación
 */
function reproducirSonido() {
  const audio = new Audio('/sounds/notificacion.mp3');
  audio.volume = 0.6;
  audio.play().catch((err) => {
    console.warn('No se pudo reproducir el sonido:', err);
  });
}

/**
 * Cierra el panel de notificaciones si haces clic afuera
 */
function handleClickOutsideNotif(e: MouseEvent) {
  if (notifRef.value && !notifRef.value.contains(e.target as Node)) {
    isNotifOpen.value = false;
  }
}

/**
 * Cierra el selector de estado si haces clic afuera
 */
function handleClickOutside(e: MouseEvent) {
  if (statusRef.value && !statusRef.value.contains(e.target as Node)) {
    isStatusOpen.value = false;
  }
}

// ========== NOTIFICACIONES - FUNCIONES ==========

function toggleNotificaciones() {
  isNotifOpen.value = !isNotifOpen.value;
}

async function cargarNotificaciones() {
  if (!authStore.idEmploye) return;

  try {
    const data = await listarNotificaciones(authStore.idEmploye);
    notificaciones.value = data;
    contadorNoLeidas.value = data.filter((n) => !n.leida).length;
  } catch (error) {
    console.error('Error al cargar notificaciones:', error);
  }
}

async function abrirNotificacion(notif: INotificacion) {
  if (!notif.leida) {
    notif.leida = true;
    contadorNoLeidas.value = Math.max(0, contadorNoLeidas.value - 1);

    try {
      await marcarNotificacionLeida(notif.id);
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }

  isNotifOpen.value = false;

  // ✅ Caso especial: cliente preguntando por otro proyecto -> ir al detalle del lead
  if (notif.titulo === 'Cliente preguntando por otro proyecto') {
    router.push(`/clients/details/${notif.id_lead}`);
    return;
  }

  // Caso general: como antes
  if (router.currentRoute.value.path === '/clients') {
    eventBus.emit('refrescar-leads', notif.id_lead);
  } else {
    router.push('/clients');
  }
}

async function borrarNotificacion(notif: INotificacion, event: MouseEvent) {
  event.stopPropagation();

  isDeletingNotif.value = true;
  const eraNoLeida = !notif.leida;

  try {
    notificaciones.value = notificaciones.value.filter((n) => n.id !== notif.id);

    if (eraNoLeida) {
      contadorNoLeidas.value = Math.max(0, contadorNoLeidas.value - 1);
    }

    await eliminarNotificacion(notif.id);
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    cargarNotificaciones();
  } finally {
    isDeletingNotif.value = false;
  }
}

async function limpiarLeidas() {
  if (!authStore.idEmploye) return;

  isLimpiarLoading.value = true;

  try {
    notificaciones.value = notificaciones.value.filter((n) => !n.leida);
    await eliminarTodasNotificacion(authStore.idEmploye);
  } catch (error) {
    console.error('Error al limpiar notificaciones leídas:', error);
    cargarNotificaciones();
  } finally {
    isLimpiarLoading.value = false;
  }
}

// ========== ESTADO - FUNCIONES ==========

const currentStatusSlug = computed(() =>
  currentStatus.value ? slugify(currentStatus.value.estado_conexion) : 'desconectado'
);

async function cargarEstadoActual() {
  if (!authStore.idEmploye) return;

  isLoadingStatus.value = true;
  try {
    currentStatus.value = await obtenerEstadoActual(authStore.idEmploye);
  } catch (error) {
    console.error('Error al cargar el estado actual:', error);
  } finally {
    isLoadingStatus.value = false;
  }
}

async function cargarEstadosDisponibles() {
  try {
    estadosDisponibles.value = await listarEstadosConexion();
  } catch (error) {
    console.error('Error al cargar los estados disponibles:', error);
  }
}

async function selectStatus(opt: IEstadoConexion) {
  if (!authStore.idEmploye) return;
  if (opt.id === currentStatus.value?.id_estado) {
    isStatusOpen.value = false;
    return;
  }

  isStatusOpen.value = false;
  isUpdatingStatus.value = true;

  try {
    const nuevoEstado = await cambiarEstadoAsesor({
      id_trabajador: authStore.idEmploye,
      id_estado: opt.id,
    });

    await cargarEstadoActual();
    emit('status-change', currentStatus.value ?? nuevoEstado);
  } catch (error) {
    console.error('Error al cambiar el estado:', error);
  } finally {
    isUpdatingStatus.value = false;
  }
}

// ========== LIFECYCLE ==========

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('click', handleClickOutsideNotif);

  if (authStore.isAgent) {
    cargarEstadosDisponibles();
    cargarEstadoActual();
  }

  if (authStore.idEmploye) {
    cargarNotificaciones();

    const socket = conectarSocket(authStore.idEmploye);

    socket.on('nueva-notificacion', (notif: INotificacion) => {
      notificaciones.value.unshift(notif);
      contadorNoLeidas.value++;
      reproducirSonido();
    });
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('click', handleClickOutsideNotif);
  desconectarSocket();
});
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

.notif-bell {
  position: relative;
}

.notif-bell__trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid transparent;
  background: transparent;
  color: #374151;
  cursor: pointer;
  transition: background .18s ease;
}

.notif-bell__trigger:hover {
  background: #f3f4f6;
}

.notif-bell__badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-bell__panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 300px;
  max-height: 360px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .12);
  z-index: 50;
}

.notif-bell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  font-weight: 700;
  font-size: .85rem;
  border-bottom: 1px solid #f3f4f6;
}

.notif-bell__clear {
  border: none;
  background: transparent;
  color: #2d8c4a;
  font-size: .72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s ease;
}

.notif-bell__clear:hover:not(:disabled) {
  text-decoration: underline;
}

.notif-bell__clear:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.notif-bell__empty {
  padding: 20px 14px;
  font-size: .8rem;
  color: #9ca3af;
  text-align: center;
}

.notif-bell__list {
  list-style: none;
  margin: 0;
  padding: 6px;
}

.notif-bell__item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s ease;
}

.notif-bell__item:hover {
  background: #f9fafb;
}

.notif-bell__item.is-unread {
  background: #eefdf3;
}

.notif-bell__dot {
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: 50%;
  background: #2d8c4a;
  flex-shrink: 0;
}

.notif-bell__content {
  flex: 1;
  min-width: 0;
}

.notif-bell__title {
  margin: 0;
  font-size: .82rem;
  font-weight: 600;
  color: #111827;
}

.notif-bell__msg {
  margin: 2px 0 0;
  font-size: .78rem;
  color: #6b7280;
}

.notif-bell__delete {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  opacity: 0;
  transition: all .15s ease;
}

.notif-bell__item:hover .notif-bell__delete {
  opacity: 1;
}

.notif-bell__delete:hover:not(:disabled) {
  background: #fee2e2;
  color: #ef4444;
}

.notif-bell__delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.profile-menu {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
  flex-shrink: 0;
}

.profile-menu__divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
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

/* ---- Selector de estado ---- */

.status-selector {
  position: relative;
}

.status-selector__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
  font-size: .85rem;
  font-weight: 600;
  color: #111827;
  transition: all .18s ease;
}

.status-selector__trigger:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.status-selector__trigger:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.status-selector__label {
  white-space: nowrap;
}

.status-selector__chevron {
  color: #9ca3af;
  transition: transform .18s ease;
  flex-shrink: 0;
}

.status-selector__chevron.is-open {
  transform: rotate(180deg);
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.is-activo {
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, .18);
  animation: pulse-activo 2s infinite;
}

.status-dot.is-ocupado {
  background: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, .16);
}

.status-dot.is-en-break,
.status-dot.is-break {
  background: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, .16);
}

.status-dot.is-desconectado {
  background: #9ca3af;
  box-shadow: 0 0 0 3px rgba(156, 163, 175, .16);
}

@keyframes pulse-activo {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, .35);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.status-selector__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 170px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .12);
  padding: 6px;
  margin: 0;
  list-style: none;
  z-index: 40;
}

.status-selector__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: .85rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background .15s ease;
}

.status-selector__item:hover {
  background: #f3f4f6;
}

.status-selector__item.is-selected {
  background: #eefdf3;
  color: #15803d;
  font-weight: 600;
}

.status-fade-enter-active,
.status-fade-leave-active {
  transition: opacity .15s ease, transform .15s ease;
}

.status-fade-enter-from,
.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>