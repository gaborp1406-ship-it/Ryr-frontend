<template>
  <div class="p-6 flex items-center justify-center min-h-[70vh]">

    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-lg overflow-hidden">

      <!-- Encabezado con carita -->
      <div class="flex flex-col items-center text-center px-8 pt-10 pb-8">

        <div class="relative w-24 h-24 mb-6">
          <span class="absolute inset-0 rounded-full bg-rose-50"></span>
          <span class="absolute inset-0 rounded-full bg-rose-50/60 scale-125"></span>
          <svg viewBox="0 0 24 24" fill="none" class="relative w-24 h-24 p-5 text-rose-400">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
            <circle cx="8.7" cy="10" r="1.1" fill="currentColor" />
            <circle cx="15.3" cy="10" r="1.1" fill="currentColor" />
            <path
              d="M8.2 16c1-1.4 2.4-2.1 3.8-2.1s2.8.7 3.8 2.1"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
        </div>

        <h2 class="text-lg font-semibold text-slate-800">
          Hasta aquí llegó :(
        </h2>
        <p class="text-sm text-slate-400 mt-1.5 max-w-xs">
          El lead ha sido marcado como desistido
        </p>
      </div>

      </div>
   

  </div>
</template>

<script src="./ClientsDesistio.ts" lang="ts"></script>