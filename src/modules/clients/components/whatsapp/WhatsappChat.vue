<!-- src/modules/clients/components/whatsapp/WhatsappChat.vue -->
<template>
  <Teleport to="body">
    <!-- Botón flotante para abrir el chat -->
    <button v-if="!abierto" class="wsp-fab" title="Abrir chat de WhatsApp" @click="abrir">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z" />
      </svg>
      <span>WhatsApp</span>
    </button>

    <template v-if="abierto">
      <!-- Fondo oscuro solo cuando está extendido -->
      <div v-if="expandido" class="wsp-backdrop" @click="expandido = false" />

      <section class="wsp-panel" :class="{ 'wsp-panel--expandido': expandido }" role="dialog" aria-label="Chat de WhatsApp">
        <!-- Cabecera -->
        <header class="wsp-head">
          <div class="wsp-head__info">
            <div class="wsp-head__titulo">{{ titulo }}</div>
            <div class="wsp-head__sub">
              <span class="wsp-dot" :class="ventanaAbierta ? 'wsp-dot--on' : 'wsp-dot--off'" />
              {{ ventanaAbierta ? 'Ventana de 24 h abierta' : 'Ventana de 24 h cerrada' }}
            </div>
          </div>

          <button class="wsp-iconbtn" :title="expandido ? 'Reducir' : 'Extender'" @click="alternarExpandido">
            <svg v-if="!expandido" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
            </svg>
          </button>
          <button class="wsp-iconbtn" title="Cerrar" @click="cerrar">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <!-- Mensajes -->
        <div ref="contenedor" class="wsp__mensajes">
          <div v-if="cargando" class="wsp__estado">Cargando conversación…</div>

          <div v-else-if="!items.length" class="wsp__estado">
            Aún no hay mensajes con este cliente.
          </div>

          <template v-for="item in items" :key="item.key">
            <div v-if="item.tipo === 'fecha'" class="wsp__fecha">
              <span>{{ item.label }}</span>
            </div>

            <div
              v-else
              class="wsp__fila"
              :class="item.msg.direccion === 'SALIENTE' ? 'wsp__fila--out' : 'wsp__fila--in'"
            >
              <div
                class="wsp__burbuja"
                :class="[
                  item.msg.direccion === 'SALIENTE' ? 'wsp__burbuja--out' : 'wsp__burbuja--in',
                  { 'wsp__burbuja--error': item.msg.estado === 'FALLIDO' },
                ]"
              >
                <WhatsappMedia
                  v-if="item.msg.tiene_archivo || item.msg.media_url"
                  :id-mensaje="item.msg.id"
                  :mime="item.msg.media_mime"
                  :nombre="item.msg.media_nombre"
                  :url="item.msg.media_url"
                  :tiene-archivo="item.msg.tiene_archivo"
                />
                <div v-if="item.msg.contenido" class="wsp__texto">{{ item.msg.contenido }}</div>
                <div class="wsp__meta">
                  <span>{{ hora(item.msg.fecha_creacion) }}</span>
                  <span
                    v-if="item.msg.direccion === 'SALIENTE'"
                    class="wsp__tick"
                    :class="{
                      'wsp__tick--leido': item.msg.estado === 'LEIDO',
                      'wsp__tick--fallido': item.msg.estado === 'FALLIDO',
                    }"
                    :title="item.msg.error || item.msg.estado"
                  >{{ tick(item.msg.estado) }}</span>
                </div>
                <div v-if="item.msg.estado === 'FALLIDO' && item.msg.error" class="wsp__error-msg">
                  {{ item.msg.error }}
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Error general -->
        <div v-if="error" class="wsp__alerta wsp__alerta--error">
          <span>{{ error }}</span>
          <button class="wsp__link" @click="error = ''">Cerrar</button>
        </div>

        <!-- Ventana de 24h cerrada -->
        <div v-if="!cargando && !ventanaAbierta" class="wsp__alerta wsp__alerta--aviso">
          <div>
            Pasaron más de 24 horas desde el último mensaje del cliente (o aún no te ha escrito).
            Solo puedes enviar una <strong>plantilla aprobada</strong>.
          </div>
          <div class="wsp__alerta-acciones">
            <button class="wsp__btn wsp__btn--chico" :disabled="enviando" @click="enviarSaludoClick">
              {{ enviando ? 'Enviando…' : 'Enviar saludo' }}
            </button>
            <button class="wsp__link" @click="mostrarPlantilla = !mostrarPlantilla">
              {{ mostrarPlantilla ? 'Ocultar' : 'Otra plantilla' }}
            </button>
          </div>
        </div>

        <!-- Formulario de plantilla -->
        <div v-if="mostrarPlantilla" class="wsp__plantilla">
          <div class="wsp__plantilla-fila">
            <label>
              Nombre de la plantilla
              <input v-model.trim="plantilla.nombre" type="text" placeholder="saludo_asesor" />
            </label>
            <label class="wsp__plantilla-idioma">
              Idioma
              <input v-model.trim="plantilla.idioma" type="text" placeholder="es" />
            </label>
          </div>
          <label>
            Parámetros (separados por coma, en el orden de las variables de la plantilla)
            <input v-model="plantilla.parametros" type="text" placeholder="Gabriel, Inmobiliaria Demo" />
          </label>
          <div class="wsp__plantilla-acciones">
            <button class="wsp__btn" :disabled="enviando || !plantilla.nombre" @click="enviarPlantillaClick">
              {{ enviando ? 'Enviando…' : 'Enviar plantilla' }}
            </button>
          </div>
        </div>

        <!-- Archivo seleccionado (vista previa) -->
        <div v-if="archivo" class="wsp__adjunto">
          <img v-if="vistaPrevia" :src="vistaPrevia" class="wsp__adjunto-img" alt="" />
          <span v-else class="wsp__adjunto-icono">{{ archivo.type.startsWith('video/') ? '🎬' : '📄' }}</span>
          <div class="wsp__adjunto-info">
            <div class="wsp__adjunto-nombre">{{ archivo.name }}</div>
            <div class="wsp__adjunto-peso">{{ pesoLegible(archivo.size) }} · el texto de abajo irá como comentario</div>
          </div>
          <button class="wsp-iconbtn wsp-iconbtn--oscuro" title="Quitar archivo" @click="quitarArchivo">✕</button>
        </div>

        <!-- Input de texto -->
        <div class="wsp__input">
          <input
            ref="inputArchivo"
            type="file"
            class="wsp__file"
            :accept="ACEPTA"
            @change="elegirArchivo"
          />
          <button
            class="wsp__clip"
            title="Adjuntar imagen, video o documento"
            :disabled="!ventanaAbierta || enviando"
            @click="inputArchivo?.click()"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.4 11-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
            </svg>
          </button>
          <textarea
            ref="textarea"
            v-model="texto"
            rows="1"
            :disabled="!ventanaAbierta || enviando"
            :placeholder="
              !ventanaAbierta ? 'Usa una plantilla'
                : archivo ? 'Agrega un comentario (opcional)' : 'Escribe un mensaje…'
            "
            @keydown.enter.exact.prevent="enviar"
            @input="autoCrecer"
          />
          <button
            class="wsp__btn"
            :disabled="!ventanaAbierta || enviando || (!texto.trim() && !archivo)"
            @click="enviar"
          >
            {{ enviando ? '…' : 'Enviar' }}
          </button>
        </div>
      </section>
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import {
  enviarArchivo,
  enviarPlantilla,
  enviarSaludo,
  enviarTexto,
  obtenerConversacion,
  type EstadoMensajeWsp,
  type MensajeWsp,
} from './whatsapp.action';
import WhatsappMedia from './WhatsappMedia.vue';

