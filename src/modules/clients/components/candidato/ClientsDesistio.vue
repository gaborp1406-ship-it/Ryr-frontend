<template>
    <div class="p-6 flex items-center justify-center min-h-[70vh]">
        <div
            class="bg-white border border-slate-200/80 rounded-2xl shadow-md shadow-slate-200/50 w-full max-w-lg overflow-hidden">

            <!-- Header -->
            <div
                class="flex flex-col items-center text-center px-8 pt-10 pb-8 bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100">

                <div class="relative w-16 h-16 mb-5">
                    <span class="absolute inset-0 rounded-full bg-rose-100/70"></span>
                    <span class="absolute inset-0 rounded-full bg-rose-50 scale-90"></span>
                    <svg viewBox="0 0 24 24" fill="none" class="relative w-16 h-16 p-4 text-rose-500">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
                        <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    </svg>
                </div>

                <h2 class="text-lg font-semibold text-slate-900 tracking-tight">
                    Lead desistió
                </h2>

                <p class="text-sm text-slate-500 mt-1.5">
                    Motivos registrados del desistimiento
                </p>
            </div>

            <!-- Contenido -->
            <div class="px-6 py-6">

                <!-- Cargando -->
                <div v-if="cargando" class="flex flex-col items-center justify-center py-10 gap-3">
                    <svg class="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <p class="text-sm text-slate-400">Cargando información...</p>
                </div>

                <!-- Desistimientos -->
                <div v-else-if="desistio.length > 0" class="space-y-3">
                    <div v-for="(item, index) in desistio" :key="`${item.id_lead_etapa}-${index}`"
                        class="group relative rounded-xl border border-slate-200 bg-slate-50/60 px-5 py-4 transition-colors hover:border-rose-200 hover:bg-rose-50/40">
                        <span class="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-rose-300"></span>

                        <div class="flex items-center justify-between pl-3">
                            <p class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                                Motivo {{ index + 1 }}
                            </p>
                            <span class="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                Etapa {{ item.id_lead_etapa }}
                            </span>
                        </div>

                        <p class="mt-1.5 pl-3 text-[15px] font-medium text-slate-800 leading-snug">
                            {{ item.motivo_nombre }}
                        </p>
                    </div>
                </div>

                <!-- Sin información -->
                <div v-else class="flex flex-col items-center justify-center py-10 gap-2 text-center">
                    <svg viewBox="0 0 24 24" fill="none" class="w-8 h-8 text-slate-300">
                        <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor"
                            stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                    <p class="text-sm text-slate-400">No existe información de desistimiento.</p>
                </div>

            </div>
        </div>
    </div>
</template>

<script src="./ClientsDesistio.ts" lang="ts"></script>