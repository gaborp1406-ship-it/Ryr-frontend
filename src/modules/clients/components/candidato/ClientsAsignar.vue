<template>
    <div class="p-6">

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">

            <!-- Encabezado -->
            <div class="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
                <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
                <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                    Información del Lead
                </h2>
            </div>

            <!-- Datos -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5 px-6 py-6">

                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Nombre</p>
                    <p class="text-sm font-semibold text-slate-800">
                        {{ lead?.nombres }}
                    </p>
                </div>

                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">DNI</p>
                    <p class="text-sm font-semibold text-slate-800">
                        {{ lead?.numero_documento }}
                    </p>
                </div>

                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">N.º Teléfono</p>
                    <p class="text-sm font-semibold text-slate-800">
                        {{ lead?.telefono }}
                    </p>
                </div>

                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Proyecto</p>
                    <p class="text-sm font-semibold text-slate-800">
                        {{ lead?.proyecto }}
                    </p>
                </div>

                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Fuente</p>
                    <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2d8c4a]/10 text-[#2d8c4a] text-xs font-semibold">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
                        {{ lead?.fuente }}
                    </span>
                </div>

                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Fecha de ingreso</p>
                    <p class="text-sm font-semibold text-slate-800">
                        {{ lead?.fecha_ingreso }}
                    </p>
                </div>

                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Hora de ingreso</p>
                    <p class="text-sm font-semibold text-slate-800">
                        {{ lead?.hora_ingreso }}
                    </p>
                </div>

            </div>

            <div v-if="lead && !lead.estado" class="border-t border-slate-100 px-6 py-4 flex justify-end">
                <button @click="contactarLead" :disabled="loadingContactar"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-[#2d8c4a] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors duration-200">

                    <svg v-if="!loadingContactar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        class="w-4 h-4">
                        <path
                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.902.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>

                    <svg v-else class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>

                    {{ loadingContactar ? "Cargando..." : "Contactar" }}
                </button>
            </div>

        </div>

    </div>
</template>
<script src="./ClientsAsignar.ts" lang="ts"></script>