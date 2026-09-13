<template>
  <div class="min-h-full bg-[#f8faf9] p-6 font-sans text-[#0a0a0a] max-[700px]:p-[15px]">

    <!-- ERROR -->
    <div v-if="error"
      class="mb-[14px] flex items-center justify-between rounded-[14px] border border-red-100 bg-red-50 px-4 py-3">
      <span class="text-[13px] text-red-600">
        {{ error }}
      </span>

      <button type="button" class="rounded-lg bg-red-600 px-3 py-1.5 text-[12px] font-semibold text-white"
        @click="cargarDashboard">
        Reintentar
      </button>
    </div>


    <!-- ======================================================= -->
    <!-- FILA SUPERIOR -->
    <!-- ======================================================= -->

    <div
      class="mb-[14px] grid grid-cols-[0.72fr_1fr_1.15fr_1fr] gap-[14px] max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">

      <!-- ===================================================== -->
      <!-- KPI TOTAL -->
      <!-- ===================================================== -->

      <section
        class="relative min-h-[170px] overflow-hidden rounded-[18px] border border-slate-200 bg-white p-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">

        <!-- decoración -->
        <div class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#2d8c4a]/[0.06]"></div>

        <!-- SKELETON -->
        <div v-if="cargando" class="relative flex flex-col gap-[10px]">
          <div class="skeleton h-[38px] w-[38px] rounded-[11px]"></div>

          <div class="mt-[12px] flex flex-col gap-[7px]">
            <span class="skeleton h-[11px] w-[65%] rounded-full"></span>
            <span class="skeleton h-[34px] w-[45%] rounded-[6px]"></span>
          </div>

          <span class="skeleton mt-[8px] h-[9px] w-[75%] rounded-full"></span>
        </div>

        <!-- CONTENIDO REAL -->
        <div v-else class="relative animate-[fadeIn_0.35s_ease]">

          <div class="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-[#2d8c4a]/10 text-[#2d8c4a]">
            <svg viewBox="0 0 24 24" fill="none" class="h-[19px] w-[19px]">
              <path d="M4 5h16v14H4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />

              <path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </div>


          <div class="mt-[22px] flex flex-col">

            <span class="text-[12px] text-slate-500">
              Leads en etapa de
            </span>

            <span class="text-[12px] font-semibold text-slate-500">
              negociación
            </span>

            <strong class="mt-[3px] text-[36px] font-bold leading-none tracking-[-0.04em]">
              {{ totalLeads }}
            </strong>

          </div>


          <div class="mt-[13px] text-[10px] text-slate-400">
            Clientes activos en negociación
          </div>

        </div>
      </section>


      <!-- ===================================================== -->
      <!-- DISTRIBUCIÓN POR PROYECTO -->
      <!-- ===================================================== -->

      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">

        <div class="mb-[12px]">

          <span class="mb-1 block text-[11px] font-bold tracking-[0.12em] text-slate-400">
            DISTRIBUCIÓN
          </span>

          <h2 class="m-0 text-[16px] font-bold leading-tight tracking-[-0.02em]">
            Por proyecto
          </h2>

        </div>

        <!-- SKELETON -->
        <div v-if="cargando" class="flex items-center justify-center gap-[18px]">
          <div class="skeleton h-[120px] w-[120px] shrink-0 rounded-full"></div>

          <div class="flex min-w-0 flex-1 flex-col gap-[10px]">
            <div v-for="n in 5" :key="`proy-legend-skel-${n}`" class="flex items-center gap-[6px]">
              <span class="skeleton h-[8px] w-[8px] shrink-0 rounded-full"></span>
              <span class="skeleton h-[10px] w-[70%] rounded-full"></span>
            </div>
          </div>
        </div>

        <!-- CONTENIDO REAL -->
        <div v-else class="flex items-center justify-center gap-[18px] animate-[fadeIn_0.35s_ease]">

          <!-- DONUT -->
          <div class="relative h-[120px] w-[120px] shrink-0 rounded-full" :style="donutStyle">

            <div class="absolute inset-[26px] flex flex-col items-center justify-center rounded-full bg-white">

              <strong class="text-[24px] font-bold leading-none">
                {{ totalProyectos }}
              </strong>

              <span class="mt-[4px] text-[10px] text-slate-400">
                leads
              </span>

            </div>

          </div>


          <!-- LEYENDA -->
          <div class="flex min-w-0 flex-col gap-[9px]">

            <div v-for="(project, index) in proyectos.slice(0, 5)" :key="project.id_proyecto"
              class="flex items-center gap-[7px]">

              <span class="h-[8px] w-[8px] shrink-0 rounded-full" :style="{
                backgroundColor:
                  coloresDonut[index % coloresDonut.length],
              }"></span>

              <span class="max-w-[100px] truncate text-[10px] text-slate-500">
                {{ project.proyecto }}
              </span>

              <strong class="text-[10px] text-slate-800">
                {{ porcentajeProyecto(project.cantidad_leads_negociacion) }}%
              </strong>

            </div>

            <span v-if="!proyectos.length" class="text-[11px] text-slate-400">
              Sin datos
            </span>

          </div>

        </div>
      </section>


      <!-- ===================================================== -->
      <!-- LEADS POR EJECUTIVO -->
      <!-- ===================================================== -->

      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">

        <div class="mb-[13px] flex items-start justify-between">

          <div>

            <span class="mb-1 block text-[11px] font-bold tracking-[0.12em] text-slate-400">
              EJECUTIVOS
            </span>

            <h2 class="m-0 text-[16px] font-bold leading-tight tracking-[-0.02em]">
              Leads por ejecutivo
            </h2>

          </div>

          <span v-if="!cargando"
            class="rounded-full bg-[#2d8c4a]/10 px-[8px] py-[4px] text-[10px] font-bold text-[#2d8c4a]">
            {{ asesores.length }}
          </span>

          <span v-else class="skeleton h-[20px] w-[26px] rounded-full"></span>

        </div>

        <!-- SKELETON -->
        <div v-if="cargando" class="flex flex-col gap-[13px]">
          <div v-for="n in 5" :key="`ejec-skel-${n}`">
            <div class="mb-[5px] flex items-center justify-between">
              <span class="skeleton h-[10px] w-[55%] rounded-full"></span>
              <span class="skeleton h-[10px] w-[12%] rounded-full"></span>
            </div>
            <div class="skeleton h-[8px] w-full rounded-full"></div>
          </div>
        </div>

        <!-- CONTENIDO REAL -->
        <div v-else-if="asesores.length" class="flex flex-col gap-[12px]">

          <div v-for="advisor in asesores.slice(0, 5)" :key="advisor.id_asesor" class="animate-[fadeIn_0.35s_ease]">

            <div class="mb-[5px] flex items-center justify-between">

              <span class="max-w-[150px] truncate text-[10px] font-medium text-slate-600">
                {{ advisor.asesor }}
              </span>

              <strong class="text-[11px] text-slate-900">
                {{ advisor.cantidad_leads_negociacion }}
              </strong>

            </div>


            <div class="h-[8px] overflow-hidden rounded-full bg-slate-100">

              <span class="block h-full rounded-full bg-[#2d8c4a] transition-all duration-500" :style="{
                width: anchoBarraAsesor(
                  advisor.cantidad_leads_negociacion,
                ),
              }"></span>

            </div>

          </div>

        </div>


        <div v-else class="flex h-[100px] items-center justify-center text-[11px] text-slate-400">
          No hay ejecutivos con datos
        </div>

      </section>


      <!-- ===================================================== -->
      <!-- LEADS POR FUENTE -->
      <!-- ===================================================== -->

      <section
        class="rounded-[18px] border border-slate-200 bg-white p-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">

        <div class="mb-[13px] flex items-start justify-between">

          <div>

            <span class="mb-1 block text-[11px] font-bold tracking-[0.12em] text-slate-400">
              ORIGEN
            </span>

            <h2 class="m-0 text-[16px] font-bold leading-tight tracking-[-0.02em]">
              Leads por fuente
            </h2>

          </div>

        </div>

        <!-- SKELETON -->
        <div v-if="cargando" class="flex flex-col gap-[11px]">
          <div v-for="n in 6" :key="`fuente-skel-${n}`">
            <div class="mb-[5px] flex items-center justify-between">
              <span class="skeleton h-[10px] w-[50%] rounded-full"></span>
              <span class="skeleton h-[10px] w-[12%] rounded-full"></span>
            </div>
            <div class="skeleton h-[8px] w-full rounded-full"></div>
          </div>
        </div>

        <!-- CONTENIDO REAL -->
        <div v-else-if="fuentes.length" class="flex flex-col gap-[10px]">

          <div v-for="source in fuentes.slice(0, 6)" :key="source.id_fuente" class="animate-[fadeIn_0.35s_ease]">

            <div class="mb-[5px] flex items-center justify-between">

              <span class="max-w-[140px] truncate text-[10px] text-slate-500">
                {{ source.fuente }}
              </span>

              <strong class="text-[11px] text-slate-900">
                {{ source.cantidad_leads_negociacion }}
              </strong>

            </div>


            <div class="h-[8px] overflow-hidden rounded-full bg-slate-100">

              <span class="block h-full rounded-full bg-[#0a0a0a] transition-all duration-500" :style="{
                width: anchoBarraFuente(
                  source.cantidad_leads_negociacion,
                ),
              }"></span>

            </div>

          </div>

        </div>


        <div v-else class="flex h-[100px] items-center justify-center text-[11px] text-slate-400">
          No hay fuentes con datos
        </div>

      </section>

    </div>


    <!-- ======================================================= -->
    <!-- TABLA PIPELINE -->
    <!-- ======================================================= -->

    <section
      class="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.035)]">

      <!-- HEADER -->
      <div class="flex items-center justify-between gap-4 px-[19px] pb-[14px] pt-[18px]">

        <div>

          <span class="mb-1 block text-[11px] font-bold tracking-[0.14em] text-slate-400">
            PIPELINE
          </span>

          <h2 class="m-0 text-[17px] font-bold leading-tight tracking-[-0.02em]">
            Clientes Activos en Negociación
          </h2>

        </div>


        <div class="flex items-center gap-2">

          <span v-if="!cargando"
            class="rounded-full bg-[#2d8c4a]/10 px-[10px] py-[5px] text-[11px] font-bold text-[#2d8c4a]">
            {{ cantidadLeadsMostrados }} leads
          </span>

          <span v-else class="skeleton h-[26px] w-[70px] rounded-full"></span>

        </div>

      </div>


      <!-- ===================================================== -->
      <!-- SKELETON TABLA -->
      <!-- ===================================================== -->

      <div v-if="cargando" class="overflow-x-auto">
        <table class="w-full min-w-[900px] border-collapse">
          <thead>
            <tr class="bg-[#050505] text-left">
              <th
                v-for="col in ['Lead ID', 'Ejecutivo', 'Nombre Cliente', 'Fuente', 'Proyecto', 'Etapa', 'Fecha Ingreso']"
                :key="col" class="px-[14px] py-[10px] text-[10px] font-bold tracking-wide text-white">
                {{ col }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="n in 6" :key="`row-skel-${n}`" class="border-b border-slate-100 last:border-b-0"
              :class="n % 2 === 0 ? 'bg-[#f5f5f5]' : 'bg-white'">
              <td class="px-[14px] py-[12px]"><span class="skeleton h-[10px] w-[55px] rounded-full"></span></td>
              <td class="px-[14px] py-[12px]">
                <div class="flex items-center gap-[7px]">
                  <span class="skeleton h-[27px] w-[27px] shrink-0 rounded-full"></span>
                  <span class="skeleton h-[10px] w-[80px] rounded-full"></span>
                </div>
              </td>
              <td class="px-[14px] py-[12px]"><span class="skeleton h-[10px] w-[110px] rounded-full"></span></td>
              <td class="px-[14px] py-[12px]"><span class="skeleton h-[18px] w-[65px] rounded-md"></span></td>
              <td class="px-[14px] py-[12px]"><span class="skeleton h-[10px] w-[90px] rounded-full"></span></td>
              <td class="px-[14px] py-[12px]"><span class="skeleton h-[18px] w-[85px] rounded-full"></span></td>
              <td class="px-[14px] py-[12px]"><span class="skeleton h-[10px] w-[75px] rounded-full"></span></td>
            </tr>
          </tbody>
        </table>
      </div>


      <!-- ===================================================== -->
      <!-- TABLA REAL -->
      <!-- ===================================================== -->

      <div v-else-if="leads.length" class="overflow-x-auto animate-[fadeIn_0.35s_ease]">

        <table class="w-full min-w-[900px] border-collapse">

          <thead>

            <tr class="bg-[#050505] text-left">

              <th class="px-[14px] py-[10px] text-[10px] font-bold tracking-wide text-white">
                Lead ID
              </th>

              <th class="px-[14px] py-[10px] text-[10px] font-bold tracking-wide text-white">
                Ejecutivo
              </th>

              <th class="px-[14px] py-[10px] text-[10px] font-bold tracking-wide text-white">
                Nombre Cliente
              </th>

              <th class="px-[14px] py-[10px] text-[10px] font-bold tracking-wide text-white">
                Fuente
              </th>

              <th class="px-[14px] py-[10px] text-[10px] font-bold tracking-wide text-white">
                Proyecto
              </th>

              <th class="px-[14px] py-[10px] text-[10px] font-bold tracking-wide text-white">
                Etapa
              </th>

              <th class="px-[14px] py-[10px] text-[10px] font-bold tracking-wide text-white">
                Fecha Ingreso
              </th>

            </tr>

          </thead>


          <tbody>

            <tr v-for="(lead, index) in leads" :key="lead.id_lead" class="border-b border-slate-100 last:border-b-0"
              :class="index % 2 === 0
                ? 'bg-white'
                : 'bg-[#f5f5f5]'
                ">

              <!-- ID -->
              <td class="px-[14px] py-[11px] text-[11px] font-medium text-slate-600">
                L-{{ String(lead.id_lead).padStart(5, '0') }}
              </td>


              <!-- ASESOR -->
              <td class="px-[14px] py-[11px]">

                <div class="flex items-center gap-[8px]">

                  <div
                    class="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[#2d8c4a]/10 text-[10px] font-bold text-[#2d8c4a]">
                    {{ iniciales(lead.asesor) }}
                  </div>

                  <span class="max-w-[130px] truncate text-[11px] font-medium text-slate-700">
                    {{ lead.asesor || '-' }}
                  </span>

                </div>

              </td>


              <!-- CLIENTE -->
              <td class="max-w-[190px] px-[14px] py-[11px]">

                <span class="block truncate text-[11px] font-semibold text-slate-700">
                  {{ lead.nombre_cliente || '-' }}
                </span>

              </td>


              <!-- FUENTE -->
              <td class="px-[14px] py-[11px]">

                <span
                  class="inline-flex rounded-md bg-slate-100 px-[8px] py-[4px] text-[10px] font-medium text-slate-600">
                  {{ lead.fuente || '-' }}
                </span>

              </td>


              <!-- PROYECTO -->
              <td class="px-[14px] py-[11px] text-[11px] text-slate-600">
                {{ lead.proyecto || '-' }}
              </td>


              <!-- ETAPA -->
              <td class="px-[14px] py-[11px]">

                <span
                  class="inline-flex items-center gap-[6px] rounded-full bg-[#2d8c4a]/10 px-[9px] py-[5px] text-[10px] font-bold text-[#2d8c4a]">

                  <span class="h-[6px] w-[6px] rounded-full bg-[#2d8c4a]"></span>

                  Negociación

                </span>

              </td>


              <!-- FECHA -->
              <td class="px-[14px] py-[11px] text-[11px] text-slate-500">
                {{ formatearFecha(lead.fecha_creacion) }}
              </td>

            </tr>

          </tbody>

        </table>

      </div>


      <!-- ===================================================== -->
      <!-- SIN LEADS -->
      <!-- ===================================================== -->

      <div v-else class="flex min-h-[220px] flex-col items-center justify-center px-5">

        <div class="mb-3 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-slate-100 text-slate-400">

          <svg viewBox="0 0 24 24" fill="none" class="h-[22px] w-[22px]">

            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.7"
              stroke-linecap="round" />

            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.7" />

            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.7"
              stroke-linecap="round" />

          </svg>

        </div>


        <strong class="text-[13px] font-semibold text-slate-600">
          No hay leads en negociación
        </strong>


        <span class="mt-1 text-[11px] text-slate-400">
          No existen clientes activos en esta etapa
        </span>

      </div>

    </section>

  </div>
</template>

<script src="./DashboardCierre.ts" lang="ts"></script>

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