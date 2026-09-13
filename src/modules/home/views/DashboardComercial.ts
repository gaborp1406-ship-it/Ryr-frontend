import {
  defineComponent,
  ref,
  watch,
  onMounted,
} from 'vue';

import {
  contarLeadsCierreDashboard,
  contarTotalLeadsDashboard,
  contarCierresPorProyectoDashboard,
  contarCierresPorFuenteDashboard,
  contarCierresPorAsesorDashboard,
  contarTotalLeadsPorFuenteDashboard,
  contarTasaCierreDashboard,
} from '../actions/dashboardComercial';

// ============================================================
// TIPOS DE UI
// ============================================================
interface Kpi {
  label: string;
  value: string;

  icon: string;
  color: string;
}

interface BarItem {
  name: string;
  value: number;
  percent: number;
}

interface Advisor {
  name: string;
  initials: string;
  cierres: number;
}

export default defineComponent({
  name: 'DashboardComercial',

  props: {
    // Fechas controladas por el componente padre (DashboardAllView)
    fechaInicio: {
      type: String,
      default: '',
    },
    fechaFin: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    // ------------------------------------------------------------
    // ESTADO
    // ------------------------------------------------------------
    const loading = ref(false);
    const error = ref<string | null>(null);

    const kpis = ref<Kpi[]>([]);
    const proyectos = ref<BarItem[]>([]);
    const leadsPorFuente = ref<BarItem[]>([]);
    const cierresPorFuente = ref<BarItem[]>([]);
    const advisors = ref<Advisor[]>([]);

    // ------------------------------------------------------------
    // HELPERS
    // ------------------------------------------------------------
    const pickString = (obj: any, keys: string[], fallback = 'N/D') => {
      for (const key of keys) {
        if (obj?.[key] !== undefined && obj[key] !== null) {
          return String(obj[key]);
        }
      }
      return fallback;
    };

    const pickNumber = (obj: any, keys: string[], fallback = 0) => {
      for (const key of keys) {
        if (obj?.[key] !== undefined && obj[key] !== null) {
          const num = Number(obj[key]);
          if (!Number.isNaN(num)) return num;
        }
      }
      return fallback;
    };


    const firstItem = (data: any) => {
      if (Array.isArray(data)) return data[0] ?? {};
      return data ?? {};
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
    };

    const toBarItems = (
      list: any[],
      nameKeys: string[],
      valueKeys: string[],
    ): BarItem[] => {
      const raw = (list ?? []).map((item) => ({
        name: pickString(item, nameKeys),
        value: pickNumber(item, valueKeys),
      }));

      const max = Math.max(1, ...raw.map((item) => item.value));

      return raw
        .map((item) => ({
          ...item,
          percent: Math.round((item.value / max) * 100),
        }))
        .sort((a, b) => b.value - a.value);
    };

    const cargarDashboard = async () => {
      loading.value = true;
      error.value = null;

      const filtro = {
        fechaInicio: props.fechaInicio || null,
        fechaFin: props.fechaFin || null,
      };

      try {
        const [
          leadsCierre,
          totalLeads,
          cierresProyecto,
          cierresFuente,
          cierresAsesor,
          totalLeadsFuente,
          tasaCierre,
        ] = await Promise.all([
          contarLeadsCierreDashboard(filtro),
          contarTotalLeadsDashboard(filtro),
          contarCierresPorProyectoDashboard(filtro),
          contarCierresPorFuenteDashboard(filtro),
          contarCierresPorAsesorDashboard(filtro),
          contarTotalLeadsPorFuenteDashboard(filtro),
          contarTasaCierreDashboard(filtro),
        ]);


        proyectos.value = toBarItems(
          cierresProyecto,
          ['proyecto'],
          ['cantidad_leads_cierre'],
        );


        leadsPorFuente.value = toBarItems(
          totalLeadsFuente,
          ['fuente'],
          ['total_leads'],
        );

        // /dashboard/cierres-por-fuente -> [{ id_fuente, fuente, cantidad_leads_cierre }]
        cierresPorFuente.value = toBarItems(
          cierresFuente,
          ['fuente'],
          ['cantidad_leads_cierre'],
        );

        // /dashboard/cierres-por-asesor -> [{ id_asesor, asesor, cantidad_leads_cierre }]
        advisors.value = (cierresAsesor ?? [])
          .map((item: any) => {
            const name = pickString(item, ['asesor']);
            return {
              name,
              initials: getInitials(name),
              cierres: pickNumber(item, ['cantidad_leads_cierre']),
            };
          })
          .sort((a: Advisor, b: Advisor) => b.cierres - a.cierres);

        // -- KPIs --
        // /dashboard/total-leads -> [{ "total_leads": "4" }]
        const totalLeadsValor = pickNumber(firstItem(totalLeads), [
          'total_leads',
        ]);

        // /dashboard/leads-cierre -> [{ "cantidad_leads_cierre": "1" }]
        const leadsCierreValor = pickNumber(firstItem(leadsCierre), [
          'cantidad_leads_cierre',
        ]);

        // /dashboard/tasa-cierre -> [{ "leads_cierre": "1", "total_leads": "4", "tasa_cierre_porcentaje": "25.00" }]
        const tasaCierreValor = pickNumber(firstItem(tasaCierre), [
          'tasa_cierre_porcentaje',
        ]);

        const asesoresConCierres = advisors.value.filter(
          (a) => a.cierres > 0,
        ).length;

        kpis.value = [
          {
            label: 'Total leads',
            value: totalLeadsValor.toLocaleString('es-PE'),

            icon: 'users',
            color: 'black',
          },
          {
            label: 'Leads en cierre',
            value: leadsCierreValor.toLocaleString('es-PE'),

            icon: 'target',
            color: 'green',
          },
          {
            label: 'Tasa de cierre',
            value: `${tasaCierreValor.toFixed(1)}%`,

            icon: 'chart',
            color: 'orange',
          },
          {
            label: 'Asesores con cierres',
            value: String(asesoresConCierres),

            icon: 'calendar',
            color: 'blue',
          },
        ];
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al cargar el dashboard.';
      } finally {
        loading.value = false;
      }
    };

    // Recargar automáticamente cuando el padre cambie las fechas
    watch(
      () => [props.fechaInicio, props.fechaFin],
      () => {
        cargarDashboard();
      },
    );

    onMounted(() => {
      cargarDashboard();
    });

    return {
      loading,
      error,
      kpis,
      proyectos,
      leadsPorFuente,
      cierresPorFuente,
      advisors,
    };
  },
});