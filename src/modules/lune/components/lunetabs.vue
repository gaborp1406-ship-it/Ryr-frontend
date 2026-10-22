<template>
    <nav class="flex flex-wrap gap-1" aria-label="Secciones de Luné">
        <router-link v-for="t in tabs" :key="t.name" :to="{ name: t.name }" custom
            v-slot="{ href, navigate, isExactActive }">
            <a :href="href" :class="[
                'border-b-[3px] px-3.5 py-2.5 text-sm font-semibold no-underline',
                isExactActive
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800',
            ]" @click="navigate">
                {{ t.label }}
            </a>
        </router-link>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'LuneTabs',
    setup() {
        const tabs = [
            { name: 'lune', label: 'Ventas' },
            { name: 'lune-egresos', label: 'Egresos' },
            { name: 'lune-reportes', label: 'Reportes' },
        ];
        return { tabs };
    },
});
</script>