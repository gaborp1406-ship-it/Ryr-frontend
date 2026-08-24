<!-- ClientsDetails.vue -->
<template>
    <div class="min-h-screen bg-white from-slate-50 to-slate-100 pl-2 pr-6 py-6">
        <div class="max-w-6xl mx-auto">
            <!-- Header con título -->


            <!-- Menú principal -->
            <div class="inline-flex p-1.5 bg-white border border-slate-200 rounded-2xl mb-6 gap-1 shadow-sm">
                <button v-for="menu in menus" :key="menu" @click="cambiarMenu(menu)" :disabled="cargandoEtapa" :class="[
                    'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
                    cargandoEtapa ? 'opacity-60 cursor-not-allowed' : '',
                    menuActivo === menu
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                ]">
                    <component :is="iconos[menu]" class="w-4 h-4" />
                    {{ menu }}
                </button>
            </div>

            <!-- Card contenedora principal -->
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                <!-- Estado de carga -->
                <div v-if="cargandoEtapa" class="flex flex-col items-center justify-center gap-4 py-20 px-4">
                    <div class="relative w-12 h-12">
                        <svg class="absolute inset-0 w-12 h-12 animate-spin text-emerald-500"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                    <p class="text-sm font-medium text-slate-600">
                        Cargando información del lead...
                    </p>
                </div>

                <template v-else>
                    <!-- Tabs de submenús -->
                    <div class="flex gap-0.5 px-4 pt-4 pb-0 border-b border-slate-100 overflow-x-auto">
                        <button v-for="item in obtenerSubmenusVisibles(menuActivo)" :key="item"
                            @click="irASubmenu(item)" :disabled="!esEtapaAccesible(item)" :class="[
                                'relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200',
                                !esEtapaAccesible(item) ? 'cursor-not-allowed opacity-50 hover:opacity-50' : 'hover:bg-slate-50',
                                item === submenuActivo
                                    ? 'text-emerald-600'
                                    : fueEtapaRealizada(obtenerIdEtapa(item))
                                        ? 'text-slate-600'
                                        : 'text-slate-500'
                            ]">

                            <!-- Icono: Check, X, o punto -->
                            <div class="flex-shrink-0">
                                <!-- Check para etapas realizadas -->
                                <svg v-if="fueEtapaRealizada(obtenerIdEtapa(item))" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                                    class="w-4 h-4 text-emerald-500">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                </svg>

                                <!-- X para etapas no realizadas pero pasadas -->
                                <svg v-else-if="obtenerIdEtapa(item) < etapaActual" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                                    class="w-4 h-4 text-amber-500">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>

                                <!-- Punto para etapa actual -->
                                <div v-else class="w-2 h-2 rounded-full bg-emerald-500"></div>
                            </div>

                            {{ item }}

                            <!-- Underline para tab activo -->
                            <span v-if="item === submenuActivo"
                                class="absolute left-4 right-4 -bottom-px h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" />
                        </button>
                    </div>

                    <!-- Contenido dinámico -->
                    <transition name="fade" mode="out-in">
                        <div :key="menuActivo + submenuActivo" class="min-h-96">

                            <ClientsAsignar v-if="menuActivo === 'Candidato' && submenuActivo === 'Asignación'"
                                :id-lead="idLead" @etapa-finalizada="cargarEtapaActual" />

                            <ClientsContacto v-else-if="menuActivo === 'Candidato' && submenuActivo === 'Contacto'"
                                :id-lead="idLead" @etapa-finalizada="cargarEtapaActual" />

                            <ClientsDesistio v-else-if="menuActivo === 'Candidato' && submenuActivo === 'Desistió'"
                                :id-lead="idLead" @etapa-finalizada="cargarEtapaActual" />

                            <ClientsReunion
                                v-else-if="menuActivo === 'Candidato' && submenuActivo === 'Agendar reunión'"
                                :id-lead="idLead" @etapa-finalizada="cargarEtapaActual" />

                            <ClientsAtencion v-else-if="menuActivo === 'Oportunidad' && submenuActivo === 'Atención'"
                                :id-lead="idLead" @etapa-finalizada="cargarEtapaActual" />

                            <ClientsNegociacion
                                v-else-if="menuActivo === 'Oportunidad' && submenuActivo === 'Negociación'"
                                :id-lead="idLead" @etapa-finalizada="cargarEtapaActual" />

                            <ClientsCierre v-else-if="menuActivo === 'Oportunidad' && submenuActivo === 'Cierre'"
                                :id-lead="idLead" @etapa-finalizada="cargarEtapaActual" />

                            <ClientsDesistioO v-else-if="menuActivo === 'Oportunidad' && submenuActivo === 'Desistió-O'"
                                :id-lead="idLead" @etapa-finalizada="cargarEtapaActual" />

                        </div>
                    </transition>
                </template>
            </div>



        </div>
    </div>
</template>

<script src="./ClientsDetails.ts" lang="ts"></script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(6px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

/* Smooth scroll para tabs */
::-webkit-scrollbar {
    height: 4px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>