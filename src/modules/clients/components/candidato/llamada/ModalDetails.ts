// ModalDetails.ts
import { defineComponent, type PropType } from "vue";
import type { DetalleLlamada } from "../llamada/ModalLlamada";

export default defineComponent({
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        detalle: {
            type: Object as PropType<DetalleLlamada | null>,
            default: null,
        },
    },
    emits: ["close"],
    setup(_props, { emit }) {
        function cerrar() {
            emit("close");
        }

        return {
            cerrar,
        };
    },
});