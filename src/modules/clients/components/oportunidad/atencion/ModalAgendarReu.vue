<!-- ModalAgendarReu.vue -->
<template>
  <transition>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-xl p-6 w-[700px]">
        <h2 class="text-xl font-bold">Agendar reunión</h2>

        <div class="mt-6 grid grid-cols-2 gap-4">

          <div class="col-span-2">
            <label class="block text-sm font-medium text-slate-600 mb-1">Tipo de actividad</label>
            <select v-model="form.idTipoActividad" :disabled="cargandoOpciones"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option :value="null" disabled>
                {{ cargandoOpciones ? 'Cargando...' : 'Selecciona una opción' }}
              </option>
              <option v-for="opcion in opcionesTipoActividad" :key="opcion.id" :value="opcion.id">
                {{ opcion.nombre }}
              </option>
            </select>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-slate-600 mb-1">Título</label>
            <input v-model="form.titulo" type="text" placeholder="Título de la reunión"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
            <textarea v-model="form.descripcion" rows="3" placeholder="Descripción (opcional)"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-slate-600 mb-1">Lugar / Plataforma</label>
            <select v-model="plataformaSeleccionada" @change="onCambioPlataforma" :disabled="cargandoOpciones"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option :value="null" disabled>
                {{ cargandoOpciones ? 'Cargando...' : 'Selecciona una opción' }}
              </option>
              <option v-for="opcion in opcionesTipoPla" :key="opcion.id" :value="opcion.nombre">
                {{ opcion.nombre }}
              </option>
              <option :value="OTROS_VALUE">Otros</option>
            </select>

            <input v-if="plataformaSeleccionada === OTROS_VALUE" v-model="form.lugar_plataforma" type="text"
              placeholder="Especifica el lugar o plataforma" maxlength="100"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mt-2" />
          </div>


          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Fecha</label>
            <input v-model="form.fecha" type="date"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Hora</label>
            <input v-model="form.hora" type="time"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>

        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button @click="cerrar" :disabled="guardando" class="px-4 py-2 rounded bg-gray-200 disabled:opacity-50">
            Cancelar
          </button>
          <button @click="confirmar" :disabled="guardando"
            class="px-4 py-2 rounded bg-[#2d8c4a] text-white disabled:opacity-50">
            {{ guardando ? 'Guardando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script src="./ModalAgendarReu.ts" lang="ts"></script>