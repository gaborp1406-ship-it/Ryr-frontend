// ClientsDetails.ts
import { defineComponent, ref, h, onMounted } from "vue";
import { useRoute } from "vue-router";
import ClientsAsignar from "@/modules/clients/components/candidato/ClientsAsignar.vue";
import ClientsContacto from "@/modules/clients/components/candidato/ClientsContacto.vue";
import ClientsDesistio from "@/modules/clients/components/candidato/ClientsDesistio.vue";
import ClientsReunion from "../components/candidato/ClientsReunion.vue";
import ClientsAtencion from "../components/oportunidad/ClientsAtencion.vue";
import ClientsNegociacion from "../components/oportunidad/ClientsNegociacion.vue";
import ClientsCierre from "../components/oportunidad/ClientsCierre.vue";
import ClientsDesistioO from "../components/desistio/ClientsDesistio.vue";
import { obtenerEtapaActualLead } from "../actions/clients.action.js";
import type { IEtapaActualLeadResponse } from "../interfaces/clients.interface.js";

const IconCandidato = () =>
  h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, [
    h("circle", { cx: "12", cy: "8", r: "4" }),
    h("path", { d: "M4 21c0-4 4-6 8-6s8 2 8 6" }),
  ]);

const IconOportunidad = () =>
  h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, [
    h("path", { d: "M13 2 3 14h7l-1 8 11-14h-7l1-6z" }),
  ]);

const IconDesistio = () =>
  h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2" }, [
    h("circle", { cx: "12", cy: "12", r: "9" }),
    h("path", { d: "M9 9l6 6M15 9l-6 6" }),
  ]);

interface EtapaConfig {
  menu: string;
  submenu: string;
}

export default defineComponent({
  components: {
    ClientsAsignar,
    ClientsContacto,
    ClientsDesistio,
    ClientsReunion,
    ClientsAtencion,
    ClientsNegociacion,
    ClientsCierre,
    ClientsDesistioO,
  },

  setup() {
    const menus = ["Candidato", "Oportunidad", "Desistió"];

    const route = useRoute();
    const etapaActual = ref(1);
    const idLead = Number(route.params.id);

    const etapas: Record<number, EtapaConfig> = {
      1: { menu: "Candidato", submenu: "Asignación" },
      2: { menu: "Candidato", submenu: "Contacto" },
      3: { menu: "Candidato", submenu: "Desistió" },
      4: { menu: "Candidato", submenu: "Agendar reunión" },
      5: { menu: "Oportunidad", submenu: "Atención" },
      6: { menu: "Oportunidad", submenu: "Negociación" },
      7: { menu: "Oportunidad", submenu: "Cierre" },
      8: { menu: "Desistió", submenu: "Desistió" },
    };

    const submenus: Record<string, string[]> = {
      Candidato: ["Asignación", "Contacto", "Desistió", "Agendar reunión"],
      Oportunidad: ["Atención", "Negociación", "Cierre"],
      Desistió: ["Desistió"],
    };

    const iconos: Record<string, any> = {
      Candidato: IconCandidato,
      Oportunidad: IconOportunidad,
      Desistió: IconDesistio,
    };

    const estadoColor: Record<string, string> = {
      Candidato: "bg-amber-50 text-amber-600",
      Oportunidad: "bg-blue-50 text-blue-600",
      Desistió: "bg-rose-50 text-rose-600",
    };

    // Orden global de etapas (usado para saber si un submenu ya fue pasado)
    const ordenEtapas = [
      { id: 1, nombre: "Asignación" },
      { id: 2, nombre: "Contacto" },
      { id: 3, nombre: "Desistió" },
      { id: 4, nombre: "Agendar reunión" },
      { id: 5, nombre: "Atención" },
      { id: 6, nombre: "Negociación" },
      { id: 7, nombre: "Cierre" },
    ];

    function obtenerIdEtapa(nombreSubmenu: string): number {
      const etapa = ordenEtapas.find((e) => e.nombre === nombreSubmenu);
      return etapa ? etapa.id : 0;
    }

    const menuActivo = ref("Candidato");
    const submenuActivo = ref(submenus.Candidato[0]);

    // Indica si se está obteniendo la etapa actual del lead desde el backend
    const cargandoEtapa = ref(true);

    function cambiarMenu(menu: string) {
      menuActivo.value = menu;
      submenuActivo.value = submenus[menu][0];
    }


    const cargarEtapaActual = async () => {
      cargandoEtapa.value = true;
      try {
        const etapa: IEtapaActualLeadResponse =
          await obtenerEtapaActualLead(idLead);

        etapaActual.value = etapa.id_etapa;

        const config = etapas[etapa.id_etapa];

        if (config) {
          menuActivo.value = config.menu;
          submenuActivo.value = config.submenu;
        }
      } catch (error) {
        console.error(error);
      } finally {
        cargandoEtapa.value = false;
      }
    };
    onMounted(() => {
      cargarEtapaActual();
    });

    return {
      menus,
      submenus,
      iconos,
      estadoColor,
      menuActivo,
      submenuActivo,
      etapaActual,
      idLead,
      cargandoEtapa,
      cambiarMenu,
      cargarEtapaActual,
      obtenerIdEtapa,
    };
  },
});