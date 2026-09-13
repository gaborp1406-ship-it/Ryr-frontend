<template>
  <div class="min-h-full bg-[#f8faf9] p-6 font-sans text-[#0a0a0a] max-[600px]:p-[15px]">

    <!-- ERROR (las fechas ahora las controla el componente padre) -->
    <div v-if="error"
      class="mb-[14px] rounded-[12px] border border-red-200 bg-red-50 px-[14px] py-[10px] text-[12px] font-semibold text-red-500">
      {{ error }}
    </div>

    <!-- KPIs -->
    <div class="mb-[14px] grid grid-cols-4 gap-[14px] max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1">
      <!-- SKELETON KPIs -->
      <template v-if="loading">
        <div v-for="n in 4" :key="`kpi-skel-${n}`"
          class="min-h-[120px] rounded-[18px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
          <div class="flex justify-between">
            <div class="skeleton h-[35px] w-[35px] rounded-[11px]"></div>
          </div>

          <div class="mt-[13px] flex flex-col gap-[8px]">
            <span class="skeleton h-[10px] w-[70%] rounded-full"></span>
            <span class="skeleton mt-[4px] h-[24px] w-[50%] rounded-[6px]"></span>
          </div>
        </div>
      </template>

      <!-- KPIs REALES -->
      <div v-else v-for="kpi in kpis" :key="kpi.label"
        class="min-h-[120px] rounded-[18px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition-opacity duration-300">
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
        </div>

        <!-- KPI CONTENT -->
        <div class="mt-[13px] flex flex-col">
          <span class="text-[12px] text-slate-500">
            {{ kpi.label }}
          </span>

          <strong class="mt-[2px] text-[32px] font-bold leading-tight tracking-[-0.03em]">
            {{ kpi.value }}
          </strong>
        </div>

      </div>
    </div>

    <!-- CIERRES POR PROYECTO -->
    <section
      class="mb-[14px] rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
      <!-- HEADER -->
      <div class="mb-[18px] flex justify-between">
        <div>
          <span class="mb-1 block text-[11px] font-bold tracking-[0.14em] text-slate-400">
            PROYECTOS
          </span>

          <h2 class="m-0 text-[18px] font-bold leading-tight tracking-[-0.02em]">
            Cierres por proyecto
          </h2>
        </div>

        <span v-if="!loading" class="h-fit rounded-lg bg-slate-50 px-[9px] py-[6px] text-[10px] text-slate-500">
          {{ proyectos.length }} proyectos
        </span>

        <span v-else class="skeleton h-[24px] w-[75px] rounded-lg"></span>
      </div>

      <!-- SKELETON BARRAS -->
      <div v-if="loading" class="grid grid-cols-5 gap-[14px] max-[1000px]:grid-cols-1">
        <div v-for="n in 5" :key="`proy-skel-${n}`" class="min-w-0">
          <div class="mb-[7px] flex justify-between">
            <span class="skeleton h-[10px] w-[60%] rounded-full"></span>
            <span class="skeleton h-[10px] w-[15%] rounded-full"></span>
          </div>

          <div class="skeleton h-2 w-full rounded-full"></div>

          <span class="skeleton mt-[6px] block h-[9px] w-[45%] rounded-full"></span>
        </div>
      </div>

      <!-- LISTA VACÍA -->
      <p v-else-if="proyectos.length === 0" class="text-[12px] text-slate-400">
        No hay cierres registrados en el periodo seleccionado.
      </p>

      <!-- BARRAS -->
      <div v-else class="grid grid-cols-5 gap-[14px] max-[1000px]:grid-cols-1">
        <div v-for="proyecto in proyectos" :key="proyecto.name" class="min-w-0 animate-[fadeIn_0.35s_ease]">
          <!-- TOP -->
          <div class="mb-[7px] flex justify-between text-[11px] text-slate-500">
            <span class="truncate">
              {{ proyecto.name }}
            </span>

            <strong class="text-slate-900">
              {{ proyecto.value }}
            </strong>
          </div>

          <!-- PROGRESS -->
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <span class="block h-full rounded-full bg-[#2d8c4a] transition-[width] duration-700 ease-out"
              :style="{ width: `${proyecto.percent}%` }"></span>
          </div>

          <small class="mt-[5px] block text-[10px] text-slate-400">
            {{ proyecto.percent }}% del proyecto líder
          </small>
        </div>
      </div>
    </section>

    <!-- GRID -->
    <div class="grid grid-cols-3 gap-[14px] max-[1000px]:grid-cols-1">
      <!-- LEADS POR FUENTE -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <!-- HEADER -->
        <div class="mb-[18px] flex justify-between">
          <div>
            <span class="mb-1 block text-[11px] font-bold tracking-[0.14em] text-slate-400">
              CAPTACIÓN
            </span>

            <h2 class="m-0 text-[18px] font-bold leading-tight tracking-[-0.02em]">
              Leads por fuente
            </h2>
          </div>
        </div>

        <!-- SKELETON -->
        <div v-if="loading" class="flex flex-col gap-[15px]">
          <div v-for="n in 5" :key="`leads-fuente-skel-${n}`" class="flex justify-between">
            <span class="skeleton h-[11px] w-[45%] rounded-full"></span>
            <span class="skeleton h-[11px] w-[15%] rounded-full"></span>
          </div>
        </div>

        <p v-else-if="leadsPorFuente.length === 0" class="text-[12px] text-slate-400">
          Sin datos para este periodo.
        </p>

        <!-- STATS -->
        <div v-else class="flex flex-col gap-[13px]">
          <div v-for="fuente in leadsPorFuente" :key="fuente.name"
            class="flex justify-between text-[12px] text-slate-500 animate-[fadeIn_0.35s_ease]">
            <span>{{ fuente.name }}</span>

            <strong class="text-slate-900">
              {{ fuente.value }}
            </strong>
          </div>
        </div>
      </section>

      <!-- CIERRES POR FUENTE -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <!-- HEADER -->
        <div class="mb-[18px] flex justify-between">
          <div>
            <span class="mb-1 block text-[11px] font-bold tracking-[0.14em] text-slate-400">
              CIERRES POR FUENTE
            </span>

            <h2 class="m-0 text-[18px] font-bold leading-tight tracking-[-0.02em]">
              Fuentes
            </h2>
          </div>
        </div>

        <!-- SKELETON -->
        <div v-if="loading" class="flex flex-col gap-[17px]">
          <div v-for="n in 4" :key="`cierres-fuente-skel-${n}`">
            <div class="mb-[6px] flex justify-between">
              <span class="skeleton h-[11px] w-[40%] rounded-full"></span>
              <span class="skeleton h-[11px] w-[12%] rounded-full"></span>
            </div>
            <div class="skeleton h-[6px] w-full rounded-full"></div>
          </div>
        </div>

        <p v-else-if="cierresPorFuente.length === 0" class="text-[12px] text-slate-400">
          Sin cierres para este periodo.
        </p>

        <!-- SOURCES -->
        <div v-else class="flex flex-col gap-[17px]">
          <div v-for="fuente in cierresPorFuente" :key="fuente.name" class="animate-[fadeIn_0.35s_ease]">
            <!-- SOURCE INFO -->
            <div class="mb-[6px] flex justify-between text-[12px] text-slate-500">
              <span>
                {{ fuente.name }}
              </span>

              <strong class="text-slate-900">
                {{ fuente.value }}
              </strong>
            </div>

            <!-- PROGRESS -->
            <div class="h-[6px] overflow-hidden rounded-full bg-slate-100">
              <span class="block h-full rounded-full bg-[#2d8c4a] transition-[width] duration-700 ease-out"
                :style="{ width: `${fuente.percent}%` }"></span>
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
            <span class="mb-1 block text-[11px] font-bold tracking-[0.14em] text-slate-400">
              CIERRES POR ASESOR
            </span>

            <h2 class="m-0 text-[18px] font-bold leading-tight tracking-[-0.02em]">
              Asesores
            </h2>
          </div>
        </div>

        <!-- SKELETON -->
        <div v-if="loading" class="flex flex-col">
          <div v-for="n in 5" :key="`asesor-skel-${n}`"
            class="grid grid-cols-[22px_32px_1fr_auto] items-center gap-2 border-b border-slate-100 py-[10px] last:border-b-0">
            <span class="skeleton h-[10px] w-[16px] rounded-full"></span>
            <span class="skeleton h-8 w-8 rounded-full"></span>
            <span class="skeleton h-[10px] w-[70%] rounded-full"></span>
            <span class="skeleton h-[12px] w-[20px] rounded-full"></span>
          </div>
        </div>

        <p v-else-if="advisors.length === 0" class="text-[12px] text-slate-400">
          Sin cierres registrados por asesor.
        </p>

        <!-- ADVISORS -->
        <div v-else class="flex flex-col">
          <div v-for="(advisor, index) in advisors" :key="advisor.name"
            class="grid grid-cols-[22px_32px_1fr_auto] items-center gap-2 border-b border-slate-100 py-[10px] last:border-b-0 animate-[fadeIn_0.35s_ease]">
            <!-- NUMBER -->
            <span class="text-[11px] text-slate-400">
              {{ String(index + 1).padStart(2, '0') }}
            </span>

            <!-- AVATAR -->
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d8c4a]/10 text-[11px] font-bold text-[#2d8c4a]">
              {{ advisor.initials }}
            </div>

            <!-- NAME -->
            <div class="flex min-w-0 flex-col">
              <strong class="truncate text-[12px] text-slate-700">
                {{ advisor.name }}
              </strong>
            </div>

            <!-- SCORE -->
            <strong class="text-[14px] text-[#2d8c4a]">
              {{ advisor.cierres }}
            </strong>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script src="./DashboardComercial.ts" lang="ts"></script>

<style scoped>
/* Shimmer profesional: barrido de luz sobre fondo neutro */
.skeleton {
  display: inline-block;
  background: linear-gradient(90deg, #eef1f0 25%, #e4e9e7 37%, #eef1f0 63%);
  background-size: 400px 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: -400px 0;
  }

  100% {
    background-position: 400px 0;
  }
}

/* Fade-in suave cuando los datos reales reemplazan al skeleton */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(2px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>