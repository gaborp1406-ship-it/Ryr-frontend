<template>
  <div class="p-6 space-y-5">

    <!-- ===================================================== -->
    <!-- LOADING -->
    <!-- ===================================================== -->
    <div v-if="cargando" class="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
      <div class="flex flex-col items-center justify-center gap-4 py-12">

        <div class="relative w-12 h-12">
          <div class="absolute inset-0 rounded-full border-4 border-slate-200"></div>

          <div
            class="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2d8c4a] border-r-[#2d8c4a] animate-spin">
          </div>
        </div>

        <p class="text-sm text-slate-500 font-medium">
          Cargando proceso de negociación...
        </p>

      </div>
    </div>

    <!-- ===================================================== -->
    <!-- ERROR -->
    <!-- ===================================================== -->
    <div v-if="errores && !cargando" class="bg-rose-50 border border-rose-200 rounded-2xl shadow-sm p-4">
      <div class="flex items-start gap-3">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>

        <div class="flex-1">

          <h3 class="text-sm font-semibold text-rose-900">
            Error
          </h3>

          <p class="text-sm text-rose-700 mt-1">
            {{ errores }}
          </p>

        </div>

      </div>
    </div>

    <!-- ===================================================== -->
    <!-- CONTENIDO PRINCIPAL -->
    <!-- ===================================================== -->
    <div v-if="!cargando" class="bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">

      <!-- ================================================= -->
      <!-- OVERLAY -->
      <!-- ================================================= -->
      <div v-if="actualizando"
        class="absolute inset-0 bg-white/60 backdrop-blur-sm z-30 flex items-center justify-center">
        <div class="flex flex-col items-center gap-3">

          <div class="relative w-9 h-9">

            <div class="absolute inset-0 rounded-full border-2 border-slate-200"></div>

            <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-[#2d8c4a] animate-spin">
            </div>

          </div>

          <p class="text-xs text-slate-500 font-medium">
            Actualizando...
          </p>

        </div>
      </div>

      <!-- ================================================= -->
      <!-- HEADER -->
      <!-- ================================================= -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">

        <div class="flex items-center gap-2">

          <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>

          <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Proceso de Negociación
          </h2>

        </div>

        <!-- CONTADOR -->
        <span v-if="tieneTipoCredito"
          class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {{ completados }}/{{ totalPasos }} completados
        </span>

        <!-- ESTADO INICIAL -->
        <span v-else class="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
          Selecciona el tipo de crédito
        </span>

      </div>

      <!-- ================================================= -->
      <!-- PROGRESO -->
      <!-- ================================================= -->
      <div class="px-6 pt-5">

        <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">

          <div class="h-full bg-[#2d8c4a] transition-all duration-300" :style="{ width: progreso + '%' }"></div>

        </div>

        <div class="flex justify-between mt-2">

          <span class="text-[11px] text-slate-400">
            Progreso del proceso
          </span>

          <span class="text-[11px] font-semibold text-slate-500">
            {{ progreso }}%
          </span>

        </div>

      </div>

      <!-- ================================================= -->
      <!-- CONTENIDO -->
      <!-- ================================================= -->
      <div class="px-6 py-6">

        <!-- ================================================= -->
        <!-- SELECCIÓN DE CRÉDITO -->
        <!-- ================================================= -->
        <div v-if="!tieneTipoCredito" class="rounded-2xl border border-slate-200 bg-slate-50 p-8">

          <div class="text-center mb-8">

            <div class="mx-auto w-14 h-14 rounded-2xl bg-[#2d8c4a]/10 flex items-center justify-center mb-4">

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                class="w-7 h-7 text-[#2d8c4a]">
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
                <path d="M9 21v-6h6v6" />
              </svg>

            </div>

            <h3 class="text-lg font-semibold text-slate-900">
              Selecciona el tipo de crédito
            </h3>

            <p class="text-sm text-slate-500 mt-2">
              Selecciona cómo será financiada la operación para continuar
              con el proceso de negociación.
            </p>

          </div>

          <!-- OPCIONES -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">

            <!-- ============================================= -->
            <!-- DIRECTO -->
            <!-- ============================================= -->
            <button type="button" @click="seleccionarTipoCredito(TIPOS_CREDITO.DIRECTO)"
              :disabled="guardandoTipoCredito || !puedeInteractuar"
              class="group relative p-6 rounded-2xl border border-slate-200 bg-white hover:border-[#2d8c4a] hover:shadow-md hover:bg-[#2d8c4a]/5 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed">

              <div class="flex items-start gap-4">

                <div
                  class="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-[#2d8c4a]/10 flex items-center justify-center shrink-0 transition-colors">

                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                    class="w-6 h-6 text-slate-600 group-hover:text-[#2d8c4a]">
                    <rect x="4" y="3" width="16" height="18" rx="2" />

                    <path d="M8 7h8M8 11h8M8 15h5" />
                  </svg>

                </div>

                <div>

                  <p class="text-base font-semibold text-slate-800">
                    Crédito Directo
                  </p>

                  <p class="text-sm text-slate-500 mt-1">
                    Financiamiento directo con el cliente.
                  </p>

                </div>

              </div>

              <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  class="w-5 h-5 text-[#2d8c4a]">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>

              </div>

            </button>

            <!-- ============================================= -->
            <!-- HIPOTECARIO -->
            <!-- ============================================= -->
            <button type="button" @click="seleccionarTipoCredito(TIPOS_CREDITO.HIPOTECARIO)"
              :disabled="guardandoTipoCredito || !puedeInteractuar"
              class="group relative p-6 rounded-2xl border border-slate-200 bg-white hover:border-[#2d8c4a] hover:shadow-md hover:bg-[#2d8c4a]/5 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed">

              <div class="flex items-start gap-4">

                <div class="w-12 h-12 rounded-xl bg-[#2d8c4a]/10 flex items-center justify-center shrink-0">

                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                    class="w-6 h-6 text-[#2d8c4a]">
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5 9.5V21h14V9.5" />
                    <path d="M9 21v-6h6v6" />
                  </svg>

                </div>

                <div>

                  <p class="text-base font-semibold text-slate-800">
                    Crédito Hipotecario
                  </p>

                  <p class="text-sm text-slate-500 mt-1">
                    Financiamiento mediante crédito hipotecario bancario.
                  </p>

                </div>

              </div>

              <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  class="w-5 h-5 text-[#2d8c4a]">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>

              </div>

            </button>

            <!-- ============================================= -->
            <!-- AL CONTADO -->
            <!-- ============================================= -->
            <button type="button" @click="seleccionarTipoCredito(TIPOS_CREDITO.CONTADO)"
              :disabled="guardandoTipoCredito || !puedeInteractuar"
              class="group relative p-6 rounded-2xl border border-slate-200 bg-white hover:border-[#2d8c4a] hover:shadow-md hover:bg-[#2d8c4a]/5 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed">

              <div class="flex items-start gap-4">

                <div
                  class="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-[#2d8c4a]/10 flex items-center justify-center shrink-0 transition-colors">

                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                    class="w-6 h-6 text-slate-600 group-hover:text-[#2d8c4a]">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2-1 1.7-2.5 2.7-2.5 1.6-2.5 2.8h5" />
                  </svg>

                </div>

                <div>

                  <p class="text-base font-semibold text-slate-800">
                    Al Contado
                  </p>

                  <p class="text-sm text-slate-500 mt-1">
                    Pago al contado, sin pasos adicionales.
                  </p>

                </div>

              </div>

              <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  class="w-5 h-5 text-[#2d8c4a]">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>

              </div>

            </button>

          </div>

        </div>

        <!-- ================================================= -->
        <!-- FLUJO -->
        <!-- ================================================= -->
        <template v-else>

          <!-- ================================================= -->
          <!-- TIPO DE CRÉDITO SELECCIONADO -->
          <!-- ================================================= -->
          <div class="flex items-center justify-between mb-5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">

            <div class="flex items-center gap-3">

              <div class="w-9 h-9 rounded-lg bg-[#2d8c4a]/10 flex items-center justify-center">

                <svg v-if="tipoCreditoSeleccionado === TIPOS_CREDITO.HIPOTECARIO" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8" class="w-5 h-5 text-[#2d8c4a]">
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5 9.5V21h14V9.5" />
                  <path d="M9 21v-6h6v6" />
                </svg>

                <svg v-else-if="tipoCreditoSeleccionado === TIPOS_CREDITO.CONTADO" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.8" class="w-5 h-5 text-[#2d8c4a]">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2-1 1.7-2.5 2.7-2.5 1.6-2.5 2.8h5" />
                </svg>

                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                  class="w-5 h-5 text-[#2d8c4a]">
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M8 7h8M8 11h8M8 15h5" />
                </svg>

              </div>

              <div>

                <p class="text-[11px] text-slate-400 uppercase tracking-wide">
                  Tipo de crédito
                </p>

                <p class="text-sm font-semibold text-slate-800">

                  {{
                    tipoCreditoSeleccionado === TIPOS_CREDITO.HIPOTECARIO
                      ? "Crédito Hipotecario"
                      : tipoCreditoSeleccionado === TIPOS_CREDITO.CONTADO
                        ? "Al Contado"
                        : "Crédito Directo"
                  }}

                </p>

              </div>

            </div>

            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2d8c4a]/10 text-[#2d8c4a]">
              Seleccionado
            </span>

          </div>

          <!-- ================================================= -->
          <!-- ================================================ -->
          <!-- FLUJO DIRECTO -->
          <!-- ================================================ -->
          <div v-if="tipoCreditoSeleccionado === TIPOS_CREDITO.DIRECTO" class="space-y-3">

            <!-- ============================================= -->
            <!-- PROFORMA -->
            <!-- ============================================= -->
            <button type="button" @click="completarProforma" :disabled="actualizando || !puedeInteractuar"
              class="w-full flex items-center gap-3 px-4 py-4 rounded-xl border transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              :class="proforma?.completado
                ? 'border-[#2d8c4a] bg-[#2d8c4a]/5'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                ">

              <span class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0" :class="proforma?.completado
                ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                : 'border-slate-300'
                ">

                <svg v-if="proforma?.completado" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
                  class="w-3 h-3">
                  <path d="M20 6 9 17l-5-5" />
                </svg>

              </span>

              <div class="flex-1">

                <p class="text-sm font-medium" :class="proforma?.completado
                  ? 'text-[#2d8c4a]'
                  : 'text-slate-700'
                  ">
                  Proforma enviada al cliente
                </p>


              </div>

              <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                Paso 1
              </span>

            </button>

            <!-- ============================================= -->
            <!-- RESULTADO DIRECTO -->
            <!-- ============================================= -->
            <div class="rounded-xl border border-slate-200 overflow-hidden" :class="{
              'opacity-50': !proforma?.completado
            }">

              <div class="px-4 py-3 bg-slate-50 border-b border-slate-100">

                <div class="flex items-center gap-3">

                  <span class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0" :class="proforma?.completado
                    ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                    : 'border-slate-300 bg-white'
                    ">

                    <svg v-if="proforma?.completado" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
                      class="w-3 h-3">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>

                  </span>

                  <div>

                    <p class="text-sm font-semibold text-slate-700">
                      Resultado de la proforma
                    </p>

                    <p class="text-xs text-slate-400 mt-0.5">
                      Selecciona la respuesta del cliente
                    </p>

                  </div>

                </div>

              </div>

              <div v-if="proforma?.completado" class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

                <!-- DE ACUERDO -->
                <button type="button" :disabled="actualizando || !puedeInteractuar"
                  @click="actualizarCampo('proforma_enviada_decuerdo', true)"
                  class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all disabled:opacity-50"
                  :class="checklistData?.proforma_enviada_decuerdo
                    ? 'border-[#2d8c4a] bg-[#2d8c4a]/5 text-[#2d8c4a]'
                    : 'border-slate-200 text-slate-600 hover:border-[#2d8c4a] hover:bg-[#2d8c4a]/5'
                    ">

                  <span class="w-4 h-4 rounded-full border flex items-center justify-center" :class="checklistData?.proforma_enviada_decuerdo
                    ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                    : 'border-slate-300'
                    ">

                    <svg v-if="checklistData?.proforma_enviada_decuerdo" viewBox="0 0 24 24" fill="none" stroke="white"
                      stroke-width="3" class="w-2.5 h-2.5">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>

                  </span>

                  De acuerdo

                </button>

                <!-- DESACUERDO -->
                <button type="button" :disabled="actualizando || !puedeInteractuar"
                  @click="actualizarCampo('proforma_enviada_descuerdo', true)"
                  class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all disabled:opacity-50"
                  :class="checklistData?.proforma_enviada_descuerdo
                    ? 'border-rose-400 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50'
                    ">

                  <span class="w-4 h-4 rounded-full border flex items-center justify-center" :class="checklistData?.proforma_enviada_descuerdo
                    ? 'border-rose-500 bg-rose-500'
                    : 'border-slate-300'
                    ">

                    <svg v-if="checklistData?.proforma_enviada_descuerdo" viewBox="0 0 24 24" fill="none" stroke="white"
                      stroke-width="3" class="w-2.5 h-2.5">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>

                  </span>

                  Desacuerdo

                </button>

              </div>

            </div>

          </div>

          <!-- ================================================= -->
          <!-- ================================================ -->
          <!-- FLUJO HIPOTECARIO -->
          <!-- ================================================ -->
          <div v-else-if="tipoCreditoSeleccionado === TIPOS_CREDITO.HIPOTECARIO" class="space-y-3">

            <!-- ============================================= -->
            <!-- 1. PROFORMA -->
            <!-- ============================================= -->
            <button type="button" @click="completarProforma" :disabled="actualizando || !puedeInteractuar"
              class="w-full flex items-center gap-3 px-4 py-4 rounded-xl border transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              :class="proforma?.completado
                ? 'border-[#2d8c4a] bg-[#2d8c4a]/5'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                ">

              <span class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0" :class="proforma?.completado
                ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                : 'border-slate-300'
                ">

                <svg v-if="proforma?.completado" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
                  class="w-3 h-3">
                  <path d="M20 6 9 17l-5-5" />
                </svg>

              </span>

              <div class="flex-1">

                <p class="text-sm font-medium" :class="proforma?.completado
                  ? 'text-[#2d8c4a]'
                  : 'text-slate-700'
                  ">
                  Proforma enviada al cliente
                </p>


              </div>

              <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                Paso 1
              </span>

            </button>

            <!-- ============================================= -->
            <!-- 2. APROBACIÓN BANCARIA -->
            <!-- ============================================= -->
            <div class="rounded-xl border border-slate-200 overflow-hidden" :class="{
              'opacity-50': aprobacionBancaria?.bloqueado
            }">

              <!-- CABECERA -->
              <div class="flex items-center gap-3 px-4 py-4" :class="aprobacionBancaria?.completado
                ? 'bg-[#2d8c4a]/5'
                : 'bg-slate-50'
                ">

                <span class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0" :class="aprobacionBancaria?.completado
                  ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                  : 'border-slate-300 bg-white'
                  ">

                  <svg v-if="aprobacionBancaria?.completado" viewBox="0 0 24 24" fill="none" stroke="white"
                    stroke-width="3" class="w-3 h-3">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>

                </span>

                <div class="flex-1">

                  <p class="text-sm font-semibold" :class="aprobacionBancaria?.completado
                    ? 'text-[#2d8c4a]'
                    : 'text-slate-700'
                    ">
                    Aprobación bancaria
                  </p>

                </div>

                <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Paso 2
                </span>

              </div>

              <!-- SUBPASOS -->
              <div v-if="!aprobacionBancaria?.bloqueado" class="p-4 space-y-3">

                <!-- ========================================= -->
                <!-- PRECALIFICACIÓN -->
                <!-- ========================================= -->
                <div class="rounded-xl border transition-all" :class="precalificacion?.completado
                  ? 'border-[#2d8c4a] bg-[#2d8c4a]/5'
                  : 'border-slate-200'
                  ">

                  <div class="flex items-center gap-3 px-4 py-3">
                    <!-- ESTADO PRECALIFICACIÓN -->
                    <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0" :class="precalificacion?.completado
                      ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                      : 'border-slate-300 bg-white'
                      ">
                      <svg v-if="precalificacion?.completado" viewBox="0 0 24 24" fill="none" stroke="white"
                        stroke-width="3" class="w-2.5 h-2.5">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>

                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium" :class="precalificacion?.completado
                        ? 'text-[#2d8c4a]'
                        : 'text-slate-700'
                        ">
                        Precalificación
                      </p>

                      <p class="text-xs text-slate-400 mt-0.5">
                        {{
                          precalificacion?.completado
                            ? "Documento cargado"
                            : "Sube el documento para completar este paso"
                        }}
                      </p>
                    </div>

                    <!-- DOCUMENTO -->
                    <div class="flex items-center gap-2 shrink-0">
                      <a v-if="checklistData?.url_precalificacion" :href="checklistData.url_precalificacion"
                        target="_blank" rel="noopener noreferrer"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#2d8c4a] hover:bg-[#2d8c4a]/10">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Ver
                      </a>

                      <label for="archivo-precalificacion"
                        class="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
                          <path
                            d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l8.49-8.49a3.5 3.5 0 0 1 4.95 4.95L9.53 18.72a2 2 0 0 1-2.83-2.83l7.78-7.78" />
                        </svg>

                        {{
                          checklistData?.url_precalificacion
                            ? "Reemplazar"
                            : "Subir"
                        }}
                      </label>

                      <input id="archivo-precalificacion" type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp"
                        @change="
                          subirDocumento(
                            $event,
                            'url_precalificacion'
                          )
                          " :disabled="!puedeInteractuar" />
                    </div>
                  </div>

                </div>

                <!-- ========================================= -->
                <!-- CARTA DE APROBACIÓN -->
                <!-- ========================================= -->
                <div class="rounded-xl border border-slate-200 overflow-hidden">

                  <div class="flex items-center gap-3 px-4 py-3 bg-slate-50">

                    <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0" :class="cartaAprobacion?.completado
                      ? decision === 'Denegación'
                        ? 'border-rose-500 bg-rose-500'
                        : 'border-[#2d8c4a] bg-[#2d8c4a]'
                      : 'border-slate-300 bg-white'
                      ">

                      <svg v-if="
                        cartaAprobacion?.completado &&
                        decision === 'Aprobación'
                      " viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" class="w-2.5 h-2.5">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>

                      <svg v-if="decision === 'Denegación'" viewBox="0 0 24 24" fill="none" stroke="white"
                        stroke-width="3" class="w-2.5 h-2.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>

                    </span>

                    <div class="flex-1">

                      <p class="text-sm font-medium text-slate-700">
                        Carta de aprobación
                      </p>



                    </div>

                    <!-- DOCUMENTO -->
                    <div class="flex items-center gap-2 shrink-0">

                      <a v-if="checklistData?.url_carta_aprobacion" :href="checklistData.url_carta_aprobacion"
                        target="_blank" rel="noopener noreferrer"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#2d8c4a] hover:bg-[#2d8c4a]/10">

                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>

                        Ver

                      </a>

                      <label for="archivo-carta-aprobacion"
                        class="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-600">

                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
                          <path
                            d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l8.49-8.49a3.5 3.5 0 0 1 4.95 4.95L9.53 18.72a2 2 0 0 1-2.83-2.83l7.78-7.78" />
                        </svg>

                        {{
                          checklistData?.url_carta_aprobacion
                            ? "Reemplazar"
                            : "Subir"
                        }}

                      </label>

                      <input id="archivo-carta-aprobacion" type="file" class="hidden" :disabled="!puedeInteractuar"
                        accept=".pdf,.jpg,.jpeg,.png,.webp" @change="
                          subirDocumento(
                            $event,
                            'url_carta_aprobacion'
                          )
                          " />

                    </div>

                  </div>

                  <!-- CONTENIDO -->
                  <div v-if="!cartaAprobacion?.bloqueado" class="p-4 space-y-3">


                    <button type="button" @click="completarDocsBanco"
                      :disabled="docsBanco.bloqueado || actualizando || !puedeInteractuar"
                      class="w-full flex items-center gap-3 px-3 py-3 rounded-lg border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      :class="docsBanco.completado
                        ? 'border-[#2d8c4a] bg-[#2d8c4a]/5'
                        : 'border-slate-200 hover:border-slate-300'
                        ">

                      <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0" :class="docsBanco.completado
                        ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                        : 'border-slate-300'
                        ">

                        <svg v-if="docsBanco.completado" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
                          class="w-2.5 h-2.5">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>

                      </span>

                      <div class="flex-1">

                        <p class="text-sm text-slate-700">
                          Envío de docs al banco
                        </p>



                      </div>

                    </button>

                    <!-- ===================================== -->
                    <!-- RESULTADO -->
                    <!-- ===================================== -->
                    <div v-if="docsBanco.completado" class="pt-3 border-t border-slate-100 space-y-2">

                      <p class="text-xs font-medium text-slate-500">
                        Resultado de evaluación bancaria
                      </p>

                      <!-- APROBACIÓN -->
                      <button type="button" @click="registrarDecision('Aprobación')"
                        :disabled="actualizando || !puedeInteractuar"
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-lg border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="decision === 'Aprobación'
                          ? 'border-[#2d8c4a] bg-[#2d8c4a]/5'
                          : decision === 'Denegación'
                            ? 'border-slate-200 bg-slate-50 opacity-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          ">

                        <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0" :class="decision === 'Aprobación'
                          ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                          : 'border-slate-300 bg-white'
                          ">

                          <svg v-if="decision === 'Aprobación'" viewBox="0 0 24 24" fill="none" stroke="white"
                            stroke-width="3" class="w-2.5 h-2.5">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>

                        </span>

                        <div class="flex-1">

                          <p class="text-sm font-medium" :class="decision === 'Aprobación'
                            ? 'text-[#2d8c4a]'
                            : 'text-slate-700'
                            ">
                            Aprobación
                          </p>

                          <p v-if="decision === 'Aprobación'" class="text-xs text-[#2d8c4a] mt-0.5">
                            Resultado seleccionado
                          </p>

                        </div>

                      </button>

                      <!-- DENEGACIÓN -->
                      <button type="button" @click="registrarDecision('Denegación')"
                        :disabled="actualizando || !puedeInteractuar"
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-lg border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="decision === 'Denegación'
                          ? 'border-rose-500 bg-rose-50'
                          : decision === 'Aprobación'
                            ? 'border-slate-200 bg-slate-50 opacity-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          ">

                        <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0" :class="decision === 'Denegación'
                          ? 'border-rose-500 bg-rose-500'
                          : 'border-slate-300 bg-white'
                          ">

                          <svg v-if="decision === 'Denegación'" viewBox="0 0 24 24" fill="none" stroke="white"
                            stroke-width="3" class="w-2.5 h-2.5">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>

                        </span>

                        <div class="flex-1">

                          <p class="text-sm font-medium" :class="decision === 'Denegación'
                            ? 'text-rose-600'
                            : 'text-slate-700'
                            ">
                            Denegación
                          </p>

                          <p v-if="decision === 'Denegación'" class="text-xs text-rose-500 mt-0.5">
                            Resultado seleccionado
                          </p>

                        </div>

                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          <!-- ================================================= -->
          <!-- ================================================ -->
          <!-- FLUJO AL CONTADO (sin pasos) -->
          <!-- ================================================ -->
          <div v-else-if="tipoCreditoSeleccionado === TIPOS_CREDITO.CONTADO"
            class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 flex items-start gap-3">

            <span class="w-8 h-8 rounded-full bg-[#2d8c4a]/10 flex items-center justify-center shrink-0">

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                class="w-4 h-4 text-[#2d8c4a]">
                <path d="M20 6 9 17l-5-5" />
              </svg>

            </span>

            <div>

              <p class="text-sm font-semibold text-slate-800">
                Sin pasos adicionales
              </p>

              <p class="text-sm text-slate-500 mt-1">
                El crédito al contado no requiere checklist. Puedes pasar
                directamente a cierre o marcar la oportunidad como desistida.
              </p>

            </div>

          </div>

        </template>

        <!-- ================================================= -->
        <!-- ACCIONES GENERALES -->
        <!-- ================================================= -->
        <div v-if="tieneTipoCredito" class="mt-6 pt-5 border-t border-slate-100">

          <div class="flex flex-wrap gap-2 sm:justify-end">

            <!-- DESISTIÓ -->
            <button v-if="puedeContactar && mostrarAcciones2 && puedeInteractuar" type="button"
              @click="abrirModalDesistio" :disabled="actualizando"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>

              Desistió

            </button>

            <!-- PASAR A CIERRE -->
            <button v-if="puedeContactar && mostrarAcciones && puedeInteractuar" type="button" @click="pasarACierre"
              :disabled="actualizando"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <rect x="3" y="4" width="18" height="18" rx="2" />

                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>

              Pasar a cierre

            </button>

          </div>

        </div>

      </div>

    </div>

  </div>

  <!-- ===================================================== -->
  <!-- MODAL DESISTIMIENTO -->
  <!-- ===================================================== -->
  <div v-if="mostrarModalDesistio"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">

    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">

        <h3 class="text-sm font-semibold text-slate-900">
          Motivo de desistimiento
        </h3>

        <button type="button" @click="cerrarModalDesistio" :disabled="enviandoDesistio"
          class="text-slate-400 hover:text-slate-600 disabled:opacity-50">

          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>

        </button>

      </div>

      <!-- OPCIONES -->
      <div class="px-6 py-5 space-y-2 max-h-80 overflow-y-auto">

        <!-- LOADING -->
        <div v-if="cargandoOpciones" class="flex justify-center py-6">

          <div class="relative w-6 h-6">

            <div class="absolute inset-0 rounded-full border-2 border-slate-200"></div>

            <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-[#2d8c4a] animate-spin">
            </div>

          </div>

        </div>

        <!-- OPCIONES -->
        <button v-for="opcion in opcionesDesistio" :key="opcion.id" type="button"
          @click="motivoSeleccionado = opcion.id" :disabled="enviandoDesistio"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all disabled:opacity-50"
          :class="motivoSeleccionado === opcion.id
            ? 'border-[#2d8c4a] bg-[#2d8c4a]/5'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            ">

          <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0" :class="motivoSeleccionado === opcion.id
            ? 'border-[#2d8c4a] bg-[#2d8c4a]'
            : 'border-slate-300'
            ">

            <svg v-if="motivoSeleccionado === opcion.id" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
              class="w-2.5 h-2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>

          </span>

          <p class="text-sm font-medium text-slate-700">
            {{ opcion.nombre }}
          </p>

        </button>
        <!-- MOTIVO OTRO -->
        <div v-if="esMotivoOtro" class="mt-3">
          <label for="motivo-otro-negociacion" class="block text-sm font-medium text-slate-700 mb-1.5">
            Especifica el motivo
          </label>

          <textarea id="motivo-otro-negociacion" v-model="motivoOtro" rows="4" maxlength="500"
            placeholder="Ingresa el motivo del desistimiento..." :disabled="enviandoDesistio"
            class="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-50 disabled:cursor-not-allowed"></textarea>

          <div class="mt-1 text-right text-xs text-slate-400">
            {{ motivoOtro.length }}/500
          </div>
        </div>
        <!-- SIN OPCIONES -->
        <p v-if="
          !cargandoOpciones &&
          opcionesDesistio.length === 0
        " class="text-sm text-slate-400 text-center py-4">
          No hay opciones disponibles.
        </p>

      </div>

      <!-- FOOTER -->
      <div class="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">

        <button type="button" @click="cerrarModalDesistio" :disabled="enviandoDesistio"
          class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">
          Cancelar
        </button>

        <button type="button" @click="confirmarDesistio" :disabled="!motivoSeleccionado ||
          enviandoDesistio ||
          (esMotivoOtro && !motivoOtro.trim())"
          class="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">

          {{
            enviandoDesistio
              ? "Guardando..."
              : "Confirmar desistimiento"
          }}

        </button>

      </div>

    </div>

  </div>
</template>

<script src="./ClientsNegociacion.ts" lang="ts"></script>