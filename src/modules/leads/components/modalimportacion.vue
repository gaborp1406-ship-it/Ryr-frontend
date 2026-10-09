<template>
    <Teleport to="body">
        <div v-if="modelValue"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            @mousedown.self="cerrar">
            <div class="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl">

                <!-- Header -->
                <div class="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 class="text-base font-semibold text-slate-800">Importar leads desde Excel</h2>
                        <p class="mt-0.5 text-xs text-slate-500">
                            Elige proyecto y fuente, sube el archivo, revisa y guarda. Se registrarán a nombre de
                            <span class="font-semibold text-slate-700">{{ nombreUsuarioActual }}</span>.
                        </p>
                    </div>
                    <button type="button"
                        class="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        :disabled="guardando" @click="cerrar">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="flex-1 space-y-4 overflow-auto px-6 py-5">

                    <!-- Proyecto + Fuente -->
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label class="block">
                            <span
                                class="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">Proyecto</span>
                            <select v-model="proyectoId" :disabled="guardando"
                                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10 disabled:opacity-60">
                                <option value="">Seleccione</option>
                                <option v-for="p in proyectos" :key="p.id_proyecto" :value="p.id_proyecto">{{ p.nombre
                                    }}</option>
                            </select>
                        </label>

                        <label class="block">
                            <span
                                class="mb-1 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">Fuente</span>
                            <select v-model="fuenteId" :disabled="guardando"
                                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#2d8c4a] focus:ring-4 focus:ring-[#2d8c4a]/10 disabled:opacity-60">
                                <option value="">Seleccione</option>
                                <option v-for="o in opcionesFuente" :key="o.id" :value="o.id">{{ o.nombre }}</option>
                            </select>
                        </label>
                    </div>

                    <!-- Dropzone -->
                    <label
                        class="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition"
                        :class="[
                            arrastrando ? 'border-[#2d8c4a] bg-[#2d8c4a]/5' : 'border-slate-200 bg-slate-50 hover:border-[#2d8c4a]/50',
                            guardando ? 'pointer-events-none opacity-60' : '',
                        ]" @dragover.prevent="arrastrando = true" @dragleave.prevent="arrastrando = false" @drop.prevent="onDrop">
                        <input ref="inputArchivo" type="file" accept=".xls,.xlsx,.csv" class="hidden"
                            @change="onArchivo">
                        <svg class="h-7 w-7 text-[#2d8c4a]" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.8">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5" />
                        </svg>
                        <span v-if="leyendo" class="text-sm text-slate-600">Leyendo archivo…</span>
                        <template v-else>
                            <span class="text-sm font-medium text-slate-700">
                                {{ nombreArchivo || 'Arrastra tu Excel aquí o haz clic para elegirlo' }}
                            </span>
                            <span class="text-xs text-slate-400">.xls, .xlsx o .csv · columnas: nombre, teléfono y DNI
                                (opcional)</span>
                        </template>
                    </label>

                    <!-- Resumen -->
                    <div v-if="filas.length" class="flex flex-wrap items-center gap-2 text-xs">
                        <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                            Total: <b>{{ filas.length }}</b>
                        </span>
                        <span class="rounded-full border border-[#2d8c4a]/30 bg-[#2d8c4a]/5 px-3 py-1 text-[#1e6236]">
                            Listos: <b>{{ totalListos }}</b>
                        </span>
                        <span v-if="totalConErrores"
                            class="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-600">
                            Con errores: <b>{{ totalConErrores }}</b>
                        </span>
                        <span v-if="totalCreados"
                            class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                            Creados: <b>{{ totalCreados }}</b>
                        </span>
                        <span v-if="totalOmitidos"
                            class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                            Omitidos: <b>{{ totalOmitidos }}</b>
                        </span>
                    </div>

                    <!-- Barra de progreso -->
                    <div v-if="guardando" class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div class="h-full rounded-full bg-[#2d8c4a] transition-all"
                            :style="{ width: porcentaje + '%' }"></div>
                    </div>

                    <!-- Tabla previa -->
                    <div v-if="filas.length" class="max-h-[40vh] overflow-auto rounded-2xl border border-slate-200">
                        <table class="min-w-full border-collapse text-xs">
                            <thead class="sticky top-0 z-10 bg-[#0a0a0a] text-slate-300">
                                <tr>
                                    <th class="px-3 py-3 text-left text-[10px] font-medium uppercase tracking-[0.14em]">
                                        #</th>
                                    <th class="px-3 py-3 text-left text-[10px] font-medium uppercase tracking-[0.14em]">
                                        Nombre</th>
                                    <th class="px-3 py-3 text-left text-[10px] font-medium uppercase tracking-[0.14em]">
                                        DNI</th>
                                    <th class="px-3 py-3 text-left text-[10px] font-medium uppercase tracking-[0.14em]">
                                        Teléfono</th>
                                    <th class="px-3 py-3 text-left text-[10px] font-medium uppercase tracking-[0.14em]">
                                        Estado</th>
                                    <th class="px-3 py-3"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-700">
                                <tr v-for="fila in filas" :key="fila.uid" class="odd:bg-white even:bg-slate-50/50">
                                    <td class="px-3 py-2 font-mono text-slate-400">{{ fila.fila }}</td>

                                    <td class="px-2 py-1.5">
                                        <input v-model="fila.nombre" :disabled="!editable(fila)" @input="revalidar"
                                            class="w-full min-w-[180px] rounded-lg border bg-white px-2 py-1.5 text-xs outline-none transition focus:border-[#2d8c4a] disabled:border-transparent disabled:bg-transparent"
                                            :class="fila.errores.nombre ? 'border-red-300' : 'border-slate-200'">
                                    </td>

                                    <td class="px-2 py-1.5">
                                        <input v-model="fila.dni" :disabled="!editable(fila)" maxlength="10"
                                            inputmode="numeric" placeholder="Opcional" @input="revalidar"
                                            class="w-28 rounded-lg border bg-white px-2 py-1.5 font-mono text-xs outline-none transition placeholder:text-slate-300 focus:border-[#2d8c4a] disabled:border-transparent disabled:bg-transparent"
                                            :class="fila.errores.dni || fila.errores.duplicado ? 'border-red-300' : 'border-slate-200'">
                                    </td>

                                    <td class="px-2 py-1.5">
                                        <input v-model="fila.telefono" :disabled="!editable(fila)" inputmode="numeric"
                                            @input="revalidar" @blur="normalizarFila(fila)"
                                            class="w-28 rounded-lg border bg-white px-2 py-1.5 font-mono text-xs outline-none transition focus:border-[#2d8c4a] disabled:border-transparent disabled:bg-transparent"
                                            :class="fila.errores.telefono ? 'border-red-300' : 'border-slate-200'">
                                    </td>

                                    <td class="px-3 py-2">
                                        <span v-if="fila.estado === 'guardando'"
                                            class="text-slate-500">Guardando…</span>
                                        <span v-else-if="fila.estado === 'creado'" class="font-medium text-emerald-600">
                                            ✓ {{ fila.mensaje || 'Creado' }}
                                        </span>
                                        <span v-else-if="fila.estado === 'omitido'" class="text-amber-600">{{
                                            fila.mensaje }}</span>
                                        <span v-else-if="fila.estado === 'error'" class="text-red-600">{{ fila.mensaje
                                            }}</span>
                                        <span v-else-if="listaErrores(fila).length" class="text-red-600">
                                            {{ listaErrores(fila).join(' · ') }}
                                        </span>
                                        <span v-else class="text-[#2d8c4a]">Listo</span>
                                    </td>

                                    <td class="px-2 py-1.5 text-right">
                                        <button v-if="editable(fila)" type="button" title="Quitar fila"
                                            class="rounded-full p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                                            @click="quitarFila(fila.uid)">
                                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Footer -->
                <div
                    class="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
                    <p class="text-xs text-slate-400">
                        Los teléfonos se normalizan a 9 dígitos (se quita +51 y espacios). El DNI es opcional.
                    </p>
                    <div class="flex items-center gap-2">
                        <button type="button" :disabled="guardando" @click="cerrar"
                            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
                            {{ totalCreados || totalOmitidos ? 'Cerrar' : 'Cancelar' }}
                        </button>
                        <button type="button" :disabled="!puedeGuardar" @click="guardar"
                            class="rounded-xl bg-[#2d8c4a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e6236] disabled:cursor-not-allowed disabled:opacity-40">
                            {{ guardando ? `Guardando ${progreso}/${totalAGuardar}…` : `Guardar ${totalListos}
                            lead${totalListos === 1 ?
                            '' : 's'}` }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/modules/auth/stores/auth.store';
import { crearLead } from '../actions/lead.action';
import type { IListarOpcionesResponse, IListarProyectoResponse } from '../interfaces/lead.interface';

// ───────────────────────── Props / Emits ─────────────────────────
const props = defineProps<{
    modelValue: boolean;
    proyectos: IListarProyectoResponse[];
    opcionesFuente: IListarOpcionesResponse[];
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'importado'): void;
}>();

