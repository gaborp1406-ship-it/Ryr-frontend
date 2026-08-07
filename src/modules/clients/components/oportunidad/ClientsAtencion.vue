<template>
  <div class="p-6 space-y-5">

    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">

      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
          <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Visita del Cliente
          </h2>
        </div>
        <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full', estadoStyle[estado]]">
          {{ estado }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 px-6 py-6">

        <div>
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Proyecto
          </p>
          <p class="text-sm font-semibold text-slate-800">
            {{ proyecto }}
          </p>
        </div>

        <div>
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Inicio de reunión
          </p>
          <p class="text-sm font-semibold text-slate-800">
            {{ inicioReunion || "—" }}
          </p>
        </div>

        <div>
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Fin de reunión
          </p>
          <p class="text-sm font-semibold text-slate-800">
            {{ finReunion || "—" }}
          </p>
        </div>

        <div>
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Duración
          </p>
          <p class="text-sm font-semibold text-slate-800">
            {{ duracion || "—" }}
          </p>
        </div>

      </div>

      <!-- Forma de pago -->
      <div class="px-6 pb-6">
        <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">
          Forma de pago
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            v-for="forma in formasPago"
            :key="forma"
            @click="formaPagoSeleccionada = forma"
            :disabled="!reunionIniciada"
            :class="[
              'flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-colors duration-200 text-left disabled:opacity-40 disabled:cursor-not-allowed',
              formaPagoSeleccionada === forma
                ? 'border-[#2d8c4a] bg-[#2d8c4a]/5 text-[#2d8c4a]'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            ]"
          >
            <span
              :class="[
                'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-200',
                formaPagoSeleccionada === forma
                  ? 'border-[#2d8c4a] bg-[#2d8c4a]'
                  : 'border-slate-300'
              ]"
            >
              <svg
                v-if="formaPagoSeleccionada === forma"
                viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" class="w-2.5 h-2.5"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            {{ forma }}
          </button>
        </div>
      </div>

      <!-- Acciones -->
      <div class="border-t border-slate-100 px-6 py-4 flex justify-end gap-2">

        <button
          v-if="!reunionIniciada"
          @click="iniciarReunion"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2d8c4a] hover:bg-[#256e3c] text-white text-sm font-semibold transition-colors duration-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4l3 2" />
          </svg>
          Iniciar reunión
        </button>

        <button
          v-else
          @click="finalizarReunion"
          :disabled="reunionFinalizada || !formaPagoSeleccionada"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors duration-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <rect x="6" y="6" width="12" height="12" rx="1.5" />
          </svg>
          Finalizar reunión
        </button>

      </div>

      <p
        v-if="reunionIniciada && !reunionFinalizada && !formaPagoSeleccionada"
        class="px-6 pb-4 text-xs text-slate-400 -mt-2"
      >
        Selecciona una forma de pago para poder finalizar la reunión
      </p>

    </div>

  </div>
</template>

<script src="./ClientsAtencion.ts" lang="ts"></script>