<template>
  <div>
    <!-- 新增/修改博客内容编辑器弹窗 -->
    <Window
      :show="windowConfig.show"
      :buttons="windowConfig.buttons"
      @close="closeWindow"
    >
      <template #body>
        <div class="form-data-box">
          <el-form :model="blogFormData" :rules="rules" ref="blogFormDataRef">
            <!-- 博客ID输入框（只读并隐藏，用于提交后台判断是新增还是修改分类） -->
            <el-form-item prop="blogId" label="ID" :style="{ display: 'none' }">
              <el-input
                v-model="blogFormData.blogId"
                maxlength="16"
                :disabled="true"
              />
            </el-form-item>
            <!-- 分类名称输入框 -->
            <el-form-item prop="title" label="">
              <el-input
                v-model="blogFormData.title"
                :autofocus="true"
                placeholder="请输入博客标题"
              >
                <template #prepend>
                  <span style="font-weight: bold">博客标题</span>
                </template>
              </el-input>
            </el-form-item>
            <div class="tips-info-box">
              <strong>提示信息:&nbsp;</strong>
              <span class="editor-switch-tips" @click="changeEditor">
                1、点此切换使用
                {{ currentEditor === 1 ? 'HTML' : 'Markdown' }}
                编辑器（注意：切换编辑器可能会导致样式丢失）
              </span>
              <span class="autoSave-tips">
                2、当编辑数据和原数据或缓存的数据有变化的时候，每 5
                秒自动保存一次正在编辑的博客数据到本地缓存
              </span>
            </div>
            <el-form-item v-if="currentEditor === 1" prop="markdownContent">
              <!-- 自定义编辑器组件 -->
              <div style="width: 100%">
                <EditorMarkdown
                  v-model="blogFormData.markdownContent"
                  :height="editorMarkdownHeight"
                  @setHtmlContent="setHtmlContent"
                  ref="editorMarkdownRef"
                ></EditorMarkdown>
              </div>
            </el-form-item>
            <el-form-item v-else prop="content">
              <div style="width: 100%">
                <EditorHtml
                  v-model="blogFormData.content"
                  :height="editorHtmlHeight"
                  @setHtmlContent="setHtmlContent"
                  ref="editorHtmlRef"
                ></EditorHtml>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </template>
    </Window>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
import Window from '@/components/Window.vue'
import EditorMarkdown from '@/components/EditorMarkdown.vue'
import EditorHtml from '@/components/EditorHtml.vue'
import BlogCoverUpload from '@/components/BlogCoverUpload.vue'

// 导入日期时间格式化模块包
import dayjs from 'dayjs'

// 导入 html 转 markdown 的模块包
import TurndownService from 'turndown'

// 导入 userStore
import { useUserStore } from '@/store/userStore.js'
const userStore = useUserStore()

// 引入类 app 实例对象 proxy
const { proxy } = getCurrentInstance()

// 获取用户ID
let user_id = userStore.user.user_id

// 当前应使用哪个编辑器，默认 markdown
let currentEditor = ref(userStore.user.editor_type)

/********** 勾子函数定义部分 - start **********/
onMounted(() => {})

onUnmounted(() => {
  // 组件卸载/销毁需停止定时自动保存定时器 timer，否则切换离开页面，还会继续执行定时器
  clearInterval(timer.value)
})
/********** 勾子函数定义部分 - end **********/

/******** 博客内容编辑器弹出框配置部分 - start ********/
// 设置编辑器的高度
const editorMarkdownHeight = window.innerHeight - 202
const editorHtmlHeight = window.innerHeight - 282

// 编辑器博客标题、博客内容表单、及博客详细设置对话框表单的数据模型
let blogFormData = reactive({
  tag: [],
})

// 定义 api
const api = {
  saveBlog: '/blog/saveBlog4Special',
  getBlogDetail: '/blog/getBlogById',
  save: 'blog/saveBlog4Special',
}

// 表单验证规则：whitespace:true 表示不允许只输入空格
const rules = {
  title: [{ required: true, message: '请输入博客标题', whitespace: true }],
  markdownContent: [
    { required: true, message: '请输入博客正文内容', whitespace: true },
  ],
  content: [
    /* 注释此预定义规则，因为预定义规则只对 <el-form-item> 标签的 prop 属性值与其包含标签的 v-model 属性名要一致才有效，
      由于以上 html 模板的包含编辑器组件的表单项标签 <el-form-item prop="content">，
      其包含了 <EditorMarkdown v-model="blogFormData.markdownContent"> 组件
      和 <EditorHtml v-model="blogFormData.content"> 组件，两个组件的 v-model 不同，所以这个预定义规则只对
      <EditorHtml v-model="blogFormData.content"> 组件有效，故干脆注释，用下面的自定义校验规则实现空值判断
     */
    { required: true, message: '请输入博客正文内容', whitespace: true },
    {
      // 自定义校验规则
      validator(rule, value, callback) {
        let content = proxy.Tools.removeHtmlTag(value).replace(
          /^((\s*&nbsp;\s*)|(\s))*$/g,
          ''
        )
        // console.log('content', content, content.length)
        if (content == '') {
          return callback(new Error('请输入博客正文内容'))
        }
        callback()
      },
    },
  ],
}

