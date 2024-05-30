<template>
  <div>
    <Window
      :show="windowConfig.show"
      :buttons="windowConfig.buttons"
      :showCancel="windowConfig.showCancel"
      @close="closeWindow"
    >
      <template #body>
        <div>{{ blog.title }}</div>
        <div class="content">
          <v-md-preview
            :text="blog.editorType === 1 ? blog.markdownContent : blog.content"
          ></v-md-preview>
          <!-- <v-md-preview-html v-else :html="blog.content" preview-class="vuepress-markdown-body"></v-md-preview-html> -->
          <!-- <div v-else v-html="blog.content"></div> -->
        </div>
      </template>
    </Window>
  </div>
</template>

<script setup lang="ts">
import { reactive, getCurrentInstance, UnwrapNestedRefs } from 'vue'
import Window from '@/components/Window.vue'
import type { WindowCom, BlogDetailVue } from '#/types/declare'

// 导入和设置 markdown 预览组件和样式
import VMdPreview from '@kangc/v-md-editor/lib/preview.js'
import '@kangc/v-md-editor/lib/style/preview.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import Prism from 'prismjs'
VMdPreview.use(vuepressTheme, {
  Prism: Prism,
})
;(window as any).app.use(VMdPreview)

// 导入 userStore
import { useUserStore } from '@/store/userStore.js'
const userStore = useUserStore()

let userId = (userStore.user as any).user_id

const { proxy } = getCurrentInstance() as any // as ComponentInternalInstance，使用 proxy 时会报类型错误，但能正常使用 proxy

// 【注释掉，改用普通变量】ts 方式接收 props 参数。改用普通变量，props 不支持在传的按钮事件中调用本组件事件
/* 
const props = withDefaults(defineProps<{
  windowConfig?: WindowCom.windowConfigType   // ?: 非必传参数，等同 required: false
}>(),
  {
    windowConfig: () => ({
      show: true,
      buttons: [
        {
          type: 'danger',
          text: '确定',
          click: (e) => {
          }
        }
      ]
    }),
  }
)
 */

// 传给 Window 组件的参数设置
const windowConfig: UnwrapNestedRefs<WindowCom.windowConfigType> =
  reactive<WindowCom.windowConfigType>({
    show: false,
    buttons: [
      {
        type: 'primary',
        text: '<<返回',
        click: () => {
          closeWindow()
        },
      },
    ],
    showCancel: false,
  })

// 博客数据
const blog = reactive<BlogDetailVue.blogType>({
  blogId: 0,
  title: '',
  editorType: 0,
  content: '',
  markdownContent: '',
})

// 定义 api url
const api = {
  getBlogDetail: '/blog/getBlogById',
}

// 获取预览博客数据
const showDetail: BlogDetailVue.showDetail = async (blogId: number) => {
  const result = await proxy.Request({
    url: api.getBlogDetail,
    params: {
      data: JSON.stringify({
        blogId,
        userId,
      }),
    },
  })

  if (result?.code === 200) {
    Object.assign(blog, result.data)
  }
}

// 关闭窗口函数
const closeWindow = () => {
  windowConfig.show = false
}

// 向外暴露数据和方法
defineExpose({
  windowConfig,
  showDetail,
})
</script>

<style lang="scss">
.content {
  // 所有内容自动换行，但不包含div，可能有h标题,div,p等，直接用所有
  *:not(div) {
    word-break: break-all !important;
    white-space: pre-wrap !important;
  }
}
</style>