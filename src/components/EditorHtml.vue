<template>
  <div class="editor-box">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      :style="{ height: height + 'px', overflowY: 'hidden' }"
      :model-value="modelValue"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup>
import {
  onBeforeUnmount,
  ref,
  shallowRef,
  onMounted,
  getCurrentInstance,
} from 'vue'

import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

/*************** 自己编写部分 - start ***************/
// 引入操作 cookies 的包
import VueCookies from 'vue-cookies'
// 获取用户 user_id
const user_id = VueCookies.get('userInfo')?.user_id || 0

// 获取响应式类 app 实例 proxy 对象
const { proxy } = getCurrentInstance()

// 获取传递过来的 props 属性
const props = defineProps({
  // 编辑器双向梆定内容参数
  modelValue: {
    type: String,
    default: () => '',
  },
  // 编辑器高度设置参数
  height: {
    type: Number,
    default: 500,
  },
})

// 声明和获取父组件的事件
const emit = defineEmits(['update:modelValue', 'setHtmlContent'])

// 编辑框内容改变触发事件函数
function handleChange(editor) {
  let htmlContent = editor.getHtml()
  // 更新父组件 BlogEdit.vue 的双向梆定变量 blogFormData.content
  emit('update:modelValue', htmlContent)
  // 传送给父组件 BlogEdit.vue 的 html 变量接收，用于在定时保存时，两种编辑器的空值使用统一变量 html 判断
  emit('setHtmlContent', htmlContent)
}
/*************** 自己编写部分 - end ***************/

/*************** 编辑器实例自带部分 - start ***************/
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
const editor = editorRef.value

// 编辑器模式
let mode = 'default' // 或 simple

// 内容 HTML
const valueHtml = ref('<p>hello</p>')

// 模拟 ajax 异步获取内容
/* 
onMounted(() => {
  setTimeout(() => {
    valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
  }, 1500)
})
 */

const toolbarConfig = {}
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    // 自己加：菜单配置项，上传图片配置
    uploadImage: {
      // 图片文件域的 name 属性值指定为'file'，后端通过 req.files.file 获取文件
      fieldName: 'file',
      // 上传服务器上传接口 url
      server: 'https://api.blog.sirurl.cn/api/file/uploadImg',
      // 单个文件的最大体积限制，默认为 2M
      // maxFileSize: 2 * 1024 * 1024,  // 在onBeforeUpload回调中，用自定义函数 chkFile()处理限制
      // 最多可上传几个文件，默认为 100
      maxNumberOfFiles: 10, // 不是指每次选择的文件，应该是页面刷新前的总计
      // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []，
      // 在onBeforeUpload回调中，用自定义函数 chkFile()处理限制
      /* allowedFileTypes: [
        'image/jpg',
        'image/jpeg',
        'image/gif',
        'image/png',
        'image/bmp',
      ], */
      // meta 是自定义上传数据项，后端用 JSON.parse(req.body.data) 获取
      meta: {
        data: JSON.stringify({
          user_id,
          from: 'EditorHtml',
        }),
      },
      // 将 meta 拼接到 url 参数中，默认 false
      metaWithUrl: false,

      // 自定义增加 http  header
      // headers: {
      //   Accept: 'text/x-json',
      //   otherKey: 'xxx',
      // },

      // 跨域是否传递 cookie ，默认为 false
      withCredentials: false,

      // 超时时间，默认为 10 秒
      timeout: 5 * 1000, // 5 秒

      /***** 编辑器上传回调函数配置部分 *****/
      // 上传成功后，自动插入图片到编辑器的回调函数
      customInsert(res, insertFn) {
        // res 即服务端的返回结果，格式要固定为如下：
        // {
        //   errno: 0, // 注意：值是数字，不能是字符串
        //   data: {
        //     url: 'xxx', // 图片 src ，必须
        //     alt: 'yyy', // 图片描述文字，非必须
        //     href: 'zzz', // 图片的链接，非必须
        //   },
        // }
        console.log('customInsert res:', res)

        // 修改图片 url，加入路径前缀，否则显示不了
        res.data.url = proxy.globalInfo.imageUrl + res.data.url

        // 从 res 中找到 url alt href ，然后插入图片到编辑器
        let { url, alt, href } = res.data
        insertFn(url, alt, href)
      },
      // 上传之前触发
      onBeforeUpload(file) {
        // TS 语法
        // onBeforeUpload(file) {    // JS 语法
        // file 选中的文件，格式如 { key: file }
        console.log('EditorHtml uploadImg:', file)
        // 这里回传的 file 对象只包含一个根据文件名动态生成的key，如 uppy-100000/bak/jpg-1e-1e-image/jpeg-5618-1699245029395，
        // 里面才是包含文件流，和自定义附带的数据属性 meta等信息
        // 获取file动态key
        let arrKeys = Object.keys(file)
        const fileObj = file[arrKeys[0]].data // .data属性才是文件流信息
        console.log('fileObj:', fileObj)
        // 检查文件大小，扩展名等是否通过
        let chkFileStatus = proxy.Tools.chkFile(fileObj)
        if (!chkFileStatus) {
          file = null
          // return false  // 报错太难看，必须用 return Promise.reject()终止并return，用 throw 不行，
          // throw 会累积之前选择检查失败的图片，导致选择正确的图片也不能上传，因为 throw 前不能加 return
          return Promise.reject('文件检查不通过，放弃上传')
        }
        // 如果检查成功，上传文件
        return file // 返回editor组件回传的file，而不是 fileObj
      },

      // 上传进度的回调函数
      onProgress(progress) {
        // TS 语法
        // onProgress(progress) {       // JS 语法
        // progress 是 0-100 的数字
        console.log('progress', progress)
      },

      // 单个文件上传成功之后
      onSuccess(file, res) {
        // TS 语法
        // onSuccess(file, res) {          // JS 语法
        console.log(`${file.name} 上传成功`, res)
      },

      // 单个文件上传失败
      onFailed(file, res) {
        // TS 语法
        // onFailed(file, res) {           // JS 语法
        console.log(`${file.name} 上传失败`, res)
      },

      // 上传错误，或者触发 timeout 超时
      onError(file, err, res) {
        // TS 语法
        // onError(file, err, res) {               // JS 语法
        console.log(`${file.name} 上传出错`, err, res)
      },
    },
  },
}

// 自己加：测试
/* 
proxy.$nextTick(() => {
  console.log(
    'getHtml/getText/getMenuConfig:',
    editorRef.value.getHtml(),
    editorRef.value.getText(),
    editorRef.value.getMenuConfig('uploadImage')
  )
})
 */

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

/* 
return {
  editorRef,
  valueHtml,
  mode: 'default', // 或 'simple'
  toolbarConfig,
  editorConfig,
  handleCreated,
}
 */
/*************** 编辑器实例自带部分 - end ***************/
</script> 

<style lang="scss" scoped>
// 编辑器盒子样式
.editor-box {
  border: 1px solid #ccc;
}
</style>