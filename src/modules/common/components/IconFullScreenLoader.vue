<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="loader-overlay">
        <div class="loader-card">
          <svg class="skyline" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
            <line x1="4" y1="72" x2="116" y2="72" class="ground" />

            <g class="building-wrap b1">
              <rect class="building" x="14" y="26" width="14" height="46" rx="1.5" />
              <rect class="window" x="18" y="34" width="2.5" height="2.5" />
              <rect class="window" x="24" y="34" width="2.5" height="2.5" />
            </g>

            <g class="building-wrap b2">
              <rect class="building" x="34" y="12" width="16" height="60" rx="1.5" />
              <rect class="window" x="39" y="20" width="2.5" height="2.5" />
              <rect class="window" x="45" y="20" width="2.5" height="2.5" />
            </g>

            <g class="building-wrap b3">
              <rect class="building" x="56" y="38" width="12" height="34" rx="1.5" />
            </g>

            <g class="building-wrap b4">
              <rect class="building" x="74" y="4" width="18" height="68" rx="1.5" />
              <rect class="window" x="79" y="12" width="2.5" height="2.5" />
              <rect class="window" x="85" y="12" width="2.5" height="2.5" />
            </g>

            <g class="building-wrap b5">
              <rect class="building" x="98" y="44" width="10" height="28" rx="1.5" />
            </g>
          </svg>

          <div class="loader-text-group">
          
            <p class="loader-subtitle">Cargando...</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(20, 24, 22, .5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 99999;
}

.loader-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 48px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow:
    0 2px 4px rgba(16, 24, 40, .06),
    0 24px 48px rgba(16, 24, 40, .18);
  border: 1px solid rgba(16, 24, 40, .06);
  min-width: 260px;
}

.skyline {
  width: 130px;
  height: 86px;
  overflow: visible;
}

.ground {
  stroke: #d8dcda;
  stroke-width: 1.5;
  stroke-linecap: round;
}

/* Cada building-wrap ancla su animación en la base (y=72) */
.building-wrap {
  transform-box: fill-box;
  transform-origin: bottom;
  animation: riseBuilding 2.4s ease-in-out infinite;
}

.building-wrap.b1 { animation-delay: 0s; }
.building-wrap.b2 { animation-delay: .15s; }
.building-wrap.b3 { animation-delay: .3s; }
.building-wrap.b4 { animation-delay: .1s; }
.building-wrap.b5 { animation-delay: .4s; }

.building {
  fill: #e7ede9;
  animation: colorPulse 2.4s ease-in-out infinite;
}

.building-wrap.b1 .building { animation-delay: 0s; }
.building-wrap.b2 .building { animation-delay: .15s; }
.building-wrap.b3 .building { animation-delay: .3s; }
.building-wrap.b4 .building { animation-delay: .1s; }
.building-wrap.b5 .building { animation-delay: .4s; }

@keyframes riseBuilding {
  0%, 10%   { transform: scaleY(0); }
  50%       { transform: scaleY(1); }
  90%       { transform: scaleY(1); }
  100%      { transform: scaleY(0); }
}

@keyframes colorPulse {
  0%, 45%   { fill: #e7ede9; }
  55%, 85%  { fill: #2d8c4a; }
  100%      { fill: #e7ede9; }
}

.window {
  fill: #ffffff;
  opacity: 0;
  animation: blink 2.4s ease-in-out infinite;
}

.building-wrap.b1 .window { animation-delay: .6s; }
.building-wrap.b2 .window { animation-delay: .8s; }

@keyframes blink {
  0%, 45%  { opacity: 0; }
  55%, 85% { opacity: 1; }
  100%     { opacity: 0; }
}

.loader-text-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.loader-title {
  margin: 0;
  font-size: .95rem;
  font-weight: 600;
  letter-spacing: -.01em;
  color: #101828;
}

.loader-subtitle {
  margin: 0;
  font-size: .8rem;
  font-weight: 400;
  color: #667085;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>


<!-- <template>
  <Teleport to="body">
    <div class="loader-overlay">
      <div class="loader-card">
        <svg width="56" height="56" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect class="spinner spinner-1" x="1" y="1" rx="2" width="10" height="10" fill="#2d8c4a" />
          <rect class="spinner spinner-2" x="1" y="1" rx="2" width="10" height="10" fill="#37a357" />
          <rect class="spinner spinner-3" x="1" y="1" rx="2" width="10" height="10" fill="#1f6b38" />
        </svg>

        <p class="loader-text">Cargando...</p>
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(248, 250, 252, .78);
  backdrop-filter: blur(6px);
  z-index: 99999;
}

.loader-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 32px 44px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow:
    0 20px 50px rgba(31, 107, 56, .12),
    0 4px 12px rgba(0, 0, 0, .04);
  border: 1px solid rgba(45, 140, 74, .08);
}

.loader-text {
  margin: 0;
  font-size: .95rem;
  font-weight: 600;
  letter-spacing: .02em;
  color: #1f2a24;
}

.spinner {
  animation: spinnerMove 2.4s cubic-bezier(.65, 0, .35, 1) infinite;
  filter: drop-shadow(0 2px 4px rgba(45, 140, 74, .25));
}

.spinner-1 {
  animation-delay: -2.4s;
}

.spinner-2 {
  animation-delay: -1.6s;
}

.spinner-3 {
  animation-delay: -.8s;
}

@keyframes spinnerMove {
  8.33% {
    x: 13px;
    y: 1px;
  }

  25% {
    x: 13px;
    y: 1px;
  }

  33.3% {
    x: 13px;
    y: 13px;
  }

  50% {
    x: 13px;
    y: 13px;
  }

  58.33% {
    x: 1px;
    y: 13px;
  }

  75% {
    x: 1px;
    y: 13px;
  }

  83.33% {
    x: 1px;
    y: 1px;
  }
}
</style> -->
