<!-- ClientsContactoHistorial.vue -->
<template>
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div class="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
            <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
            <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Historial de Estados
            </h2>
        </div>

        <div class="px-6 py-5">
            <!-- Loading -->
            <div v-if="cargando" class="space-y-3">
                <div v-for="n in 3" :key="n"
                    class="animate-pulse flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
                    <div class="w-8 h-8 rounded-full bg-slate-100 shrink-0"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-3 w-1/3 bg-slate-100 rounded"></div>
                        <div class="h-2 w-1/4 bg-slate-100 rounded"></div>
                    </div>
                </div>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="text-sm text-rose-500 px-1 py-2 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 shrink-0">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5M12 16h.01" />
                </svg>
                {{ error }}
            </div>

            <!-- Vacío -->
            <div v-else-if="historial.length === 0" class="text-sm text-slate-400 px-1 py-6 text-center">
                Aún no hay contactos registrados.
            </div>

            <!-- Lista -->
            <ul v-else class="space-y-3">
                <li v-for="(item, i) in historial" :key="i"
                    class="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:border-slate-200 transition-colors">
                    <div class="flex items-center gap-3 min-w-0">
                        <span :class="[
                            'w-8 h-8 flex items-center justify-center rounded-full shrink-0',
                            item.tipo === 'llamada' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'
                        ]">
                            <svg v-if="item.tipo === 'llamada'" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" class="w-4 h-4">
                                <path
                                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.902.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <IconWhatsapp v-else-if="item.tipo === 'whatsapp'" class="w-5 h-5" />
                            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                class="w-4 h-4">
                                <path d="M22 6 12 13 2 6" />
                                <path d="M2 6h20v12H2z" />
                            </svg>
                        </span>

                        <div class="min-w-0">
                            <p class="text-sm font-semibold text-slate-800">
                                {{ item.titulo }}
                            </p>
                            <p class="text-xs text-slate-400">
                                {{ item.fecha }} · {{ item.hora }}
                            </p>
                            <p v-if="item.descripcion" class="text-xs text-slate-500 mt-0.5 max-w-xs truncate">
                                {{ item.descripcion }}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 shrink-0">
                        <button v-if="item.evidencia" @click="abrirEvidencia(item)"
                            class="w-7 h-7 flex items-center justify-center rounded-lg text-[#2d8c4a] hover:bg-green-50 transition-colors"
                            title="Ver evidencia">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>

                        <button v-if="item.tipo === 'llamada' && item.llamada" @click="verDetalleLlamada(item)"
                            class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Ver detalle de la llamada">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                                <path
                                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.902.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                        </button>
                    </div>
                </li>
            </ul>

            <!-- Paginación -->
            <div v-if="!cargando && totalPaginas > 1" class="mt-4 flex items-center justify-center gap-6 select-none">
                <button type="button" @click="irPaginaAnterior" :disabled="paginaActual === 1"
                    class="flex items-center gap-1.5 text-[13px] font-medium transition-colors"
                    :class="paginaActual === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-600'">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior
                </button>

                <div class="rlv-mono flex items-center gap-3 text-[13px]">
                    <template v-for="(pagina, idx) in paginasVisibles" :key="idx">
                        <span v-if="pagina === '...'" class="text-slate-300">…</span>

                        <button v-else type="button" @click="irAPagina(pagina)" class="transition-colors" :class="pagina === paginaActual
                            ? 'font-semibold text-slate-900'
                            : 'text-[#2d8c4a] hover:text-[#1e6236]'">
                            {{ pagina }}
                        </button>
                    </template>
                </div>

                <button type="button" @click="irPaginaSiguiente" :disabled="paginaActual === totalPaginas"
                    class="flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
                    :class="paginaActual === totalPaginas ? 'text-slate-300 cursor-not-allowed' : 'text-[#2d8c4a] hover:text-[#1e6236]'">
                    Siguiente
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Modal previsualización evidencia -->
        <transition>
            <div v-if="modalEvidenciaVisible"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                @click.self="cerrarEvidencia">
                <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h3 class="text-sm font-semibold text-slate-900">Evidencia</h3>
                        <button @click="cerrarEvidencia"
                            class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="flex-1 overflow-auto px-5 py-5 flex items-center justify-center bg-slate-50">
                        <img v-if="tipoEvidenciaActual === 'imagen'" :src="evidenciaUrlActual" alt="Evidencia"
                            class="max-w-full max-h-[65vh] object-contain rounded-lg" />

                        <iframe v-else-if="tipoEvidenciaActual === 'pdf'" :src="evidenciaUrlActual"
                            class="w-full h-[65vh] rounded-lg border border-slate-200" />

                        <audio v-else-if="tipoEvidenciaActual === 'audio'" :src="evidenciaUrlActual" controls
                            class="w-full" />

                        <video v-else-if="tipoEvidenciaActual === 'video'" :src="evidenciaUrlActual" controls
                            class="max-w-full max-h-[65vh] rounded-lg" />

                        <div v-else class="text-sm text-slate-400 py-10 text-center">
                            No se puede previsualizar este archivo.
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
                        <button @click="cerrarEvidencia" class="px-4 py-2 rounded bg-gray-200 text-sm">
                            Cerrar
                        </button>
                        <a :href="evidenciaUrlActual" download target="_blank" rel="noopener"
                            class="px-4 py-2 rounded bg-[#2d8c4a] text-white text-sm flex items-center gap-1.5">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                class="w-3.5 h-3.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <path d="M7 10l5 5 5-5" />
                                <path d="M12 15V3" />
                            </svg>
                            Descargar
                        </a>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script src="./ClientsContactoHistorial.ts" lang="ts"></script>