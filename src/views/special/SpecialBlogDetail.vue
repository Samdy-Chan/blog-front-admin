<template>
  <div>
    <Window
      :show="windowConfig.show"
      :buttons="windowConfig.buttons"
      :showCancel="windowConfig.showCancel"
      @close="closeWindow"
    >
      <template #body>
        <el-row :gutter="10" style="margin-top: 10px">
          <el-col :span="6">
            <el-card ref="treeCardRef" class="tree-card-box">
              <!-- 卡片头部插槽 -->
              <template #header>
                <div class="card-header">
                  <span>专题文章</span>
                </div>
              </template>
              <!-- 专题博客拖拽排序提示 -->
              <div style="margin-bottom: 4px">
                <el-alert
                  title="点击相应专题文章可预览"
                  type="info"
                  :show-icon="true"
                  :closable="false"
                ></el-alert>
              </div>
              <!-- 卡片内容默认插槽 -->
              <div class="special-blog-tree">
                <!-- el-tree 组件属性事件说明：
                props: 配置选项，指定树节点显示的文本(label)、和子节点(children)在 data 属性中定义的键名，
                  一般也是定义为 label 和 children，格式为：
                  [
                    label: 'label',
                    children: 'children',
                    class: '自定义节点类名 string | function(data: Tree, node: Node)'
                  ]
                data:  树数据定义，格式为：[id?: number; label: string; children?: Tree[]...]
                node-key: 树节点唯一标识ID，可以用于设置默认展开和选中等其它操作的节点
                default-expand-all: 是否展开所有节点，默认 false
                expand-on-click-node: 点击节点文本时是否展开节点，默认 true，为 false 点击节点图标才展开
                highlight: 是否高亮显示当前点击的节点，默认  false
                draggable: 是否允许拖拽节点，默认 false
                @node-drop: 拖拽节点事件的回调处理函数
           -->
                <el-tree
                  ref="treeRef"
                  class="tree-panel"
                  :props="treeProps"
                  :data="blogList"
                  node-key="blogId"
                  :default-expand-all="true"
                  :expand-on-click-node="true"
                  :highlight-current="true"
                  @node-click="setCurrentBlog"
                >
                  <!-- 插入 el-tree 默认插槽内容 -->
                  <template #default="{ node, data }">
                    <span class="custom-node-style">
                      <span class="node-title" :title="data.title">
                        <!-- 草稿显示红色标题 -->
                        <span
                          v-if="data.status == 0"
                          :style="{ color: 'red', 'font-size': '13px' }"
                        >
                          {{
                            data.title.length < 7
                              ? data.title
                              : data.title.substring(0, 7) + '...'
                          }}
                          <span class="blog-status-tips">[草稿]</span>
                        </span>
                        <!-- 已发布显示绿色标题 -->
                        <span
                          v-else
                          :style="{ color: 'green', 'font-size': '13px' }"
                        >
                          {{
                            data.title.length < 7
                              ? data.title
                              : data.title.substring(0, 7) + '...'
                          }}
                        </span>
                      </span>
                    </span>
                  </template>
                </el-tree>
              </div>
            </el-card>
          </el-col>
          <!-- 文章预览区域 -->
          <el-col :span="18">
            <el-card ref="blogCardBoxRef" class="blog-card-box">
              <template #header>
                <span>{{ blog.title }}</span>
              </template>
              <div class="content">
                <v-md-preview
                  :text="
                    blog.editorType === 1 ? blog.markdownContent : blog.content
                  "
                ></v-md-preview>
                <!-- <v-md-preview-html v-else :html="blog.content" preview-class="vuepress-markdown-body"></v-md-preview-html> -->
                <!-- <div v-else v-html="blog.content"></div> -->
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </Window>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, watch, nextTick } from 'vue'
import Window from '@/components/Window.vue'

// 导入和设置 markdown 预览组件和样式
import VMdPreview from '@kangc/v-md-editor/lib/preview.js'
import '@kangc/v-md-editor/lib/style/preview.css'
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import Prism from 'prismjs'
VMdPreview.use(vuepressTheme, {
  Prism: Prism,
})
window.app.use(VMdPreview)

import VueCookies from 'vue-cookies'
let userId = VueCookies.get('userInfo')?.user_id ?? 0

const { proxy } = getCurrentInstance()

// 传给 Window 组件的参数设置
const windowConfig = reactive({
  show: false,
  buttons: [
    {
      type: 'danger',
      text: '编辑本文',
      click: () => {
        windowConfig.show = false
        proxy.$parent.editBlog('update', blog)
      },
    },
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

/******** 专题树及节点功能部分 - start ********/
// 专题树节点键定义
const treeProps = {
  label: 'title',
  children: 'children',
  // class: 'node-style',  // 为每个节点设置css样式名
  // value: 'blogId',
}

// 专题所属的博客文章列表
const blogList = reactive([])
/******** 专题树及节点功能部分 - end ********/

// 博客数据
let blog = reactive({
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
const showDetail = (data) => {
  Object.assign(blog, data)
  // 设置树节点选中状态
  proxy.$refs.treeRef.setCurrentKey(data.blogId, true)
}

// 设置当前专题博客
const setCurrentBlog = (currentNodeData, currentNodeProps, treeNode, evt) => {
  console.log(currentNodeData, currentNodeProps, treeNode, evt)
  // 如果不是顶级专题名称，预览点击的专题博客
  if (currentNodeProps.level !== 1) {
    showDetail(currentNodeData)
  }
}

// 关闭窗口函数
const closeWindow = () => {
  windowConfig.show = false
}

// 定义监听器
// 监听弹出窗口显示参数
watch(
  () => windowConfig.show,
  (newVal, oldVal) => {
    if (newVal === true) {
      // 设置右边预览文章 el-card 组件的高度等于左边专题树 el-card 的高度
      nextTick(() => {
        const [treeCardBox, blogCardBox] = document.querySelectorAll(
          '.tree-card-box, .blog-card-box'
        )
        const treeCardBoxHeight = getComputedStyle(treeCardBox, null).height
        blogCardBox.style.minHeight = treeCardBoxHeight
      })
    }
  },
  { immediate: true }
)

// 向外暴露数据和方法
defineExpose({
  windowConfig,
  showDetail,
  blogList,
})
</script>

<style lang="scss" scoped>
.content {
  // 所有内容自动换行，但不包含div，可能有h标题,div,p等，直接用所有
  *:not(div) {
    word-break: break-all !important;
    white-space: pre-wrap !important;
  }
}
</style>