/**************** 编辑器相关配置部分 - start ****************/
// 保存当前编辑的专题文章
let currentBlogObj = {}
// 新增/修改专题博客的处理函数
const init = (type, row) => {
  // 保存当前编辑的专题文章，供弹出编辑框的[确定]按钮里使用
  currentBlogObj.type = type
  currentBlogObj.row = row

  startTimer(type, row) // 开启自动保存定时器
  windowConfig.show = true
  // clearFormData 清空表单域函数要放在 nextTick外，因为Window组件是用v-show（隐藏），不用v-if，不需要 nextTick，
  // 否则切换修改文章，即使标题框不为空，也会触发表单rules定义的校验规则，会显示标题不能为空
  // 清空编辑器表单域和模型对象数据
  clearFormData()
  nextTick(() => {
    if (type === 'add') {
      // 如果是新增操作，显示用户当前设置的默认编辑器类型的编辑器窗口
      currentEditor.value = userStore.user.editor_type
    } else {
      // 否则如果是修改操作，根据博客ID获取和填充专题博客数据到编辑器中
      getBlogDetail(row.blogId)
    }
  })
}

// 获取专题博客内容数据处理函数
const getBlogDetail = async (blogId) => {
  let result = await proxy.Request({
    url: api.getBlogDetail,
    showLoading: false,
    params: {
      data: JSON.stringify({
        user_id: user_id,
        blog_id: blogId,
      }),
    },
  })
  if (!result) {
    return
  }
  // console.log('blog result:', result)
  Object.assign(blogFormData, result.data)
  if (result.data.tag) {
    blogFormData.tag = result.data.tag.split('|')
  } else {
    blogFormData.tag = []
  }
}

// 接收编辑器组件回传事件的 html 内容
let html = ref('')
function setHtmlContent(htmlContent) {
  html.value = htmlContent
  // 判断，当使用 html 编辑器时，也把 html 内容保存到 markdown 编辑器中，反之亦然
  // 用于切换编辑器时，都能显示正在编辑的内容
  if (currentEditor.value === 0) {
    // 如果当前是 html 编辑器，通过第三方库 trundown 把 html 内容转为 markdown 保存到 blogFormData.markdownContent 中
    const turndownService = new TurndownService()
    blogFormData.markdownContent = turndownService.turndown(html.value)
    // console.log('html to markdown', blogFormData.markdownContent)
  } else {
    blogFormData.content = html.value
  }
}
/**************** 编辑器相关配置部分 - end ****************/

/**************** 弹出 Window 组件配置部分 - start ****************/

// 传递给弹出框组件的参数配置部分
const windowConfig = reactive({
  // 是否显示编辑器弹出框
  show: false,
  // 传递点击按钮
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: (e) => {
        // 验证编辑器博客标题和内容是否有输入
        proxy.$refs.blogFormDataRef.validate(async (valid) => {
          //如果表单验证不通过，直接返回
          if (!valid) return

          // 否则发起请求新增/修改专题文章数据
          // 停止自动保存定时器
          cleanTimer()
          // 如果是新增文章，为文章添加父文章ID、分类ID、博客类型、编辑器类型、博客状态，用户ID，以便在后端库表中设置它们
          if (!blogFormData.blogId) {
            blogFormData.pBlogId = currentBlogObj.row.blogId // 新增专题文章时，row 为父文章数据
            blogFormData.categoryId = currentBlogObj.row.categoryId
            blogFormData.blogType = 1 // 1为专题博客
            blogFormData.editorType = currentEditor.value
            blogFormData.userId = userStore.user.user_id
          }
          blogFormData.status = 1 // 1为已发布
          // 开始请求后端保存数据
          const result = await proxy.Request({
            url: api.save,
            showLoading: false,
            params: {
              data: JSON.stringify(blogFormData),
            },
          })

          // 如果提交成功
          if (result?.code == 200) {
            windowConfig.show = false

            // 获取当前专题信息
            let currentSpecial = proxy.$parent.currentSpecial
            // 重新加载当前专题下的文章（专题文章列表显示新增的文章）
            proxy.$parent.loadBlogList(currentSpecial)

            // 如果是新增专题文章，需要更新专题列表表格的[文章数量]列
            if (!blogFormData.blogId) {
              proxy.$parent.currentSpecial.blogCount++
            }

            proxy.Message.success('编辑专题文章成功')
          }
        })
      },
    },
  ],
})

