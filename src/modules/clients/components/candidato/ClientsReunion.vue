<template>
  <div class="p-6 space-y-5">

    <!-- Card: Detalle de la reunión -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">

      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
          <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Reunión Programada
          </h2>
        </div>
        <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full', estadoStyle[reunion.estado]]">
          {{ reunion.estado }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 px-6 py-6">

        <div>
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Tipo de reunión
          </p>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2d8c4a]/10 text-[#2d8c4a] text-xs font-semibold"
          >
            <svg
              v-if="reunion.tipo === 'Visita a caseta'"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"
            >
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
              <path d="M9 21v-6h6v6" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"
            >
              <rect x="2" y="6" width="14" height="12" rx="2" />
              <path d="M16 10l6-3v10l-6-3" />
            </svg>
            {{ reunion.tipo }}
          </span>
        </div>

        <div>
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Proyecto
          </p>
          <p class="text-sm font-semibold text-slate-800">
            {{ reunion.proyecto }}
          </p>
        </div>

        <div>
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Fecha
          </p>
          <p class="text-sm font-semibold text-slate-800">
            {{ reunion.fecha }}
          </p>
        </div>

        <div>
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Hora
          </p>
          <p class="text-sm font-semibold text-slate-800">
            {{ reunion.hora }}
          </p>
        </div>

      </div>

      <!-- Acciones -->
      <div class="border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div class="flex flex-wrap gap-2">
          <button
            @click="reprogramar"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            Reprogramar
          </button>

          <button
            @click="cancelarReunion"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-semibold transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 9l6 6M15 9l-6 6" />
            </svg>
            Reunión cancelada
          </button>
        </div>

        <div class="flex flex-wrap gap-2 sm:justify-end">
          <button
            @click="marcarNoAsistio"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            No asistió
          </button>

          <button
            @click="marcarAsistio"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2d8c4a] hover:bg-[#256e3c] text-white text-sm font-semibold transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Asistió
          </button>
        </div>

      </div>

    </div>

    <!-- Modal: Motivo de no asistencia -->
    <transition name="fade">
      <div
        v-if="modalNoAsistioAbierto"
        class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
        @click.self="cerrarModalNoAsistio"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Motivo de inasistencia
              </h3>
            </div>
            <button @click="cerrarModalNoAsistio" class="text-slate-400 hover:text-slate-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-6 py-6">
            <p class="text-sm text-slate-400 mb-4">
              Selecciona la razón por la que el lead no asistió a la reunión
            </p>

            <div class="flex flex-col gap-2">
              <button
                v-for="motivo in motivosNoAsistio"
                :key="motivo"
                @click="seleccionarMotivoNoAsistio(motivo)"
                :class="[
                  'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-colors duration-200 text-left',
                  motivoNoAsistioSeleccionado === motivo
                    ? 'border-[#2d8c4a] bg-[#2d8c4a]/5 text-[#2d8c4a]'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                ]"
              >
                <span
                  :class="[
                    'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-200',
                    motivoNoAsistioSeleccionado === motivo
                      ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                      : 'border-slate-300'
                  ]"
                >
                  <svg
                    v-if="motivoNoAsistioSeleccionado === motivo"
                    viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" class="w-2.5 h-2.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {{ motivo }}
              </button>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              @click="cerrarModalNoAsistio"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="confirmarNoAsistio"
              :disabled="!motivoNoAsistioSeleccionado"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar
            </button>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script src="./ClientsReunion.ts" lang="ts"></script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>