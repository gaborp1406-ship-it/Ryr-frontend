<template>



  <div class="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">

    <!-- lado izquierdo: BUSCAR -->
    <div class="relative w-full lg:w-80 -translate-y-4">
      <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-4 text-slate-400" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
      </svg>

      <input v-model="search" type="text" placeholder="Buscar lead..."
        class="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10">
    </div>


    <!-- lado derecho: total + asesor -->
    <div class="flex items-center gap-3">

      <!-- total -->
      <div
        class="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 min-w-[104px] text-center">
        <div class="rlv-mono text-xl font-semibold tabular-nums leading-none text-slate-800">
          {{ totalHoy }}
        </div>

        <div class="text-[10px] uppercase tracking-[0.18em] text-slate-400 mt-1.5">
          Total hoy
        </div>
      </div>

      <!-- asesor actual -->
      <div
        class="relative flex items-center gap-3 rounded-2xl border border-[#2d8c4a]/30 bg-[#2d8c4a]/5 pl-5 pr-5 py-3">

        <span class="relative flex h-2 w-2 shrink-0">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ea86b] opacity-50">
          </span>

          <span class="relative inline-flex h-2 w-2 rounded-full bg-[#4ea86b]">
          </span>
        </span>


        <div>
          <div class="text-[10px] uppercase tracking-[0.18em] text-[#2d8c4a]">
            Le toca ahora
          </div>

          <div class="rlv-mono font-semibold text-[15px] text-slate-800 leading-snug mt-0.5">
            {{ asesorActual }}
          </div>
        </div>

      </div>

    </div>

  </div>


  <!-- ============ TABLA ============ -->
  <div
    class="mt-4 flex-1 overflow-auto rounded-[22px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">

    <table class="min-w-full border-collapse">

      <thead class="sticky top-0 z-10 bg-[#0a0a0a] text-slate-300">
        <tr>
          <th class="rlv-mono px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Fecha</th>
          <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Asesor</th>
          <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Proyecto</th>
          <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Nombre</th>
          <th class="rlv-mono px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">DNI</th>
          <th class="rlv-mono px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Teléfono</th>
          <th class="px-4 py-3.5 text-left text-[10px] font-medium uppercase tracking-[0.14em]">Fuente</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100 text-xs text-slate-700">

        <!-- Skeleton mientras carga la lista de leads -->
        <template v-if="cargando">
          <tr v-for="n in 5" :key="'skeleton-' + n" class="animate-pulse odd:bg-white even:bg-slate-50/50">
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
              <div class="h-3 w-20 rounded bg-slate-200"></div>
            </td>
            <td class="px-4 py-3.5">
              <div class="h-3 w-16 rounded bg-slate-200"></div>
            </td>
          </tr>
        </template>

        <template v-else>
          <tr v-for="lead in leadsPaginados" :key="lead.id"
            class="group cursor-pointer border-l-2 border-l-transparent odd:bg-white even:bg-slate-50/50 transition-colors hover:border-l-[#2d8c4a] hover:bg-[#2d8c4a]/[0.05]">
            <td class="rlv-mono px-4 py-3 whitespace-nowrap text-slate-0">{{ lead.fecha }}</td>

            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2d8c4a]/10 text-[11px] font-semibold text-[#1e6236] rlv-mono">
                  {{lead.asesor ? lead.asesor.trim().split(' ').filter(Boolean).map(w =>
                    w[0]).slice(0, 2).join('').toUpperCase() : '—'}}
                </span>
                <span class="font-medium text-slate-800">{{ lead.asesor }}</span>
              </div>
            </td>

            <td class="px-4 py-3 text-slate-800 ">{{ lead.proyecto }}</td>
            <td class="px-4 py-3 text-slate-800">{{ lead.nombre_cliente }}</td>
            <td class="rlv-mono px-4 py-3 tabular-nums text-slate-0">{{ lead.dni_cliente }}</td>
            <td class="rlv-mono px-4 py-3 tabular-nums text-slate-0">{{ lead.telefono_cliente }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                <span class="h-1.5 w-1.5 rounded-full bg-[#2d8c4a]/60"></span>
                {{ lead.fuente }}
              </span>
            </td>
          </tr>

          <tr v-if="leadsPaginados.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-slate-400 text-xs">
              No hay leads registrados hoy.
            </td>
          </tr>
        </template>

        <!-- Ticket nuevo -->
        <tr tabindex="0" class="relative bg-[#2d8c4a]/[0.045] transition-opacity"
          :class="{ 'opacity-60 pointer-events-none': guardando }">
          <td
            class="px-4 py-3.5 border-t-2  text-xs border-dashed border-[#2d8c4a]/30 text-slate-500 whitespace-nowrap">
            <span v-if="guardando" class="flex items-center gap-1.5 rlv-mono">
              <svg class="h-3.5 w-3.5 animate-spin text-[#2d8c4a]" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Guardando...
            </span>
            <span v-else class="rlv-mono">{{ fechaHoy }}</span>
          </td>

          <td class="px-4 py-3.5 border-t-2 border-dashed border-[#2d8c4a]/30">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-7 w-7 shrink-0 items-center text-xs justify-center rounded-full bg-[#2d8c4a] text-[11px] font-semibold text-white rlv-mono">
                {{asesorActual ? asesorActual.trim().split(' ').filter(Boolean).map(w =>
                  w[0]).slice(0, 2).join('').toUpperCase() : '—'}}
              </span>
              <span class="font-semibold text-xs text-slate-800">{{ asesorActual }}</span>
            </div>
          </td>

          <td class="px-3 py-2.5 border-t-2 border-dashed border-[#2d8c4a]/30">
            <select v-model="nuevoLead.proyecto" @keyup.enter="!guardando && guardarLead()" :disabled="guardando"
              class="w-full rounded-xl border border-slate-200 text-xs bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10 disabled:opacity-60 disabled:cursor-not-allowed">
              <option value="">Seleccione</option>
              <option v-for="proyecto in proyectos" :key="proyecto.id_proyecto" :value="proyecto.id_proyecto">
                {{ proyecto.nombre }}
              </option>
            </select>
          </td>

          <td class="px-3 py-2.5 border-t-2 border-dashed border-[#2d8c4a]/30">
            <input v-model="nuevoLead.nombre" @input="onNombreInput" :disabled="guardando" placeholder="Nombre completo"
              class="w-full rounded-xl border text-xs  border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10 disabled:opacity-60 disabled:cursor-not-allowed">
          </td>

          <td class="px-3 py-2.5 border-t-2 border-dashed border-[#2d8c4a]/30">
            <input v-model="nuevoLead.dni" @input="onDniInput" :disabled="guardando" maxlength="10" inputmode="numeric"
              placeholder="87654321"
              class="rlv-mono w-full rounded-xl text-xs border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10 disabled:opacity-60 disabled:cursor-not-allowed">
          </td>

          <td class="px-3 py-2.5 border-t-2 border-dashed border-[#2d8c4a]/30">
            <input v-model="nuevoLead.telefono" @input="onTelefonoInput" @keyup.enter="!guardando && guardarLead()"
              :disabled="guardando" maxlength="9" inputmode="numeric" placeholder="987654321"
              class="rlv-mono  text-xs w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10 disabled:opacity-60 disabled:cursor-not-allowed">
          </td>

          <td class="px-3 py-2.5  border-t-2 border-dashed border-[#2d8c4a]/30">
            <select v-model="nuevoLead.fuente" @keyup.enter="!guardando && guardarLead()" :disabled="guardando"
              class="w-full rounded-xl  text-xs border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10 disabled:opacity-60 disabled:cursor-not-allowed">
              <option value="">Seleccione</option>
              <option v-for="opcion in opcionesFuente" :key="opcion.id" :value="opcion.id">
                {{ opcion.nombre }}
              </option>
            </select>
          </td>
        </tr>

      </tbody>

    </table>

  </div>

  <!-- ============ PAGINACIÓN (delgada, sin fondo) ============ -->
  <div v-if="!cargando && totalPaginas > 1" class="mt-4 flex items-center justify-center gap-6 select-none">

    <!-- Previous -->
    <button type="button" @click="irPaginaAnterior" :disabled="paginaActual === 1"
      class="flex items-center gap-1.5 text-[13px] font-medium transition-colors"
      :class="paginaActual === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-600'">
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Anterior
    </button>

    <!-- Números -->
    <div class="rlv-mono flex items-center gap-3 text-[13px]">
      <template v-for="(pagina, idx) in paginasVisibles" :key="idx">
        <span v-if="pagina === '...'" class="text-slate-300">…</span>

        <button v-else type="button" @click="irAPagina(pagina)" class="transition-colors" :class="pagina === paginaActual
          ? 'font-semibold text-slate-900'
          : 'text-[#2d8c4a] hover:text-[#1e6236]'">
          {{ pagina }}
        </button>
      </template>
    </div>

    <!-- Next -->
    <button type="button" @click="irPaginaSiguiente" :disabled="paginaActual === totalPaginas"
      class="flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
      :class="paginaActual === totalPaginas ? 'text-slate-300 cursor-not-allowed' : 'text-[#2d8c4a] hover:text-[#1e6236]'">
      Siguiente
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>

  </div>


</template>

<script src="./RegisterleadView.ts" lang="ts"></script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

.rlv {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

.rlv-display {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  letter-spacing: -0.01em;
}

.rlv-mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

/* ticket stub: perforated left edge on the "le toca" chip */
.rlv-ticket::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 0;
  bottom: 0;
  width: 1px;
  background-image: radial-gradient(circle, rgba(10, 10, 10, 1) 2px, transparent 2px);
  background-size: 1px 10px;
  background-repeat: repeat-y;
  opacity: 0.5;
}
</style>