/**************** 弹出 Window 组件配置部分 - end ****************/

// [取消]按钮事件，隐藏编辑器弹出框
function closeWindow() {
  windowConfig.show = false
  // 停止自动保存定时器
  cleanTimer()
}

// 清空编辑器和博客详细设置对话框表单域数据处理函数
function clearFormData() {
  proxy.$refs.blogFormDataRef.resetFields() // 这样只能清空表单用到的属性，没用到的属性，如 blogFormData.editorType 不会清空
  // Object.assign(blogFormData, {})  // 这样不能置空对象，只是没有追加任何对象属性（即无变化）
  blogFormData = reactive({ tag: [] }) // 要这样重置

  // 要手动再清空这两项编辑器的内容，因为以上调用表单的 resetFields() 方法，会清空 blogFormData.blogId 的值，
  // blogFormData.blogId 是加载显示哪个编辑器的条件，会导致重新渲染编辑器组件，所以表单的 resetFields() 方法
  // 清空不了以下两个编辑器的内容，要手动清除一下，如不手动清除，可将这两个编辑器的显示条件由 v-if 改为 v-show 也可以
  blogFormData.markdownContent = ''
  blogFormData.content = ''
}

// 点击提示切换编辑器处理函数
let isChgEditor = false // 是否手动切换编辑器，用于在底部 watch 监听判断，如果是手动，则不执行监听里的操作
function changeEditor() {
  // 直接在这里更改当前编辑器即可，不用再执行监听器里的操作，否则当用户默认编辑器为 HTML(userStore.user.editor_type=0)
  // 并且新建博客时 blogFormData.blogId 为空，会执行监听器里的
  // if((!blogFormData.blogId && userStore.user.editor_type == 0) || blogFormData.editorType == 0)
  // 监听器执行后，会导致当前编辑器变量 currentEditor 永远为0，导致新建博客时无法手动切换编辑器，修改博客可以切换
  nextTick(() => {
    isChgEditor = true
    console.log('currentEditor.value', currentEditor.value)
    currentEditor.value = currentEditor.value === 0 ? 1 : 0
    blogFormData.editorType = currentEditor.value // 保存该博客当前使用的编辑器，记录到缓存和当前编辑器进行对比
  })
}

// 定时自动保存博客信息到本地 localStorage 的处理函数
let timer = ref(null)

// 启动自动保存定时器
const startTimer = (type, row) => {
  timer.value = setInterval(() => {
    autoSave(type, row)
  }, 5000)
}

// 停止自动保存定时器
const cleanTimer = () => {
  if (timer.value !== null) {
    clearInterval(timer.value)
    timer.value = null
  }
}

