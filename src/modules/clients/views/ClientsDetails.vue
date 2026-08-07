<!-- ClientsDetails.vue -->
<template>
    <div class="min-h-screen bg-slate-50 pl-2 pr-6 py-6">
        <div class="max-w-5l mx-auto">
            <!-- Menú principal -->
            <div class="inline-flex p-1 bg-white border border-slate-200 rounded-2xl mb-5 gap-1 shadow-sm">
                <button v-for="menu in menus" :key="menu" @click="cambiarMenu(menu)" :class="[
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                    menuActivo === menu
                        ? 'bg-[#2d8c4a] text-white shadow-md shadow-[#2d8c4a]/30'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                ]">
                    <component :is="iconos[menu]" class="w-4 h-4" />
                    {{ menu }}
                </button>
            </div>

            <!-- Card contenedora -->
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                <div class="flex gap-1 px-4 pt-3 border-b border-slate-100 overflow-x-auto">
                    <button v-for="item in submenus[menuActivo]" :key="item" @click="submenuActivo = item"
                        class="relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200"
                        :class="[
                            item === submenuActivo
                                ? 'text-[#2d8c4a]'
                                : obtenerIdEtapa(item) < etapaActual
                                    ? 'text-green-600'
                                    : 'text-slate-400'
                        ]">
                        <svg v-if="obtenerIdEtapa(item) < etapaActual" xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                            class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>

                        {{ item }}

                        <span v-if="item === submenuActivo"
                            class="absolute left-3 right-3 -bottom-px h-0.5 bg-[#2d8c4a] rounded-full" />
                    </button>
                </div>

                <!-- Contenido: alineado arriba-izquierda, no centrado -->
                <transition name="fade" mode="out-in">
                    <div :key="menuActivo + submenuActivo">

                        <ClientsAsignar v-if="menuActivo === 'Candidato' && submenuActivo === 'Asignación'"
                            :id-lead="idLead" @etapa-finalizada="cargarEtapaActual" />
                        <ClientsContacto v-else-if="menuActivo === 'Candidato' && submenuActivo === 'Contacto'"
                            :id-lead="idLead" @etapa-finalizada="cargarEtapaActual" />
                        <ClientsDesistio v-else-if="menuActivo === 'Candidato' && submenuActivo === 'Desistió'"
                            :id-lead="idLead" />
                        <ClientsReunion v-else-if="menuActivo === 'Candidato' && submenuActivo === 'Agendar reunión'" />
                        <ClientsAtencion v-else-if="menuActivo === 'Oportunidad' && submenuActivo === 'Atención'" />
                        <ClientsNegociacion
                            v-else-if="menuActivo === 'Oportunidad' && submenuActivo === 'Negociación'" />
                        <ClientsCierre v-else-if="menuActivo === 'Oportunidad' && submenuActivo === 'Cierre'" />
                        <ClientsDesistioO v-else-if="menuActivo === 'Desistió' && submenuActivo === 'Desistió'" />

                    </div>
                </transition>
            </div>

        </div>
    </div>
</template>

<script src="./ClientsDetails.ts" lang="ts"></script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(4px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>