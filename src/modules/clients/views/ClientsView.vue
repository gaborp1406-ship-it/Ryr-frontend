<template>
  <div class="flex flex-col gap-5">

    <div
      class="relative flex flex-col lg:flex-row lg:flex-wrap lg:items-center gap-3 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      @click.self="cerrarCombos">

      <!-- Buscar texto libre -->
      <div class="relative w-full lg:w48">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
        </svg>
        <input v-model="search" @input="onBuscarTexto" type="text" placeholder="Buscar cliente o DNI"
          class="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10">
      </div>

      <div class="hidden lg:block h-8 w-px bg-slate-100"></div>

      <!-- Filtro: Fecha inicio -->
      <div class="relative w-full lg:w-52" @click.stop>
        <label class="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Desde</label>
        <input v-model="filtroFechaInicio" @change="onCambioFecha" type="date"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10">
      </div>

      <!-- Filtro: Fecha fin -->
      <div class="relative w-full lg:w-52" @click.stop>
        <label class="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Hasta</label>
        <input v-model="filtroFechaFin" @change="onCambioFecha" type="date"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10">
      </div>

      <div class="hidden lg:block h-8 w-px bg-slate-100"></div>
      <div v-if="!authStore.isAgent" class="relative w-full lg:w-52" @click.stop>
        <label class="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Asesor</label>
        <div class="relative">
          <input v-model="queryAsesor" @focus="abiertoAsesor = true" @input="onInputAsesor" type="text"
            placeholder="Todos los asesores"
            class="w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10">
          <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div v-if="abiertoAsesor"
          class="absolute z-20 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
          <button type="button" @click="seleccionarAsesor(null)"
            class="w-full px-3 py-2 text-left text-xs text-slate-500 hover:bg-[#2d8c4a]/[0.06]">
            Todos los asesores
          </button>
          <button v-for="op in asesoresFiltrados" :key="op.id" type="button" @click="seleccionarAsesor(op)"
            class="w-full px-3 py-2 text-left text-xs transition-colors hover:bg-[#2d8c4a]/[0.06]"
            :class="filtroAsesor?.id === op.id ? 'font-semibold text-[#1e6236] bg-[#2d8c4a]/[0.05]' : 'text-slate-700'">
            {{ op.label }}
          </button>
          <p v-if="asesoresFiltrados.length === 0" class="px-3 py-2 text-xs text-slate-400">Sin resultados</p>
        </div>
      </div>

      <!-- Combobox: Proyecto -->
      <div class="relative w-full lg:w-52" @click.stop>
        <label class="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Proyecto</label>
        <div class="relative">
          <input v-model="queryProyecto" @focus="abiertoProyecto = true" @input="onInputProyecto" type="text"
            placeholder="Todos los proyectos"
            class="w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10">
          <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div v-if="abiertoProyecto"
          class="absolute z-20 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
          <button type="button" @click="seleccionarProyecto(null)"
            class="w-full px-3 py-2 text-left text-xs text-slate-500 hover:bg-[#2d8c4a]/[0.06]">
            Todos los proyectos
          </button>
          <button v-for="op in proyectosFiltrados" :key="op.id" type="button" @click="seleccionarProyecto(op)"
            class="w-full px-3 py-2 text-left text-xs transition-colors hover:bg-[#2d8c4a]/[0.06]"
            :class="filtroProyecto?.id === op.id ? 'font-semibold text-[#1e6236] bg-[#2d8c4a]/[0.05]' : 'text-slate-700'">
            {{ op.label }}
          </button>
          <p v-if="proyectosFiltrados.length === 0" class="px-3 py-2 text-xs text-slate-400">Sin resultados</p>
        </div>
      </div>

      <!-- Combobox: Fuente -->
      <div class="relative w-full lg:w-52" @click.stop>
        <label class="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Fuente</label>
        <div class="relative">
          <input v-model="queryFuente" @focus="abiertoFuente = true" @input="onInputFuente" type="text"
            placeholder="Todas las fuentes"
            class="w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10">
          <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div v-if="abiertoFuente"
          class="absolute z-20 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
          <button type="button" @click="seleccionarFuente(null)"
            class="w-full px-3 py-2 text-left text-xs text-slate-500 hover:bg-[#2d8c4a]/[0.06]">
            Todas las fuentes
          </button>
          <button v-for="op in fuentesFiltradas" :key="op.id" type="button" @click="seleccionarFuente(op)"
            class="w-full px-3 py-2 text-left text-xs transition-colors hover:bg-[#2d8c4a]/[0.06]"
            :class="filtroFuente?.id === op.id ? 'font-semibold text-[#1e6236] bg-[#2d8c4a]/[0.05]' : 'text-slate-700'">
            {{ op.label }}
          </button>
          <p v-if="fuentesFiltradas.length === 0" class="px-3 py-2 text-xs text-slate-400">Sin resultados</p>
        </div>
      </div>

      <!-- Limpiar filtros -->
      <button v-if="hayFiltrosActivos" type="button" @click="limpiarFiltros"
        class="lg:ml-auto flex items-center gap-1.5 self-start lg:self-auto rounded-full border border-slate-200 px-3.5 py-2 text-[11px] font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Limpiar filtros
      </button>
    </div>

    <!-- ============ TABLA ============ -->
    <div
      class="flex-1 overflow-auto rounded-[22px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      @click="cerrarCombos">
      <table class="min-w-full border-collapse">
        <thead class="sticky top-0 z-10 bg-[#0a0a0a] text-slate-300">
          <tr>
            <th class="rlv-mono px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Fecha</th>
            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Asesor</th>
            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Proyecto</th>
            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Cliente</th>
            <th class="rlv-mono px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">DNI</th>
            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Fuente</th>
                        <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Etapa</th>

            <th class="px-4 py-3.5 text-center text-[10px] font-medium uppercase tracking-[0.14em]">Ver</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100 text-xs text-slate-700">

          <template v-if="cargando">
            <tr v-for="n in 6" :key="'skeleton-' + n" class="animate-pulse odd:bg-white even:bg-slate-50/50">
              <td class="px-4 py-3.5">
                <div class="h-3 w-16 rounded bg-slate-200"></div>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div class="h-7 w-7 shrink-0 rounded-full bg-slate-200"></div>
                  <div class="h-3 w-24 rounded bg-slate-200"></div>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="h-3 w-20 rounded bg-slate-200"></div>
              </td>
              <td class="px-4 py-3.5">
                <div class="h-3 w-28 rounded bg-slate-200"></div>
              </td>
              <td class="px-4 py-3.5">
                <div class="h-3 w-16 rounded bg-slate-200"></div>
              </td>
              <td class="px-4 py-3.5">
                <div class="h-3 w-16 rounded bg-slate-200"></div>
              </td>
              <td class="px-4 py-3.5">
                <div class="mx-auto h-6 w-6 rounded-full bg-slate-200"></div>
              </td>
            </tr>
          </template>

          <template v-else>
            <tr v-for="cliente in clientesPaginados" :key="cliente.id_lead"
              class="group border-l-2 border-l-transparent odd:bg-white even:bg-slate-50/50 transition-colors hover:border-l-[#2d8c4a] hover:bg-[#2d8c4a]/[0.05]">
              <td class="rlv-mono px-4 py-3 whitespace-nowrap text-slate-500">{{ cliente.fecha_asignacion }}</td>

              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2d8c4a]/10 text-[11px] font-semibold text-[#1e6236] rlv-mono">
                    {{cliente.nombre_asesor ? cliente.nombre_asesor.trim().split(' ').filter(Boolean).map(w =>
                      w[0]).slice(0, 2).join('').toUpperCase() : '—'}}
                  </span>
                  <span class="font-medium text-slate-800">{{ cliente.nombre_asesor }}</span>
                </div>
              </td>

              <td class="px-4 py-3 text-slate-800">{{ cliente.proyecto }}</td>
              <td class="px-4 py-3 text-slate-800">{{ cliente.cliente }}</td>
              <td class="rlv-mono px-4 py-3 tabular-nums text-slate-500">{{ cliente.dni_cliente }}</td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  <span class="h-1.5 w-1.5 rounded-full bg-[#2d8c4a]/60"></span>
                  {{ cliente.fuente }}
                </span>
              </td>
<td class="rlv-mono px-4 py-3 tabular-nums text-slate-500">{{ cliente.etapa_actual }}</td>
              <td class="px-4 py-3 text-center">
                <button type="button" @click="verLead(cliente.id_lead)" title="Ver detalle del lead"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-[#2d8c4a]/10 hover:text-[#1e6236]">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </td>
            </tr>

            <tr v-if="clientesPaginados.length === 0">
              <td colspan="7" class="px-4 py-8 text-center text-slate-400 text-xs">
                No se encontraron clientes potenciales con los filtros aplicados.
              </td>
            </tr>
          </template>

        </tbody>
      </table>
    </div>

    <!-- ============ PAGINACIÓN ============ -->
    <div v-if="!cargando && totalPaginas > 1" class="flex items-center justify-center gap-6 select-none">
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
          <button v-else type="button" @click="irAPagina(pagina)" class="transition-colors"
            :class="pagina === paginaActual ? 'font-semibold text-slate-900' : 'text-[#2d8c4a] hover:text-[#1e6236]'">
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
</template>

<script src="./ClientsView.ts" lang="ts"></script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

.rlv-display {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  letter-spacing: -0.01em;
}

.rlv-mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
</style>