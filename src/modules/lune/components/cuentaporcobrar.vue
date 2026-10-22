<template>
  <div>
    <div
      class="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 rounded-lg border border-slate-200 bg-white p-4"
    >
      <span class="text-slate-500">Te deben en total</span>
      <strong class="text-3xl font-bold tracking-tight text-rose-600">{{ soles(cuentas.total) }}</strong>
      <label class="flex items-center gap-2">
        <span class="text-xs text-slate-500">Al cobrar, pagó por</span>
        <select
          v-model="metodo"
          aria-label="Método de pago al cobrar"
          class="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option v-for="m in metodosPago" :key="m" :value="m">{{ m }}</option>
        </select>
      </label>
    </div>

    <p
      v-if="!cuentas.clientes.length"
      class="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-slate-500"
    >
      Nadie te debe nada. Cuando registres una venta sin marcar "Ya pagó", aparecerá aquí.
    </p>

    <div v-else class="grid gap-2.5">
      <details v-for="c in cuentas.clientes" :key="c.cliente_id" class="rounded-lg border border-slate-200 bg-white">
        <summary
          class="flex cursor-pointer list-none flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 [&::-webkit-details-marker]:hidden"
        >
          <div>
            <div class="font-bold">{{ c.cliente }}</div>
            <div class="text-xs text-slate-500">
              {{ c.pedidos }} {{ c.pedidos === 1 ? 'pedido' : 'pedidos' }}, desde el {{ fechaCorta(c.desde) }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-rose-600">{{ soles(c.deuda) }}</span>
            <button
              type="button"
              class="h-8 rounded-md bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              @click.stop.prevent="$emit('cobrar-cliente', c.cliente_id, c.cliente, metodo)"
            >
              Cobrar todo
            </button>
          </div>
        </summary>

        <div class="border-t border-slate-200 px-4 pb-3 pt-1">
          <div
            v-for="d in c.detalle"
            :key="d.venta_id"
            class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-1.5"
          >
            <span>{{ fechaCorta(d.fecha) }}: {{ d.cantidad }} × {{ d.producto }}</span>
            <span class="flex items-center gap-2">
              {{ soles(d.monto) }}
              <button
                type="button"
                class="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-violet-700 hover:bg-violet-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                @click="$emit('cobrar-venta', d.venta_id, metodo)"
              >
                Cobrar
              </button>
            </span>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from 'vue';
import type { ICuentasPorCobrar } from '../interfaces/lune.interfaces';
import { fechaCorta, soles } from '../interfaces/formato';

export default defineComponent({
  name: 'CuentasPorCobrar',
  props: {
    cuentas: { type: Object as PropType<ICuentasPorCobrar>, required: true },
    metodosPago: { type: Array as PropType<string[]>, required: true },
  },
  emits: {
    'cobrar-cliente': (_clienteId: number, _nombre: string, _metodo: string) => true,
    'cobrar-venta': (_ventaId: number, _metodo: string) => true,
  },
  setup() {
    const metodo = ref('Yape');
    return { metodo, fechaCorta, soles };
  },
});
</script>