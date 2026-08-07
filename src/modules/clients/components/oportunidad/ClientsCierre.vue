<template>
  <div class="p-6 space-y-5">

    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">

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
          <div
            class="h-full bg-[#2d8c4a] transition-all duration-300"
            :style="{ width: progreso + '%' }"
          />
        </div>
      </div>

      <!-- Checklist -->
      <div class="px-6 py-6">
        <ul class="space-y-2">
          <li v-for="(paso, i) in pasos" :key="paso.id">

            <button
              @click="toggle(paso)"
              :disabled="paso.bloqueado || (paso.requiereEvidencia && !paso.completado)"
              class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors duration-200 text-left disabled:opacity-40 disabled:cursor-not-allowed"
              :class="paso.completado
                ? 'border-[#2d8c4a] bg-[#2d8c4a]/5'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
            >
              <span
                class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-200"
                :class="paso.completado
                  ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                  : 'border-slate-300'"
              >
                <svg
                  v-if="paso.completado"
                  viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" class="w-3 h-3"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>

              <div class="flex-1">
                <p
                  class="text-sm font-medium transition-colors duration-200"
                  :class="paso.completado ? 'text-[#2d8c4a]' : 'text-slate-700'"
                >
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

            <!-- Subir evidencia (solo para el paso de Sperant) -->
            <div
              v-if="paso.requiereEvidencia && !paso.completado && !paso.bloqueado"
              class="mt-2 ml-4 pl-4 border-l-2 border-slate-100"
            >
              <label
                class="flex items-center gap-3 border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:border-[#2d8c4a] hover:bg-[#2d8c4a]/5 transition-colors"
              >
                <input type="file" accept="image/*,.pdf" class="hidden" @change="e => onArchivoSeleccionado(e, paso)" />

                <template v-if="!paso.evidenciaPreview">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-slate-300 shrink-0">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <path d="M17 8l-5-5-5 5"/>
                    <path d="M12 3v12"/>
                  </svg>
                  <span class="text-sm text-slate-500 font-medium">
                    Subir evidencia (imagen o PDF)
                  </span>
                </template>

                <template v-else>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-[#2d8c4a] shrink-0">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span class="text-sm text-[#2d8c4a] font-medium truncate">
                    {{ paso.evidenciaNombre }}
                  </span>
                </template>
              </label>

              <button
                v-if="paso.evidenciaPreview"
                @click="toggle(paso)"
                class="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2d8c4a] hover:bg-[#256e3c] text-white text-sm font-semibold transition-colors duration-200"
              >
                Confirmar subida
              </button>
            </div>

          </li>
        </ul>
      </div>

    </div>

  </div>
</template>

<script src="./ClientsCierre.ts" lang="ts"></script>