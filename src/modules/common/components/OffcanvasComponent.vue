<!-- DEV_ANTHONY -->
<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div
      v-if="visible"
      class="offcanvas-backdrop"
      :class="{ visible: animating }"
      @click="offcanvas.close()"
    />
  </Transition>

  <!-- Panel -->
  <div
    class="offcanvas-panel"
    :class="{ open: animating }"
    role="dialog"
    :aria-label="config?.title"
  >
    <template v-if="config">
      <!-- Header -->
      <div class="offcanvas-header">
        <div class="offcanvas-title-group">
          <span class="offcanvas-label">Panel</span>
          <h2 class="offcanvas-title">{{ config.title }}</h2>
        </div>
        <button class="offcanvas-close" aria-label="Cerrar" @click="offcanvas.close()">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Divider -->
      <div class="offcanvas-divider" />

      <!-- Dynamic Component -->
      <div class="offcanvas-body">
        <component :is="config.component" v-bind="config.inputs ?? {}" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useOffcanvas } from '../interfaces/offcanvas.interface';

const offcanvas = useOffcanvas();
const { visible: offcanvasVisible, config } = offcanvas;

// Estado local para manejar animaciones (igual que Angular)
const visible = ref(false);
const animating = ref(false);

watch(offcanvasVisible, async (isVisible) => {
  if (isVisible && config.value) {
    visible.value = true;
    await nextTick(); // equivalente a requestAnimationFrame
    animating.value = true;
  } else {
    animating.value = false;
    setTimeout(() => {
      visible.value = false;
    }, 300);
  }
});
</script>

<style scoped>
/* ── Backdrop ─────────────────────────────────────────────────────────────── */
.offcanvas-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  z-index: 1040;
  transition: background 300ms ease;
}

.offcanvas-backdrop.visible {
  background: rgba(0, 0, 0, 0.45);
}

/* ── Panel ────────────────────────────────────────────────────────────────── */
.offcanvas-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 420px;
  max-width: 100vw;
  background: #fff;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  z-index: 1050;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.offcanvas-panel.open {
  transform: translateX(0);
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.offcanvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
}

.offcanvas-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.offcanvas-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9ca3af;
}

.offcanvas-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.offcanvas-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition:
    background 150ms,
    color 150ms;
}

.offcanvas-close:hover {
  background: #f3f4f6;
  color: #111827;
}

/* ── Divider ──────────────────────────────────────────────────────────────── */
.offcanvas-divider {
  height: 1px;
  background: #e5e7eb;
  flex-shrink: 0;
}

/* ── Body ─────────────────────────────────────────────────────────────────── */
.offcanvas-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* ── Backdrop transition (Vue <Transition>) ───────────────────────────────── */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 300ms ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
