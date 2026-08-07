<script setup lang="ts">
import { useLoading } from '../../stores/loading.store';

const { loading } = useLoading();
</script>

<template>
  <div class="overlay" :class="{ 'overlay-show': loading }">
    <div class="overlay-card">
      <!-- Barras -->
      <div class="bars"><span /><span /><span /><span /><span /><span /><span /></div>

      <!-- Texto -->
      <div class="overlay-text">
        <span>Cargandooooooooo</span>
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
@keyframes bar {
  0%,
  100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1);
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

/* — Barras — */
.bars {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 44px;
}
.bars span {
  width: 9px;
  border-radius: 3px 3px 0 0;
  background: linear-gradient(180deg, #a78bfa 0%, #000000 100%);
  animation: bar 1s ease-in-out infinite;
  transform-origin: bottom;
}
.bars span:nth-child(1) {
  height: 22px;
  animation-delay: 0s;
}
.bars span:nth-child(2) {
  height: 38px;
  animation-delay: 0.12s;
}
.bars span:nth-child(3) {
  height: 30px;
  animation-delay: 0.24s;
}
.bars span:nth-child(4) {
  height: 46px;
  animation-delay: 0.36s;
}
.bars span:nth-child(5) {
  height: 26px;
  animation-delay: 0.48s;
}
.bars span:nth-child(6) {
  height: 40px;
  animation-delay: 0.6s;
}
.bars span:nth-child(7) {
  height: 18px;
  animation-delay: 0.72s;
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
  color: #030303;
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
  background: #ffffff;
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