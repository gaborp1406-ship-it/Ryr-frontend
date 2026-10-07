<template>
    <div class="p-6">

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm">

            <!-- Encabezado -->
            <div class="flex items-center justify-between gap-2 px-6 py-5 border-b border-slate-100">
                <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
                    <h2 class="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                        Información del Lead
                    </h2>
                    <span v-if="editando"
                        class="ml-2 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 border border-amber-200">
                        Editando
                    </span>
                </div>

                <button v-if="puedeEditar && lead && !editando" type="button" @click="iniciarEdicion"
                    class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-500 transition hover:border-[#2d8c4a]/40 hover:bg-[#2d8c4a]/[0.06] hover:text-[#1e6236]">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                    Editar
                </button>
            </div>

            <!-- Datos -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5 px-6 py-6">

                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Nombre</p>
                    <p class="text-sm font-semibold text-slate-800">
                        {{ lead?.nombres }}
                    </p>
                </div>

                <!-- DNI (editable) -->
                      <!-- DNI (editable solo si está vacío) -->
                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">DNI</p>

                    <input v-if="editando && dniEditable" v-model="form.dni" @input="onDniInput"
                        @keyup.enter="guardarCambios" :disabled="guardando" maxlength="10" inputmode="numeric"
                        placeholder="Ingrese el DNI"
                        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10 disabled:opacity-60">

                    <p v-else class="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                        {{ lead?.numero_documento || '—' }}
                        <svg v-if="editando && !dniEditable" class="h-3.5 w-3.5 text-slate-300" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" title="El DNI ya registrado no se puede modificar">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </p>
                </div>

                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">N.º Teléfono</p>
                    <p class="text-sm font-semibold text-slate-800">
                        {{ lead?.telefono }}
                    </p>
                </div>

                <!-- Proyecto (editable) -->
                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Proyecto</p>

                    <select v-if="editando" v-model.number="form.id_proyecto" :disabled="guardando"
                        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10 disabled:opacity-60">
                        <option value="" disabled>Seleccione</option>
                        <option v-for="p in proyectos" :key="p.id_proyecto" :value="p.id_proyecto">
                            {{ p.nombre }}
                        </option>
                    </select>

                    <p v-else class="text-sm font-semibold text-slate-800">
                        {{ lead?.proyecto }}
                    </p>
                </div>

                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Fuente</p>
                    <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2d8c4a]/10 text-[#2d8c4a] text-xs font-semibold">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#2d8c4a]"></span>
                        {{ lead?.fuente }}
                    </span>
                </div>


                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                        Fecha de ingreso
                    </p>

                    <p class="text-sm font-semibold text-slate-800">
                        {{ formatFechaSimple(lead?.fecha_ingreso) }}
                    </p>
                </div>

                <div>
                    <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                        Hora de ingreso
                    </p>

                    <p class="text-sm font-semibold text-slate-800">
                        {{ formatHoraSimple(lead?.hora_ingreso) }}
                    </p>
                </div>

            </div>

            <!-- Guardar / Cancelar -->
            <div v-if="editando"
                class="border-t border-slate-100 bg-slate-50/60 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                <button type="button" @click="cancelarEdicion" :disabled="guardando"
                    class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60">
                    Cancelar
                </button>

                <button type="button" @click="guardarCambios" :disabled="guardando"
                    class="inline-flex items-center gap-2 rounded-lg bg-[#2d8c4a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e6236] disabled:opacity-60 disabled:cursor-not-allowed">
                    <svg v-if="guardando" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {{ guardando ? "Guardando..." : "Guardar cambios" }}
                </button>
            </div>

            <!-- Contactar -->
            <div v-if="lead && !lead.estado && puedeContactar && !editando"
                class="border-t border-slate-100 px-6 py-4 flex justify-end">
                <button @click="contactarLead" :disabled="loadingContactar"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-[#2d8c4a] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors duration-200">

                    <svg v-if="!loadingContactar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        class="w-4 h-4">
                        <path
                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.902.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.908.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>

                    <svg v-else class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>

                    {{ loadingContactar ? "Cargando..." : "Contactar" }}
                </button>
            </div>

        </div>

    </div>
</template>
<script src="./ClientsAsignar.ts" lang="ts"></script>