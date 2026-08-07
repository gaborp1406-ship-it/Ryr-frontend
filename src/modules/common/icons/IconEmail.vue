<template>
  <svg width="20" xmlns="http://www.w3.org/2000/svg" height="20" fill="none" version="1.1">
    <g xml:space="preserve" data-testid="email">
      <g id="shape-564019dc-8989-803b-8004-df7c7008668a" data-testid="svg-path">
        <g class="fills" id="fills-564019dc-8989-803b-8004-df7c7008668a">
          <path
            d="M17.223 2.653H2.777A2.777 2.777 0 0 0 0 5.43v9.14a2.777 2.777 0 0 0 2.777 2.777h14.446A2.777 2.777 0 0 0 20 14.57V5.43a2.777 2.777 0 0 0-2.777-2.777ZM6.96 12.567l-3.889 3.317a.652.652 0 1 1-.847-.993l3.888-3.317a.653.653 0 0 1 .848.993ZM10 11.306a2.16 2.16 0 0 1-1.418-.515h-.001.001L2.616 5.613a.653.653 0 1 1 .855-.987l5.968 5.18A.869.869 0 0 0 10 10a.87.87 0 0 0 .564-.196l.003-.003 5.961-5.175a.654.654 0 0 1 .856.987l-5.967 5.18a2.175 2.175 0 0 1-1.417.513Zm7.85 4.505a.653.653 0 0 1-.921.073l-3.888-3.317a.652.652 0 1 1 .847-.993l3.889 3.317a.653.653 0 0 1 .073.92Z"
            :fill="color"
          />
        </g>
      </g>
    </g>
  </svg>
</template>

<script lang="ts" setup>
defineProps({
  color: {
    type: String,
    default: '#00AE11', // Valor por defecto en formato hex
  },
});
</script>
