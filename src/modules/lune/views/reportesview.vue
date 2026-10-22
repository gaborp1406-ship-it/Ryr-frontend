<template>
  <div class="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
    <section class="mx-auto max-w-[96rem] px-4 py-6 sm:px-6 lg:px-10">
      <!-- Cabecera -->
      <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-base font-bold text-white shadow-sm" aria-hidden="true">L</span>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900">Luné</h1>
            <p class="text-sm text-zinc-500">Cómo va el negocio</p>
          </div>
        </div>
        <LuneTabs />
      </header>

      <p v-if="error" role="alert" class="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">
        {{ error }}
      </p>

      <!-- Filtros -->
      <div class="flex flex-wrap items-end gap-3">
        <div>
          <label for="r-desde" class="mb-1 block text-xs font-medium text-zinc-500">Desde</label>
          <input id="r-desde" v-model="filtros.desde" type="date" class="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
        </div>
        <div>
          <label for="r-hasta" class="mb-1 block text-xs font-medium text-zinc-500">Hasta</label>
          <input id="r-hasta" v-model="filtros.hasta" type="date" class="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
        </div>
        <div class="inline-flex gap-1 rounded-xl bg-zinc-200/70 p-1">
          <button type="button" class="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-white hover:text-zinc-900 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900" @click="aplicarRango('hoy')">Hoy</button>
          <button type="button" class="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-white hover:text-zinc-900 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900" @click="aplicarRango('semana')">Últimos 7 días</button>
          <button type="button" class="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-white hover:text-zinc-900 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900" @click="aplicarRango('mes')">Este mes</button>
        </div>
        <span v-if="cargando" class="flex items-center gap-2 pb-2 text-sm text-zinc-500">
          <svg class="h-4 w-4 animate-spin text-zinc-900" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
          Cargando…
        </span>
      </div>

      <template v-if="reporte">
        <!-- KPIs -->
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Ganancia en caja (destacado) -->
          <div
            :class="[
              'rounded-xl p-5 shadow-lg sm:col-span-2 lg:col-span-1 lg:row-span-2',
              reporte.resumen.utilidad_caja < 0
                ? 'bg-rose-50 text-rose-700 shadow-rose-500/10 ring-1 ring-rose-200'
                : 'bg-zinc-900 text-white shadow-zinc-900/20',
            ]"
          >
            <span :class="['text-sm font-medium', reporte.resumen.utilidad_caja < 0 ? 'text-rose-700/80' : 'text-zinc-400']">
              Ganancia en caja
            </span>
            <strong class="mt-2 block text-4xl font-bold tracking-tight tabular-nums">
              {{ soles(reporte.resumen.utilidad_caja) }}
            </strong>
            <p :class="['mt-4 text-sm leading-relaxed', reporte.resumen.utilidad_caja < 0 ? 'text-rose-700/80' : 'text-zinc-400']">
              Cobrado menos egresos.
            </p>
            <div :class="['mt-4 rounded-xl px-4 py-3 text-sm', reporte.resumen.utilidad_caja < 0 ? 'bg-white/70' : 'bg-white/10']">
              <span :class="reporte.resumen.utilidad_caja < 0 ? 'text-rose-700' : 'text-emerald-400'">
                Margen {{ reporte.resumen.margen_pct }}%
              </span>
            </div>
          </div>

          <div class="p-5 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
            <span class="text-sm font-medium text-zinc-500">Vendido</span>
            <strong class="mt-1 block text-2xl font-bold tabular-nums text-zinc-900">
              {{ soles(reporte.resumen.ventas) }}
            </strong>
          </div>

          <div class="p-5 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
            <span class="text-sm font-medium text-zinc-500">Cobrado</span>
            <strong class="mt-1 block text-2xl font-bold tabular-nums text-emerald-600">
              {{ soles(reporte.resumen.cobrado) }}
            </strong>
          </div>

          <div class="p-5 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
            <span class="text-sm font-medium text-zinc-500">Egresos</span>
            <strong class="mt-1 block text-2xl font-bold tabular-nums text-zinc-900">
              {{ soles(reporte.resumen.egresos) }}
            </strong>
          </div>

          <div
            :class="[
              'rounded-xl p-5 shadow-sm ring-1',
              reporte.resumen.deuda_total > 0 ? 'bg-rose-50 ring-rose-200' : 'bg-white ring-zinc-200',
            ]"
          >
            <span class="text-sm font-medium text-zinc-500">Te deben (todo el historial)</span>
            <strong
              :class="[
                'mt-1 block text-2xl font-bold tabular-nums',
                reporte.resumen.deuda_total > 0 ? 'text-rose-600' : 'text-zinc-900',
              ]"
            >
              {{ soles(reporte.resumen.deuda_total) }}
            </strong>
          </div>
        </div>

        <!-- Ventas por día -->
        <div class="mt-4 p-5 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
          <h2 class="text-base font-semibold text-zinc-900">Ventas por día</h2>
          <p v-if="!reporte.ventas_por_dia.length" class="py-10 text-center text-sm text-zinc-500">
            No hay ventas en este rango.
          </p>
          <div v-else class="mt-4 overflow-x-auto pb-1">
            <div class="flex h-56 items-stretch gap-2" role="img" aria-label="Ventas por día">
              <div
                v-for="d in reporte.ventas_por_dia"
                :key="d.fecha"
                class="group flex min-w-[2.75rem] flex-1 flex-col items-center gap-1"
                :title="`${fechaCorta(d.fecha)}: ${soles(d.ventas)}`"
              >
                <span class="text-[10px] font-medium tabular-nums text-zinc-500">
                  {{ soles(d.ventas).replace('S/ ', '') }}
                </span>
                <div class="flex w-full flex-1 items-end rounded-t-md bg-zinc-100">
                  <div
                    class="w-full rounded-t-md bg-zinc-900 transition group-hover:bg-zinc-700"
                    :style="{ height: porcentaje(d.ventas, maxDia) }"
                  ></div>
                </div>
                <span class="text-[10px] text-zinc-500">{{ fechaCorta(d.fecha) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Productos y egresos -->
        <div class="mt-4 grid gap-4 lg:grid-cols-2">
          <div class="p-5 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
            <h2 class="text-base font-semibold text-zinc-900">Qué se vende más</h2>
            <p v-if="!reporte.por_producto.length" class="py-10 text-center text-sm text-zinc-500">
              Sin ventas en este rango.
            </p>
            <ul v-else class="mt-4 space-y-4">
              <li v-for="p in reporte.por_producto" :key="p.producto">
                <div class="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span class="text-zinc-600">{{ p.producto }} ({{ p.unidades }} u.)</span>
                  <strong class="font-semibold tabular-nums text-zinc-900">{{ soles(p.monto) }}</strong>
                </div>
                <div class="h-2.5 overflow-hidden rounded-full bg-zinc-100">
                  <div class="h-full rounded-full bg-zinc-900" :style="{ width: porcentaje(p.monto, maxProducto) }"></div>
                </div>
              </li>
            </ul>
          </div>

          <div class="p-5 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
            <h2 class="text-base font-semibold text-zinc-900">En qué gastas</h2>
            <p v-if="!reporte.egresos_por_categoria.length" class="py-10 text-center text-sm text-zinc-500">
              Sin egresos en este rango.
            </p>
            <ul v-else class="mt-4 space-y-4">
              <li v-for="c in reporte.egresos_por_categoria" :key="c.categoria">
                <div class="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span class="text-zinc-600">{{ c.categoria }}</span>
                  <strong class="font-semibold tabular-nums text-zinc-900">{{ soles(c.monto) }}</strong>
                </div>
                <div class="h-2.5 overflow-hidden rounded-full bg-zinc-100">
                  <div class="h-full rounded-full bg-rose-400" :style="{ width: porcentaje(c.monto, maxCategoria) }"></div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Mejores clientes -->
        <div class="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
          <h2 class="px-5 pt-5 text-base font-semibold text-zinc-900">Mejores clientes</h2>
          <p v-if="!reporte.top_clientes.length" class="px-5 py-10 text-center text-sm text-zinc-500">
            Sin ventas en este rango.
          </p>
          <div v-else class="mt-3 overflow-x-auto">
            <table class="min-w-full divide-y divide-zinc-100 text-sm">
              <thead class="bg-zinc-50 text-left text-xs font-semibold text-zinc-600">
                <tr>
                  <th class="px-5 py-3">Cliente</th>
                  <th class="px-5 py-3 text-right">Pedidos</th>
                  <th class="px-5 py-3 text-right">Compró</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-for="c in reporte.top_clientes" :key="c.cliente" class="transition hover:bg-zinc-50">
                  <td class="px-5 py-3 font-medium text-zinc-900">{{ c.cliente }}</td>
                  <td class="px-5 py-3 text-right tabular-nums text-zinc-600">{{ c.pedidos }}</td>
                  <td class="px-5 py-3 text-right font-semibold tabular-nums text-zinc-900">{{ soles(c.monto) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script src="./reportes" lang="ts"></script>