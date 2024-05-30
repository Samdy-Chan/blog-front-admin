<template>
  <div>
    <div>userStore的数据是（初始化为空）：{{ user }}</div>
    <button @click="chgUserData">修改 userStore 数据</button>
  </div>
</template>

<script setup>
// 导入 pinia 配置的 userStore
import { useUserStore } from '@/store/userStore.js'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
// 解构 userStore.user
const { user } = storeToRefs(userStore)

// 修改 userStore 数据，观察浏览器的本地存储器 localStorage 和 cookie 是否同步修改
const chgUserData = () => {
  userStore.$patch({
    user: {
      userId: 888,
      username: 'Samdy_Chan',
      age: 18,
      addr: 'gz',
    },
  })
}
</script>

<style lang="scss" scoped>
</style>