<template>
  <div class="flex flex-col gap-5">

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
                <div class="h-3 w-16 rounded bg-slate-200"></div>
              </td>
              <td class="px-4 py-3.5">
                <div class="mx-auto h-6 w-6 rounded-full bg-slate-200"></div>
              </td>
            </tr>
          </template>

          <template v-else>
            <tr v-for="lead in leads" :key="lead.id_lead"
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

           

              <td class="px-4 py-3 text-center">
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
                <span v-else class="text-slate-300">—</span>
              </td>
            </tr>

            <tr v-if="leads.length === 0">
              <td colspan="7" class="px-4 py-8 text-center text-slate-400 text-xs">
                No se encontraron leads para esta etapa.
              </td>
            </tr>
          </template>

        </tbody>
      </table>
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