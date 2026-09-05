import { defineComponent, ref, onMounted } from "vue";
import { obtenerInfoDesistioLead } from "../../actions/clientsContacto.action";
import type { IInfoDesistioLeadResponse } from "../../interfaces/clientscontacto.interface";

export default defineComponent({

    props: {
        idLead: {
            type: Number,
            required: true
        }
    },

    setup(props) {

        const desistio = ref<IInfoDesistioLeadResponse[]>([]);
        const cargando = ref(false);


        async function cargarDesistio() {

            try {

                cargando.value = true;

                desistio.value =
                    await obtenerInfoDesistioLead(props.idLead);

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