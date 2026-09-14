import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue';
import {
  obtenerContactoPorAsesorDashboard,
  obtenerLeadsContactadosAsesorDashboard,
  obtenerRangosContactoDashboard,
  obtenerResumenContactoDashboard,
} from '../actions/dashboardContabilidad';




// ============================================================
// TIPOS
// ============================================================

interface AsesorLeadsBar {
  id: number | string;
  name: string;
  value: number;
  percent: number;
}

interface AsesorTiempoBar {
  id: number | string;
  name: string;
  minutos: number;
  texto: string;
  percent: number;
}

interface RangoContactoRow {
  orden: number;
  rango: string;
  cantidad: number;
}


// ============================================================
// HELPERS
// ============================================================

const numero = (valor: unknown): number => {
  const resultado = Number(valor);

  return Number.isFinite(resultado)
    ? resultado
    : 0;
};


// Busca el primer valor numérico válido entre varias
// posibles llaves, porque el nombre exacto de cada campo
// puede variar según cómo lo entregue el backend.
const primerValor = (
  objeto: any,
  llaves: string[],
): number => {

  for (const llave of llaves) {
    if (objeto?.[llave] !== undefined && objeto?.[llave] !== null) {
      return numero(objeto[llave]);
    }
  }

  return 0;
};


const primerTexto = (
  objeto: any,
  llaves: string[],
  porDefecto = 'Sin nombre',
): string => {

  for (const llave of llaves) {
    if (objeto?.[llave]) {
      return String(objeto[llave]);
    }
  }

  return porDefecto;
};


const formatearNumero = (valor: unknown): string => {
  return numero(valor).toLocaleString('es-PE');
};


const formatearDecimal = (valor: unknown): string => {
  return numero(valor).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};


// Convierte textos tipo "10 min 28 seg" a minutos decimales (10.47).
// Si el valor ya viene como número, lo respeta tal cual.
const parseMinutosTexto = (valor: unknown): number => {

  if (typeof valor === 'number') {
    return valor;
  }

  const texto = String(valor ?? '').trim();

  const matchMin = texto.match(/(\d+(?:[.,]\d+)?)\s*min/i);
  const matchSeg = texto.match(/(\d+(?:[.,]\d+)?)\s*seg/i);

  if (!matchMin && !matchSeg) {
    // No tenía el formato "X min Y seg": puede que ya sea
    // un número en texto plano (ej. "10.47" o "10,47").
    return numero(texto.replace(',', '.'));
  }

  const minutos = matchMin
    ? Number(matchMin[1].replace(',', '.'))
    : 0;

  const segundos = matchSeg
    ? Number(matchSeg[1].replace(',', '.'))
    : 0;

  return Number((minutos + segundos / 60).toFixed(2));
};


