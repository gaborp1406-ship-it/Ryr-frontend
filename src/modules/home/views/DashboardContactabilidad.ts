import {
  defineComponent,
} from 'vue';

interface CallResult {
  label: string;
  value: number;
  color: string;
}

interface DailyCall {
  day: string;
  value: number;
  percent: number;
}

interface CallState {
  label: string;
  value: number;
  percent: number;
}

interface Advisor {
  name: string;
  initials: string;
  calls: number;
  contactRate: number;
}

export default defineComponent({
  name: 'DashboardContactabilidad',

  setup() {

    const callResults: CallResult[] = [
      {
        label: 'Contacto efectivo',
        value: 1426,
        color: 'green',
      },
      {
        label: 'No contestó',
        value: 814,
        color: 'black',
      },
      {
        label: 'Buzón',
        value: 372,
        color: 'gray',
      },
      {
        label: 'Número inválido',
        value: 228,
        color: 'light',
      },
    ];


    const dailyCalls: DailyCall[] = [
      {
        day: 'Lun',
        value: 360,
        percent: 72,
      },
      {
        day: 'Mar',
        value: 420,
        percent: 84,
      },
      {
        day: 'Mié',
        value: 390,
        percent: 78,
      },
      {
        day: 'Jue',
        value: 460,
        percent: 92,
      },
      {
        day: 'Vie',
        value: 510,
        percent: 100,
      },
      {
        day: 'Sáb',
        value: 390,
        percent: 78,
      },
      {
        day: 'Dom',
        value: 310,
        percent: 62,
      },
    ];


    const callStates: CallState[] = [
      {
        label: 'Contacto efectivo',
        value: 1426,
        percent: 100,
      },
      {
        label: 'No contesta',
        value: 814,
        percent: 57,
      },
      {
        label: 'Buzón de voz',
        value: 372,
        percent: 26,
      },
      {
        label: 'Número inválido',
        value: 228,
        percent: 16,
      },
    ];


    const advisors: Advisor[] = [
      {
        name: 'Carlos Mendoza',
        initials: 'CM',
        calls: 620,
        contactRate: 58,
      },
      {
        name: 'Andrea Torres',
        initials: 'AT',
        calls: 590,
        contactRate: 55,
      },
      {
        name: 'Luis Ramírez',
        initials: 'LR',
        calls: 570,
        contactRate: 52,
      },
      {
        name: 'María Flores',
        initials: 'MF',
        calls: 510,
        contactRate: 48,
      },
    ];


    return {
      callResults,
      dailyCalls,
      callStates,
      advisors,
    };
  },
});