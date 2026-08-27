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
          Cargando proceso de cierre...
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

      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
          <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Formalización de Venta
          </h2>
        </div>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {{ completados }}/{{ pasos.length }} completados
        </span>
      </div>

      <!-- Barra de progreso -->
      <div class="px-6 pt-5">
        <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-[#2d8c4a] transition-all duration-300" :style="{ width: progreso + '%' }" />
        </div>
      </div>

      <!-- Checklist -->
      <div class="px-6 py-6">
        <ul class="space-y-2">
          <li v-for="(paso, i) in pasos" :key="paso.id">

            <button @click="toggle(paso)"
              :disabled="actualizando || paso.bloqueado || (paso.requiereEvidencia && !paso.completado && !paso.archivo)"
              class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors duration-200 text-left disabled:opacity-40 disabled:cursor-not-allowed"
              :class="paso.completado
                ? 'border-[#2d8c4a] bg-[#2d8c4a]/5'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'">
              <span
                class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-200"
                :class="paso.completado
                  ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                  : 'border-slate-300'">
                <svg v-if="paso.completado" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
                  class="w-3 h-3">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>

              <div class="flex-1">
                <p class="text-sm font-medium transition-colors duration-200"
                  :class="paso.completado ? 'text-[#2d8c4a]' : 'text-slate-700'">
                  {{ paso.titulo }}
                </p>
                <p v-if="paso.fecha" class="text-xs text-slate-400 mt-0.5">
                  {{ paso.fecha }}
                </p>
              </div>

              <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                Paso {{ i + 1 }}
              </span>
            </button>

            <!-- Subir evidencia (solo para el paso de Sperant, aún sin API) -->
            <div v-if="paso.requiereEvidencia && !paso.completado && !paso.bloqueado"
              class="mt-2 ml-4 pl-4 border-l-2 border-slate-100">
              <label
                class="flex items-center gap-3 border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:border-[#2d8c4a] hover:bg-[#2d8c4a]/5 transition-colors">
                <input type="file" accept="image/*,.pdf" class="hidden" @change="e => onArchivoSeleccionado(e, paso)" />

                <template v-if="!paso.evidenciaPreview">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    class="w-5 h-5 text-slate-300 shrink-0">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M17 8l-5-5-5 5" />
                    <path d="M12 3v12" />
                  </svg>
                  <span class="text-sm text-slate-500 font-medium">
                    Subir evidencia (imagen o PDF)
                  </span>
                </template>

                <template v-else>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    class="w-5 h-5 text-[#2d8c4a] shrink-0">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span class="text-sm text-[#2d8c4a] font-medium truncate">
                    {{ paso.evidenciaNombre }}
                  </span>
                </template>
              </label>

              <button v-if="paso.evidenciaPreview" @click="toggle(paso)"
                class="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2d8c4a] hover:bg-[#256e3c] text-white text-sm font-semibold transition-colors duration-200">
                Confirmar subida
              </button>
            </div>

          </li>
        </ul>

        <!-- ACCIONES -->
        <div v-if="mostrarAcciones" class="mt-5 pt-5 border-t border-slate-100">
          <div class="flex flex-wrap gap-2 sm:justify-end">

            <button @click="abrirModalDesistio" :disabled="actualizando"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
              Desistió
            </button>

            <button @click="marcarRealizado" :disabled="actualizando || finalizandoRealizado"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {{ finalizandoRealizado ? 'Guardando...' : 'Realizado' }}
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

<script src="./ClientsCierre.ts" lang="ts"></script>