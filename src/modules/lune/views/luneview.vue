<template>
  <div class="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
    <section class="mx-auto max-w-[96rem] px-4 py-6 sm:px-6 lg:px-10">
      <!-- Cabecera -->

<header
  class="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
>
  <!-- Marca -->
  <div class="flex items-center gap-3">
    <span
      class="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-base font-bold text-white shadow-sm"
      aria-hidden="true"
    >
      L
    </span>

    <div>
      <h1 class="text-2xl font-bold tracking-tight text-zinc-900">
        Luné
      </h1>
      <p class="text-sm text-zinc-500">
        Ventas, cobros y clientes
      </p>
    </div>
  </div>

  <!-- Navegación y cierre de sesión -->
  <div class="flex flex-wrap items-center gap-3">
    <LuneTabs />

   
  </div>
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

      <!-- Nueva venta -->
      <VentaForm
        :productos="catalogos.productos"
        :metodos-pago="catalogos.metodosPago"
        :clientes="nombresClientes"
        :guardando="guardando"
        @guardar="guardarVenta"
      />

      <!-- Sub-pestañas -->
      <div class="mt-8 inline-flex flex-wrap gap-1 rounded-xl bg-zinc-200/70 p-1" role="tablist" aria-label="Secciones de ventas">
        <button type="button" role="tab" :aria-selected="seccion === 'ventas'" class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 aria-selected:bg-zinc-900 aria-selected:font-semibold aria-selected:text-white aria-selected:shadow-sm" @click="seccion = 'ventas'">
          Ventas
        </button>
        <button type="button" role="tab" :aria-selected="seccion === 'cuentas'" class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 aria-selected:bg-zinc-900 aria-selected:font-semibold aria-selected:text-white aria-selected:shadow-sm" @click="seccion = 'cuentas'">
          Cuentas por cobrar
          <span v-if="cuentas.clientes.length" class="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold leading-5 text-white">
            {{ cuentas.clientes.length }}
          </span>
        </button>
        <button type="button" role="tab" :aria-selected="seccion === 'clientes'" class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 aria-selected:bg-zinc-900 aria-selected:font-semibold aria-selected:text-white aria-selected:shadow-sm" @click="seccion = 'clientes'">
          Clientes
        </button>
      </div>

      <!-- Ventas -->
      <template v-if="seccion === 'ventas'">
        <div class="mt-5 flex flex-wrap items-end gap-3">
          <div>
            <label for="f-desde" class="mb-1 block text-xs font-medium text-zinc-500">Desde</label>
            <input id="f-desde" v-model="filtros.desde" type="date" class="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
          </div>
          <div>
            <label for="f-hasta" class="mb-1 block text-xs font-medium text-zinc-500">Hasta</label>
            <input id="f-hasta" v-model="filtros.hasta" type="date" class="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
          </div>
          <div class="min-w-[12rem] flex-1">
            <label for="f-cliente" class="mb-1 block text-xs font-medium text-zinc-500">Cliente</label>
            <input id="f-cliente" v-model="filtros.cliente" type="search" placeholder="Buscar por nombre" class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10" />
          </div>
          <div>
            <label for="f-estado" class="mb-1 block text-xs font-medium text-zinc-500">Estado</label>
            <select id="f-estado" v-model="filtros.pagado" class="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10">
              <option value="">Todas</option>
              <option value="true">Pagadas</option>
              <option value="false">Pendientes</option>
            </select>
          </div>
          <span v-if="cargando" class="flex items-center gap-2 pb-2 text-sm text-zinc-500">
            <svg class="h-4 w-4 animate-spin text-zinc-900" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
            Cargando…
          </span>
        </div>

        <div class="mt-4">
          <VentasTable :ventas="ventas" @eliminar="quitarVenta" />
        </div>
      </template>

      <!-- Cuentas por cobrar -->
      <div v-else-if="seccion === 'cuentas'" class="mt-5">
        <CuentasPorCobrar
          :cuentas="cuentas"
          :metodos-pago="catalogos.metodosPago"
          @cobrar-cliente="cobrarCliente"
          @cobrar-venta="cobrarVenta"
        />
      </div>

      <!-- Clientes -->
      <div v-else class="mt-5">
        <ClientesTable :clientes="clientes" />
      </div>

      <!-- Cerrar sesión: parte inferior de la vista -->
<footer
  class="mt-10 flex justify-end border-t border-zinc-200 pt-5"
>
  <button
    type="button"
    class="menu-link menu-link--logout inline-flex items-center gap-3 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
    @click="cerrarSesion"
  >
    <span class="menu-icon flex items-center justify-center">
      <i class="uil uil-sign-in-alt text-lg"></i>
    </span>

    <span class="menu-text">
      Cerrar sesión
    </span>
  </button>
</footer>
    </section>
  </div>
</template>

<script src="./lune.ts" lang="ts"></script>