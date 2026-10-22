<template>
  <div class="rounded-lg border border-slate-200 bg-white p-4">
    <div class="mb-3 flex flex-wrap items-end gap-3">
      <div class="flex min-w-[200px] flex-1 flex-col gap-1">
        <label for="clientes-buscar" class="text-xs font-semibold text-slate-500">Buscar cliente</label>
        <input
          id="clientes-buscar"
          v-model="busqueda"
          type="search"
          placeholder="Escribe un nombre"
          class="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>
    </div>

    <p v-if="!filtrados.length" class="px-4 py-8 text-center text-slate-500">
      {{
        busqueda
          ? 'Ningún cliente coincide con la búsqueda.'
          : 'Aún no tienes clientes. Se crean solos al registrar una venta.'
      }}
    </p>

    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr>
            <th class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500">Cliente</th>
            <th class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-500">Pedidos</th>
            <th class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-500">Total comprado</th>
            <th class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-500">Debe</th>
            <th class="whitespace-nowrap border-b-2 border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500">Última compra</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtrados" :key="c.id" class="hover:bg-slate-50">
            <td class="border-b border-slate-100 px-3 py-2">{{ c.nombre }}</td>
            <td class="border-b border-slate-100 px-3 py-2 text-right">{{ c.pedidos }}</td>
            <td class="border-b border-slate-100 px-3 py-2 text-right">{{ soles(c.total_comprado) }}</td>
            <td class="border-b border-slate-100 px-3 py-2 text-right">
              <span
                v-if="c.deuda > 0"
                class="inline-block whitespace-nowrap rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600"
              >
                {{ soles(c.deuda) }}
              </span>
              <span v-else>—</span>
            </td>
            <td class="border-b border-slate-100 px-3 py-2">{{ fechaCorta(c.ultima_compra) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from 'vue';
import type { ICliente } from '../interfaces/lune.interfaces';
import { fechaCorta, soles } from '../interfaces/formato';

export default defineComponent({
  name: 'ClientesTable',
  props: {
    clientes: { type: Array as PropType<ICliente[]>, required: true },
  },
  setup(props) {
    const busqueda = ref('');

    const filtrados = computed(() => {
      const q = busqueda.value.trim().toLowerCase();
      return q ? props.clientes.filter((c) => c.nombre.toLowerCase().includes(q)) : props.clientes;
    });

    return { busqueda, filtrados, fechaCorta, soles };
  },
});
</script>