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

  const resp = await authStore.login(
    myForm.usuario,
    myForm.contrasenia
  );

  isPending.value = false;

  if (!resp.status) {
    toast.error(resp.message);
    return;
  }

  await router.push({ name: 'homeDashboardAll' });
};


</script>

<style scoped>
/* =========================================================
   LOGIN SHELL
   ========================================================= */

.login-shell {
  position: fixed;
  inset: 0;

  width: 100%;
  height: 100%;

  min-height: 100vh;
  min-height: 100dvh;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #0a0a0a;

  overflow: hidden;

  z-index: 9999;

  box-sizing: border-box;

  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}


/* =========================================================
   CARD PRINCIPAL
   ========================================================= */

.login-card {
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

  background: #0a0a0a;

  overflow: hidden;
}


/* =========================================================
   PANEL IZQUIERDO
   ========================================================= */

.panel-brand {
  position: relative;

  min-width: 0;
  min-height: 0;

  background:
    radial-gradient(circle at 15% 90%,
      rgba(34, 197, 94, 0.22) 0%,
      transparent 55%),
    radial-gradient(circle at 0% 0%,
      rgba(34, 197, 94, 0.10) 0%,
      transparent 45%),
    #0e0e0e;

  color: #fff;

  padding: clamp(32px, 5vw, 80px);

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
}


/* Línea verde superior */

.brand-topbar {
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 5px;

  background: linear-gradient(90deg,
      #16a34a,
      #22c55e);

  z-index: 3;
}


/* =========================================================
   PATRÓN HEXAGONAL
   ========================================================= */

.hex-pattern {
  position: absolute;

  inset: 0 auto 0 0;

  width: min(280px, 45%);

  height: 100%;

  pointer-events: none;

  opacity: 0.35;

  z-index: 0;
}


/* =========================================================
   CONTENIDO DEL BRAND
   ========================================================= */

.panel-brand__content {
  position: relative;

  z-index: 1;

  width: 100%;
  max-width: 620px;

  display: flex;
  flex-direction: column;

  align-items: center;

  text-align: center;

  gap: 20px;
}


/* =========================================================
   LOGO
   ========================================================= */

.logo-mark {
  display: block;

  width: min(520px, 90%);

  max-width: 100%;
  height: auto;

  margin: 0;

  position: static;
}


/* =========================================================
   DIVISOR
   ========================================================= */

.brand-divider {
  width: 80px;
  height: 4px;

  background: #057930;

  border-radius: 20px;

  margin: 0;

  position: static;
}


/* =========================================================
   TITULOS
   ========================================================= */

.panel-brand__title {
  font-size: clamp(2rem, 3vw, 2.6rem);

  font-weight: 800;

  line-height: 1.1;

  margin: 0;

  letter-spacing: -0.01em;

  color: #fff;
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

  margin: 22px 0;

  border-radius: 2px;
}


/* =========================================================
   TEXTO
   ========================================================= */

.panel-brand__text {
  margin: 0;

  font-size: clamp(1rem, 1.5vw, 1.35rem);

  line-height: 1.6;

  color: rgba(255, 255, 255, 0.65);

  font-weight: 500;

  position: static;
}


.accent-text {
  color: #057930;
}


/* =========================================================
   PANEL DERECHO
   ========================================================= */

.panel-form {
  min-width: 0;
  min-height: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: clamp(24px, 4vw, 60px);

  background: #0a0a0a;

  overflow-y: auto;
}


/* =========================================================
   CARD DEL FORMULARIO
   ========================================================= */

.panel-form__inner {
  width: 100%;

  max-width: 430px;

  box-sizing: border-box;

  background: #141414;

  border: 1px solid #262626;

  border-radius: 20px;

  padding: clamp(30px, 4vw, 44px);

  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5);
}


