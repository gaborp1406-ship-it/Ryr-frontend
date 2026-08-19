<template>
    <div class="p-6 space-y-5">
        <!-- Card: Datos de contacto -->
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div class="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
                <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
                <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                    Primer Contacto
                </h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 px-6 py-6">
                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                        Fecha de primer contacto
                    </p>
                    <p class="text-sm font-semibold text-slate-800">{{ contacto.fecha }}</p>
                </div>
                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                        Hora de primer contacto
                    </p>
                    <p class="text-sm font-semibold text-slate-800">{{ contacto.hora }}</p>
                </div>
            </div>
        </div>

        <!-- Card: Historial de estados (posee toda la lógica de fetch de historial) -->
        <ClientsContactoHistorial v-if="idEstadoContacto" ref="historialRef" :id-lead="idLead"
            :id-estado-contacto="idEstadoContacto" />
        <!-- Card: Acciones -->
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <!-- Animación de carga mientras se determina el estado de contacto (responsable de ocultar botones) -->
            <div v-if="cargando" class="px-6 py-8 flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span class="text-sm text-slate-400 font-medium">Cargando acciones...</span>
            </div>

            <div v-else class="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex flex-wrap gap-2">
                    <button @click="abrirModalWhatsapp"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold transition-colors duration-200">
                        <IconWhatsapp class="w-6 h-6" /> WhatsApp
                    </button>
                    <button @click="abrirModalEmail"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold transition-colors duration-200">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                            <path d="M22 6 12 13 2 6" />
                            <path d="M2 6h20v12H2z" />
                        </svg>
                        Email
                    </button>
                    <button @click="abrirModalLlamada"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold transition-colors duration-200">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                            <path
                                d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.08 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.61a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 5 5l1.47-1.19a2 2 0 0 1 2.11-.45c.83.31 1.71.53 2.61.65A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Llamada
                    </button>
                </div>
                <div class="flex flex-wrap gap-2 sm:justify-end">

                    <!-- Solo aparece si estado es FALSE -->
                    <button v-if="!estadoContacto" @click="abrirModalDesistio"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-semibold transition-colors duration-200">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M9 9l6 6M15 9l-6 6" />
                        </svg>

                        No contestó
                    </button>


                    <!-- Solo aparece si estado es FALSE -->
                    <button v-if="!estadoContacto" @click="agendarReunion"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors duration-200">

                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>

                        Agendar reunión

                    </button>

                </div>
            </div>
        </div>

        <!-- Modales -->
        <ModalEvidenciaWs v-if="idEstadoContacto" :visible="modalWhatsappAbierto" :id-estado-contacto="idEstadoContacto"
            @close="cerrarModalWhatsapp" @guardar="onGuardarWhatsapp" />
        <ModalEvidenciaGmail v-if="idEstadoContacto" :visible="modalEmailAbierto" :id-estado-contacto="idEstadoContacto"
            @close="cerrarModalEmail" @guardar="onGuardarEmail" />
        <ModalLlamada v-if="modalLlamadaAbierto" :visible="modalLlamadaAbierto" :numero-destino="numeroDestino"
            :estado-llamada="estadoLlamada" :duracion-segundos="duracionSegundos" :llamada-activa="llamadaActiva"
            @close="cerrarModalLlamada" @hangup="cerrarModalLlamada" />
        <ModalMotivoDesistio :visible="modalDesistioAbierto" @close="cerrarModalDesistio"
            @confirmar="onConfirmarDesistio" />
        <ModalAgendarReu :visible="modalAgendarReunionAbierto" :id-lead="idLead" @close="cerrarModalAgendarReunion"
            @reunion-agendada="onReunionAgendada" />
    </div>
</template>

<script src="./ClientsContacto.ts" lang="ts"></script>

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