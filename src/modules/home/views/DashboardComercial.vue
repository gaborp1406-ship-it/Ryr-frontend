<template>
  <div class="min-h-full bg-[#f8faf9] p-6 font-sans text-[#0a0a0a] max-[600px]:p-[15px]">

    <div class="mb-[14px] grid grid-cols-4 gap-[14px] max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1">
      <div v-for="kpi in kpis" :key="kpi.label"
        class="min-h-[140px] rounded-[18px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <!-- KPI TOP -->
        <div class="flex justify-between">
          <!-- ICON -->
          <div class="flex h-[35px] w-[35px] items-center justify-center rounded-[11px]" :class="{
            'bg-[#2d8c4a]/10 text-[#2d8c4a]': kpi.color === 'green',
            'bg-slate-100 text-[#0a0a0a]': kpi.color === 'black',
            'bg-[#eef5ff] text-blue-600': kpi.color === 'blue',
            'bg-orange-50 text-orange-600': kpi.color === 'orange',
          }">
            <!-- TARGET -->
            <svg v-if="kpi.icon === 'target'" viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />

              <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8" />

              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>

            <!-- USERS -->
            <svg v-else-if="kpi.icon === 'users'" viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8" />

              <path d="M2 21v-2a7 7 0 0 1 14 0v2" stroke="currentColor" stroke-width="1.8" />

              <path d="M16 4a4 4 0 0 1 0 7.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>

            <!-- CALENDAR -->
            <svg v-else-if="kpi.icon === 'calendar'" viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8" />

              <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>

            <!-- CHART -->
            <svg v-else viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <path d="M4 19V10M10 19V5M16 19v-8M22 19V8" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" />
            </svg>
          </div>

          <!-- TREND -->
          <span class="h-fit rounded-full bg-[#2d8c4a]/[0.08] px-[7px] py-1 text-[9px] font-bold text-[#2d8c4a]">
            +{{ kpi.trend }}%
          </span>
        </div>

        <!-- KPI CONTENT -->
        <div class="mt-[13px] flex flex-col">
          <span class="text-[10px] text-slate-500">
            {{ kpi.label }}
          </span>

          <strong class="mt-[2px] text-[27px] font-bold leading-tight tracking-[-0.03em]">
            {{ kpi.value }}
          </strong>
        </div>

        <!-- KPI FOOTER -->
        <div class="mt-[9px] text-[8px] text-slate-400">
          {{ kpi.description }}
        </div>
      </div>
    </div>

    <!-- PIPELINE -->
    <section
      class="mb-[14px] rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
      <!-- HEADER -->
      <div class="mb-[18px] flex justify-between">
        <div>
          <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
            PIPELINE
          </span>

          <h2 class="m-0 text-[15px] font-bold leading-tight tracking-[-0.02em]">
            Avance por etapa
          </h2>
        </div>

        <span class="h-fit rounded-lg bg-slate-50 px-[9px] py-[6px] text-[8px] text-slate-500">
          320 oportunidades
        </span>
      </div>

      <!-- PIPELINE -->
      <div class="grid grid-cols-5 gap-[14px] max-[1000px]:grid-cols-1">
        <div v-for="stage in stages" :key="stage.name" class="min-w-0">
          <!-- TOP -->
          <div class="mb-[7px] flex justify-between text-[9px] text-slate-500">
            <span>
              {{ stage.name }}
            </span>

            <strong class="text-slate-900">
              {{ stage.value }}
            </strong>
          </div>

          <!-- PROGRESS -->
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <span class="block h-full rounded-full bg-[#2d8c4a]" :style="{ width: `${stage.percent}%` }"></span>
          </div>

          <small class="mt-[5px] block text-[8px] text-slate-400">
            {{ stage.percent }}%
          </small>
        </div>
      </div>
    </section>

    <!-- GRID -->
    <div class="grid grid-cols-3 gap-[14px] max-[1000px]:grid-cols-1">
      <!-- REUNIONES -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <!-- HEADER -->
        <div class="mb-[18px] flex justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              ACTIVIDAD
            </span>

            <h2 class="m-0 text-[15px] font-bold leading-tight tracking-[-0.02em]">
              Reuniones
            </h2>
          </div>

          <strong class="text-[24px] font-bold leading-none text-[#2d8c4a]">
            128
          </strong>
        </div>

        <!-- STATS -->
        <div class="flex flex-col gap-[13px]">
          <div class="flex justify-between text-[10px] text-slate-500">
            <span>Realizadas</span>

            <strong class="text-slate-900">
              82
            </strong>
          </div>

          <div class="flex justify-between text-[10px] text-slate-500">
            <span>Programadas</span>

            <strong class="text-slate-900">
              34
            </strong>
          </div>

          <div class="flex justify-between text-[10px] text-slate-500">
            <span>Canceladas</span>

            <strong class="text-slate-900">
              12
            </strong>
          </div>
        </div>
      </section>

      <!-- OPORTUNIDADES -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <!-- HEADER -->
        <div class="mb-[18px] flex justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              OPORTUNIDADES
            </span>

            <h2 class="m-0 text-[15px] font-bold leading-tight tracking-[-0.02em]">
              Origen
            </h2>
          </div>
        </div>

        <!-- SOURCES -->
        <div class="flex flex-col gap-[17px]">
          <div v-for="source in sources" :key="source.name">
            <!-- SOURCE INFO -->
            <div class="mb-[6px] flex justify-between text-[10px] text-slate-500">
              <span>
                {{ source.name }}
              </span>

              <strong class="text-slate-900">
                {{ source.value }}
              </strong>
            </div>

            <!-- PROGRESS -->
            <div class="h-[6px] overflow-hidden rounded-full bg-slate-100">
              <span class="block h-full rounded-full bg-[#2d8c4a]" :style="{ width: `${source.percent}%` }"></span>
            </div>
          </div>
        </div>
      </section>

      <!-- TOP ASESORES -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <!-- HEADER -->
        <div class="mb-[18px] flex justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              RENDIMIENTO
            </span>

            <h2 class="m-0 text-[15px] font-bold leading-tight tracking-[-0.02em]">
              Top asesores
            </h2>
          </div>
        </div>

        <!-- ADVISORS -->
        <div class="flex flex-col">
          <div v-for="(advisor, index) in advisors" :key="advisor.name"
            class="grid grid-cols-[22px_32px_1fr_auto] items-center gap-2 border-b border-slate-100 py-[10px] last:border-b-0">
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
                {{ advisor.opportunities }} oportunidades
              </span>
            </div>

            <!-- SCORE -->
            <strong class="text-[12px] text-[#2d8c4a]">
              {{ advisor.conversion }}%
            </strong>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script src="./DashboardComercial.ts" lang="ts"></script>