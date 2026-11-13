<template>
  <div class="flex flex-col gap-5">
    <!-- ============ FILTROS ============ -->
    <div class="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div class="flex flex-col gap-4">

        <!-- FILA 1: buscador + proyecto + fuente + asesor -->
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end">

          <!-- BUSCAR CLIENTE -->
          <div class="flex min-w-[220px] flex-1 flex-col gap-1.5">
            <label class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Buscar cliente
            </label>
            <div class="relative">
              <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input v-model="busqueda" type="text" placeholder="Nombre del cliente..."
                class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:ring-2 focus:ring-[#2d8c4a]/10" />
            </div>
          </div>

          <!-- PROYECTO -->
          <div class="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Proyecto
            </label>
            <select v-model="proyectoSeleccionado"
              class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:ring-2 focus:ring-[#2d8c4a]/10">
              <option value="">Todos los proyectos</option>
              <option v-for="proyecto in proyectos" :key="proyecto" :value="proyecto">
                {{ proyecto }}
              </option>
            </select>
          </div>

          <!-- FUENTE -->
          <div class="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Fuente
            </label>
            <select v-model="fuenteSeleccionada"
              class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:ring-2 focus:ring-[#2d8c4a]/10">
              <option value="">Todas las fuentes</option>
              <option v-for="fuente in fuentes" :key="fuente" :value="fuente">
                {{ fuente }}
              </option>
            </select>
          </div>

          <!-- ASESOR (oculto si es agente) -->
          <div v-if="puedeFiltrarPorAsesor" class="flex min-w-[200px] flex-1 flex-col gap-1.5">
            <label class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Asesor
            </label>

            <select v-model="idAsesorSeleccionado" :disabled="cargandoAsesores" @change="cambiarAsesor"
              class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:ring-2 focus:ring-[#2d8c4a]/10 disabled:cursor-not-allowed disabled:bg-slate-50">
              <option :value="undefined">Todos los asesores</option>

              <option v-for="asesor in asesores" :key="asesor.id_asesor" :value="asesor.id_asesor">
                {{ asesor.nombre_abrev || asesor.nombre }}
              </option>
            </select>
          </div>
        </div>

        <!-- FILA 2: fechas + botones -->
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end">

          <!-- FECHA INICIO -->
          <div class="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Fecha inicio
            </label>
            <input v-model="fechaInicio" type="date"
              class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:ring-2 focus:ring-[#2d8c4a]/10" />
          </div>

          <!-- FECHA FIN -->
          <div class="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <label class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Fecha fin
            </label>
            <input v-model="fechaFin" type="date"
              class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:ring-2 focus:ring-[#2d8c4a]/10" />
          </div>

          <!-- APLICAR -->
          <button type="button" @click="aplicarFiltros" :disabled="cargandoLeads"
            class="h-10 rounded-xl bg-[#2d8c4a] px-5 text-xs font-semibold text-white transition hover:bg-[#24753d] disabled:cursor-not-allowed disabled:opacity-60">
            {{ cargandoLeads ? 'Cargando...' : 'Aplicar filtros' }}
          </button>

          <!-- LIMPIAR -->
          <button type="button" @click="limpiarFiltros" :disabled="cargandoLeads"
            class="h-10 rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
            Limpiar
          </button>

          <!-- EXPORTAR EXCEL -->
       <button v-if="puedeFiltrarPorAsesor" type="button" @click="abrirModalExportar"
  class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#2d8c4a]/40 bg-[#2d8c4a]/10 px-5 text-xs font-semibold text-[#1e6236] transition hover:bg-[#2d8c4a]/20">
  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
  Exportar Excel
</button>
        </div>

      </div>
    </div>

    <!-- ============ TABLA ============ -->
    <div
      class="flex-1 overflow-auto rounded-[22px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <table class="min-w-full border-collapse">
        <thead class="sticky top-0 z-10 bg-[#0a0a0a] text-slate-300">
          <tr>
            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Cliente</th>
            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Proyecto</th>
            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Fuente</th>
            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Asesor</th>
            <th class="rlv-mono px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Etapa</th>
            <th class="px-4 py-3.5 text-center text-[10px] font-medium uppercase tracking-[0.14em]">Acción</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100 text-xs text-slate-700">

          <!-- SKELETON -->
          <template v-if="cargandoLeads">
            <tr v-for="n in 6" :key="'skeleton-' + n" class="animate-pulse odd:bg-white even:bg-slate-50/50">
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div class="h-7 w-7 shrink-0 rounded-full bg-slate-200"></div>
                  <div class="h-3 w-28 rounded bg-slate-200"></div>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="h-3 w-24 rounded bg-slate-200"></div>
              </td>
              <td class="px-4 py-3.5">
                <div class="h-3 w-16 rounded bg-slate-200"></div>
              </td>
              <td class="px-4 py-3.5">
                <div class="h-3 w-24 rounded bg-slate-200"></div>
              </td>
              <td class="px-4 py-3.5">
                <div class="h-3 w-20 rounded bg-slate-200"></div>
              </td>
              <td class="px-4 py-3.5">
                <div class="mx-auto h-6 w-16 rounded-full bg-slate-200"></div>
              </td>
            </tr>
          </template>

          <!-- DATOS -->
          <template v-else>
            <tr v-for="lead in leadsPaginados" :key="lead.id_lead"
              class="group border-l-2 border-l-transparent odd:bg-white even:bg-slate-50/50 transition-colors hover:border-l-[#2d8c4a] hover:bg-[#2d8c4a]/[0.05]">

              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2d8c4a]/10 text-[11px] font-semibold text-[#1e6236] rlv-mono">
                    {{ obtenerIniciales(lead.nombre_clientes) }}
                  </span>
                  <span class="font-medium text-slate-800">{{ lead.nombre_clientes }}</span>
                </div>
              </td>

              <td class="px-4 py-3 text-slate-800">{{ lead.nombre_proyecto }}</td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  <span class="h-1.5 w-1.5 rounded-full bg-[#2d8c4a]/60"></span>
                  {{ lead.nombre_fuente }}
                </span>
              </td>

              <td class="px-4 py-3 text-slate-800">{{ lead.nombre_asesor }}</td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                  <span class="h-1.5 w-1.5 rounded-full bg-[#2d8c4a]"></span>
                  {{ lead.nombre_etapa }}
                </span>
              </td>

              <!-- ACCIONES -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">

                  <!-- OJITO -->
                  <button type="button" title="Ver lead" @click="verLead(lead)"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-[#2d8c4a]/40 hover:bg-[#2d8c4a]/10 hover:text-[#1e6236]">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>

                  <!-- REABRIR -->
                  <button v-if="mostrarBotonReabrir(lead)" type="button" :disabled="reabriendoId === lead.id_lead"
                    @click="reabrirLead(lead)"
                    class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:border-[#2d8c4a]/40 hover:bg-[#2d8c4a]/10 hover:text-[#1e6236] disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg v-if="reabriendoId === lead.id_lead" class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24"
                      fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <svg v-else class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 12a9 9 0 1 1 3 6.7" />
                      <path d="M3 16v-4h4" />
                    </svg>
                    {{ reabriendoId === lead.id_lead ? 'Reabriendo...' : 'Reabrir' }}
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="leadsFiltrados.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-slate-400 text-xs">
                No se encontraron leads con los filtros seleccionados.
              </td>
            </tr>
          </template>

        </tbody>
      </table>
    </div>

    <!-- ============ PAGINACIÓN ============ -->
    <div v-if="!cargandoLeads && leadsFiltrados.length > 0"
      class="flex flex-col items-center justify-between gap-3 rounded-[22px] border border-slate-200/80 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:flex-row">

      <p class="text-xs text-slate-500">
        Mostrando
        <span class="font-semibold text-slate-700">{{ desde }}–{{ hasta }}</span>
        de
        <span class="font-semibold text-slate-700">{{ leadsFiltrados.length }}</span>
        leads
      </p>

      <div class="flex items-center gap-1">
        <button type="button" :disabled="paginaActual === 1" @click="irAPagina(paginaActual - 1)"
          class="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
          Anterior
        </button>

        <button v-for="pagina in paginasVisibles" :key="pagina" type="button" @click="irAPagina(pagina)" :class="[
          'h-8 min-w-[2rem] rounded-lg border px-2 text-xs font-semibold transition',
          pagina === paginaActual
            ? 'border-[#2d8c4a] bg-[#2d8c4a] text-white'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        ]">
          {{ pagina }}
        </button>

        <button type="button" :disabled="paginaActual === totalPaginas" @click="irAPagina(paginaActual + 1)"
          class="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
          Siguiente
        </button>
      </div>
    </div>

    <!-- ============ MODAL EXPORTAR EXCEL ============ -->
    <div v-if="modalExportarAbierto"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      @click.self="cerrarModalExportar">
      <div role="dialog" aria-modal="true" aria-labelledby="titulo-exportar"
        class="w-full max-w-md rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xl">

        <!-- CABECERA -->
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 id="titulo-exportar" class="rlv-display text-base font-semibold text-slate-800">
              Exportar leads desistidos
            </h2>
            <p class="mt-1 text-xs text-slate-500">
              Elige los filtros y descarga el Excel con nombre, DNI, número, motivo y comentarios.
            </p>
          </div>

          <button type="button" aria-label="Cerrar" :disabled="exportando" @click="cerrarModalExportar"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <!-- FILTROS DEL MODAL -->
        <div class="mt-5 flex flex-col gap-4">

          <!-- AGENTE (oculto si es agente: se usa su propio id) -->
          <div v-if="puedeFiltrarPorAsesor" class="flex flex-col gap-1.5">
            <label class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Agente
            </label>
            <select v-model="exportIdAsesor" :disabled="cargandoAsesores || exportando"
              class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:ring-2 focus:ring-[#2d8c4a]/10 disabled:cursor-not-allowed disabled:bg-slate-50">
              <option :value="undefined">Todos los agentes</option>
              <option v-for="asesor in asesores" :key="asesor.id_asesor" :value="asesor.id_asesor">
                {{ asesor.nombre_abrev || asesor.nombre }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- FECHA INICIO -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Fecha inicio
              </label>
              <input v-model="exportFechaInicio" type="date" :disabled="exportando"
                class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:ring-2 focus:ring-[#2d8c4a]/10 disabled:cursor-not-allowed disabled:bg-slate-50" />
            </div>

            <!-- FECHA FIN -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Fecha fin
              </label>
              <input v-model="exportFechaFin" type="date" :disabled="exportando"
                class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:ring-2 focus:ring-[#2d8c4a]/10 disabled:cursor-not-allowed disabled:bg-slate-50" />
            </div>
          </div>

          <p v-if="rangoFechasInvalido" class="text-xs font-medium text-red-600">
            La fecha inicio no puede ser mayor a la fecha fin.
          </p>
        </div>

        <!-- ACCIONES -->
        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" :disabled="exportando" @click="limpiarFiltrosExportar"
            class="h-10 rounded-xl px-3 text-xs font-semibold text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            Limpiar filtros
          </button>

          <div class="flex gap-2">
            <button type="button" :disabled="exportando" @click="cerrarModalExportar"
              class="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none">
              Cancelar
            </button>

            <button type="button" :disabled="exportando || rangoFechasInvalido" @click="exportarExcel"
              class="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#2d8c4a] px-5 text-xs font-semibold text-white transition hover:bg-[#24753d] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none">
              <svg v-if="exportando" class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ exportando ? 'Exportando...' : 'Exportar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script src="./desistidoleads" lang="ts"></script>

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