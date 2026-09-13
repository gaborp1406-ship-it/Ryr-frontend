import {
  defineComponent,
} from 'vue';

interface Kpi {
  label: string;
  value: string;
  trend: number;
  description: string;
  icon: string;
  color: string;
}

interface Stage {
  name: string;
  value: number;
  percent: number;
}

interface Source {
  name: string;
  value: number;
  percent: number;
}

interface Advisor {
  name: string;
  initials: string;
  opportunities: number;
  conversion: number;
}

export default defineComponent({
  name: 'DashboardComercial',

  setup() {

    const kpis: Kpi[] = [
      {
        label: 'Oportunidades',
        value: '186',
        trend: 12.4,
        description: 'Oportunidades activas',
        icon: 'target',
        color: 'green',
      },
      {
        label: 'Leads gestionados',
        value: '320',
        trend: 8.7,
        description: 'Candidatos en gestión',
        icon: 'users',
        color: 'black',
      },
      {
        label: 'Reuniones',
        value: '128',
        trend: 15.2,
        description: 'Reuniones programadas',
        icon: 'calendar',
        color: 'blue',
      },
      {
        label: 'Conversión',
        value: '18.4%',
        trend: 5.6,
        description: 'Conversión comercial',
        icon: 'chart',
        color: 'orange',
      },
    ];


    const stages: Stage[] = [
      {
        name: 'Asignación',
        value: 320,
        percent: 100,
      },
      {
        name: 'Contacto',
        value: 264,
        percent: 82,
      },
      {
        name: 'Reunión',
        value: 176,
        percent: 55,
      },
      {
        name: 'Negociación',
        value: 92,
        percent: 29,
      },
      {
        name: 'Cierre',
        value: 42,
        percent: 13,
      },
    ];


    const sources: Source[] = [
      {
        name: 'Facebook',
        value: 124,
        percent: 78,
      },
      {
        name: 'Landing',
        value: 86,
        percent: 54,
      },
      {
        name: 'WhatsApp',
        value: 63,
        percent: 40,
      },
      {
        name: 'Referidos',
        value: 47,
        percent: 30,
      },
    ];


    const advisors: Advisor[] = [
      {
        name: 'Carlos Mendoza',
        initials: 'CM',
        opportunities: 68,
        conversion: 24,
      },
      {
        name: 'Andrea Torres',
        initials: 'AT',
        opportunities: 61,
        conversion: 22,
      },
      {
        name: 'Luis Ramírez',
        initials: 'LR',
        opportunities: 57,
        conversion: 20,
      },
      {
        name: 'María Flores',
        initials: 'MF',
        opportunities: 49,
        conversion: 18,
      },
    ];


    return {
      kpis,
      stages,
      sources,
      advisors,
    };
  },
});