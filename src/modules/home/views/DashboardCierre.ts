import {
  computed,
  defineComponent,
} from 'vue';

interface OperationStatus {
  label: string;
  value: number;
  color: string;
}

interface Advisor {
  name: string;
  initials: string;
  sales: number;
  amount: string;
}

interface Project {
  name: string;
  value: number;
  percent: number;
}

interface LossReason {
  label: string;
  value: number;
  percent: number;
}

export default defineComponent({
  name: 'DashboardCierre',

  setup() {

    const months = [
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
    ];

    const chartValues = [
      19,
      25,
      22,
      31,
      35,
      38,
      42,
    ];

    const chartPoints = computed(() => {

      const width = 600;
      const height = 200;
      const max = 50;

      const step =
        width / (chartValues.length - 1);

      return chartValues
        .map((value, index) => {

          const x = index * step;

          const y =
            height -
            (value / max) * height;

          return `${x},${y}`;

        })
        .join(' ');
    });


    const chartDots = computed(() => {

      const width = 600;
      const height = 200;
      const max = 50;

      const step =
        width / (chartValues.length - 1);

      return chartValues.map(
        (value, index) => {

          const x = index * step;

          const y =
            height -
            (value / max) * height;

          return {
            x,
            y,
          };
        },
      );
    });


    const operationStatus: OperationStatus[] = [
      {
        label: 'Cerradas',
        value: 42,
        color: 'green',
      },
      {
        label: 'En proceso',
        value: 28,
        color: 'black',
      },
      {
        label: 'Pendientes',
        value: 16,
        color: 'orange',
      },
      {
        label: 'Desistidas',
        value: 21,
        color: 'gray',
      },
    ];


    const advisors: Advisor[] = [
      {
        name: 'Carlos Mendoza',
        initials: 'CM',
        sales: 12,
        amount: 'S/ 1.4M',
      },
      {
        name: 'Andrea Torres',
        initials: 'AT',
        sales: 10,
        amount: 'S/ 1.1M',
      },
      {
        name: 'Luis Ramírez',
        initials: 'LR',
        sales: 9,
        amount: 'S/ 980K',
      },
      {
        name: 'María Flores',
        initials: 'MF',
        sales: 7,
        amount: 'S/ 760K',
      },
    ];


    const projects: Project[] = [
      {
        name: 'Proyecto Norte',
        value: 16,
        percent: 90,
      },
      {
        name: 'Residencial Central',
        value: 12,
        percent: 70,
      },
      {
        name: 'Condominio Verde',
        value: 8,
        percent: 48,
      },
      {
        name: 'Los Jardines',
        value: 6,
        percent: 35,
      },
    ];


    const lossReasons: LossReason[] = [
      {
        label: 'Precio',
        value: 32,
        percent: 88,
      },
      {
        label: 'No califica',
        value: 24,
        percent: 66,
      },
      {
        label: 'Competencia',
        value: 17,
        percent: 47,
      },
      {
        label: 'Ubicación',
        value: 13,
        percent: 36,
      },
    ];


    return {
      months,
      chartPoints,
      chartDots,
      operationStatus,
      advisors,
      projects,
      lossReasons,
    };
  },
});