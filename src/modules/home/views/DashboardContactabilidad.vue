<template>
  <div class="min-h-full bg-[#f8faf9] p-6 font-sans text-[#0a0a0a] max-[650px]:p-[15px]">

  
    <div v-if="errorDashboard"
      class="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
      <div>
        <p class="text-[13px] font-semibold text-red-700">
          No se pudo cargar el dashboard
        </p>

        <p class="mt-0.5 text-[12px] text-red-600">
          {{ errorDashboard }}
        </p>
      </div>

      <button type="button"
        class="rounded-lg bg-red-600 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-red-700"
        @click="cargarDashboard">
        Reintentar
      </button>
    </div>

    <!-- =========================================================
         SKELETON — mientras cargando = true
    ========================================================== -->
    <div v-if="cargando" class="animate-pulse">

      <!-- KPI leads entrantes -->
      <div class="mb-[14px] w-64 max-w-full rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div class="h-3 w-32 rounded-full bg-[#e5e7eb]" />
        <div class="mt-3 h-8 w-24 rounded-lg bg-[#e5e7eb]" />
      </div>

      <!-- Fila: bar chart ejecutivos + kpis min/hr -->
      <div class="mb-[14px] grid grid-cols-[1.4fr_0.6fr] gap-[14px] max-[1000px]:grid-cols-1">
        <div class="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div class="h-4 w-56 rounded-full bg-[#e5e7eb]" />
          <div class="mt-6 flex h-[180px] items-end gap-4">
            <div v-for="n in 6" :key="`v-skel-${n}`" class="flex-1 rounded-t-lg bg-[#e5e7eb]"
              :style="{ height: `${30 + (n * 10)}%` }" />
          </div>
        </div>

        <div class="flex flex-col gap-[14px]">
          <div class="flex-1 rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div class="h-3 w-28 rounded-full bg-[#e5e7eb]" />
            <div class="mt-3 h-8 w-20 rounded-lg bg-[#e5e7eb]" />
          </div>
          <div class="flex-1 rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div class="h-3 w-28 rounded-full bg-[#e5e7eb]" />
            <div class="mt-3 h-8 w-20 rounded-lg bg-[#e5e7eb]" />
          </div>
        </div>
      </div>

      <!-- Fila: horizontal chart + tabla rangos -->
      <div class="grid grid-cols-[1.2fr_0.8fr] gap-[14px] max-[1000px]:grid-cols-1">
        <div class="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div class="h-4 w-60 rounded-full bg-[#e5e7eb]" />
          <div class="mt-6 space-y-4">
            <div v-for="n in 5" :key="`h-skel-${n}`" class="flex items-center gap-3">
              <div class="h-3 w-24 rounded-full bg-[#e5e7eb]" />
              <div class="h-3 flex-1 rounded-full bg-[#eceeed]" />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div class="h-4 w-52 rounded-full bg-[#e5e7eb]" />
          <div class="mt-6 space-y-3">
            <div v-for="n in 4" :key="`t-skel-${n}`" class="h-6 w-full rounded-lg bg-[#eceeed]" />
          </div>
        </div>
      </div>
    </div>

    <!-- =========================================================
         CONTENIDO REAL
    ========================================================== -->
    <template v-else>

      <!-- =========================
           KPI: N° DE LEADS ENTRANTES
      ========================== -->
      <div class="mb-[14px] w-64 max-w-full rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <p class="text-[12px] font-bold uppercase tracking-wide text-[#111827]">
          N° de leads entrantes
        </p>

        <p class="mt-2 text-[30px] font-bold tracking-[-1px] text-[#111827]">
          {{ formatearNumero(leadsEntrantes) }}
        </p>
      </div>

      <!-- =========================
           FILA 1: BARRAS POR EJECUTIVO + KPIs MIN/HORAS
      ========================== -->
      <div class="mb-[14px] grid grid-cols-[1.4fr_0.6fr] gap-[14px] max-[1000px]:grid-cols-1">

        <!-- LEADS CONTACTADOS POR EJECUTIVO (barras verdes) -->
        <div class="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div class="mb-2 flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-sm bg-[#2d8c4a]" />
            <h2 class="text-[13px] font-bold uppercase tracking-wide text-[#111827]">
              Leads contactados por ejecutivo
            </h2>
          </div>

          <div v-if="leadsPorEjecutivo.length" class="mt-6 flex h-[190px] items-end gap-4 max-[600px]:gap-2">
            <div v-for="item in leadsPorEjecutivo" :key="item.id"
              class="flex h-full flex-1 flex-col items-center justify-end">

              <span class="mb-1.5 text-[11px] font-bold text-[#111827]">
                {{ formatearNumero(item.value) }}
              </span>

              <div class="w-full max-w-[42px] rounded-t-md bg-[#2d8c4a] transition-all duration-500"
                :style="{ height: `${Math.max(item.percent, 2)}%` }" />

              <span class="mt-2 line-clamp-2 text-center text-[10px] leading-tight text-[#6b7280]">
                {{ item.name }}
              </span>
            </div>
          </div>

          <div v-else class="mt-6 flex h-[190px] items-center justify-center text-[12px] text-[#9ca3af]">
            No hay datos de leads contactados por ejecutivo.
          </div>

      
        </div>

        <!-- KPIs MINUTOS / HORAS PROMEDIO -->
        <div class="flex flex-col gap-[14px]">
          <div class="flex-1 rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <p class="text-[12px] font-bold uppercase tracking-wide text-[#111827]">
              Minutos promedio
            </p>

            <p class="mt-2 text-[26px] font-bold tracking-[-1px] text-[#111827]">
              {{ formatearDecimal(minutosPromedio) }}
            </p>

           
          </div>

          <div class="flex-1 rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <p class="text-[12px] font-bold uppercase tracking-wide text-[#111827]">
              Horas promedio
            </p>

            <p class="mt-2 text-[26px] font-bold tracking-[-1px] text-[#111827]">
              {{ formatearDecimal(horasPromedio) }}
            </p>

           
          </div>
        </div>
      </div>

      <!-- =========================
           FILA 2: TIEMPO POR EJECUTIVO + TABLA DE RANGOS
      ========================== -->
      <div class="grid grid-cols-[1.2fr_0.8fr] gap-[14px] max-[1000px]:grid-cols-1">

        <!-- MINUTOS CONTACTADOS POR EJECUTIVO (barras horizontales oscuras) -->
        <div class="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div class="mb-4 flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-sm bg-[#0a0a0a]" />
            <h2 class="text-[13px] font-bold uppercase tracking-wide text-[#111827]">
              Minutos contactados por ejecutivo
            </h2>
          </div>

          <div v-if="minutosPorEjecutivo.length" class="space-y-4">
            <div v-for="item in minutosPorEjecutivo" :key="item.id" class="flex items-center gap-3">
              <span class="w-28 shrink-0 truncate text-[11px] font-medium text-[#374151]">
                {{ item.name }}
              </span>

              <div class="relative h-5 flex-1 overflow-hidden rounded-md bg-[#f1f3f2]">
                <div class="h-full rounded-md bg-[#0a0a0a] transition-all duration-500"
                  :style="{ width: `${Math.max(item.percent, 4)}%` }" />
              </div>

              <span class="w-24 shrink-0 text-right text-[11px] font-bold text-[#111827]">
                {{ item.texto }}
              </span>
            </div>
          </div>

          <div v-else class="flex h-[150px] items-center justify-center text-[12px] text-[#9ca3af]">
            No hay datos de tiempo de contacto por ejecutivo.
          </div>

       
        </div>

        <!-- LEADS CONTACTADOS EN RANGOS (tabla) -->
        <div class="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <h2 class="mb-4 text-[13px] font-bold uppercase tracking-wide text-[#111827]">
            Leads contactados en rangos
          </h2>

          <div v-if="rangosTabla.length">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-[#eef0ef]">
                  <th class="w-8 pb-2 text-left text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]" />
                  <th class="pb-2 text-left text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                    Rango_Contacto
                  </th>
                  <th class="pb-2 text-right text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                    Leads
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in rangosTabla" :key="item.rango" class="border-b border-[#f3f4f4] last:border-0">
                  <td class="py-2.5 text-[11px] text-[#9ca3af]">
                    {{ item.orden }}.
                  </td>
                  <td class="py-2.5 text-[12px] font-medium text-[#374151]">
                    {{ item.rango }}
                  </td>
                  <td class="py-2.5 text-right text-[12px] font-bold text-[#111827]">
                    {{ formatearNumero(item.cantidad) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="mt-3 flex items-center justify-between rounded-lg bg-[#fafcfb] px-3 py-2.5">
              <span class="text-[11px] font-semibold text-[#374151]">
                Total
              </span>

              <span class="text-[13px] font-bold text-[#111827]">
                {{ formatearNumero(rangosTotal) }}
              </span>
            </div>
          </div>

          <div v-else class="flex h-[150px] items-center justify-center text-[12px] text-[#9ca3af]">
            No hay información de rangos de contacto.
          </div>

         
        </div>
      </div>
    </template>

  </div>
</template>

<script src="./DashboardContactabilidad.ts" lang="ts"></script>