<template>
  <div class="min-h-full bg-[#f8faf9] p-6 font-sans text-[#0a0a0a] max-[600px]:p-[15px]">


    <!-- KPIs -->
    <div class="mb-[14px] grid grid-cols-4 gap-[14px] max-[1000px]:grid-cols-2 max-[600px]:grid-cols-1">
      <!-- KPI 1 -->
      <div
        class="min-h-[140px] rounded-[18px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="flex justify-between">
          <div
            class="flex h-[35px] w-[35px] items-center justify-center rounded-[11px] bg-[rgba(45,140,74,0.1)] text-[#2d8c4a]">
            <svg viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.1 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 21 15.9Z"
                stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
            </svg>
          </div>

          <span class="h-fit rounded-full bg-[rgba(45,140,74,0.08)] px-[7px] py-1 text-[9px] font-bold text-[#2d8c4a]">
            +18.2%
          </span>
        </div>

        <div class="mt-[13px] flex flex-col">
          <span class="text-[10px] text-slate-500">
            Llamadas realizadas
          </span>

          <strong class="mt-[2px] text-[27px] font-bold leading-tight tracking-[-0.03em]">
            2,840
          </strong>
        </div>

        <div class="mt-[9px] text-[8px] text-slate-400">
          Intentos de contacto
        </div>
      </div>

      <!-- KPI 2 -->
      <div
        class="min-h-[140px] rounded-[18px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="flex justify-between">
          <div class="flex h-[35px] w-[35px] items-center justify-center rounded-[11px] bg-slate-100 text-[#0a0a0a]">
            <svg viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>

          <span class="h-fit rounded-full bg-[rgba(45,140,74,0.08)] px-[7px] py-1 text-[9px] font-bold text-[#2d8c4a]">
            +9.8%
          </span>
        </div>

        <div class="mt-[13px] flex flex-col">
          <span class="text-[10px] text-slate-500">
            Contactos efectivos
          </span>

          <strong class="mt-[2px] text-[27px] font-bold leading-tight tracking-[-0.03em]">
            1,426
          </strong>
        </div>

        <div class="mt-[9px] text-[8px] text-slate-400">
          Clientes que respondieron
        </div>
      </div>

      <!-- KPI 3 -->
      <div
        class="min-h-[140px] rounded-[18px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="flex justify-between">
          <div class="flex h-[35px] w-[35px] items-center justify-center rounded-[11px] bg-[#eef5ff] text-blue-600">
            <svg viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <path d="M12 2v20M17 6H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H7" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </div>

          <span class="h-fit rounded-full bg-[rgba(45,140,74,0.08)] px-[7px] py-1 text-[9px] font-bold text-[#2d8c4a]">
            +4.5%
          </span>
        </div>

        <div class="mt-[13px] flex flex-col">
          <span class="text-[10px] text-slate-500">
            Tasa de contacto
          </span>

          <strong class="mt-[2px] text-[27px] font-bold leading-tight tracking-[-0.03em]">
            50.2%
          </strong>
        </div>

        <div class="mt-[9px] text-[8px] text-slate-400">
          Contactos / llamadas
        </div>
      </div>

      <!-- KPI 4 -->
      <div
        class="min-h-[140px] rounded-[18px] border border-slate-200 bg-white p-[17px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="flex justify-between">
          <div class="flex h-[35px] w-[35px] items-center justify-center rounded-[11px] bg-orange-50 text-orange-600">
            <svg viewBox="0 0 24 24" fill="none" class="w-[18px]">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />

              <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </div>

          <span class="h-fit rounded-full bg-[rgba(45,140,74,0.08)] px-[7px] py-1 text-[9px] font-bold text-[#2d8c4a]">
            +6.1%
          </span>
        </div>

        <div class="mt-[13px] flex flex-col">
          <span class="text-[10px] text-slate-500">
            Duración promedio
          </span>

          <strong class="mt-[2px] text-[27px] font-bold leading-tight tracking-[-0.03em]">
            02:48
          </strong>
        </div>

        <div class="mt-[9px] text-[8px] text-slate-400">
          Tiempo promedio de llamada
        </div>
      </div>
    </div>

    <!-- MAIN ROW -->
    <div class="mb-[14px] grid grid-cols-2 gap-[14px] max-[1000px]:grid-cols-1">
      <!-- CONTACTABILIDAD -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="mb-[18px] flex items-start justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              CONTACTABILIDAD
            </span>

            <h2 class="m-0 text-[15px] font-bold tracking-[-0.02em]">
              Resultado de llamadas
            </h2>
          </div>

          <span class="rounded-lg bg-slate-50 px-[9px] py-[6px] text-[8px] text-slate-500">
            2,840 llamadas
          </span>
        </div>

        <div class="flex min-h-[200px] items-center gap-[30px] max-[600px]:flex-col">
          <!-- DONUT -->
          <div class="relative flex h-[160px] w-[160px] shrink-0 items-center justify-center rounded-full" style="
              background: conic-gradient(
                #2d8c4a 0 50.2%,
                #0a0a0a 50.2% 70%,
                #94a3b8 70% 88%,
                #e2e8f0 88% 100%
              );
            ">
            <div class="absolute h-[105px] w-[105px] rounded-full bg-white"></div>

            <div class="relative z-10 flex flex-col items-center">
              <strong class="text-[22px] font-bold tracking-[-0.03em]">
                50.2%
              </strong>

              <span class="mt-[2px] text-[8px] text-slate-400">
                Contactabilidad
              </span>
            </div>
          </div>

          <!-- LEGEND -->
          <div class="flex-1">
            <div v-for="item in callResults" :key="item.label"
              class="mb-[13px] grid grid-cols-[8px_1fr_auto] items-center gap-2 text-[9px]">
              <span class="h-[7px] w-[7px] rounded-full" :class="{
                'bg-[#2d8c4a]': item.color === 'green',
                'bg-[#0a0a0a]': item.color === 'black',
                'bg-slate-400': item.color === 'gray',
                'bg-slate-200': item.color === 'light',
              }"></span>

              <span class="text-slate-500">
                {{ item.label }}
              </span>

              <strong>
                {{ item.value }}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <!-- LLAMADAS POR DÍA -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="mb-[18px] flex items-start justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              ACTIVIDAD
            </span>

            <h2 class="m-0 text-[15px] font-bold tracking-[-0.02em]">
              Llamadas por día
            </h2>
          </div>
        </div>

        <div class="flex h-[205px] items-end justify-around gap-[10px] px-1 pt-[15px]">
          <div v-for="item in dailyCalls" :key="item.day" class="flex h-full flex-1 flex-col items-center justify-end">
            <div class="mb-[5px] text-[8px] text-slate-500">
              {{ item.value }}
            </div>

            <div class="flex h-[150px] w-[28px] items-end overflow-hidden rounded-t-[7px] rounded-b-[3px] bg-slate-100">
              <span class="block w-full rounded-t-[7px] rounded-b-[3px] bg-[#2d8c4a]" :style="{
                height: `${item.percent}%`,
              }"></span>
            </div>

            <small class="mt-[7px] text-[8px] text-slate-400">
              {{ item.day }}
            </small>
          </div>
        </div>
      </section>
    </div>

    <!-- SECOND ROW -->
    <div class="mb-[14px] grid grid-cols-3 gap-[14px] max-[1000px]:grid-cols-1">
      <!-- ESTADOS -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="mb-[18px] flex items-start justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              RESULTADOS
            </span>

            <h2 class="m-0 text-[15px] font-bold tracking-[-0.02em]">
              Estados de llamada
            </h2>
          </div>
        </div>

        <div class="flex flex-col gap-[17px]">
          <div v-for="result in callStates" :key="result.label">
            <div class="mb-[6px] flex justify-between text-[10px] text-slate-500">
              <span>
                {{ result.label }}
              </span>

              <strong class="text-slate-900">
                {{ result.value }}
              </strong>
            </div>

            <div class="h-[6px] overflow-hidden rounded-full bg-slate-100">
              <span class="block h-full rounded-full bg-[#2d8c4a]" :style="{
                width: `${result.percent}%`,
              }"></span>
            </div>
          </div>
        </div>
      </section>

      <!-- PROCESOS -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="mb-[18px] flex items-start justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              PROCESOS
            </span>

            <h2 class="m-0 text-[15px] font-bold tracking-[-0.02em]">
              Rendimiento
            </h2>
          </div>
        </div>

        <div class="flex flex-col gap-[15px]">
          <div class="flex justify-between text-[10px] text-slate-500">
            <span>Progresivo</span>
            <strong class="text-slate-900">1,620</strong>
          </div>

          <div class="flex justify-between text-[10px] text-slate-500">
            <span>Predictivo</span>
            <strong class="text-slate-900">1,220</strong>
          </div>

          <div class="flex justify-between text-[10px] text-slate-500">
            <span>Contactos efectivos</span>
            <strong class="text-slate-900">1,426</strong>
          </div>

          <div class="flex justify-between text-[10px] text-slate-500">
            <span>Conversaciones</span>
            <strong class="text-slate-900">986</strong>
          </div>
        </div>
      </section>

      <!-- ASESORES -->
      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[19px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="mb-[18px] flex items-start justify-between">
          <div>
            <span class="mb-1 block text-[9px] font-bold tracking-[0.14em] text-slate-400">
              ASESORES
            </span>

            <h2 class="m-0 text-[15px] font-bold tracking-[-0.02em]">
              Productividad
            </h2>
          </div>
        </div>

        <div class="flex flex-col">
          <div v-for="(advisor, index) in advisors" :key="advisor.name"
            class="grid grid-cols-[22px_32px_1fr_auto] items-center gap-2 border-b border-slate-100 py-[10px] last:border-b-0">
            <span class="text-[9px] text-slate-400">
              {{ String(index + 1).padStart(2, '0') }}
            </span>

            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(45,140,74,0.1)] text-[9px] font-bold text-[#2d8c4a]">
              {{ advisor.initials }}
            </div>

            <div class="flex flex-col">
              <strong class="text-[10px] text-slate-700">
                {{ advisor.name }}
              </strong>

              <span class="mt-[2px] text-[8px] text-slate-400">
                {{ advisor.calls }} llamadas
              </span>
            </div>

            <strong class="text-[11px] text-[#2d8c4a]">
              {{ advisor.contactRate }}%
            </strong>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script src="./DashboardContactabilidad.ts" lang="ts"></script>