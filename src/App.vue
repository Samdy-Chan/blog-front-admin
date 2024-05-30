<template>
  <div>
    <!-- 配置中文化：将封装 el-table 表格组件<Table/>如底部的 No Data 英文提示显示中文化） 
         message 属性配置最大弹窗
    -->
    <el-config-provider :locale="zhCN" :message="config">
      <router-view />
    </el-config-provider>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

// 导入 userStore 模块
import { useUserStore } from '@/store/userStore.js'
const userStore = useUserStore()

// 导入 router api
import { useRouter } from 'vue-router'
const router = useRouter()

// element-plus v2.2.29 及以下版本
// import zhCN from 'element-plus/lib/locale/lang/zh-cn'

// element-plus v2.3.8 及以上版本
import zhCN from 'element-plus/dist/locale/zh-cn'
// 或
// import zhCN from 'element-plus/es/locale/lang/zh-cn'

const config = reactive({
  max: 1,
})

// 全局监听器，监听登录用户是否存在，否则实时退出到登录页面
watch(
  () => userStore.user,
  (newVal, oldVal) => {
    if (!newVal?.user_id) {
      router.push('/login')
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
</style>
