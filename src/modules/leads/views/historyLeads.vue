<template>
  <div class="flex flex-col gap-5">

    <!-- ===================================================== -->
    <!-- FILTROS -->
    <!-- ===================================================== -->

    <div class="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end">

        <!-- ASESOR -->
        <div v-if="puedeFiltrarPorAsesor" class="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <label class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Asesor
          </label>

          <select v-model="idAsesorSeleccionado" :disabled="cargandoAsesores" @change="cambiarAsesor"
            class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:ring-2 focus:ring-[#2d8c4a]/10 disabled:cursor-not-allowed disabled:bg-slate-50">
            <option :value="undefined">
              Todos los asesores
            </option>

            <option v-for="asesor in asesores" :key="asesor.id_asesor" :value="asesor.id_asesor">
              {{ asesor.nombre_abrev || asesor.nombre }}
            </option>
          </select>
        </div>

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

      </div>
    </div>

    <!-- ===================================================== -->
    <!-- TABLA -->
    <!-- ===================================================== -->

    <div
      class="flex-1 overflow-auto rounded-[22px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <table class="min-w-full border-collapse">

        <thead class="sticky top-0 z-10 bg-[#0a0a0a] text-slate-300">
          <tr>
            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">
              Cliente
            </th>

            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">
              Proyecto
            </th>

            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">
              Fuente
            </th>

            <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">
              Asesor
            </th>

            <th class="rlv-mono px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">
              Etapa
            </th>
            <th class="px-4 py-3.5 text-center text-[10px] font-medium uppercase tracking-[0.14em]">
              Acción
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100 text-xs text-slate-700">

          <!-- SKELETON -->
          <template v-if="cargandoLeads">
            <tr v-for="n in 6" :key="'skeleton-' + n" class="animate-pulse odd:bg-white even:bg-slate-50/50">
              <!-- CLIENTE -->
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div class="h-7 w-7 shrink-0 rounded-full bg-slate-200"></div>
                  <div class="h-3 w-28 rounded bg-slate-200"></div>
                </div>
              </td>

              <!-- PROYECTO -->
              <td class="px-4 py-3.5">
                <div class="h-3 w-24 rounded bg-slate-200"></div>
              </td>

              <!-- FUENTE -->
              <td class="px-4 py-3.5">
                <div class="h-3 w-16 rounded bg-slate-200"></div>
              </td>

              <!-- ASESOR -->
              <td class="px-4 py-3.5">
                <div class="h-3 w-24 rounded bg-slate-200"></div>
              </td>

              <!-- ETAPA -->
              <td class="px-4 py-3.5">
                <div class="h-3 w-20 rounded bg-slate-200"></div>
              </td>

              <!-- ACCIÓN -->
              <td class="px-4 py-3 text-center">
                <div class="mx-auto h-7 w-7 rounded-full bg-slate-200"></div>
              </td>
            </tr>
          </template>

          <!-- DATA -->
          <template v-else>
            <tr v-for="lead in leads" :key="lead.id_lead"
              class="group border-l-2 border-l-transparent odd:bg-white even:bg-slate-50/50 transition-colors hover:border-l-[#2d8c4a] hover:bg-[#2d8c4a]/[0.05]">

              <!-- CLIENTE -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <span
                    class="rlv-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2d8c4a]/10 text-[11px] font-semibold text-[#1e6236]">
                    {{ obtenerIniciales(lead.nombre_clientes) }}
                  </span>

                  <span class="font-medium text-slate-800">
                    {{ lead.nombre_clientes }}
                  </span>
                </div>
              </td>

              <!-- PROYECTO -->
              <td class="px-4 py-3 text-slate-800">
                {{ lead.nombre_proyecto }}
              </td>

              <!-- FUENTE -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  <span class="h-1.5 w-1.5 rounded-full bg-[#2d8c4a]/60"></span>

                  {{ lead.nombre_fuente }}
                </span>
              </td>

              <!-- ASESOR -->
              <td class="px-4 py-3 text-slate-800">
                {{ lead.nombre_asesor }}
              </td>

              <!-- ETAPA -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  <span class="h-1.5 w-1.5 rounded-full bg-[#2d8c4a]"></span>

                  {{ lead.nombre_etapa }}
                </span>
              </td>

              <!-- ACCIÓN -->
              <td class="px-4 py-3 text-center">
                <button type="button" @click="verLead(lead.id_lead)" title="Ver detalle del lead"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-[#2d8c4a]/10 hover:text-[#1e6236]">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />

                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </td>

            </tr>

            <!-- SIN RESULTADOS -->
            <tr v-if="leads.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-xs text-slate-400">
                No se encontraron leads para esta etapa.
              </td>
            </tr>
          </template>

        </tbody>
      </table>
    </div>

  </div>
</template>

<script src="./historyLeads.ts" lang="ts"></script>

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
