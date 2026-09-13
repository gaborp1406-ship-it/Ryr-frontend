<template>
    <Transition name="fade">
        <div
            v-if="visible"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
            @click.self="cerrar"
        >
            <div
                class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            >
                <!-- Header -->
                <div
                    class="flex items-center gap-2 px-6 py-5 border-b border-slate-100"
                >
                    <span
                        class="w-1.5 h-1.5 rounded-full bg-rose-500"
                    ></span>

                    <h2
                        class="text-sm font-semibold text-slate-900 uppercase tracking-wide"
                    >
                        Motivo de desistimiento
                    </h2>
                </div>

                <!-- Body -->
                <div class="px-6 py-5 max-h-[500px] overflow-y-auto">

                    <!-- Loading -->
                    <div
                        v-if="cargando"
                        class="flex flex-col gap-2"
                    >
                        <div
                            v-for="n in 4"
                            :key="n"
                            class="h-11 rounded-lg bg-slate-100 animate-pulse"
                        ></div>
                    </div>

                    <!-- Error -->
                    <div
                        v-else-if="error"
                        class="mb-4 text-sm text-rose-600 bg-rose-50 rounded-lg px-4 py-3"
                    >
                        {{ error }}
                    </div>

                    <!-- Vacío -->
                    <div
                        v-else-if="opciones.length === 0"
                        class="text-sm text-slate-400 text-center py-6"
                    >
                        No hay motivos disponibles.
                    </div>

                    <!-- Opciones -->
                    <div
                        v-else
                        class="flex flex-col gap-2"
                    >
                        <button
                            v-for="opcion in opciones"
                            :key="opcion.id"
                            type="button"
                            @click="seleccionar(opcion.id)"
                            class="w-full flex items-center justify-between gap-3 text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors duration-150"
                            :class="
                                idSeleccionado === opcion.id
                                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                            "
                        >
                            <span>{{ opcion.nombre }}</span>

                            <span
                                class="w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center"
                                :class="
                                    idSeleccionado === opcion.id
                                        ? 'border-rose-500 bg-rose-500'
                                        : 'border-slate-300'
                                "
                            >
                                <svg
                                    v-if="idSeleccionado === opcion.id"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    stroke-width="3"
                                    class="w-2.5 h-2.5"
                                >
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </span>
                        </button>

                        <!-- Motivo Otro -->
                        <div
                            v-if="esMotivoOtro"
                            class="mt-3"
                        >
                            <label
                                class="block text-sm font-semibold text-slate-700 mb-2"
                            >
                                Especifica el motivo
                                <span class="text-rose-500">*</span>
                            </label>

                            <textarea
                                v-model="motivoOtro"
                                rows="4"
                                maxlength="500"
                                placeholder="Ingresa el motivo del desistimiento..."
                                class="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                            ></textarea>

                            <div
                                class="flex justify-end mt-1 text-xs text-slate-400"
                            >
                                {{ motivoOtro.length }}/500
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div
                    class="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50"
                >
                    <button
                        type="button"
                        @click="cerrar"
                        :disabled="procesando"
                        class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors duration-150"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        @click="confirmar"
                        :disabled="
                            !idSeleccionado ||
                            procesando ||
                            (esMotivoOtro && !motivoOtro.trim())
                        "
                        class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2"
                    >
                        <svg
                            v-if="procesando"
                            class="animate-spin w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                                class="opacity-25"
                            />

                            <path
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                            />
                        </svg>

                        {{ procesando ? "Guardando..." : "Confirmar" }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script src="./ModalMotivoDesistio.ts" lang="ts"></script>

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