const props = withDefaults(
  defineProps<{
    idLead: number;
    titulo?: string;
    abrirInicial?: boolean;
  }>(),
  { titulo: 'WhatsApp', abrirInicial: false },
);

const POLLING_MS = 4000;

const abierto = ref(false);
const expandido = ref(false);

const mensajes = ref<MensajeWsp[]>([]);
const ventanaAbierta = ref(false);
const cargando = ref(true);
const enviando = ref(false);
const error = ref('');
const texto = ref('');

// Archivo adjunto (imagen, video o documento)
const ACEPTA =
  'image/jpeg,image/png,video/mp4,video/3gpp,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
const MAX_MB = { image: 5, video: 16, otro: 25 };
const archivo = ref<File | null>(null);
const vistaPrevia = ref('');
const inputArchivo = ref<HTMLInputElement | null>(null);

const mostrarPlantilla = ref(false);
const plantilla = reactive({ nombre: '', idioma: 'es', parametros: '' });

const contenedor = ref<HTMLElement | null>(null);
const textarea = ref<HTMLTextAreaElement | null>(null);
let timer: ReturnType<typeof setInterval> | null = null;

// ───────────── helpers de formato ─────────────

function mensajeDeError(e: any): string {
  const m = e?.response?.data?.message;
  return (Array.isArray(m) ? m.join(', ') : m) || e?.message || 'Ocurrió un error';
}

