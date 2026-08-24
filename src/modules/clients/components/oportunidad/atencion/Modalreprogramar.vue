<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      @click.self="onCerrar"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-5 h-5 text-blue-600"
              >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-slate-900">Reprogramar reunión</h3>
              <p class="text-xs text-slate-500 mt-0.5">Elige nueva fecha y hora</p>
            </div>
          </div>
          <button
            @click="onCerrar"
            :disabled="guardando"
            class="text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Contenido -->
        <div v-if="!guardando" class="px-6 py-6 space-y-5">
          <!-- Fecha -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Nueva fecha
            </label>
            <input
              v-model="nuevaFecha"
              type="date"
              class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              :min="minDate"
            />
          </div>

          <!-- Hora -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Nueva hora
            </label>
            <input
              v-model="nuevaHora"
              type="time"
              class="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <!-- Error -->
          <div
            v-if="error"
            class="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-rose-500 shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <p class="text-sm text-rose-600 font-medium">{{ error }}</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else class="flex flex-col items-center justify-center gap-4 px-6 py-12">
          <div class="relative w-12 h-12">
            <svg
              class="w-12 h-12 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <p class="text-sm font-medium text-slate-500">Guardando cambios...</p>
        </div>

        <!-- Footer -->
        <div v-if="!guardando" class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            @click="onCerrar"
            class="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="onConfirmar"
            :disabled="!nuevaFecha || !nuevaHora"
            class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface Props {
  visible: boolean;
  guardando?: boolean;
  error?: string | null;
  nuevaFecha?: string;
  nuevaHora?: string;
}

interface Emits {
  (e: "close"): void;
  (e: "confirmar", fecha: string, hora: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  guardando: false,
  error: null,
  nuevaFecha: "",
  nuevaHora: "",
});

const emit = defineEmits<Emits>();

// FIX: antes eran `computed` con un `set` vacío ("el padre controla el valor"),
// por eso el v-model de los inputs nunca guardaba lo que el usuario escribía.
// Ahora son refs locales de verdad, así el input y el botón "Confirmar" reaccionan bien.
const nuevaFecha = ref(props.nuevaFecha);
const nuevaHora = ref(props.nuevaHora);

const guardando = ref(props.guardando);
const error = ref(props.error);

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

watch(() => props.visible, (val) => {
  if (!val) {
    nuevaFecha.value = "";
    nuevaHora.value = "";
    error.value = null;
  }
});

watch(() => props.nuevaFecha, (val) => (nuevaFecha.value = val));
watch(() => props.nuevaHora, (val) => (nuevaHora.value = val));
watch(() => props.guardando, (val) => (guardando.value = val));
watch(() => props.error, (val) => (error.value = val));

function onCerrar() {
  if (guardando.value) return;
  emit("close");
}

function onConfirmar() {
  if (!nuevaFecha.value || !nuevaHora.value) return;
  emit("confirmar", nuevaFecha.value, nuevaHora.value);
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-in {
  animation: fadeIn 0.2s ease-out;
}

.fade-in {
  animation: fadeIn 0.2s ease-out;
}

.zoom-in-95 {
  animation: zoomIn 0.2s ease-out;
}
</style>