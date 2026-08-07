<template>
    <transition name="fade">
        <div v-if="visible" class="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4">
            <div class="bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-white">

                <div class="flex flex-col items-center gap-4 px-6 pt-12 pb-8">
                    <div class="relative flex items-center justify-center">
                        <span v-if="estadoLlamada === 'llamando'"
                            class="absolute w-24 h-24 rounded-full bg-[#2d8c4a]/30 animate-ping"></span>
                        <span
                            class="relative w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-semibold">
                            CL
                        </span>
                    </div>

                    <div class="text-center">
                        <p class="text-base font-semibold">Cliente</p>
                        <p class="text-sm text-slate-400 mt-1">
                            <span v-if="estadoLlamada === 'llamando'">Llamando...</span>
                            <span v-else-if="estadoLlamada === 'en-curso'">{{ tiempoTranscurridoFormateado }}</span>
                            <span v-else>Llamada finalizada</span>
                        </p>
                    </div>
                </div>

                <div class="px-6 pb-8">
                    <div v-if="estadoLlamada === 'en-curso'" class="flex items-center justify-center gap-4 mb-6">
                        <button @click="toggleMicrofono" :class="[
                            'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                            micSilenciado ? 'bg-white text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'
                        ]" title="Silenciar micrófono">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                class="w-5 h-5">
                                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                                <path d="M12 18v4" />
                                <path v-if="micSilenciado" d="M4 4l16 16" />
                            </svg>
                        </button>

                        <button @click="toggleAltavoz" :class="[
                            'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                            altavozSilenciado ? 'bg-white text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'
                        ]" title="Silenciar altavoz">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                class="w-5 h-5">
                                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                                <path v-if="!altavozSilenciado"
                                    d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                                <path v-else d="M22 4 2 20" />
                            </svg>
                        </button>
                    </div>

                    <button v-if="estadoLlamada !== 'finalizada'" @click="colgarLlamada"
                        class="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors">
                        <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 rotate-[135deg]">
                            <path
                                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.902.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Colgar
                    </button>

                    <p v-else class="text-center text-xs text-slate-400">Cerrando llamada...</p>
                </div>

            </div>
        </div>
    </transition>
</template>

<script src="./ModalLlamada.ts" lang="ts"></script>

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