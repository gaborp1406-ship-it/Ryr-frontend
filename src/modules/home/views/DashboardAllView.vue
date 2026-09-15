<template>
  <div class="min-h-full bg-[#f8faf9] p-6 font-sans text-[#0a0a0a] max-[650px]:p-[15px]">
    <!-- HEADER -->
    <div class="mb-5 flex items-end justify-between gap-5 max-[650px]:flex-col max-[650px]:items-start">
      <h1 class="m-0 text-[27px] font-bold leading-none tracking-[-0.04em] text-[#0a0a0a]">
        {{ tituloActivo }}
      </h1>
    </div>
    <!-- ================================================= -->
    <!-- FILTRO DE FECHAS + ASESOR -->
    <!-- ================================================= -->
    <div
      class="mb-[18px] flex flex-wrap items-end gap-[10px] rounded-[16px] border border-slate-200 bg-white p-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
      <!-- FECHA INICIO -->
      <div class="flex min-w-[170px] flex-col gap-[5px]">
      <label class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
  Fecha inicio
</label>

       <input v-model="fechaInicio" type="date"
  class="h-[40px] rounded-[9px] border border-slate-200 bg-slate-50 px-[10px] text-[13px] font-medium text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:bg-white focus:ring-1 focus:ring-[#2d8c4a]/20" />
      </div>

      <!-- FECHA FIN -->
      <div class="flex min-w-[170px] flex-col gap-[5px]">
        <label class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          Fecha fin
        </label>

        <input v-model="fechaFin" type="date"
          class="h-[36px] rounded-[9px] border border-slate-200 bg-slate-50 px-[10px] text-[11px] font-medium text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:bg-white focus:ring-1 focus:ring-[#2d8c4a]/20" />
      </div>

      <!-- ASESOR -->
      <div v-if="!esAgent" class="flex min-w-[190px] flex-col gap-[5px]">
        <label class="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
          Asesor
        </label>

  <select v-model="idAsesor" :disabled="cargandoAsesores"
  class="h-[40px] rounded-[9px] border border-slate-200 bg-slate-50 px-[10px] text-[13px] font-medium text-slate-700 outline-none transition focus:border-[#2d8c4a] focus:bg-white focus:ring-1 focus:ring-[#2d8c4a]/20 disabled:cursor-not-allowed disabled:opacity-60"
  @change="aplicarFiltroFechas">
          <option value="">
            {{ cargandoAsesores ? 'Cargando asesores...' : 'Todos los asesores' }}
          </option>

          <option v-for="asesor in asesores" :key="asesor.id_asesor" :value="String(asesor.id_asesor)">
            {{ asesor.asesor }}
          </option>
        </select>
      </div>

      <!-- APLICAR -->
     <button type="button" :disabled="cargando"
  class="flex h-[40px] items-center gap-[7px] rounded-[9px] bg-[#2d8c4a] px-[15px] text-[12px] font-bold text-white shadow-[0_3px_10px_rgba(45,140,74,0.2)] transition hover:bg-[#24763d] disabled:cursor-not-allowed disabled:opacity-60"
  @click="aplicarFiltroFechas">
        <svg viewBox="0 0 24 24" fill="none" class="h-[14px] w-[14px]">
          <path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>

        {{ cargando ? 'Cargando...' : 'Aplicar' }}
      </button>

      <!-- LIMPIAR -->
 <button type="button" :disabled="cargando || (!fechaInicio && !fechaFin && (!esAgent && !idAsesor))"
  class="flex h-[40px] items-center rounded-[9px] border border-slate-200 bg-white px-[13px] text-[12px] font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
  @click="limpiarFiltroFechas">
        Limpiar
      </button>
    </div>

    <!-- TABS -->
    <div class="mb-[18px]">
      <div
        class="inline-flex gap-[3px] rounded-[14px] border border-slate-200 bg-white p-1 shadow-[0_2px_8px_rgba(15,23,42,0.03)] max-[650px]:flex max-[650px]:w-full max-[650px]:overflow-x-auto">
        <button v-for="tab in tabs" :key="tab.id" type="button"
          class="flex h-9 shrink-0 items-center gap-2 rounded-[10px] border-0 bg-transparent px-[15px] text-[11px] font-semibold text-slate-500 transition-all duration-200 hover:bg-[#f1f5f3] hover:text-[#0a0a0a]"
          :class="activeTab === tab.id
            ? 'bg-[#2d8c4a] text-[#0a0a0a] shadow-[0_3px_10px_rgba(45,140,74,0.25)] hover:bg-[#2d8c4a] hover:text-[#0a0a0a]'
            : ''
            " @click="activeTab = tab.id">
          <!-- GENERAL -->
          <svg v-if="tab.id === 'general'" viewBox="0 0 24 24" fill="none" class="h-[15px] w-[15px]">
            <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.8" />
            <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.8" />
            <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.8" />
            <rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.8" />
          </svg>

          <!-- COMERCIAL -->
          <svg v-else-if="tab.id === 'comercial'" viewBox="0 0 24 24" fill="none" class="h-[15px] w-[15px]">
            <path d="M4 19V10M10 19V5M16 19v-8M22 19V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>

          <!-- CONTACTABILIDAD -->
          <svg v-else-if="tab.id === 'contactabilidad'" viewBox="0 0 24 24" fill="none" class="h-[15px] w-[15px]">
            <path
              d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.9 8.9 0 0 1-4.1-1L3 20l1.8-4.5A8.2 8.2 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"
              stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
          </svg>

          <!-- CIERRES -->
          <svg v-else viewBox="0 0 24 24" fill="none" class="h-[15px] w-[15px]">
            <path d="M12 3v18M17 7.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3"
              stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>

          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>


    <!-- ================================================= -->
    <!-- GENERAL -->
    <!-- ================================================= -->
    <template v-if="activeTab === 'general'">

      <!-- KPIs -->
      <div class="mb-[14px] grid grid-cols-3 gap-[14px] max-[900px]:grid-cols-2 max-[650px]:grid-cols-1">
        <div v-for="card in kpis" :key="card.label"
          class="min-h-[155px] rounded-[18px] border border-slate-200 bg-white p-[18px] shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(15,23,42,0.07)]">
          <div class="flex items-center justify-between">
            <div class="flex h-[40px] w-[40px] items-center justify-center rounded-[11px]" :class="{
              'bg-[rgba(45,140,74,0.1)] text-[#2d8c4a]': card.colorClass === 'kpi-green',
              'bg-slate-100 text-[#0a0a0a]': card.colorClass === 'kpi-black',
              'bg-orange-50 text-orange-600': card.colorClass === 'kpi-orange',
            }">
              <svg v-if="card.icon === 'users'" viewBox="0 0 24 24" fill="none" class="h-[21px] w-[21px]">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" />
              </svg>
              <svg v-else-if="card.icon === 'target'" viewBox="0 0 24 24" fill="none" class="h-[21px] w-[21px]">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" class="h-[21px] w-[21px]">
                <path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>


          </div>

          <div class="mt-[14px] flex flex-col">
            <span class="text-[13px] font-medium text-slate-500">{{ card.label }}</span>
            <strong class="mt-[3px] text-[34px] font-bold leading-none tracking-[-0.04em]">{{ card.value }}</strong>
          </div>

        </div>
      </div>

      <!-- LEADS POR ETAPA (ancho completo: 8 etapas necesitan espacio) -->
      <section
        class="mb-[14px] min-w-0 rounded-[18px] border border-slate-200 bg-white p-[20px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
        <div class="mb-[20px] flex items-center gap-[10px]">
          <div class="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-[#2d8c4a]">
            <svg viewBox="0 0 24 24" fill="none" class="h-[22px] w-[22px] text-white">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" />
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" />
            </svg>
          </div>
          <h2 class="m-0 text-[16px] font-bold tracking-[-0.02em]">Leads por etapa</h2>
        </div>

        <div class="grid grid-cols-2 gap-x-[30px] gap-y-[16px] max-[900px]:grid-cols-1">
          <div v-for="etapa in leadsPorEtapa" :key="etapa.id" class="flex items-center gap-[10px]">
            <div class="w-[150px] shrink-0">
              <span class="text-[12px] font-medium text-slate-500">{{ etapa.nombre }}</span>
            </div>
            <div class="relative h-[30px] flex-1 rounded-[4px] bg-slate-100">
              <div class="h-full rounded-[4px] transition-all duration-500"
                :style="{ width: `${getPorcentajeEtapa(etapa.valor)}%`, backgroundColor: etapa.color }"></div>
            </div>
            <div class="w-[40px] shrink-0 text-right">
              <strong class="text-[13px] font-bold text-slate-700">{{ etapa.valor }}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- CANDIDATOS + DESISTIDOS (PASTEL) + 4 GRÁFICOS DE ACTIVIDADES: todas las cards al mismo tamaño -->
      <div class="grid grid-cols-2 gap-[14px] max-[900px]:grid-cols-1">

        <!-- CANDIDATOS -->
        <section
          class="min-w-0 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.035)]">
          <div class="flex h-[52px] items-center gap-[9px] bg-[#0a0a0a] px-[20px]">
            <div class="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#2d8c4a]">
              <svg viewBox="0 0 24 24" fill="none" class="h-[18px] w-[18px] text-white">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" />
              </svg>
            </div>
            <span class="text-[14px] font-bold text-white">Leads</span>
          </div>

          <div class="p-[20px]">
            <div class="mb-[16px] flex items-center gap-[8px]">
              <span class="w-[85px] shrink-0 text-[12px] font-medium text-slate-500">Atendidos</span>
              <div class="relative h-[30px] flex-1 rounded-[4px] bg-slate-100">
                <div class="h-full rounded-[4px] bg-[#2d8c4a] transition-all duration-500"
                  :style="{ width: `${getPorcentajeCandidatos(candidatos.atendidos)}%` }"></div>
              </div>
              <strong class="w-[28px] shrink-0 text-right text-[13px] font-bold text-slate-700">{{ candidatos.atendidos
              }}</strong>
            </div>

            <div class="mb-[8px] flex items-center gap-[8px]">
              <span class="w-[85px] shrink-0 text-[12px] font-medium text-slate-500">Sin atender</span>
              <div class="relative h-[30px] flex-1 rounded-[4px] bg-slate-100">
                <div class="h-full rounded-[4px] bg-[rgba(45,140,74,0.25)] transition-all duration-500"
                  :style="{ width: `${getPorcentajeCandidatos(candidatos.sinAtender)}%` }"></div>
              </div>
              <strong class="w-[28px] shrink-0 text-right text-[13px] font-bold text-slate-700">{{ candidatos.sinAtender
              }}</strong>
            </div>

            <div class="ml-[93px] mr-[10px] flex justify-between text-[11px] text-slate-400">
              <span v-for="mark in candidatosEscala" :key="mark">{{ mark }}</span>
            </div>
          </div>
        </section>

        <!-- DESISTIDOS: GRÁFICO DE PASTEL -->
        <!-- DESISTIDOS: GRÁFICO DE BARRAS -->
        <section
          class="min-w-0 rounded-[18px] border border-slate-200 bg-white p-[20px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">

          <!-- HEADER -->
          <div class="mb-[15px] flex items-start justify-between gap-[10px]">
            <div>
              <span class="mb-[4px] block text-[11px] font-bold tracking-[0.13em] text-[#2d8c4a]">
                DESISTIDOS
              </span>

              <h2 class="m-0 text-[18px] font-bold tracking-[-0.02em]">
                Motivos de desistimiento
              </h2>
            </div>

            <!-- TABS -->
            <div class="flex rounded-lg bg-slate-100 p-[3px]">
              <button type="button" class="rounded-md px-[10px] py-[6px] text-[11px] font-bold transition" :class="desistimientoEtapa === 3
                ? 'bg-white text-[#2d8c4a] shadow-sm'
                : 'text-slate-400'
                " @click="cambiarEtapaDesistimiento(3)">
                Candidatos
              </button>

              <button type="button" class="rounded-md px-[10px] py-[6px] text-[11px] font-bold transition" :class="desistimientoEtapa === 8
                ? 'bg-white text-[#2d8c4a] shadow-sm'
                : 'text-slate-400'
                " @click="cambiarEtapaDesistimiento(8)">
                Oportunidad
              </button>
            </div>
          </div>

          <!-- TOTAL -->
          <div class="mb-[17px] flex items-center justify-between">
            <span class="text-[12px] text-slate-400">
              Total desistimientos
            </span>

            <strong class="text-[24px] font-bold text-[#0a0a0a]">
              {{ totalDesistimientos }}
            </strong>
          </div>

          <!-- BARRAS -->
          <div v-if="desistimientosFiltrados.length" class="space-y-[14px]">

            <div v-for="motivo in desistimientosFiltrados"
              :key="`${motivo.id_etapa}-${motivo.motivo}-${motivo.motivo_nombre}`" class="flex items-center gap-[10px]">

              <!-- MOTIVO -->
              <div class="w-[125px] shrink-0">
                <span class="block truncate text-[12px] font-medium text-slate-500" :title="motivo.motivo_nombre">
                  {{ motivo.motivo_nombre }}
                </span>
              </div>

              <!-- BARRA -->
              <div class="relative h-[30px] flex-1 overflow-hidden rounded-[5px] bg-slate-100">

                <div class="h-full rounded-[5px] bg-[#2d8c4a] transition-all duration-500" :style="{
                  width: `${getPorcentajeDesistimiento(Number(motivo.cantidad))}%`
                }">
                </div>

                <!-- PORCENTAJE DENTRO DE LA BARRA -->
                <span v-if="Number(motivo.cantidad) > 0"
                  class="absolute inset-y-0 left-[8px] flex items-center text-[11px] font-bold" :class="getPorcentajeDesistimiento(Number(motivo.cantidad)) > 15
                    ? 'text-white'
                    : 'text-slate-500'
                    ">
                  {{ getPorcentajeDesistimiento(Number(motivo.cantidad)).toFixed(0) }}%
                </span>
              </div>

              <!-- CANTIDAD -->
              <strong class="w-[38px] shrink-0 text-right text-[14px] font-bold text-slate-900">
                {{ motivo.cantidad }}
              </strong>
            </div>

          </div>

          <!-- SIN DATOS -->
          <div v-else class="flex h-[170px] items-center justify-center">
            <span class="text-[13px] text-slate-400">
              No hay desistimientos registrados
            </span>
          </div>

        </section>

        <!-- ENCABEZADO ACTIVIDADES (ocupa el ancho completo) -->


        <!-- 4 GRÁFICOS DE ACTIVIDADES: mismas clases que Candidatos/Desistidos -->
        <section v-for="grafico in actividadesGraficos" :key="grafico.key"
          class="min-w-0 overflow-hidden rounded-[18px] border border-slate-200 bg-white p-[20px] shadow-[0_2px_10px_rgba(15,23,42,0.035)]">

          <!-- HEADER -->
          <div class="mb-[6px] flex items-center gap-[10px]">

            <!-- ICONO -->
            <div class="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full" :style="{
              backgroundColor: `${grafico.color}18`,
              color: grafico.color
            }">

              <!-- CALENDARIO -->
              <svg v-if="
                grafico.key === 'visitas_pendientes' ||
                grafico.key === 'visitas_realizadas'
              " viewBox="0 0 24 24" fill="none" class="h-[20px] w-[20px]">
                <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" stroke-width="1.8" />

                <path d="M16 2v4M8 2v4M3 9h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />

                <path d="M8 13h2M14 13h2M8 17h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>

              <!-- VIDEOLLAMADA -->
              <svg v-else viewBox="0 0 24 24" fill="none" class="h-[20px] w-[20px]">
                <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.8" />

                <path d="m16 10 5-3v10l-5-3" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
              </svg>

            </div>

            <div class="min-w-0">

              <h3 class="m-0 text-[14px] font-bold text-slate-800">
                {{ grafico.titulo }}
              </h3>

              <span class="text-[11px] text-slate-400">
                {{ grafico.subtitulo }}
              </span>

            </div>

          </div>

          <!-- GRÁFICO -->
          <div class="relative mt-[6px]">
            <!-- SVG -->
            <div class="ml-[20px]">