function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function etiquetaFecha(iso: string): string {
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  const mismo = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (mismo(d, hoy)) return 'Hoy';
  if (mismo(d, ayer)) return 'Ayer';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
}

function tick(estado: EstadoMensajeWsp): string {
  switch (estado) {
    case 'ENVIADO': return '✓';
    case 'ENTREGADO':
    case 'LEIDO': return '✓✓';
    case 'FALLIDO': return '⚠';
    default: return '';
  }
}

/** Mensajes agrupados con separadores por día */
const items = computed(() => {
  const out: Array<
    | { key: string; tipo: 'fecha'; label: string }
    | { key: string; tipo: 'msg'; msg: MensajeWsp }
  > = [];
  let ultimaFecha = '';
  for (const msg of mensajes.value) {
    const dia = new Date(msg.fecha_creacion).toDateString();
    if (dia !== ultimaFecha) {
      ultimaFecha = dia;
      out.push({ key: `f-${dia}`, tipo: 'fecha', label: etiquetaFecha(msg.fecha_creacion) });
    }
    out.push({ key: `m-${msg.id}`, tipo: 'msg', msg });
  }
  return out;
});

// ───────────── scroll ─────────────

function estaAbajo(): boolean {
  const el = contenedor.value;
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
}

async function irAbajo() {
  await nextTick();
  const el = contenedor.value;
  if (el) el.scrollTop = el.scrollHeight;
}

function autoCrecer() {
  const el = textarea.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
}

// ───────────── carga y polling ─────────────

async function cargar(primeraVez = false) {
  try {
    const abajoAntes = primeraVez || estaAbajo();
    const ultimoIdAntes = mensajes.value[mensajes.value.length - 1]?.id;

    const data = await obtenerConversacion(props.idLead);
    mensajes.value = data.mensajes;
    ventanaAbierta.value = data.ventana_abierta;

    const hayNuevos = data.mensajes[data.mensajes.length - 1]?.id !== ultimoIdAntes;
    if (abajoAntes && (primeraVez || hayNuevos)) await irAbajo();
  } catch (e) {
    if (primeraVez) error.value = mensajeDeError(e);
  } finally {
    if (primeraVez) cargando.value = false;
  }
}

function iniciarPolling() {
  detenerPolling();
  timer = setInterval(() => {
    if (!document.hidden && !enviando.value) cargar();
  }, POLLING_MS);
}

function detenerPolling() {
  if (timer) clearInterval(timer);
  timer = null;
}

function alCambiarVisibilidad() {
  if (!document.hidden) cargar();
}

// ───────────── abrir / cerrar / extender ─────────────

function alPresionarTecla(e: KeyboardEvent) {
  if (e.key !== 'Escape') return;
  if (expandido.value) expandido.value = false;
  else cerrar();
}

async function abrir() {
  abierto.value = true;
  cargando.value = true;
  document.addEventListener('keydown', alPresionarTecla);
  document.addEventListener('visibilitychange', alCambiarVisibilidad);
  await cargar(true);
  iniciarPolling();
  await nextTick();
  if (ventanaAbierta.value) textarea.value?.focus();
}

