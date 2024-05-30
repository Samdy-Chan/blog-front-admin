<template>
  <div>
    <div>k1: {{ k1 }} <button @click="clk">改变k1值</button></div>
    <div>k2: {{ k2 }}</div>
    <div>k3: {{ k3 }}</div>
    <div>obj2: {{ obj2 }}</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'TestTs',
})

const props = withDefaults(
  defineProps<{
    k1: string
    k2: string
    k3: number
    obj2: object
  }>(),
  {
    k2: 'world',
    k3: () => 999,
  }
)

// const emit = defineEmits(['click'])
const clk = () => {
  // emit('click')
}
</script>

<style scoped></style>