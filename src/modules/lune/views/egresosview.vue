<template>
  <div class="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
    <section class="mx-auto max-w-[96rem] px-4 py-6 sm:px-6 lg:px-10">
      <!-- Cabecera -->
      <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-base font-bold text-white shadow-sm" aria-hidden="true">L</span>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900">Luné</h1>
            <p class="text-sm text-zinc-500">Egresos y compras del negocio</p>
          </div>
        </div>
        <LuneTabs />
      </header>

      <!-- Aviso -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <p
          v-if="mensaje"
          role="status"
          :class="[
            'fixed bottom-5 right-5 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-xl',
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
              : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200',
          ]"
        >
          {{ mensaje.texto }}
        </p>
      </transition>

      <!-- Formulario -->
      <form
        class="grid gap-4 p-5 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
        @submit.prevent="guardar"
      >
        <div class="sm:col-span-2">
          <label for="egreso-concepto" class="mb-1 block text-xs font-medium text-zinc-500">Concepto</label>
          <input id="egreso-concepto" v-model.trim="form.concepto" type="text" placeholder="Ej: Queso crema, vasos, gasolina" autocomplete="off" required class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
        </div>

        <div>
          <label for="egreso-monto" class="mb-1 block text-xs font-medium text-zinc-500">Monto (S/)</label>
          <input id="egreso-monto" v-model="form.monto" type="number" min="0" step="0.01" required class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
        </div>

        <div>
          <label for="egreso-categoria" class="mb-1 block text-xs font-medium text-zinc-500">Categoría</label>
          <select id="egreso-categoria" v-model="form.categoria" class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
            <option v-for="c in catalogos.categoriasEgreso" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label for="egreso-proveedor" class="mb-1 block text-xs font-medium text-zinc-500">Proveedor</label>
          <input id="egreso-proveedor" v-model.trim="form.proveedor" type="text" list="egreso-proveedores" placeholder="Makro, Mercado…" autocomplete="off" class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
          <datalist id="egreso-proveedores">
            <option v-for="p in proveedores" :key="p" :value="p" />
          </datalist>
        </div>

        <div>
          <label for="egreso-metodo" class="mb-1 block text-xs font-medium text-zinc-500">Método de pago</label>
          <select id="egreso-metodo" v-model="form.metodoPago" class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
            <option value="">Sin indicar</option>
            <option v-for="m in catalogos.metodosPago" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>

        <div>
          <label for="egreso-socio" class="mb-1 block text-xs font-medium text-zinc-500">Lo pagó</label>
          <select id="egreso-socio" v-model="form.socio" class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
            <option value="">Sin indicar</option>
            <option v-for="s in catalogos.socios" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div>
          <label for="egreso-fecha" class="mb-1 block text-xs font-medium text-zinc-500">Fecha</label>
          <input id="egreso-fecha" v-model="form.fecha" type="date" required class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
        </div>

        <div class="flex items-end sm:col-span-2 lg:col-span-1 lg:justify-end">
          <button type="submit" :disabled="guardando" class="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 w-full">
            {{ guardando ? 'Guardando…' : 'Guardar egreso' }}
          </button>
        </div>
      </form>

      <!-- Listado -->
      <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 class="text-lg font-semibold text-zinc-900">Egresos registrados</h2>

        <div class="flex flex-wrap items-end gap-3">
          <div>
            <label for="fe-desde" class="mb-1 block text-xs font-medium text-zinc-500">Desde</label>
            <input id="fe-desde" v-model="filtros.desde" type="date" class="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
          </div>
          <div>
            <label for="fe-hasta" class="mb-1 block text-xs font-medium text-zinc-500">Hasta</label>
            <input id="fe-hasta" v-model="filtros.hasta" type="date" class="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
          </div>
          <div>
            <label for="fe-categoria" class="mb-1 block text-xs font-medium text-zinc-500">Categoría</label>
            <select id="fe-categoria" v-model="filtros.categoria" class="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
              <option value="">Todas</option>
              <option v-for="c in catalogos.categoriasEgreso" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <span v-if="cargando" class="flex items-center gap-2 pb-2 text-sm text-zinc-500">
            <svg class="h-4 w-4 animate-spin text-zinc-900" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
            Cargando…
          </span>
        </div>
      </div>

      <div class="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200">
        <div v-if="!egresos.length" class="px-6 py-14 text-center">
          <p class="text-sm font-medium text-zinc-900">No hay egresos en este rango</p>
          <p class="mt-1 text-sm text-zinc-500">Registra tu primera compra en el formulario de arriba.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-zinc-100 text-sm">
            <thead class="bg-zinc-50 text-left text-xs font-semibold text-zinc-600">
              <tr>
                <th class="px-4 py-3">Fecha</th>
                <th class="px-4 py-3">Concepto</th>
                <th class="px-4 py-3">Categoría</th>
                <th class="px-4 py-3">Proveedor</th>
                <th class="px-4 py-3">Pago</th>
                <th class="px-4 py-3">Lo pagó</th>
                <th class="px-4 py-3 text-right">Monto</th>
                <th class="px-4 py-3"><span class="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              <tr v-for="e in egresos" :key="e.id" class="transition hover:bg-zinc-50">
                <td class="whitespace-nowrap px-4 py-3 text-zinc-500">{{ fechaCorta(e.fecha) }}</td>
                <td class="px-4 py-3 font-medium text-zinc-900">{{ e.concepto }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200">
                    {{ e.categoria }}
                  </span>
                </td>
                <td class="px-4 py-3 text-zinc-600">{{ e.proveedor || '—' }}</td>
                <td class="px-4 py-3 text-zinc-600">{{ e.metodo_pago || '—' }}</td>
                <td class="px-4 py-3 text-zinc-600">{{ e.socio || '—' }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-zinc-900">
                  {{ soles(e.monto) }}
                </td>
                <td class="px-4 py-3 text-right">
                  <button type="button" class="rounded-md px-2.5 py-1 text-xs font-medium text-rose-600 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900" @click="quitar(e)">Eliminar</button>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-zinc-50">
              <tr>
                <td colspan="6" class="px-4 py-3 text-sm font-medium text-zinc-600">
                  Total ({{ egresos.length }} egresos)
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right text-base font-bold tabular-nums text-zinc-900">
                  {{ soles(total) }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script src="./egresos" lang="ts"></script>