/* =========================================================
   TEXTOS DEL FORMULARIO
   ========================================================= */

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
  font-size: clamp(1.5rem, 2vw, 1.7rem);

  font-weight: 800;

  color: #fff;

  margin: 0 0 8px;
}


.panel-form__subtitle {
  font-size: 0.88rem;

  color: #8a8a8a;

  margin: 0 0 28px;

  line-height: 1.5;
}


/* =========================================================
   CAMPOS
   ========================================================= */

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

  width: 100%;
}


.field__icon {
  position: absolute;

  left: 16px;

  color: #078937;

  display: flex;

  pointer-events: none;

  z-index: 1;
}


/* =========================================================
   INPUTS
   ========================================================= */

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

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  box-sizing: border-box;
}


.field__control input::placeholder {
  color: #666;
}


.field__control input:focus {
  border-color: #078937;

  box-shadow:
    0 0 0 3px rgba(34, 197, 94, 0.18);
}


/* =========================================================
   BOTÓN MOSTRAR CONTRASEÑA
   ========================================================= */

.field__toggle {
  position: absolute;

  right: 14px;

  background: none;

  border: none;

  color: #7a7a7a;

  cursor: pointer;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 4px;

  z-index: 2;
}


.field__toggle:hover {
  color: #078937;
}


/* =========================================================
   OPCIONES
   ========================================================= */

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


/* =========================================================
   BOTÓN LOGIN
   ========================================================= */

.btn-submit {
  width: 100%;

  min-height: 50px;

  height: 50px;

  border: none;

  border-radius: 10px;

  background:
    linear-gradient(90deg,
      #057930 0%,
      #147437 100%);

  color: #fff;

  font-size: 0.92rem;

  font-weight: 700;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  transition:
    opacity 0.15s ease,
    transform 0.1s ease,
    box-shadow 0.15s ease;
}


.btn-submit:hover:not(:disabled) {
  opacity: 0.95;

  box-shadow:
    0 8px 25px rgba(5, 121, 48, 0.25);
}


.btn-submit:active:not(:disabled) {
  transform: translateY(1px);
}


.btn-submit:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}


/* =========================================================
   AYUDA
   ========================================================= */

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


/* =========================================================
   BRAND INFO
   ========================================================= */

.brand-info {
  display: flex;

  align-items: center;

  gap: 20px;
}


/* =========================================================
   TABLETS
   ========================================================= */

@media (max-width: 1100px) {
  .panel-brand {
    padding: 40px;
  }

  .logo-mark {
    width: min(420px, 90%);
  }

  .panel-form {
    padding: 32px;
  }
}


/* =========================================================
   TABLET / CELULAR
   ========================================================= */

@media (max-width: 860px) {
  .login-card {
    grid-template-columns: 1fr;
  }

  .panel-brand {
    display: none;
  }

  .panel-form {
    width: 100%;

    min-height: 100dvh;

    padding: 24px;
  }

  .panel-form__inner {
    max-width: 430px;

    padding: 32px 24px;
  }
}


/* =========================================================
   CELULARES PEQUEÑOS
   ========================================================= */

@media (max-width: 480px) {
  .panel-form {
    padding: 16px;
  }

  .panel-form__inner {
    padding: 28px 20px;

    border-radius: 16px;
  }

  .panel-form__title {
    font-size: 1.5rem;
  }

  .field__control input {
    height: 50px;
  }

  .btn-submit {
    height: 50px;
  }
}


/* =========================================================
   PANTALLAS MUY BAJAS
   ========================================================= */

@media (max-height: 650px) and (min-width: 861px) {
  .panel-brand {
    padding-top: 30px;
    padding-bottom: 30px;
  }

  .logo-mark {
    width: min(400px, 80%);
  }

  .panel-form__inner {
    padding-top: 28px;
    padding-bottom: 28px;
  }

  .panel-form__subtitle {
    margin-bottom: 20px;
  }

  .field {
    margin-bottom: 14px;
  }
}
</style>