<svg viewBox="0 0 300 105" preserveAspectRatio="none" class="h-[130px] w-full">

  <!-- LÍNEAS DE REFERENCIA -->
  <line v-for="(valor, index) in obtenerEscalaActividad(grafico.tipo, grafico.estado)"
    :key="`line-${grafico.key}-${valor}`"
    x1="0" x2="300"
    :y1="22 + index * (73 / Math.max(obtenerEscalaActividad(grafico.tipo, grafico.estado).length - 1, 1))"
    :y2="22 + index * (73 / Math.max(obtenerEscalaActividad(grafico.tipo, grafico.estado).length - 1, 1))"
    stroke="#e5e7eb" stroke-width="1" />

  <!-- LÍNEA DEL GRÁFICO -->
  <polyline :points="obtenerPuntosActividad(grafico.tipo, grafico.estado)"
    fill="none" :stroke="grafico.color" stroke-width="2.5"
    stroke-linecap="round" stroke-linejoin="round" />

  <!-- PUNTOS + NÚMERO ARRIBA -->
  <g v-for="(punto, index) in obtenerPuntosCirculosActividad(grafico.tipo, grafico.estado)" :key="index">
    <circle :cx="punto.x" :cy="punto.y" r="4" :fill="grafico.color"
      class="cursor-pointer transition-all duration-150 hover:opacity-80">
      <title>{{ punto.dia }}: {{ punto.cantidad }}</title>
    </circle>

    <text :x="punto.x" :y="punto.y - 10"
      text-anchor="middle" font-size="10" font-weight="700"
      :fill="grafico.color">
      {{ punto.cantidad }}
    </text>
  </g>