// ───────────────────────── Tipos ─────────────────────────
type Estado = 'pendiente' | 'guardando' | 'creado' | 'omitido' | 'error';

interface FilaImport {
    uid: number;
    fila: number; // número de fila en el Excel
    nombre: string;
    dni: string; // opcional: puede ser ''
    telefono: string;
    errores: { nombre?: string; dni?: string; telefono?: string; duplicado?: string };
    estado: Estado;
    mensaje: string;
}

// ───────────────────────── Estado ─────────────────────────
const toast = useToast();
const authStore = useAuthStore();
const nombreUsuarioActual = computed(() => authStore.username ?? 'Tú');

const proyectoId = ref<number | string>('');
const fuenteId = ref<number | string>('');
const filas = ref<FilaImport[]>([]);
const nombreArchivo = ref('');
const leyendo = ref(false);
const guardando = ref(false);
const arrastrando = ref(false);
const progreso = ref(0);
const totalAGuardar = ref(0);
const inputArchivo = ref<HTMLInputElement | null>(null);
let uidSeq = 0;

// ───────────────────────── Normalizadores ─────────────────────────
// Deja solo dígitos; quita ceros iniciales y el prefijo 51: "+51 987-654-321" -> "987654321"
const normalizarTelefono = (raw: unknown): string => {
    let d = String(raw ?? '').replace(/\D/g, '').replace(/^0+/, '');
    if (d.length === 11 && d.startsWith('51')) d = d.slice(2);
    return d;
};

