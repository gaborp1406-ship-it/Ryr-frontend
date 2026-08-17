<template>
  <div class="p-6 space-y-5">

    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">

      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
          <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Visita del Cliente
          </h2>
        </div>

      </div>

      <div v-if="cargando" class="px-6 py-8 text-sm text-slate-400">
        Cargando reunión...
      </div>
      <div v-else-if="error" class="px-6 py-8 text-sm text-rose-500">
        {{ error }}
      </div>

      <template v-else>
   <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 px-6 py-6">
          <div>
            <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Proyecto</p>
            <p class="text-sm font-semibold text-slate-800">{{ proyecto }}</p>
          </div>

          <div>
            <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Cliente</p>
            <p class="text-sm font-semibold text-slate-800">{{ actividadCliente }}</p>
          </div>

          <div>
            <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Actividad</p>
            <p class="text-sm font-semibold text-slate-800">{{ actividadTitulo }}</p>
          </div>

          <div>
            <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Estado</p>
            <p class="text-sm font-semibold text-slate-800">{{ actividadEstado }}</p>
          </div>

          <div>
            <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Fecha</p>
            <p class="text-sm font-semibold text-slate-800">{{ actividadFecha }}</p>
          </div>

          <div>
            <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Hora</p>
            <p class="text-sm font-semibold text-slate-800">{{ actividadHora }}</p>
          </div>

          <div v-if="actividadDescripcion" class="md:col-span-3">
            <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Descripción</p>
            <p class="text-sm font-semibold text-slate-800">{{ actividadDescripcion }}</p>
          </div>
        </div>

        <div class="border-t border-slate-100 px-6 py-4">
          <div class="flex flex-wrap items-center justify-end gap-2">

            <!-- WhatsApp -->
            <button @click="abrirModalWhatsapp"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all duration-200">
              <IconWhatsapp class="w-5 h-5" />
              <span>WhatsApp</span>
            </button>

            <button @click="abrirModalEmail"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all duration-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path d="M22 6 12 13 2 6" />
                <path d="M2 6h20v12H2z" />
              </svg>
              <span>Email</span>
            </button>


            <button @click="abrirModalLlamada"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all duration-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" class="w-4 h-4">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.08 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.61a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 5 5l1.47-1.19a2 2 0 0 1 2.11-.45c.83.31 1.71.53 2.61.65A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Llamada</span>
            </button>

            <div class="hidden sm:block w-px h-7 bg-slate-200 mx-1"></div>


            <button @click="reprogramar"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all duration-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
              <span>Reprogramar</span>
            </button>

          </div>
        </div>

      </template>
    </div>

    <!-- Historial de contacto: wsp / email / llamada -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div class="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
          Historial de contacto
        </h2>
      </div>

      <div v-if="historialContacto.length === 0" class="px-6 py-6 text-sm text-slate-400">
        Aún no hay contactos registrados.
      </div>

      <ul v-else class="divide-y divide-slate-100">
        <li v-for="(item, idx) in historialContacto" :key="idx" class="flex items-center justify-between px-6 py-3.5"
          :class="item.tipo === 'llamada' ? 'cursor-pointer hover:bg-slate-50' : ''">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="{
              'bg-emerald-50 text-emerald-600': item.tipo === 'whatsapp',
              'bg-indigo-50 text-indigo-600': item.tipo === 'email',
              'bg-amber-50 text-amber-600': item.tipo === 'llamada',
            }">
              <IconWhatsapp v-if="item.tipo === 'whatsapp'" class="w-4 h-4" />
              <svg v-else-if="item.tipo === 'email'" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" class="w-4 h-4">
                <path d="M22 6 12 13 2 6" />
                <path d="M2 6h20v12H2z" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.08 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.61a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 5 5l1.47-1.19a2 2 0 0 1 2.11-.45c.83.31 1.71.53 2.61.65A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ item.titulo }}</p>
              <p class="text-xs text-slate-400">{{ item.fecha }} · {{ item.hora }}</p>
            </div>
          </div>
          <span v-if="item.evidencia"
            class="text-[11px] font-semibold text-[#2d8c4a] bg-[#2d8c4a]/10 px-2 py-1 rounded-full">
            Con evidencia
          </span>
        </li>
      </ul>
    </div>

    <!-- Historial de reuniones (vacío por el momento) -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div class="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
        <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
        <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
          Historial de reuniones
        </h2>
      </div>

      <div v-if="historialReuniones.length === 0" class="px-6 py-6 text-sm text-slate-400">
        No hay reuniones registradas para este lead.
      </div>

      <ul v-else class="divide-y divide-slate-100">
        <li v-for="(r, idx) in historialReuniones" :key="idx" class="flex items-center justify-between px-6 py-3.5">
          <div>
            <p class="text-sm font-semibold text-slate-800">{{ r.tipo_actividad }}</p>
            <p class="text-xs text-slate-400">{{ r.fecha }} · {{ r.hora ?? '' }}</p>
          </div>
          <span class="text-[11px] font-medium text-slate-400">
            {{ r.estado ?? '' }}
          </span>
        </li>
      </ul>
    </div>

  </div>

  <transition name="fade">
    <div v-if="modalReprogramarAbierto" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
      @click.self="cerrarModalReprogramar">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">Reprogramar reunión</h3>
          </div>
          <button @click="cerrarModalReprogramar" :disabled="guardandoReprogramacion"
            class="text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="!guardandoReprogramacion" class="px-6 py-6">
          <p class="text-sm text-slate-400 mb-4">Selecciona la nueva fecha y hora para la reunión</p>
          <div class="flex flex-col gap-4">
            <div>
              <label class="block text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">Nueva
                fecha</label>
              <input v-model="nuevaFecha" type="date"
                class="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/30 focus:border-[#2d8c4a]" />
            </div>
            <div>
              <label class="block text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1.5">Nueva
                hora</label>
              <input v-model="nuevaHora" type="time"
                class="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/30 focus:border-[#2d8c4a]" />
            </div>
            <p v-if="errorReprogramar" class="text-xs font-medium text-rose-500">{{ errorReprogramar }}</p>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center gap-3 px-6 py-12">
          <svg class="w-8 h-8 animate-spin text-[#2d8c4a]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p class="text-sm font-medium text-slate-400 animate-pulse">Guardando nueva fecha y hora...</p>
        </div>

        <div v-if="!guardandoReprogramacion" class="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button @click="cerrarModalReprogramar"
            class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button @click="confirmarReprogramar" :disabled="!nuevaFecha || !nuevaHora"
            class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2d8c4a] hover:bg-[#256e3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Confirmar</button>
        </div>
      </div>
    </div>
  </transition>

  <ModalEvidenciaWs :visible="modalWhatsappAbierto" :id-estado-reunion="idEstadoReunion" @close="cerrarModalWhatsapp"
    @guardar="onGuardarWhatsapp" />

  <ModalEvidenciaGmail :visible="modalEmailAbierto" :id-estado-reunion="idEstadoReunion" @close="cerrarModalEmail"
    @guardar="onGuardarEmail" />
</template>

<script src="./ClientsAtencion.ts" lang="ts"></script>