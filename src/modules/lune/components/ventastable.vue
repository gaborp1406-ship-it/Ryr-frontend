<template>
    <div class="rounded-lg border border-slate-200 bg-white p-4">
        <p v-if="!ventas.length" class="px-4 py-8 text-center text-slate-500">
            No hay ventas con estos filtros. Registra una arriba o amplía el rango de fechas.
        </p>

        <div v-else class="overflow-x-auto">
            <table class="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                    <tr>
                        <th
                            class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            Fecha</th>
                        <th
                            class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            Cliente</th>
                        <th
                            class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            Productos</th>
                        <th
                            class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-500">
                            Monto</th>
                        <th
                            class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            Pago</th>
                        <th
                            class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            Entrega</th>
                        <th class="border-b-2 border-slate-200 px-3 py-2"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="v in ventas" :key="v.id" class="hover:bg-slate-50">
                        <td class="whitespace-nowrap border-b border-slate-100 px-3 py-2">{{ fechaCorta(v.fecha) }}</td>
                        <td class="border-b border-slate-100 px-3 py-2">{{ v.cliente.nombre }}</td>
                        <td class="border-b border-slate-100 px-3 py-2">
                            <ul class="space-y-0.5">
                                <li v-for="i in v.items" :key="i.id" class="text-slate-700">
                                    <span class="font-semibold tabular-nums">{{ i.cantidad }}×</span> {{ i.producto }}
                                </li>
                            </ul>
                        </td>
                        <td class="whitespace-nowrap border-b border-slate-100 px-3 py-2 text-right tabular-nums">{{
                            soles(v.monto) }}</td>
                        <td class="border-b border-slate-100 px-3 py-2">
                            <span v-if="v.pagado"
                                class="inline-block whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                Pagó{{ v.metodoPago ? ` por ${v.metodoPago}` : '' }}
                            </span>
                            <span v-else
                                class="inline-block whitespace-nowrap rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
                                Debe
                            </span>
                        </td>
                        <td class="border-b border-slate-100 px-3 py-2">
                            <span v-if="v.estado === 'agendado'"
                                class="inline-block whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                                Agendado{{ v.fechaEntrega ? ` · ${fechaCorta(v.fechaEntrega)}` : '' }}
                            </span>
                            <span v-else
                                class="inline-block whitespace-nowrap rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                                Entregado
                            </span>
                        </td>
                        <td class="whitespace-nowrap border-b border-slate-100 px-3 py-2 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <!-- Ojito: descarga el PDF -->
                                <button type="button" title="Ver detalle (descargar PDF)"
                                    aria-label="Descargar detalle del pedido en PDF" :disabled="descargandoId === v.id"
                                    class="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-violet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-wait disabled:opacity-50"
                                    @click="$emit('ver', v)">
                                    <svg v-if="descargandoId !== v.id" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" aria-hidden="true">
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    <svg v-else class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"
                                        aria-hidden="true">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4" />
                                        <path class="opacity-90" fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                </button>

                                <button v-if="v.estado === 'agendado'" type="button"
                                    class="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                                    @click="$emit('entregar', v)">
                                    Entregar
                                </button>

                                <button type="button"
                                    class="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                                    @click="$emit('eliminar', v)">
                                    Eliminar
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="font-bold">
                        <td colspan="3" class="px-3 pt-3">Total ({{ ventas.length }} ventas)</td>
                        <td class="px-3 pt-3 text-right tabular-nums">{{ soles(totales.total) }}</td>
                        <td colspan="3" class="px-3 pt-3">
                            Cobrado {{ soles(totales.cobrado) }} / Debe {{ soles(totales.debe) }}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import type { IVenta } from '../interfaces/lune.interfaces';
import { fechaCorta, soles } from '../interfaces/formato';

export default defineComponent({
    name: 'VentasTable',
    props: {
        ventas: { type: Array as PropType<IVenta[]>, required: true },
        descargandoId: { type: Number as PropType<number | null>, default: null },
    },
    emits: {
        eliminar: (_venta: IVenta) => true,
        entregar: (_venta: IVenta) => true,
        ver: (_venta: IVenta) => true,
    },
    setup(props) {
        const totales = computed(() => {
            const total = props.ventas.reduce((s, v) => s + v.monto, 0);
            const cobrado = props.ventas.filter((v) => v.pagado).reduce((s, v) => s + v.monto, 0);
            return { total, cobrado, debe: total - cobrado };
        });

        return { totales, fechaCorta, soles };
    },
});
</script>