// Excel guarda el DNI como número y pierde el cero inicial: 7123456 -> 07123456
// Si viene vacío se queda vacío (el DNI es opcional)
const normalizarDni = (raw: unknown): string => {
    let d = String(raw ?? '').replace(/\D/g, '');
    if (d.length === 7) d = d.padStart(8, '0');
    return d;
};

// Solo letras, espacios, apóstrofe y guion; colapsa espacios
const normalizarNombre = (raw: unknown): string =>
    String(raw ?? '').replace(/[^\p{L}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim();

// "dni_(peru)" -> "dni peru", "número_de_teléfono" -> "numero de telefono"
const normalizarClave = (s: unknown): string =>
    String(s ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

// Busca una columna: primero coincidencia exacta, luego "contiene"
const buscarColumna = (headers: string[], exactos: string[], contiene: string[]): number => {
    for (const e of exactos) {
        const i = headers.indexOf(e);
        if (i >= 0) return i;
    }
    return headers.findIndex((h) => contiene.some((c) => h.includes(c)));
};

// ───────────────────────── Validación ─────────────────────────
const revalidar = () => {
    const vistos = new Map<string, number>();

    for (const f of filas.value) {
        f.errores = {};

        if (f.nombre.trim().length < 2) f.errores.nombre = 'Nombre vacío';
        if (!/^\d{9}$/.test(f.telefono)) f.errores.telefono = 'Teléfono inválido (9 dígitos)';

        // DNI opcional: solo se valida si se ingresó
        if (f.dni) {
            if (!/^\d{8,10}$/.test(f.dni)) {
                f.errores.dni = 'DNI inválido (8 a 10 dígitos)';
            } else {
                // DNI repetido dentro del mismo archivo
                const previa = vistos.get(f.dni);
                if (previa !== undefined) f.errores.duplicado = `DNI repetido (fila ${previa})`;
                else vistos.set(f.dni, f.fila);
            }
        }
    }
};

const listaErrores = (f: FilaImport): string[] => Object.values(f.errores).filter(Boolean) as string[];
const tieneErrores = (f: FilaImport) => listaErrores(f).length > 0;
const editable = (f: FilaImport) => !guardando.value && (f.estado === 'pendiente' || f.estado === 'error');

const normalizarFila = (f: FilaImport) => {
    f.telefono = normalizarTelefono(f.telefono);
    revalidar();
};

const quitarFila = (uid: number) => {
    filas.value = filas.value.filter((f) => f.uid !== uid);
    revalidar();
};

// ───────────────────────── Contadores ─────────────────────────
const porGuardar = computed(() =>
    filas.value.filter((f) => (f.estado === 'pendiente' || f.estado === 'error') && !tieneErrores(f)),
);
const totalListos = computed(() => porGuardar.value.length);
const totalConErrores = computed(
    () => filas.value.filter((f) => (f.estado === 'pendiente' || f.estado === 'error') && tieneErrores(f)).length,
);
const totalCreados = computed(() => filas.value.filter((f) => f.estado === 'creado').length);
const totalOmitidos = computed(() => filas.value.filter((f) => f.estado === 'omitido').length);
const porcentaje = computed(() => (totalAGuardar.value ? Math.round((progreso.value / totalAGuardar.value) * 100) : 0));

const puedeGuardar = computed(
    () => !guardando.value && !leyendo.value && !!proyectoId.value && !!fuenteId.value && totalListos.value > 0,
);

// ───────────────────────── Lectura del Excel ─────────────────────────
const procesarArchivo = async (file: File) => {
    if (!/\.(xlsx?|csv)$/i.test(file.name)) {
        toast.warning('Sube un archivo .xls, .xlsx o .csv');
        return;
    }

    leyendo.value = true;
    nombreArchivo.value = file.name;
    filas.value = [];

    try {
        // import dinámico: la librería solo se descarga cuando se usa el modal
        const XLSX = await import('xlsx');
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const hoja = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<unknown[]>(hoja, {
            header: 1,
            defval: '',
            raw: true,
            blankrows: false,
        });

        if (data.length < 2) throw new Error('El archivo no tiene filas de datos');

        const headers = (data[0] as unknown[]).map(normalizarClave);

        const iNombre = buscarColumna(headers, ['full name', 'nombre completo', 'nombres', 'nombre', 'name'], ['full name', 'nombre']);
        const iDni = buscarColumna(headers, ['dni'], ['dni', 'documento']); // opcional
        const iTel = buscarColumna(headers, ['telefono', 'celular', 'phone', 'phone number'], ['telefono', 'celular', 'phone']);

        // El DNI ya no es obligatorio: solo nombre y teléfono
        const faltan = [
            iNombre < 0 && 'nombre',
            iTel < 0 && 'teléfono',
        ].filter(Boolean);
        if (faltan.length) throw new Error(`No se encontró la columna de: ${faltan.join(', ')}`);

        const resultado: FilaImport[] = [];

        data.slice(1).forEach((row, idx) => {
            const r = row as unknown[];
            const nombre = normalizarNombre(r[iNombre]);
            const dni = iDni >= 0 ? normalizarDni(r[iDni]) : '';
            const telefono = normalizarTelefono(r[iTel]);

            if (!nombre && !dni && !telefono) return; // fila vacía

            resultado.push({
                uid: ++uidSeq,
                fila: idx + 2, // +1 por encabezado, +1 porque Excel empieza en 1
                nombre,
                dni,
                telefono,
                errores: {},
                estado: 'pendiente',
                mensaje: '',
            });
        });

        if (!resultado.length) throw new Error('No se encontraron filas con datos');

        filas.value = resultado;
        revalidar();
    } catch (error: any) {
        console.error('Error al leer el Excel:', error);
        toast.error(error?.message || 'No se pudo leer el archivo');
        nombreArchivo.value = '';
    } finally {
        leyendo.value = false;
        if (inputArchivo.value) inputArchivo.value.value = ''; // permite volver a subir el mismo archivo
    }
};

const onArchivo = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) procesarArchivo(file);
};

const onDrop = (e: DragEvent) => {
    arrastrando.value = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) procesarArchivo(file);
};

