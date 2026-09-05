import { defineComponent, ref, onMounted } from "vue";
import { obtenerInfoDesistioLeadOpo } from "../../actions/clientsCierre";
import type { IInfoDesistioLeadOpoResponse } from "../../interfaces/clients.cierre.interface";

export default defineComponent({

    props: {
        idLead: {
            type: Number,
            required: true
        }
    },

    setup(props) {

        const desistio = ref<IInfoDesistioLeadOpoResponse[]>([]);
        const cargando = ref(false);


        async function cargarDesistio() {

            try {

                cargando.value = true;

                desistio.value =
                    await obtenerInfoDesistioLeadOpo(props.idLead);

            } catch (error) {

                console.error(
                    "Error obteniendo desistimiento",
                    error
                );

            } finally {

                cargando.value = false;

            }

        }


        onMounted(() => {
            cargarDesistio();
        });


        return {
            desistio,
            cargando
        };

    }

});