</svg>

              <!-- DÍAS -->

              <div class="grid grid-flow-col auto-cols-fr">

                <span v-for="dato in obtenerDatosActividad(
                  grafico.tipo,
                  grafico.estado
                )" :key="`${grafico.key}-${dato.fecha}`"
                  class="truncate text-center text-[11px] font-medium text-slate-500">
                  {{ dato.dia_semana }}
                </span>

              </div>

            </div>

          </div>

        </section>
      </div>
    </template>

    <!-- ================================================= -->
    <!-- COMERCIAL -->
    <!-- ================================================= -->
    <DashboardComercial v-else-if="activeTab === 'comercial'" :fecha-inicio="fechaInicio" :fecha-fin="fechaFin"
      :id-asesor="idAsesorNumerico" />
    <!-- ================================================= -->
    <!-- CONTACTABILIDAD -->
    <!-- ================================================= -->
    <DashboardContactabilidad v-else-if="activeTab === 'contactabilidad'" :fecha-inicio="fechaInicio"
      :fecha-fin="fechaFin" :id-asesor="idAsesorNumerico" />

    <!-- ================================================= -->
    <!-- CIERRES -->
    <!-- ================================================= -->
    <DashboardCierre v-else-if="activeTab === 'cierres'" :fecha-inicio="fechaInicio" :fecha-fin="fechaFin"
      :id-asesor="idAsesorNumerico" />
  </div>
</template>

<script src="./DashboardAllView.ts" lang="ts"></script>