import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import VentaForm from '../components/ventaform.vue';
import VentasTable from '../components/ventastable.vue';
import ClientesTable from '../components/clientes.table.vue';
import {
  cobrarDeudaCliente,
  eliminarVenta,
  listarClientes,
  listarVentas,
  marcarVentaPagada,
  obtenerCatalogos,
  obtenerCuentasPorCobrar,
  registrarVenta,
} from '@/modules/lune/actions/lune.action';
import type {
  ICatalogos,
  ICliente,
  ICrearVentaPayload,
  ICuentasPorCobrar,
  IVenta,
} from '@/modules/lune/interfaces/lune.interfaces';
import { hoy, inicioDeMes, soles } from '@/modules/lune/interfaces/formato';
import LuneTabs from '@/modules/lune/components/lunetabs.vue';
import CuentasPorCobrar from '@/modules/lune/components/cuentaporcobrar.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();

const cerrarSesion = async () => {
  await authStore.logout();
  await router.replace('/auth/login');
};
type Seccion = 'ventas' | 'cuentas' | 'clientes';

export default defineComponent({
  name: 'LuneView',
  components: { LuneTabs, VentaForm, VentasTable, CuentasPorCobrar, ClientesTable },
  setup() {
    const seccion = ref<Seccion>('ventas');

    const catalogos = ref<ICatalogos>({
      productos: [],
      metodosPago: [],
      categoriasEgreso: [],
      socios: [],
    });
    const ventas = ref<IVenta[]>([]);
    const cuentas = ref<ICuentasPorCobrar>({ total: 0, clientes: [] });
    const clientes = ref<ICliente[]>([]);

    const filtros = reactive({
      desde: inicioDeMes(),
      hasta: hoy(),
      cliente: '',
      pagado: '' as '' | 'true' | 'false',
    });

    const cargando = ref(false);
    const guardando = ref(false);
    const mensaje = ref<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

    const nombresClientes = computed(() => clientes.value.map((c) => c.nombre));

    // ------------------------------------------------------------ avisos
    let temporizadorMensaje: ReturnType<typeof setTimeout> | undefined;
    const mostrar = (tipo: 'ok' | 'error', texto: string) => {
      mensaje.value = { tipo, texto };
      clearTimeout(temporizadorMensaje);
      temporizadorMensaje = setTimeout(() => (mensaje.value = null), 5000);
    };
    const textoError = (e: unknown, porDefecto: string) => (e instanceof Error ? e.message : porDefecto);

    // ------------------------------------------------------------- cargas
    const cargarVentas = async () => {
      cargando.value = true;
      try {
        ventas.value = await listarVentas({
          desde: filtros.desde || undefined,
          hasta: filtros.hasta || undefined,
          cliente: filtros.cliente.trim() || undefined,
          pagado: filtros.pagado === '' ? undefined : filtros.pagado === 'true',
        });
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudieron cargar las ventas.'));
      } finally {
        cargando.value = false;
      }
    };

    const cargarCuentas = async () => {
      try {
        cuentas.value = await obtenerCuentasPorCobrar();
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudieron cargar las cuentas por cobrar.'));
      }
    };

    const cargarClientes = async () => {
      try {
        clientes.value = await listarClientes();
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudieron cargar los clientes.'));
      }
    };

    const refrescar = () => Promise.all([cargarVentas(), cargarCuentas(), cargarClientes()]);

    // ------------------------------------------------------------ acciones
    const guardarVenta = async (payload: ICrearVentaPayload, listo: () => void) => {
      guardando.value = true;
      try {
        await registrarVenta(payload);
        listo();
        mostrar('ok', `Venta de ${payload.cliente} guardada.`);
        await refrescar();
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudo guardar la venta.'));
      } finally {
        guardando.value = false;
      }
    };

    const quitarVenta = async (venta: IVenta) => {
      if (!window.confirm(`¿Eliminar la venta de ${venta.cliente} por ${soles(venta.monto)}?`)) return;
      try {
        await eliminarVenta(venta.id);
        mostrar('ok', 'Venta eliminada.');
        await refrescar();
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudo eliminar la venta.'));
      }
    };

    const cobrarCliente = async (clienteId: number, nombre: string, metodo: string) => {
      try {
        const r = await cobrarDeudaCliente(clienteId, metodo);
        mostrar('ok', `Cobraste ${soles(r.monto_cobrado)} a ${nombre}.`);
        await refrescar();
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudo cobrar al cliente.'));
      }
    };

    const cobrarVenta = async (ventaId: number, metodo: string) => {
      try {
        await marcarVentaPagada(ventaId, metodo);
        mostrar('ok', 'Venta cobrada.');
        await refrescar();
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudo cobrar la venta.'));
      }
    };

    // ----------------------------------------------------------- ciclo de vida
    // Los filtros recargan la lista solos (con una pequeña espera al escribir)
    let temporizadorFiltros: ReturnType<typeof setTimeout> | undefined;
    watch(filtros, () => {
      clearTimeout(temporizadorFiltros);
      temporizadorFiltros = setTimeout(cargarVentas, 300);
    });

    onMounted(async () => {
      try {
        catalogos.value = await obtenerCatalogos();
      } catch (e) {
        mostrar('error', textoError(e, 'No se pudieron cargar los productos.'));
      }
      await refrescar();
    });

    onBeforeUnmount(() => {
      clearTimeout(temporizadorMensaje);
      clearTimeout(temporizadorFiltros);
    });

    return {
      seccion,
      catalogos,
      cerrarSesion,
      ventas,
      cuentas,
      clientes,
      filtros,
      cargando,
      guardando,
      mensaje,
      nombresClientes,
      guardarVenta,
      quitarVenta,
      cobrarCliente,
      cobrarVenta,
    };
  },
});