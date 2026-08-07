<template>

    <div class="p-6 flex items-center justify-center min-h-[70vh]">

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-lg overflow-hidden">

            <!-- Header -->
            <div class="flex flex-col items-center text-center px-8 pt-10 pb-6 border-b border-slate-100">

                <div class="relative w-20 h-20 mb-5">

                    <span class="absolute inset-0 rounded-full bg-rose-50"></span>

                    <svg viewBox="0 0 24 24" fill="none" class="relative w-20 h-20 p-4 text-rose-400">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />

                        <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.6" />
                    </svg>

                </div>


                <h2 class="text-base font-semibold text-slate-800">
                    Lead desistió
                </h2>


                <p class="text-sm text-slate-400 mt-1">
                    Motivo registrado del desistimiento
                </p>

            </div>



            <!-- Contenido -->
            <div class="px-6 py-8">


                <div v-if="cargando" class="text-center text-sm text-slate-400">
                    Cargando información...
                </div>


                <div v-else-if="desistio" class="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4">

                    <p class="text-xs uppercase tracking-wide text-rose-500 font-semibold">
                        Motivo
                    </p>


                    <p class="mt-2 text-base font-semibold text-slate-800">
                        {{ desistio.motivo_nombre }}
                    </p>


                </div>


                <div v-else class="text-center text-sm text-slate-400">
                    No existe información de desistimiento.
                </div>


            </div>


        </div>

    </div>

</template>


<script src="./ClientsDesistio.ts" lang="ts"></script>