<template>
  <div class="login-shell">
    <div class="login-card">

      <!-- Panel izquierdo -->
      <div class="panel-brand">
        <div class="brand-topbar"></div>









        <svg class="hex-pattern" viewBox="0 0 280 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <pattern id="hexTile" x="0" y="0" width="68" height="108" patternUnits="userSpaceOnUse">
              <!-- Hexágono fila 1 -->
              <polygon points="34,0 60,14 60,42 34,56 8,42 8,14" fill="none" stroke="rgba(34,197,94,.18)"
                stroke-width="1.2" />

              <!-- Hexágono fila 2 (desplazado) -->
              <polygon points="0,54 26,68 26,96 0,110 -26,96 -26,68" fill="none" stroke="rgba(34,197,94,.18)"
                stroke-width="1.2" />
            </pattern>

            <mask id="maskC">
              <rect width="280" height="900" fill="white" />
              <path d="
        M280 180
        C170 180 170 260 190 720
        L170 50
        C170 640 170 620 280 720
        L280 900
        L280 0
        Z
      " fill="black" />
            </mask>
          </defs>

          <rect width="280" height="900" fill="url(#hexTile)" mask="url(#maskC)" />
        </svg>


















        <div class="panel-brand__content">
          <img class="logo-mark"
            src="https://automatizate-supabase.nggeby.easypanel.host/storage/v1/object/public/bloques/119/a.png"
            alt="R&R Inmobiliaria" />

          <div class="brand-divider"></div>

          <p class="panel-brand__text">
            +15 años construyendo confianza <br />

          </p>
        </div>
      </div>

      <!-- Panel derecho: formulario -->
      <div class="panel-form">
        <div class="panel-form__inner">
          <span class="form-eyebrow">Portal de acceso</span>
          <h2 class="panel-form__title">Iniciar sesión</h2>
          <p class="panel-form__subtitle">Ingresa tus credenciales para continuar</p>

          <form @submit.prevent="onLogin">
            <div class="field">
              <label class="field__label" for="LoggingEmailAddress">Correo electrónico</label>
              <div class="field__control">
                <span class="field__icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                </span>
                <input v-model="myForm.usuario" ref="usernameInputRef" id="LoggingEmailAddress" type="email"
                  placeholder="asesor@ryr.com" autocomplete="username" />
              </div>
            </div>

            <div class="field">
              <label class="field__label" for="loggingPassword">Contraseña</label>
              <div class="field__control">
                <span class="field__icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <input v-model="myForm.contrasenia" ref="passwordInputRef" id="loggingPassword"
                  :type="showPassword ? 'text' : 'password'" placeholder="••••••••" autocomplete="current-password" />
                <button type="button" class="field__toggle" @click="showPassword = !showPassword" tabindex="-1">
                  <svg v-if="!showPassword" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path
                      d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.4 19.4 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a19.5 19.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
              </div>
            </div>
            <button :disabled="isPending" type="submit" class="btn-submit">
              Ingresar
              <IconLoader v-if="isPending" color="white" :width="18" :height="18" />
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useToast } from 'vue-toastification';
import IconLoader from '@/modules/common/components/IconLoader.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const isPending = ref<boolean>(false);
const showPassword = ref<boolean>(false);

const usernameInputRef = ref<HTMLInputElement | null>(null);
const passwordInputRef = ref<HTMLInputElement | null>(null);

const myForm = reactive({
  usuario: '',
  contrasenia: '',
  recordar: true,
});

const onLogin = async () => {
  if (myForm.usuario === '') {
    return usernameInputRef.value?.focus();
  }
  if (myForm.contrasenia === '') {
    return passwordInputRef.value?.focus();
  }

  isPending.value = true;

  const resp = await authStore.login(myForm.usuario, myForm.contrasenia);

  isPending.value = false;

  if (resp.status) {
    router.push({ name: 'homeDashboardAll' });
    return;
  }

  toast.error(resp.message);
};
</script>

