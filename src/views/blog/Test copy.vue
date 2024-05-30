<template>
  <div>
    <!-- <EditorMarkDown v-model="editorContent"></EditorMarkDown> -->
    <!-- <editor-html v-model:content="editorContent"></editor-html> -->
    <!-- <test-ts :k1="k1" @click.native="chgInfo"></test-ts> -->
    <BlogDetail></BlogDetail>

    <TestTs k1="k1" k2="k2" :obj2="obj2"></TestTs>
    <button @click="chgobj2">改变 obj2</button>
    <input v-model="val" type="number" @blur="onBlur" />
  </div>
  <!-- {{ editorContent }} -->
</template>

<script setup>
import { ref, reactive, getCurrentInstance, watch } from 'vue'
// import EditorMarkDown from '@/components/EditorMarkdown.vue'
import EditorHtml from '@/components/EditorHtml.vue'
import BlogDetail from '@/views/blog/BlogDetail.vue'
const { proxy } = getCurrentInstance()

import TestTs from './TestTs.vue'

const obj2 = ref({
  name: 'chq',
  info: {
    age: 38,
  },
})
let val = ref(111)
function onBlur(e) {
  console.log('val:', val.value, typeof val.value)
  console.log('e:', e.currentTarget.value, typeof e.currentTarget.value)
}

function chgobj2() {
  console.log('obj2', obj2)
  // Object.assign(obj2.value, { name: 'samdy', info: { age: 39 } })
  obj2.value = { gender: 'male' }
  console.log('obj2', obj2)
}

const obj = reactive({
  name: 'chq',
  age: 38,
  info: {
    addr: 'mm',
  },
})

function chgInfo() {
  /* Object.assign(obj, {
    name: 'chen',
    info: {
      addr: 'maoming',
    },
  }) */
  obj.info.addr = 'gz'
}

watch(
  [() => obj],
  (newVal, oldVal) => {
    console.log('obj改变了，', newVal, oldVal)
  },
  { deep: true }
)

const editorContent = ref('Hello World!')
const k1 = ref('aaa')
async function init() {
  let res = await proxy.Msgbox.alert('测试提示', '提示a', 'warning', false)
  console.log(res)
}
init()
</script>

<style lang="scss" scoped></style>