<template>
  <div class="p-6 space-y-5">

    <!-- Estado de carga -->
    <div v-if="cargando"
      class="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-16 flex flex-col items-center justify-center gap-3">
      <svg class="w-8 h-8 animate-spin text-[#2d8c4a]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
        fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p class="text-sm font-medium text-slate-400 animate-pulse">
        Cargando información de la reunión...
      </p>
    </div>

    <!-- Error -->
    <div v-else-if="error"
      class="bg-white border border-rose-200 rounded-2xl shadow-sm px-6 py-10 text-center text-sm text-rose-500">
      {{ error }}
    </div>

    <!-- Card: Detalle de la reunión -->
    <div v-else-if="reunion" class="bg-white border border-slate-200 rounded-2xl shadow-sm">

      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
          <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Reunión Programada
          </h2>
        </div>
        <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full', estadoStyleActual]">
          {{ reunion.nombre_estado }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 px-6 py-6">

        <div>
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Tipo de reunión
          </p>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2d8c4a]/10 text-[#2d8c4a] text-xs font-semibold">
            {{ reunion.tipo_actividad }}
          </span>
        </div>

        <div>
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Título
          </p>
          <p class="text-sm font-semibold text-slate-800">
            {{ reunion.titulo }}
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

        <div v-if="reunion.descripcion" class="md:col-span-2">
          <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Descripción
          </p>
          <p class="text-sm text-slate-600">
            {{ reunion.descripcion }}
          </p>
        </div>

      </div>

      <!-- Acciones: solo se muestran si el lead aún no fue convertido -->
      <div v-if="!yaConvertido"
        class="border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <p v-if="errorConvertir" class="text-xs text-rose-500 font-medium">
          {{ errorConvertir }}
        </p>
        <span v-else></span>

        <div class="flex flex-wrap gap-2 sm:justify-end">

          <button @click="convertirOportunidad" :disabled="convirtiendo"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2d8c4a] hover:bg-[#256e3c] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors duration-200">

            <svg v-if="convirtiendo" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
            </svg>

            {{ convirtiendo ? "Convirtiendo..." : "Convertir en oportunidad" }}
          </button>
        </div>

      </div>

    </div>

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