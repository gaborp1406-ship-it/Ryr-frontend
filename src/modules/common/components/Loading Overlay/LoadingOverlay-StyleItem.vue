<script setup lang="ts">
import { useLoading } from '../../stores/loading.store';

const { loading } = useLoading();
</script>

<template>
  <div class="overlay" :class="{ 'overlay-show': loading }">
    <div class="overlay-card">
      <!-- Skeleton del menú lateral -->
      <div class="menu-skeleton">
        <div
          class="menu-item"
          v-for="(w, i) in [70, 90, 60, 80, 65]"
          :key="i"
          :style="`--delay: ${i * 0.1}s`"
        >
          <div class="menu-icon" />
          <div class="menu-label" :style="`width: ${w}px`" />
        </div>
      </div>

      <!-- Spinner + texto -->
      <div class="spinner-row">
        <div class="spinner-ring" />
        <span class="spinner-text">Cargandoooooo</span>
        <div class="overlay-dots"><span /><span /><span /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes overlayDot {
  0%,
  80%,
  100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1.2);
  }
}
@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes spinCW {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  opacity: 0;
  visibility: hidden;
  transform: scale(0);
  transition:
    opacity 1s ease-in-out,
    transform 400ms ease-in-out,
    visibility 1s ease-in-out;
  z-index: 1000;
}
.overlay-show {
  transform: scale(1);
  opacity: 1;
  visibility: visible;
  transition:
    opacity 0.5s ease,
    transform 0.5s ease,
    visibility 0s linear 0s;
}

.overlay-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: fadeSlideUp 0.5s ease both;
}

/* — Skeleton menú — */
.menu-skeleton {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 180px;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 8px;
  background: #f4f4f4;
  animation: pulse 1.6s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}
.menu-icon {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: #ddd;
  flex-shrink: 0;
}
.menu-label {
  height: 10px;
  border-radius: 4px;
  background: #ddd;
}

/* — Spinner — */
.spinner-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.spinner-ring {
  width: 22px;
  height: 22px;
  border: 2.5px solid #e0e0e0;
  border-top-color: #111;
  border-radius: 50%;
  animation: spinCW 0.8s linear infinite;
}
.spinner-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #888;
}

/* — Dots — */
.overlay-dots {
  display: flex;
  align-items: center;
  gap: 3px;
}
.overlay-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #aaa;
  animation: overlayDot 1.2s ease-in-out infinite;
}
.overlay-dots span:nth-child(1) {
  animation-delay: 0s;
}
.overlay-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.overlay-dots span:nth-child(3) {
  animation-delay: 0.4s;
}
</style>
