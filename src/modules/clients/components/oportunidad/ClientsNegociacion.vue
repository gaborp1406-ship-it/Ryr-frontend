<template>
  <div class="p-6 space-y-5">
    <!-- LOADING INICIAL -->
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

    <!-- ERROR ALERT -->
    <div v-if="errores && !cargando" class="bg-rose-50 border border-rose-200 rounded-2xl shadow-sm p-4">
      <div class="flex items-start gap-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          class="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-rose-900">Error</h3>
          <p class="text-sm text-rose-700 mt-1">{{ errores }}</p>
        </div>
      </div>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div v-if="!cargando" class="bg-white border border-slate-200 rounded-2xl shadow-sm relative">
      <!-- Overlay durante actualización -->
      <div v-if="actualizando"
        class="absolute inset-0 bg-white/50 rounded-2xl backdrop-blur-sm z-10 flex items-center justify-center">
        <div class="flex flex-col items-center gap-2">
          <div class="relative w-8 h-8">
            <div class="absolute inset-0 rounded-full border-2 border-slate-200"></div>
            <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-[#2d8c4a] animate-spin">
            </div>
          </div>
          <p class="text-xs text-slate-500 font-medium">Actualizando...</p>
        </div>
      </div>

      <!-- HEADER -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>

          <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Proceso de Negociación
          </h2>
        </div>

        <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {{ completados }}/{{ totalPasos }} completados
        </span>
      </div>

      <!-- PROGRESO -->
      <div class="px-6 pt-5">
        <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-[#2d8c4a] transition-all duration-300" :style="{ width: progreso + '%' }" />
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

      <!-- CONTENIDO -->
      <div class="px-6 py-6">

        <!-- ========================================== -->
        <!-- 1. PROFORMA -->
        <!-- ========================================== -->

        <div class="mb-3">

          <button @click="completarProforma" :disabled="actualizando"
            class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
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

              <p v-if="proforma?.fecha" class="text-xs text-slate-400 mt-0.5">
                {{ proforma.fecha }}
              </p>
            </div>

            <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
              Paso 1
            </span>
          </button>

        </div>


        <!-- ========================================== -->
        <!-- 2. APROBACIÓN BANCARIA -->
        <!-- ========================================== -->

        <div class="rounded-xl border transition-all" :class="aprobacionBancaria?.bloqueado
          ? 'border-slate-200 opacity-50'
          : 'border-slate-200'
          ">

          <!-- PADRE -->
          <div class="flex items-center gap-3 px-4 py-3.5" :class="aprobacionBancaria?.completado
            ? 'bg-[#2d8c4a]/5'
            : 'bg-slate-50'
            ">

            <span class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0" :class="aprobacionBancaria?.completado
              ? 'border-[#2d8c4a] bg-[#2d8c4a]'
              : 'border-slate-300 bg-white'
              ">
              <svg v-if="aprobacionBancaria?.completado" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
                class="w-3 h-3">
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

              <p v-if="aprobacionBancaria?.fecha" class="text-xs text-slate-400 mt-0.5">
                {{ aprobacionBancaria.fecha }}
              </p>
            </div>

            <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Paso 2
            </span>
          </div>


          <!-- SUBPASOS -->
          <div v-if="!aprobacionBancaria?.bloqueado" class="p-4 space-y-3">

            <!-- PRECALIFICACIÓN -->
            <button @click="completarPrecalificacion" :disabled="precalificacion?.bloqueado || actualizando"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              :class="precalificacion?.completado
                ? 'border-[#2d8c4a] bg-[#2d8c4a]/5'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                ">

              <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0" :class="precalificacion?.completado
                ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                : 'border-slate-300'
                ">
                <svg v-if="precalificacion?.completado" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
                  class="w-2.5 h-2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>

              <div class="flex-1">
                <p class="text-sm font-medium text-slate-700">
                  Precalificación
                </p>

                <p v-if="precalificacion?.fecha" class="text-xs text-slate-400 mt-0.5">
                  {{ precalificacion.fecha }}
                </p>
              </div>

            </button>


            <!-- CARTA DE APROBACIÓN -->
            <div class="border border-slate-200 rounded-lg overflow-hidden">

              <div class="flex items-center gap-3 px-4 py-3 bg-slate-50">

                <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0" :class="cartaAprobacion?.completado
                  ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                  : decision === 'Denegación'
                    ? 'border-rose-500 bg-rose-500'
                    : 'border-slate-300 bg-white'
                  ">

                  <svg v-if="
                    cartaAprobacion?.completado &&
                    decision === 'Aprobación'
                  " viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" class="w-2.5 h-2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>

                  <svg v-if="decision === 'Denegación'" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
                    class="w-2.5 h-2.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>

                </span>

                <div class="flex-1">
                  <p class="text-sm font-medium text-slate-700">
                    Carta de aprobación
                  </p>

                  <p v-if="cartaAprobacion?.fecha" class="text-xs text-slate-400 mt-0.5">
                    {{ cartaAprobacion.fecha }}
                  </p>
                </div>

              </div>


              <!-- CONTENIDO CARTA -->
              <div v-if="!cartaAprobacion?.bloqueado" class="p-4 space-y-3">

                <!-- ENVÍO DE DOCUMENTOS -->
                <button @click="completarDocsBanco" :disabled="docsBanco.bloqueado || actualizando"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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

                    <p v-if="docsBanco.fecha" class="text-xs text-slate-400 mt-0.5">
                      {{ docsBanco.fecha }}
                    </p>
                  </div>

                </button>


                <!-- DECISIÓN BANCARIA -->
                <!-- RESULTADO DE EVALUACIÓN BANCARIA -->
                <div v-if="docsBanco.completado" class="pt-3 border-t border-slate-100 space-y-2">
                  <p class="text-xs font-medium text-slate-500">
                    Resultado de evaluación bancaria
                  </p>

                  <!-- APROBACIÓN -->
                  <button @click="registrarDecision('Aprobación')" :disabled="actualizando"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="decision === 'Aprobación'
                      ? 'border-[#2d8c4a] bg-[#2d8c4a]/5'
                      : decision === 'Denegación'
                        ? 'border-slate-200 bg-slate-50 opacity-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      ">
                    <!-- CHECK -->
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
                  <button @click="registrarDecision('Denegación')" :disabled="actualizando"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="decision === 'Denegación'
                      ? 'border-rose-500 bg-rose-50'
                      : decision === 'Aprobación'
                        ? 'border-slate-200 bg-slate-50 opacity-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      ">
                    <!-- CHECK / X -->
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



        <div v-if="mostrarAcciones" class="mt-5 pt-5 border-t border-slate-100">
          <div class="flex flex-wrap gap-2 sm:justify-end">

            <!-- Botón Desistió: abre el modal -->
            <button @click="abrirModalDesistio" :disabled="actualizando"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
              Desistió
            </button>

            <button @click="pasarACierre" :disabled="actualizando"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
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


  <!-- MODAL DESISTIO -->
  <div v-if="mostrarModalDesistio"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">

      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 class="text-sm font-semibold text-slate-900">Motivo de desistimiento</h3>
        <button @click="cerrarModalDesistio" :disabled="enviandoDesistio"
          class="text-slate-400 hover:text-slate-600 disabled:opacity-50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="px-6 py-5 space-y-2 max-h-80 overflow-y-auto">
        <div v-if="cargandoOpciones" class="flex justify-center py-6">
          <div class="relative w-6 h-6">
            <div class="absolute inset-0 rounded-full border-2 border-slate-200"></div>
            <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-[#2d8c4a] animate-spin">
            </div>
          </div>
        </div>

        <button v-for="opcion in opcionesDesistio" :key="opcion.id" @click="motivoSeleccionado = opcion.id"
          :disabled="enviandoDesistio"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all disabled:opacity-50"
          :class="motivoSeleccionado === opcion.id
            ? 'border-[#2d8c4a] bg-[#2d8c4a]/5'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'">
          <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
            :class="motivoSeleccionado === opcion.id ? 'border-[#2d8c4a] bg-[#2d8c4a]' : 'border-slate-300'">
            <svg v-if="motivoSeleccionado === opcion.id" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
              class="w-2.5 h-2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <p class="text-sm font-medium text-slate-700">{{ opcion.nombre }}</p>
        </button>

        <p v-if="!cargandoOpciones && opcionesDesistio.length === 0" class="text-sm text-slate-400 text-center py-4">
          No hay opciones disponibles.
        </p>
      </div>

      <div class="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
        <button @click="cerrarModalDesistio" :disabled="enviandoDesistio"
          class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">
          Cancelar
        </button>
        <button @click="confirmarDesistio" :disabled="!motivoSeleccionado || enviandoDesistio"
          class="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
          {{ enviandoDesistio ? 'Guardando...' : 'Confirmar desistimiento' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script src="./ClientsNegociacion.ts" lang="ts"></script>