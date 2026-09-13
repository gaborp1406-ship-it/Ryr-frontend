<template>
  <div class="min-h-full bg-[#f8faf9] p-6 font-sans text-[#0a0a0a] max-[600px]:p-[15px]">

    <!-- KPIs -->
    <div class="mb-[14px] grid grid-cols-4 gap-[14px] max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1">
      <!-- CIERRES -->
      <div
        class="min-h-[140px] rounded-[18px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="flex justify-between">
          <div class="flex h-[35px] w-[35px] items-center justify-center rounded-[11px] bg-[#2d8c4a]/10 text-[#2d8c4a]">
            <svg viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>

          <span class="h-fit rounded-full bg-[#2d8c4a]/[0.08] px-[7px] py-1 text-[9px] font-bold text-[#2d8c4a]">
            +14.8%
          </span>
        </div>

        <div class="mt-[13px] flex flex-col">
          <span class="text-[10px] text-slate-500">
            Cierres
          </span>

          <strong class="mt-[2px] text-[27px] font-bold leading-tight tracking-[-0.04em]">
            42
          </strong>
        </div>

        <div class="mt-[9px] text-[8px] text-slate-400">
          Operaciones cerradas
        </div>
      </div>

      <!-- VENTA ACUMULADA -->
      <div
        class="min-h-[140px] rounded-[18px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="flex justify-between">
          <div class="flex h-[35px] w-[35px] items-center justify-center rounded-[11px] bg-slate-100 text-[#0a0a0a]">
            <svg viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <path d="M12 3v18M17 7.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3"
                stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </div>

          <span class="h-fit rounded-full bg-[#2d8c4a]/[0.08] px-[7px] py-1 text-[9px] font-bold text-[#2d8c4a]">
            +8.2%
          </span>
        </div>

        <div class="mt-[13px] flex flex-col">
          <span class="text-[10px] text-slate-500">
            Venta acumulada
          </span>

          <strong class="mt-[2px] text-[27px] font-bold leading-tight tracking-[-0.04em]">
            S/ 4.8M
          </strong>
        </div>

        <div class="mt-[9px] text-[8px] text-slate-400">
          Valor total de operaciones
        </div>
      </div>

      <!-- CONVERSIÓN -->
      <div
        class="min-h-[140px] rounded-[18px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="flex justify-between">
          <div class="flex h-[35px] w-[35px] items-center justify-center rounded-[11px] bg-[#eef5ff] text-blue-600">
            <svg viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <path d="M4 19V10M10 19V5M16 19v-8M22 19V8" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" />
            </svg>
          </div>

          <span class="h-fit rounded-full bg-[#2d8c4a]/[0.08] px-[7px] py-1 text-[9px] font-bold text-[#2d8c4a]">
            +5.7%
          </span>
        </div>

        <div class="mt-[13px] flex flex-col">
          <span class="text-[10px] text-slate-500">
            Conversión
          </span>

          <strong class="mt-[2px] text-[27px] font-bold leading-tight tracking-[-0.04em]">
            18.4%
          </strong>
        </div>

        <div class="mt-[9px] text-[8px] text-slate-400">
          Oportunidades convertidas
        </div>
      </div>

      <!-- TICKET -->
      <div
        class="min-h-[140px] rounded-[18px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="flex justify-between">
          <div class="flex h-[35px] w-[35px] items-center justify-center rounded-[11px] bg-orange-50 text-orange-600">
            <svg viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />

              <path d="m9 12 2 2 4-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>

          <span class="h-fit rounded-full bg-[#2d8c4a]/[0.08] px-[7px] py-1 text-[9px] font-bold text-[#2d8c4a]">
            +11.3%
          </span>
        </div>

        <div class="mt-[13px] flex flex-col">
          <span class="text-[10px] text-slate-500">
            Ticket promedio
          </span>

          <strong class="mt-[2px] text-[27px] font-bold leading-tight tracking-[-0.04em]">
            S/ 114K
          </strong>
        </div>

        <div class="mt-[9px] text-[8px] text-slate-400">
          Valor promedio por cierre
        </div>
      </div>
    </div>

    <!-- ROW PRINCIPAL -->
    <div class="mb-[14px] grid grid-cols-[1.45fr_0.8fr] gap-[14px] max-[1000px]:grid-cols-1">
      <!-- EVOLUCIÓN -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="mb-[18px] flex items-start justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              EVOLUCIÓN
            </span>

            <h2 class="m-0 text-[15px] font-bold leading-tight tracking-[-0.02em]">
              Cierres por periodo
            </h2>
          </div>

          <span class="rounded-lg bg-slate-50 px-[9px] py-[6px] text-[8px] text-slate-500">
            Últimos 7 meses
          </span>
        </div>

        <!-- CHART -->
        <div class="flex h-[210px]">
          <!-- Y AXIS -->
          <div class="flex w-[25px] shrink-0 flex-col justify-between pb-[25px] text-[8px] text-slate-400">
            <span>50</span>
            <span>40</span>
            <span>30</span>
            <span>20</span>
            <span>10</span>
            <span>0</span>
          </div>

          <!-- CHART BODY -->
          <div class="relative flex-1">
            <!-- GRID -->
            <div class="absolute inset-x-0 bottom-[25px] top-0 flex flex-col justify-between">
              <span class="border-t border-dashed border-[#e8edf2]"></span>
              <span class="border-t border-dashed border-[#e8edf2]"></span>
              <span class="border-t border-dashed border-[#e8edf2]"></span>
              <span class="border-t border-dashed border-[#e8edf2]"></span>
              <span class="border-t border-dashed border-[#e8edf2]"></span>
              <span class="border-t border-dashed border-[#e8edf2]"></span>
            </div>

            <!-- LINE -->
            <svg viewBox="0 0 600 200" preserveAspectRatio="none"
              class="absolute inset-x-0 bottom-[25px] top-0 h-[calc(100%-25px)] w-full">
              <polyline :points="chartPoints" fill="none" stroke="#2d8c4a" stroke-width="3" stroke-linecap="round"
                stroke-linejoin="round" />

              <circle v-for="point in chartDots" :key="point.x" :cx="point.x" :cy="point.y" r="4" fill="white"
                stroke="#2d8c4a" stroke-width="3" />
            </svg>

            <!-- LABELS -->
            <div class="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-slate-500">
              <span v-for="month in months" :key="month">
                {{ month }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ESTADOS -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="mb-[18px] flex items-start justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              RESULTADO
            </span>

            <h2 class="m-0 text-[15px] font-bold leading-tight tracking-[-0.02em]">
              Estado de operaciones
            </h2>
          </div>
        </div>

        <!-- STATUS -->
        <div class="flex flex-col gap-[15px]">
          <div v-for="item in operationStatus" :key="item.label"
            class="flex items-center justify-between text-[10px] text-slate-500">
            <div class="flex items-center gap-2">
              <span class="h-[7px] w-[7px] shrink-0 rounded-full" :class="{
                'bg-[#2d8c4a]': item.color === 'green',
                'bg-[#0a0a0a]': item.color === 'black',
                'bg-orange-600': item.color === 'orange',
                'bg-slate-400': item.color === 'gray',
              }"></span>

              <span>
                {{ item.label }}
              </span>
            </div>

            <strong class="text-slate-900">
              {{ item.value }}
            </strong>
          </div>
        </div>

        <!-- CONVERSION -->
        <div class="mt-[25px] flex flex-col rounded-xl bg-[#f8faf9] p-[14px]">
          <span class="text-[9px] text-slate-500">
            Tasa de cierre
          </span>

          <strong class="mt-[3px] text-[24px] font-bold leading-none text-[#2d8c4a]">
            18.4%
          </strong>

          <small class="mt-[3px] text-[8px] text-slate-400">
            +3.2% respecto al periodo anterior
          </small>
        </div>
      </section>
    </div>

    <!-- SEGUNDA FILA -->
    <div class="mb-[14px] grid grid-cols-3 gap-[14px] max-[1000px]:grid-cols-1">
      <!-- ASESORES -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="mb-[18px] flex items-start justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              RANKING
            </span>

            <h2 class="m-0 text-[15px] font-bold leading-tight tracking-[-0.02em]">
              Cierres por asesor
            </h2>
          </div>
        </div>

        <!-- ADVISORS -->
        <div class="flex flex-col">
          <div v-for="(advisor, index) in advisors" :key="advisor.name"
            class="grid grid-cols-[24px_32px_1fr_auto] items-center gap-2 border-b border-slate-100 py-[11px] last:border-b-0">
            <!-- NUMBER -->
            <span class="text-[9px] text-slate-400">
              {{ String(index + 1).padStart(2, '0') }}
            </span>

            <!-- AVATAR -->
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d8c4a]/10 text-[9px] font-bold text-[#2d8c4a]">
              {{ advisor.initials }}
            </div>

            <!-- NAME -->
            <div class="flex min-w-0 flex-col">
              <strong class="truncate text-[10px] text-slate-700">
                {{ advisor.name }}
              </strong>

              <span class="mt-[2px] text-[8px] text-slate-400">
                {{ advisor.sales }} cierres
              </span>
            </div>

            <!-- RESULT -->
            <strong class="text-[10px] font-bold text-[#2d8c4a]">
              {{ advisor.amount }}
            </strong>
          </div>
        </div>
      </section>

      <!-- PROYECTOS -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="mb-[18px] flex items-start justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              PROYECTOS
            </span>

            <h2 class="m-0 text-[15px] font-bold leading-tight tracking-[-0.02em]">
              Cierres por proyecto
            </h2>
          </div>
        </div>

        <!-- PROJECTS -->
        <div class="flex flex-col gap-4">
          <div v-for="project in projects" :key="project.name">
            <div class="mb-[6px] flex justify-between text-[10px] text-slate-500">
              <span>
                {{ project.name }}
              </span>

              <strong class="text-slate-900">
                {{ project.value }}
              </strong>
            </div>

            <div class="h-[6px] overflow-hidden rounded-full bg-slate-100">
              <span class="block h-full rounded-full bg-[#2d8c4a]" :style="{ width: `${project.percent}%` }"></span>
            </div>
          </div>
        </div>
      </section>

      <!-- MOTIVOS -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="mb-[18px] flex items-start justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              PÉRDIDAS
            </span>

            <h2 class="m-0 text-[15px] font-bold leading-tight tracking-[-0.02em]">
              Oportunidades no cerradas
            </h2>
          </div>
        </div>

        <!-- REASONS -->
        <div class="flex flex-col gap-4">
          <div v-for="reason in lossReasons" :key="reason.label">
            <div class="mb-[6px] flex justify-between text-[10px] text-slate-500">
              <span>
                {{ reason.label }}
              </span>

              <strong class="text-slate-900">
                {{ reason.value }}
              </strong>
            </div>

            <div class="h-[6px] overflow-hidden rounded-full bg-slate-100">
              <span class="block h-full rounded-full bg-[#2d8c4a]" :style="{ width: `${reason.percent}%` }"></span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script src="./DashboardCierre.ts" lang="ts"></script>