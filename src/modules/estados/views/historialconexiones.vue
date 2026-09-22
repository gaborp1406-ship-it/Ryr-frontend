<template>
  <div class="p-4 sm:p-6 max-w-[1280px] mx-auto">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          class="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full border text-[0.82rem] font-semibold cursor-pointer transition-all duration-200"
          :class="filtroEstado === null
            ? 'bg-slate-900 border-slate-900 text-white'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'"
          @click="filtroEstado = null">
          Todos
          <span class="px-[7px] py-px rounded-full text-[0.75rem]"
            :class="filtroEstado === null ? 'bg-white/[0.18]' : 'bg-black/[0.06]'">{{ asesores.length }}</span>
        </button>

        <button v-for="e in estados" :key="e.id"
          class="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full border text-[0.82rem] font-semibold cursor-pointer transition-all duration-200"
          :class="filtroEstado === e.id
            ? 'bg-slate-900 border-slate-900 text-white'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'"
          :style="{ '--chip-color': e.color || '#94a3b8' }" @click="filtroEstado = e.id">
          <span class="w-2 h-2 rounded-full shrink-0 bg-[var(--chip-color)]"></span>
          {{ e.nombre }}
          <span class="px-[7px] py-px rounded-full text-[0.75rem]"
            :class="filtroEstado === e.id ? 'bg-white/[0.18]' : 'bg-black/[0.06]'">{{ conteoPorEstado.get(e.id) ?? 0
            }}</span>
        </button>
      </div>

      <div class="flex items-center gap-2 mb-6">
        <!-- Actualizar -->
        <button
          class="flex items-center gap-2 px-4 py-[9px] rounded-[10px] border border-slate-200 bg-white text-slate-700 text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 hover:not-disabled:bg-slate-50 hover:not-disabled:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="isLoadingAsesores" @click="cargarAsesores">
          <svg class="w-4 h-4" :class="{ 'animate-spin': isLoadingAsesores }" width="16" height="16" viewBox="0 0 24 24"
            fill="none">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M21 3v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>

          Actualizar
        </button>

        <!-- Exportar: totalmente independiente del panel "Ver historial".
             Siempre está habilitado (salvo mientras exporta) y trae TODO
             el historial de TODOS los trabajadores sin ningún filtro. -->
        <button
          class="flex items-center gap-2 px-4 py-[9px] rounded-[10px] border border-[#2d8c4a] bg-[#2d8c4a] text-white text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 hover:not-disabled:bg-[#24763e] disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="isExportando" @click="exportarExcel">
          <svg v-if="!isExportando" class="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="m7 10 5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>

          <svg v-else class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-opacity=".25" />
            <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>

          {{ isExportando ? 'Exportando...' : 'Exportar Excel' }}
        </button>
      </div>
    </div>

    <div v-if="isLoadingAsesores && asesores.length === 0" class="py-10 text-center text-slate-400 text-[0.9rem]">
      Cargando asesores...
    </div>

    <div v-else-if="asesoresFiltrados.length === 0" class="py-10 text-center text-slate-400 text-[0.9rem]">
      No hay asesores con ese estado.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 mb-2">
      <div v-for="a in asesoresFiltrados" :key="a.id_trabajador"
        class="relative bg-white border border-slate-200 rounded-2xl p-[18px] transition-all duration-200 overflow-hidden hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[var(--status-color)]"
        :style="{ '--status-color': a.color || '#94a3b8' }">
        <div class="flex items-center gap-3 mb-3.5">
          <div
            class="w-[42px] h-[42px] rounded-full flex items-center justify-center bg-[var(--status-color)] text-white font-bold text-base shrink-0">
            {{ a.nombre?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="mb-1 text-[0.92rem] font-bold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis"
              :title="a.nombre">
              {{ a.nombre }}
            </p>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[0.74rem] font-bold bg-[color-mix(in_srgb,var(--status-color)_14%,white)] text-[var(--status-color)]">
              <span
                class="w-1.5 h-1.5 rounded-full bg-[var(--status-color)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--status-color)_22%,transparent)] animate-pulse"></span>
              {{ a.estado_conexion }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 px-3 py-2.5 rounded-[10px] bg-slate-50 text-slate-700 mb-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
            <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span class="tabular-nums font-bold text-[0.92rem]">{{ tiempoEnVivo(a.fecha_inicio) }}</span>
        </div>

        <p class="mb-3.5 text-[0.78rem] text-slate-400">Desde las {{ formatFecha(a.fecha_inicio) }}</p>

        <button
          class="w-full py-2 rounded-[9px] border border-slate-200 bg-white text-slate-900 text-[0.82rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-900 hover:text-white hover:border-slate-900"
          @click="verHistorial(a)">
          Ver historial
        </button>
      </div>
    </div>

    <transition enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2">
      <div v-if="asesorSeleccionado" id="panel-historial"
        class="mt-8 bg-white border border-slate-200 rounded-[18px] p-[22px]">
        <div class="flex items-start justify-between gap-3 flex-wrap mb-[18px]">
          <div class="flex flex-col gap-2">
            <h2 class="text-[1.1rem] font-bold text-slate-900">
              Historial de <span class="text-[#2d8c4a]">{{ asesorSeleccionado.nombre }}</span>
            </h2>
          </div>
          <button
            class="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 cursor-pointer text-[0.9rem] transition-all duration-200 hover:bg-red-100 hover:border-red-200 hover:text-red-600"
            @click="cerrarHistorial" aria-label="Cerrar historial">✕</button>
        </div>

        <!-- Filtros del historial (solo afectan este panel, NO al Excel) -->
        <div class="flex flex-wrap items-end gap-3.5 p-3.5 bg-slate-50 rounded-xl mb-[18px]">
          <div class="flex flex-col gap-[5px] min-w-[150px]">
            <label class="text-[0.74rem] font-bold text-slate-500 uppercase tracking-wide">Estado</label>
            <select v-model="filtroHistorialEstado"
              class="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-[0.85rem] text-slate-900 focus:outline-none focus:border-[#2d8c4a]">
              <option :value="null">Todos los estados</option>
              <option v-for="e in estados" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
          </div>

          <div class="flex flex-col gap-[5px] min-w-[150px]">
            <label class="text-[0.74rem] font-bold text-slate-500 uppercase tracking-wide">Desde</label>
            <input type="date" v-model="filtroFechaDesde"
              class="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-[0.85rem] text-slate-900 focus:outline-none focus:border-[#2d8c4a]" />
          </div>

          <div class="flex flex-col gap-[5px] min-w-[150px]">
            <label class="text-[0.74rem] font-bold text-slate-500 uppercase tracking-wide">Hasta</label>
            <input type="date" v-model="filtroFechaHasta"
              class="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-[0.85rem] text-slate-900 focus:outline-none focus:border-[#2d8c4a]" />
          </div>

          <div class="flex flex-row gap-2 min-w-0">
            <button
              class="px-4 py-2 rounded-lg border-none bg-slate-900 text-white text-[0.82rem] font-semibold cursor-pointer transition-colors duration-200 hover:not-disabled:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="isLoadingHistorial" @click="cargarHistorial">
              Filtrar
            </button>
            <button
              class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-[0.82rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-100"
              @click="limpiarFiltrosHistorial">
              Limpiar
            </button>
          </div>
        </div>
        <div v-if="isLoadingHistorial" class="py-10 text-center text-slate-400 text-[0.9rem]">Cargando historial...
        </div>
        <div v-else-if="historial.length === 0" class="py-10 text-center text-slate-400 text-[0.9rem]">
          No hay registros para los filtros seleccionados.
        </div>

        <div v-else class="flex flex-col gap-1.5">
          <div
            class="hidden sm:grid grid-cols-[1.2fr_1.4fr_1.4fr_1fr] px-3.5 pb-2 text-[0.72rem] font-bold uppercase tracking-wider text-slate-400">
            <span>Estado</span>
            <span>Inicio</span>
            <span>Fin</span>
            <span>Duración</span>
          </div>

          <div v-for="item in historial" :key="item.id"
            class="grid grid-cols-1 sm:grid-cols-[1.2fr_1.4fr_1.4fr_1fr] items-start sm:items-center gap-1.5 sm:gap-0 px-3.5 py-3 rounded-[10px] border-l-[3px] border-l-[var(--status-color)] transition-colors duration-150 hover:bg-slate-100"
            :class="!item.fecha_fin ? 'bg-[color-mix(in_srgb,var(--status-color)_6%,#f8fafc)]' : 'bg-slate-50'"
            :style="{ '--status-color': item.color || '#94a3b8' }">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[0.74rem] font-bold bg-[color-mix(in_srgb,var(--status-color)_14%,white)] text-[var(--status-color)]">
              <span
                class="w-1.5 h-1.5 rounded-full bg-[var(--status-color)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--status-color)_22%,transparent)] animate-pulse"></span>
              {{ item.estado_conexion }}
            </span>
            <span class="text-[0.83rem] text-slate-600">{{ formatFecha(item.fecha_inicio) }}</span>
            <span class="text-[0.83rem] text-slate-600">
              <template v-if="item.fecha_fin">{{ formatFecha(item.fecha_fin) }}</template>
              <span v-else
                class="inline-flex items-center gap-[5px] text-green-600 font-bold text-[0.78rem] before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-green-600 before:animate-pulse">En
                curso</span>
            </span>
            <span
              class="tabular-nums font-bold text-[0.85rem] text-slate-900 before:content-['Duración:_'] sm:before:content-none before:text-slate-400 before:font-medium">
              {{ tiempoHistorial(item) }}
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script src="./historialconexiones.ts" lang="ts"></script>