async function autoSave(type, row) {
  // console.log('autoSave row:', row)  // 新增专题文章时，row 为父文章，修改时 row 为当前点击修改的文章
  // 调试输出自动保存操作开始时间
  console.log('save start:', dayjs().format('YYYY-MM-DD HH:mm:ss'))

  // 删除博客标题和博客内容的前后空白，供以下判断，只有输入标题和内容后才进行保存
  blogFormData.title = blogFormData.title?.trim()
  // 无论使用哪种编辑器，以下的 html.value 都会有内容，使用 markdown 编辑器的 change 事件也会自动设置 html.value 内容
  let contentText = proxy.Tools.removeHtmlTag(html.value)?.replace(
    /^((\s*&nbsp;\s*)|(\s))*$/g,
    ''
  )
  // 如果博客标题为空 或 内容为空 或 自动保存定时器已停止 或 (现编辑的博客标题/内容和原来的没变化)，则不执行自动保存操作
  if (
    !blogFormData.title ||
    !contentText ||
    timer.value === null ||
    (blogFormData.title === row.title &&
      html.value === row.content &&
      blogFormData.editorType === row.editorType)
  ) {
    return
  }
  // 如果是新增文章，为文章添加父文章ID、分类ID、博客类型、编辑器类型、博客状态，用户ID，以便在后端库表中设置它们
  if (!blogFormData.blogId) {
    blogFormData.pBlogId = row.blogId // 新增专题文章时，row 为父文章数据
    blogFormData.categoryId = row.categoryId
    blogFormData.blogType = 1 // 1为专题博客
    blogFormData.editorType = currentEditor.value
    blogFormData.status = 0 // 0为草稿
    blogFormData.userId = userStore.user.user_id
  }
  // 开始请求后端保存数据
  const result = await proxy.Request({
    url: api.save,
    showLoading: false,
    params: {
      data: JSON.stringify(blogFormData),
    },
  })

  // 如果自动保存失败
  if (!result || result?.code !== 200) {
    return
  }

  // 自动保存成功执行如下操作
  console.log('autoSave success:', result.data)
  // 如果是新增专题文章
  if (!blogFormData.blogId) {
    /*** 设置以下当前编辑器文章数据给 row，给以上第一个 if 判断是否需要执行保存进行当前编辑器内容与 row 对比 ***/
    // 设置当前的文章博客ID
    blogFormData.blogId = result.data
    // 把当前编辑器的标题、内容赋值给 row
    row.title = blogFormData.title
    row.content = blogFormData.content
    row.markdownContent = blogFormData.markdownContent
    row.editorType = blogFormData.editorType

    // 获取当前专题信息
    let currentSpecial = proxy.$parent.currentSpecial
    // console.log('currentSpecial', currentSpecial)
    // 如果是新增专题文章，需要更新专题列表表格的[文章数量]列
    currentSpecial.blogCount++
    // 重新加载当前专题下的文章（专题文章列表显示新增的文章）
    proxy.$parent.loadBlogList(currentSpecial)
  } else {
    // 否则是修改文章，更新[专题文章]树状列表对应的文章数据
    row.title = blogFormData.title
    row.content = blogFormData.content
    row.markdownContent = blogFormData.markdownContent
    row.editorType = blogFormData.editorType
  }
  console.log('after autoSave row', row)

  // 调试输出自动保存操作结束时间
  console.log('save end:', dayjs().format('YYYY-MM-DD HH:mm:ss'))
}
/******** 博客内容编辑器弹出框配置部分 - end ********/

/******** 定义监听器部分 - start ********/
// 必须要在监听的变量定义之后，再定义监听器，或放在 onMounted 阶段定义监听器
// 所以监听器和计算属性，一般建议放到最后定义
watch(
  [
    () => blogFormData.blogId,
    () => blogFormData.editorType,
    () => userStore.user.editor_type,
  ], // 可同时监听多个变量或属性，数组表示
  (newVal, oldVal) => {
    // 同时监听多个变量或属性后， newVal 和 oldVal 也变为数组形式
    // !isChgEditor 表示不是手动切换编辑器时，才执行此监听器里的当前监听器逻辑判断操作，当 isChgEditor = true时,
    // 由 changeEditor() 函数里直接确定当前编辑器即可，否则当用户默认编辑器为 HTML(userStore.user.editor_type=0)
    // 并且新建博客时 blogFormData.blogId 为空，会执行监听器里的
    // if((!blogFormData.blogId && userStore.user.editor_type == 0) || blogFormData.editorType == 0)
    // 监听器执行后，会导致当前编辑器变量 currentEditor 永远为0，导致新建博客时无法手动切换编辑器，修改博客可以切换
    if (!isChgEditor) {
      if (
        (!blogFormData.blogId && userStore.user.editor_type == 0) ||
        blogFormData.editorType == 0
      ) {
        currentEditor.value = 0
      } else {
        currentEditor.value = 1
      }
    }
    // 跳过以上当前监听器判断操作后，必须要重置 isChgEditor = false，否则下次进入编辑器界面（新增/修改博客）会报错，
    // 因为后续还需要此监听器判断赋值给当前编辑器变量 currentEditor，依据此变量在界面上显示哪个编辑器的
    isChgEditor = false
    // 调试输出
    console.log(
      'currentEditor, blogFormData.editorType, userStore.user.editor_type',
      currentEditor.value,
      blogFormData.editorType,
      userStore.user.editor_type
    )
  },
  { immediate: true, deep: false }
)
/******** 定义监听器部分 - end ********/

// 向外暴露数据或方法
defineExpose({
  init,
  windowConfig,
  blogFormData,
  clearFormData,
  autoSave,
  timer,
})
</script>

<style lang="scss">
/**** 设置/去除 el 组件的默认样式 - start ****/
// 去除表单验证不通过的红色边框
/* .el-form-item.is-error .el-input__wrapper {
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
} */
/**** 设置/去除 el 组件的默认样式 - end ****/

.tips-info-box {
  margin: -10px 0 8px;
  text-align: left;
  font-size: 11px;
  color: #f3753a;

  span {
    margin-right: 10px;
  }

  .editor-switch-tips {
    cursor: pointer;
  }
}

// 为 ElMessageBox 组件的 customClass 参数设置的允许提示内容换行的样式
.msgbox-wrap {
  white-space: pre-line;
}
</style>