<style scoped>
.login-shell {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  overflow-y: auto;
  z-index: 9999;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.login-card {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #0a0a0a;
}

/* ---------- Panel izquierdo ---------- */
.panel-brand {
  position: relative;
  background:
    radial-gradient(circle at 15% 90%, rgba(34, 197, 94, 0.22) 0%, transparent 55%),
    radial-gradient(circle at 0% 0%, rgba(34, 197, 94, 0.10) 0%, transparent 45%),
    #0e0e0e;
  color: #fff;
  padding: 72px 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.brand-topbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #16a34a, #22c55e);
}

.hex-pattern {
  position: absolute;
  inset: 0 auto 0 0;
  width: 280px;
  height: 100%;
  pointer-events: none;
  opacity: 0.35;
}


.panel-brand__content {
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;

  align-items: flex-start;

  /* separación entre logo, línea y texto */
  gap: 12px;
}

.logo-mark {
  width: 540px;
  height: auto;

  margin: 10px;

  position: relative;

  left: 50px;
  top: 0px;
}

.brand-divider {
  width: 80px;
  /* largo */
  height: 4px;
  /* grosor */
  background: #057930;
  border-radius: 20px;

  margin: 0;

  position: relative;

  left: 300px;
  /* Derecha (+) / Izquierda (-) */
  top: -80px;
  /* Abajo (+) / Arriba (-) */
}

.panel-brand__title {
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 18px;
  letter-spacing: -0.01em;
  color: #fff;

  position: relative;

  left: 0px;
  /* Derecha (+) / Izquierda (-) */
  top: 0px;
  /* Abajo (+) / Arriba (-) */
}

.title-thin {
  display: block;
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: 0.28em;
  color: #22c55e;
  margin-top: 10px;
  text-transform: uppercase;
}

.title-rule {
  width: 46px;
  height: 3px;
  background: #22c55e;
  margin: 22px 0 22px;
  border-radius: 2px;
}

.panel-brand__text {
  margin: 0;

  font-size: 1.35rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, .65);
  font-weight: 500;

  position: relative;

  left: 300px;
  /* Derecha (+) / Izquierda (-) */
  top: -73px;
  /* Abajo (+) / Arriba (-) */
}

.accent-text {
  color: #057930;
}

/* ---------- Panel derecho (formulario) ---------- */
.panel-form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #0a0a0a;
}

.panel-form__inner {
  width: 100%;
  max-width: 380px;
  background: #141414;
  border: 1px solid #262626;
  border-radius: 20px;
  padding: 44px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.form-eyebrow {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #078937;
  margin-bottom: 10px;
}

.panel-form__title {
  font-size: 1.7rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 8px;
}

.panel-form__subtitle {
  font-size: 0.88rem;
  color: #8a8a8a;
  margin: 0 0 28px;
}

.field {
  margin-bottom: 18px;
}

.field__label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #b0b0b0;
  margin-bottom: 7px;
}

.field__control {
  position: relative;
  display: flex;
  align-items: center;
}

.field__icon {
  position: absolute;
  left: 16px;
  color: #078937;
  display: flex;
  pointer-events: none;
}

.field__control input {
  width: 100%;
  height: 48px;
  padding: 0 42px 0 44px;
  border-radius: 10px;
  border: 1px solid #2c2c2c;
  background: #1c1c1c;
  font-size: 0.9rem;
  color: #f0f0f0;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}

.field__control input::placeholder {
  color: #666;
}

.field__control input:focus {
  border-color: #078937;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
}

.field__toggle {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #7a7a7a;
  cursor: pointer;
  display: flex;
  padding: 0;
}

.field__toggle:hover {
  color: #078937;
}

.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 2px 26px;
}





.forgot-link {
  font-size: 0.8rem;
  color: #0e6f32;
  text-decoration: none;
  font-weight: 600;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-submit {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #057930 0%, #147437c5 100%);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s ease, transform 0.1s ease;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


.help-row {
  text-align: center;
  font-size: 0.82rem;
  color: #8a8a8a;
  margin: 0;
}

.help-row a {
  color: #22c55e;
  font-weight: 700;
  text-decoration: none;
}

.help-row a:hover {
  text-decoration: underline;
}

.brand-info {
  display: flex;
  align-items: center;

  /* Controla la separación entre logo, línea y texto */
  gap: 20px;
}

/* Responsive */
@media (max-width: 860px) {
  .login-card {
    grid-template-columns: 1fr;
  }

  .panel-brand {
    display: none;
  }

  .panel-form {
    padding: 24px;
  }

  .panel-form__inner {
    padding: 32px 24px;
  }
}
</style>