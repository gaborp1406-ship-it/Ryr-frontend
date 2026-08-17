<template>
    <transition name="fade">
        <div v-if="visible" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
            @click.self="cerrarModalWhatsapp">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

                <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>

                        <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                            Evidencia de WhatsApp
                        </h3>
                    </div>

                    <button @click="cerrarModalWhatsapp" class="text-slate-400 hover:text-slate-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="px-6 py-6 space-y-4">

                    <label
                        class="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-10 cursor-pointer hover:border-[#2d8c4a] hover:bg-[#2d8c4a]/5 transition-colors">
                        <input type="file" accept="image/*" class="hidden" @change="onArchivoSeleccionado" />

                        <template v-if="!archivoPreview">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                class="w-8 h-8 text-slate-300">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <path d="M17 8l-5-5-5 5" />
                                <path d="M12 3v12" />
                            </svg>

                            <p class="text-sm text-slate-500 font-medium">
                                Haz clic para subir una imagen
                            </p>

                            <p class="text-xs text-slate-400">
                                PNG, JPG hasta 5MB
                            </p>
                        </template>

                        <img v-else :src="archivoPreview" class="max-h-48 rounded-lg object-contain" />
                    </label>

                    <div>
                        <label class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1 block">
                            Descripción (opcional)
                        </label>

                        <textarea v-model="descripcionWhatsapp" rows="3" placeholder="Agrega una descripcion breve..."
                            class="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/30 focus:border-[#2d8c4a] transition-colors"></textarea>
                    </div>

                </div>

                <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">

                    <p v-if="errorWhatsapp" class="text-xs text-rose-500 -mt-2">{{ errorWhatsapp }}</p>

                    <button @click="cerrarModalWhatsapp" :disabled="guardandoWhatsapp"
                        class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40">
                        Cancelar
                    </button>

                    <button @click="guardarEvidencia" :disabled="!archivoPreview || guardandoWhatsapp"
                        class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2d8c4a] hover:bg-[#256e3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2">
                        <svg v-if="guardandoWhatsapp" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        {{ guardandoWhatsapp ? "Guardando..." : "Guardar evidencia" }}
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