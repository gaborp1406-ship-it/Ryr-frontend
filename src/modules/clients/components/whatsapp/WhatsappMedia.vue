<!-- src/modules/clients/components/whatsapp/WhatsappMedia.vue -->
<template>
  <div class="wm">
    <!-- Imagen -->
    <template v-if="categoria === 'image'">
      <img v-if="src" :src="src" class="wm__img" alt="Imagen" @click="abrirEnPestana" />
      <div v-else class="wm__ph">{{ cargando ? 'Cargando imagen…' : 'Imagen no disponible' }}</div>
    </template>

    <!-- Video -->
    <template v-else-if="categoria === 'video'">
      <video v-if="src" :src="src" class="wm__video" controls preload="metadata" />
      <button v-else class="wm__btn" :disabled="cargando" @click="cargar">
        ▶ {{ cargando ? 'Cargando video…' : 'Ver video' }}
      </button>
    </template>

    <!-- Audio -->
    <template v-else-if="categoria === 'audio'">
      <audio v-if="src" :src="src" controls />
      <button v-else class="wm__btn" :disabled="cargando" @click="cargar">
        ▶ {{ cargando ? 'Cargando audio…' : 'Escuchar audio' }}
      </button>
    </template>

    <!-- Documento (PDF, Word, Excel…) -->
    <button v-else class="wm__doc" :disabled="cargando" @click="descargar">
      <span class="wm__doc-icono">📄</span>
      <span class="wm__doc-nombre">{{ nombre || 'Documento' }}</span>
      <span class="wm__doc-accion">{{ cargando ? '…' : 'Abrir' }}</span>
    </button>

    <div v-if="error" class="wm__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { obtenerArchivoBlob } from './whatsapp.action';

const props = defineProps<{
  idMensaje: string | number;
  mime?: string | null;
  nombre?: string | null;
  url?: string | null;          // enlace público (video/imagen de plantilla)
  tieneArchivo?: boolean;       // archivo guardado en el servidor
}>();

const src = ref('');
const cargando = ref(false);
const error = ref('');
let urlBlob = '';

const categoria = computed(() => {
  const m = props.mime ?? '';
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  if (m.startsWith('audio/')) return 'audio';
  return 'document';
});

/** Devuelve una URL usable: el enlace público directo, o un blob descargado con tu sesión */
async function resolverUrl(): Promise<string> {
  if (!props.tieneArchivo && props.url) return props.url;
  if (src.value) return src.value;

  const blob = await obtenerArchivoBlob(props.idMensaje);
  urlBlob = URL.createObjectURL(blob);
  return urlBlob;
}

async function cargar() {
  if (cargando.value || src.value) return;
  cargando.value = true;
  error.value = '';
  try {
    src.value = await resolverUrl();
  } catch {
    error.value = 'No se pudo cargar el archivo';
  } finally {
    cargando.value = false;
  }
}

async function descargar() {
  if (cargando.value) return;
  cargando.value = true;
  error.value = '';
  try {
    // Enlace público: se abre en una pestaña nueva
    if (!props.tieneArchivo && props.url) {
      window.open(props.url, '_blank', 'noopener');
      return;
    }
    const url = await resolverUrl();
    src.value = url;
    const a = document.createElement('a');
    a.href = url;
    a.download = props.nombre || 'documento';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    error.value = 'No se pudo abrir el archivo';
  } finally {
    cargando.value = false;
  }
}

function abrirEnPestana() {
  if (src.value) window.open(src.value, '_blank', 'noopener');
}

onMounted(() => {
  // Las imágenes se cargan solas; videos, audios y documentos al pulsar
  if (categoria.value === 'image') cargar();
  else if ((categoria.value === 'video' || categoria.value === 'audio') && !props.tieneArchivo && props.url) {
    src.value = props.url; // enlace público: no hay descarga pesada
  }
});

onBeforeUnmount(() => {
  if (urlBlob) URL.revokeObjectURL(urlBlob);
});
</script>

<style scoped>
.wm { margin-bottom: 4px; }

.wm__img {
  display: block;
  max-width: 260px;
  max-height: 260px;
  border-radius: 6px;
  cursor: zoom-in;
  object-fit: cover;
}
.wm__video {
  display: block;
  max-width: 280px;
  max-height: 260px;
  border-radius: 6px;
  background: #000;
}
.wm__ph {
  width: 200px;
  height: 120px;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  font-size: 12px;
  color: #6b7280;
}

.wm__btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.08);
  color: #111b21;
  font-weight: 600;
  cursor: pointer;
}
.wm__btn:disabled { opacity: 0.6; cursor: wait; }

.wm__doc {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 200px;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.06);
  color: #111b21;
  text-align: left;
  cursor: pointer;
}
.wm__doc:disabled { opacity: 0.6; cursor: wait; }
.wm__doc-icono { font-size: 22px; }
.wm__doc-nombre {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wm__doc-accion { font-size: 12px; font-weight: 600; color: #0a7d5a; }

.wm__error { margin-top: 4px; font-size: 11px; color: #b91c1c; }
</style>