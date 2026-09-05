<template>
  <div class="forbidden-shell">
    <div class="forbidden-card">
      <div class="icon-wrap">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M4.93 4.93l14.14 14.14" />
        </svg>
      </div>

      <span class="eyebrow">Error 403</span>
      <h1 class="title">No tienes permiso para ingresar a esta vista</h1>
      <p class="subtitle">
        Tu usuario no cuenta con acceso a esta sección. Si crees que esto es un
        error, contacta a un administrador para que revise tus permisos.
      </p>

      <div class="actions">
     

        <button type="button" class="btn-secondary" @click="volver">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Volver atrás
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();


const volver = () => {
  if (window.history.length > 1) {
    router.back();
  } 
};
</script>

<style scoped>
.forbidden-shell {
  min-height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-sizing: border-box;
}

.forbidden-card {
  width: 100%;
  max-width: 460px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.icon-wrap {
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.eyebrow {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #ef4444;
  margin-bottom: 12px;
}

.title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 12px;
  line-height: 1.3;
}

.subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 32px;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 20px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease, background 0.15s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(90deg, #057930 0%, #147437c5 100%);
  color: #fff;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-secondary:active {
  transform: translateY(1px);
}

@media (max-width: 480px) {
  .forbidden-card {
    padding: 36px 24px;
  }

  .actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>