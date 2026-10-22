<template>
  <div class="rounded-lg border border-slate-200 bg-white p-4">
    <p v-if="!ventas.length" class="px-4 py-8 text-center text-slate-500">
      No hay ventas con estos filtros. Registra una arriba o amplía el rango de fechas.
    </p>

    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr>
            <th class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500">Fecha</th>
            <th class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500">Cliente</th>
            <th class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500">Producto</th>
            <th class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-500">Cant.</th>
            <th class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-500">Monto</th>
            <th class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500">Estado</th>
            <th class="border-b-2 border-slate-200 px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in ventas" :key="v.id" class="hover:bg-slate-50">
            <td class="border-b border-slate-100 px-3 py-2">{{ fechaCorta(v.fecha) }}</td>
            <td class="border-b border-slate-100 px-3 py-2">{{ v.cliente }}</td>
            <td class="border-b border-slate-100 px-3 py-2">{{ v.producto }}</td>
            <td class="border-b border-slate-100 px-3 py-2 text-right">{{ v.cantidad }}</td>
            <td class="border-b border-slate-100 px-3 py-2 text-right">{{ soles(v.monto) }}</td>
            <td class="border-b border-slate-100 px-3 py-2">
              <span
                v-if="v.pagado"
                class="inline-block whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"
              >
                Pagó{{ v.metodo_pago ? ` por ${v.metodo_pago}` : '' }}
              </span>
              <span
                v-else
                class="inline-block whitespace-nowrap rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600"
              >
                Debe
              </span>
            </td>
            <td class="whitespace-nowrap border-b border-slate-100 px-3 py-2 text-right">
              <button
                type="button"
                class="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                @click="$emit('eliminar', v)"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="font-bold">
            <td colspan="4" class="px-3 pt-3">Total ({{ ventas.length }} ventas)</td>
            <td class="px-3 pt-3 text-right">{{ soles(totales.total) }}</td>
            <td colspan="2" class="px-3 pt-3">
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
  },
  emits: {
    eliminar: (_venta: IVenta) => true,
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