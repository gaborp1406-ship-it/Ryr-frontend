import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

import LuneTabs from '@/modules/lune/components/lunetabs.vue';

import {
  eliminarEgreso,
  listarEgresos,
  obtenerCatalogos,
  registrarEgreso,
} from '@/modules/lune/actions/lune.action';
import type { ICatalogos, IEgreso } from '@/modules/lune/interfaces/lune.interfaces';
import { fechaCorta, hoy, inicioDeMes, soles } from '@/modules/lune/interfaces/formato';

export default defineComponent({
  name: 'EgresosView',
  components: { LuneTabs },
  setup() {
  const catalogos = ref<ICatalogos>({
  productos: [],
  metodosPago: [],
  categoriasEgreso: [],
  socios: [],
  estadosVenta: [],
});
    const egresos = ref<IEgreso[]>([]);

    const form = reactive({
      concepto: '',
      monto: '' as string | number,
      categoria: 'Insumos',
      proveedor: '',
      metodoPago: '',
      socio: '',
      fecha: hoy(),
    });

    const filtros = reactive({ desde: inicioDeMes(), hasta: hoy(), categoria: '' });

    const cargando = ref(false);
    const guardando = ref(false);
    const mensaje = ref<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

    const total = computed(() => egresos.value.reduce((s, e) => s + e.monto, 0));
    const proveedores = computed(() => [
      ...new Set(egresos.value.map((e) => e.proveedor).filter((p): p is string => !!p)),
    ]);

    // ------------------------------------------------------------ avisos
    let temporizadorMensaje: ReturnType<typeof setTimeout> | undefined;
    const mostrar = (tipo: 'ok' | 'error', texto: string) => {
      mensaje.value = { tipo, texto };
      clearTimeout(temporizadorMensaje);
      temporizadorMensaje = setTimeout(() => (mensaje.value = null), 5000);
    };
    const textoError = (e: unknown, porDefecto: string) => (e instanceof Error ? e.message : porDefecto);

    // ------------------------------------------------------------- cargas
    const cargar = async () => {
      cargando.value = true;
      try {
        egresos.value = await listarEgresos({
          desde: filtros.desde || undefined,
          hasta: filtros.hasta || undefined,
          categoria: filtros.categoria || undefined,
        });
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudieron cargar los egresos.'));
      } finally {
        cargando.value = false;
      }
    };

    // ------------------------------------------------------------ acciones
    const guardar = async () => {
      guardando.value = true;
      try {
        await registrarEgreso({
          concepto: form.concepto,
          monto: Number(form.monto),
          categoria: form.categoria,
          proveedor: form.proveedor || undefined,
          metodoPago: form.metodoPago || undefined,
          socio: form.socio || undefined,
          fecha: form.fecha,
        });
        mostrar('ok', `Egreso "${form.concepto}" guardado.`);
        // Se conservan categoría, proveedor, método, socio y fecha para cargar varias compras seguidas
        form.concepto = '';
        form.monto = '';
        await cargar();
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudo guardar el egreso.'));
      } finally {
        guardando.value = false;
      }
    };

    const quitar = async (egreso: IEgreso) => {
      if (!window.confirm(`¿Eliminar "${egreso.concepto}" por ${soles(egreso.monto)}?`)) return;
      try {
        await eliminarEgreso(egreso.id);
        mostrar('ok', 'Egreso eliminado.');
        await cargar();
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudo eliminar el egreso.'));
      }
    };

    // ----------------------------------------------------------- ciclo de vida
    let temporizadorFiltros: ReturnType<typeof setTimeout> | undefined;
    watch(filtros, () => {
      clearTimeout(temporizadorFiltros);
      temporizadorFiltros = setTimeout(cargar, 300);
    });

    onMounted(async () => {
      try {
        catalogos.value = await obtenerCatalogos();
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudieron cargar las listas.'));
      }
      await cargar();
    });

    onBeforeUnmount(() => {
      clearTimeout(temporizadorMensaje);
      clearTimeout(temporizadorFiltros);
    });

    return {
      catalogos,
      egresos,
      form,
      filtros,
      cargando,
      guardando,
      mensaje,
      total,
      proveedores,
      guardar,
      quitar,
      fechaCorta,
      soles,
    };
  },
});