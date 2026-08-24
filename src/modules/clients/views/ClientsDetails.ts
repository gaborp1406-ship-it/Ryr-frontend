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

interface EtapaInfo {
  id: number;
  nombre: string;
  menu: string;
  realizada: boolean;
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
    const menus = ["Candidato", "Oportunidad"];
    const route = useRoute();
    const idLead = Number(route.params.id);

    // Orden global de etapas (definición única de verdad)
    const ordenEtapas: EtapaInfo[] = [
      { id: 1, nombre: "Asignación", menu: "Candidato", realizada: false },
      { id: 2, nombre: "Contacto", menu: "Candidato", realizada: false },
      { id: 3, nombre: "Desistió", menu: "Candidato", realizada: false },
      { id: 4, nombre: "Agendar reunión", menu: "Candidato", realizada: false },
      { id: 5, nombre: "Atención", menu: "Oportunidad", realizada: false },
      { id: 6, nombre: "Negociación", menu: "Oportunidad", realizada: false },
      { id: 7, nombre: "Cierre", menu: "Oportunidad", realizada: false },
      { id: 8, nombre: "Desistió-O", menu: "Oportunidad", realizada: false },
    ];

    const submenus: Record<string, string[]> = {
      Candidato: ["Asignación", "Contacto", "Desistió", "Agendar reunión"],
      Oportunidad: ["Atención", "Negociación", "Cierre", "Desistió-O"],
    };

    const iconos: Record<string, any> = {
      Candidato: IconCandidato,
      Oportunidad: IconOportunidad,
      Desistío: IconDesistio,
    };

    const etapas: Record<number, EtapaConfig> = {
      1: { menu: "Candidato", submenu: "Asignación" },
      2: { menu: "Candidato", submenu: "Contacto" },
      3: { menu: "Candidato", submenu: "Desistió" },
      4: { menu: "Candidato", submenu: "Agendar reunión" },
      5: { menu: "Oportunidad", submenu: "Atención" },
      6: { menu: "Oportunidad", submenu: "Negociación" },
      7: { menu: "Oportunidad", submenu: "Cierre" },
      8: { menu: "Oportunidad", submenu: "Desistió-O" },
    };

    const menuActivo = ref("Candidato");
    const submenuActivo = ref("Asignación");
    const etapaActual = ref(1);
    const cargandoEtapa = ref(true);

    // Mapear etapas realizadas por su ID
    const etapasRealizadas = ref<Map<number, boolean>>(new Map());

    /**
     * Obtiene el ID de una etapa por su nombre
     */
    function obtenerIdEtapa(nombreSubmenu: string): number {
      const etapa = ordenEtapas.find((e) => e.nombre === nombreSubmenu);
      return etapa ? etapa.id : 0;
    }

    /**
     * Verifica si una etapa es accesible (está en rango y fue realizada, o es la actual)
     */
    function esEtapaAccesible(nombreSubmenu: string): boolean {
      const idEtapa = obtenerIdEtapa(nombreSubmenu);
      
      if (idEtapa === 0) return false;
      
      // La etapa actual siempre es accesible
      if (idEtapa === etapaActual.value) return true;
      
      // Las etapas pasadas solo son accesibles si fueron realizadas
      if (idEtapa < etapaActual.value) {
        return etapasRealizadas.value.get(idEtapa) ?? false;
      }
      
      // Las etapas futuras no son accesibles
      return false;
    }

    /**
     * Verifica si una etapa fue realizada
     */
    function fueEtapaRealizada(idEtapa: number): boolean {
      return etapasRealizadas.value.get(idEtapa) ?? false;
    }

    /**
     * Navega a un submenu si es accesible
     */
    function irASubmenu(item: string) {
      if (esEtapaAccesible(item)) {
        submenuActivo.value = item;
      }
    }

    /**
     * Cambia el menú principal y va al primer submenu disponible
     */
    function cambiarMenu(menu: string) {
      menuActivo.value = menu;
      // Buscar el primer submenu accesible del menú
      const submenusDelMenu = submenus[menu];
      for (const submenu of submenusDelMenu) {
        if (esEtapaAccesible(submenu)) {
          submenuActivo.value = submenu;
          return;
        }
      }
      // Si no hay ninguno accesible, ir al primero igual (será bloqueado en la UI)
      submenuActivo.value = submenusDelMenu[0];
    }

    /**
     * Obtiene solo los submenus visibles para el menú actual
     */
    function obtenerSubmenusVisibles(menu: string): string[] {
      return submenus[menu].filter((submenu) => {
        const idEtapa = obtenerIdEtapa(submenu);
        // Mostrar solo si es la etapa actual o si es anterior y fue realizada
        return idEtapa <= etapaActual.value;
      });
    }

    /**
     * Obtiene el nombre de una etapa por su ID
     */
    function obtenerNombreEtapa(idEtapa: number): string {
      const etapa = ordenEtapas.find((e) => e.id === idEtapa);
      return etapa ? etapa.nombre : "Desconocida";
    }

    /**
     * Obtiene las etapas visibles hasta la etapa actual
     */
    function obtenerEtapasVisibles() {
      return ordenEtapas.filter((e) => e.id <= etapaActual.value);
    }

    /**
     * Carga la etapa actual del lead desde el backend
     */
    const cargarEtapaActual = async () => {
      cargandoEtapa.value = true;
      try {
        const respuesta: any = await obtenerEtapaActualLead(idLead);

        // Manejo flexible de la respuesta (array o objeto)
        let etapaActualId = 1;
        
        if (Array.isArray(respuesta)) {
          // Si es un array, procesar cada etapa
          respuesta.forEach((etapa: any) => {
            const idEtapa = etapa.id_etapa;
            const esRealizada = etapa.realizada === true || (etapa.fecha_fin !== null && etapa.fecha_fin !== undefined);
            const esActual = etapa.estado_actual === true;
            
            etapasRealizadas.value.set(idEtapa, esRealizada || esActual);
            
            if (esActual) {
              etapaActualId = idEtapa;
            }
          });
        } else if (respuesta.id_etapa) {
          // Si es un objeto simple
          etapaActualId = respuesta.id_etapa;
          etapasRealizadas.value.set(respuesta.id_etapa, true);
        }

        etapaActual.value = etapaActualId;

        const config = etapas[etapaActualId];
        if (config) {
          menuActivo.value = config.menu;
          submenuActivo.value = config.submenu;
        }
      } catch (error) {
        console.error("Error cargando etapa actual:", error);
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
      obtenerSubmenusVisibles,
      esEtapaAccesible,
      fueEtapaRealizada,
      irASubmenu,
      iconos,
      menuActivo,
      submenuActivo,
      etapaActual,
      idLead,
      cargandoEtapa,
      cambiarMenu,
      cargarEtapaActual,
      obtenerIdEtapa,
      obtenerNombreEtapa,
      obtenerEtapasVisibles,
    };
  },
});