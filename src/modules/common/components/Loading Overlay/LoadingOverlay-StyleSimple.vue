<script setup lang="ts">
import { useLoading } from '../../stores/loading.store';

const { loading } = useLoading();
</script>

<template>
  <div class="overlay" :class="{ 'overlay-show': loading }">
    <div class="overlay-card">
      <!-- Spinner doble anillo -->
      <div class="spinner-wrap">
        <svg class="ring-cw" width="94" height="94" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" stroke="#ece7fc" stroke-width="4" fill="none" />
          <circle
            cx="32"
            cy="32"
            r="26"
            stroke="#6d28d9"
            stroke-width="4"
            fill="none"
            stroke-linecap="round"
            stroke-dasharray="120"
            stroke-dashoffset="90"
          />
        </svg>
        <svg class="ring-ccw" width="94" height="94" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="26"
            stroke="#a78bfa"
            stroke-width="4"
            fill="none"
            stroke-linecap="round"
            stroke-dasharray="60"
            stroke-dashoffset="20"
          />
        </svg>
      </div>

      <!-- Texto -->
      <div class="overlay-text">
        <span>Cargandoooooo</span>
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
@keyframes spinCW {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes spinCCW {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
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
}

/* — Spinner — */
.spinner-wrap {
  position: relative;
  width: 94px;
  height: 94px;
}
.spinner-wrap svg {
  position: absolute;
  top: 0;
  left: 0;
}
.ring-cw {
  animation: spinCW 1s linear infinite;
}
.ring-ccw {
  animation: spinCCW 1.5s linear infinite;
}

/* — Texto + dots — */
.overlay-text {
  display: flex;
  align-items: center;
  gap: 6px;
}
.overlay-text > span {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #7c3aed;
}
.overlay-dots {
  display: flex;
  align-items: center;
  gap: 3px;
}
.overlay-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #000000;
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