function cerrar() {
  abierto.value = false;
  expandido.value = false;
  detenerPolling();
  document.removeEventListener('keydown', alPresionarTecla);
  document.removeEventListener('visibilitychange', alCambiarVisibilidad);
}

async function alternarExpandido() {
  expandido.value = !expandido.value;
  await irAbajo();
}

// ───────────── acciones ─────────────

async function enviar() {
  const msg = texto.value.trim();
  if ((!msg && !archivo.value) || enviando.value || !ventanaAbierta.value) return;

  enviando.value = true;
  error.value = '';
  try {
    if (archivo.value) {
      await enviarArchivo(props.idLead, archivo.value, msg);
      quitarArchivo();
    } else {
      await enviarTexto(props.idLead, msg);
    }
    texto.value = '';
    await nextTick();
    autoCrecer();
    await cargar();
    await irAbajo();
  } catch (e) {
    error.value = mensajeDeError(e);
    await cargar(); // por si quedó registrado como FALLIDO
  } finally {
    enviando.value = false;
  }
}

function pesoLegible(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function elegirArchivo(e: Event) {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  input.value = ''; // permite volver a elegir el mismo archivo
  if (!f) return;

  const limite = f.type.startsWith('image/') ? MAX_MB.image : f.type.startsWith('video/') ? MAX_MB.video : MAX_MB.otro;
  if (f.size > limite * 1024 * 1024) {
    error.value = `El archivo pesa ${pesoLegible(f.size)} y el máximo para este tipo es ${limite} MB`;
    return;
  }

  error.value = '';
  quitarArchivo();
  archivo.value = f;
  if (f.type.startsWith('image/')) vistaPrevia.value = URL.createObjectURL(f);
  textarea.value?.focus();
}

function quitarArchivo() {
  if (vistaPrevia.value) URL.revokeObjectURL(vistaPrevia.value);
  vistaPrevia.value = '';
  archivo.value = null;
}

async function enviarPlantillaClick() {
  if (!plantilla.nombre || enviando.value) return;

  enviando.value = true;
  error.value = '';
  try {
    const params = plantilla.parametros
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    await enviarPlantilla(props.idLead, plantilla.nombre, plantilla.idioma || 'es', params);
    mostrarPlantilla.value = false;
    await cargar();
    await irAbajo();
  } catch (e) {
    error.value = mensajeDeError(e);
  } finally {
    enviando.value = false;
  }
}

async function enviarSaludoClick() {
  if (enviando.value) return;

  enviando.value = true;
  error.value = '';
  try {
    await enviarSaludo(props.idLead);
    await cargar();
    await irAbajo();
  } catch (e) {
    error.value = mensajeDeError(e);
  } finally {
    enviando.value = false;
  }
}

// ───────────── ciclo de vida ─────────────

watch(
  () => props.idLead,
  async () => {
    mensajes.value = [];
    mostrarPlantilla.value = false;
    if (abierto.value) {
      cargando.value = true;
      await cargar(true);
    }
  },
);

if (props.abrirInicial) abrir();

onBeforeUnmount(() => {
  detenerPolling();
  document.removeEventListener('keydown', alPresionarTecla);
  document.removeEventListener('visibilitychange', alCambiarVisibilidad);
});
</script>

<style scoped>
/* ───── Botón flotante ───── */
.wsp-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 3000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: none;
  border-radius: 999px;
  background: #25d366;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s ease;
}
.wsp-fab:hover { transform: translateY(-2px); }

/* ───── Fondo y panel ───── */
.wsp-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2999;
  background: rgba(0, 0, 0, 0.5);
}

.wsp-panel {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  width: 380px;
  height: 560px;
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - 40px);
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  font-size: 14px;
}

.wsp-panel--expandido {
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;
  transform: translate(-50%, -50%);
  width: min(1100px, 94vw);
  height: 92vh;
  max-height: none;
}

