<template>
  <div>
    <!-- 因为 modelValue 是上级组件传过来的双向梆定属性，不能赋值给 v-model 属性，
    否则会报错，要把 v-model 改为 :model-value

    disabled-menus: 值为数组，表示要禁用不显示的菜单 ，如禁用 H1标题 ['h/h1']
    @change：编辑器内容改变事件方法
    include-level: 目录导航生成时包含的标题。默认包含 2 级、3 级标题。
    left-toolbar: 格式工具栏的显示图标，值为字符串，|线分隔图标如： left-toolbar="undo redo clear | image"
    right-toolbar: 右侧预览、目录导航、全屏图标等的设置，值为字符串，空格分隔，默认值 right-toolbar="preview toc sync-scroll fullscreen"
    @upload-image：上传图片的事件方法
    -->
    <v-md-editor :model-value="modelValue" :height="height + 'px'" :disabled-menus="[]"
      :include-level="[1, 2, 3, 4, 5, 6]" @change="change" @upload-image="handleUploadImage"></v-md-editor>
  </div>
</template>

<script setup>
import { createApp, getCurrentInstance } from 'vue'

// 设置组件的名字
defineOptions({
  name: 'EditorMarkdown',
})

// 解构出 app 代理对象 proxy 使用
const { proxy } = getCurrentInstance()

// 导入读写 cookie 的工具包
import VueCookies from 'vue-cookies'

// 导入 v-md-editor 编辑器组件及相关配置
import VMdEditor from '@kangc/v-md-editor' // VMdEditor第一个字母改为小写 v 也可以，对应组件标签 v-md-editor
import '@kangc/v-md-editor/lib/style/base-editor.css'

// 导入和设置 vuepress 主题样式
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
import Prism from 'prismjs'
VMdEditor.use(vuepressTheme, {
  Prism,
  codeHighlightExtensionMap: {
    vue: 'html',
  },
})

// 导入和设置 github 主题样式
// import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
// import '@kangc/v-md-editor/lib/theme/style/github.css'
// import hljs from 'highlight.js'
// VMdEditor.use(githubTheme, {
//   Hljs: hljs,
// })
// 注册 v-md-editor 编辑器组件
// window.app.use(VMdEditor)  // 不用加这行，否则报错：Plugin has already been applied to target app

// 获取当前登录的用户ID
let user_id = VueCookies.get('userInfo')?.user_id || 0

// 获取传递过来的双向梆定的，显示在编辑器中的内容
const props = defineProps({
  // 固定名称：modelValue，父组件通过 v-model="markdownContent" 传过来的属性值，
  // 如果这里改名为 html，则父组件要 v-model:html="markdownContent"，markdownContent是父组件的数据变量，
  // 下面的 change 事件也要 emit('update:html')
  modelValue: {
    type: String,
    default: '',
  },
  height: {
    type: Number,
    default: 500,
  },
})

// 获取并声明传递过来的事件
const emit = defineEmits(['update:modelValue', 'setHtmlContent'])

/**
 * @function change                 -   编辑输入框内容改变事件处理函数
 * @param {string} markdownContent  -   编辑器回传的纯文本内容
 * @param {string} htmlContent      -   编辑器回传的html超文本内容
 * @returns {void}
 */
function change(markdownContent, htmlContent) {
  //   console.log(markdownContent, htmlContent)
  //   console.log('modelValue', props.modelValue)

  // 更改本组件接收的 modelValue 实现双向梆定，v-model双向梆定的属性只能这样更改，不能直接 props.modelValue = 更改
  emit('update:modelValue', markdownContent)
  emit('setHtmlContent', htmlContent) // 也传送 html 格式内容给父组件，以便过淲出纯文本作为博客摘要
}

/**
 * @function handleUploadImage       -   上传图片事件处理函数
 * @param {object}       event       -   上传事件回调参数
 * @param {function}     insertImage -   编辑器自带插入图片后处理函数
 * @param {array|object} files       -   上传图片文件数组对象
 * @returns {void}
 */
async function handleUploadImage(event, insertImage, files) {
  // 拿到 files 之后上传到文件服务器，然后向编辑框中插入对应的内容
  console.log(files)

  if (files && files.length) {
    const file = files[0]
    // 检查上传的文件是否满足条件：如扩展名，文件大小
    let chkFileStatus = proxy.Tools.chkFile(file)
    // 如果返回 true，满足条件，开始上传
    if (chkFileStatus) {
      const result = await proxy.Request({
        url: '/file/uploadImg',
        dataType: 'file',
        params: {
          file,
          data: JSON.stringify({
            user_id,
          }),
        },
      })

      // 图片上传成功，提示信息并在 markdown 编辑器插入上传后的图片
      if (result?.code === 200) {
        // 获取返回的无前缀文件名
        let filename = result.data.file.filename
        proxy.Message.success('文件上传成功')
        insertImage({
          url: proxy.globalInfo.imageUrl + filename,
          desc: '图片',
          width: 'auto',
          height: 'auto',
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>