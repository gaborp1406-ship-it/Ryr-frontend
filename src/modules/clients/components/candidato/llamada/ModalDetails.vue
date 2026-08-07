<template>
    <transition name="fade">
        <div v-if="visible" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
            @click.self="cerrar">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
                        <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                            Detalle de la llamada
                        </h3>
                    </div>
                    <button @click="cerrar" class="text-slate-400 hover:text-slate-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div v-if="detalle" class="grid grid-cols-2 gap-x-6 gap-y-5 px-6 py-6">
                    <div>
                        <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                            Inicio de llamada
                        </p>
                        <p class="text-sm font-semibold text-slate-800">
                            {{ detalle.fechaInicio }}
                        </p>
                        <p class="text-xs text-slate-500">
                            {{ detalle.horaInicio }}
                        </p>
                    </div>

                    <div>
                        <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                            Fin de llamada
                        </p>
                        <p class="text-sm font-semibold text-slate-800">
                            {{ detalle.fechaFin }}
                        </p>
                        <p class="text-xs text-slate-500">
                            {{ detalle.horaFin }}
                        </p>
                    </div>

                    <div class="col-span-2">
                        <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                            Duración
                        </p>
                        <p class="text-sm font-semibold text-slate-800">
                            {{ detalle.duracion }}
                        </p>
                    </div>
                </div>

                <div class="px-6 py-4 border-t border-slate-100 flex justify-end">
                    <button @click="cerrar"
                        class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
                        Cerrar
                    </button>
                </div>

            </div>
        </div>
    </transition>
</template>

<script src="./ModalDetails.ts" lang="ts"></script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>