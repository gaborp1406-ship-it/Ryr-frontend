<template>
    <transition name="fade">
        <div v-if="visible" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            @click.self="cerrarModalWhatsapp">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-full bg-[#2d8c4a]/10 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#2d8c4a" stroke-width="2" class="w-4 h-4">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                        </div>
                        <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                            Reunión por WhatsApp
                        </h3>
                    </div>

                    <button @click="cerrarModalWhatsapp" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="px-6 py-6 space-y-4">

                    <p class="text-sm text-slate-500">
                        Registra la fecha y hora en que se realizó la reunión por WhatsApp.
                    </p>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M16 2v4M8 2v4M3 10h18" />
                                </svg>
                                Fecha
                            </label>
                            <input v-model="fecha" type="date"
                                class="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/30 focus:border-[#2d8c4a] transition-colors" />
                        </div>

                        <div>
                            <label class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 7v5l3 3" />
                                </svg>
                                Hora
                            </label>
                            <input v-model="hora" type="time"
                                class="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/30 focus:border-[#2d8c4a] transition-colors" />
                        </div>
                    </div>

                    <p v-if="errorWhatsapp" class="text-xs text-rose-500">{{ errorWhatsapp }}</p>

                </div>

                <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">

                    <button @click="cerrarModalWhatsapp" :disabled="guardandoWhatsapp"
                        class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40">
                        Cancelar
                    </button>

                    <button @click="guardarEvidencia" :disabled="!fecha || !hora || guardandoWhatsapp"
                        class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2d8c4a] hover:bg-[#256e3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2">
                        <svg v-if="guardandoWhatsapp" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        {{ guardandoWhatsapp ? "Guardando..." : "Guardar" }}
                    </button>
                </div>

            </div>
        </div>
    </transition>
</template>

<script src="./ModalEvidenciaWs.ts" lang="ts"></script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>