export default defineComponent({
  name: 'DashboardContactabilidad',

  props: {
    fechaInicio: {
      type: String,
      default: null,
    },

    fechaFin: {
      type: String,
      default: null,
    },

    // Asesor controlado por el componente padre (DashboardAllView)
    idAsesor: {
      type: [Number, null] as PropType<number | null>,
      default: null,
    },
  },

  setup(props) {

    // ========================================================
    // LOADING
    // ========================================================

    const cargando = ref(false);

    const errorDashboard = ref<string | null>(null);


    // ========================================================
    // DATOS RAW DE LAS 4 APIS
    // ========================================================

    const resumenContacto = ref<any>(null);

    const contactoPorAsesor = ref<any[]>([]);

    const rangosContacto = ref<any[]>([]);

    const leadsContactadosAsesor = ref<any[]>([]);


    // ========================================================
    // CARGAR DASHBOARD (solo las 4 APIs indicadas)
    // ========================================================

    const cargarDashboard = async () => {
      try {
        cargando.value = true;
        errorDashboard.value = null;

        const [
          contacto,
          rangos,
          resumen,
          asesoresRes,
        ] = await Promise.all([
          obtenerContactoPorAsesorDashboard({
            fechaInicio: props.fechaInicio,
            fechaFin: props.fechaFin,
            idAsesor: props.idAsesor,
          }),

          obtenerRangosContactoDashboard({
            fechaInicio: props.fechaInicio,
            fechaFin: props.fechaFin,
            idAsesor: props.idAsesor,
          }),

          obtenerResumenContactoDashboard({
            fechaInicio: props.fechaInicio,
            fechaFin: props.fechaFin,
            idAsesor: props.idAsesor,
          }),

          obtenerLeadsContactadosAsesorDashboard({
            fechaInicio: props.fechaInicio,
            fechaFin: props.fechaFin,
            idAsesor: props.idAsesor,
          }),
        ]);


        // ==============================================
        // CONTACTO POR ASESOR
        // (asesor, cantidad de leads contactados,
        //  promedio de tiempo de contacto)
        // ==============================================

        contactoPorAsesor.value =
          Array.isArray(contacto)
            ? contacto
            : [];


        // ==============================================
        // RANGOS DE CONTACTO
        // ==============================================

        rangosContacto.value =
          Array.isArray(rangos)
            ? rangos
            : [];


        // ==============================================
        // RESUMEN
        // ==============================================

        if (Array.isArray(resumen)) {
          resumenContacto.value =
            resumen[0] ?? null;
        } else {
          resumenContacto.value =
            resumen ?? null;
        }


        // ==============================================
        // LEADS CONTACTADOS POR ASESOR
        // ==============================================

        leadsContactadosAsesor.value =
          Array.isArray(asesoresRes)
            ? asesoresRes
            : [];

      } catch (error) {
        console.error(
          'Error cargando dashboard de contactabilidad:',
          error,
        );

        errorDashboard.value =
          error instanceof Error
            ? error.message
            : 'Error al cargar el dashboard.';
      } finally {
        cargando.value = false;
      }
    };


    // ========================================================
    // KPI - N° DE LEADS ENTRANTES
    // (viene del resumen de contacto)
    // ========================================================

    const leadsEntrantes = computed(() => {
      return primerValor(resumenContacto.value, [
        'total_leads',
        'leads_entrantes',
        'total',
      ]);
    });


    // ========================================================
    // KPI - LEADS CONTACTADOS (total)
    // ========================================================

    const leadsContactadosTotal = computed(() => {
      return primerValor(resumenContacto.value, [
        'leads_contactados',
        'contactados',
      ]);
    });


    // ========================================================
    // KPI - MINUTOS / HORAS PROMEDIO
    // ========================================================

    const minutosPromedio = computed(() => {
      return primerValor(resumenContacto.value, [
        'promedio_minutos',
        'minutos_promedio',
      ]);
    });

    const horasPromedio = computed(() => {
      return primerValor(resumenContacto.value, [
        'promedio_horas',
        'horas_promedio',
      ]);
    });


    // ========================================================
    // GRÁFICO — LEADS CONTACTADOS POR EJECUTIVO
    // (barras verticales, verde)
    // ========================================================

    const leadsPorEjecutivo = computed<AsesorLeadsBar[]>(() => {

      const filas = leadsContactadosAsesor.value.map(
        (asesor, index) => ({
          id: primerValor(asesor, ['id_asesor']) || index,
          name: primerTexto(asesor, ['asesor', 'nombre']),
          value: primerValor(asesor, [
            'leads_contactados',
            'cantidad_leads',
            'cantidad',
          ]),
        }),
      );

      const ordenadas = filas
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      const maximo = Math.max(
        1,
        ...ordenadas.map(item => item.value),
      );

      return ordenadas.map(item => ({
        ...item,
        percent: Number(
          ((item.value / maximo) * 100).toFixed(1),
        ),
      }));
    });


    // ========================================================
    // GRÁFICO — MINUTOS CONTACTADOS POR EJECUTIVO
    // (barras horizontales, oscuro)
    // ========================================================

    const minutosPorEjecutivo = computed<AsesorTiempoBar[]>(() => {

      const filas = contactoPorAsesor.value.map(
        (asesor, index) => {

          // El campo puede venir como texto "10 min 28 seg"
          // o, en otras respuestas, ya como número de minutos.
          const textoOnumero =
            asesor?.promedio_tiempo_contacto ??
            asesor?.minutos_a_1er_contacto ??
            asesor?.promedio_minutos ??
            asesor?.minutos_promedio ??
            0;

          return {
            id: primerValor(asesor, ['id_asesor']) || index,
            name: primerTexto(asesor, ['asesor', 'nombre']),
            minutos: parseMinutosTexto(textoOnumero),
            texto: typeof textoOnumero === 'string'
              ? textoOnumero
              : formatearDecimal(textoOnumero) + ' min',
          };
        },
      );

      const ordenadas = filas
        .filter(item => item.name !== 'Sin nombre' || item.minutos > 0)
        .sort((a, b) => a.minutos - b.minutos)
        .slice(0, 8);

      const maximo = Math.max(
        1,
        ...ordenadas.map(item => item.minutos),
      );

      return ordenadas.map(item => ({
        ...item,
        percent: Number(
          ((item.minutos / maximo) * 100).toFixed(1),
        ),
      }));
    });


    // ========================================================
    // TABLA — LEADS CONTACTADOS EN RANGOS
    // ========================================================

    const rangosTabla = computed<RangoContactoRow[]>(() => {

      return rangosContacto.value.map((item, index) => ({
        orden: index + 1,
        rango: primerTexto(item, ['rango_contacto', 'rango'], '—'),
        cantidad: primerValor(item, [
          'cantidad_leads',
          'cantidad',
          'lead_id',
          'total',
        ]),
      }));
    });

    const rangosTotal = computed(() => {
      return rangosTabla.value.reduce(
        (suma, item) => suma + item.cantidad,
        0,
      );
    });


    // ========================================================
    // RECARGAR CUANDO CAMBIAN LAS FECHAS O EL ASESOR
    // ========================================================

    watch(
      () => [props.fechaInicio, props.fechaFin, props.idAsesor],
      () => {
        cargarDashboard();
      },
    );


    // ========================================================
    // MONTAR
    // ========================================================

    onMounted(() => {
      cargarDashboard();
    });


    return {

      // loading
      cargando,
      errorDashboard,

      // KPIs
      leadsEntrantes,
      leadsContactadosTotal,
      minutosPromedio,
      horasPromedio,

      // gráficos
      leadsPorEjecutivo,
      minutosPorEjecutivo,

      // tabla
      rangosTabla,
      rangosTotal,

      // helpers
      formatearNumero,
      formatearDecimal,

      cargarDashboard,
    };
  },
});