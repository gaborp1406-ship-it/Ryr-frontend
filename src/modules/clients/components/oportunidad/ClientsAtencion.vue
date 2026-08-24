<template>
  <div class="p-6 space-y-5">
    <!-- Bloque Principal: Visita del Cliente -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
          <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Visita del Cliente
          </h2>
        </div>
      </div>

      <!-- Contenido -->
      <div v-if="cargando" class="px-6 py-8 text-sm text-slate-400">
        Cargando reunión...
      </div>

      <div v-else-if="error" class="px-6 py-8">
        <div class="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            class="w-5 h-5 text-rose-500 shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <div>
            <p class="text-sm text-rose-600 font-semibold">Error al cargar</p>
            <p class="text-sm text-rose-500 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <template v-else>
        <!-- Datos de la reunión -->
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

        <!-- Acciones -->
        <div class="border-t border-slate-100 px-6 py-4">
          <div class="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3">
            <!-- Botones de Contacto -->
            <div class="flex flex-wrap items-center gap-2">
              <button @click="abrirModalWhatsapp"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 text-sm font-semibold transition-all duration-200">
                <IconWhatsapp class="w-4 h-4" />
                <span class="hidden sm:inline">WhatsApp</span>
              </button>

              <button @click="abrirModalEmail"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 text-sm font-semibold transition-all duration-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <path d="M22 6 12 13 2 6" />
                  <path d="M2 6h20v12H2z" />
                </svg>
                <span class="hidden sm:inline">Email</span>
              </button>

              <button @click="abrirModalLlamada"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700 text-sm font-semibold transition-all duration-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.08 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.61a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 5 5l1.47-1.19a2 2 0 0 1 2.11-.45c.83.31 1.71.53 2.61.65A2 2 0 0 1 22 16.92z" />
                </svg>
                <span class="hidden sm:inline">Llamada</span>
              </button>

              <div class="hidden sm:block w-px h-6 bg-slate-200"></div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex flex-wrap items-center gap-2">
              <button @click="abrirReprogramar"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 text-sm font-semibold transition-all duration-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                  <path d="M21 3v6h-6" />
                </svg>
                <span class="hidden sm:inline">Reprogramar</span>
              </button>

              <button @click="desistimiento.abrir()"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 text-sm font-semibold transition-all duration-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <path d="M12 9v6m4-10H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                </svg>
                <span class="hidden sm:inline">Desistir</span>
              </button>

              <button @click="pasarANegociacion" :disabled="pasandoNegociacion"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2d8c4a] hover:bg-[#256e3c] text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                <svg v-if="!pasandoNegociacion" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  class="w-4 h-4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                <svg v-else class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span class="hidden sm:inline">{{ pasandoNegociacion ? "Pasando..." : "Negociación" }}</span>
              </button>
            </div>
          </div>

          <div v-if="errorPasarNegociacion" class="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200">
            <p class="text-sm text-rose-600 font-medium">{{ errorPasarNegociacion }}</p>
          </div>
        </div>
      </template>
    </div>

    <!-- Historial de Contacto -->
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

    <!-- Historial de Reuniones -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
          <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Historial de reuniones
          </h2>
        </div>
        <span v-if="historialReuniones.length" class="text-[11px] font-medium text-slate-400">
          {{ historialReuniones.length }} {{ historialReuniones.length === 1 ? "registro" : "registros" }}
        </span>
      </div>

      <div v-if="historialReuniones.length === 0"
        class="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-10 h-10 text-slate-300">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <p class="text-sm text-slate-400">No hay reuniones registradas para este lead.</p>
      </div>

      <template v-else>
        <ul class="divide-y divide-slate-100">
          <li v-for="(r, idx) in reunionesPaginadas" :key="idx"
            class="flex items-start sm:items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
            <div class="flex items-start sm:items-center gap-3 min-w-0">
              <span
                class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[#2d8c4a]/10 text-[#2d8c4a]">
                <svg v-if="(r.tipo_actividad || '').toLowerCase().includes('llamada')" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 4.18 2 2 0 0 1 5.08 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.61a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 5 5l1.47-1.19a2 2 0 0 1 2.11-.45c.83.31 1.71.53 2.61.65A2 2 0 0 1 22 16.92z" />
                </svg>
                <svg v-else-if="(r.tipo_actividad || '').toLowerCase().includes('video')" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <path d="m22 8-6 4 6 4V8Z" />
                  <rect x="2" y="6" width="14" height="12" rx="2" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-800 truncate">{{ r.tipo_actividad }}</p>
                <p class="text-xs text-slate-500 truncate">{{ r.titulo }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ r.fecha }} · {{ r.hora }}</p>
              </div>
            </div>
            <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0"
              :class="claseEstado(r.estado)">
              {{ r.estado }}
            </span>
          </li>
        </ul>

        <!-- Paginación -->
        <div v-if="totalPaginasReuniones > 1"
          class="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/40">
          <p class="text-xs text-slate-400 order-2 sm:order-1">
            Página {{ paginaActualReuniones }} de {{ totalPaginasReuniones }}
          </p>
          <div class="flex items-center gap-1 order-1 sm:order-2">
            <button @click="irPaginaAnterior" :disabled="paginaActualReuniones === 1"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button v-for="p in paginasVisiblesReuniones" :key="p" @click="irAPagina(p)"
              class="min-w-[2rem] h-8 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors"
              :class="p === paginaActualReuniones ? 'bg-[#2d8c4a] text-white' : 'text-slate-500 hover:bg-white border border-slate-200'">
              {{ p }}
            </button>

            <button @click="irPaginaSiguiente" :disabled="paginaActualReuniones === totalPaginasReuniones"
              class="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- Modales -->
  <ModalReprogramar :visible="reprogramacion.modalAbierto.value" :guardando="reprogramacion.guardando.value"
    :error="reprogramacion.error.value" :nueva-fecha="reprogramacion.nuevaFecha.value"
    :nueva-hora="reprogramacion.nuevaHora.value" @close="reprogramacion.cerrar()"
    @confirmar="onConfirmarReprogramacion" />

  <ModalDesistir :visible="desistimiento.modalAbierto.value" :cargando-opciones="desistimiento.cargandoOpciones.value"
    :opciones="desistimiento.opciones.value" :motivo-seleccionado="desistimiento.motivoSeleccionado.value"
    :guardando="desistimiento.guardando.value" :error="desistimiento.error.value" @close="desistimiento.cerrar()"
    @abrir="desistimiento.abrir()" @confirmar="onConfirmarDesistimiento" />

  <ModalEvidenciaWs :visible="modalWhatsappAbierto" :id-estado-reunion="idEstadoReunion" @close="cerrarModalWhatsapp"
    @guardar="onGuardarWhatsapp" />

  <ModalEvidenciaGmail :visible="modalEmailAbierto" :id-estado-reunion="idEstadoReunion" @close="cerrarModalEmail"
    @guardar="onGuardarEmail" />
</template>

<script src="./ClientsAtencion.ts" lang="ts"></script>