// ───────────────────────── Guardado ─────────────────────────
const guardar = async () => {
    if (!puedeGuardar.value) return;

    if (!authStore.idEmploye) {
        toast.error('No se encontró el usuario de sesión');
        return;
    }

    const lista = [...porGuardar.value];
    guardando.value = true;
    progreso.value = 0;
    totalAGuardar.value = lista.length;

    let creados = 0;
    let abortado = false;

    // Secuencial a propósito: el backend asigna asesor/valida duplicados y el orden importa
    for (const f of lista) {
        f.estado = 'guardando';

        try {
            const result = await crearLead({
                id_asesor: authStore.idEmploye,
                id_proyecto: Number(proyectoId.value),
                nombre_cliente: f.nombre,
                dni_cliente: f.dni || null,
                telefono_cliente: f.telefono,
                id_fuente: Number(fuenteId.value),
                usuario_creacion: authStore.idEmploye,
            });

            switch (result.accion) {
                case 'CREADO':
                    f.estado = 'creado';
                    f.mensaje = 'Creado';
                    creados++;
                    break;

                case 'CREADO_NUEVO_PROYECTO':
                    f.estado = 'creado';
                    f.mensaje = 'Creado (ya tenía otra oportunidad)';
                    creados++;
                    break;

                case 'ALERTA':
                    f.estado = 'omitido';
                    f.mensaje = result.mensaje || 'Ya tiene un lead activo en este proyecto';
                    break;

                case 'PENDIENTE_ASESOR_NO_ACTIVO':
                    f.estado = 'omitido';
                    f.mensaje = result.mensaje || 'Su asesor actual no está activo';
                    break;

                case 'SIN_ASESOR_ACTIVO':
                    // Si no hay asesores activos, ninguna fila siguiente va a funcionar
                    f.estado = 'pendiente';
                    f.mensaje = '';
                    toast.warning(result.mensaje || 'No hay asesores activos en este momento.');
                    abortado = true;
                    break;

                default:
                    f.estado = 'error';
                    f.mensaje = result.mensaje || 'Respuesta no reconocida';
                    break;
            }
        } catch (error: any) {
            console.error(`Error al guardar fila ${f.fila}:`, error);
            f.estado = 'error';
            f.mensaje = error?.message || 'Error al guardar';
        }

        if (abortado) break;
        progreso.value++;
    }

    guardando.value = false;

    if (creados > 0) {
        emit('importado'); // el padre recarga la tabla
        toast.success(`${creados} lead${creados === 1 ? '' : 's'} creado${creados === 1 ? '' : 's'} correctamente`);
    }

    const omitidos = lista.filter((f) => f.estado === 'omitido').length;
    const fallidos = lista.filter((f) => f.estado === 'error').length;
    if (omitidos) toast.info(`${omitidos} omitido${omitidos === 1 ? '' : 's'} (ya existían o sin asesor activo)`);
    if (fallidos) toast.error(`${fallidos} fallaron. Puedes corregirlos y volver a guardar.`);
};

// ───────────────────────── Cerrar / resetear ─────────────────────────
const resetear = () => {
    proyectoId.value = '';
    fuenteId.value = '';
    filas.value = [];
    nombreArchivo.value = '';
    progreso.value = 0;
    totalAGuardar.value = 0;
};

const cerrar = () => {
    if (guardando.value) return;
    emit('update:modelValue', false);
};

watch(
    () => props.modelValue,
    (abierto) => {
        if (!abierto) resetear();
    },
);
</script>