/* ───── Cabecera ───── */
.wsp-head {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 12px 10px 16px;
  background: #075e54;
  color: #fff;
}
.wsp-head__info { flex: 1; min-width: 0; }
.wsp-head__titulo {
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wsp-head__sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
}
.wsp-dot { width: 8px; height: 8px; border-radius: 50%; }
.wsp-dot--on { background: #4ade80; }
.wsp-dot--off { background: #fbbf24; }

.wsp-iconbtn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #fff;
  cursor: pointer;
}
.wsp-iconbtn:hover { background: rgba(255, 255, 255, 0.18); }

/* ───── Mensajes ───── */
.wsp__mensajes {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  background: #efeae2;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wsp__estado {
  margin: auto;
  color: #6b7280;
  font-size: 13px;
}

.wsp__fecha {
  align-self: center;
  margin: 10px 0 6px;
}
.wsp__fecha span {
  background: #e1f2fb;
  color: #54656f;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 8px;
}

.wsp__fila { display: flex; }
.wsp__fila--out { justify-content: flex-end; }
.wsp__fila--in { justify-content: flex-start; }

.wsp__burbuja {
  max-width: 75%;
  padding: 6px 9px 4px;
  border-radius: 8px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12);
  word-break: break-word;
}
.wsp-panel--expandido .wsp__burbuja { max-width: 60%; }
.wsp__burbuja--out { background: #d9fdd3; border-top-right-radius: 2px; }
.wsp__burbuja--in { background: #fff; border-top-left-radius: 2px; }
.wsp__burbuja--error { background: #fde8e8; }

.wsp__texto {
  white-space: pre-wrap;
  color: #111b21;
  line-height: 1.35;
}

.wsp__meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 11px;
  color: #667781;
}

.wsp__tick { letter-spacing: -2px; }
.wsp__tick--leido { color: #53bdeb; }
.wsp__tick--fallido { color: #dc2626; letter-spacing: 0; }

.wsp__error-msg {
  margin-top: 2px;
  font-size: 11px;
  color: #b91c1c;
}

/* ───── Alertas ───── */
.wsp__alerta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  font-size: 13px;
}
.wsp__alerta--error { background: #fee2e2; color: #991b1b; }
.wsp__alerta--aviso { background: #fef3c7; color: #92400e; }

.wsp__alerta-acciones {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.wsp__btn--chico {
  padding: 6px 12px;
  font-size: 13px;
}

.wsp__link {
  background: none;
  border: none;
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;
}

/* ───── Plantilla ───── */
.wsp__plantilla {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}
.wsp__plantilla label {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: #4b5563;
}
.wsp__plantilla input {
  padding: 7px 9px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}
.wsp__plantilla-fila { display: flex; gap: 8px; }
.wsp__plantilla-fila label { flex: 1; }
.wsp__plantilla-idioma { max-width: 90px; }
.wsp__plantilla-acciones { display: flex; justify-content: flex-end; }

/* ───── Input ───── */
.wsp__input {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #e5e7eb;
  background: #f0f2f5;
}
.wsp__input textarea {
  flex: 1;
  resize: none;
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 18px;
  font: inherit;
  line-height: 1.3;
  max-height: 120px;
  outline: none;
}
.wsp__input textarea:focus { border-color: #25d366; }
.wsp__input textarea:disabled { background: #e5e7eb; cursor: not-allowed; }

.wsp__file { display: none; }

.wsp__clip {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #54656f;
  cursor: pointer;
}
.wsp__clip:hover:not(:disabled) { background: rgba(0, 0, 0, 0.07); }
.wsp__clip:disabled { opacity: 0.4; cursor: not-allowed; }

.wsp__adjunto {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}
.wsp__adjunto-img {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
}
.wsp__adjunto-icono { font-size: 30px; }
.wsp__adjunto-info { flex: 1; min-width: 0; }
.wsp__adjunto-nombre {
  font-size: 13px;
  font-weight: 600;
  color: #111b21;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wsp__adjunto-peso { font-size: 11px; color: #667781; }
.wsp-iconbtn--oscuro { color: #54656f; }
.wsp-iconbtn--oscuro:hover { background: rgba(0, 0, 0, 0.08); }

.wsp__btn {
  padding: 9px 16px;
  border: none;
  border-radius: 18px;
  background: #25d366;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.wsp__btn:disabled {
  background: #a7e8c3;
  cursor: not-allowed;
}
</style>