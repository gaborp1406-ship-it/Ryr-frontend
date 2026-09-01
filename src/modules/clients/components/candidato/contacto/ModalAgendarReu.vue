<!-- ModalAgendarReu.vue -->
<template>
  <transition name="modal">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px]">
      <div class="modal-panel bg-white rounded-2xl shadow-xl border border-slate-200 w-[700px] max-h-[90vh] overflow-y-auto">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-[#eaf5ee] text-[#2d8c4a]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4.5 h-4.5">
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M3 9h18M8 2v4M16 2v4" />
                <path d="m9 15 2 2 4-4" />
              </svg>
            </span>
            <h2 class="text-lg font-semibold text-slate-800">Agendar reunión</h2>
          </div>
          <button @click="cerrar" :disabled="guardando"
            class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 space-y-5">

          <!-- Tipo de actividad + Título -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1.5">Tipo de actividad</label>
              <div class="relative">
                <select v-model="form.idTipoActividad" :disabled="cargandoOpciones"
                  class="w-full appearance-none border border-slate-300 rounded-lg pl-3 pr-9 py-2 text-sm text-slate-700 bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/25 focus:border-[#2d8c4a] transition-colors disabled:bg-slate-50">
                  <option :value="null" disabled>
                    {{ cargandoOpciones ? 'Cargando...' : 'Selecciona una opción' }}
                  </option>
                  <option v-for="opcion in opcionesTipoActividad" :key="opcion.id" :value="opcion.id">
                    {{ opcion.nombre }}
                  </option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1.5">Título</label>
              <input v-model="form.titulo" type="text" placeholder="Título de la reunión"
                class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/25 focus:border-[#2d8c4a] transition-colors" />
            </div>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1.5">Descripción</label>
            <textarea v-model="form.descripcion" rows="3" placeholder="Descripción (opcional)"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 resize-none
                     focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/25 focus:border-[#2d8c4a] transition-colors" />
          </div>

          <!-- Lugar / Plataforma -->
          <div class="pt-1 border-t border-slate-100">
            <label class="block text-sm font-medium text-slate-600 mb-1.5 mt-4">Lugar / Plataforma</label>
            <div class="relative">
              <select v-model="plataformaSeleccionada" @change="onCambioPlataforma" :disabled="cargandoOpciones"
                class="w-full appearance-none border border-slate-300 rounded-lg pl-3 pr-9 py-2 text-sm text-slate-700 bg-white
                       focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/25 focus:border-[#2d8c4a] transition-colors disabled:bg-slate-50">
                <option :value="null" disabled>
                  {{ cargandoOpciones ? 'Cargando...' : 'Selecciona una opción' }}
                </option>
                <option v-for="opcion in opcionesTipoPla" :key="opcion.id" :value="opcion.nombre">
                  {{ opcion.nombre }}
                </option>
                <option :value="OTROS_VALUE">Otros</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>

            <div v-if="plataformaSeleccionada === OTROS_VALUE" class="mt-2">
              <input v-model="form.lugar_plataforma" type="text"
                placeholder="Especifica el lugar o plataforma" maxlength="100"
                class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/25 focus:border-[#2d8c4a] transition-colors" />
              <p class="text-xs text-slate-400 mt-1 text-right">{{ (form.lugar_plataforma || '').length }}/100</p>
            </div>
          </div>

          <!-- Fecha y hora -->
          <div class="pt-1 border-t border-slate-100">
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1.5">Fecha</label>
                <div class="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path d="M3 9h18M8 2v4M16 2v4" />
                  </svg>
                  <input v-model="form.fecha" type="date"
                    class="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/25 focus:border-[#2d8c4a] transition-colors" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1.5">Hora</label>
                <div class="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                  <input v-model="form.hora" type="time"
                    class="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-[#2d8c4a]/25 focus:border-[#2d8c4a] transition-colors" />
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
          <button @click="cerrar" :disabled="guardando"
            class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button @click="confirmar" :disabled="guardando"
            class="px-4 py-2 rounded-lg text-sm font-medium bg-[#2d8c4a] text-white hover:bg-[#256e3c] transition-colors disabled:opacity-50 flex items-center gap-2">
            <svg v-if="guardando" class="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {{ guardando ? 'Guardando...' : 'Confirmar' }}
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script src="./ModalAgendarReu.ts" lang="ts"></script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: scale(0.96);
  opacity: 0;
}
</style>