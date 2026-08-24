<template>
    <transition name="fade">
        <div v-if="visible"
            class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            @click.self="onCerrar">
            <div
                class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <!-- Header -->
                <div
                    class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-orange-50">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                class="w-5 h-5 text-rose-600">
                                <path
                                    d="M12 9v6m4-10H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold text-slate-900">Registrar desistimiento</h3>
                            <p class="text-xs text-slate-500 mt-0.5">Selecciona el motivo</p>
                        </div>
                    </div>
                    <button @click="onCerrar" :disabled="guardando"
                        class="text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Contenido -->
                <div v-if="!guardando" class="px-6 py-6 space-y-4">
                    <!-- Loading opciones -->
                    <div v-if="cargandoOpciones" class="flex flex-col items-center justify-center gap-3 py-8">
                        <svg class="w-8 h-8 animate-spin text-rose-600" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p class="text-sm text-slate-500 font-medium">Cargando motivos...</p>
                    </div>

                    <!-- Lista de opciones -->
                    <div v-else-if="opciones.length > 0" class="space-y-2">
                        <div v-for="opcion in opciones" :key="opcion.id" class="relative">
                            <input :id="`opcion-${opcion.id}`" v-model.number="motivoSeleccionado" type="radio"
                                :value="opcion.id" class="sr-only" />
                            <label :for="`opcion-${opcion.id}`"
                                class="block p-3.5 rounded-lg border-2 cursor-pointer transition-all duration-200"
                                :class="motivoSeleccionado === opcion.id
                                        ? 'border-rose-500 bg-rose-50'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                    ">
                                <div class="flex items-center gap-3">
                                    <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                                        :class="motivoSeleccionado === opcion.id
                                                ? 'border-rose-500 bg-rose-500'
                                                : 'border-slate-300 bg-white'
                                            ">
                                        <svg v-if="motivoSeleccionado === opcion.id" viewBox="0 0 24 24" fill="none"
                                            stroke="white" stroke-width="3" class="w-3 h-3">
                                            <path d="M5 12l5 5 9-9" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold text-slate-800">{{ opcion.nombre }}</p>
                                        <p v-if="opcion.nombrelist" class="text-xs text-slate-500 mt-0.5">{{
                                            opcion.nombrelist }}</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Sin opciones -->
                    <div v-else class="flex flex-col items-center justify-center gap-2 py-8">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                            class="w-10 h-10 text-slate-300">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12h8M12 8v8" />
                        </svg>
                        <p class="text-sm text-slate-400">No hay motivos disponibles</p>
                    </div>

                    <!-- Error -->
                    <div v-if="error" class="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            class="w-5 h-5 text-rose-500 shrink-0 mt-0.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" />
                        </svg>
                        <p class="text-sm text-rose-600 font-medium">{{ error }}</p>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-else class="flex flex-col items-center justify-center gap-4 px-6 py-12">
                    <div class="relative w-12 h-12">
                        <svg class="w-12 h-12 animate-spin text-rose-600" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                    <p class="text-sm font-medium text-slate-500">Registrando desistimiento...</p>
                </div>

                <!-- Footer -->
                <div v-if="!guardando"
                    class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button @click="onCerrar"
                        class="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                        Cancelar
                    </button>
                    <button @click="onConfirmar" :disabled="!motivoSeleccionado || cargandoOpciones"
                        class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Confirmar desistimiento
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { IListarOpcionesResponse } from "@/modules/clients/interfaces/clientscontacto.interface";

interface Props {
    visible: boolean;
    cargandoOpciones?: boolean;
    opciones?: IListarOpcionesResponse[];
    motivoSeleccionado?: number | null;
    guardando?: boolean;
    error?: string | null;
}

interface Emits {
    (e: "close"): void;
    (e: "abrir"): void;
    (e: "confirmar", motivo: number): void;
}

const props = withDefaults(defineProps<Props>(), {
    cargandoOpciones: false,
    opciones: () => [],
    motivoSeleccionado: null,
    guardando: false,
    error: null,
});

const emit = defineEmits<Emits>();

const cargandoOpciones = ref(props.cargandoOpciones);
const opciones = ref(props.opciones);
const motivoSeleccionado = ref(props.motivoSeleccionado);
const guardando = ref(props.guardando);
const error = ref(props.error);

watch(() => props.visible, (val) => {
    if (val) {
        emit("abrir");
    } else {
        motivoSeleccionado.value = null;
        error.value = null;
    }
});

watch(() => props.cargandoOpciones, (val) => (cargandoOpciones.value = val));
watch(() => props.opciones, (val) => (opciones.value = val));
watch(() => props.motivoSeleccionado, (val) => (motivoSeleccionado.value = val));
watch(() => props.guardando, (val) => (guardando.value = val));
watch(() => props.error, (val) => (error.value = val));

function onCerrar() {
    if (guardando.value) return;
    emit("close");
}

function onConfirmar() {
    if (!motivoSeleccionado.value) return;
    emit("confirmar", motivoSeleccionado.value);
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